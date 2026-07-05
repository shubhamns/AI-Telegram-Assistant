import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { createApp } from "../app.js";
let mongoServer: MongoMemoryServer;
const app = createApp();
async function authHeader() {
  const email = `user-${Date.now()}@test.com`;
  const password = "password123";
  await request(app).post("/api/v1/auth/register").send({ email, password, name: "Test User" });
  const login = await request(app).post("/api/v1/auth/login").send({ email, password });
  return `Bearer ${login.body.data.token}`;
}
describe("Health endpoint", () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
  });
  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });
  it("returns healthy status", async () => {
    const res = await request(app).get("/api/v1/health");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("API is healthy");
  });
});
describe("Reminders API", () => {
  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      mongoServer = await MongoMemoryServer.create();
      await mongoose.connect(mongoServer.getUri());
    }
  });
  afterAll(async () => {
    await mongoose.disconnect();
    if (mongoServer) await mongoServer.stop();
  });
  beforeEach(async () => {
    await mongoose.connection.dropDatabase();
  });
  it("creates a reminder", async () => {
    const token = await authHeader();
    const res = await request(app)
      .post("/api/v1/reminders")
      .set("Authorization", token)
      .send({
        title: "Test reminder",
        scheduledAt: new Date(Date.now() + 3600000).toISOString(),
        telegramChatId: "123456",
      });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe("Test reminder");
  });
  it("rejects invalid reminder", async () => {
    const token = await authHeader();
    const res = await request(app)
      .post("/api/v1/reminders")
      .set("Authorization", token)
      .send({ title: "", scheduledAt: "invalid" });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
  it("rejects unauthenticated reminder", async () => {
    const res = await request(app)
      .post("/api/v1/reminders")
      .send({
        title: "Test reminder",
        scheduledAt: new Date(Date.now() + 3600000).toISOString(),
      });
    expect(res.status).toBe(401);
  });
});
describe("Auth refresh", () => {
  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      mongoServer = await MongoMemoryServer.create();
      await mongoose.connect(mongoServer.getUri());
    }
  });
  afterAll(async () => {
    await mongoose.disconnect();
    if (mongoServer) await mongoServer.stop();
  });
  beforeEach(async () => {
    await mongoose.connection.dropDatabase();
  });
  it("issues and rotates refresh tokens", async () => {
    const email = `user-${Date.now()}@test.com`;
    const password = "password123";
    await request(app).post("/api/v1/auth/register").send({ email, password, name: "Test User" });
    const login = await request(app).post("/api/v1/auth/login").send({ email, password });
    expect(login.status).toBe(200);
    expect(login.body.data.refreshToken).toBeTruthy();
    const refresh = await request(app).post("/api/v1/auth/refresh").send({ refreshToken: login.body.data.refreshToken });
    expect(refresh.status).toBe(200);
    expect(refresh.body.data.token).toBeTruthy();
    expect(refresh.body.data.refreshToken).not.toBe(login.body.data.refreshToken);
    const stale = await request(app).post("/api/v1/auth/refresh").send({ refreshToken: login.body.data.refreshToken });
    expect(stale.status).toBe(401);
  });
});
describe("Webhook secret validation", () => {
  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      mongoServer = await MongoMemoryServer.create();
      await mongoose.connect(mongoServer.getUri());
    }
  });
  afterAll(async () => {
    await mongoose.disconnect();
    if (mongoServer) await mongoServer.stop();
  });
  it("rejects invalid webhook secret", async () => {
    const res = await request(app)
      .post("/api/v1/webhooks/telegram")
      .set("X-Telegram-Bot-Api-Secret-Token", "wrong-secret")
      .send({ update_id: 1 });
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});
