import { describe, expect, it } from "vitest";
import { decideSubagentCall } from "./subagent-policy";

const allowed = new Set(["Research", "Code"]);

describe("decideSubagentCall", () => {
  it("deny input that is not an object", () => {
    for (const toolInput of ["Research", null, ["Research"], 1, false]) {
      expect(decideSubagentCall(toolInput, allowed)).toEqual({
        kind: "deny",
        reason: "Invalid input",
      });
    }
  });

  it("deny missing or non-string subagent_type", () => {
    expect(
      decideSubagentCall({ prompt: "посмотри тикет" }, allowed),
    ).toEqual({
      kind: "deny",
      reason: "Missing or invalid subagent_type",
    });
    expect(decideSubagentCall({ subagent_type: 1 }, allowed)).toEqual({
      kind: "deny",
      reason: "Missing or invalid subagent_type",
    });
  });

  it("deny type that is not in the allowed list and name it in the reason", () => {
    expect(
      decideSubagentCall(
        { subagent_type: "Explore", prompt: "найди файлы" },
        allowed,
      ),
    ).toEqual({
      kind: "deny",
      reason: "Unknown subagent type: Explore",
    });
  });

  it("deny any type if allowed types list is empty", () => {
    expect(
      decideSubagentCall({ subagent_type: "Research" }, new Set()),
    ).toEqual({
      kind: "deny",
      reason: "Unknown subagent type: Research",
    });
  });

  it("drops model and effort overrides while forcing foreground", () => {
    expect(
      decideSubagentCall(
        {
          subagent_type: "Research",
          prompt: "собери контекст",
          description: "контекст тикета",
          model: "opus",
          effort: "max",
          name: "ticket-research",
          run_in_background: true,
          mode: "bypassPermissions",
        },
        allowed,
      ),
    ).toEqual({
      kind: "allow",
      input: {
        subagent_type: "Research",
        prompt: "собери контекст",
        description: "контекст тикета",
        name: "ticket-research",
        run_in_background: false,
      },
    });
  });

  it("allows known type, disables background and drops non-whitelisted fields", () => {
    expect(
      decideSubagentCall(
        {
          subagent_type: "Research",
          prompt: "собери контекст",
          description: "контекст тикета",
          model: "haiku",
          run_in_background: true,
        },
        allowed,
      ),
    ).toEqual({
      kind: "allow",
      input: {
        subagent_type: "Research",
        prompt: "собери контекст",
        description: "контекст тикета",
        run_in_background: false,
      },
    });
  });

  it("deny missing description or prompt", () => {
    expect(
      decideSubagentCall(
        { subagent_type: "Research", prompt: "p" },
        allowed,
      ),
    ).toEqual({
      kind: "deny",
      reason: "Missing or invalid description/prompt",
    });
    expect(
      decideSubagentCall(
        { subagent_type: "Research", description: "d" },
        allowed,
      ),
    ).toEqual({
      kind: "deny",
      reason: "Missing or invalid description/prompt",
    });
  });

  it("выключает фон, даже если поле не передано", () => {
    const decision = decideSubagentCall(
      {
        subagent_type: "Code",
        description: "правка",
        prompt: "поправь тест",
      },
      allowed,
    );
    expect(decision).toEqual({
      kind: "allow",
      input: {
        subagent_type: "Code",
        description: "правка",
        prompt: "поправь тест",
        run_in_background: false,
      },
    });
  });

  it("оставляет уже выключенный фон выключенным", () => {
    const decision = decideSubagentCall(
      {
        subagent_type: "Code",
        description: "правка",
        prompt: "поправь тест",
        run_in_background: false,
      },
      allowed,
    );
    expect(decision).toEqual({
      kind: "allow",
      input: {
        subagent_type: "Code",
        description: "правка",
        prompt: "поправь тест",
        run_in_background: false,
      },
    });
  });

  it("отклоняет remote, даже если тип разрешён", () => {
    expect(
      decideSubagentCall(
        {
          subagent_type: "Research",
          description: "контекст",
          prompt: "собери контекст",
          isolation: "remote",
        },
        allowed,
      ),
    ).toEqual({
      kind: "deny",
      reason: "Isolation is not allowed: remote",
    });
  });

  it("denies isolation values other than worktree", () => {
    expect(
      decideSubagentCall(
        {
          subagent_type: "Research",
          description: "контекст",
          prompt: "собери контекст",
          isolation: "cloud",
        },
        allowed,
      ),
    ).toEqual({
      kind: "deny",
      reason: "Isolation is not allowed: cloud",
    });
  });

  it("пропускает worktree: это изоляция файлов, а не фоновый запуск", () => {
    expect(
      decideSubagentCall(
        {
          subagent_type: "Research",
          description: "контекст",
          prompt: "собери контекст",
          isolation: "worktree",
        },
        allowed,
      ),
    ).toEqual({
      kind: "allow",
      input: {
        subagent_type: "Research",
        description: "контекст",
        prompt: "собери контекст",
        isolation: "worktree",
        run_in_background: false,
      },
    });
  });
});
