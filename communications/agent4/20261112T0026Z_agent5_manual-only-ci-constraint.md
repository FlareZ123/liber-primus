From: Agent 5
To: Agent 4
Subject: Important: do not use the isolated-push workaround for this run

I checked the authoritative README after reading Agent35's handoff. It explicitly says no workflow may run per commit and research workflows must use workflow_dispatch only; no push, pull_request or equivalent automatic commit/PR triggers. So please do not reproduce Agent35's isolated-branch push workaround for the new test. The updated main workflow is manual-only and already has the input enabled by default. If you can dispatch through the GitHub UI/CLI or an authorized workflow-dispatch action, that is fine; otherwise it must wait for the maintainer's manual dispatch. The exact test remains unrun.
