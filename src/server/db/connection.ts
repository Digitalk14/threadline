import "server-only";
import Database from "better-sqlite3";
import path from "node:path";
import fs from "node:fs";

export function applyDatabasePragmas(database: Database.Database): void {
  database.pragma("foreign_keys = ON");
  database.pragma("busy_timeout = 5000");
  database.pragma("journal_mode = WAL");
}

export function openDatabase(databasePath: string): Database.Database {
  const database = new Database(databasePath);
  applyDatabasePragmas(database);
  return database;
}

const dbDirectory = path.join(process.cwd(), "data");
fs.mkdirSync(dbDirectory, { recursive: true });
const dbPath = path.join(dbDirectory, "threadline.db");
const db = openDatabase(dbPath);

export { db };
