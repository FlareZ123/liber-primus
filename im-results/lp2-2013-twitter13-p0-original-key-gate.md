# The authentic 2013 Twitter palindrome as a fixed p0–2 cipher-key hypothesis

**Decision, 15 November 2026:** No authenticated unknown LP2 plaintext or usable first-chapter key. The four complete original-input inverses below are ciphertext-like. Retire the direct and one-ciphertext-predecessor 13-digit streams; no wider key search follows from this coincidence.

**Original-image correction (16 November 2026):** Physical p0 is red runes 0–7, then the red 13-dot mark after rune 7 (offset 8), then black runes 8–12, then an ordinary black full stop. The older derivative annotation's 13-red-rune span and marker-at-13 position are wrong. The first 13 GP29 values are unchanged, but they form an opening phrase split across red8 and black5, not a continuous red heading. The first black rune after the marker is S at offset 8, not TH at offset 13. Treat any colour-based selector below under this correction; image-faithful code uses resources/liber-primus/lp2-p0-physical-ink-override.json.

## Source-selected operand, proposed receiver, and rival

The first-party 2013 CicadaOS `/usr/local/bin/message.txt` says `@1231507051321`, then `The key is all around you.` The preserved original is [`resources/historical/cicada2013-os-original-message.txt`](../resources/historical/cicada2013-os-original-message.txt). The handle contains exactly thirteen palindrome digits, `1,2,3,1,5,0,7,0,5,1,3,2,1`. This was **already a 2013 Twitter-address instruction**, so the handle's historical authenticity does not license reusing its decimal digits as a 2014 LP2 cipher key.

Original LP2 p0 (17.jpg) begins with a **13-rune opening phrase in two printed groups of 8+5**: the first eight are red, the red 13-dot mark follows at offset 8, and the final five are black. The full p0–2 source-visible chapter has **729** runes; taking the first 13 opening runes leaves **716 subsequent runes**. The repeated 13 lengths make a fixed 2013→2014 *candidate* worth one finite check. Equally plausible rival: an unrelated 2013 Twitter identifier and a recurring stock 2014 punctuation stencil. No Cicada instruction states that the numeric Twitter handle encrypts this LP2 chapter, nor chooses a sign or feedback.

## Locked original-cipher experiment

Fix the exact source digits as a 13-period GP29 key `K_i`. Preserve all 716 source rune values after the opening phrase from original pp0–2 (p0 offset13 onward, continuous page-spanning clock). Use the last rune of the opening phrase, source GP index5, solely as the natural preceding-ciphertext IV when feedback is enabled. Test the two historically simple directions with no fitted offset:

1. **Direct**: `P_i=(C_i ± K_i) mod29` (the straightforward historical GP additive alphabet).
2. **Ciphertext chain**: `P_i=(C_i − C_{i−1} ± K_i) mod29`, where `C_{−1}=5`. This extra candidate is motivated only by the observed original anti-doublet step signature; there is **no first-party command selecting it**.

No new symbol order, hidden resets, altered alphabet, guessed word spacing, skip mask, fitted key byte, or cipher families were added. The 95 clear original p57 GP runes were independently enciphered under each precise candidate and decoded **95/95** as a native positive; all 716 original ciphertext runes are strictly forward-reconstructed for each candidate, as every reversible candidate should.

| Frozen inverse | GP29 IoC on all 716 runes |
|---|---:|
| Direct, `C−K` | **0.034339961714** |
| Direct, `C+K` | **0.034144626323** |
| Chain, `C−previous−K` | **0.034429815994** |
| Chain, `C−previous+K` | **0.034789233113** |

All four complete outputs remain essentially uniform and fail to produce source-native English GP text. The verified source-p57 clear positive itself has IoC **0.062709966405**. IoC is a diagnostic, not an exact cipher impossibility proof; the full outputs and exact loop are available in the compact [Node.js 22 original-input SFT](../sims/lp2_2013_twitter13_p0_key_sft.cjs), [successfully executed on original data in Windows GitHub Actions run 43763556048](https://github.com/FlareZ123/liber-primus/actions/runs/43763556048). The four native-positive calibrations and original 716-rune re-encryptions all passed.

## Meaning for the solve path

The 13-digit source operand is genuine and a human in 2014 could know it; the **cross-release assignment to p0** is conjectural. Both concrete historically motivated consumers reject this candidate as a native GP English decipherment. Nothing supports carrying it into a larger nonce/search schedule, interpreting the palindrome as 13 table columns, or fitting non-additive state rules. This is distinct from the previously rejected direct p0 red13-dot key [#678](https://github.com/FlareZ123/liber-primus/issues/678), which used a key derived from the **red glyphs themselves**, and from p0 prime-difference/27-square routes. The exact **64,167-byte historical Twitter hex memory image** has already undergone an independent large direct-pad/column14 original test in [#262](https://github.com/FlareZ123/liber-primus/issues/262) and [this separate source-byte report](cicada2013-twitter-2014-column14-original-inverse.md). The present test consumes only the historical account **name's thirteen decimal digits**, so it adds no new source-payload claim and must not reopen the exhausted byte-pad route.

**Next actual solution input:** a Cicada-authenticated original instruction that explicitly links an external 2013 operand to LP2 rune positions and specifies a reversible consuming operation, or an independently established p0 plaintext interval. Neither is supplied by the palindrome/count agreement. The original unsolved text and all published keys remain unchanged.
