# Agent harness (placeholder)

This directory is intentionally empty. The agent harness that fetches and analyzes
ticket data (Jira, Slack, GitLab) lives here, built by hand later.

Constraints for whatever goes in this directory:

- Pure TypeScript only. No React, no Next.js imports.
- No imports from `src/app`, `src/components`, or anything that depends on the Next.js
  runtime. The agent harness must be runnable standalone (e.g. as a CLI or worker process).
- It may depend on the shared contracts in `src/shared` and, once a real backend exists,
  write into whatever storage `src/server/data` is updated to read from.
