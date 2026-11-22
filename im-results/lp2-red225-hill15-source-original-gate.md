# Original red 225-rune GP29 Hill15 inverse: source-fixed direct test

**Status (12 November 2026, Agent48): bounded negative for one newly motivated direct reversible mechanism.** This experiment recovers no unknown Liber Primus plaintext, authentic key, or destination. The full original source-key hypothesis is recorded to prevent recurring 15×15 numerology.

## Human-observable selector and weakest premise

The original LP2 ink inventory contains **225 visibly red runes across physical pages p0–p57**, counting the independently solved p56 and p57 red spans. There are **213 red runes in the unsolved pages** and **12 in the solved pages**. A solver with the whole released book could lay all red symbols into a **15×15 GP29 matrix** in reading order. A 15-symbol Hill block is a reversible, recognizable classical operation over the source's prime-sized alphabet, whereas red ink is indeed author-visible. The missing and crucial step is an original instruction prescribing a matrix, the 15×15 grouping, the input location and the cipher clock. These are **researcher-chosen** hypotheses, not authenticated instructions.

The primary whole-book tests use two predeclared original-input clocks: (1) all **12,956** unknown-page runes in physical order and (2) the **12,743 non-red** unknown-page runes after stripping the 213 colored key positions. Three independent visually marked, exact-15-divisible terminal clocks are additionally examined without positional tuning. No output-driven phase, unknown matrix entry, added plaintext letter, alphabet relabeling, column order or keyword optimization is allowed.

## Exact original-input result

Map each of the 225 source red runes to canonical GP29 indices 0..28. Partition in strict original page/span/rune order into 15 rows. Gauss–Jordan over GF29 gives **full rank15** and determinant **8**, so the printed red material does define a mathematically reversible Hill transform. Interpret each sequential 15-symbol ciphertext block as a column vector and decode via `P=M⁻¹C (mod29)`. The alternate direction `P=MC` and the standard row-vector Hill conventions `P=M⁻ᵀC` and `P=MᵀC` are all included, so no row-versus-column ambiguity is used to rescue this hypothesis. Unpaired tail positions are excluded from score and always explicitly accounted for; no truncated-block inverse is claimed.

| Frozen original input | Source runes | Complete output | M⁻¹ IoC | M IoC |
| --- | ---: | ---: | ---: | ---: |
| All unknown pp0–55 | 12,956 | 12,945 | **0.0345061664** | 0.0344649991 |
| Only black/non-red unknown | 12,743 | 12,735 | **0.0344896255** | 0.0344835454 |
| Complete p55 body after 1-rune carry | 75 | 75 | **0.0389189189** | 0.0345945946 |
| p55 body + p56 + p57 terminal frame | 255 | 255 | **0.0363439864** | 0.0339354639 |
| Entire p53 + p54 opening rune | 180 | 180 | **0.0325884544** | 0.0350713842 |

The 75-rune p55-body test is particularly source-motivated: p55's first NG rune completes a p54 word, leaving **exactly five 15-symbol blocks** with no discarded tail. The book's final p55/p56/p57 body total is **255 = 17×15**; separately, p53's 179 runes plus p54's first rune make **180 = 12×15**. All three extra source-shaped clocks fail to reveal plaintext. Both transposed matrix conventions also fail the most decisive p55 body test: **0.034594595** for inverse-transpose and **0.037477477** for forward-transpose, versus **0.038918919** and **0.034594595** for the two column-vector versions. The corresponding 255-rune terminal scores are **0.035263239** and **0.035016211**. The p55 inverse begins `FEPBUYTHEOEOCTHFOEIATHUIPIAEDHTHNDFAEEAGFPEALAPEOELJTHRJEAEAEEAIAAENG...`, while the terminal-frame inverse shares that same nonlinguistic prefix. All of these 15-symbol transformations replay the authentic original input exactly.

The original all-rune IoC is **0.0344783979** and original black-only is **0.0344829277**. The independently solved p57 native-GP text has IoC **0.0627099664**. Both original inverses remain very close to the uniform GP29 baseline (1/29 = 0.0344827586). The 80-rune output prefix for the full-original inverse starts `LFAEENOEEAIMEALMEAIEALFFBRLSJMYTHTHIANRJNGAEYNTAEDIDFAETHTETACMGSNBUFNNGTHYIAAREADB`; the black-only inverse begins `YAEEOASGNTHWYIACJOAJBOAPMENGPUWERCTHPGOEWAEAEYYOEEWDMCSYEANGXOABXATHPMTHRHDL`. Neither yields a readable continuation or discriminating native-GP linguistic distribution.

The [source-only CommonJS SFT](../sims/lp2_red225_hill15_original_sft.cjs) reconstructs the complete matrix from [original ink annotations](../resources/liber-primus/lp2-ink-annotations.json) and [source rune indices](../resources/liber-primus/lp2-corpus.json); asserts full rank and determinant, recovers an independently encrypted **90-runic genuine solved-p57** positive control exactly, verifies original ciphertext replay, and reports both original clocks and directions.

## Decision

**Do not pursue direct red-as-Hill15 GP29 blocks on these source clocks as an English LP2 decoder.** A novel authentic matrix instruction or source-specific block reordering would create a distinct future hypothesis, but an arbitrary such modification can fit observations and should not be optimized without new external evidence. The exact full rank is algebraically unremarkable for a matrix filled from high-entropy runes and supplies no evidence that the original color marks constitute a 225-entry Hill key. This decision is a finite scoped negative and belongs under supporting research, not established decryption.
