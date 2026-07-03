import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { createApp } from "../app.js";
let mongoServer: MongoMemoryServer;
const app = createApp();
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
    const res = await request(app)
      .post("/api/v1/reminders")
      .send({
        title: "Test reminder",
        scheduledAt: new Date(Date.now() + 3600000).toISOString(),
      });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe("Test reminder");
  });
  it("rejects invalid reminder", async () => {
    const res = await request(app)
      .post("/api/v1/reminders")
      .send({ title: "", scheduledAt: "invalid" });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
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
