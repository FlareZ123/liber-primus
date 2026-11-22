# Two original red words have common BASE29 divisor 1,433, equal to one full LP2 chapter

**17 November 2026, Agent42. Provisional navigation/key-source hypothesis, not recovered plaintext.** The original red-word stream contains a previously unnoticed, exact arithmetic bridge between physical **p0**, the distant red passage on **p53**, and the 1,433-GP-rune chapter on **pp27–32**. This may help select a target chapter or a source-derived quantity if an independent authored instruction identifies the two operands. The original pages supply no such unique cross-word pairing or ciphertext inverse, so a new cipher claim is **not** established.

## Original-visible operands and exact calculation

Original page scans are [p0 / original 17.jpg](../resources/liber-primus/17.jpg) and [p53 / original 70.jpg](../resources/liber-primus/70.jpg). The first has a **13-rune red two-word heading** (8+5) ending just before a 13-dot rubric; the second has a long **51-rune red section**, printed in separated words. These are identifiable ink features rather than invented ciphertext slices. The original image-source-aligned [GP29 rune register](../resources/liber-primus/lp2-corpus.json), [word separators](../resources/liber-primus/lp2-transcription.txt) and [original ink spans](../resources/liber-primus/lp2-ink-annotations.json) locate the exact printed words:

| Original physical location | Red printed word | Source GP29 indices | Big-endian BASE29 integer |
| --- | --- | --- | ---: |
| p0, rune offsets 8–12 (second heading word) | `SYENGC` | `15,26,18,21,5` | **11,259,081** |
| p53, rune offsets 137–140 (third word in the red span) | `NHGJ` | `9,8,6,11` | **226,414** |

Each integer is formed by Horner's rule `n ← 29*n + GP_index` in printed order, with zero-based GP indices. The **exact greatest common divisor is 1,433**, which is itself prime:

```text
11,259,081 = 1,433 × 7,857 = 1,433 × 3^4 × 97
   226,414 = 1,433 ×   158 = 1,433 × 2 × 79
gcd(11,259,081, 226,414) = 1,433
```

The complete physically marked p27–32 chapter contains **exactly 1,433 original GP29 runes**. Its source-independent chapter length follows from the nine chapter boundaries, rather than from these two numerals. This factor selects **one of the nine chapter lengths** (the nine are 729, 1145, 1729, 1903, 1021, 1433, 1680, 3008, 308). No other chapter length divides any whole red word more than once. The two factors 97 and 79 in the quotients are themselves published GP prime weights, but this observation supplies no decoding rule.

## How selective is the match?

The [source-native CommonJS SFT](../sims/lp2_redword1433_chapter_alignment_sft.cjs) restores actual word separators and physical p50's rune-free position, checks every original page rune count and source red-span offset, and identifies **53 complete red printed words containing all 225 red runes**, including the solved p56–57 titles. Across the complete transcription's **2,973 page-local word segments** (2,941 complete printed words, with 32 split across page boundaries), exactly **five** word values are positive multiples of 1,433:

- red p0:8, length5, quotient7,857;
- black p29:67, length6, quotient320,691;
- black p43:33, length4, quotient145;
- black p47:218, length3, quotient12;
- red p53:137, length4, quotient158.

Thus two of the five matches fall inside the 53 red words, and all other 51 red words miss the nine original chapter-length factors. The red-match cardinality was found **after exploring** page-title number readings, so it is exploratory evidence.

A deterministic **100,000-draw** calibration shuffles only the **225 source-red GP indices** while preserving their exact symbol multiset and every one of the 53 original red word lengths. Each draw tests **all nine** physical chapter counts as divisors, retaining only repeated red-word hits:

| Frozen comparison | Null draws meeting or exceeding the observed two hits | Add-one frequency |
| --- | ---: | ---: |
| Specifically two red words divisible by 1,433 | 330 / 100,000 | **0.00330997** |
| **Any** of the nine chapter sizes divides two or more red words | 3,558 / 100,000 | **0.03558964** |

The second figure is the more relevant within-family rate because 1,433 was picked after observing the values. It is also **not** a valid all-investigations discovery p-value: further candidate divisors, different length lists, red-span arrangements, page targets and prior researcher inspections were available. The word-length-preserving shuffle does not model the manuscript's full encryption architecture. The calculation is an exact novel source cross-reference worth retaining, with limited evidentiary strength.

## Decipherment implication and stopping rule

The earlier original Cicada stages taught both numeric conversion and operations on numbers, and the signed 2016 message says the words, meanings and numbers guide direction. A plausible **conditional** intended route would use a genuinely authored selection of these two red words, take the common factor and navigate to the p27–32 chapter. The obstacles are concrete:

1. Original p0 and p53 have **many** red printed words. The book does not name this particular second/third-word pairing or command `gcd`.
2. Reusing 2013 BASE29 here is a hypothesis; 2013's documented `NUMBER` command reverses decimal digits before factoring, unlike the ordinary GCD needed for this match.
3. Choosing the **1,433-rune chapter** is only an address, not a symbol-changing key, a GP29 inverse, or an instruction for consuming the whole original chapter.

No honest original-cipher inverse or unknown-page plaintext follows. The **next decisive experiment** requires a first-party source indicating which two red words (or why their common factor), followed by a frozen computation on the p27–32 chapter and a wholly untouched original-text prediction. Do not optimize residual factors 7,857/158 or choose new rune clocks simply to force readable language. Existing p27, p53 and 1,433-rune chapter ciphertext remains unsolved.

**Reproducibility:** `node sims/lp2_redword1433_chapter_alignment_sft.cjs` (Node.js 22 / Windows compatible), original committed corpus/ink/transcription only, read-only, deterministic xorshift32 seed `0x33012014`, 100,000 exact shuffles, complete equality assertions. See cited source files and SFT for all inputs.
