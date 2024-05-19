import request from "supertest";
import { it, expect, describe, afterAll, beforeAll } from "vitest";
import app from "../app";
import { connectDatabase, closeDatabase } from "./db-handler";

beforeAll(() => {
  connectDatabase();
});

afterAll(() => {
  closeDatabase();
});

describe("Auth (e2e)", async () => {
  describe("(POST) - Register User", () => {
    it("should throw validation error", async () => {
      const res = await request(app)
        .post("/api/v1/register")
        .send({ name: "pratham", email: "pratham@gmail.com" });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("error", "Please enter all values");
    });

    it("should register the user", async () => {
      const res = await request(app).post("/api/v1/register").send({
        name: "pratham",
        email: "pratham@gmail.com",
        password: "12345678",
      });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty("token");
    });

    it("should throw duplicate email error", async () => {
      const res = await request(app).post("/api/v1/register").send({
        name: "pratham",
        email: "pratham@gmail.com",
        password: "12345678",
      });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("error", "Duplicate email");
    });
  });

  describe("(POST) - Login User", () => {
    it("should throw validation error", async () => {
      const res = await request(app)
        .post("/api/v1/login")
        .send({ email: "john@gmail.com" });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("error", "Please enter email & Password");
    });

    it("should throw invalid email or password error on invalid email", async () => {
      const res = await request(app)
        .post("/api/v1/login")
        .send({ email: "john@gmail.com", password: "12345678" });

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty("error", "Invalid Email or Password");
    });

    it("should throw invalid email or password error on invalid email", async () => {
      const res = await request(app)
        .post("/api/v1/login")
        .send({ email: "john@gmail.com", password: "12345678" });

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty("error", "Invalid Email or Password");
    });

    it("should login the user", async () => {
      await request(app).post("/api/v1/register").send({
        name: "john",
        email: "john@gmail.com",
        password: "12345678",
      });
      const res = await request(app)
        .post("/api/v1/login")
        .send({ email: "john@gmail.com", password: "12345678" });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("token");
      expect(res.body.token).toBeDefined();
    });
  });

  describe("(404) - Route Not found", () => {
    it("should throw Route not found error", async () => {
      const res = await request(app).get("/invalid-route");

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty("error", "Route not found");
    });
  });
});
