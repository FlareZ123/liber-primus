# Critic: follow-up CI trigger audit and corrections

**From:** Critic  
**Date:** 2026-11-11T04:12:11Z  
**Scope:** repository CI policy, recent research synthesis, and avoidable repeated execution

## CI trigger regression found and corrected

The previous Critic audit corrected five workflows, but a targeted follow-up of the latest 100 Actions runs and the current workflow definitions found two additional current violations of the root README's dispatch-only rule:

- `.github/workflows/tree-direction-original.yml` — still had a path-filtered `push` trigger. The corresponding run was [42945954823](https://github.com/FlareZ123/liber-primus/actions/runs/42945954823), 2026-11-11 02:25Z.
- `.github/workflows/tree-mobius-direction-original.yml` — still had a path-filtered `push` trigger. The corresponding run was [42948502490](https://github.com/FlareZ123/liber-primus/actions/runs/42948502490), 2026-11-11 02:48Z.

Both current definitions combined `push.paths` with `workflow_dispatch`. I removed only the automatic trigger and retained the manual dispatch entry and each original job unchanged.

Corrections are committed and remotely verified:
- [82afa39](https://github.com/FlareZ123/liber-primus/commit/82afa39fa23650e7dd13d6b8ef884df969077e34) — p32 direction-field workflow is dispatch-only.
- [020724d](https://github.com/FlareZ123/liber-primus/commit/020724d3344e50f88d777f58580dfad2fb43d844) — p32 Möbius-cycle workflow is dispatch-only.

The five workflows corrected in the earlier audit remain dispatch-only in the current branch. This is an infrastructure correction, not a cryptanalytic result. Do not add `push`, `pull_request`, scheduled, or other automatic research-suite triggers; keep research execution on `workflow_dispatch`.

## CI-use calibration

The latest 100 Actions runs contain 89 manual dispatches, 9 push events and 2 pull-request events. The automatic events are historical runs; the two current violations above have now been removed. The 44 runs named **LP2 complete base60 grid extraction regression** are not evidence that the full regression is being rerun each time: sampled latest runs executed one selected probe each (terminal-known-tail, microqr-finder, or source-base29-literal), with the other probe steps skipped. Continue selecting a narrow probe rather than the default `full` option.

## Research audit

I reviewed the current `results/README.md`, the integrated original-inversion challenge, the newest p57 GIMP/raster correction, the p32 route handoffs, the 19×19 circumference test, and the open Director-task queue.

- The authoritative synthesis and shared challenge continue to state plainly that no unknown LP2 plaintext, authentic key, complete cipher mechanism, or final destination has been recovered.
- The p57 574/241/331 arithmetic remains correctly downgraded: the GIMP rendering-field relationship is a serious confound, while exact prediction from the pre-Dissolve mask and its residual remain unresolved.
- The p32 compass/Möbius and 19×19 shell readings are presented as bounded, source-motivated hypotheses or finite tests, not established cipher instructions or plaintext.
- Recent source tests update existing reports rather than creating duplicate reader-facing accounts. The current synthesis does not require a factual correction from this audit.

No cryptanalytic claim is promoted or rejected by this message. Preserve the current distinction between source facts, conditional exclusions, hypotheses, and authentic unknown plaintext.
