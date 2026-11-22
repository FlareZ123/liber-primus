# LP2 pp0–2: chapter-wide 180-degree cross duplication and a source-fixed reverse test

**Current decision, 16 November 2026.** The repeated 180-degree cross art on p0–2 is an original-source geometric clue, and the chapter's 729 original runes permit a conditional 27×27 square. Two independently tested direct routes now fail: (i) the existing reverse-reading plus 2015 prime/difference transform, and (ii) newly computed half-turn pairwise GF(29) sums/differences across all 364 opposing cell pairs. Both original fold outputs remain nonlinguistic under an exact source-native solved-page comparison. Neither test establishes that Cicada intended a 27-square operation. **No unknown plaintext, creator-selected key, reusable decoder, or intended continuation was recovered.**

## Original source and player-visible operation

The original physical LP2 page **p0**, archive **17.jpg**, is a 2400×3600 JPEG of exactly 695,525 bytes, SHA-256 `197e1e153958b9a2736b09c10eea7d8bb00e0632fd22a8d9606840becc79942e`. It shows two distinctive **three-bar crosses** to either side of the rune text. The lower-left cross has horizontal bars that become progressively longer downward. The upper-right cross has their lengths reversed.

These are effectively **the same artwork rotated by exactly 180 degrees about the image's geometric center**. This is a literal source-visible reversal, rather than only a semantic association with inversion. The original two cross-bearing rectangular windows, as [left, top, right, bottom] pixel edges, are:

- Lower-left: `[57, 1684, 547, 2960]`.
- Upper-right: `[1853, 640, 2343, 1916]`.

They are 490×1276 pixel windows, geometrically related by `(x,y) → (2399−x,3599−y)` in zero-based original image pixels. Thus their copied placement also preserves the exact central inversion, rather than merely using two similar drawings at unrelated page locations.

Grayscale Pearson correlation after applying the indicated transform is **0.996917457** over all pixels, and **0.945755487** over the union of pixels darker than 210. Mean absolute grayscale difference is **0.971934** over the full paired rectangles and **3.3005** over their ink union. Against the same bounding boxes, the original untransformed, horizontal-only and vertical-only comparison correlations are respectively **−0.061126, 0.386508, 0.188893**. The difference is consistent with reusing one illustration with 180-degree rotation and lossy JPEG compression.

**Chapter-wide source confirmation.** The identical centrally rotated cross arrangement is printed on original **p1 (18.jpg)** and **p2 (19.jpg)**. For each page, the two fixed corresponding rectangles have source-original grayscale correlation **0.997324975** after 180-degree rotation. The lower-left rectangles on p1 and p2 are **pixel-for-pixel identical** to each other. The original p1 JPEG is 667,228 bytes (SHA-256 `f804fae06a68315eb6206158a2b34f55fe157c7d663fa961639fbe8dfc52a39f`); p2 is 595,338 bytes (SHA-256 `74e955ebe248e6d7442e2d2cd3029951f258017987d5762f48e7897cf6611e34`). Under the same two fixed center-symmetric windows across all 58 original LP2 page images, **pp0–2 are the only three exceeding 0.9 correlation**. The highest remaining page scores only **0.153776**. Thus the reversal illustration specifically marks all three pages of the first 729-rune chapter rather than a random page-wide general motif. The crop-specific cross-family test does not rule out other geometric motifs elsewhere in the book.

This finding selects an exact *chapter-specific visual reversal*; whether it instructs the reader to reverse the ciphertext is unproved.

## First original-cipher decision using this reversal

The first visual chapter is original **pp0–2**, exactly **262+266+201 = 729 GP29 runes**. A separately surviving **4 February 2015** solver dialogue selected a precise candidate transformation on this first chapter: prime shifts beginning with prime3 and an imagined GP-F with prime2, then successive modular differences. This operation is documented with the dated original witness and fully reproduced in [the existing first-chapter report](lp2-2015-prime-delta-40-doublet-source-inversion.md). Its original forward reading has **40** equal adjacent transformed rune pairs from 728 opportunities, with an almost uniform marginal distribution and no plaintext.

The three original centrally rotated illustrations admit two distinguishable, source-defined reading conventions: **(a) reverse the entire 729-rune chapter tape once**, or **(b) rotate each physical page separately, reversing its own rune order and keeping the original p0→p1→p2 page order**. The latter is the more literal page-local realization of the printed image geometry. Apply the same independently specified prime/difference operation to each resulting 729-rune tape. Freeze the first-prime convention, fictitious-F initial state, arithmetic sign and full source body. No alphabet or phase search is performed. Formally, for either source order `C[0..728]`:

```text
S[-1] = (0 - 2) mod 29 = 27
S[i]  = (C[i] - prime[i+1]) mod 29, with prime[0]=2
D[i]  = (S[i] - S[i-1]) mod 29
```

The inverse is `S[i]=(S[i−1]+D[i]) mod29`, then `C[i]=(S[i]+prime[i+1]) mod29`; it restores every original rune. The trial reads both complete `D` tapes as one big-endian positional BASE29 integer, expressed in **443 bytes**, as previously tested for the forward original by Agent14. This direct binary reading is a source-era operation but still not explicitly prescribed for LP2.

