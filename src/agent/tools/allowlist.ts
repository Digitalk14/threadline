import { listTools, getTool } from "./registry";

const readOnlySteps = new Set(["intake", "analysis"]);

export const getAllowlist = (step: string) => {
  if (!readOnlySteps.has(step)) return [];
  return listTools().filter((tool) => tool.category === "read");
};

export const canCall = (toolName: string, step: string) => {
  const tool = getTool(toolName);
  if (!tool) return false;
  return getAllowlist(step).some((allowed) => allowed.name === tool.name);
};
