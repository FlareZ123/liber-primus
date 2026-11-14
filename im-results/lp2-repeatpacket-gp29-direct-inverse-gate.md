# Original LP2: repeated-rune packets as base-28 integers, directly inverted into GP29

**Agent 11, 14 November 2026. Exploratory original-cipher inverse; no unknown plaintext recovered.** [Runnable CommonJS source](../sims/lp2_repeatpacket_gp29_inverse_sft.cjs) · [original-input Windows Node22 run](https://github.com/FlareZ123/liber-primus/actions/runs/43574945686).

## Independent clue and decipherment contract

The original 2013 Cicada participant protocol demonstrated BASE29 integer conversion. The unsolved manuscript instead has **86 adjacent identical-rune transitions** across 12,956 runes, far fewer than uniform GP29 expects. A direct no-key transport possibility is that two identical runes **delimit** large base-28 integers, while every intervening transition chooses one of the 28 available runes other than its predecessor. If so, converting the intervening integers *back* to the author-used GP29 numeral alphabet might recover plaintext. This is materially distinct from the previously tested [repeat-framed base-256 byte transport](lp2-rank28-doublet-framing-original-gate.md), [word-local 28-to-29 conversions](lp2-wordframed-radix28-to29-original-gate.md), and [chapter-level PNG byte transport](lp2-base28-chapter-integer-png-transport-gate.md).

Freeze the nine illustration-delimited original chapter intervals p0–2, p3–7, p8–14, p15–22, p23–26, p27–32, p33–39, p40–53, p54–55. The first original GP29 rune in each is a predecessor seed; it carries no digit. For each later original rune C and preceding rune P, a repeated C=P ends the current integer. Otherwise the digit is either the **sorted-remaining-rune rank** d=C−[C>P], or the **cyclic residue rank** d=((C−P) mod29)−1, both in 0..27. Interpret each resulting packet as one big-endian unsigned base-28 integer and convert to **minimal-width big-endian GP29**. Keep every separator and chapter start in the original input. No secret alphabet, offset, plaintext crib, external key, fitted word boundaries, byte format or compression is introduced.

The decoder uses exactly **86 doublet delimiters + 9 source-defined chapter seeds = 95 numeric packets**. This count happens to equal the 95 rune symbols of clear solved p57; neither the original nor an authenticated message selects a one-packet-to-one-parable-rune decoding, so the equality alone is not a key claim.

## Full original-input result

| Fixed rank convention | 95 packet outputs combined | GP29 symbol IoC | First reconstructed runes |
| --- | ---: | ---: | --- |
| Sorted rank | **12,746** | **0.034507472771** | O L EO U U J EA G EO U NG P TH AE H L OE TH AE U |
| Cyclic rank | **12,748** | **0.034466897704** | N C R AE P S W A J L X OE F NG G O EO TH EA T |

The directly recovered streams retain near-uniform GP29 monogram frequencies and visibly nonlinguistic source prefixes. The actual unencrypted p57 control has a substantially higher symbol IoC, printed by the SFT. These outputs supply **no readable native-GP English plaintext** under the exact proposed transport. The result is a direct negative for this literal integer inverse, not an exclusion of compressed data, later encryption or a different framing rule.

**Exact reconstruction and source-native plant.** The run checks all 12,956 original rune positions, 86 delimiters, 95 packet counts and per-chapter lengths. For every original packet, its minimal GP29 integer converts back to the original base28 digits when the observed source packet length is retained to restore leading zeros. The forward predecessor transition then reproduces all original ciphertext runes, including the repeated delimiters and the chapter seeds. An independent planted payload assembled from actual solved p57 GP runes also converts base29→base28→base29 without any wrong digits for every source packet capacity. This positive validates the transport implementation; it does not make original output meaningful.

**Limitation:** restoring the original leading zero digits requires retaining exact observed packet lengths as framing metadata. Thus even the integer conversion is not a standalone universal injective plaintext-to-ciphertext mechanism without an agreed packet-size contract. The manuscript does not name that contract or the rank order. Because both natural direct inverses have random-like outputs, follow-on arbitrary key layers would lose the no-key rationale. A revival requires an independently source-selected framing or codec that predicts actual unknown plaintext.
