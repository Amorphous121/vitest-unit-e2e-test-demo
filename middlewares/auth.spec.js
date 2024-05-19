import jwt from "jsonwebtoken";
import { vi, it, expect, describe, afterEach } from "vitest";
import User from "../models/users";
import { isAuthenticatedUser } from "./auth";

const mockRequest = () => ({
  headers: {},
});

const mockResponse = () => ({
  status: vi.fn().mockReturnThis(),
  json: vi.fn().mockReturnThis(),
});

const mockNext = vi.fn();

afterEach(() => {
  vi.restoreAllMocks();
});

describe("middlewares/auth.js", () => {
  describe("isAuthenticatedUser()", () => {
    it("it should throw missing token error", async () => {
      const mockReq = { ...mockRequest(), headers: { authorization: "" } };
      const mockRes = mockResponse();

      await isAuthenticatedUser(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Missing Authorization header with Bearer token",
      });
    });

    it("should throw authentication failed error", async () => {
      const mockReq = {
        ...mockRequest(),
        headers: { authorization: "Bearer " },
      };
      const mockRes = mockResponse();

      await isAuthenticatedUser(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Authentication Failed",
      });
    });

    it("should throw user authentication failed error", async () => {
      vi.spyOn(jwt, "verify").mockImplementationOnce(() => {
        throw new Error("User authentication failed");
      });
      const mockReq = {
        ...mockRequest(),
        headers: { authorization: "Bearer any_token" },
      };
      const mockRes = mockResponse();

      await isAuthenticatedUser(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "User authentication failed",
      });
    });

    it("should authenticate the user", async () => {
      vi.spyOn(jwt, "verify").mockReturnValueOnce({ id: "123456789" });
      vi.spyOn(User, "findById").mockResolvedValueOnce({ id: "123456789" });
      const mockReq = {
        ...mockRequest(),
        headers: { authorization: "Bearer JWT_TOKEN" },
      };
      const mockRes = mockResponse();

      await isAuthenticatedUser(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });
  });
});
