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

## Distinct primary-artifact cross-checks (15 November audit)

- **Three authentic signed January 2014 hexadecimal blocks.** The external Round 44 [B1 original-byte study](https://github.com/Dukotah/cicada3301/blob/9087dc36b5aa64c1786428e32180261ab9420c29/liber-primus/analysis/round44/W2-B1-hash-stride/RESULTS.md) identifies *three separate* 991-byte binary blocks under 7A35090F-signed .asc messages, with SHA-256 values `f8fa59ec133168d8aaf9c67d13152286eebcec191c5668f7f143a2c7764fc530`, `6600c94b199f30c70c58f5800ccf80537b335122bd66768b6049241d8b20f318`, and `07d660d76e24dac92dc0350881ed7771263905a4a64f66c68f7f88ef77c9e07d`. Their signed armors are retained in the upstream [primary artifact tree](https://github.com/Dukotah/cicada3301/tree/9087dc36b5aa64c1786428e32180261ab9420c29/corpus/A-primary-artifacts/pgp/messages). A preregistered scan of 11,508 windows for MD5/SHA-1/SHA-256/SHA-512 digests of 354 extant source representations gave zero matches with two planted hits recovered. This **does not** rule out a hash oracle for as-yet-unrecovered plaintext. The observed `Hash: SHA1` armor line specifies the *PGP signature's digest algorithm*; it does not authenticate a SHA-1 list inside the hex body. No original page decodes or key can currently be claimed from these blocks. If genuine unknown plaintext is independently recovered, the three byte-pinned blocks give a pre-existing, fixed comparison object; avoid repeating the already-exhausted existing-ciphertext digest grid.
- **The Round 43 original onion-2 timing lane has been superseded locally on coverage.** Upstream [F5b-T](https://github.com/Dukotah/cicada3301/blob/9087dc36b5aa64c1786428e32180261ab9420c29/liber-primus/analysis/round43/F5bT-timing-keystream/RESULTS.md) merged 112 exact five-minute-multiple intervals at byte positions 143–256, leaving positions 190–191 bounded. Here `im-results/lp2-2014-onion2-timing-merged-114.json` and `im-results/onion2-five-minute-clock-inference.md` resolve **114/114** corresponding intervals using additional dated source evidence. The local original timing/byte key and two time-interleaving inverses have also produced scoped negatives; the external 112-event beam need not be copied or rerun. For a future timing operation, use the 114-event local evidence, remembering that no authored LP2 clock rule has been identified.
- **Cross-project numbering and red-channel compatibility.** Upstream's “55 unsolved canon pages” means 55 *rune-bearing* encrypted segments: the physical LP2 corpus has 56 unsolved pages p0–p55 because p50 contains only the 256-cell table. Its “canon p55 AN END” is our **physical p56** solved page. [Round 44 red-ink P1](https://github.com/Dukotah/cicada3301/blob/9087dc36b5aa64c1786428e32180261ab9420c29/liber-primus/analysis/round44/P1-red-ink/RESULTS.md) expands the old 187-rune red selection to **213 on the 13 unknown red-bearing pages** by including drop-caps, overlooked title and terminal red lines; our `im-results/lp2-red-ink-channel-audit.md` independently already recognizes the same 213 red runes and 30 red 13-/10-dot markings. These counts are compatible, with image indexing requiring the one-page offset. This closes a potential false “new red text” claim.

**Decision:** These are useful source and coverage reconciliations. The audited upstream material supplies no newly authenticated unknown-page plaintext, source-selected invertible key, or untested original-byte operation with an independently frozen ciphertext prediction. Reuse its exact signed blocks as a future keyed/plaintext validation object and pursue independent original-source selector discovery; there is no basis for a new broad enumeration.

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
- Primary PGP signature timeline (including the 2015-07-28 and 2016-01-01 signed statements): https://github.com/Dukotah/cicada3301/blob/master/corpus/A-primary-artifacts/SIGNATURE-TIMELINE.json
- Original 2015 signed statement: https://github.com/Dukotah/cicada3301/blob/master/corpus/A-primary-artifacts/pgp/messages/2015-07-planned-parenthood-denial.asc
- Original 2016 Liber Primus statement: https://github.com/Dukotah/cicada3301/blob/master/corpus/A-primary-artifacts/pgp/messages/2016-01-liber-primus.asc
