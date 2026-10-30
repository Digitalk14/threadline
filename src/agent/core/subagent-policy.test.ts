import { describe, expect, it } from "vitest";
import { decideSubagentCall } from "./subagent-policy";

const allowed = new Set(["Research", "Code"]);

describe("decideSubagentCall", () => {
  it("отклоняет вход, который не является объектом", () => {
    expect(decideSubagentCall("Research", allowed)).toEqual({
      kind: "deny",
      reason: "Invalid input",
    });
    expect(decideSubagentCall(null, allowed)).toEqual({
      kind: "deny",
      reason: "Invalid input",
    });
    expect(decideSubagentCall(["Research"], allowed)).toEqual({
      kind: "deny",
      reason: "Invalid input",
    });
  });

  it("отклоняет отсутствующий или нестроковый subagent_type", () => {
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

  it("отклоняет тип, которого нет в списке, и называет его в причине", () => {
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

  it("отклоняет любой тип, если список разрешённых пуст", () => {
    expect(
      decideSubagentCall({ subagent_type: "Research" }, new Set()),
    ).toEqual({
      kind: "deny",
      reason: "Unknown subagent type: Research",
    });
  });

  it("разрешает известный тип и выключает фон, сохраняя остальные поля", () => {
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
        model: "haiku",
        run_in_background: false,
      },
    });
  });

  it("выключает фон, даже если поле не передано", () => {
    const decision = decideSubagentCall(
      { subagent_type: "Code", prompt: "поправь тест" },
      allowed,
    );
    expect(decision).toEqual({
      kind: "allow",
      input: {
        subagent_type: "Code",
        prompt: "поправь тест",
        run_in_background: false,
      },
    });
  });

  it("оставляет уже выключенный фон выключенным", () => {
    const decision = decideSubagentCall(
      { subagent_type: "Code", run_in_background: false },
      allowed,
    );
    expect(decision).toMatchObject({
      kind: "allow",
      input: { run_in_background: false },
    });
  });

  it("отклоняет remote, даже если тип разрешён", () => {
    expect(
      decideSubagentCall(
        { subagent_type: "Research", isolation: "remote" },
        allowed,
      ),
    ).toEqual({
      kind: "deny",
      reason: "Remote isolation is not allowed",
    });
  });

  it("пропускает worktree: это изоляция файлов, а не фоновый запуск", () => {
    expect(
      decideSubagentCall(
        { subagent_type: "Research", isolation: "worktree" },
        allowed,
      ),
    ).toEqual({
      kind: "allow",
      input: {
        subagent_type: "Research",
        isolation: "worktree",
        run_in_background: false,
      },
    });
  });
});
