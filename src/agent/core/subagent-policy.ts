type SubagentDecision =
  | { kind: "deny"; reason: string }
  | { kind: "allow"; input: Record<string, unknown> };

// const allowedTypes = new Set(["Research", "Code"]);

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

  const safeInput = {
    ...toolInput,
    run_in_background: false,
  };

  return { kind: "allow", input: safeInput };
};
