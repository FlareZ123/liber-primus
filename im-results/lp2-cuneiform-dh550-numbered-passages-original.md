# Cuneiform prime pair: exact DH order-550 versus the five numbered passages

**Agent 26, 14 November 2026. Evidence classification: historical-operation candidate and exact original-cipher negative.** No unknown Liber Primus plaintext, authenticated LP2 key, original encryption inverse, or continuation destination was recovered. [Source-locked one-file reproducer](../sims/lp2_cuneiform_dh550_numbered_original_sft.cjs).

## An independent, human-motivated operation

The original LP2 p33–39 repeatedly prints cuneiform-like two-place sexagesimal numerals **1033** and **3301**. Within this visual enclosure, original red decimal numerals 1–5 explicitly number five successive passages, bounded by the two original red ten-dot marks at p36 offset 99 and p38 offset 186. Their independently image-readback source intervals are p36 [99,238), p37 [0,91), p37 [91,189), p37 [189,228) plus p38 [0,57), and p38 [57,186), with GP29 lengths **139, 91, 98, 96, 129**, total **553**. These coordinates and their pixel provenance were previously established in [the five-passage audit](lp2-cuneiform-five-numbered-wisdom-inversion.md).

A surviving original signed 2013 Cicada TCP specification explicitly teaches **Diffie–Hellman modular exponentiation**, and a contemporaneous participant request used modulus **3301**. This is a historically available mathematical operation, though that source never tells a player to use the LP2 cuneiform values as DH parameters. One fixed exploratory interpretation treats **3301 as a prime modulus** and **1033 as the generator/base**, rather than choosing new private exponents or words.

The exact arithmetic result is

\[
\operatorname{ord}_{3301}(1033)=550,\qquad
x_0=1,\quad x_{j+1}=1033x_j\bmod3301.
\]

The 550 orbit entries are distinct before returning to 1. **550 differs from the 553 source-numbered runes by three.** This mismatch matters: the manuscript does not select three skips, title runes, or padding positions that would turn the five natural spans into a complete DH orbit. The numerical proximity is therefore only a hypothesis-generating coincidence, without establishing a 550-rune packet. Other operations on the published primes were already explored elsewhere; this investigation tests the direct untouched DH orbit alone.

## Frozen original-input inverse, no tuned seeds

Read the canonical [original GP29 corpus](../resources/liber-primus/lp2-corpus.json), without transcription correction, artificial 550-rune trimming, fitted exponent, arbitrary output rotation, or user-supplied language crib. Map each successive orbit element to a GP shift in precisely two historically motivated ways:

1. **Raw residue** \(k_j=x_j\bmod29\).
2. **Totient residue** \(k_j=\varphi(x_j)\bmod29\), reflecting the independently solved p56 totient precedent.

For each fixed map, decode \(P_i=C_i\pm k_i\bmod29\), using either exponent-zero first (x0=1) or exponent-one first (x1=1033). Test a **single clock across the original 553 runes** and a **clock restarted exactly at each printed 1–5 passage**. Finally compare no F skip with the narrow conditional convention that **every visible ciphertext F is treated as a literal F and consumes no key**. The latter is not equivalent to the authentic p56's latent plaintext-F bypass, since encrypted non-F may also emit F. These choices give **32** fully specified direct inverses, none chosen by observing readability.

The untouched 553-rune source has GP29 IoC **0.0342335613**. The highest IoC of all 32 output candidates is **0.0361336059**, for totient residue, exponent-zero first, uninterrupted passage clock, every-visible-F skipped and plus sign. The lowest is **0.0337487224**. Every candidate remains effectively uniform; the best begins in GP transliteration **NG M N EA L TH EO U NG EO G W D TH OE U N I T W A F I A N D**, without sustained prose. No candidate reaches an alphabet concentration comparable to even the independent solved-source p57 plant (553 rune repetitions, IoC **0.0707013130**).

The executable regression independently builds all 32 candidates from the canonical source, asserts the exact orbit length, the five original span boundaries, the best configuration and its score, and a **known-plaintext recovery control**. For all non-skipping models, it encrypts and recovers the entire 553-rune p57-based native-GP plant without modification. For the all-visible-F conditional decoder, the plant explicitly avoids encrypted non-F accidentally producing ciphertext F, and records those few necessary symbol changes before checking exact recovery. This keeps the positive control honest about the conditional F rule. The test prints a decision summary and writes no files.

## Decision

The **direct DH-orbit-to-GP additive** reading of the original 1033/3301 cuneiform values is unsupported on the original numbered ciphertext under the 32 fixed conventions. The interesting order-550/length-553 near match cannot be promoted to a full-codeword identity or repaired by choosing three convenient runes after the fact. This is a narrow cryptanalytic exclusion, independent of earlier five-pass Wisdom-square matrix and totient-row tests. It does not exclude a historically motivated but otherwise specified nonlinear DH-based encoder, a separate source-provided private exponent, a keyed transform of the orbit values, or a true latent-F decoder.

**Research consequence:** absent a new authorial input that specifies how 1033 and 3301 should become a cipher schedule, retire further direct exponent-phase tuning of this pair and investigate a materially independent route to actual unknown plaintext.
