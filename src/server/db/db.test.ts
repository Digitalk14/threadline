import Database from "better-sqlite3";
import { describe, expect, it } from "vitest";
import { applyDatabasePragmas } from "./connection";
import { migrate } from "./migrate";
import { createTicketsRepository } from "@/server/repositories/tickets.repository";

function createMemoryDb(): Database.Database {
  const database = new Database(":memory:");
  applyDatabasePragmas(database);
  migrate(database);
  return database;
}

describe("migrate", () => {
  it("applies migrations and is idempotent", () => {
    const database = createMemoryDb();

    expect(database.pragma("user_version", { simple: true })).toBe(1);

    const tables = database
      .prepare(
        `SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name`,
      )
      .all() as { name: string }[];

    expect(tables.map((t) => t.name)).toEqual([
      "events",
      "questions",
      "runs",
      "snapshots",
      "tickets",
    ]);

    migrate(database);
    expect(database.pragma("user_version", { simple: true })).toBe(1);
    database.close();
  });

  it("rejects invalid run ticket_id via foreign keys", () => {
    const database = createMemoryDb();
    const now = new Date().toISOString();

    expect(() =>
      database
        .prepare(
          `INSERT INTO runs (id, ticket_id, kind, status, started_at)
           VALUES (?, ?, ?, ?, ?)`,
        )
        .run("run-1", "missing", "fetch", "running", now),
    ).toThrow();

    database.close();
  });

  it("allows only one active run per ticket", () => {
    const database = createMemoryDb();
    const now = new Date().toISOString();

    database
      .prepare(
        `INSERT INTO tickets (id, title, phase, updated_at) VALUES (?, ?, ?, ?)`,
      )
      .run("PROJ-1", "Test", "new", now);

    database
      .prepare(
        `INSERT INTO runs (id, ticket_id, kind, status, started_at)
         VALUES (?, ?, ?, ?, ?)`,
      )
      .run("run-a", "PROJ-1", "fetch", "running", now);

    expect(() =>
      database
        .prepare(
          `INSERT INTO runs (id, ticket_id, kind, status, started_at)
           VALUES (?, ?, ?, ?, ?)`,
        )
        .run("run-b", "PROJ-1", "brief", "running", now),
    ).toThrow();

    database.close();
  });
});

describe("tickets repository", () => {
  it("creates and lists tickets validated through shared schemas", () => {
    const database = createMemoryDb();
    const repo = createTicketsRepository(database);
    const now = "2026-01-01T00:00:00.000Z";

    const created = repo.create(
      { id: "PROJ-42", title: "Auth rollout", phase: "new" },
      now,
    );

    expect(created).toMatchObject({
      id: "PROJ-42",
      title: "Auth rollout",
      phase: "new",
      updatedAt: now,
      costUsdTotal: 0,
    });

    expect(repo.findById("PROJ-42")).toEqual(created);
    expect(repo.list()).toHaveLength(1);
    expect(() => repo.create({ id: "bad", title: "x", phase: "new" })).toThrow();

    database.close();
  });
});