| Frozen first-chapter reading | Derived adjacent equals | GP29 IoC | First 32 big-endian BASE29 bytes |
| --- | ---: | ---: | --- |
| Original physical order, historical control | **40 / 728** | **0.034504590060** | `16701bee70c4b19d90abf1d05127911a06105c711f6cd4623ca8cc1c2063ea0b` |
| **180-degree reverse order, new source-fixed trial** | **21 / 728** | **0.035024646136** | `0a498603cc1fff37bd8eb44cff86fd940f4824f547c7e25ef28de715777b6bd8` |
| **Each printed page reversed independently, more literal source cue** | **28 / 728** | **0.035254525995** | `0a7210df7f7e7df1848426596b27dbcdd350ed6a0c922fa689bd18945fde8ed9` |

Neither reversal preserves the historically unusual 40-doublet feature. All three outputs remain near the uniform GP29 coincidence baseline **1/29 ≈ 0.034482759**, far from the native-GP English controls in this repository. The whole-chapter reversed 443-byte frame begins `0a49...` and the pagewise reversed frame begins `0a72...`: it has no GZIP, bzip2, PNG, ZIP, PDF, or OpenPGP packet header at byte zero. This check excludes only those direct first-byte container interpretations. It is not a proof that the bytes contain no encrypted or otherwise framed information.

## Full 729-rune 180-degree pairwise-fold inverse (Agent24, 16 November 2026)

The same original half-turn illustrated by p0–2's left/right crosses has an especially simple **keyless geometric operation** on the proposed 27×27 square: rotating the matrix 180° sends source row-major rune `C[i]` to `C[728−i]`. There are **364 disjoint opposing rune pairs** around one fixed center cell `C[364] = NG = GP index21`. Any player could compute the pairwise sum `S[i] = (C[i] + C[728−i]) mod29` and signed difference `D[i] = (C[i] − C[728−i]) mod29`, using the original 2013 GP29 arithmetic without a guessed key. This is a hypothesis about a human-readable rotated-square comparison, with no manuscript instruction selecting the sum, difference, or GP29 representation.

The direct original source [`lp2-corpus.json`](../resources/liber-primus/lp2-corpus.json) has physical pages **262+266+201=729**, in 2014 printed order. The direct unfitted arithmetic on its **364 independent opposing pairs** gives:

| Fixed half-turn field operation | Original output GP29 IoC | Exact adjacent identical pairs /363 | First 12 output GP symbols |
| --- | ---: | ---: | --- |
| GF(29) **sum** | **0.0348136711773** | 11 | OE N R T W B W D D AE E C |
| GF(29) **difference** | **0.0346774437684** | 11 | H W O M C NG E G W IA E H |
| Authentic already-clear p57 control, 95 GP29 symbols | **0.0627099664054** | different text length | PARABLE LIKE THE... |

The two full original outputs appear uniform-like and do not recover known GP English word sequences. Their IoCs are essentially at the uniform 29-rune baseline 1/29, far below the independently known p57 solved-text control. These statistics make a **direct unkeyed sum or difference readout** unpersuasive as native GP29 prose; they are not a proof against a separately specified transform or a nonlinguistic intermediate.

**Exact reversible whole-chapter control:** both channels together and the unchanged central rune recover every original source rune. The field inverse is `C[i] = 15 × (S[i]+D[i]) mod29` and `C[728−i] = 15 × (S[i]−D[i]) mod29`, since 15 is the inverse of 2 in GF(29). The [original source SFT](../sims/lp2_p0_27square_halfturn_pair_sft.cjs) asserts exact blob-normalized corpus input, 364 source pairs, the center rune, all output statistics, full **729/729** inverse reconstruction, and an independent native-p57-rune sum-channel plant recovered symbol-for-symbol. Successful [Windows Node22 original-input CI run](https://github.com/FlareZ123/liber-primus/actions/runs/43824954278).

**Decision:** The manuscript's rotated cross art alone does not make the original 729 runes intelligible through either natural direct pair operation. Any source-selected **two-channel** code remains possible but needs a rule defining how the two outputs encode a message. The unkeyed field fold preserves original ciphertext exactly, so its invertibility by itself supplies no decryption or key. Retire the two single-channel direct prose readings. No further fitted offset, key or per-pair relabelling is justified from the cross ornament alone.

## Result, scope and next decision

The **centrosymmetric artwork placement** is an independently confirmed original-image property that a 2014 player could notice. The new exact keyless half-turn pair test above also excludes direct sum/difference readouts as native GP English under the documented original-source register. It is a more specific original clue than an inferred symbolic reading of the crosses. The **decoder is still missing**: no signed instruction, word key, reversible GP29 output operation or authentic plaintext is fixed by the visual symmetry. When combined with the one independently attested first-chapter prime/difference candidate, both finite literal reverse-original variants fail the precise high-doublet check and has no natural plaintext or file header.

Preserve the original artwork fact as a potential reading-direction cue only. **Retire both source-natural reversed-first-chapter prime/difference plus positional-BASE29 direct-file routes**, as well as direct 27-square GP29 half-turn sum/difference prose readouts. Any additional rotation, sign, offset, secret alphabet or cipher layer requires a genuinely separate original selector.

**Reproducer:** [read-only Windows-friendly original JPEG and corpus SFT](../sims/lp2_p0_central_inversion_source_sft.py), requiring Pillow and NumPy; it checks the three original chapter JPEG SHA-256 values, the p1/p2 pixel-identical artwork, all four p0 image orientations, source ciphertext counts, all three complete reversible transformations, derived-rune statistics, fixed BASE29 prefixes and a 729-rune positive plant from the independently solved p57 source. No existing source file or illustration is edited.
