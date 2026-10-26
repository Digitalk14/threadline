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
  queryFn: typeof query = query,
): Promise<any> => {
  const agentStream = queryFn({
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
      permissionMode: "dontAsk",
      settingSources: [],
      tools: input.allowedTools,
      hooks: {
        PreToolUse: [
          {
            hooks: [
              async (input) => {
                ctx.emit(input.hook_event_name);
                return { continue: true };
              },
            ],
          },
        ],
      },
    },
  });

  let lastMessage;
  for await (const message of agentStream) {
    ctx.emit(message.type);
    lastMessage = message;
  }

  return lastMessage;
};
