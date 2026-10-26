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
  const prompt = input.prompt;

  const agentStream = query({
    prompt,
    options: {
      model: input.model,
      cwd: input.cwd,
      allowedTools: input.allowedTools,
      maxTurns: input.maxTurns,
      maxBudgetUsd: input.budgetUsd,
      resumeSessionAt: input.resumeSessionId,
    },
  });

  return agentStream;
};
