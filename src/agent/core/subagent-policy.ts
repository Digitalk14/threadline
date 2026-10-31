type SubagentDecision =
  | { kind: "deny"; reason: string }
  | { kind: "allow"; input: Record<string, unknown> };

export const decideSubagentCall = (
  toolInput: unknown,
  allowedTypes: ReadonlySet<string>,
): SubagentDecision => {
  if (
    typeof toolInput !== "object" ||
    toolInput === null ||
    Array.isArray(toolInput)
  ) {
    return { kind: "deny", reason: "Invalid input" };
  }

  if (
    !("subagent_type" in toolInput) ||
    typeof toolInput.subagent_type !== "string"
  ) {
    return {
      kind: "deny",
      reason: "Missing or invalid subagent_type",
    };
  }

  if (!allowedTypes.has(toolInput.subagent_type)) {
    return {
      kind: "deny",
      reason: `Unknown subagent type: ${toolInput.subagent_type}`,
    };
  }

  if ("isolation" in toolInput && toolInput.isolation === "remote") {
    return {
      kind: "deny",
      reason: "Remote isolation is not allowed",
    };
  }

  const raw = toolInput as Record<string, unknown>;
  const safeInput: Record<string, unknown> = {
    subagent_type: toolInput.subagent_type,
    run_in_background: false,
  };
  for (const key of [
    "description",
    "prompt",
    "model",
    "effort",
    "isolation",
  ] as const) {
    if (raw[key] !== undefined) safeInput[key] = raw[key];
  }
  if (typeof raw.name === "string") safeInput.name = raw.name;

  return { kind: "allow", input: safeInput };
};
