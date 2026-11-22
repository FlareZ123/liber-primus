# P55 full 76-runic interior–exterior transport: exact all-secret word-affine and cyclic-order obstruction

**Agent48, 22 November 2026. Director #2219. Classification: source-constrained broad-family original-cipher negative, with original p55 all 76 runes and sixteen full printed words.** No recovered unknown plaintext, original key, authentic transport opcode, destination or positive terminal verifier #41.

## Starting geometry and missing sender instruction

Physical LP2 p55 is original JPEG `72.jpg`: a 76-rune, original-word-punctuated page bounded by two mirrored floral vines, a pale tree and an insect. The first rune completes a word begun on p54; the other 75 runes form 16 complete original p55 words. All 17 page-local fragment lengths are

`[1,4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3]`.

Shed each complete word's two outer runes, retaining the continued singleton in the shell, and the source divides into **33 exterior and 43 strict interior** GP29 runes. The independently solved p57 says *shed our own circumferences*; these words motivate, but do not explicitly define, a cipher process. Prior exact testing proved that a decoder editing the **interiors alone** cannot recover ordinary English while preserving all five p55 two-rune words as printed [source geometry and earlier obstruction](p55-original-33-exterior-43-interior-source-framing.md).

The test here lets **every word rune change, including both endpoints of all 16 complete words and all 33 exterior symbols**. It thus avoids that decisive prior exterior-copy weakness. A natural low-complexity, reversible GP29 candidate is an unknown affine relabeling within each complete word, possibly read clockwise/counterclockwise around that word's boundary. Historical Cicada and the authentic solved p56 establish GP modular29 arithmetic, but **neither p57 nor p55 selects an affine cipher, a cyclic reading, or a wordwise key**, so this is a bounded hypothesis with deliberately over-generous secret freedom.

## Complete, finite all-secret decoder family

For every complete printed p55 word of length `L`, independently and without any key sharing across words, grant:

1. An arbitrary invertible GP29 affine transformation `P_j=(a·C_j+b) mod29`, with **all 28 nonzero multipliers** and **all 29 offsets**. This transforms **both exteriors and all interiors**; every mapping is a permutation of the 29 rune symbols.
2. An arbitrary **cyclic rotation** of the original word's `L` rune positions, and either unreversed or fully reversed order. This grants all **2L** plausible cyclic/rim orientations under the visible mirrored border, in addition to the symbol map. Each candidate is exactly invertible, preserving its original word length and separations. Per-word parameters may be completely different and hidden.

Every one of up to `812×2L` candidates per complete source word is generated exactly. The first p55 singleton is an actual cross-page continuation; it is deliberately not treated as a complete English one-rune word or used to manufacture a failure.

For native-GP plaintext lexical testing, take every alphabetic word token from four existing independent local reference sources: Shakespeare (55,407 tokens), Gibran (15,733), Emerson (77,932), and the TextBlob word-frequency corpus (29,204). Map each to the historically authenticated GP rune spelling, with the project's calibrated `ING→NG` and `IO→IA`, `QU→CW`, `V→U`, `K/Q→C`, `Z→S` rules. A candidate only counts as a lexical hit if **the entire GP rune word** appears in the dictionary with the *exact original p55 word length*. These four corpora supply **422 distinct 13-GP-rune word types**. This is a source-native English comparison, not a complete dictionary of every language, every Cicada word, or a cipher-fit plaintext guarantee.

## Original p55 result

| Complete p55 fragment (page-local index) | Original page rune start | Rune length | Distinct original runes | Exact native word matches under all affine keys and both cyclic directions |
| --- | ---: | ---: | ---: | ---: |
| #4 | 9 | 6 | 6 | **0** |
| #5 | 15 | 6 | 6 | **0** |
| #7 | 23 | 13 | 13 | **0** |
| #8 | 36 | 6 | 6 | **0** |
| #11 | 48 | 7 | 6 | **0** |
| #12 | 55 | 7 | 4 | **0** |

These six wholly original source words contain **45 of the 75 runes in complete p55 words**. There is **zero** exact lexical readout for *each* of them under every possible private invertible affine key and every per-word rotation/reversal. Their indexed original GP transliterations are, respectively, `SEOGDTHAE`, `FIAABCU`, `BEAFXIMUCPHNGLEO`, `MSDIAPF`, `EAEIGXGS`, `ESEOTHTHES`.

The other ten complete words have at least one lexical candidate when their keys are allowed to differ independently. This is not an English sentence: short two-rune words trivially have hundreds of matches under free invertible affine keys. The 13-rune source word contains **13 distinct GP symbols**, but dictionary evidence contains at least one 13-rune word with 13 distinct symbols (`PERTINACIOUSLY`). Thus the negative is stronger than a duplicate-symbol complaint: even that candidate cannot be related to the original source under any of the enumerated affine maps and wordwise cyclical orderings. Arbitrary 29! substitutions, changing rune values non-affinely, could evade the gate and are **not** covered.

The read-only SFT also checks a much narrower original-orientation affine variant: it likewise has zero lexical matches for those six words, and a seventh source word of six runes at offset64. With free reversal/rotation, the latter word acquires exactly one lexical hit; this shows why the most generous family, rather than the tempting original-orientation variant, controls the conclusion.

## Positive source-language reconstruction

To establish that the test could recover an authentic word under its own hypothesis, choose 16 *actual* source-native word types, one of each of the original 16 complete-word lengths, including the source's real 13-GP-rune type. Encrypt each independently with a nonzero hidden affine multiplier, a hidden offset, an independently set cyclic shift and optional reversal. Exhaust the full inverse candidate family without the encryption parameters. **All 16/16 native words are rediscovered**; every planted complete word also passes explicit forward/inverse rune-identity assertions. Thus a positive native-language instance at the actual original lengths survives exactly this family of secret keys and geometries.

The [single-file original-input CommonJS SFT](../sims/lp2_p55_wholeword_affine_dihedral_allkeys_sft.cjs) checks all 76 original page glyphs, the complete 33/43 partition, exact 16-word lengths, full original p55 candidate counts, independently sampled source-positive records and every inverse witness. **Windows Node22 original-source PASS** [GitHub Actions run 45011940165](https://github.com/FlareZ123/liber-primus/actions/runs/45011940165).

## Solve-path decision

**Retire whole-word affine GP29 arithmetic with arbitrary private per-word affine keys and cyclic/rim reading directions** as a *complete original p55 native-GP English decoder preserving the authentic printed word widths*. This is a meaningful whole-page extension of the prior interior-copy obstruction: allowing the 33 exterior rune identities to transform was insufficient in six different complete words.

The negative is conditional on ordinary source-native GP English and the four pinned lexical sources; it is not a proof against an unseen dialect, non-English payload, long quoted nonce, fractionated alphabet, or altered plaintext word segmentation. A fully arbitrary cipher that depends on **both original exterior symbols and all interior rune positions with changing state** remains possible. Its next credible form must supply an **independently original or historical reversible operator and a typed 33-exterior role**, with all 76 output positions and a second original-input prediction. There is currently no such instruction or decoder, so #41's 76-rune terminal candidate cannot be honestly delivered from this route.
