import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";
import { TicketDetailSchema } from "../src/shared/ticket";
import { AgentEventSchema } from "../src/shared/events";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const mocksDir = join(scriptDir, "..", "mocks");

const AgentEventsFileSchema = z.array(AgentEventSchema);

let failures = 0;

function checkDir(
  dirName: string,
  schema: z.ZodType,
  label: string,
): void {
  const dirPath = join(mocksDir, dirName);
  const files = readdirSync(dirPath).filter((f) => f.endsWith(".json"));

  if (files.length === 0) {
    console.error(`No ${label} fixtures found in mocks/${dirName}`);
    failures += 1;
    return;
  }

  for (const file of files) {
    const filePath = join(dirPath, file);
    const raw = readFileSync(filePath, "utf-8");
    let json: unknown;
    try {
      json = JSON.parse(raw);
    } catch (err) {
      console.error(`mocks/${dirName}/${file}: invalid JSON (${String(err)})`);
      failures += 1;
      continue;
    }

    const result = schema.safeParse(json);
    if (!result.success) {
      console.error(`mocks/${dirName}/${file}: failed ${label} validation`);
      for (const issue of result.error.issues) {
        console.error(`  - ${issue.path.join(".") || "(root)"}: ${issue.message}`);
      }
      failures += 1;
    } else {
      console.log(`mocks/${dirName}/${file}: ok`);
    }
  }
}

checkDir("tickets", TicketDetailSchema, "TicketDetail");
checkDir("events", AgentEventsFileSchema, "AgentEvent[]");

if (failures > 0) {
  console.error(`\n${failures} mock fixture(s) failed validation.`);
  process.exit(1);
} else {
  console.log("\nAll mock fixtures are valid.");
}
