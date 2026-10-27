import { runAgent } from "../src/agent/core/run-agent";

async function main() {
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
  if (r.costUsd >= 0.02) throw new Error(`smoke: cost $${r.costUsd} >= $0.02`);
}
main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
