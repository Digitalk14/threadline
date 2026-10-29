import { echo } from "./echo";
import { RegisteredTool } from "./types";
import { defineTool } from "./define-tool";

const map = new Map<string, RegisteredTool>();

export const getTool = (name: string): RegisteredTool | undefined => {
  return map.get(name);
};

export const listTools = () => [...map.values()];

export const registerTool = (tool: RegisteredTool) => {
  if (map.has(tool.name))
    throw new Error(`Tool ${tool.name} already registered`);
  map.set(tool.name, tool);
};

registerTool(defineTool(echo));

export const unregisterTool = (name: string) => {
  map.delete(name);
};
