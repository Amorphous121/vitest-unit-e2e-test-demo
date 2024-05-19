import { vi, it, expect, describe } from "vitest";
import bcrypt from "bcryptjs";
import User from "../models/users";
import { registerUser, loginUser, test as testCtrl } from "./authController";

vi.mock("../utils/helpers", () => ({
  getJwtToken: vi.fn(() => "JWT_TOKEN"),
}));

const mockRequest = () => ({
  body: {
    name: "Prathamesh Patil",
    email: "pratham@gmail.com",
    password: "12345678",
  },
});

const mockResponse = () => ({
  status: vi.fn().mockReturnThis(),
  json: vi.fn().mockReturnThis(),
});

const mockUser = {
  id: "1234",
  name: "Prathamesh Patil",
  email: "pratham@gmail.com",
  password: "hashedPassword",
};

describe("controllers/authController.js", () => {
  describe("registerUser() - Register User", () => {
    it("should register user", async () => {
      vi.spyOn(bcrypt, "hash").mockResolvedValueOnce("HASHED_PASSWORD");
      vi.spyOn(User, "create").mockResolvedValueOnce(mockUser);

      const mockReq = mockRequest();
      const mockRes = mockResponse();

      await registerUser(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({ token: "JWT_TOKEN" });
    });

    it("should throw validation error", async () => {
      const mockReq = { ...mockRequest(), body: {} };
      const mockRes = mockResponse();

      await registerUser(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Please enter all values",
      });
    });

    it("should throw duplicate email entered error", async () => {
      vi.spyOn(bcrypt, "hash").mockResolvedValueOnce("HASHED_PASSWORD");
      vi.spyOn(User, "create").mockRejectedValueOnce({ code: 11000 });

      const mockReq = mockRequest();
      const mockRes = mockResponse();

      await registerUser(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Duplicate email",
      });
    });
  });

  describe("loginUser() - Login User", () => {
    it("should throw missing email or password error", async () => {
      const mockReq = { ...mockRequest(), body: {} };
      const mockRes = mockResponse();

      await loginUser(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Please enter email & Password",
      });
    });

    it("should throw invalid email error", async () => {
      vi.spyOn(User, "findOne").mockImplementationOnce(() => ({
        select: vi.fn().mockResolvedValueOnce(null),
      }));

      const mockReq = mockRequest();
      const mockRes = mockResponse();

      await loginUser(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Invalid Email or Password",
      });
    });

    it("should throw invalid password error", async () => {
      vi.spyOn(bcrypt, "compare").mockResolvedValueOnce(false);
      vi.spyOn(User, "findOne").mockImplementationOnce(() => ({
        select: vi.fn().mockResolvedValueOnce(mockUser),
      }));

      const mockReq = mockRequest();
      const mockRes = mockResponse();

      await loginUser(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Invalid Email or Password",
      });
    });

    it("should return the token", async () => {
      vi.spyOn(bcrypt, "compare").mockResolvedValueOnce(true);
      vi.spyOn(User, "findOne").mockImplementationOnce(() => ({
        select: vi.fn().mockResolvedValueOnce(mockUser),
      }));

      const mockReq = mockRequest();
      const mockRes = mockResponse();

      await loginUser(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        token: "JWT_TOKEN",
      });
    });
  });

  describe("Test route", () => {
    it("should return hello", async () => {
      const mockReq = mockRequest();
      const mockRes = mockResponse();

      await testCtrl(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
    });
  });
});
