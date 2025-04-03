import { defineConfig } from "drizzle-kit";

// Use the environment DATABASE_URL if available, otherwise use the local Supabase PostgreSQL URL
const dbUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@127.0.0.1:54322/postgres';

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: dbUrl,
  },
});
