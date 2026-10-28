import { z } from "zod";

type ToolResult = {
  content: string;
};

export type ToolContext = {
  signal: AbortSignal;
};

export type Tool<Input> = {
  name: string;
  description: string;
  category: "read" | "write";
  parameters: z.ZodType<Input>;
  handler: (params: Input, ctx: ToolContext) => Promise<ToolResult>;
};
