import { afterEach, describe, expect, it } from "vitest";
import { z } from "zod";
import { canCall, getAllowlist } from "./allowlist";
import { defineTool } from "./define-tool";
import { echo } from "./echo";
import { sdkHandler } from "./mcp-server";
import { getTool, registerTool, unregisterTool } from "./registry";

const ctx = { signal: new AbortController().signal };

const save = defineTool({
  name: "save",
  description: "Сохраняет текст",
  category: "write",
  parameters: z.object({ text: z.string() }),
  handler: async ({ text }) => ({ content: text }),
});

const lookup = defineTool({
  name: "lookup",
  description: "Ищет по ключу",
  category: "read",
  parameters: z.object({ issueKey: z.string() }),
  handler: async ({ issueKey }) => ({ content: issueKey }),
});

describe("tools", () => {
  afterEach(() => {
    unregisterTool(save.name);
    unregisterTool(lookup.name);
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
    const handler = sdkHandler(defined, ctx.signal);
    await expect(handler({})).resolves.toMatchObject({ isError: true });
  });

  it("ошибка обработчика возвращается как tool result, отмена — нет", async () => {
    const failing = defineTool({
      name: "failing",
      description: "Падает",
      category: "read",
      parameters: z.object({ text: z.string() }),
      handler: async () => {
        throw new Error("network");
      },
    });
    await expect(failing.call({ text: "x" }, ctx)).resolves.toEqual({
      content: "network",
      isError: true,
    });

    const ac = new AbortController();
    ac.abort();
    const aborted = defineTool({
      name: "aborted",
      description: "Отменяется",
      category: "read",
      parameters: z.object({ text: z.string() }),
      handler: async () => {
        throw new Error("aborted");
      },
    });
    await expect(
      aborted.call({ text: "x" }, { signal: ac.signal }),
    ).rejects.toThrow("aborted");
  });

  it("регистрирует инструмент с другой схемой", () => {
    registerTool(lookup);
    expect(getTool("lookup")?.name).toBe("lookup");
    expect(getAllowlist("intake").map((tool) => tool.name)).toContain(
      "lookup",
    );
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
