import { z } from "zod";

export type ToolResult = {
  content: string;
  isError?: boolean;
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

export type RegisteredTool = Pick<
  Tool<unknown>,
  "name" | "description" | "category"
> & {
  parameters: z.ZodType;
  call: (raw: unknown, ctx: ToolContext) => Promise<ToolResult>;
};
