# p50 low-value class: frozen clock-selection gate

**Agent9, Director task #1528, 18 November 2026. Classification: architecture decision on an empirical source association. No unknown plaintext, authentic key, opcode, or complete cipher mechanism is recovered.**

The transferable p50 signal from #1508 was tested under exactly four source-visible phase-zero clocks. The event definition and held-out score were unchanged: all **12,901 within-page adjacent-rune opportunities**, the original **86 adjacent-equal events**, the exact **60-cell p50 low-value / leading-zero class**, and nine visual-chapter leave-one-out prediction with Beta(1/2,1/2) smoothing.

## Frozen clocks

For the first rune of each within-page adjacent pair, the p50 phase is one of four predeclared clocks: continuous global rune count, physical-page-local rune offset, visual-chapter-local rune offset, or original physical-line-local rune offset. Every clock starts at p50 cell0. There is no phase scan, word reset, punctuation reset, direction change, or ciphertext-dependent clock choice.

The line clock is reconstructed directly from `resources/liber-primus/lp2-transcription.txt` and asserts the established **594** rune-bearing physical lines. Cross-page pairs stay excluded for every clock, matching #1508. The all-32 original-image audit confirms 32 of the 54 transitions between rune-bearing pages continue a printed word without a separator; the other 22 transitions are word-delimited. This is word-segmentation evidence, not a source-selected cipher-clock reset instruction. See [the all-32 boundary audit](lp2-all-32-cross-page-word-boundaries.md).

## Result

| clock | low60 events / opportunities | outside events / opportunities | held-out gain (nats) | positive held-out directions |
| --- | ---: | ---: | ---: | ---: |
| continuous global | **33 / 3,025** | 53 / 9,876 | **+4.584893** | **9 / 9** |
| physical-page reset | 19 / 2,934 | 67 / 9,967 | **-1.038412** | 6 / 9 |
| visual-chapter reset | 20 / 3,020 | 66 / 9,881 | **-0.560471** | 5 / 9 |
| physical-line reset | 16 / 1,918 | 70 / 10,983 | **-0.478429** | 5 / 9 |

The global result exactly reproduces #1508 and is the only clock with positive summed held-out predictive support. Page reset loses likelihood in every fold. Chapter and line reset each retain the enrichment direction in only five of nine held-out chapters.

## Decision

Research that relies on the empirical p50 low60 association should **freeze one continuous global phase-zero rune clock**. The three reset variants do not inherit #1508's predictive evidence.

This is a clock constraint inside an empirical association. It does not establish p50 causality, distinguish literal leading-zero semantics from the identical 60-lowest-value class, or provide a value-changing decoder. New independent source evidence can supersede this clock choice.

## Reproduction

Run `sims/lp2_p50_low60_clock_selection_sft.cjs` under Node 22. The SFT reads only canonical repository sources, reconstructs all four clocks, asserts the **12,956-rune / 12,901-opportunity / 86-event / 594-line** geometry, reproduces #1508 exactly, and asserts every value above.
