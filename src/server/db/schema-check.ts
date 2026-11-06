import Database from "better-sqlite3";
import { readFileSync } from "node:fs";

const db = new Database(":memory:");

db.pragma("foreign_keys = ON");

const result = db.pragma("foreign_keys", {
  simple: true,
});

console.log("Foreign keys:", result);

//add process.cwd()
const sql = readFileSync("src/server/db/migrations/001_init.sql", "utf-8");

db.exec(sql);

console.log("Schema created successfully!");

const tables = db
  .prepare(
    `
    SELECT name
    FROM sqlite_master
    WHERE type = 'table'
    ORDER BY name
  `,
  )
  .all();

console.log("Tables:", tables);

try {
  db.prepare(
    `
  
      INSERT INTO runs (
  
        id,
  
        ticket_id,
  
        kind,
  
        status,
  
        started_at
  
      )
  
      VALUES (?, ?, ?, ?, ?)
  
    `,
  ).run(
    "run-1",

    "non-existent-ticket",

    "fetch",

    "running",

    new Date().toISOString(),
  );

  console.log("Unexpected: invalid run was inserted");
} catch (error) {
  console.log("Foreign key correctly rejected invalid run:", error);
}

db.prepare(
  `
    INSERT INTO tickets (id, title, phase, updated_at)
    VALUES (?, ?, ?, ?)
  `,
).run("T-1", "Test ticket", "planning", new Date().toISOString());

db.prepare(
  `
    INSERT INTO runs (id, ticket_id, kind, status, started_at)
    VALUES (?, ?, ?, ?, ?)
  `,
).run("R-1", "T-1", "fetch", "succeeded", new Date().toISOString());

db.prepare(
  `
    INSERT INTO snapshots (id, run_id, seq, created_at, state)
    VALUES (?, ?, ?, ?, ?)
  `,
).run("S-1", "R-1", 1, new Date().toISOString(), "{}");

db.prepare(
  `
    DELETE FROM tickets WHERE id = ?
  `,
).run("T-1");

const remainingRuns = db
  .prepare(
    `
    SELECT * FROM runs
  `,
  )
  .all();

const remainingSnapshots = db
  .prepare(
    `
    SELECT * FROM snapshots
  `,
  )
  .all();

console.log("Remaining runs:", remainingRuns);

console.log("Remaining snapshots:", remainingSnapshots);

db.prepare(
  `
    INSERT INTO tickets (id, title, phase, updated_at)
    VALUES (?, ?, ?, ?)
  `,
).run("T-1", "Ticket 1", "planning", new Date().toISOString());

db.prepare(
  `
    INSERT INTO tickets (id, title, phase, updated_at)
    VALUES (?, ?, ?, ?)
  `,
).run("T-2", "Ticket 2", "planning", new Date().toISOString());

db.prepare(
  `
    INSERT INTO runs (id, ticket_id, kind, status, started_at)
    VALUES (?, ?, ?, ?, ?)
  `,
).run("R-1", "T-1", "fetch", "succeeded", new Date().toISOString());

db.prepare(
  `
    INSERT INTO runs (id, ticket_id, kind, status, started_at)
    VALUES (?, ?, ?, ?, ?)
  `,
).run("R-2", "T-2", "fetch", "succeeded", new Date().toISOString());

try {
  db.prepare(
    `
      INSERT INTO events (
        ticket_id,
        run_id,
        type,
        seq,
        created_at,
        payload
      )
      VALUES (?, ?, ?, ?, ?, ?)
    `,
  ).run("T-1", "R-2", "test", 1, new Date().toISOString(), "{}");

  console.log("Unexpected: invalid event was inserted");
} catch (error) {
  console.log("Composite foreign key rejected invalid event:", error);
}
try {
  db.prepare(
    `
  
      INSERT INTO runs (
  
        id,
  
        ticket_id,
  
        kind,
  
        status,
  
        started_at
  
      )
  
      VALUES (?, ?, ?, ?, ?)
  
    `,
  ).run(
    "R-3",

    "T-1",

    "research",

    "succeeded",

    new Date().toISOString(),
  );

  console.log("Unexpected: invalid kind was inserted");
} catch (error) {
  console.log("CHECK constraint rejected invalid kind:", error);
}

db.prepare(
  `
    INSERT INTO runs (
      id,
      ticket_id,
      kind,
      status,
      started_at
    )
    VALUES (?, ?, ?, ?, ?)
  `,
).run("R-3", "T-1", "fetch", "running", new Date().toISOString());

try {
  db.prepare(
    `
      INSERT INTO runs (
        id,
        ticket_id,
        kind,
        status,
        started_at
      )
      VALUES (?, ?, ?, ?, ?)
    `,
  ).run("R-4", "T-1", "brief", "running", new Date().toISOString());

  console.log("Unexpected: second active run was inserted");
} catch (error) {
  console.log("Unique index correctly rejected second active run:", error);
}

// First event for T-1 — should succeed.
db.prepare(
  `
    INSERT INTO events (
      ticket_id,
      run_id,
      type,
      seq,
      created_at,
      payload
    )
    VALUES (?, ?, ?, ?, ?, ?)
  `,
).run("T-1", "R-1", "run.started", 0, new Date().toISOString(), "{}");

// Second event for T-1 with the same seq — should fail.
try {
  db.prepare(
    `
      INSERT INTO events (
        ticket_id,
        run_id,
        type,
        seq,
        created_at,
        payload
      )
      VALUES (?, ?, ?, ?, ?, ?)
    `,
  ).run("T-1", "R-3", "run.started", 0, new Date().toISOString(), "{}");

  console.log("Unexpected: duplicate event sequence was inserted");
} catch (error) {
  console.log("Unique event sequence correctly rejected duplicate:", error);
}

try {
  db.prepare(
    `
      INSERT INTO questions (
        ticket_id,
        id,
        text,
        asked_by,
        waiting_on,
        source,
        source_url,
        status,
        first_seen_at,
        updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
  ).run(
    "T-1",
    "Q-1",
    "What should we do?",
    "agent",
    "user",
    "not-valid-json",
    "https://example.com",
    "open",
    new Date().toISOString(),
    new Date().toISOString(),
  );

  console.log("Unexpected: invalid JSON was inserted");
} catch (error) {
  console.log("JSON constraint correctly rejected invalid source:", error);
}

db.close();
