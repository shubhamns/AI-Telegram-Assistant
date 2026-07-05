import Stripe from "stripe";
import { env } from "../config/env.js";
import { Workspace } from "../models/workspace.model.js";
import { PLAN_LIMITS } from "../config/plans.js";
import * as workspaceService from "./workspace.service.js";
let stripe: Stripe | null = null;
function getStripe(): Stripe | null {
  if (!env.STRIPE_SECRET_KEY) return null;
  if (!stripe) stripe = new Stripe(env.STRIPE_SECRET_KEY);
  return stripe;
}
export function isBillingEnabled(): boolean {
  return !!env.STRIPE_SECRET_KEY && !!env.STRIPE_PRO_PRICE_ID;
}
export function getPlans() {
  return [
    { id: "free", name: "Free", price: 0, limits: PLAN_LIMITS.free },
    { id: "pro", name: "Pro", price: 9, limits: PLAN_LIMITS.pro, stripeEnabled: isBillingEnabled() },
  ];
}
export async function createCheckoutSession(workspaceId: string, userEmail: string) {
  const client = getStripe();
  if (!client || !env.STRIPE_PRO_PRICE_ID) throw new Error("Billing is not configured");
  const workspace = await workspaceService.getWorkspaceById(workspaceId);
  if (!workspace) throw new Error("Workspace not found");
  let customerId = workspace.stripeCustomerId;
  if (!customerId) {
    const customer = await client.customers.create({ email: userEmail, metadata: { workspaceId } });
    customerId = customer.id;
    workspace.stripeCustomerId = customerId;
    await workspace.save();
  }
  const session = await client.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: env.STRIPE_PRO_PRICE_ID, quantity: 1 }],
    success_url: `${env.CLIENT_URL}/settings?billing=success`,
    cancel_url: `${env.CLIENT_URL}/settings?billing=cancel`,
    metadata: { workspaceId },
  });
  return { url: session.url };
}
export async function createPortalSession(workspaceId: string) {
  const client = getStripe();
  if (!client) throw new Error("Billing is not configured");
  const workspace = await workspaceService.getWorkspaceById(workspaceId);
  if (!workspace?.stripeCustomerId) throw new Error("No billing account found");
  const session = await client.billingPortal.sessions.create({
    customer: workspace.stripeCustomerId,
    return_url: `${env.CLIENT_URL}/settings`,
  });
  return { url: session.url };
}
export async function handleStripeWebhook(rawBody: Buffer, signature: string) {
  const client = getStripe();
  if (!client || !env.STRIPE_WEBHOOK_SECRET) throw new Error("Stripe webhook not configured");
  const event = client.webhooks.constructEvent(rawBody, signature, env.STRIPE_WEBHOOK_SECRET);
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const workspaceId = session.metadata?.workspaceId;
    if (workspaceId) {
      await Workspace.findByIdAndUpdate(workspaceId, {
        plan: "pro",
        subscriptionStatus: "active",
        stripeSubscriptionId: typeof session.subscription === "string" ? session.subscription : session.subscription?.id,
      });
    }
  }
  if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
    const sub = event.data.object as Stripe.Subscription;
    const workspace = await Workspace.findOne({ stripeSubscriptionId: sub.id });
    if (workspace) {
      workspace.subscriptionStatus = sub.status === "active" ? "active" : sub.status === "past_due" ? "past_due" : "canceled";
      workspace.plan = sub.status === "active" ? "pro" : "free";
      await workspace.save();
    }
  }
}
