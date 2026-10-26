import Database from "better-sqlite3";
import { chmodSync, mkdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { Pool } from "pg";

export interface QueryResult<Row> {
  rows: Row[];
  rowCount: number | null;
}
export interface Queryable {
  query<Row extends object = Record<string, unknown>>(sql: string, values?: unknown[]): Promise<QueryResult<Row>>;
}
interface Driver {
  query: Queryable["query"];
  transaction<T>(work: (db: Queryable) => Promise<T>): Promise<T>;
}

function postgres(schema: string): Driver {
  const url = new URL(process.env.DATABASE_URL!);
  if (!["postgres:", "postgresql:"].includes(url.protocol)) throw new Error("Invalid database protocol.");
  const local = ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
  // pg's connection-string SSL options override explicit TLS configuration.
  // Remove them so remote connections always verify the certificate and hostname.
  for (const key of [...url.searchParams.keys()]) {
    if (key.toLowerCase().startsWith("ssl") || ["uselibpqcompat", "options", "host", "hostaddr"].includes(key.toLowerCase())) {
      url.searchParams.delete(key);
    }
  }
  const pool = new Pool({
    connectionString: url.toString(),
    ssl: local ? false : { rejectUnauthorized: true },
    max: 5,
    connectionTimeoutMillis: 10000,
    idleTimeoutMillis: 30000,
  });
  pool.on("error", () => {
    // Idle connection failures must not crash the process or expose connection credentials.
    console.error("A database connection was interrupted.");
  });
  let initialized: Promise<void> | undefined;
  async function ready() {
    initialized ??= (async () => {
      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        await client.query("SELECT pg_advisory_xact_lock(1784024921)");
        await client.query(schema);
        await client.query("COMMIT");
      } catch (error) {
        await client.query("ROLLBACK").catch(() => undefined);
        throw error;
      } finally {
        client.release();
      }
    })().catch((error) => {
      initialized = undefined;
      throw error;
    });
    await initialized;
  }
  return {
    async query<Row extends object>(sql: string, values?: unknown[]) {
      await ready();
      return pool.query<Row>(sql, values);
    },
    async transaction(work) {
      await ready();
      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        const result = await work(client);
        await client.query("COMMIT");
        return result;
      } catch (error) {
        await client.query("ROLLBACK").catch(() => undefined);
        throw error;
      } finally {
        client.release();
      }
    },
  };
}

function sqlite(schema: string): Driver {
  const directory = resolve(/* turbopackIgnore: true */ process.env.CODESTEPS_DATA_DIR || ".data");
  mkdirSync(directory, { recursive: true, mode: 0o700 });
  const filename = join(directory, "codesteps.db");
  const database = new Database(filename);
  chmodSync(filename, 0o600);
  database.pragma("journal_mode = WAL");
  database.pragma("foreign_keys = ON");
  database.pragma("busy_timeout = 5000");
  database.exec(schema.replace("seq BIGSERIAL,", ""));
  const client: Queryable = {
    async query<Row extends object>(sql: string, values: unknown[] = []) {
      if (sql.includes("pg_advisory_xact_lock")) return { rows: [], rowCount: 0 };
      const parameters: unknown[] = [];
      const translated = sql.replace(/\$(\d+)/g, (_, index: string) => {
        parameters.push(values[Number(index) - 1]);
        return "?";
      }).replace(/::int\b/g, "").replace(/ FOR UPDATE\b/g, "").replace(/ORDER BY seq DESC/g, "ORDER BY rowid DESC");
      const statement = database.prepare(translated);
      if (statement.reader) return { rows: statement.all(...parameters) as Row[], rowCount: null };
      return { rows: [] as Row[], rowCount: statement.run(...parameters).changes };
    },
  };
  // Serialize reads as well as writes: awaited transaction callbacks must never
  // allow another request to execute inside an in-flight SQLite transaction.
  let pending: Promise<unknown> = Promise.resolve();
  function exclusive<T>(work: () => Promise<T>): Promise<T> {
    const result = pending.then(work);
    pending = result.catch(() => undefined);
    return result;
  }
  return {
    query: (sql, values) => exclusive(() => client.query(sql, values)),
    transaction: (work) => exclusive(async () => {
      database.exec("BEGIN IMMEDIATE");
      try {
        const result = await work(client);
        database.exec("COMMIT");
        return result;
      } catch (error) {
        database.exec("ROLLBACK");
        throw error;
      }
    }),
  };
}

const shared = globalThis as typeof globalThis & { codestepsDriver?: Driver };

export function databaseDriver(schema: string): Driver {
  return shared.codestepsDriver ??= process.env.DATABASE_URL ? postgres(schema) : sqlite(schema);
}
