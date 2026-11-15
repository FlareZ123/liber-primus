# Independent Liber Primus research index: Dukotah/cicada3301

**Snapshot inspected:** 2026-11-15T00:45:02.913Z. Repository HEAD: `9087dc36b5aa64c1786428e32180261ab9420c29` (2026-11-12T05:54:21Z).  
**Source:** https://github.com/Dukotah/cicada3301  
**License:** MIT covers the repository's original code and documentation; the license explicitly does not purport to license the underlying Cicada artifacts reproduced for research. No code was copied here.

This is a large, actively maintained research programme with a versioned falsification ledger, a planted-key decoder/benchmark, a measured-coverage ceiling, and a human-oracle rule. Its Round 44 closeout reports no LP2 solution. Treat its conclusions as independent research evidence, not as an authoritative replacement for this repository's own corpus or synthesis.

## Round 44 findings relevant here

- **T7 — non-stationary anti-repeat slip rate.** Across 13 consecutive 1,000-rune blocks, the reported doublet counts are `[8,3,7,2,6,9,10,8,11,2,9,6,5]`; gap autocorrelation is +0.380, battery p=0.0010, and an independent permutation null gives p=0.00025. The authors classify this as measured, not certified. This independently matches the current repository's Agent44 page-conditioned doublet work; it is corroboration, not a new lead. See `im-results/lp2-doublet-block-marginal-control.md` and the Agent44 broadcast.
- **R1 — page/line/section key resets on the p27/p54 boundary-crossing 7-gram.** The external lane tests 51 fixed source-derived keys, 30 offsets, six configurations, three reset modes, and 55 rune-bearing pages (about 1.5 million cells). It reports zero crossers. Its same-plaintext 7-gram constraint excludes every swept key at offsets up to 200; the different-plaintext interpretation remains open. This is broader than the current repository's simple p27/p55 periodic-key gate and is a useful independent negative. It does not exclude reset mechanisms outside those 51 keys/configurations.
- **p27:93 glyph adjudication.** The external audit resolves the glyph as U, agreeing with the current canon. A competing B label came from one mislabelled singleton exemplar caused by a merged C+B glyph on p13. No canon change was made. This is a useful source-side cross-check, not plaintext recovery.
- **p50 256-byte payload.** The external resolved `canon_256.hex` is byte-for-byte identical across all 256 bytes to this repository's `resources/liber-primus/lp2-grid-256.json`. The current p50 table therefore already contains the external three-byte resolution; no re-transcription is needed.
- **JPEG DQT split.** The two page groups differ by grayscale (one SOF component) versus color/YCbCr (three components), while sharing an identical Annex-K luma table at Q=92. Ink-coverage complexity is indistinguishable (MW p=0.338). The authors classify this as a benign production-pipeline signal with zero ciphertext bearing.

The Round 44 closeout also reports negative results for red-ink, p15 grid, punctuation/quote channels, onion-blob pads, 7-gram cipher readings, chained presentation, hash stride, cuneiform census, all-pairs page-XOR, delta composites (k\ge7), short-page language screens, homophonic screens, and audio reductions. Some overlap current work; check the live ledger before repeating any lane.

## Measured ceiling and remaining gaps

The external `MEASURED-CEILING.md` explicitly limits its claims to tested key spaces, decoder relations, and language registers. It lists, among other gaps, skip-by-4/5 and combined reset axes; the Marsaglia Random Number CDROM public-pad family (77 of 756 pad/builder/byte-order units swept); homophonic-downward mapping; non-additive ciphertext-feedback beyond a three-page pilot; per-instance O/A/AE calls; and original-PDF kerning/subpixel/colour channels. These are **unmeasured or partial**, not evidence that they are promising. Some ceiling prose predates later rounds, so prefer the latest `PICKUP-HERE.md` and live ledger when resolving status.

## Recommended use

- Do not repeat the already replicated T7 block-count test.
- If revisiting the p27/p54 7-gram, do not repeat the 51-key reset family; require a new source-selected key or operation.
- Reuse the p50 byte-for-byte cross-check and p27:93 adjudication rather than reopening those transcription questions.
- Treat the remaining measured-ceiling gaps as a map of coverage, not a task list. Select work only where an original clue supplies the missing key, operation, or observable prediction.

## Primary external references

- Repository overview: https://github.com/Dukotah/cicada3301
- Current handoff: https://github.com/Dukotah/cicada3301/blob/master/liber-primus/PICKUP-HERE.md
- Measured ceiling: https://github.com/Dukotah/cicada3301/blob/master/liber-primus/MEASURED-CEILING.md
- Round 44 campaign plan: https://github.com/Dukotah/cicada3301/blob/master/liber-primus/analysis/round44/CAMPAIGN-PLAN.md
- R1 reset results: https://github.com/Dukotah/cicada3301/blob/master/liber-primus/analysis/round44/R1-key-resets/RESULTS.md
- p27:93 adjudication: https://github.com/Dukotah/cicada3301/blob/master/liber-primus/analysis/round33/B2-lp1-audit/p27_93.md
- DQT mechanism clarification: https://github.com/Dukotah/cicada3301/blob/master/archive/branches-2026/research_round-11-dqt-matrix-disambiguation/research/experiments/r11-01-dqt-matrix-disambiguation/EXECUTION-NOTE.md
- Resolved p50 payload: https://github.com/Dukotah/cicada3301/blob/master/liber-primus/analysis/round34/P1-payload-promotion/inputs/resolved/canon_256.hex
