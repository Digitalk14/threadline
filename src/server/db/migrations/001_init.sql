CREATE TABLE tickets (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  phase TEXT NOT NULL,
  repo TEXT,
  updated_at TEXT NOT NULL,
  cost_usd_total REAL NOT NULL DEFAULT 0,
  last_run_at TEXT
);

CREATE TABLE runs (
  id TEXT PRIMARY KEY,
  ticket_id TEXT NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('fetch', 'brief', 'plan')),
  status TEXT NOT NULL CHECK (
    status IN ('running', 'succeeded', 'failed', 'cancelled')
  ),
  started_at TEXT NOT NULL,
  finished_at TEXT,
  cost_usd REAL NOT NULL DEFAULT 0 CHECK (cost_usd >= 0),
  error TEXT,
  UNIQUE (ticket_id, id)
);

CREATE UNIQUE INDEX runs_one_active_per_ticket
ON runs(ticket_id)
WHERE status = 'running';

CREATE TABLE events (
  id INTEGER PRIMARY KEY,
  ticket_id TEXT NOT NULL,
  run_id TEXT NOT NULL,
  type TEXT NOT NULL,
  seq INTEGER NOT NULL CHECK (seq >= 0),
  created_at TEXT NOT NULL,
  payload TEXT NOT NULL,
  FOREIGN KEY (ticket_id, run_id)
    REFERENCES runs (ticket_id, id)
    ON DELETE CASCADE,
  UNIQUE (ticket_id, seq)
);

CREATE INDEX events_run_seq
ON events (run_id, seq);

CREATE TABLE snapshots (
  id TEXT PRIMARY KEY,
  run_id TEXT NOT NULL REFERENCES runs(id) ON DELETE CASCADE,
  seq INTEGER NOT NULL CHECK (seq >= 0),
  created_at TEXT NOT NULL,
  state TEXT NOT NULL,
  UNIQUE (run_id, seq)
);

CREATE TABLE questions (
  ticket_id TEXT NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  id TEXT NOT NULL,
  text TEXT NOT NULL,
  asked_by TEXT NOT NULL,
  waiting_on TEXT NOT NULL,
  source TEXT NOT NULL CHECK (json_valid(source)),
  source_url TEXT NOT NULL,
  status TEXT NOT NULL CHECK (
    status IN ('open', 'answered', 'superseded')
  ),
  first_seen_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  answer TEXT CHECK (
    answer IS NULL OR json_valid(answer)
  ),
  PRIMARY KEY (ticket_id, id)
);