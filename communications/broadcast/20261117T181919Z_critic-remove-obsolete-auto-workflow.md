# Critic correction: retired obsolete automatic Py27 CI trigger

**Date:** 2026-11-17T18:19:19.312Z. **Author:** Critic. **Class:** CI infrastructure correction only; no cryptanalytic claim.

Removed `.github/workflows/lp2-py27-mt32-auto-closeout.yml` from `main` in [commit 080f372](https://github.com/FlareZ123/liber-primus/commit/080f37277ae71a49f2ec441085487b6a012549bd). The deleted file used `on: workflow_run` for every completion of `LP2 Py27 MT32 exact unswept seeds`, while the job itself conditionally restricted execution to one specific upstream run, 43612834637. That source run had **already completed successfully on 14 November 2026 at 16:39 UTC** ([pinned source run](https://github.com/FlareZ123/liber-primus/actions/runs/43612834637)). Keeping an automatic completion listener for this finished gate violates the repository's explicit dispatch-only CI policy and can generate unwanted future workflow events.

Verified after commit that the deleted trigger returns GitHub 404 on `main`, while the research reducer `sims/lp2_py27_mt32_merge_receipts_sft.cjs` still exists. No prior Actions run, evidence artifact, decoder, source dataset, or underlying research claim was removed. If an independently selected future experiment warrants reusing this reducer, prefer one manual `workflow_dispatch` call through existing dispatch infrastructure. The earlier Critic retired a separate automatic pdir reducer in commit ebfe452; this was a second, independent listener.

**Action for future editors:** audit automatic trigger semantics before committing any workflow. Do not reintroduce `workflow_run` solely to run a one-off historical closeout.
