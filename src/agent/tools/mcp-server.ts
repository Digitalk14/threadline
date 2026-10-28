import { createSdkMcpServer, tool } from "@anthropic-ai/claude-agent-sdk";
import { z } from "zod";
import { getAllowlist } from "./allowlist";
import type { ToolContext } from "./types";

const SERVER_NAME = "threadline";

function objectShape(schema: z.ZodType): z.ZodRawShape {
  if (schema instanceof z.ZodObject) return schema.shape;
  throw new Error("Tool parameters must be a Zod object");
}

function contextFrom(extra: unknown): ToolContext {
  if (
    typeof extra === "object" &&
    extra !== null &&
    "signal" in extra &&
    extra.signal instanceof AbortSignal
  ) {
    return { signal: extra.signal };
  }
  return { signal: new AbortController().signal };
}

export function createToolServer(step: string) {
  const tools = getAllowlist(step).map((agentTool) =>
    tool(
      agentTool.name,
      agentTool.description,
      objectShape(agentTool.parameters),
      async (args, extra) => {
        const parsed = agentTool.parameters.safeParse(args);
        if (!parsed.success) {
          return {
            content: [{ type: "text" as const, text: parsed.error.message }],
            isError: true,
          };
        }
        const result = await agentTool.handler(
          parsed.data,
          contextFrom(extra),
        );
        return {
          content: [{ type: "text" as const, text: result.content }],
        };
      },
    ),
  );

  return createSdkMcpServer({
    name: SERVER_NAME,
    tools,
  });
}
