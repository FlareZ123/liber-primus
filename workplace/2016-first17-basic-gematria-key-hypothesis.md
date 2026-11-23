# Original LP1 first17 → LP2 basic-gematria repeating-key test

**Status: exact source-rune and numeric-stream candidates tested against the unchanged original LP2 ciphertext; neither yields recovered plaintext.** Historical first17→last57 was an independent 2016 solver hypothesis, *not* a signed Cicada decryption instruction. Its direct executable forms are now reproducible; key phase and decoder direction were not tuned to an English outcome.

## Historical premise and source

The 2016 [archived cicadasolvers IRC log](https://github.com/cicada-solvers/neuroretransmit-cicada/blob/main/irc-logs/%23cicadasolvers.freenode.2.log) considers whether the first 17 **physical LP1 pages** could be a key for the following 57, and discusses a “shifted form with basic gematria.” That is a proposal by solvers, not an identified author opcode. The first17 pages contain the warning: **“Believe nothing from this book except what you know to be true ... do not edit or change ... either the words or their numbers.”** The two printed symmetric 5×5 objects have numerical row sums **1033** (LP1 page5) and **3301** (LP1 page16), which connect to earlier prime_echo values, but do not themselves specify a decoder.

The physical pages 0–16 correspond to **segments 0–6** of the archived [idkfa translator](https://github.com/cicada-solvers/idkfa) — **not** its first17 segment indexes; segment7 is already second-release text. The complete local original-runic transcription is `resources/transcriptions/lp1_wulfic_canonical.txt`. The idkfa `data/liber` omits **76 runes of the source page5 mixed word/number matrix**, which the complete Wulfic source retains.

The historical source transforms were applied independently to all seven original segments, without substituting editor-normalized prose: 0 and 3 invert the Latin mapping (3 also shifts by 3), 1 subtracts the original DIVINITY key (with 11 literal-F transparent positions), 5 subtracts FIRFUMFERENFE (two F positions), and 2,4,6 are literal GP29 text. Exact F positions are defined by idkfa `config.js`. This recovers the clear text of the first17 while preserving its original rune spellings; segment2 includes original matrix labels such as SHADOWS, AETHEREAL, VOID, CABAL.

## Complete source-selected direct keys

- **Key A — all displayed runic glyphs:** 2,797 GP29 indices, across seven segments of lengths `184,515,157,778,755,319,89`. The 157 include all 76 additional rune glyphs on original page5. Non-rune punctuation and digits remain delimiters.
- **Key B — all runes and printed numbers:** 2,836 GP29 elements, inserting the **39 printed decimal tokens** as integer `n mod 29` at their original positions, the documented `idkfa Key.fromInteger` rule. There are **12** printed number tokens within page5’s mixed 5×5, **2** numbered propositions on pages10–13, and **25** tokens in page16’s numeric 5×5. Original page5 word labels are not replaced by hypothetical numeric “translations”; no two different original representations are double-counted.

A historical repeated-key `Shift.mutate` subtraction is the primary receiver. Its historically documented reverse shift (addition) is the sole competing direction. Both begin at key offset0 and run continuously across LP2 p0–56, including page boundaries, with **no tuned starting offset, rotations, alphabet, or page-specific exceptions**.

## Original-input decision

| Frozen key | Shift | LP2 unknown p0–55 IOC | LP2 p16–21 IOC | Unseen LP2 p40–53 IOC |
| --- | --- | ---: | ---: | ---: |
| 2,797 runes | subtract | 0.034504899 | 0.034612539 | 0.034453739 |
| 2,797 runes | add | 0.034478231 | 0.034644075 | 0.034526265 |
| 2,836 mixed | subtract | 0.034470796 | 0.034389475 | 0.034414602 |
| 2,836 mixed | add | 0.034491696 | 0.034601770 | 0.034517199 |

For comparison, flat 29-way monograms have expected IOC near **1/29 ≈ 0.034483**. Each of the four full 12,956-rune outputs and independent holdout ranges remains flat and nonlinguistic. The already-known p56 AN END section is also checked separately; inverse correctness is controlled with a planted 85-rune native cleartext at a nonzero key phase. **No unknown LP2 plaintext, authentic receiver, or destination is recovered.**

[One-command exact source reproducer](../sims/lp1_first17_native_and_numeric_gpkey_lp2_inverse_sft.cjs): `node sims/lp1_first17_native_and_numeric_gpkey_lp2_inverse_sft.cjs` (Node22, read-only, original inputs). It reports source-key SHA256, full/holdout IOC, positive inversion, and p56 exact-character agreement.

**Decision:** retire the *direct repeating GP29 key made from every first17 printed rune or every rune-plus-integer-mod29*, both historical shift signs. This does **not** reject the broad first17→last57 premise: the 2016 chat never specifies that direct operation, an encoded numeric representation other than idkfa integer reduction, or whether the two original matrices should define a separate transformation. Future work must first obtain an independently source-selected such operation and an untouched full-page prediction, rather than adding arbitrary key phases, numeric interpretations or ciphers.

Earlier exploratory plaintext-only serializations from 14 partial sections (3,313/3,608 glyphs), paired-matrix Hill inverses, and matrix-element direct modulo29 keys also failed; those are narrower and must not be mistaken for this completed exact original-rune test.
