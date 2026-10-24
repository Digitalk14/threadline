import type { ReactNode } from "react";

/** Consistent padding/scroll shell for the content of every ticket tab. */
export function TabPanel({ children }: { children: ReactNode }) {
  return <div className="flex-1 overflow-y-auto p-4">{children}</div>;
}
