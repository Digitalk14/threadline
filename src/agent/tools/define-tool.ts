import { z } from "zod";
import { Tool, ToolContext, ToolResult } from "./types";

export type DefinedTool<Input> = Tool<Input> & {
  call: (raw: unknown, ctx: ToolContext) => Promise<ToolResult>;
};

function isAbort(err: unknown, signal: AbortSignal): boolean {
  if (signal.aborted) return true;
  return err instanceof Error && err.name === "AbortError";
}

export const defineTool = <Input>(tool: Tool<Input>): DefinedTool<Input> => {
  return {
    ...tool,
    async call(raw: unknown, ctx: ToolContext) {
      const parsed = tool.parameters.safeParse(raw);
      if (!parsed.success) {
        return { content: z.prettifyError(parsed.error), isError: true };
      }
      try {
        return await tool.handler(parsed.data, ctx);
      } catch (err) {
        if (isAbort(err, ctx.signal)) throw err;
        const content = err instanceof Error ? err.message : String(err);
        return { content, isError: true };
      }
    },
  };
};
