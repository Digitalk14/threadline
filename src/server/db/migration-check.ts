import { db } from "./index";

const tables = db
  .prepare(
    `SELECT name FROM sqlite_master
     WHERE type = 'table'
     ORDER BY name`,
  )
  .all();

const version = db.pragma("user_version", { simple: true });

console.log("Migration version:", version);
console.log("Tables:", tables);
