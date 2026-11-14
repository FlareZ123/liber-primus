# Direct p56 digest as a historical BASE29 key for p55: bounded negative

**Agent 13, 14 November 2026.** One original-adjacent-page key-transfer experiment. **No unknown plaintext or author-selected key has been recovered.** The source selection of *using a hash target as a key* is hypothetical.

## Original inputs and proposed human operation

The original solved LP2 p56 AN END displays a 128-hex-character digest. The preserved May 2014 64-byte `56.bin` is a derivative conversion of those printed digits, not a separately recovered secret; use the exact hex in `resources/cicada2014-anend-binary-witness.json`. Historical 2013 Cicada server transcripts document an executable `BASE29` conversion. If a player were meant to use the neighboring p56 number on preceding p55, the least arbitrary numeral transport is to interpret the **64 bytes as one unsigned big-endian integer** and write it in the **29 GP rune indices**, without changing byte order or choosing a key phase. This gives **105 base-29 digits**.

Physical p55 has **76 original GP29 runes**. The first continues a p54 word. The remaining 75 form 16 complete printed words, lengths `[4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3]`. The next solved p57 PARABLE says to shed circumferences; removing first and last rune from each of these 16 complete words yields **43 strict interior runes**. That supplies a second independently visible target channel. The full-page and interior-only targets are tested once, using the first 76 or 43 BASE29 digits respectively. Both signs of the ordinary GF29 additive cipher are reported because no signed source instruction chooses addition or subtraction; there are no fitted offsets, shifts or key phases.

## Exact original-cipher results

| Frozen target | Subtract-key GP29 IoC | Add-key GP29 IoC |
| --- | ---: | ---: |
| All 76 original p55 runes | **0.03087719** | **0.02912281** |
| The 43 strict complete-word interiors | **0.03543743** | **0.03654485** |

Original p55 all-rune IoC is **0.03789474**. None of the four outputs forms recognizable GP-native prose. The strict-interior subtraction starts `AE W G X G J IA EO H J F X S J P G`; the full-page subtraction starts `IA OE P E M A B TH I NG P L A O M C S EA EO`. Each decoding has an exact **76/76** full-source re-encryption assertion, including 33 unchanged edge runes under the interior model. The original printed digest bytes independently reproduce the archived SHA-256 `0911bf3c8cc3a73bbb346f82ba65daff3eb81914c4826060ac168bd0f55e267e`.

**Decision:** the direct p56-hex → unsigned BASE29 → additive p55 family does not recover an unknown sentence or key. An exact ciphertext round trip verifies implementation consistency, not authenticity of the proposed operation. The surviving possibility that p56's number is a hash of a lost deep-web page remains unchanged. Do not search arbitrary digest byte orders, hash algorithms, clock phases, fresh KDFs or other target intervals to rescue these outputs without an independent source instruction.

Run the source-complete [Node.js 22 CommonJS SFT](../sims/lp2_p56_literal_digest_p55_base29_gate.cjs) from repository root for the 76/43 original rune outputs, original-source checks and both exact reciphers. The two source files and the solved p57 textual clue are prerequisites, and no external download is needed.
