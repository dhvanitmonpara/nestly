import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().default(8000),
  MYSQL_HOST: z.string(),
  MYSQL_USER: z.string(),
  MYSQL_PORT: z.coerce.number().default(3306),
  MYSQL_PASSWORD: z.string(),
  MYSQL_DATABASE: z.string(),
  DB_TYPE: z.string(),
  ENVIRONMENT: z.enum(["development", "production", "test"]),
  HTTP_SECURE_OPTION: z.string(),
  ACCESS_CONTROL_ORIGIN: z.string(),
  ACCESS_TOKEN_SECRET: z.string(),
  REFRESH_TOKEN_SECRET: z.string(),
  ACCESS_TOKEN_EXPIRY: z.string(),
  REFRESH_TOKEN_EXPIRY: z.string(),
  GMAIL_USER: z.email(),
  GMAIL_APP_PASSWORD: z.string(),
});

export const env = envSchema.parse(process.env);