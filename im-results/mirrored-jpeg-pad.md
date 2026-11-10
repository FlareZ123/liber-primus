# LP1 p05 mirrored JPEG bytes as an LP2 pad (Agent 13, 2026-11-10)

**Current status: bounded negative for literal mod-29 reductions and fixed-offset skip-aware use of the 05.jpg mirror. No LP2 plaintext recovered.**

## Why this pad was worth testing

Among 75 JPEGs in the supplied original archive, only `05.jpg` contains material after the final JPEG EOI marker: **72,700 trailing bytes**, exactly equal to the first 72,700 file bytes **reversed**. The repository's original `resources/liber-primus/05.jpg` (SHA-256 `2db94921ae5216d8a589890495fa5432446cd3227c45fbeb4934cbb0525112f7`) has the same construction. This is an unusual, reproducible arrangement and a possible signpost to key derivation. The trailer contributes **no independent bytes**, so its intentionality as a cipher clue remains completely unestablished.

The duplicated region is long enough to offer a literal additive pad for the 12,956-rune LP2 ciphertext. Previous broad image-steganography analyses do not, by themselves, test the hypothesis that the already-visible LP1 JPEG bytes are *the key source*.

## Decoder and search space

The CommonJS code reads the actual `lp2-corpus.json` rune indices, the original `05.jpg`, and the English trigram language model trained from `resources/control/shakespeare_first300k.txt` by `sims/grid_keyskip_viterbi.cjs`.

The encryption family is `C_i = P_i ± K_j mod 29`. If a candidate pad symbol would reproduce the preceding ciphertext rune, the decoder permits it to be discarded, consuming the next pad byte; **zero, one or two rejected draws per encoded rune** are modeled by an exact Viterbi recursion. A penalty of 3.5 per extra draw discourages spurious key skips. Two byte-to-rune reductions are searched: `byte % 29` and `floor(byte * 29 / 256)`. Both pad directions are tested.

### Initial fixed-start screen

[GitHub Actions run 42745748353](https://github.com/FlareZ123/liber-primus/actions/runs/42745748353) evaluated 80 configurations (four byte-source orientations × two reducers × two signs × five offsets 0, 1, 29, 256, 3301) over heads of pages 0, 1, 20, 49, 51, and 55. The strongest page-0 180-rune log-score was **−5.50750/rune**. Over 24 independent within-pad circular-rotation null searches of the same 80-setting family, mean best score **−5.47444**, SD **0.08758**, maximum **−5.28561**, empirical **p=16/25=0.64**. The planted positive control, at entropy-diverse offset 3301, decoded **180/180** known runes and matched all four deliberately rejected pad draws.

This first screen supplies a direct matched negative, but does not cover arbitrary byte starts.

### Exhaustive offset search on the mirrored 72,700-byte region

[Successful opt-in run 42746120377](https://github.com/FlareZ123/liber-primus/actions/runs/42746120377) scanned every byte start from 0 through 72,040 inclusive for each of:

- mirrored trailer or byte-reversed trailer (the original prefix);
- `byte % 29` or scaled-29 reduction;
- additive sign + or −.

That is **72,041 × 8 = 576,328** actual key configurations. The offset bound reserves space for a 220-rune confirmation at the maximum three consumed pad draws per rune.

For every combination, a Viterbi 24-rune head score was computed. The best **140** head scores across the entire grid were independently decoded to **220 runes** with the identical model. The best initial head scored **−3.27575/rune**. The strongest 220-rune candidate scored **−5.20918/rune**, using `trailing-mirror:scaled29`, negative sign, byte offset **27,850**. Its output was an irregular 29-rune stream, with no validated readable passage. All 140 shortlisted candidates remained at noise-like language scores on lengthening.

**Positive control:** an independent LP1 plaintext excerpt was encrypted with the actual trailer bytes at a hidden start **12,345**, positive sign, eight rejected pad draws, same two-skips-per-rune mechanism. The head screen ranked the genuine start **#1 of 72,041 possible offsets** for its branch; full 220-rune Viterbi decoding recovered **220/220** runes and **8/8** rejected draws. Planted 24-rune head score **−2.70287/rune** against the highest real LP2 head **−3.27575/rune**. The full planted decoding had much better language fit than the best actual key candidate.

The calibrated initial screen and the exhaustive control show the method can recover strong English plaintext when the hypothesized key family is true. The exhaustive stage itself lacks a full family-wise wrong-key null and covers only a Shakespeare-English score; these limits prevent treating any negative as a mathematical exclusion of the entire family. In particular, more skips, a different reduction, an altered key, differing page starts, different languages, and offsets in the small excluded tail are untested.

## Reproduction and what remains open

- Initial scan + pad-rotation null + 180-rune plant: [`sims/mirror_jpeg_pad.cjs`](../sims/mirror_jpeg_pad.cjs), [opt-in workflow](../.github/workflows/mirror-jpeg-pad.yml).
- Exhaustive 576,328-offset Viterbi head screen, 140 candidate confirmations, plus 220-rune rank-one plant: [`sims/mirror_jpeg_offsets.cjs`](../sims/mirror_jpeg_offsets.cjs), [opt-in workflow](../.github/workflows/mirror-jpeg-offsets.yml).

The mirrored trailer itself is a feasible **candidate key source**, with no evidence yet that the original author intended it as such. This experiment rules out substantial English-like recovery for the specified literal-additive pad reductions and offsets. A full ciphertext-independent source of key bytes, a different decoding relation, or a confirmed explanation for the mirror must supply the next useful constraint.
