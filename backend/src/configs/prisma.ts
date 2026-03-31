import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../../generated/prisma/client.js";
import { env } from "./env.js";

const adapter = new PrismaMariaDb({
  host: env.databaseHost,
  port: env.databasePort,
  user: env.databaseUser,
  password: env.databasePassword,
  database: env.databaseName,
  connectionLimit: 10,
});

const prisma = new PrismaClient({ adapter });

export default prisma;