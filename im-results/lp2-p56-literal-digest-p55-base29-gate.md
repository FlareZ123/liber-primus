# Direct p56 digest as a historical BASE29 key for p55: bounded negative

**Agent 13, 14 November 2026.** One original-adjacent-page key-transfer family tested with both rigid and conditional collision-skipped key clocks. **No unknown plaintext or author-selected key has been recovered.** The source selection of *using a hash target as a key* is hypothetical.

## Collision-only rejection on the same literal 105-digit key (Agent12, 21 November 2026)

The direct full-page GP29 arithmetic above assumes each original p55 rune consumes exactly one key symbol. The manuscript-wide adjacent-doublet deficit (86 adjacent identical runes across 12,956 unknown runes, against approximately 447 under a uniform-null model) suggests a distinct hypothesis: a creator might have rejected a tentative symbol equal to its predecessor and advanced the key. This section tests the same original p56 signed digest interpreted as one unsigned base29 integer, but lets a key draw be skipped **only** if the tentative ciphertext would repeat its preceding rune. The source does not authenticate this choice of mechanism.

Freeze the first **105** base29 digits, original physical p55 **76** GP29 runes including the p54 carry, phase zero and the two additive signs. Exactly one rejected draw per glyph is permitted, with Viterbi cost3.5 per rejection and a global cap34. Both winning original paths use 77 or 78 source digits, respectively, far below105; no recycled source bytes, guessed IV, phase, page offset, plaintext target or key orientation are admitted. Reuse the existing second-order GP language decoder and a fixed 256-trial whole-key shuffle comparison.

| Candidate | GP trigram log-score per rune | Inferred rejected key draws | Source input consumed |
| --- | ---: | ---: | ---: |
| Original p55, C=P+K | **−5.814233** | 1 | 77 digits |
| Original p55, C=P−K | **−6.041237** | 2 | 78 digits |
| Solved p57 76-rune positive plant | **−2.761050** | 3 | 79 digits |

The source-key best original decode starts `IAOEPEMABTHINGPLAOMCSEAEOAECTHI`, and remains nonlinguistic despite the source literal round-trip. The independent solved p57 76-rune plant, actually encrypted with three collisions, is recovered **76/76** with all three correctly inferred skips. Among 256 deterministically shuffled literal 105-digit keys with both signs scored, **149** outperform the authentic source order (matched null median **−5.772573**, upper-tail `(149+1)/(256+1)=0.583658`).

**Decision:** under this frozen anti-doublet additive Viterbi operation, the original printed p56 SHA-512 digest has no distinguishing key evidence for p55, and authentic plaintext is not recovered. This resolves the collision-avoidance exception omitted from the original rigid-key test above. Do not reopen it with unfixed digest directions, clocks, or KDFs absent a first-party selector. Read-only [CJS source SFT](../sims/lp2_p56_digest_base29_p55_collision_keyskip_sft.cjs) · [Windows Node22 PASS 44942315726](https://github.com/FlareZ123/liber-primus/actions/runs/44942315726).

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
