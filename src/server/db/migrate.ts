import "server-only";
import fs from "node:fs";
import path from "node:path";
import { db } from "./connection";

const migrationsDir = path.join(process.cwd(), "src/server/db/migrations");

export const getMigrationFiles = (): string[] => {
  const files = fs.readdirSync(migrationsDir);
  const sqlFiles = files.filter((file) => file.endsWith(".sql"));

  const regexp = /^(\d{3})_[a-z0-9_-]+\.sql$/;
  const versions = new Set<number>();

  const migrations = sqlFiles.map((file) => {
    const match = file.match(regexp);

    if (!match) {
      throw new Error(`Invalid migration filename: ${file}`);
    }

    const version = Number(match[1]);

    if (versions.has(version)) {
      throw new Error(`Duplicate migration version: ${version}`);
    }

    versions.add(version);

    return { file, version };
  });

  migrations.sort((a, b) => a.version - b.version);

  for (let i = 0; i < migrations.length; i++) {
    const expectedVersion = i + 1;
    const actualVersion = migrations[i].version;

    if (actualVersion !== expectedVersion) {
      throw new Error(
        `Missing migration version ${expectedVersion.toString().padStart(3, "0")}`,
      );
    }
  }

  return migrations.map((migration) => migration.file);
};

export const migrate = () => {
  const migrationFiles = getMigrationFiles();

  const currentVersion = db.pragma("user_version", {
    simple: true,
  }) as number;

  const latestVersion =
    migrationFiles.length > 0
      ? Number(migrationFiles[migrationFiles.length - 1].split("_")[0])
      : 0;

  if (currentVersion > latestVersion) {
    throw new Error(
      `Database version ${currentVersion} is ahead of available migrations ${latestVersion}`,
    );
  }

  const pendingMigrations = migrationFiles.filter((file) => {
    const version = Number.parseInt(file.split("_")[0], 10);
    return version > currentVersion;
  });

  pendingMigrations.forEach((file) => {
    const version = Number.parseInt(file.split("_")[0], 10);
    const sql = fs.readFileSync(path.join(migrationsDir, file), "utf8");

    const transaction = db.transaction(() => {
      db.exec(sql);
      db.pragma(`user_version = ${version}`);
    });

    transaction();
  });
};
