# LP2 p24–p26 mayfly word-weave: exact original all-order obstruction

**Agent9, 22 November 2026.** Director [#2271](https://github.com/FlareZ123/liber-primus/issues/2271). **No new LP2 plaintext, creator key, authenticated opcode, or destination was recovered.** An unmodified three-page whole-word shuffle (including whole-word reversal) fails to produce ordinary source-native GP29 English. A separate value-changing layer is still possible.

## First-party artifact and visible premise

Original physical LP2 p24/p25/p26 use archive 41.jpg/42.jpg/43.jpg, **270/273/265** runes and **12 true printed lines per page**. Each contains repeated bilateral insect/mayfly art framing the runes. In the 2400×3600 original bitmaps, both the **left crop x0..549,y1000..2749** and **right crop x1850..2399,y1000..2749** are pixel-identical on p24 and p26; p25 has a slightly shifted rendition. The artwork supplies three visually similar pages. It has no uniquely visible lane order, value-changing cipher, clock, key, or traversal. Rival: the figures are reused manuscript framing. This is an observation about the specified crops, without asserting that all image pixels or original JPEGs are identical.

Original JPEG SHA256: 41.jpg = 62148ef272d17bcedf5df30f6cc9e52df127113c18c1cf57ea92c75feedfce80; 42.jpg = a7d6e597debff4f7c5b3516e1b02ca2e4fa5b37d972f567264ed2ec845013cff; 43.jpg = ed88f5fcdca3d1f846538caa8be979aa28cde969eb99c9464d60daa26c1f9af7.

The original transcription, with actual cross-page words joined, contains **178 complete words covering 805 runes** inside p24–p26. One extra **7-rune word from p23 into p24** contains three runes in the 808-rune target and four outside it; treating it as complete would invent an operand. The 178 complete words have **627 within-word adjacencies, eight of them identical-rune events**.

## Whole-class exact theorem

For the original 178 complete rune words, all permutations of the original words, and any independently selected whole-word reversals, preserve **every global GP29 glyph count**. An arbitrary permutation of all 805 runes also preserves those counts. Consequently they preserve:

- IoC = sum over glyphs of f(g)*(f(g)-1) / (805*804).
- B5 = largest possible total count over any five distinct GP29 rune glyphs.

The authentic unchanged 805 original runes have **IoC = 0.034399431414356786** and **B5 = 171/805 (21.24%)**. For the full 808 physical runes, IoC = **0.034355944888169114**. Merely reordering words, full runes, or lanes cannot increase the native-language concentration of the entire target. The standalone SFT explicitly performs and reverses a deterministic complete-word permutation with independently reversed selected words, verifying byte-for-byte original word replay. That permutation is an implementation control, not an alleged original cipher.

## Full-shape source-native language controls

For each of Shakespeare, Gibran and Emerson, take **2,000 deterministic independent original-word-length-matched GP29 source-language donors**, preserving every one of the same 178 original word lengths and all 805 rune sites. Native GP encoding is word-local, handles the solved-LP1 **ING/IO** spelling, and reproduces the independently solved **95 GP runes of p57** exactly. The controls sample source words by their attested token frequencies, conditional on matching original lengths. They are not independently withheld natural-running quotations.

| Native GP control | Trials | Minimum control IoC | Minimum top-five count | At/below original on either |
| --- | ---: | ---: | ---: | ---: |
| Shakespeare | 2,000 | 0.05506628 | 300 | 0 |
| Gibran | 2,000 | 0.05454405 | 307 | 0 |
| Emerson | 2,000 | 0.05497049 | 311 | 0 |

Thus **0 of 6,000** matched native-GP English books has the source's low full-target rune concentration. These are model-conditional empirical comparisons, not a proof about arbitrary English, deliberate acrostics, other languages, or alternate intermediate alphabets.

As a separate source-attested lexicon bound, the three reference texts provide **12,228 distinct GP29 word spellings**. Only **5/178 actual original words covering 8/805 runes** are direct word matches; none of the original **104 words of length at least four** is directly recognized. Even allowing every word to be reversed independently raises that maximum to **7 words / 14 runes**, with only one reversed four-rune word recognized (FATE). This is a finite-register exact matching result, and the corpus can contain accidental short strings.

## Cipher decision and necessary next operand

**Retire direct intact-word-only and arbitrary-rune-position-only three-page weaving as sufficient native-GP plaintext inverses.** Every such complete-original register has the same full 805-rune histogram; lane exploration cannot change it. The actual page layout provides no independently chosen rune-changing opcode. This result does not exclude 150 isolated plaintext runes mixed with undecrypted material, a value-changing layer paired with weaving, missing separator information, different letter encoding, or an author-selected external key.

The first remaining productive decision is to discover independent source evidence specifying a **rune-value-changing operation/key and its 2014-plausible use**. Freeze it before decrypting original text; require continuous original plaintext, a withheld holdout, authentic solved controls, and exact forward replay. The earlier [all-secret 3×3 page-mixer gate](lp2-p24-p26-three-track-gl3-allsecret-original-gate.md) and shared-pad study already reject different conditional families; do not retread them.

## Reproduce

Single-file Windows Node22 CommonJS [original-source SFT](../sims/lp2_p24p26_whole_word_weave_original_sft.cjs). Inputs: committed original corpus/transcription, solved p57, Shakespeare/Gibran/Emerson GP-native reference texts. Assertions include source page-rune agreement, original cross-page word joins, exact whole-class histogram invariance, word reversal/replay, dictionary coverage, and all 6,000 English word-shape controls. The program is read-only and prints deterministic counts.
