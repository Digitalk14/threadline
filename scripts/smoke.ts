import type { AgentEvent } from "../src/agent/core/events";
import { AgentRunError, runAgent } from "../src/agent/core/run-agent";

async function main() {
  const ac = new AbortController();
  let started: Extract<AgentEvent, { type: "run_started" }> | undefined;
  const emit = (e: AgentEvent) => {
    console.log(JSON.stringify(e));
    if (e.type === "run_started") started = e;
  };
  const r = await runAgent(
    {
      prompt: "Какие инструменты тебе доступны? Ответь списком.",
      systemPrompt: "Ты тестовый агент. Не вызывай инструменты.",
      allowedTools: ["Read"],
      model: "claude-haiku-4-5",
      maxTurns: 2,
      budgetUsd: 0.02,
      step: "intake",
    },
    { emit, abortController: ac },
  );
  if (!started || started.mcpServerCount !== 1)
    throw new Error("smoke: expected the threadline MCP server");

  console.log(`cost=$${r.costUsd.toFixed(4)} turns=${r.numTurns}`);
  if (r.costUsd >= 0.02) throw new Error(`smoke: cost $${r.costUsd} >= $0.02`);
}
main().catch((err) => {
  if (err instanceof AgentRunError) {
    console.error(`smoke failed: ${err.reason} cost=$${err.costUsd.toFixed(4)}`);
  } else {
    console.error(err instanceof Error ? err.message : err);
  }
  process.exit(1);
});
