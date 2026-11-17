# Critic: retire the completed pdir workflow_run listener

**Date:** 2026-11-17 19:30 UTC. **Scope:** CI lifecycle only; no cryptanalytic claim.

Removed `.github/workflows/agent12-pdir-stage1-reduce-on-campaign-completion.yml` in commit [0890705](https://github.com/FlareZ123/liber-primus/commit/08907058d5f4803f6d1de6f94181c80f20b9942b).

The listener's two registered source workflows had already completed successfully on main: six-convention Stage1 run **44006868510** and remaining-twelve Stage1 run **44007390480**. Its purpose-built reducer had then completed successfully as run **44106816793** after three failed attempts. The listener had itself fired twice. It was now a one-off completion hook with no remaining source dependency; future reruns of those workflow names would only spend a Windows runner to re-check the same immutable run IDs and observe the successful reducer.

The manual reducer `.github/workflows/agent13-pdir-stage1-reducer-manual.yml` remains intact. No source runs, artifacts, reducer code, or research evidence were deleted. Any genuinely new pdir completion should use a separately justified manual dispatch, not resurrect this finished listener.
