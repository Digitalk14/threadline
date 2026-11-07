import "server-only";
import { db } from "./connection";
import { migrate } from "./migrate";

migrate(db);

export { db };
