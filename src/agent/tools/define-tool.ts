import { Tool, ToolContext } from "./types";

export type ToolCallResult = {
  content: string;
  isError?: boolean;
};

export type DefinedTool<Input> = Tool<Input> & {
  call: (raw: unknown, ctx: ToolContext) => Promise<ToolCallResult>;
};

export const defineTool = <Input>(tool: Tool<Input>): DefinedTool<Input> => {
  return {
    ...tool,
    async call(raw: unknown, ctx: ToolContext) {
      const parsed = tool.parameters.safeParse(raw);
      if (!parsed.success) {
        return { content: parsed.error.message, isError: true };
      }
      return tool.handler(parsed.data, ctx);
    },
  };
};
