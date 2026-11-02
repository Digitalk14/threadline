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

  const raw = toolInput as Record<string, unknown>;
  const { description, prompt, name, isolation } = raw;
  if (typeof description !== "string" || typeof prompt !== "string") {
    return { kind: "deny", reason: "Missing or invalid description/prompt" };
  }

  if (isolation !== undefined && isolation !== "worktree") {
    return {
      kind: "deny",
      reason: `Isolation is not allowed: ${String(isolation)}`,
    };
  }

  const safeInput: Record<string, unknown> = {
    description,
    prompt,
    subagent_type: toolInput.subagent_type,
    ...(typeof name === "string" ? { name } : {}),
    ...(isolation === "worktree" ? { isolation } : {}),
    run_in_background: false,
  };
  return { kind: "allow", input: safeInput };
};
