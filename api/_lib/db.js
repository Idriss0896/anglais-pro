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
 * Verrouille l'accès direct aux tables. L'API est le seul client légitime :
 * elle se connecte avec le rôle propriétaire, tandis que tout autre rôle
 * (console, Data API, clé fuitée) se heurte au RLS et aux privilèges retirés.
 *
 * On ne l'applique que si la connexion courante est bien propriétaire des
 * tables : dans le cas contraire, activer le RLS bloquerait l'API elle-même.
 */
async function hardenDatabase() {
  const [owner] = await sql`
    SELECT bool_and(pg_get_userbyid(c.relowner) = current_user) AS owns
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relname IN ('users', 'sessions', 'progress')
      AND c.relkind = 'r'
  `;
  if (!owner?.owns) {
    console.warn("[db] RLS ignoré : la connexion n'est pas propriétaire des tables.");
    return;
  }

  await sql`ALTER TABLE users ENABLE ROW LEVEL SECURITY`;
  await sql`ALTER TABLE sessions ENABLE ROW LEVEL SECURITY`;
  await sql`ALTER TABLE progress ENABLE ROW LEVEL SECURITY`;

  // Aucune politique permissive : hors propriétaire, tout accès est refusé.
  await sql`REVOKE ALL ON TABLE users, sessions, progress FROM PUBLIC`;
  await sql`REVOKE CREATE ON SCHEMA public FROM PUBLIC`;
  await sql`ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM PUBLIC`;

  // Rôles usuels des API PostgREST / Neon Data API, s'ils existent.
  await sql`
    DO $$
    DECLARE role_name text;
    BEGIN
      FOREACH role_name IN ARRAY ARRAY['anon', 'authenticated', 'service_role'] LOOP
        IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = role_name) THEN
          EXECUTE format('REVOKE ALL ON TABLE public.users, public.sessions, public.progress FROM %I', role_name);
        END IF;
      END LOOP;
    END
    $$
  `;

  console.log("[db] RLS actif sur users, sessions et progress ; accès public révoqué.");
}

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

      // Garde-fous de données appliqués aux nouvelles écritures (NOT VALID
      // laisse intactes les lignes déjà présentes).
      try {
        await sql`
          DO $$
          BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'users_email_lowercase') THEN
              ALTER TABLE public.users ADD CONSTRAINT users_email_lowercase CHECK (email = lower(email)) NOT VALID;
            END IF;
            IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'users_email_len') THEN
              ALTER TABLE public.users ADD CONSTRAINT users_email_len CHECK (char_length(email) <= 254) NOT VALID;
            END IF;
            IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'users_provider_allowed') THEN
              ALTER TABLE public.users ADD CONSTRAINT users_provider_allowed CHECK (provider IN ('email', 'google')) NOT VALID;
            END IF;
            IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'sessions_token_hash_len') THEN
              ALTER TABLE public.sessions ADD CONSTRAINT sessions_token_hash_len CHECK (char_length(token_hash) = 64) NOT VALID;
            END IF;
            IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'progress_state_object') THEN
              ALTER TABLE public.progress ADD CONSTRAINT progress_state_object CHECK (jsonb_typeof(state) = 'object') NOT VALID;
            END IF;
          END
          $$
        `;
      } catch (error) {
        console.error("[db] contraintes de sûreté non appliquées", error);
      }

      // Ne jamais bloquer l'application si le durcissement n'est pas permis :
      // l'isolation applicative (user_id sur chaque requête) reste en place.
      try {
        await hardenDatabase();
      } catch (error) {
        console.error("[db] durcissement RLS impossible", error);
      }
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
