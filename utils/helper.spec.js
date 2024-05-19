import jwt from "jsonwebtoken";
import { describe, it, expect, vi, afterAll } from "vitest";

import { getJwtToken, sendEmail } from "./helpers";

vi.mock("nodemailer", async () => {
  return {
    // Exported default object because of [Error: [vitest] No "default" export is defined on the "nodemailer"]
    default: {
      createTransport: vi.fn().mockReturnValue({
        sendMail: vi.fn().mockResolvedValue({
          accepted: ["recipient@example.com"],
          messageId: "<6b9f0d7f-56a9-4f6e-85e3-4f502d6f6db9@example.com>",
        }),
      }),
    },
  };
});

afterAll(() => {
  vi.restoreAllMocks();
});

describe("Utils/helper", () => {
  describe("getJwtToken()", () => {
    it("should return jwt token", async () => {
      const expectedValue = "JWT_TOKEN";
      vi.spyOn(jwt, "sign").mockReturnValueOnce(expectedValue);

      const token = await getJwtToken(1);

      expect(token).toBeDefined();
      expect(token).toBe(expectedValue);
    });
  });

  describe("sendMail()", () => {
    it("should send the email", async () => {
      const expectedValue = ["recipient@example.com"];
      const expectedMessageId =
        "<6b9f0d7f-56a9-4f6e-85e3-4f502d6f6db9@example.com>";
      const mockMailOptions = {
        from: "sender@example.com",
        to: "recipient@example.com",
        subject: "Subject of your email",
        text: "Hello world?",
      };

      let response = await sendEmail(mockMailOptions);

      expect(response).toBeDefined();
      expect(response).toHaveProperty("accepted", expectedValue);
      expect(response).toHaveProperty("messageId", expectedMessageId);
    });
  });
});
