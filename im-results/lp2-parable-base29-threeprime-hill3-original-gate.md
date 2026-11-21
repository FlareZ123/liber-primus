# PARABLE factor-digit Hill3 and literal BASE29 original-cipher gate

**Agent16, 21 November 2026. Classification: bounded original-cipher negative.** This experiment follows Director [#2082](https://github.com/FlareZ123/liber-primus/issues/2082). It tests one exact, source-motivated numerical-to-cipher proposal, without fitting a rune key or changing the original p55 text. **No unknown-page plaintext, creator key, author-selected Hill3 operation, or destination emerges.**

## Authentic input and frozen hypothesis

The pinned original 2013 Cicada OS `761.MP3` ID3 TXXX label is `Parable 1,595,277,641`; its three verses reappear verbatim on original clear LP2 p57. Their GP-prime sums in printed order are 1259, 1031, 1229, whose product is exactly 1,595,277,641. The 2013 Cicada sources teach BASE29 conversion; the original LP2 inscription and solved p56 establish the 29-rune field. These objects provide a compact hypothesis: convert **each prime factor**, without reordering, into the conventional three BASE29 digits, then arrange the rows as the GF(29) key of a three-rune Hill linear transform.

The source-ordered digits and their matrix are:

```text
1259 = 1*29² + 14*29 + 12   → [1,14,12]
1031 = 1*29² +  6*29 + 16   → [1, 6,16]
1229 = 1*29² + 13*29 + 11   → [1,13,11]

K = [[1,14,12],[1,6,16],[1,13,11]]
det K (mod29) = 12
K⁻¹ = [[22,5,3],[27,12,19],[3,17,9]] (mod29)
```

The row-digit sums 27+23+25 equal 75. Physical p55 begins with one rune carried from the preceding page, leaving **75 complete-word ciphertext runes**, exactly 25 Hill3 blocks. The original printed p55 word boundaries do **not** fall after the proposed 27- or 50-rune clause cuts, so a separate claimed *word-aligned* segmentation using those row-digit sums is false. This sum equality is a retrospective selector, and no original text specifies a Hill3 cipher, which original page receives it, or the correct cipher orientation. The experiment therefore tests just the fixed literal interpretation and treats failures accordingly.

## Exact original p55 receiver and solved controls

Keep the opening carried rune intact but outside the 75-rune receiver. For the remaining 75 GP29 ciphertext digits, test the two standard linear-cipher conventions, `P=K⁻¹C` using column vectors and `P=CK⁻¹` using row vectors, grouping from the authentic core start with zero additional offset, no key search, no F exception, and no plaintext editing.

| Fixed original inverse | Normalized 29×IoC | 75/75 original reencryption | Independent clear p57 plant |
| --- | ---: | --- | --- |
| Column-vector K⁻¹ | 0.867387387387 | exact | 75/75 |
| Row-vector K⁻¹ | 0.877837837838 | exact | 75/75 |
| Original untouched 75-rune core | 1.118198198198 | baseline | n/a |

Both inverse outputs are nonlinguistic in canonical GP transliteration. The column output is

`HLAMAEDPNGWSNGYAGAEJGRLMHAEOTHPINOJOEOCTGUFRCEOEWEMLEOOEAXFABGIEXAJNGXEAFGTMDUNGIAWPERUAEO`.

The row output is

`LURUJAAETHTTHUNDLBBTDPJIOERWTHMHAEECXAEONTABIAFEGEOEHWOEIANGBOEHOELUAEIEOWNGOSNLYNEASTBDOYLWM`.

Both decoders exactly invert their ciphertext transform; this verifies arithmetic, **not** original plaintext recovery. The unfit solved-p57 plants show that this implementation would recover a genuine clear 75-rune message transformed by these operations.

## Source-literal BASE29 reading rival

One simpler operation precedes Hill3 speculation: look for the source number and factor digits **unchanged as contiguous GP29 indices** in the original unknown text, with the 2013 BASE29 digits read highest-position first. Exhaustively check each complete physical p0–55 rune-bearing page for the seven-digit product `[2,19,22,14,20,24,24]`, three respective factor triples `[1,14,12]`, `[1,6,16]`, `[1,13,11]`, and their nine-digit ordered concatenation. **All five exact needles have zero hits** across the 55 source pages. This rejects only the direct, unshifted, within-page contiguous serialization; it does not exclude source-selected indexing, a cross-page seam, encryption of the numeric data, or a deliberately nonliteral key use.

## Reproducer and next cipher decision

[Original-input Windows/Node22 CommonJS SFT](../sims/lp2_2013_parable_base29_hill3_p55_sft.cjs) reads canonical `resources/liber-primus/lp2-corpus.json` and `lp2-transcription.txt`, asserts the source matrix and inverse, physical p55 76/75 partition and word cuts, five literal-substring negatives, complete original reencryption, and independent p57 original-clear controls. The expanded original-input test, including every exact literal-number census and the forward and cleartext controls, **passed Windows Node22** in [manual read-only CI run 44950459273](https://github.com/FlareZ123/liber-primus/actions/runs/44950459273). The earlier Hill3-only version passed [run 44950257486](https://github.com/FlareZ123/liber-primus/actions/runs/44950257486).

**Decision:** retire this particular PARABLE-digit Hill3 receiver and unshifted direct-number read. The strongest active alternative remains the separately source-picked p50 base60 descendant nesting 56→57→58 (source-prime-ranked nodes201→74→205), rather than further matrix-sign/phase/radix tuning. That topology still needs independently motivated node-to-physical-page ordering, an observable historical operation and a reversible GP29 ciphertext consumer. The factor product itself may serve as a cross-era checksum or test of a solved message rather than as a key.
