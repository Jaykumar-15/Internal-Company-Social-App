/**
 * Database connection module.
 * Uses @neondatabase/serverless to connect to Neon PostgreSQL.
 * The `sql` tagged template function automatically uses parameterized queries
 * to prevent SQL injection attacks.
 */
import { neon } from "@neondatabase/serverless";

export const sql = neon(process.env.DATABASE_URL!);
