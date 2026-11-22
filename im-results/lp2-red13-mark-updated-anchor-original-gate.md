# LP2 thirteen-dot red-heading changing-anchor gate: frozen original update fails two independent chapters

**Agent24 · 22 November 2026 · Director Issue #2312 · original-source negative of one explicitly frozen mark-changing rule. No authenticated decoder, unknown-page plaintext, key or final destination.**

## Independently visible update marks and one bounded cipher hypothesis

The source's [originally transcribed red ink and large-punctuation register](../resources/liber-primus/lp2-ink-annotations.json) and the corrected [p0 physical ink](../resources/liber-primus/lp2-p0-physical-ink-override.json) contain **14 original red-rune spans in pp0–55 whose final rune is followed immediately by a real 13-dot punctuation mark**. These are exact marks on physical pages **0, 3, 3, 6, 7, 15, 15, 23, 27, 33, 33, 39, 53, 54**. In all original unknown pages there are **213 red runes** (the remaining 12 of the registered total225 belong to solved p56/p57). Other red runs or 10-dot separators do not trigger this particular definition.

The independently frozen, literal-endpoint update experiment is: after each qualifying 13-dot mark, let `b` be **the GP29 index of that red span's first rune**, and let `r` be **the GP29 index of its last rune**. Apply this pair to following black/body runes until another such red13 mark. Keep every original word boundary and complete cross-page carry. The initial state before the first qualifying mark is (0,0). The first source updates, with global original rune offsets, are:

| Physical page and post-mark absolute position | Cipher-difference anchor `b` (first red rune) | Candidate exceptional plaintext rune `r` (last red rune) |
| --- | --- | --- |
| p0 / offset13 | 15 = S | 5 = C |
| p3 / offset745 | 20 = L | 22 = OE |
| p3 / offset851 | 13 = P | 2 = TH |
| p6 / offset1552 | 24 = A | 12 = EO |
| p7 / offset1874 | 23 = D | 19 = M |
| p15 / offset3612 | 0 = F | 24 = A |
| p15 / offset3623 | 20 = L | 21 = NG |
| p23 / offset5522 | 1 = U | 26 = Y |
| p27 / offset6546 | 19 = M | 13 = P |
| p33 / offsets7970,8059 | 23 = D, 21 = NG | 6 = G, 12 = EO |
| p39 / offset9522 | 27 = IA | 15 = S |
| p53 / offset12648 | 16 = T | 9 = N |
| p54 / offset12657 | 24 = A | 19 = M |

The hypothesis is the compact reversible black-rune differential-affine mechanism

```text
D[i] = (C[i] − C[i−1]) mod29
D[i] = b(mark) + A[i] × (P[i] − r(mark)) mod29
P[i] = r(mark) + inverse(A[i]) × (D[i] − b(mark)) mod29
```

for any possibly unknown **nonzero** rune multiplier `A[i]`. This architecture has an absolute **all-secret keyless invariant** at every body rune:

`D[i]=b(mark) ⇔ P[i]=r(mark)`.

This restriction does not presume a secret key, multiplier formula or linear time evolution. It excludes all original **physical page-first** rune positions because the previous ciphertext might reset at that boundary, and it excludes all originally **red transparent heading positions** because the proposed scheme uses them solely as control headers. The state update **uses only pre-existing visible red GP indices and genuine adjacent 13-dot marks**; neither endpoint, GP indexing, nor the suggested affine law is printed as an actual creator instruction. They are a bounded testable human hypothesis, with an important rival: the marks are merely punctuation.

## Untouched source-native holdout failures

All original unknown **12,956 GP29 runes, 2,896 complete printed words, 55 rune-bearing physical pages, and 32 cross-page word carries** remain unchanged. Map each eligible body-rune site back to the exact original printed word index and ordinal `j=0,1,2,3,4,5,≥6`. Expected plaintext exceptional-rune counts come from genuinely authenticated already-solved Cicada GP29 whole words, independently sampled at each of the actual 2,896 printed source word lengths. Exclude the same original 55 page-first sites and 213 transparent red sites. These are conditional authentic-GP English expectations.

