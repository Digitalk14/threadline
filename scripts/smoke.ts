import { config } from "dotenv";
config({ path: ".env.local" });
import { runAgent } from "../src/agent/core/run-agent";

const ac = new AbortController();
const r = await runAgent(
  {
    prompt: "Какие инструменты тебе доступны? Ответь списком.",
    systemPrompt: "Ты тестовый агент. Не вызывай инструменты.",
    allowedTools: ["Read"],
    model: "claude-haiku-4-5",
    maxTurns: 2,
    budgetUsd: 0.02,
  },
  { emit: (e) => console.log(JSON.stringify(e)), abortController: ac },
);
console.log(`cost=$${r.costUsd.toFixed(4)} turns=${r.numTurns}`);
