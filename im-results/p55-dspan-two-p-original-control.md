# The p55 D-span recursive fold: conditional TWO/P readout

**Decision (11 November 2026):** A fully reproducible original-source motif exists, but it does not provide a source-selected cipher operation, key, or unknown LP2 plaintext. Treat the D-interval fold and its p57 WE navigation as provisional. This note is a bounded original-input result for Director Issue #133, not a new decrypt.

## Original-source input and exact operation

The canonical continuous printed-word parser gives **2,896** words and **7,247** strict word-interior GP runes on unsolved physical pages p0–55. It must carry words over physical page and printed line breaks. Separately, p55 contains 17 page-local rune segments and 43 interior runes. In this 43-rune stream D (GP index23) occurs at 1-based interior positions **5 and 23**. The 17 runes strictly between those D marks have GP indices:

```text
[2,27,24,17,5,28,0,14,10,19,1,5,13,8,21,20,15]
```

With a *frozen* outer-to-inner operation on an odd-length vector, emit each pair as left minus right modulo29, followed by the untouched center. Repeat until one symbol remains. The six layers are:

```text
17: TH IA A B C EA F X I M U C P H NG L S
 9: T W O N NG D EA A I
 5: G EO R S NG
 3: X Y R
 2: I Y
 1: P
```

The first output begins **T W O**, while the terminal singleton is **P**. P has GP prime weight43, so two Ps sum86; independently, solved p57 contains a WE word whose GP prime sum is86. The step **TWO P → 2×P → 86 → p57 WE**, however, requires interpreting an output word and a numeral as a summation instruction and then selecting p57 as a dictionary. The original D-span alone does not provide that instruction.

## Independent controls on the unchanged ciphertext

Exactly **7,231** length-17 consecutive windows exist in the full 7,247-rune strict-interior stream. Applying the same left-minus-right recursion gives **one** window with first-level prefix TWO, at zero-based interior offset **7209**; its singleton is P. The reported joint signature is thus unique, but **the first-level TWO prefix alone is already unique on this source corpus**. The terminal P is additional arithmetic structure within that selected window, not an independent second global-location selector.

For the fixed alternate operators right-minus-left and pairwise addition, **zero** original 17-rune windows have the TWO-prefix/P-terminal signature; neither even yields a TWO prefix. A competing equal-gap X/X interval on p55 (1-based X interior positions **13 and 31**) produces no target under any of the three operations. Counts of windows ending in P, irrespective of prefix, are **236** (left-minus-right), **264** (right-minus-left), and **250** (addition).

A deterministic Fisher–Yates fixed-multiset permutation null, using exactly the 17 observed D-span rune indices and xorshift32 seed `0x3301`, gives **555/10,000,000** first-level TWO prefixes, **345,122/10,000,000** terminal Ps, and **15/10,000,000** conjunctions. The conditional joint rate (~1.5 per million in this model) is striking *after freezing the signature*, but it is **not a calibrated probability that the puzzle maker intended this route**, since D, the minus operation, the THREE-letter prefix, and the p57 interpretation were discovered during exploration.

## Missing selector and next decision

The D span is physically genuine, although an X/X span has the same 17-rune interior length and 19-rune inclusive width. The strongest proposed D selection uses historical NUMBER(193), whose input is a p50 table token `3D` read as radix60. The original table also admits a radix59 reading of the same token as190; this fork is separately under Issue #116. Neither the solved p57 instruction about shedding circumferences nor the signed 2016 words/numbers language explicitly fixes this exact recursive minus operation, its orientation, or the 86-to-WE dictionary jump. No new decoder has been obtained from it.

**Research decision:** Preserve the precise D/TWO/P geometry as a conditional clue, withhold dependent original-cipher searches until an independent original-source instruction selects both the D interval and the left-minus-right operation. If such an instruction emerges, the untouched LP2 page outside p55 should be the next falsification target, using a predeclared reversible transform. Do not repeat arbitrary sign, phase or short-key searches.

## Reproduction

Run `node sims/p55_dspan_two_p_original_control_sft.cjs` from repository root. The standalone CommonJS test reads `resources/liber-primus/lp2-corpus.json` and `resources/lp2-transcription.txt`, asserts the exact source offsets and all three original-stream controls, derives the terminal linear form from basis vectors, and reproduces the fixed-multiset null without writing files.
