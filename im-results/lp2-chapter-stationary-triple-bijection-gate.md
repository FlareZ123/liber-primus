# Key-independent GP29 triple-bijection gate at original nine visual chapters

**12 November 2026, Agent49 | Intermediate cryptanalytic exclusion.** The full original 12,956-rune unknown LP2 corpus is incompatible with a stationary one-to-one substitution of **three-rune blocks** into conventional English represented in Gematria Primus, under source-identified book and visual-chapter reset boundaries. The same result holds for all three possible block phases. This conclusion is conditional on ordinary GP29 English and a fixed block table within each chapter. No plaintext or key has been recovered.

## Why this is a mechanism-level result

The source-visible 5×5 Wisdom square and p55's incoming one-rune carry plus 75 complete-body runes suggested the simple three-symbol Hill model tested separately in [the p55 inner-matrix test](lp1_wisdom_inner3_hill_p55.md). That direct source-key trial gave no plaintext, so instead of fitting further matrices, test **every possible secret invertible three-rune substitution at once**, without choosing any key.

A fixed bijection on the **29³ = 24,389** possible GP29 triples can arbitrarily rename each triple. The count of occurrences of each codeword is unchanged, and so are the number of distinct codewords, their sorted multiplicities, and their maximum frequency. This holds for every invertible Hill-3 matrix and for every non-linear three-rune lookup permutation. Consequently no search over secret matrix entries or arbitrary codebooks can avoid this invariant when applying one fixed table to all disjoint triples.

The original images independently select nine top-level unknown chapters by preceding 13-dot terminators and red chapter initials, in original printed order:

| Chapter (physical LP2 pages) | Source runes | Disjoint triple-block counts at phases 0–2 | Original distinct triple counts at phases 0–2 | Greatest distinct count in ANY matched English control at ANY phase |
| --- | ---: | --- | --- | ---: |
| 0–2 | 729 | 243 / 242 / 242 | **240 / 241 / 242** | 231 |
| 3–7 | 1,145 | 381 / 381 / 381 | **379 / 377 / 375** | 347 |
| 8–14 | 1,729 | 576 / 576 / 575 | **567 / 572 / 570** | 494 |
| 15–22 | 1,903 | 634 / 634 / 633 | **627 / 623 / 628** | 535 |
| 23–26 | 1,021 | 340 / 340 / 339 | **337 / 337 / 339** | 311 |
| 27–32 | 1,433 | 477 / 477 / 477 | **472 / 474 / 474** | 421 |
| 33–39 | 1,680 | 560 / 559 / 559 | **551 / 550 / 548** | 484 |
| 40–53 | 3,008 | 1,002 / 1,002 / 1,002 | **975 / 987 / 977** | 773 |
| 54–55 | 308 | 102 / 102 / 102 | **101 / 102 / 102** | 102 (not separated) |

Even with a separate secret bijection and separate independent phase for *each chapter*, all **eight longer chapters** exhibit more distinct triples than the **maximum** of any corresponding English-control window. The short **308-rune terminal chapter** cannot be excluded in isolation by this test. No chapter has been joined with another to create its local comparison.

For a single book-global key, the three original 4,318-block profiles have distinct counts **3,934 / 3,960 / 3,939**, with maximum multiplicities **4 / 3 / 4**. Across all three phase choices, the largest distinct count in any length-matched English window is **2,001**, and the smallest maximum-triple multiplicity is **26**. The gap is substantial in both independent histogram dimensions.

## Reproducible matched plaintext controls

Read the original **[canonical LP2 corpus](../resources/liber-primus/lp2-corpus.json)**, preserving all 12,956 unknown runes and chapter-local source order, including red headings. In each chapter evaluate the three possible disjoint block origins: rune offsets 0, 1, or 2. Convert control English to native GP29 using the repository's established longest-token Gematria transliteration, with standard historical handling of QU, V, K, Q, Z. Use the three already-pinned reference files:

- Shakespeare first 300,000 source characters (218,800 native-GP runes);
- Gibran, *The Prophet* (63,114 native-GP runes);
- Emerson essays (324,630 native-GP runes).

For each of the nine original chapter lengths, scan consecutive native-GP windows of the **identical rune length**, stepping by a fixed 1,231 runes; compare all three disjoint phases. There are **178–176 Shakespeare, 49–52 Gibran and 262–264 Emerson windows per original chapter**, depending on length. The book-wide matched windows use step 3,959 (52 Shakespeare, 13 Gibran, 79 Emerson). These are finite English samples selected without optimizing the outcome. We report the maximum distinct count across all controls, rather than an uncorrected best-case single reference match; every long-chapter/phase gap remains positive.

A 24,389-element **nontrivial fixed affine permutation of entire three-rune codewords** is an explicit lossless positive plant. The reproducer asserts that all 24,389 codewords map bijectively, the planted 12,956-rune native-GP text recovers exactly, and the histogram invariants survive encoding. This is a programming control, not evidence that the original uses that permutation.

[Single runnable CommonJS reproduction](../sims/lp2_chapter_triple_bijection_gate_sft.cjs).

## What is excluded and what remains

A single book-stationary GP29 triple substitution is incompatible with the observed English-control triplet profile, irrespective of the unknown 24,389-entry secret table. Permitting a *different* stationary codebook for every original illustrated chapter does not rescue the model on eight of the nine chapters. This extends the previously reported all-secret **two-rune** fixed-bijection exclusion to an independently selected **three-rune** unit and source-authenticated **chapter reset** clock.

This comparison is **empirical and language-conditional**, not a mathematical prohibition of all possible plaintexts. It does **not** exclude a plaintext outside ordinary GP29 English, encrypted compression, changes of the secret table within chapters, ciphertext- or plaintext-dependent feedback, overlapping block transforms, longer blocks, a cipher after the triples, or an exceptional encoding confined to the short p54–55 chapter. Those models require a separately observable and executable key/state rule. A fitted changing-state or non-GP explanation is not evidence of decryption.

**Research decision:** retire stationary **Hill-3 and arbitrary invertible three-rune lookup** decoders as the central whole-book or nine-chapter GP-English explanation. Preserve the fully unconstrained p54–55 terminal-page possibility; there is still no authentic unknown-LP2 plaintext or final continuation destination.
