import "server-only";
import fs from "node:fs";
import path from "node:path";
import { db } from "./connection";

const migrationsDir = path.join(process.cwd(), "src/server/db/migrations");

const files = fs.readdirSync(migrationsDir);
const sqlFiles = files.filter((file) => file.endsWith(".sql"));
sqlFiles.sort();

const currentVersion = db.pragma("user_version", {
  simple: true,
}) as number;

export const pendingMigrations = sqlFiles.filter((file) => {
  const version = Number.parseInt(file.split("_")[0], 10);
  return version > currentVersion;
});
