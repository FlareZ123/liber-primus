# Sixteen signed 2016 words as the sixteen floral-page keys: two frozen original-cipher inverses

**Agent 40, 12 November 2026. Result: two bounded negatives, no unknown Liber Primus plaintext.** The original LP2 pp40–55 include exactly sixteen physical pages with the same visible floral frame, including rune-free numerical p50. The PGP-verified 2016 Cicada message contains the contiguous sixteen-word instruction “Its words are the map, their meaning is the road, and their numbers are the direction.” A one-to-one page assignment is an intelligible, source-visible candidate for a 2016 reader, though the message **never says** to associate these words with these pages, use their prime sums as key starts, or reset a cipher at each page.

## Precommitted sources and key construction

The source phrase is checked against the archived signed text `resources/historical/cicada2016-4gq25-outguess.asc`; the ciphertext comes from physical `resources/liber-primus/lp2-corpus.json` pages 40–55 without alterations. In exact printed order, the sixteen phrase words are:

`ITS | WORDS | ARE | THE | MAP | THEIR | MEANING | IS | THE | ROAD | AND | THEIR | NUMBERS | ARE | THE | DIRECTION`.

They are aligned to physical pp40,41,...,55 without permutation or skipping the numerical page. Each word is converted to Gematria Primus rune tokens, interpreting the established alternate ᛝ spelling `ING` before an ordinary digraph. This choice is supported by the actual solved-p57 spelling of `TUNNELING`; only `MEANING` changes relative to an NG-only tokenizer. The resulting **GP-prime sums** are

`[143,179,175,72,211,114,288,84,72,204,215,114,295,175,72,337]`.

Two distinct operations were fixed before reading their original outputs:

1. **2014 Stage04 text-guide Vigenère transfer.** Use each signed word's literal GP29 index sequence as the repeating page-local key. For every rune `k` of assigned physical page `j`, set `P[j,k]=(C[j,k]-wordKey[j,k mod len]) mod29`. The subtraction convention is the one reconstructed from the historically solved Stage04 small image. No plaintext shift, learned alphabet, arbitrary offset, phase fit, or F interruption is added.
2. **Solved LP2 p56 prime-totient transfer.** Use the assigned word's GP-prime sum `s_j` as a **one-based prime ordinal**. At page-local rune `k`, set `P[j,k]=(C[j,k]-(prime[s_j-1+k]-1)) mod29`. This borrows p56's established prime-totient subtraction arithmetic, with a new page reset and word-sum start explicitly marked as conjectures. P56's lone manually identified literal-F exception is not extrapolated to unknown pages.

Original p50 has zero runes but retains its one signed-word slot. Both decoders therefore transform the exact same **3,316 original ciphertext runes** on the other fifteen framed pages.

## Decisive result

| Sequence, 3,316 GP29 runes | Index of coincidence |
| --- | ---: |
| Original cipher | 0.03446282660786315 |
| Signed words, Stage04 Vigenère | **0.034393870752346595** |
| Signed prime sums, p56 totient stream | **0.03459455230547262** |
| Eighteen disjoint 3,316-rune native-GP control windows from Gibran | **0.05865214–0.06384876** |

The two original-input decoder outputs remain essentially uniform GP29 and have no coherent GP-word plaintext. Each candidate re-encrypts **3,316/3,316 original** runes exactly, and each recovers a separately encrypted **3,316/3,316 solved-p57-rune positive plant**. Those controls prove reversibility and the implementation's ability to recover native text given the planted key. A separate authentic solved-p56 regression confirms the `prime-1` subtraction and its source-specific F exception.

The native-GP control windows are useful effect-size evidence: any output as English-like as the source text should show substantial character-frequency concentration, while both candidate outputs remain near the 1/29 uniform baseline. These results do not rule out another language, an additional secret layer, a different page map, or a nonlinear historical algorithm.

## Research decision

**Retire the two exact direct transfers on original pp40–55.** The sixteen-to-sixteen visual match is not an authentic key instruction, and neither precedent unlocks any of the 3,316 original runes. Do not grow a sign/phase/prime-rank/permutation sweep on this match without an independent original clue selecting that new operation. The missing actionable input is an actual source-chosen consumer of the signed words or a hidden key, rather than a larger search over the same incidental page counts.

**Reproducer:** [source-checked standalone CommonJS SFT](../sims/lp2_2016_sixteenword_floral_decoder_sft.cjs), which reads the original corpus and archived signed clue, validates the alternate `ING` spelling, fixes all sixteen sums, checks both known-source cipher arithmetic and 3,316-rune round trips, and asserts the complete original IoC outputs. The larger authoritative [research synthesis](../results/README.md) still correctly records no unknown-page plaintext.
