import { vi, it, expect, describe, afterEach } from "vitest";
import { S3Service } from "./s3Service";

vi.mock("aws-sdk", () => {
  return {
    default: {
      S3: vi.fn(() => {
        return {
          upload: vi.fn().mockReturnThis(),
          promise: vi.fn().mockResolvedValueOnce({
            Location:
              "https://pratham-test-bucket.s3.amazonaws.com/test-folder/image1.jpeg",
            key: "test-folder/image1.jpeg",
            Key: "test-folder/image1.jpeg",
            Bucket: "pratham-test-bucket",
          }),
        };
      }),
    },
  };
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("Utils/s3Service.js", () => {
  describe("upload()", () => {
    it("should upload the file", async () => {
      const s3Service = new S3Service();
      const uploadOptions = {
        name: "image1.jpeg",
        data: "<Buffer ff d8 ff e0 00 10 4a 46 49 46 00 01 01 01 00 48 00 48 00 00 ff e2 02 1c 49 43 43 5f 50 52 4f 46 49 4c 45 00 01 01 00 00 02 0c 6c 63 6d 73 02 10 00 00 ... 19078 more bytes>",
        size: 19128,
        encoding: "7bit",
        tempFilePath: "",
        truncated: false,
        mimetype: "image/jpeg",
        md5: "f130032ca8fc855c9687e8e14e8f10df",
      };

      let res = await s3Service.upload(uploadOptions);

      expect(res).toBeTruthy();
      expect(res).toHaveProperty(
        "Location",
        "https://pratham-test-bucket.s3.amazonaws.com/test-folder/image1.jpeg"
      );
      expect(res).toHaveProperty("Bucket", "pratham-test-bucket");
    });
  });
});
