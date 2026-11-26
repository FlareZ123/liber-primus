# p13/p14 Instar-XOR fold: direct GP29 byte encodings fail

**26 November 2026, Agent 35. Classification:** bounded, source-motivated negative. This test recovers no unknown LP2 plaintext, key, or destination.

## Human-visible route and historical operator

The original p13/p14 sequence supplies a plausible human route: p13 contains 272 runes arranged as two 136-rune halves; the immediate successor p14 prints the word **FOLD**, has a related insect illustration, and contains 137 runes. Omitting only the first rune of the printed FOLD word (the candidate literal F at p14 offset 2) leaves 136 runes. Separately, the recovered 2013 Cicada *The Instar Emergence* stage used bytewise XOR to recover the Gematria image and its signed OutGuess payload. The p14 insect and LP2 p57's “instar” language make that earlier operation a plausible lead.

The historical operator is exactly bytewise XOR. The source record at resources/external/2013-instar-xor-source.md also states the crucial limitation: it does **not** provide a canonical mapping from GP29 runes to bytes. This experiment therefore tests only the two most direct mappings supplied by the manuscript itself:

1. GP29 zero-based alphabet ordinal as the byte value.
2. The published Gematria prime associated with each rune as the byte value.

Neither is asserted to be the author's intended serialization.

## Frozen receiver

1. Read original p13's 272 GP29 indices from resources/liber-primus/lp2-corpus.json.
2. Split at 136 and fold the second half back: pair p13[i] with p13[271-i], for 136 ordered positions.
3. Derive each key byte as the XOR of the two pair members, using either their GP29 indices or their published Gematria prime values.
4. Treat only p14's F at page-local offset 2 as a candidate literal hold, leaving exactly 136 ciphertext runes. This is the same unproven F-hold hypothesis documented in im-results/lp2-p13-p14-foldline-Fskip-source.md; it is not promoted to fact here.
5. Apply the historical bytewise XOR with the folded key. Test p14 in printed and reversed reading order.
6. Require every output byte to map directly back into the same 29-symbol alphabet: 0–28 for ordinal encoding, or one of the 29 published primes for prime encoding. No modulo-29 reduction, nearest-prime mapping, or other post-hoc repair is allowed; those would add an unauthenticated and potentially non-bijective layer.

## Original-source result

| Rune-to-byte mapping | p14 order | Output bytes in GP29 alphabet | Invalid bytes |
|---|---|---:|---:|
| GP29 ordinal | Printed | 122 / 136 | 14 |
| GP29 ordinal | Reversed | 124 / 136 | 12 |
| Gematria prime | Printed | 57 / 136 | 79 |
| Gematria prime | Reversed | 62 / 136 | 74 |

For the ordinal mapping, every invalid output is 29, 30, or 31, outside the GP29 range. The exact invalid offsets are:

- Printed: 9, 21, 28, 30, 31, 35, 49, 60, 72, 74, 90, 95, 114, 135.
- Reversed: 1, 18, 30, 35, 36, 39, 50, 59, 60, 63, 110, 133.

Neither reading direction yields a complete rune stream. The prime-value mapping is much worse: most XOR outputs are not one of the 29 published GP primes. Consequently, neither direct ordinal-byte nor direct prime-byte XOR can be the complete reversible 29-symbol p13-fold-to-p14 cipher under the stated F-hold and fold alignment.

## Decision and limits

Retire these four direct receivers. In particular, do not “rescue” them by reducing bytes modulo 29, rounding to a nearby prime, changing the fold pairing, or selecting new byte packings after seeing the failures. Such repairs are not part of the historically authenticated 2013 operation and lack an independent LP2 instruction.

This does **not** reject every possible use of XOR in LP2. The 2013 operator is typed over bytes, and an independently evidenced LP2 byte serialization or image-level operand could motivate a different test. At present, however, the manuscript does not select one. The source-preserved historical operation is a useful hypothesis generator, not proof that any insect-themed LP2 page is an XOR carrier.

The p13/p14 additive fold results remain as recorded in im-results/lp2-p13-p14-foldline-Fskip-source.md. No plaintext or key is recovered here.

## Reproduction

Run with Node 22 and no third-party dependencies:

~~~bash
node sims/lp2_p13_p14_instar_xor_fold_sft.cjs
~~~

The script asserts the original page lengths, F offset, and exact validity counts/positions against the canonical corpus.
