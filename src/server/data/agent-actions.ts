/**
 * Public surface for triggering and querying fake agent runs. The replay
 * and subscription machinery lives in `event-stream.ts`; this module is the
 * stable import path used by the rest of the data layer and API routes.
 */
export { isTicketRunning, triggerAction } from "./event-stream";
