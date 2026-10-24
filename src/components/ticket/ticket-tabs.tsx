"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DEFAULT_TICKET_TAB, TicketTabSchema, type TicketTab } from "@/shared/api";
import type { TicketDetail } from "@/shared/ticket";
import { ActivityTab } from "./activity/activity-tab";
import { BriefTab } from "./brief/brief-tab";
import { OverviewTab } from "./overview/overview-tab";
import { PlanTab } from "./plan/plan-tab";
import { SourcesTab } from "./sources/sources-tab";
import { TabPanel } from "./tab-panel";

const TAB_LABEL: Record<TicketTab, string> = {
  overview: "Overview",
  sources: "Sources",
  brief: "Brief",
  plan: "Plan",
  activity: "Activity",
};

function parseTab(raw: string | null): TicketTab {
  const result = TicketTabSchema.safeParse(raw);
  return result.success ? result.data : DEFAULT_TICKET_TAB;
}

export function TicketTabs({ ticket }: { ticket: TicketDetail }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeTab = parseTab(searchParams.get("tab"));

  function handleValueChange(value: TicketTab) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === DEFAULT_TICKET_TAB) {
      params.delete("tab");
    } else {
      params.set("tab", value);
    }
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  }

  return (
    // Keying on the ticket ID resets tab-local state when navigating
    // between tickets.
    <Tabs
      key={ticket.id}
      value={activeTab}
      onValueChange={(value) => handleValueChange(value as TicketTab)}
      className="flex min-h-0 flex-1 flex-col"
    >
      <TabsList className="mx-4 mt-3 self-start">
        {TicketTabSchema.options.map((tab) => (
          <TabsTrigger key={tab} value={tab}>
            {TAB_LABEL[tab]}
          </TabsTrigger>
        ))}
      </TabsList>
      <TabsContent value="overview" className="flex min-h-0 flex-1 flex-col">
        <TabPanel>
          <OverviewTab ticket={ticket} />
        </TabPanel>
      </TabsContent>
      <TabsContent value="sources" className="flex min-h-0 flex-1 flex-col">
        <TabPanel>
          <SourcesTab ticket={ticket} />
        </TabPanel>
      </TabsContent>
      <TabsContent value="brief" className="flex min-h-0 flex-1 flex-col">
        <TabPanel>
          <BriefTab brief={ticket.brief} />
        </TabPanel>
      </TabsContent>
      <TabsContent value="plan" className="flex min-h-0 flex-1 flex-col">
        <TabPanel>
          <PlanTab plan={ticket.plan} />
        </TabPanel>
      </TabsContent>
      <TabsContent value="activity" className="flex min-h-0 flex-1 flex-col">
        <ActivityTab ticketId={ticket.id} />
      </TabsContent>
    </Tabs>
  );
}
