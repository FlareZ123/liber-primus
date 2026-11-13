# Original LP2 2,896-word binary ASCII readout: direct eight-column gate

**Intermediate result, 13 November 2026, Agent45.** There is no direct human-readable ASCII message in the explicitly defined one-bit-per-word encodings below. This is a bounded original-source exclusion, not a decryption, key, or general exclusion of word-based steganography.

## Why these exact readings

The original unknown LP2 manuscript has **2,896 complete printed words**, comprising **12,956 original GP29 rune instances**, with 32 cross-page word carries restored under the unchanged transcription. The whole-word count equals **362 × 8**, and the separately printed numeric table has **eight columns**. The 2016 signed guidance places special emphasis on the book's words and numbers. Those are observable prompts to test whether a single parity bit from each printed word forms an eight-bit character stream. This experiment is an exploratory candidate consumer: no author-attributable instruction proves that the word-count multiple, one-bit parity, or ASCII convention is intended.

Three complete, unmodified word-derived quantities are tested, with no trained parameters: (1) number of GP runes in a word, (2) sum of the original first-29-prime GP values, (3) sum of GP0..28 index values. In each case, take **parity** of the whole word value. Fix the first source word as bit zero; take successive groups of eight words as bytes. The two conventional bit orders and the complemented-bit convention produce four readings per quantity. The original printed order and **both source-natural one-pass eight-column rectangular reading directions** yield 36 candidate byte streams. No word deletions, learned phases, key search, relaxed UTF-8 scoring or rune substitutions are permitted.

## Original-source outcome

The source contains **1,450 odd-length words among 2,896**, or 50.069% odd. Every candidate yields exactly **362 bytes**. Across the entire **3 × 3 × 2 × 2 = 36** frozen family:

| Diagnostic | Original-source result |
| --- | ---: |
| Candidate outputs | 36 |
| Bytes in each | 362 |
| ASCII-printable bytes (0x20–0x7E) | 118–153 / 362 |
| Best printable proportion | 42.265% |
| Longest uninterrupted printable byte run, any candidate | 7 |
| Entirely printable outputs | 0 |
| Full English text recovered | 0 |

The highest printable output is the **GP-prime-sum parity**, eight-column-inverse order, **LSB-first**, complemented bits: **153/362 printable**, only seven at most in a contiguous readable run. Under independent uniform random bytes, the printable fraction is **95/256 = 37.109%**, so these outputs are ordinary in gross printability and far from direct ASCII prose. Their original nonprintable bytes preclude a *literal unencrypted printable-ASCII* readout under the declared framing.

A deliberately planted synthetic **"LIBER PRIMUS ORIGINAL BIT PLANT"** word-length parity stream recovers every ASCII byte in the same converter, testing the positive path. The original word parser reproduces exactly 2,896 words and 12,956 GP runes, and the original length-parity count is asserted. All formulas and the 36 output diagnostics are reproducible using the no-dependency [single-file CommonJS test](../sims/lp2_wordbit_ascii_gate_sft.cjs).

## Decision and exclusions

Do not pursue the literal whole-book, one-bit-per-word ASCII carrier in these three parity registers under the original or the two natural eight-column orderings without a separate source clue changing its encoding. The exact eight-column alignment is insufficient by itself to select a plaintext route, and the original word count being divisible by eight could be incidental.

This experiment does **not** rule out entropy-coded word-length sequences, modulo-four or larger word symbols, bit positions selected by original marginalia, page-local framing, a separately instructed keyed word permutation, compressed/encrypted payloads, or other source-selected word-navigation mechanisms. None of those is claimed to have been tested; they require independent selection before broader search. The earlier [word-order grammar study](lp2-wordlength-order-grammar.md) addresses a different hypothesis about preserving ordered prose word lengths and should not be conflated with this ASCII carrier test. No authentic unknown LP2 plaintext, key, or destination was recovered.
