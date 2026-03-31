import fs from "fs";
import path from "path";
import { env } from "../../../configs/env.js";

export type StoredFileResult = {
  disk: string;
  fileName: string;
  originalName: string;
  mimeType: string;
  extension: string;
  sizeBytes: number;
  pathKey: string;
  url: string;
};

function ensureDirExists(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function sanitizeFileName(name: string) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9.-]/g, "-")
    .replace(/-+/g, "-")
    .toLowerCase();
}

export async function saveFileToLocal(
  file: Express.Multer.File
): Promise<StoredFileResult> {
  const uploadRoot = path.resolve(process.cwd(), env.uploadDir);
  ensureDirExists(uploadRoot);

  const now = new Date();
  const year = String(now.getFullYear());
  const month = String(now.getMonth() + 1).padStart(2, "0");

  const folderPath = path.join(uploadRoot, year, month);
  ensureDirExists(folderPath);

  const ext = path.extname(file.originalname || "").replace(".", "") || "bin";
  const baseName = path.basename(file.originalname || "file", path.extname(file.originalname || ""));
  const safeBaseName = sanitizeFileName(baseName);
  const finalFileName = `${Date.now()}-${safeBaseName}.${ext}`;

  const fullPath = path.join(folderPath, finalFileName);
  fs.writeFileSync(fullPath, file.buffer);

  const pathKey = `${year}/${month}/${finalFileName}`.replace(/\\/g, "/");
  const url = `${env.appBaseUrl}/${env.uploadDir}/${pathKey}`.replace(/([^:]\/)\/+/g, "$1");

  return {
    disk: "local",
    fileName: finalFileName,
    originalName: file.originalname,
    mimeType: file.mimetype,
    extension: ext,
    sizeBytes: file.size,
    pathKey,
    url,
  };
}

export async function deleteFileFromLocal(pathKey: string) {
  const fullPath = path.resolve(process.cwd(), env.uploadDir, pathKey);
  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
  }
}