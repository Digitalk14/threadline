import { afterEach, describe, expect, it } from "vitest";
import { z } from "zod";
import { canCall, getAllowlist } from "./allowlist";
import { defineTool } from "./define-tool";
import { echo } from "./echo";
import { registerTool, unregisterTool } from "./registry";

const ctx = { signal: new AbortController().signal };

const save = defineTool({
  name: "save",
  description: "Сохраняет текст",
  category: "write",
  parameters: z.object({ text: z.string() }),
  handler: async ({ text }) => ({ content: text }),
});

describe("tools", () => {
  afterEach(() => {
    unregisterTool(save.name);
  });

  it("схема и проверка берутся из одного определения", () => {
    expect(z.toJSONSchema(echo.parameters)).toMatchObject({
      type: "object",
      properties: { text: { type: "string" } },
      required: ["text"],
    });
    expect(echo.parameters.safeParse({ text: "hi" }).success).toBe(true);
  });

  it("невалидный вход возвращает tool result с ошибкой и не бросает", async () => {
    const defined = defineTool(echo);
    await expect(defined.call({}, ctx)).resolves.toMatchObject({
      isError: true,
    });
  });

  it("write-инструмент запрещён на read-only шаге", () => {
    registerTool(save);
    expect(canCall("echo", "intake")).toBe(true);
    expect(canCall("save", "intake")).toBe(false);
    expect(canCall("save", "analysis")).toBe(false);
    expect(getAllowlist("intake").map((tool) => tool.name)).toEqual(["echo"]);
    expect(getAllowlist("analysis").map((tool) => tool.name)).toEqual(["echo"]);
  });
});
