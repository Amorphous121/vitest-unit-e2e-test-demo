import { vi, it, expect, describe, afterEach } from "vitest";

import Jobs from "./jobs";

afterEach(() => {
  vi.restoreAllMocks();
});


describe("Jobs Model", () => {
  it("should create new job", () => {
    const jobInput = {
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

    const job = new Jobs(jobInput);

    expect(job).toHaveProperty("_id");
  });

  it("should throw validation error for required fields", async () => {
    const job = new Jobs();
    vi.spyOn(job, "validate").mockRejectedValueOnce({
      errors: {
        title: "title",
        description: "description",
      },
    });

    try {
      await job.validate();
    } catch (err) {
      expect(err.errors.title).toBeDefined();
      expect(err.errors.description).toBeDefined();
    }
  });

  it("should throw industry validation error", async () => {
    const job = new Jobs();
    vi.spyOn(job, "validate").mockRejectedValueOnce({
      errors: {
        industry: {
          message: "Please select correct options for industry.",
        },
      },
    });

    try {
      await job.validate();
    } catch (err) {
      expect(err.errors.industry).toBeDefined();
      expect(err.errors.industry.message).toMatch(/select correct options/);
    }
  });
});
