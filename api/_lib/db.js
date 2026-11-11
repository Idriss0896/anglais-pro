import { neon } from "@neondatabase/serverless";

const connectionString =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.NEON_DATABASE_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  "";

if (!connectionString) {
  // Surfaced by the endpoints as a configuration error instead of a crash.
  console.error("[anglais-pro] Aucune URL de base de données Neon configurée.");
}

export const sql = connectionString
  ? neon(connectionString, { fullResults: false })
  : null;

let schemaReady = null;

/**
 * Creates the minimal schema required by the app. It is idempotent and cached
 * for the lifetime of the serverless instance, so the first request that needs
 * the database pays for it only once.
 */
export function ensureSchema() {
  if (!sql) return Promise.reject(new DatabaseNotConfiguredError());
  if (!schemaReady) {
    schemaReady = (async () => {
      await sql`
        CREATE TABLE IF NOT EXISTS users (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          email text UNIQUE NOT NULL,
          password_hash text,
          name text,
          avatar text,
          provider text NOT NULL DEFAULT 'email',
          google_id text UNIQUE,
          created_at timestamptz NOT NULL DEFAULT now(),
          updated_at timestamptz NOT NULL DEFAULT now()
        )
      `;
      await sql`
        CREATE TABLE IF NOT EXISTS sessions (
          token_hash text PRIMARY KEY,
          user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          expires_at timestamptz NOT NULL,
          created_at timestamptz NOT NULL DEFAULT now()
        )
      `;
      await sql`
        CREATE TABLE IF NOT EXISTS progress (
          user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
          state jsonb NOT NULL,
          updated_at timestamptz NOT NULL DEFAULT now()
        )
      `;
      await sql`CREATE INDEX IF NOT EXISTS sessions_user_idx ON sessions(user_id)`;
      await sql`CREATE INDEX IF NOT EXISTS sessions_expiry_idx ON sessions(expires_at)`;
    })().catch((error) => {
      schemaReady = null;
      throw error;
    });
  }
  return schemaReady;
}

export class DatabaseNotConfiguredError extends Error {
  constructor() {
    super("La base de données n'est pas configurée.");
    this.code = "db_not_configured";
    this.status = 503;
  }
}
