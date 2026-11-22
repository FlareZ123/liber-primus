# p32 central 3×3 as a nine-chapter key and word map: bounded original-cipher gate

**Agent 28, 13 November 2026. Classification: bounded negative; no unknown LP2 plaintext, authentic key, cipher mechanism, or destination recovered.**

## Source-constrained reason to test it

The solved p57 *PARABLE* contains instruction-like language about shedding circumferences and finding what is within. Separately, the signed 2016 Cicada message points toward the manuscript's words as a map and their numbers as directions. These are genuine source cues, but neither specifies an exact cipher operation.

The p32 page is an 11×11 GP29 rune grid. Taking its central 3×3 in row-major order gives:

\[
\begin{bmatrix}
20&24&7\\
2&7&14\\
14&24&1
\end{bmatrix}
\]

Its rune transliteration is \`LAWTHWXXAU\`; its GP prime weights are:

\[
\begin{bmatrix}
73&97&19\\
5&19&47\\
47&97&3
\end{bmatrix}
\]

The central cell is GP ordinal 7, prime weight 19. The original-image chapter map independently divides unknown pages 0–55 into nine top-level visual chapters. This motivates two narrow interpretations: the nine central values may provide one key value per chapter, or the prime values may address one word in each chapter.

**Strongest objection:** “shed circumferences” does not specify that the stopping point is a 3×3 square rather than another concentric layer or the single center cell. Nine visual chapters do not prove a nine-symbol key schedule. The 2016 message does not explicitly say that p32's central values index chapter words. These are hypotheses selected for cheap, falsifiable tests—not established authorial instructions.

## Frozen inputs and segmentation

- Original p32 rune indices from \`resources/liber-primus/lp2-corpus.json\`; 121 cells, row-major 11×11.
- Central 3×3 values and prime weights are asserted exactly in the SFT.
- Original-image visual chapter groups: p0–2, p3–7, p8–14, p15–22, p23–26, p27–32, p33–39, p40–53, p54–55.
- Original chapter rune lengths: **729, 1,145, 1,729, 1,903, 1,021, 1,433, 1,680, 3,008, 308**.
- Canonical transcription: \`resources/transcriptions/liber_primus_master.txt\`, tokenized using the repository's documented \`[-.&$§]\` rune-word delimiter. Page breaks are not forced word breaks; page text is rejoined within each visual chapter before tokenization. Every original rune page is checked against the corpus.
- The resulting chapter word counts are **158, 255, 383, 437, 224, 326, 378, 669, 66**, totaling the established **2,896** unknown-LP2 rune words. Numeric p50 contributes no rune words.
- Language scoring: pinned Duko Round27 English quadgrams (79,495 entries; 7,266,795 total observations), with n-grams scored independently inside each chapter.

## Fixed cipher tests

Sixteen reversible additive interpretations were tested, without fitted offsets or key search:

1. **One constant Caesar shift per visual chapter:** central 3×3 GP ordinals or prime weights reduced modulo 29; both signs.
2. **One global Caesar shift:** central cell ordinal 7 or prime weight 19; both signs.
3. **Repeating nine-symbol key:** central 3×3 ordinals or prime weights reduced modulo 29; both signs, with either continuous phase across the manuscript or phase reset at each visual chapter.

Each inverse was forward-replayed to the exact original ciphertext. Forty-eight planted positive round trips cover the key values, signs, and phase models.

The word-address test uses the nine prime weights as **one-based word indices**, one within each corresponding visual chapter. The nine GP ordinals are tested as a direct one-based-index control. No modulo, offset, or search over positions is used.

## Results

Legacy inventory-label baseline: IoC **0.03447840**, mean Duko English quadgram score **−7.43913779**. Solved p57 PARABLE positive control: **−4.42063342**. Under this legacy score, every tested inverse is worse than raw ciphertext; the best is the global ordinal center-cell addition at **−7.44752535**.

A source-calibrated LP1 model is now also applied. It uses the independently source-validated spelling ᛝ→ING and ᛡ→IO, with 3,510 training GP symbols; its training score is **−2.26072801** and the solved 95-rune p57 control scores **−2.46814471**. Raw unknown LP2 scores **−3.41753406**. The 16 fixed direct interpretations have these source-native score ranges:

| Direct interpretation | Source-native LP1 trigram range |
|---|---:|
| One constant shift per chapter | −3.41475341 to −3.42105306 |
| One global center-cell shift | −3.41339607 to −3.42067253 |
| Repeating nine-symbol key | −3.41152704 to −3.41989464 |

The best fixed candidate is the prime-residue repeating key with chapter-reset phase and subtraction, **−3.41152704**, only **0.00600702** above raw ciphertext. This small gain does not approach the solved p57 control and does not yield readable text. The source-native calibration changes some displayed spellings but not the numeric operations.

The central 3×3's legacy transliteration is LAWTHWXXAU; its source-native spelling is identical. The one-based chapter word selections are:

| Chapter | Prime-weight index | Legacy spelling | Source-native spelling | Ordinal index | Legacy spelling | Source-native spelling |
|---:|---:|---|---|---:|---|---|
| 1 | 73 | OECBLJ | OECBLJ | 20 | YFNGCJ | YFINGCJ |
| 2 | 97 | OPM | OPM | 24 | EODEO | EODEO |
| 3 | 19 | YLXL | YLXL | 7 | NGITO | INGITO |
| 4 | 5 | BNTFNG | BNTFING | 2 | AEAYOEA | AEAYOEA |
| 5 | 19 | GLJ | GLJ | 7 | WHI | WHI |
| 6 | 47 | DOEDA | DOEDA | 14 | MFIAEACBGAEF | MFIOEACBGAEF |
| 7 | 47 | NGJ | INGJ | 14 | OUNWML | OUNWML |
| 8 | 97 | IAEOCFBPM | IOEOCFBPM | 24 | ETAJCY | ETAJCY |
| 9 | 3 | IADPNGUWAM | IODPINGUWAM | 1 | A | A |

Neither extraction forms a readable nine-word message under either spelling. The 48 planted round trips pass, confirming that the negative result is not an implementation-direction error.

## Decision

Retire the tested direct uses of the p32 central 3×3 as (a) one per-chapter Caesar key, (b) a global center-cell Caesar key, (c) a repeating nine-symbol additive key, or (d) one-based word addresses in the nine visual chapters. The source-native LP1 model changes some transliterations and yields tiny score gains for a few fixed variants, but no readable plaintext or material language-model improvement.

This does **not** invalidate the p32 11×11 / 2016-image geometric relationships, the central values themselves, or other source-selected uses not tested here. Do not rescue these exact hypotheses with arbitrary offsets, alternate phases, or word-index tuning. A successor needs a separate original clue selecting a different operation.

**Reproduction:** \`sims/p32_center3x3_nine_chapter_gate_sft.cjs\`. The SFT asserts the original p32 values, canonical 12,956-rune / 2,896-word contract, nine chapter boundaries, all 16 original-cipher inverses, exact forward replay, the pinned language model, and all 48 planted positive controls. No change to \`results/README.md\` is warranted.

## Existing source anchors

- \`resources/transcriptions/README.md\` and \`sims/wordlength_crib_scan.js\` — canonical word delimiters and page-break contract.
- \`resources/transcriptions/liber_primus_master.txt\` — canonical rune transcription.
- \`resources/historical/cicada2016-4gq25-outguess.asc\` — signed 2016 map/road/direction statement.
- \`im-results/lp2-global-original-visual-section-map.md\` — nine original-image visual chapters.
- \`im-results/tree-prime-canvas-partition.md\` — p32 11×11 / 2016 image geometry and its evidential limits.
- \`im-results/lp2-p32-inner9-p33-body81-source-transfer.md\` and \`im-results/p32-ring1136-signed2016-center75-p55-gate.md\` — distinct prior inner-grid and ring investigations; this test is not a repeat of their 9×9 matrix or ring-to-p55 transfer.
