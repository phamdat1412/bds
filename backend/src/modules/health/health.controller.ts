import { Request, Response } from "express";
import prisma from "../../configs/prisma.js";
import { env } from "../../configs/env.js";

export async function getHealth(_req: Request, res: Response) {
  res.json({
    success: true,
    message: "Backend is running",
    data: {
      nodeEnv: env.nodeEnv,
      appBaseUrl: env.appBaseUrl,
      storageDriver: env.storageDriver,
      timestamp: new Date().toISOString(),
    },
  });
}

export async function testDatabase(_req: Request, res: Response) {
  const roleCount = await prisma.role.count();
  const projectCount = await prisma.project.count();
  const userCount = await prisma.user.count();

  res.json({
    success: true,
    message: "Database connection OK",
    data: {
      roleCount,
      projectCount,
      userCount,
      timestamp: new Date().toISOString(),
    },
  });
}