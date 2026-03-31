import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../generated/prisma/client.js";
import bcrypt from "bcrypt";

const adapter = new PrismaMariaDb({
  host: process.env.DATABASE_HOST,
  port: Number(process.env.DATABASE_PORT),
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  connectionLimit: 5,
  allowPublicKeyRetrieval: true,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  const adminRole = await prisma.role.upsert({
    where: { code: "admin" },
    update: {},
    create: {
      code: "admin",
      name: "Admin",
    },
  });

  await prisma.role.upsert({
    where: { code: "seller" },
    update: {},
    create: {
      code: "seller",
      name: "Seller",
    },
  });

  await prisma.role.upsert({
    where: { code: "customer" },
    update: {},
    create: {
      code: "customer",
      name: "Customer",
    },
  });

  const passwordHash = await bcrypt.hash("12345678", 10);

  const adminUser = await prisma.user.upsert({
    where: { email: "admin@sgroup.local" },
    update: {},
    create: {
      email: "admin@sgroup.local",
      phone: "0900000000",
      passwordHash,
      userType: "staff",
      status: "active",
    },
  });

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: adminUser.id,
        roleId: adminRole.id,
      },
    },
    update: {},
    create: {
      userId: adminUser.id,
      roleId: adminRole.id,
    },
  });

  console.log("Seed completed");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });