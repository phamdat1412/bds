import "dotenv/config";

function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 4000),

  appBaseUrl: process.env.APP_BASE_URL || "http://localhost:4000",
  frontendBaseUrl: process.env.FRONTEND_BASE_URL || "http://localhost:5173",

  databaseUrl: required("DATABASE_URL", process.env.DATABASE_URL),
  databaseHost: required("DATABASE_HOST", process.env.DATABASE_HOST),
  databasePort: Number(required("DATABASE_PORT", process.env.DATABASE_PORT)),
  databaseUser: required("DATABASE_USER", process.env.DATABASE_USER),
  databasePassword: required("DATABASE_PASSWORD", process.env.DATABASE_PASSWORD),
  databaseName: required("DATABASE_NAME", process.env.DATABASE_NAME),

  jwtSecret: required("JWT_SECRET", process.env.JWT_SECRET),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "1d",

  storageDriver: process.env.STORAGE_DRIVER || "local",
  uploadDir: process.env.UPLOAD_DIR || "uploads",

  awsRegion: process.env.AWS_REGION || "",
  awsS3Bucket: process.env.AWS_S3_BUCKET || "",
  awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
  awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  awsS3BaseUrl: process.env.AWS_S3_BASE_URL || "",
};