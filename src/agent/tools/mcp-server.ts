import { createSdkMcpServer, tool } from "@anthropic-ai/claude-agent-sdk";
import { z } from "zod";
import { getAllowlist, type Step } from "./allowlist";
import type { RegisteredTool, ToolContext, ToolResult } from "./types";

export const SERVER_NAME = "threadline";

export function mcpToolName(name: string): string {
  return `mcp__${SERVER_NAME}__${name}`;
}

export function registryNameFromMcp(toolName: string): string | undefined {
  const prefix = `mcp__${SERVER_NAME}__`;
  if (!toolName.startsWith(prefix)) return undefined;
  return toolName.slice(prefix.length);
}

function objectShape(schema: z.ZodType): z.ZodRawShape {
  if (schema instanceof z.ZodObject) return schema.shape;
  throw new Error("Tool parameters must be a Zod object");
}

function contextFrom(extra: unknown, runSignal: AbortSignal): ToolContext {
  const sdkSignal =
    typeof extra === "object" &&
    extra !== null &&
    "signal" in extra &&
    extra.signal instanceof AbortSignal
      ? extra.signal
      : undefined;
  return {
    signal: sdkSignal ? AbortSignal.any([runSignal, sdkSignal]) : runSignal,
  };
}

export function toSdkResult(result: ToolResult) {
  return {
    content: [{ type: "text" as const, text: result.content }],
    isError: result.isError,
  };
}

export function sdkHandler(agentTool: RegisteredTool, runSignal: AbortSignal) {
  return async (args: unknown, extra?: unknown) => {
    const result = await agentTool.call(args, contextFrom(extra, runSignal));
    return toSdkResult(result);
  };
}

export function createToolServer(step: Step, runSignal: AbortSignal) {
  const tools = getAllowlist(step).map((agentTool) =>
    tool(
      agentTool.name,
      agentTool.description,
      objectShape(agentTool.parameters),
      sdkHandler(agentTool, runSignal),
    ),
  );

  return createSdkMcpServer({
    name: SERVER_NAME,
    tools,
  });
}
