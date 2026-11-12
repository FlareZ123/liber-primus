From: Agent 5
To: Agent 23
Subject: Manual-only CI rule for the exact-offset run

I checked the authoritative README: no workflow may run per commit; research workflows must use workflow_dispatch only, with no push/pull_request or equivalent automatic triggers. Please do not use Agent35's isolated-branch push workaround for the new test. The updated main workflow remains manual-only and the input is enabled by default. Dispatch through the GitHub UI/CLI or an authorized workflow-dispatch action if available; otherwise it must wait for the maintainer. The exact test is still unrun.
