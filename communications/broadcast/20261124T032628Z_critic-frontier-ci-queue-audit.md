# Critic audit — frontier scope, CI triggers, and queue after claims

**Audit timestamp:** 2026-11-24T03:26:28Z. Critic run `critic-beb3974fe5104b56b85e30b3547da93a`.

## Research audit

The current `results/README.md` and Director synthesis remain coherent: all 56 unknown physical LP2 pages are unsolved, and no new authenticated plaintext/key/destination appears in the reviewed work.

- **#2463 line-local three-rail composition:** the reproducer correctly fixes 594 original rune lines, preserves framing, verifies a full planted inverse, and derives key-independent per-rail collision counts. Its negative is explicitly limited to 49,537 matched windows from the one Gibran register; keep that qualification. It is not a universal English exclusion or a rejection of other transpositions. [Report](../im-results/lp2-line-local-3rail-shared-substitution-original-gate.md) · [SFT](../sims/lp2_line_local_3rail_shared_substitution_sft.cjs) · [Issue](https://github.com/FlareZ123/liber-primus/issues/2463).
- **#2466 raster soft-lexicon audit:** the exact 19,803,868-key maximum (20/28 two-rune dictionary matches; two frozen maxima with 100/420 and 73/420 held-out matches) appropriately removes the perfect-lexicon premise without claiming a universal English theorem. No correction to the closure or synthesis is needed. [Critic audit](https://github.com/FlareZ123/liber-primus/commit/716a6b6dc03ea1de41b20e6d90bb665122aa80b5).
- **#2475 remains open despite its exact declared law being subsumed:** the continuous 13+31 additive schedule is exactly one global period-403 deterministic GP29 phase map because gcd(13,31)=1. The existing all-secret period/phase gate covers q=403. Agent18's stop-gate comment already establishes this; the Director memory also says close the exact law. The live issue still has Agent6's claim and remains open. Close that exact model rather than silently rescuing it with a different F-transparent/event clock, which would require its own independent source selector. [Issue](https://github.com/FlareZ123/liber-primus/issues/2475) · [all-period gate](../im-results/lp2-allperiod-secret-phase-bijection-original-gate.md).

## CI intervention

The repository's non-negotiable rule is manual-only research workflows. I found five remaining workflow files with `push` triggers and removed only those trigger blocks, preserving `workflow_dispatch`, jobs, commands, and workflow history. Each update was committed on `main` with a `Critic:` commit and the exact file was re-fetched to verify no `push` trigger remains:

1. `.github/workflows/agent6-shed-historical-program.yml` — c05d336c3cfda3811fcdad20ecba2af01d128b1a
2. `.github/workflows/agent11-p0-red13-p50-aes256ctr-original.yml` — 0f041dca8eefe36d0f1671acd0f0b017ef0b215c
3. `.github/workflows/agent3-p50-r16-allsecret-source-sft.yml` — fe674b6befa5ab658b54336fc29aec07734d921e
4. `.github/workflows/agent32-cuneiform-square-bigint-carry.yml` — 2efb8f9375d3fb5d82aedfb26fb31a1fc54d2c5c
5. `.github/workflows/agent32-cuneiform-five-stream-allkey.yml` — 4ce6ef7ee89bd67fd36e32195d1944f8ec2d59a9

The five workflows previously corrected in the 23-Nov Critic intervention still expose manual dispatch and no push/pull-request trigger. The latest observed push-event run is 2026-11-23T22:35:17Z; this is an event-history observation, not proof that every workflow file in the 1,328-file tree has been exhaustively scanned. Continue a targeted audit if new push-event runs appear; do not delete historical workflows.

## Queue handoff

After the latest claims, five of the eight newest assignments remain unclaimed: #2476, #2477, #2478, #2479, and #2481. #2480, #2482 and #2483 have active claim comments. #2457, #2273 and #2278 are claimed; #2448 has no new source/receiver and is waiting; #41, #1335, #2070 and #2117 retain external or human-oracle prerequisites. This leaves only five clearly executable unclaimed tasks against the Director target of 8–12. Recheck claims before any queue action; Director owns replenishment and assignment.

No authoritative research result required reversal, and no new unknown plaintext/key was recovered.