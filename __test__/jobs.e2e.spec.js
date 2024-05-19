import request from "supertest";
import { vi, it, expect, describe, beforeAll, afterAll } from "vitest";
import app from "../app";
import { connectDatabase, closeDatabase } from "./db-handler";

let jwtToken;
let createdJob;
let dummyId = '66378f264ac73d7135594738'
let mockJob = {
  title: "Software Engineer",
  description:
    "We are seeking a skilled Software Engineer to join our dynamic team.",
  email: "example@example.com",
  address: "123 Main Street, City, State, Zip",
  company: "Tech Solutions Inc.",
  industry: ["Information Technology"],
  positions: 2,
  salary: 80000,
  postingDate: "2024-05-12T00:00:00.000Z",
};

beforeAll(async () => {
  await connectDatabase();
  const res = await request(app).post("/api/v1/register").send({
    name: "pravin",
    email: "pravin@gmail.com",
    password: "12345678",
  });
  jwtToken = res.body.token;
});

afterAll(async () => {
  await closeDatabase();
});

describe("Job (e2e)", () => {
  describe("(POST) - Create Job", () => {
    it("should throw validation error", async () => {
      const res = await request(app)
        .post("/api/v1/job/new")
        .auth(jwtToken, { type: "bearer" })
        .send({ title: "nodejs developer" });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("error", "Please enter all values");
    });

    it("should create a job", async () => {
      const res = await request(app)
        .post("/api/v1/job/new")
        .auth(jwtToken, { type: "bearer" })
        .send({ ...mockJob });

      expect(res.statusCode).toBe(200);
      expect(res.body.job).toBeDefined();
      expect(res.body.job).toHaveProperty("_id");

      createdJob = res.body.job;
    });
  });

  describe("(GET) - Get all jobs", () => {
    it("should return list of jobs", async () => {
      const res = await request(app).get("/api/v1/jobs");

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("jobs");
      expect(res.body.jobs).toBeInstanceOf(Array);
      expect(res.body.jobs[0]).toHaveProperty("_id");
    });

    it("it should return job searched with keyword", async () => {
      const res = await request(app)
        .get("/api/v1/jobs")
        .query({ keyword: "software" });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("jobs");
      expect(res.body.jobs).toBeInstanceOf(Array);
      expect(res.body.jobs).toHaveLength(1);
      expect(res.body.jobs[0]).toHaveProperty("_id");
      expect(res.body.jobs[0].title).toMatch(new RegExp("software", "ig"));
    });

    it("it should return empty list with arbitery keyword", async () => {
      const keyword = "xyz";
      const res = await request(app)
        .get("/api/v1/jobs")
        .query({ keyword: keyword });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("jobs");
      expect(res.body.jobs).toBeInstanceOf(Array);
      expect(res.body.jobs).toHaveLength(0);
    });
  });

  describe("(GET) - Get job by id", () => {
    it("should throw job not found error", async () => {
      const res = await request(app).get(`/api/v1/job/${dummyId}`);

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty("error", "Job not found");
    });

    it("should throw invalid id error", async () => {
      const res = await request(app).get(`/api/v1/job/xyz`);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("error", "Please enter correct id");
    });

    it("should find the job by id", async () => {
      const res = await request(app).get(`/api/v1/job/${createdJob._id}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("job", createdJob);
    });
  });

  describe("(PUT) - Update job by id", () => {
    it("should throw Job not found error", async () => {
      const res = await request(app)
        .put(`/api/v1/job/${dummyId}`)
        .auth(jwtToken, { type: "bearer" })
        .send({ title: "NodeJs Developer" });

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty("error", "Job not found");
    });

    it("should throw ownership error", async () => {
      /* create a new user */
      const authRes = await request(app).post("/api/v1/register").send({
        name: "Roshan",
        email: "roshan@gmail.com",
        password: "12345678",
      });

      /* create a new job */
      const jobRes = await request(app)
        .post("/api/v1/job/new")
        .auth(authRes.body.token, { type: "bearer" })
        .send({
          title: "Software Engineer",
          description:
            "We are seeking a skilled Software Engineer to join our dynamic team.",
          email: "example@example.com",
          address: "123 Main Street, City, State, Zip",
          company: "Tech Solutions Inc.",
          industry: ["Information Technology"],
          positions: 2,
          salary: 80000,
          postingDate: "2024-05-12T00:00:00.000Z",
        });

      const updateRes = await request(app)
        .put(`/api/v1/job/${jobRes.body.job._id}`)
        .auth(jwtToken, { type: "bearer" })
        .send({ title: "Nodejs Developer" });

      expect(updateRes.statusCode).toBe(401);
      expect(updateRes.body).toHaveProperty(
        "error",
        "You are not allowed to update this job"
      );
    });

    it("should update the job", async () => {
      const jobRes = await request(app)
        .put(`/api/v1/job/${createdJob._id}`)
        .auth(jwtToken, { type: "bearer" })
        .send({ title: "NodeJs Developer" });

      expect(jobRes.statusCode).toBe(200);
      expect(jobRes.body.job).toBeDefined();
      expect(jobRes.body.job).toHaveProperty("title", "NodeJs Developer");
    });
  });

  describe("(DELETE) - Delete job by id", () => {
    it("should throw Job not found error", async () => {
      const res = await request(app)
        .put(`/api/v1/job/${dummyId}`)
        .auth(jwtToken, { type: "bearer" })
        .send({ title: "NodeJs Developer" });

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty("error", "Job not found");
    });

    it("should delete the job", async () => {
      const res = await request(app)
        .delete(`/api/v1/job/${createdJob._id}`)
        .auth(jwtToken, { type: "bearer" });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("job");
    });
  });
});
