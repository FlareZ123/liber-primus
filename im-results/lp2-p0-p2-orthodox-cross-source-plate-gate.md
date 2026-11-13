# Original LP2 p0–2 triple-bar cross: 180° reuse, external plate and key-selector gate

**Agent36, 13 November 2026. Source-image-positive result, external-key negative. No recovered original LP2 plaintext.** Director [#758](https://github.com/FlareZ123/liber-primus/issues/758) asks whether the two marginal black stave/cross engravings repeated across physical pp0–2 identify a *dated pre-2014 source plate whose caption specifies a decipherment operation*.

## What the original images actually fix

The 2014 source scans **17.jpg, 18.jpg, 19.jpg** correspond to LP2 physical pp0–2. Original byte SHA256 respectively `197e1e153958b9a2736b09c10eea7d8bb00e0632fd22a8d9606840becc79942e`, `f804fae06a68315eb6206158a2b34f55fe157c7d663fa961639fbe8dfc52a39f`, and `74e955ebe248e6d7442e2d2cd3029951f258017987d5762f48e7897cf6611e34`. Each source page carries a large left and right **triple-bar cross**, including an oblique lower arm. The 2014 publisher placed the same underlying ink artifact in opposite orientation on the two page margins.

Using the same original fixed left crop (x=0–549, y=720–2959) and right crop (x=1720–2359, y=540–1719) on all three source pages, SIFT descriptors matched directly, followed by a single RANSAC homography with 4-pixel reprojection threshold.

| Source page (2014 archive) | Ratio-passed source-image features | Geometric inliers | Fitted transform |
| --- | ---: | ---: | --- |
| 17.jpg (p0) | **856** | **775** | Approximately 180° rotation |
| 18.jpg (p1) | **849** | **790** | Approximately 180° rotation |
| 19.jpg (p2) | **849** | **790** | Approximately 180° rotation |

Every fitted top-left linear transformation is within 0.001 of `diag(-1,-1)`, with off-diagonal entries below 0.001 and negligible perspective term: a **180° rotation**, not independent unrelated shapes or a cryptographic lookup font. Across source 18.jpg and 19.jpg, the *entire left-side fixed 550×2,240-pixel crop is byte-for-byte identical after grayscale decode*; the right-side fixed source crop has **99.057% identical decoded pixels**. These large-area invariants are much stronger than visual shape resemblance. They establish an actual repeated composited cross illustration, printed across the entire chapter. The [read-only original-source SFT](../sims/lp2_p0_p2_cross180_original_sft.py) byte-pins all three JPEGs, asserts exact p1/p2 left-crop equality, and reproduces the three high-inlier 180° source registrations.

## Pre-2014 iconographic source check

These glyphs belong to the general family of **Eastern/Russian Orthodox three-bar crosses**, including variants of the lower oblique footrest. [This 2010 Eastern Christian discussion](https://www.byzcath.org/forums/ubbthreads.php/ubb/printthread/Board/2/main/28301/type/thread) gives a documented pre-May-2014 reference for the symbol's three functional bars: inscription plaque, main arm-beam, and angled lower footrest. The [Uncovering Cicada LP art catalogue](https://uncovering-cicada.fandom.com/wiki/Symbols/Drawing/Art_of_Liber_Primus) has also independently classified the pp0–2 and p22 crosses as “Russian orthodox Cross or papal cross”. These references corroborate **icon type**, not the specific image asset.

Targeted searches for an exact dated original plate using the terms “Russian Orthodox cross”, “papal three-bar cross”, “woodcut”, “rough ink/engraved”, and oblique lower footrest produced generic symbol illustrations and iconographic explanations, **no exact pre-May-2014 engraving match with documented caption, legend, author or key rule**. A modern stock cross line drawing, for example, has substantially different bars and cannot be retroactively treated as the same source asset. The lookup is a bounded test of these named material classes, not proof that no original exists in uncatalogued publications.

The printed pair's inversion offers an *original-image* reversible operation (rotate the right cross 180° to get the left), which a puzzle maker could deliberately use as decoration or as a hint about “reversal”. However, the 2010 iconographic caption describes religious symbolism, not Gematria, Atbash, a 13-symbol cipher or a key clock. No original LP2 author instruction links this illustration to a particular rune transformation. Any source-agnostic 180° positional reversal or GP29 Atbash alone preserves the original page/chapter IoC; physical pp0–2 have source-native IoC **0.03408251556**, much closer to uniform GP29 than known prose, and those operations cannot recover an English-register plaintext from these runes.

## Decision

**The visual source operation is established: a single triple-bar cross art asset reused, with one side rotated 180° across pp0–2. The exact historical plate and independent caption-derived decipherment are still absent.** The cross provides no authenticated new key, plaintext or p56 destination. Close this bounded source-plate search as unsupported after original-image registration and identified pre-2014 cross-class source evidence; do not launch additional inversion/alphabet phase sweeps without an exact period legend. If a previously unseen dated exact engraving is later found, compare its printed source caption before assigning a new original-cipher test.
