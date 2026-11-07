import "server-only";
import { db } from "./connection";
import { migrate } from "./migrate";

migrate();

export { db };