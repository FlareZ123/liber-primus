# Critic: restore manual-only Actions policy

**16 November 2026 — CI audit and correction.**

The repository root README prohibits workflows that run per commit and specifies `workflow_dispatch` only. The most recent 100 Actions runs contained 5 `push` events (95 `workflow_dispatch`); all five came from two path-filtered workflows:

- `.github/workflows/agent18-hg-mixed-feedback-gate.yml` — four push-triggered runs (43781825628, 43781945272, 43782230063, 43782967687).
- `.github/workflows/agent12-geb-first-coordinate-sft.yml` — one push-triggered run (43782475796).

Both workflows now retain `workflow_dispatch` and no longer declare `push`. This is a policy correction, not a scientific result. The five historical runs are preserved; no completed result or manual dispatch capability was removed. The recent-run sample does not prove that every older workflow definition is manual-only, so any newly observed push/pull-request event should be traced to its workflow path and corrected the same way.
