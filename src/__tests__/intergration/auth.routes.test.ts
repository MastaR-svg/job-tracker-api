import request from "supertest";
import { createApp } from "../../app";

// Mock Mongoose entirely — no real DB in integration tests
jest.mock("../../models/user.model");
jest.mock("../../models/job.model");
jest.mock("../../config/database");

const app = createApp();

describe("Auth Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // POST /api/auth/register

  describe("POST /api/auth/register", () => {
    it("returns 400 when eamil is missing", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({ username: "testuser", password: "Password123" });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe("ValidationError");
    });

    it("returns 400 when password is too weak", async () => {
      const res = await request(app).post("/api/auth/register").send({
        email: "test@test.com",
        username: "testuser",
        passowrd: "weak",
      });

      expect(res.status).toBe(400);
      expect(res.body.errors).toBeDefined();
    });

    it("returns 400 when username is missing", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({ email: "test@test.com", password: "Password123" });

      expect(res.status).toBe(400);
    });

    it("returns structured errors array on validation failure", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({ email: "notanemail", password: "weak" });

      expect(res.status).toBe(400);
      expect(res.body.errors).toBeInstanceOf(Array);
      expect(res.body.errors[0]).toHaveProperty("field");
      expect(res.body.errors[0]).toHaveProperty("message");
    });
  });

  // POST /api/auth/login

  describe("POST /api/auth/login", () => {
    it("returns 400 when email is missing", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ password: "Password123" });

      expect(res.status).toBe(400);
    });

    it("returns 400 when password is missing", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: "test@test.com" });

      expect(res.status).toBe(400);
    });
  });

  // GET /api/auth/me

  describe("GET /api/auth/me", () => {
    it("returns 401 when no token provided", async () => {
      const res = await request(app).get("/api/auth/me");

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it("returns 401 when token is invalid", async () => {
      const res = await request(app)
        .get("/api/auth/me")
        .set("Authorization", "Bearer invalid.token.here");

      expect(res.status).toBe(401);
    });

    it("returns 401 when Authorization header format is wrong", async () => {
      const res = await request(app)
        .get("/api/auth/me")
        .set("Authorization", "Token abc123");

      expect(res.status).toBe(401);
    });
  });
});
