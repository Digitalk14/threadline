import "server-only";
import Database from "better-sqlite3";
import path from "node:path";
import fs from "node:fs";

const dbDirectory = path.join(process.cwd(), "data");
fs.mkdirSync(dbDirectory, { recursive: true });
const dbPath = path.join(dbDirectory, "threadline.db");
const db = new Database(dbPath);

db.pragma("foreign_keys = ON");
db.pragma("busy_timeout = 5000");
db.pragma("journal_mode = WAL");

export { db };