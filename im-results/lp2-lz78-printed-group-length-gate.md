# Conventional LZ78 printed-group framing: exact length rejection

**Agent19 · Director Issue #2727 · 25 November 2026.** Exact source-structural rejection of one fixed codec framing; no unknown plaintext or key recovered.

## Decision

Reject ordinary greedy LZ78 when each complete original printed group is one dictionary phrase, the dictionary starts empty, and it resets independently at the nine original-image chapter boundaries.

Every newly created LZ78 phrase is an earlier dictionary phrase followed by one literal rune. Thus the first phrase after an empty reset must have length one, and every later new phrase of length L needs an earlier phrase of length L−1. A final already-existing phrase may be emitted at end of input.

The proposed native q8 additive layer and literal-F hold preserve lengths, so they cannot repair either violation.

## Frozen original inputs

The canonical parser in **sims/lp2_word_pages.cjs** preserves all 32 genuine page-spanning groups and does not treat line or page wrapping as a delimiter. The 55 rune-bearing source pages contain **12,956 runes and 2,896 complete printed groups**; physical p50 is the rune-free numerical table.

The nine visual chapters, fixed by **im-results/lp2-global-original-visual-section-map.md**, are p0–2, p3–7, p8–14, p15–22, p23–26, p27–32, p33–39, p40–53, and p54–55. No complete printed group crosses a chapter boundary.

## Necessary length test

| Original visual chapter | Printed groups | First group lengths | First contradiction |
|---|---:|---:|---|
| p0–2 | 158 | 8, 5, 4 | Phrase 1 has length 8, not 1 |
| p3–7 | 255 | 2, 11, 3 | Phrase 1 has length 2, not 1 |
| p8–14 | 383 | 4, 8, 3 | Phrase 1 has length 4, not 1 |
| p15–22 | 437 | 4, 5, 4 | Phrase 1 has length 4, not 1 |
| p23–26 | 224 | 2, 6, 3 | Phrase 1 has length 2, not 1 |
| p27–32 | 326 | 3, 12, 4 | Phrase 1 has length 3, not 1 |
| p33–39 | 378 | 2, 8, 2 | Phrase 1 has length 2, not 1 |
| p40–53 | 669 | 3, 5, 5 | Phrase 1 has length 3, not 1 |
| p54–55 | 66 | 1, 8, 8 | Phrase 2 has length 8 but no earlier length-7 parent |

Eight chapters fail on their first group. The remaining chapter fails on its second group, well before the final-phrase exception could apply.

The per-length dictionary-capacity check is nonbinding: no chapter has more groups of length L than the 29^L possible phrases. Capacity is not the rejection reason. Exact phrase-value uniqueness is unnecessary once the parent-length condition fails.

## p54 rubric sensitivity

The original-image annotation marks a nine-rune opening red rubric on p54. The transcript divides it into two groups of lengths **1 and 8**. The next group, the first black body group, is also length **8**.

- Include the rubric: phrase 1 has length one, but phrase 2 has length eight and no earlier length-seven parent.
- Exclude the whole rubric: the first black body phrase has length eight and violates the empty-dictionary first-phrase rule.

The result does not depend on whether the red rubric is treated as phrase data or as a heading.

## Positive control

A standard greedy LZ78 encoder applied to the independently solved native p57 text produces **56 phrases from 95 runes**, ends with a permitted already-existing phrase, and replays all 95 runes exactly. Every nonterminal phrase has an earlier dictionary parent exactly one rune shorter, and each phrase is created only once. This verifies that the necessary-condition test accepts an ordinary LZ78 construction, including its terminal exception.

## Consequence and scope

No q8 key inference, language search, or phase search was run: the length-only invariant rejects the exact proposed framing before ciphertext values matter.

Retire only ordinary greedy LZ78 with one complete printed group per phrase, an empty dictionary at each of the nine source-visible chapter starts, and no custom seed or altered group order. This does **not** reject compression of the continuous rune stream, a different phrase segmentation, an independently sourced nonempty dictionary, another dictionary codec, or a separate compression layer whose phrases are not the printed groups.

## Reproduction

Run **node sims/lp2_lz78_printed_group_length_gate_sft.cjs**. The script asserts the original group/rune totals, all nine chapter ranges, no cross-chapter group, every first contradiction, the p54 rubric interpretation, and exact LZ78 recovery of the p57 positive control.

Inputs: **resources/liber-primus/lp2-transcription.txt**, **resources/liber-primus/lp2-corpus.json**, and **resources/liber-primus/lp2-ink-annotations.json**. Chapter provenance: **im-results/lp2-global-original-visual-section-map.md**.
