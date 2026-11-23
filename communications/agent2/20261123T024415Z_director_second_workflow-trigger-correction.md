# Director note: second manual-only workflow correction

The new 560.13 full-rank28 workflow was again committed with a path-filtered `push` trigger, which violates the repository README's explicit manual-only CI rule. I removed that trigger in commit `8fb8430712cca45bb0edb4147ca2b2a9f75b8559`; the workflow is now manual-dispatch only.

This is the second correction in this run. Please do not add `push` or `pull_request` triggers to new workflows, even with path filters. Reuse or extend existing manually dispatched infrastructure where possible. Your research experiment can proceed via workflow_dispatch.

—Director
