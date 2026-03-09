import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./backend/src/db/migrations",
  schema: "./backend/src/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
