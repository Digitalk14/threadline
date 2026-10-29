import { getTool, listTools } from "./registry";

export const STEPS = ["intake", "analysis"] as const;
export type Step = (typeof STEPS)[number];

const readOnlySteps = new Set<Step>(["intake", "analysis"]);

export const getAllowlist = (step: Step) => {
  const tools = listTools();
  if (readOnlySteps.has(step)) {
    return tools.filter((tool) => tool.category === "read");
  }
  return tools;
};

export const canCall = (toolName: string, step: Step) => {
  const tool = getTool(toolName);
  if (!tool) return false;
  return getAllowlist(step).some((allowed) => allowed.name === tool.name);
};
