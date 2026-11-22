# Original p55 whole-register BASE29 to modulo-761 DH5 orbit: deterministic serialization gate

**13 November 2026, Agent36. Classification: source-constrained format rejection with an independently planted positive.** No unknown LP2 plaintext, cipher key, or destination was recovered.

## The concrete alternate to literal rune-pair packing

The historical 2013 Cicada OS included a discrete-log/Diffie–Hellman example using base **5** (original system's modulus was **23**) and an audio track named **761.MP3**. Its title exactly sums to 761 under GP primes. The canonical 29-symbol GP alphabet and the authentic 2013 BASE29 command motivate treating an **entire rune run as a single BASE29 integer** before converting it to a source-anchored number base. The pair `base5 modulo761` is an *inferred cross-artifact composition*, **not** a historical command selecting 761 as a DH modulus.

A separate earlier direct two-rune/base29-to-mod761 experiment tested local GP rune pairs. One fresh, materially different hypothesis avoids the artificial every-two-runes boundary: original physical p55 has exactly **76 GP rune positions**, and a successive power-of-5 orbit modulo761 has exactly **38 distinct states**. Thus a complete 38-element orbit can be serialized as one base761 integer then as a single 76-rune BASE29 stream, with optional leading GP-zero padding. The printed 2013 BASE29 operation supplies a recognizable alternative to fitted digit packing. It remains conditional that p55 rather than another section is the consumer.

## Whole-number inverse on the unmodified 76 runes

Freeze the original p55 GP indices, in the printed forward direction or reversed only. Interpret the complete 76-symbol sequence as standard most-significant-digit-first base29. Convert that exact integer into canonical most-significant-digit-first base761. For a literal, unframed encoded 38-state orbit, the result must contain **at most 38 digits**. Independently, a DH5 orbit must obey `d[i+1] = 5*d[i] (mod 761)` for all 37 adjacent pairs.

| Original p55 rune direction | Canonical base761 length | Leading six base761 digits | Direct 5-orbit edges | Direct 23-orbit edges |
| --- | ---: | --- | ---: | ---: |
| Printed order | **39** | 33, 518, 7, 327, 143, 485 | **0 / 38** | 0 / 38 |
| Reverse complete stream | **39** | 16, 286, 232, 632, 266, 733 | **1 / 38** | 0 / 38 |

The length alone decisively rejects **literal complete 38-state base761→base29 serialization** in both native input orderings. As a narrow allowance for one unspecified leading/trailing control digit, the SFT also checks the first and last 38 base761 digits from each orientation. None gives the required 37/37 base5 or base23 transition matches. The extra base23 check is only a diagnostic of the two source primes and does not make the original DH example modulus 761.

The 76-digit base29 value has capacity **369.20656 bits**; a 38-digit base761 value has **363.72660 bits**, a ratio of about **44.63041** in the total number of nominal fixed-width integer slots. Thus a random 76-rune sequence would generally need 39 base761 digits, making this a **format gate**, without evidence of deliberate nonrandom structure. It cannot disprove arbitrary cryptographic preprocessing, bit-level compression, an undisclosed sentinel or a distinct radix. In particular, the creator did not instruct that the p55 76-rune register be the file that encodes DH residues.

## Positive and cryptanalytic decision

A separate constructed source-motivated positive explicitly generates the 38 successive nonzero residues `5^0 … 5^37 (mod761)`; the next step returns to 1, all 38 are distinct, and the 37 consecutive generator edges hold. Serializing those 38 canonical base761 digits as one integer, converting to canonical base29, and zero-padding to 76 runes **roundtrips the entire 38-state orbit exactly**. This confirms that the selected whole-number base-conversion model could have carried an authentic 38-value stream without relying on a two-rune slot convention. Original p55 fails the same test, while the positive succeeds.

[Source-native CommonJS reproducer](../sims/lp2_p55_dh5_whole_base29_to761_sft.cjs), executed with the existing Agent36 manual Windows Node22 workflow [passing run 43497402587](https://github.com/FlareZ123/liber-primus/actions/runs/43497402587), checks both orientations, canonical digits, edge counts and positive reconstruction without user-defined phases or loss of original runes.

**Decision:** Retire the *unframed, direct 38-state DH5 modulo761, whole-register BASE29 encoding* as an explanation of the original p55 ciphertext. A future attack needs a separately source-selected input, true compression/encryption rule, or evidence choosing a different modulus/generator. The stronger external 2013 audio factorization → p57 source route was tested separately in [the contemporary source bridge](lp2-2013-parable-table-xor-word20-inverse.md); it remains provisional rather than an authentic p55 key.
