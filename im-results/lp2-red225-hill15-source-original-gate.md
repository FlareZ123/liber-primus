# Original red 225-rune GP29 Hill15 inverse: source-fixed direct test

**Status (12 November 2026, Agent48): bounded negative for one newly motivated direct reversible mechanism.** This experiment recovers no unknown Liber Primus plaintext, authentic key, or destination. The full original source-key hypothesis is recorded to prevent recurring 15×15 numerology.

## Human-observable selector and weakest premise

The original LP2 ink inventory contains **225 visibly red runes across physical pages p0–p57**, counting the independently solved p56 and p57 red spans. There are **213 red runes in the unsolved pages** and **12 in the solved pages**. A solver with the whole released book could lay all red symbols into a **15×15 GP29 matrix** in reading order. A 15-symbol Hill block is a reversible, recognizable classical operation over the source's prime-sized alphabet, whereas red ink is indeed author-visible. The missing and crucial step is an original instruction prescribing a matrix, the 15×15 grouping, the input location and the cipher clock. These are **researcher-chosen** hypotheses, not authenticated instructions.

The two predeclared original-input clocks are (1) all **12,956** unknown-page runes in physical order and (2) the **12,743 non-red** unknown-page runes after stripping the 213 colored key positions. No output-driven phase, unknown matrix entry, added plaintext letter, alphabet relabeling, column order or keyword optimization is allowed.

## Exact original-input result

Map each of the 225 source red runes to canonical GP29 indices 0..28. Partition in strict original page/span/rune order into 15 rows. Gauss–Jordan over GF29 gives **full rank15** and determinant **8**, so the printed red material does define a mathematically reversible Hill transform. Interpret each sequential 15-symbol ciphertext block as a column vector and decode via `P=M⁻¹C (mod29)`. A second deliberate alternative evaluates the direction `P=MC`. Unpaired tail positions are excluded from score and always explicitly accounted for; no truncated-block inverse is claimed.

| Frozen original input | Source runes | Complete output | M⁻¹ IoC | M IoC |
| --- | ---: | ---: | ---: | ---: |
| All unknown pp0–55 | 12,956 | 12,945 | **0.0345061664** | 0.0344649991 |
| Only black/non-red unknown | 12,743 | 12,735 | **0.0344896255** | 0.0344835454 |

The original all-rune IoC is **0.0344783979** and original black-only is **0.0344829277**. The independently solved p57 native-GP text has IoC **0.0627099664**. Both original inverses remain very close to the uniform GP29 baseline (1/29 = 0.0344827586). The 80-rune output prefix for the full-original inverse starts `LFAEENOEEAIMEALMEAIEALFFBRLSJMYTHTHIANRJNGAEYNTAEDIDFAETHTETACMGSNBUFNNGTHYIAAREADB`; the black-only inverse begins `YAEEOASGNTHWYIACJOAJBOAPMENGPUWERCTHPGOEWAEAEYYOEEWDMCSYEANGXOABXATHPMTHRHDL`. Neither yields a readable continuation or discriminating native-GP linguistic distribution.

The [source-only CommonJS SFT](../sims/lp2_red225_hill15_original_sft.cjs) reconstructs the complete matrix from [original ink annotations](../resources/liber-primus/lp2-ink-annotations.json) and [source rune indices](../resources/liber-primus/lp2-corpus.json); asserts full rank and determinant, recovers an independently encrypted **90-runic genuine solved-p57** positive control exactly, verifies original ciphertext replay, and reports both original clocks and directions.

## Decision

**Do not pursue direct red-as-Hill15 GP29 blocks on these source clocks as an English LP2 decoder.** A novel authentic matrix instruction or source-specific block reordering would create a distinct future hypothesis, but an arbitrary such modification can fit observations and should not be optimized without new external evidence. The exact full rank is algebraically unremarkable for a matrix filled from high-entropy runes and supplies no evidence that the original color marks constitute a 225-entry Hill key. This decision is a finite scoped negative and belongs under supporting research, not established decryption.
