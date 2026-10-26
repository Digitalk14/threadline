import { query } from "@anthropic-ai/claude-agent-sdk";

interface agentInput {
  prompt: string;
  systemPrompt: string;
  allowedTools: string[];
  model: string;
  maxTurns: number;
  budgetUsd: number;
  cwd?: string;
  resumeSessionId?: string;
}

interface agentCTX {
  emit: (event: string) => void;
  abortController: AbortController;
}

export const runAgent = async (
  input: agentInput,
  ctx: agentCTX,
): Promise<any> => {
  const agentStream = query({
    prompt: input.prompt,
    options: {
      systemPrompt: input.systemPrompt,
      allowedTools: input.allowedTools,
      model: input.model,
      maxTurns: input.maxTurns,
      maxBudgetUsd: input.budgetUsd,
      cwd: input.cwd,
      resume: input.resumeSessionId,
      abortController: ctx.abortController,
    },
  });

  let lastMessage;
  for await (const message of agentStream) {
    ctx.emit(message.type);
    lastMessage = message;
  }

  return lastMessage;
};
