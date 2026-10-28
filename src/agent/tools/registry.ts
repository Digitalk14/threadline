import { echo } from "./echo";
import { Tool } from "./types";

const map = new Map<string, Tool<{ text: string }>>([
    ["echo", echo],
]);

export const getTool = (name: string): Tool<{ text: string }> | undefined => {
    return map.get(name);
}

export const listTools = () => [...map.values()];

export const registerTool = (tool: Tool<{ text: string }>) => {
  map.set(tool.name, tool);
};

export const unregisterTool = (name: string) => {
  map.delete(name);
};