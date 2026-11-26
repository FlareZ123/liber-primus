# Historical resplitting control: ACA Morbit, Director #3051

Agent15, 2026-11-26. **Decision: exact historical positive; no independently typed LP2 transfer.** No new LP2 plaintext.

## Source-selected control

LIONEL, *Tyro Tutorial* (2013), chapter XXII, printed p104, M-2 "Kris Kringle"; published solution at the end of the tutorial. [Original ACA PDF](https://www.cryptogram.org/downloads/tyro_tutorial_by_LIONEL_1.pdf). The puzzle supplies a Morbit label and two candidate nine-letter keywords CHRISTMAS and BOXINGDAY. The publisher's PDF text layer supplied the exact ciphertext and solution; screenshot retrieval returned cache miss. The full ciphertext is transcribed in [reproducer](../sims/aca_2013_morbit_false_boundary_control_sft.cjs), commit 347dd32ee2e6446d0316d19c12fadff3aada8450.

Freeze the standard Morbit pair order (dot, dash, separator x), rank keyword letters stably from 1 to 9, and translate each ciphertext digit into its two trits. Single x divides letters and double x divides words. The first 65 digits select CHRISTMAS: BOXINGDAY violates Morse grammar. The unchanged remaining 65 digits decode with the same mapping; the entire 130 digits re-encode exactly, including terminal padding. The published solution agrees throughout. Of 25 printed five-digit group cuts, only seven can even overlap an underlying Morse double separator; 18 are strictly false word-boundary candidates. There are 15 internal true word separators. This is a genuine, externally specified, deterministic boundary reconstruction, not merely deleting spaces and guessing words.

## Original LP2 transfer decision

The relevant independent comparison is the [original carry audit](lp2-original-page-boundary-audit-p32-p54-p55.md): p54 ends with ten runes of an 11-rune printed word whose final rune opens p55; p32 also begins with a carry. Line breaks and explicit printed dividers are distinguished in the source. Known p56's prime-totient rune clock and p57's direct reading preserve the word-divider interpretation, rather than reconstructing separators from an intermediate trit grammar. This does not prove unknown sections preserve plaintext word boundaries.

The historical receiver has nine distinct digit symbols (3^2 pairs). Direct one-to-one Morbit cannot cover even p55's 25 observed rune types, let alone 29-type chapters. This is a different direct capacity bound from the previously excluded 3-trit fractionated Morse. Arbitrary homophones could avoid the alphabet-size bound, but no source-selected many-to-one mapping, nine-letter keyword, typed Morbit label or pair-clock is identified. The earlier [Morse capacity and search report](lp2-fractionated-morse-alphabet-capacity-gate.md) also documents the more general historical clue gap and prior 3-trit searches. The first-party [2013–2014 boundary review](cicada2012-2014-boundary-semantics-precedent.md) finds binary whitespace and transport reassembly, not this typed Morse operation. Printed LP2 marks and carried word fragments do not specify a trit grammar.

Therefore preserve the external positive as a counterexample to an unconditional assumption that printed ciphertext boundaries must be plaintext boundaries. Do not promote it to an LP2 mechanism. The specific missing inputs are a source-selected intermediate alphabet/codebook and the matching letter/word delimiter syntax; no original chapter receiver is run. No new Morse search, arbitrary segmentation or glyph mapping.

## Reproduction

The script's complete control core ran in connected V8; Node wrapper was not independently executed. The historical PDF text layer was used, not a successful raster screenshot. An earlier candidate from a different archived cryptogram had transcription discrepancies and was discarded instead of corrected by inference.
