import { it, vi, expect, describe, afterEach } from "vitest";
import {
  deleteJob,
  getJob,
  getJobs,
  newJob,
  updateJob,
} from "./jobsController";
import Job from "../models/jobs";

const mockJob = {
  _id: "664067296409e8233abAZf93",
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
  user: "664067296409e8233abc9f93",
};

const mockRequest = () => ({ query: {}, params: {}, body: {}, user: {} });
const mockResponse = () => ({
  status: vi.fn().mockReturnThis(),
  json: vi.fn().mockReturnThis(),
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("controllers/jobsController.js", () => {
  describe("getJobs() - Get All Jobs", () => {
    it("should return all the jobs", async () => {
      vi.spyOn(Job, "find").mockImplementationOnce(() => ({
        limit: vi.fn().mockReturnThis(),
        skip: vi.fn().mockResolvedValueOnce([mockJob]),
      }));
      const mockReq = { ...mockRequest(), query: { page: 1 } };
      const mockRes = mockResponse();

      await getJobs(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ jobs: [mockJob] });
    });
  });

  describe("newJob() - Create Job", () => {
    it("should throw validation error", async () => {
      vi.spyOn(Job, "create").mockRejectedValueOnce({
        name: "ValidationError",
      });
      const mockReq = mockRequest();
      const mockRes = mockResponse();

      await newJob(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Please enter all values",
      });
    });

    it("should create new job", async () => {
      vi.spyOn(Job, "create").mockResolvedValueOnce(mockJob);
      const mockRes = mockResponse();
      const mockReq = { ...mockRequest(), user: mockJob.user, body: mockJob };

      await newJob(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        job: mockJob,
      });
    });
  });

  describe("getJob() - Get job by id", () => {
    it("should throw Job not found error", async () => {
      vi.spyOn(Job, "findById").mockReturnValueOnce(null);
      const mockReq = { ...mockRequest(), params: { id: 1 } };
      const mockRes = mockResponse();

      await getJob(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ error: "Job not found" });
    });

    it("should throw invalid id error", async () => {
      vi.spyOn(Job, "findById").mockRejectedValueOnce({ name: "CastError" });
      const mockReq = { ...mockRequest(), params: { id: 1 } };
      const mockRes = mockResponse();

      await getJob(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Please enter correct id",
      });
    });

    it("should return a job", async () => {
      vi.spyOn(Job, "findById").mockResolvedValueOnce(mockJob);
      const mockReq = { ...mockRequest(), params: { id: mockJob._id } };
      const mockRes = mockResponse();

      await getJob(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        job: mockJob,
      });
    });
  });

  describe("updateJob() - Update job by id", () => {
    it("should throw job not found error", async () => {
      vi.spyOn(Job, "findById").mockResolvedValueOnce(null);
      const mockReq = { ...mockRequest(), params: { id: 1 } };
      const mockRes = mockResponse();

      await getJob(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ error: "Job not found" });
    });

    it("should throw ownership error", async () => {
      vi.spyOn(Job, "findById").mockImplementationOnce(() => ({
        ...mockJob,
        user: "664067296409e8233abc9f93",
      }));

      const mockRes = mockResponse();
      const mockReq = (mockRequest().params = {
        params: { id: "664067296409e8233abAZf93" },
        user: { id: "664067296409e8233abc9f92" },
      });

      await updateJob(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "You are not allowed to update this job",
      });
    });
    it("it should update the job", async () => {
      vi.spyOn(Job, "findById").mockImplementationOnce(() => ({
        user: "664067296409e8233abc9f93",
      }));
      vi.spyOn(Job, "findByIdAndUpdate").mockImplementationOnce(() => ({
        ...mockJob,
        user: "664067296409e8233abc9f93",
        title: "NodeJs Developer",
      }));

      const mockRes = mockResponse();
      const mockReq = (mockRequest().params = {
        params: { id: "664067296409e8233abAZf93" },
        body: { title: "NodeJs Developer" },
        user: { id: "664067296409e8233abc9f93" },
      });

      await updateJob(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        job: {
          ...mockJob,
          title: "NodeJs Developer",
          user: "664067296409e8233abc9f93",
        },
      });
    });
  });

  describe("deleteJob() - Delete job by id", () => {
    it("should throw job not found error", async () => {
      vi.spyOn(Job, "findById").mockResolvedValueOnce(null);
      const mockReq = mockRequest();
      const mockRes = mockResponse();

      await deleteJob(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ error: "Job not found" });
    });

    it("should delete the job", async () => {
      vi.spyOn(Job, "findById").mockResolvedValueOnce(mockJob);
      vi.spyOn(Job, "findByIdAndDelete").mockResolvedValueOnce(mockJob);
      const mockReq = mockRequest();
      const mockRes = mockResponse();

      await deleteJob(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ job: mockJob });
    });
  });
});
