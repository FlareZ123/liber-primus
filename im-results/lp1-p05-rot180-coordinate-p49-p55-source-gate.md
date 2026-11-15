# LP1 p05 rotational magic-square map versus p49/p55: a noninvertible 76→66 route

**15 November 2026, Agent29, Director #1176. Evidence:** exact original LP1 p05 rune/numeral cell transcription, intact LP2 p49 and p55 ciphertext, and a bounded source-selected insertion/erasure inverse. **No unknown LP2 plaintext, author-chosen encryption rule, key or destination recovered.**

## Direct first-party geometry

The original LP1 p05 source `resources/transcriptions/lp1_wulfic_canonical.txt` prints a mixed 5×5 square after **THE PRIMES ARE SACRED / THE TOTIENT FUNCTION IS SACRED / KNOW THIS**. Interpret original written rune cells by the chart's printed GP prime values, without changing any source spelling, especially **UOID**. The complete resulting numerical square is

```text
272  138  341  131  151
366  199  130  320   18
226  245   91  245  226
 18  320  130  199  366
151  131  341  138  272
```

Every row, column and both diagonals total **1033**. More importantly for this task, **all 25 cells obey exact 180° rotational symmetry of their GP prime-sum value**: `M[r,c] = M[6-r,6-c]` in one-based coordinates. This is a whole-square authored geometric property, not an LP2-specific discovery. The 13 actual rune-word cells contain **76 runes**, of which 11 first-occurrence distinct words contain **66**. The two repeated printed word cells are

| Original word | First cell | Rotationally opposite repeat | Rune length | Offset of later copy in the concatenated 76-rune word tape |
| --- | --- | --- | ---: | --- |
| UOID | r2c3 | **r4c3** | 4 | **53–56** (zero-based) |
| AETHEREAL | r2c1 | **r4c5** | 6 | **65–70** (zero-based) |

Thus the later copies are the exact **rotated counterparts** of their first copies. This geometry explains their paired placement without needing a special LP2 deletion opcode. It makes a human deduplication reading plausible but cannot authenticate it. Other centrally paired square cells are **different rune words with the same prime sum**: SHADOWS (7 runes) ↔ CABAL (5), BUFFERS (7) ↔ MOURNFUL (8), and CARNAL (6) ↔ ANALOG (6). Two further pairs mix a word with a printed numeral: OBSCURA (7) ↔ 245, and MOBIUS (6) ↔ 226. The source's numeric 180° involution therefore **does not define a 76-rune permutation or equal-length cell transposition**: at least two rune/rune pairs differ in length and two mirrored partners contain no literal rune word.

## Exact source-only erasure and restoration gate

The previously noticed relationships are genuine original lengths: LP2 p55 is **76 GP runes**, and its p49 pre-table physical fragment is **66 GP runes** followed by a **ten-dot** red mark. But ten missing rune symbols carry **29^10 = 420707233300201** possible values, or **48.57981 bits** of information. A fixed ten-dot punctuation symbol does not reveal those values. Retaining only 66 symbols from an arbitrary 76-rune input is inherently many-to-one until a separately authored restoration rule, known 10-symbol side payload or restrictive valid-input condition is supplied.

This is directly testable using the exact p05 later-duplicate offsets **53–56** and **65–70**, rather than fitting a new permutation:

- Delete those ten locations from original **p55**. The remaining 66 source ciphertext runes match unchanged original p49 ciphertext at only **3/66** aligned positions. The literal identity/route hypothesis fails **63 positions**.
- Suppose the missing values must be the ten p05 duplicate-source runes, `UOID AETHEREAL`, which would make the 66→76 insertion rule completely reversible on its restricted domain. Original p55 matches those fixed source values at **0/10** insertion sites. This source-only literal-restoration hypothesis is false.
- A synthetic native-positive construction inserts those exact ten source runes into **the first 66 authentic known p57 runes** and then removes them, recovering **66/66** and rechecking **10/10** inserted controls. The source offsets are implementable and exact.
- If one treats the **ten-dot count alone** as the selector for exactly two whole-word erasures, the source has **three** four-rune word cells and **five** six-rune word cells. This gives **15 distinct length-ten two-cell choices**. The literal repeated-word rule picks one choice, but the dots alone do not.

The p49 66-rune fragment is only part of the **138-rune** complete sentence starting on p48; an operation that treats physical p49 as a self-contained message needs a separately printed cipher-reset/segmentation instruction. Similarly the untouched post-table sentence contains 170 runes. Neither sentence has been decrypted here. The p05 numeric symmetry itself cannot select a key, an invertible 138/170-rune decoder or a held-out prediction on either full sentence.

## Decision and reproducibility

**Close the coordinate-only #1176 route.** The 180° relationship is an exact original input constraint and explains the duplicate locations. The coordinates select a ten-rune *erasure* after a proposed deduplication rule, while the missing symbols, incomplete counterpart types and unequal paired word lengths prevent a unique complete inverse. The exact source-only restoration models make wrong predictions on original p55/p49, despite a successful planted positive. A new author-attributable serialization/side channel or real original plaintext prediction would be required to reopen a specific route. Do not rescue the count coincidence through arbitrary D4 orders, padding, free substitutions or postselected table lookups.

**Reproduce:** `node sims/lp1_p05_square_180_duplicate_coordinate_gate_sft.cjs` (Node.js 22, Windows-compatible CommonJS). It reads unchanged repository LP1 transcription and LP2 corpus, asserts the complete square, every 180° cell equality, word lengths, source coordinate offsets, source-native controls and the exact original 0/10 and 3/66 outcomes. Related pre-existing direct cipher negatives: [p05 distinct-66 / p49 gate](lp2-p05-unique66-p49-sourcekey-gate.md); manuscript-wide status in [results/README.md](../results/README.md).
