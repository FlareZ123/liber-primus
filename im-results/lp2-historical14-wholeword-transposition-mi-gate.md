# Historical 14-column whole-word transposition does not restore LP2 word-length grammar

**Classification:** original-source, bounded negative. **No recovered unknown plaintext, authentic key, or selected LP2 cipher.** Agent35, 17 November 2026. Reproducer: [standalone Node22 CommonJS SFT](../sims/lp2_historical14_wordorder_mi_sft.cjs). Reference independent source discriminator: [Agent48 word-length MI](lp2-printed-wordlength-conditional-independence-original-gate.md). The older [14-column rune/space plus p56-totient tests](historical-14column-totient-composition.md) moved individual symbols; this experiment instead preserves every source printed word intact and moves complete words.

## Why try this particular permutation?

The authentic 2014 Cicada 14-column operation used the source-established zero-based column order **[2,8,9,1,12,13,11,4,5,7,3,0,6,10]**. Independently, the 2,896 printed-word lengths of unknown LP2 have almost no adjacent English-like dependence (original MI 0.02031044; within-chapter permutation mean 0.02194119), whereas authentic solved LP1 and 256 independent native English control windows exhibit such dependence. A word-level transposition is a simple candidate architecture that explains why a value-changing cipher alone would fail that invariant. The word-level application itself is a hypothesis, not historical evidence about LP2.

## Frozen original-input test

Sources: unchanged resources/liber-primus/lp2-transcription.txt and lp2-corpus.json, all **12,956** unknown GP runes divided into **2,896** physical printed words (line/page continuation preserved). Nine authentic chapter word counts are **[158,255,383,437,224,326,378,669,66]**. The original source uses hyphens, dots and ampersands to terminate words; slashes and percent signs denote line/page changes and do not terminate words. The SFT asserts these counts.

The experiment applied the historical fourteen-column order, without fitting it to original data, to complete word tokens. The four arrangements are (1) column-major reading of the row-major width14 ragged grid, (2) its exact inverse, (3) permuting each consecutive 14-word row, and (4) its exact inverse. These four were applied with independent resets at the nine source-visible chapters or with one manuscript-wide clock: **eight distinct predeclared permutations**, plus unchanged baseline. A short final row is never padded. Both forward/inverse pairs recover source word-length sequences exactly on every chapter, establishing algorithmic reversibility.

The discriminator is the same 12-class adjacent word-length mutual information (natural logarithm) as Agent48, preserving the original nine chapter boundaries for scoring. For multiple-choice calibration, 600 independent deterministic source-chapter Fisher-Yates shuffles with seed **0x330114** were each evaluated through **all nine** modes; their maximum MI forms the experiment-wide null. No subsequent adjustment of the historical permutation, column count, order, reset, or phase was selected.

| Predeclared word-order interpretation | MI, original unknown LP2 |
| --- | ---: |
| Original unchanged printed order | 0.0203104436 |
| Global 14-column forward | **0.0222919947** |
| Chapter-local 14-column forward | 0.0216731466 |
| Chapter-local 14-word-block inverse | 0.0215435396 |
| Chapter-local 14-word-block forward | 0.0213826246 |
| Global 14-column inverse | 0.0213463006 |
| Global 14-word-block forward | 0.0207349462 |
| Chapter-local 14-column inverse | 0.0199365715 |
| Global 14-word-block inverse | 0.0162908316 |

**Max-over-nine shuffled control:** mean **0.0258819865**, 2.5th percentile **0.0228466064**, median **0.0257399684**, 97.5th percentile **0.0299149046**, empirical upper-tail probability for the best original mode **0.9916805324** (=596/601). The best fixed transformation lies below the 2.5th percentile of the familywise shuffle maximum; there is no detectable recovery of original English-like word-length adjacency. Agent48's 128 Shakespeare original-length contiguous native English controls had minimum MI **0.02734778**, also above every historical14 result here, though language style and editorial processes can vary.

## Research decision and boundaries

**Retire direct whole-word applications of this exact historical width14 column order with only chapter-wide or manuscript-wide reset and no new key.** The result disfavors a simple historically copied whole-word transpose as the sole explanation of the printed word-length independence. It does **not** exclude other word permutation keys, word-boundary encryption, runic transpositions, changes of text source/language, or word-level operations with source-evidenced additional state. The authentic 2014 operation was a columnar transposition of a different register, so a poor whole-word transfer cannot refute its historical use.

An independent source-visible permutation selector plus a held-out word-length/language restoration is required before applying speculative post-transposition letter ciphers. Large heuristic searches over fitted word permutations without such a selector would revisit the same unsupported premise.

**Computation evidence:** The original loaded corpus was analyzed by pure JavaScript V8, source assertions and inverse checks passed. A GitHub Windows22 manual SFT run was dispatched separately; until a completed run has been inspected, its outcome is **not claimed**.
