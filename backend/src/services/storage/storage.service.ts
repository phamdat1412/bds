import { env } from "../../configs/env.js";
import {
  deleteFileFromLocal,
  saveFileToLocal,
  StoredFileResult,
} from "./drivers/local-storage.driver.js";

export async function uploadFile(
  file: Express.Multer.File
): Promise<StoredFileResult> {
  switch (env.storageDriver) {
    case "local":
      return saveFileToLocal(file);
    case "s3":
      throw new Error("S3 storage driver is not implemented yet");
    default:
      throw new Error("Unsupported storage driver");
  }
}

export async function removeStoredFile(disk: string, pathKey: string) {
  switch (disk) {
    case "local":
      return deleteFileFromLocal(pathKey);
    case "s3":
      throw new Error("S3 storage driver is not implemented yet");
    default:
      throw new Error("Unsupported storage driver");
  }
}