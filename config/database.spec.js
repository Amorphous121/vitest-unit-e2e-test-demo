import mongoose from "mongoose";
import { vi, it, expect, describe, afterEach } from "vitest";
import connectDatabase from "./database";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("config/database.js", () => {
  describe("connectDatabase()", () => {
    it("should create mongodb connection", async () => {
      vi.spyOn(mongoose, "connect").mockImplementationOnce(() => ({
        then: vi.fn(),
      }));
      expect(connectDatabase()).toBe(undefined);
    });
  });
});
