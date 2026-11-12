# P53 red passage as the fixed key for the final unknown visual chapter

**Status:** original-input finite negative; no plaintext, authentic key, or historical cipher identified. [Source-fixed executable SFT](../sims/lp2_p53_red51_to_p54_55_chapter_sft.cjs).

## Why this test is a distinct plausible source operation

Original LP2 physical **p53**, scan \`70.jpg\`, ends with **51 consecutive red runes** at local GP29 offsets **128–178**, followed by the large red 13-dot end marker. The immediately following page **p54**, scan \`71.jpg\`, begins with a separate red nine-rune heading. The resulting visible final unknown chapter is precisely **p54–55, 308 runes** (232+76), independent of the older derivative text-section cuts. The floral-border artwork is unchanged across the cut. Hence the p53 red tail is an independently visible, immediately preceding finite text source which could serve as a key for the new chapter.

The red passage's GP-prime sum is **2262 = 29 × 78**; that equality supplies a checksum on its source transcription but no instruction that it is a key. The intended operation is therefore still a hypothesis. This test avoids fitting a period, offset, key value, start page, or reset from the target ciphertext.

The previously documented [p53 red51 → p55 17-segment triplet](p53-red51-p55-17segment-triplet-gate.md) applies **three red runes to each of seventeen p55 text segments** and excludes p54. The present test is a distinct, simpler **period-51 chapter-continuous additive interpretation**, beginning at the visibly selected p54 opening. It tests all **308** glyphs including the p54→p55 physical page turn inside a word.

## Frozen map and result

Let \`R[0..50]\` be the exact 51 original p53 red GP glyphs, \`C[i]\` the 308 original p54→p55 glyph indices, and \`p[x]\` the original GP prime weight of rune index \`x\`. The two directly source-standard key readings are \`K[j] = R[j]\` (GP ordinal) and \`K[j] = p[R[j]] mod 29\` (GP prime residue). For both directions, with **no free key phase**, decode

\`P[i] = (C[i] ± K[i mod 51]) mod 29\`, with \`i=0\` at **p54 local0**.

The p54→p55 clock is **continuous**; there is no page restart or target-dependent F-skip. These four cases exhaust the declared test, without sweeping key offsets or additional transformations. IoC is the ordinary within-stream \`sum(n_r(n_r−1))/(N(N−1))\`.

| Fixed map | Sign | 308-rune IoC | p54 IoC | p55 IoC |
| --- | --- | ---: | ---: | ---: |
| Original untransformed | — | 0.03382123 | — | — |
| GP ordinal red key | subtract | 0.03373662 | 0.03299000 | 0.02912281 |
| GP ordinal red key | add | 0.03352511 | 0.03496791 | 0.03157895 |
| GP prime-residue red key | subtract | 0.03409620 | 0.03425884 | 0.03649123 |
| GP prime-residue red key | add | 0.03494226 | 0.03448276 | 0.03754386 |

All four whole-chapter distributions remain close to the 29-way uniform IoC **0.03448276**, and the decoded starts contain no readable GP-English passage. Neither p54 nor p55 produces coherent text under this fixed map. The maximum whole-chapter gain over raw is **0.00112103**, far below the strong natural-language concentration required to claim a simple GP-English decryption. A fully invertible wrong-key map also re-encrypts exactly; round trips here establish implementation correctness, not key authenticity.

**Reproducer:** [single-file CommonJS test](../sims/lp2_p53_red51_to_p54_55_chapter_sft.cjs) loads the canonical original 58-page GP29 corpus and ink-annotation records, asserts the p53 source runes match source transcription at local128–178, checks its prime sum 2262, asserts both target page lengths, outputs all four original-input scores and 40-rune literal candidate prefixes, exactly reciphers all four outputs, and verifies a known GP29-English planted source sentence under both fixed key representations. No additional corpus, downloaded bytes or workflow is required.

## Research decision

The p53-to-p54 visible handoff supplies a human-motivated **candidate key location**, but **direct period-51 additive transfer is original-negative** under the two independently authenticated GP numeric encodings, phase0 and continuous-chapter clock. This rejects just those four complete-position inverses. It does not rule out that the red passage is itself encoded, serves as a book-coordinate instruction, or has a completely different consumer. The source does not prescribe such a further operation, so do not enlarge this test into unmotivated phase/salt/skip sweeps. Seek an independently authentic instruction that selects a key transformation or consumer before assigning more compute.

**Input anchors:** [original physical chapter segmentation](lp2-global-original-visual-section-map.md), [canonical LP2 images](../resources/liber-primus/README.md), [annotated ink](../resources/liber-primus/lp2-ink-annotations.json), [GP29 rune and prime indices](../resources/liber-primus/lp2-corpus.json).
