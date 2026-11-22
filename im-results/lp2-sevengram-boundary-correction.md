# Correction: the reported LP2 seven-rune repeat is a solved-page splice

**Cryptanalytic result, 2026-11-10.** The often-repeated claim that the unsolved LP2 cipher has one seven-rune repeated substring between physical page 27 and transcription segment 54 (physical LP2 page 55) is incorrect for the actual 12,956-rune ciphertext. The seventh matching rune belongs to the *previously solved* `AN END` page. The true unsolved repeat is six runes long.

## Original claimed clue and direct counterexample

The published upstream `Dukotah/cicada3301/liber-primus/analysis/round43/F3-hand-feasibility/KEY-LOCALIZATION.md` §1 calls the apparent seven-rune repeat a 0.5%-chance clue between page 27 offset 28 and segment 54 offset 70 (physical LP2 page 55, original scan 72.jpg). Its own text treats pages 0–55 as encrypted while later corpus definitions distinguish 55 rune-bearing unresolved segments (omitting numeric-only physical page 50) plus solved terminal pages.

The canonical project source `resources/lp2-transcription.txt`, split on `%` page boundaries and reduced to the literal runes `U+16A0..U+16FF`, contains **57 segments**. The first 55 hold **12,956 unsolved rune ciphertext symbols**. Segment 54 (last unsolved segment) is 76 runes long; segment 55 (`AN END`) is **85 already-solved runes**; segment 56 (`PARABLE`) is 95 previously solved runes.

The cross-page concatenation creates the illusion:

| Position | Actual symbols |
|---|---|
| Unsolved page 27, offset 28 | `ᛞᛄᚢᛒᛖᛁᚫ` |
| Unsolved source segment 54 = physical LP2 page 55 (72.jpg), offset 70 (last six ciphertext runes) | `ᛞᛄᚢᛒᛖᛁ` |
| **First rune of SOLVED AN END, source segment 55 = physical LP2 page 56 (73.jpg)** | **`ᚫ`** |
| Invalid concatenation across the decryption boundary | `ᛞᛄᚢᛒᛖᛁ` + solved `ᚫ` = apparent `ᛞᛄᚢᛒᛖᛁᚫ` |

The six-rune `ᛞᛄᚢᛒᛖᛁ` motif **really occurs twice** in the unsolved source at global 0-based rune offsets **6,555** and **12,950**. No unsolved-only seven-rune substring repeats at any position after exhaustive direct enumeration. Retaining continuous runes *across the 55 unsolved page boundaries* does not change this conclusion; only extending into a solved page creates the seventh matching symbol.

## Quantitative significance changed by the correction

For 12,956 independent uniform 29-symbol runes, the exact expected *number of matching window pairs* at a fixed length `k` is `(12956-k+1)(12956-k)/(2*29^k)` (each pair of distinct start positions has equality probability `29^-k`; including overlapping positions gives the same equality probability). This gives:

| Pattern length | Uniform independent expected matching pairs | Actual LP2 encrypted-only |
|---|---:|---:|
| 6 runes | **0.1409792152** | **1** |
| 7 runes | **0.00486060152** | **0** |

The published ~0.5% seven-rune rarity is the right *order of magnitude under uniform randomness*, but the observed seven-rune match is a **cross-boundary artifact**, so this level of significance cannot be assigned to ciphertext. A six-rune repeat is compatible with coincidence under the elementary model; the exact probability for at least one match is not stated here because window dependencies and nonuniform ciphertext-process constraints require their own calibration.

## Why it matters

Any attempt to derive a long running-key alignment, page-local crib, shared keystream, or plaintext constraint from a supposedly exact seven-rune repetition at those page/offset pairs is overconstrained by **one rune from the solved plaintext**. Such attacks can reject the real key for a false reason. Six-rune coincidence still might contain information, especially if coupled to independent structure, but it must be investigated with its genuine length and boundaries.

The checker `sims/lp2_repeat_boundary_audit.cjs` performs exact exhaustive `k=6` and `k=7` enumeration, asserts the canonical length, the page segmentation, the precise repeat sites and the solved-page splice, and prints JSON. It requires only the committed master transcription and Node.js. Reproduce from the repository root using `node sims/lp2_repeat_boundary_audit.cjs`. This correction uses no transcription reconstruction, guessed runes, imputed text or cryptographic key hypothesis.