| Original region | Eligible body predecessor positions | Actual `D=b(mark)` | Native expected `P=r(mark)` | Native donor controls |
| --- | ---: | ---: | ---: | --- |
| Source initial p0–14 | 3,522 | **136** | 84.0669 | initial visible check |
| **Untouched p16–21** | **1,607** | **60** | **18.7413** | 2,000 source-length full GP29 plants, observed range **7–35**, zero reach 60 |
| **Untouched p40–53** | **2,937** | **107** | **199.1209** | 2,000 source-length full GP29 plants, observed range **157–236**, zero fall to 107 |
| Other original pages | 4,631 | 184 | 70.1245 | separate non-holdout evidence |

Both untouched regions independently contradict this *particular* source-red endpoint state assignment, in **opposite directions**, for every choice of rune multipliers. In p16–21 the original seven-bin counts are `[10,12,7,10,10,6,5]` against solved-native expectation `[0,3.60,2.03,3.03,5.61,0,4.46]`. The synthetic original-shaped solved GP corpus contains no qualifying `NG`-initial word for these source word lengths, whereas the original would require ten such occurrences. This is a strong *register-conditional* contradiction, rather than a universal impossibility for every conceivable language. In p40–53 the observed seven-bin pattern is `[18,26,22,14,11,6,10]` against expectation `[41.83,18.34,61.10,25.67,15.01,14.90,22.27]`. The source-defined update and both holdouts were frozen before any black-rune anchor score was examined.

## A complete reversible original-input consumer, and why it is not plaintext

For one fully executable source-motivated multiplier choose **`A[i]=8^b mod29`**, with 8 a primitive root in GF29 derived from the original p7 red quartic's factor `X²−8`. Treat the actual original red-heading rune positions as transmitted unencrypted control headers, and carry the previous *observed ciphertext* over printed word and page boundaries. The resulting decryptor/inverse processes the entire **12,956-rune original source** and re-enciphers all **12,956 runes exactly**; the controlled scheme encrypts and recovers a new original-shaped **12,956-rune** source-GP native text with its original red headers, and separately the actual **95/95 solved p57 PARABLE runes** with its seven-rune clear rubric and genuine 13-dot end.

The original unknown black-rune output is statistically non-native: p0–14 IoC **0.0347999**, untouched p16–21 **0.0354017**, untouched p40–53 **0.0354291**, while the actual solved Cicada native GP register has IoC **0.0613867**. None forms sustained readable text. These positive controls validate the operator and exact source positions. Mathematical re-encryption cannot authenticate the endpoint choice or a decipherment.

[Reproduction, Windows Node22 single-file SFT](../sims/lp2_red13_mark_updated_anchor_original_sft.cjs) · [GitHub Actions Windows PASS 45063829473](https://github.com/FlareZ123/liber-primus/actions/runs/45063829473). Source red/header rune locations and original ciphertext are programmatically asserted and every synthetic test has a deterministic seed.

## Director decision

**Close this concrete marker rule:** red-span first/last-rune anchors updated exactly after each original 13-dot mark, with any nonzero multiplier, cannot recover normal native GP29 plaintext in both independent original held-out chapters; the p7-derived power-of-eight concrete version likewise recovers no prose. The result remains narrow: other mark subsets, actual read instructions, state variables that change every word or rune, and complex segmentation-changing or polygraphic operations remain open.

The important missing input is an **authenticated first-party instruction selecting which visible mark changes which decoder state and what key/value mapping it authorizes**. Original 13-dot punctuation and the red spans provide state *boundaries* and *rune operands*, but the source gives **no unique endpoint-to-anchor operation**. Fitting another 29-valued anchor after each mark would violate the intended human solve-path gate and duplicate previously exhausted arbitrary reset searches. Pursue an independently source-selected operation or a literal original plaintext receiver if such an instruction is found.
