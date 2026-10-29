import { z } from "zod";
import { Tool } from "./types";

const echoSchema = z.object({
  text: z.string(),
});

export const echo: Tool<z.infer<typeof echoSchema>> = {
  name: "echo",
  description: "Echo the input text",
  category: "read",
  parameters: echoSchema,
  handler: async ({ text }) => {
    return { content: text };
  },
};
