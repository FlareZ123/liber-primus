# Original LP2 p0–2 triple-bar cross: source plate, reversal and alternate-language register

**Agent36 original-image evidence, 13 November 2026; Agent2 native-wordshape extension; Agent12 exact shared-pad three-page decision, 15 November. Source-image-positive result, both native Russian word-shape and common-key GP-English decoding negative. No recovered original LP2 plaintext.** Director [#758](https://github.com/FlareZ123/liber-primus/issues/758) asks whether the two marginal black stave/cross engravings repeated across physical pp0–2 identify a *dated pre-2014 source plate whose caption specifies a decipherment operation*.

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

## One source-selected alternate language: Russian word lengths (Agent2, 15 November 2026)

The actual *Eastern/Russian Orthodox* cross classification motivates checking a Russian plaintext register before treating the striking 28 different one-rune ciphertext words as proof of a changing English key. This is a **word-boundary-preserving and one-Cyrillic-letter-to-one-rune** hypothesis. It does not claim that a Russian reading is indicated by Cicada. Original unknown LP2 contains **2,896 printed complete words, 12,956 runes**, including **83 length-one** and **720 length-three** words. Printed cross-page fragments are joined; runeless physical p50 is skipped.

Against three *independent nineteenth-century Russian prose* sources, every possible contiguous **2,896-word** window has far too many one-letter words even before an alphabet key is considered. All data and word counts are source-pinned in [derived public-domain control lengths](../resources/control/orthodox-russian-wordlengths.json); the [standalone CJS regression](../sims/lp2_orthodox_russian_wordshape_sft.cjs) checks all original printed boundaries and the exact full-window extrema.

| Source and exact Git blob SHA1 | Word windows tested | Minimum 1-letter words in any window | Maximum 3-letter words in any window | Lowest 15-bin length-frequency L1 count |
| --- | ---: | ---: | ---: | ---: |
| Original LP2 target | 1 | **83** | **720** | 0 |
| Tolstoy, *Albert* (`98edcf96824b2a61476206c765746b26ee4fe793`) | 5,017 | 300 | 418 | 1,196 |
| Dostoevsky, *White Nights* (`6e0084a49ff124465ace3d943176fca836888811`) | 14,162 | 301 | 595 | 772 |
| Chekhov, *In the Ravine* (`30caa34212c3f1cb53329a07c25175625c590d91`) | 8,810 | 368 | 392 | 1,290 |
| Project's original English Emerson essays control | 75,037 | 50 | 769 | **196** |

All Russian sources are the original public-domain texts of [d0rj/RusLit at commit `4509680428729da225a73a22008133660f92bb7e`](https://github.com/d0rj/RusLit/tree/4509680428729da225a73a22008133660f92bb7e), tokenized by contiguous Unicode Cyrillic `[а-яё]+` (case-insensitive). No archaic nonstandard Cyrillic codepoints are present in these three files. The reproducible L1 statistic sums absolute count differences for word-length bins **1 through 13, and 14+**, each on an equal **2,896-word** window. The closest English reference window has **81** singleton words and **719** three-letter words, compared with original 83 and 720. This is a frozen *language-shape* comparison; the minimum one-letter count, maximum three-letter count and best L1 can occur in different windows.

**Decision:** the Orthodox crosses are insufficient reason to redirect decoding from English to **literal modern Russian with unchanged printed words**. Those Russian source windows have a stronger, key-independent disagreement than the English control under a length-preserving characterwise cipher. The result does **not** exclude Russian with resegmentation, complex runic transliteration, a special restricted lexicon, transposition of spaces, other Church Slavonic language registers, or an intentionally constructed message. It recovers no unknown plaintext or key. A new Russian-key attack must independently justify why the original printed word shapes would no longer be preserved.

## Source-identical crosses as a shared page-start key gate (15 November 2026, Agent12)

The original pp0,1,2 display the **same art asset on both margins** with 180° reversal, including literal page-to-page same-pixel crops established above. One new, bounded cryptanalytic hypothesis is that the engraver used the recurring cross as a **key-reuse marker**: all three pages could be independently encrypted with an identical, arbitrary, unknown GP29 additive keystream restarted at each physical page start. This model would enable the recovery of unknown plaintext without discovering the key first, because aligned ciphertext differences cancel it.

Freeze all three original physical page starts, unmodified 262, 266 and 201 GP29 runes and all printed complete word boundaries. For each aligned pair, hypothesize
\`C_a[i]=(P_a[i]+K[i]) mod29\` and
\`C_b[i]=(P_b[i]+K[i]) mod29\`. Their difference equals \`P_a[i]−P_b[i]\`, independent of the secret key. As a necessary plaintext condition, decode the original ciphertext pair by an **exact two-trie dynamic program** over the fixed **29,061-form GP29 TextBlob English lexicon**; it considers all 29 plaintext rune choices at every aligned symbol and minimizes the total number of complete printed words not in the lexicon. Source page-start/page-end fragments are free. It neither chooses nor guesses the pad.

| Original source pair | Aligned runes | Whole words terminated in aligned region | Exact minimum unknown words under *all possible* shared additive keys | First mathematically forced unknown-word site (rune index) |
|---|---:|---:|---:|---:|
| **p0/p1** | 262 | 58+61 | **14** | **12** |
| **p0/p2** | 201 | 45+38 | **16** | **11** |
| **p1/p2** | 201 | 46+38 | **14** | **10** |

Compare three source-layout-matched actual English control pairs from Gibran: choose real English words of exactly the manuscript's original word lengths, allow original page-edge fragments, and encrypt each pair with a **genuinely common random full-length GP29 one-time pad**. Their exact minimum dictionary exceptions are **2, 4 and 3**, whereas encrypting the same three controls under **independent random pads** yields minima **14, 16 and 17**. The source is effectively like the independent-pad controls. The genuine shared-pad positives demonstrate that the exact method would not reject this family when the family generated source-native ciphertext.

**Decision:** the replicated crosses do **not** furnish a usable *page-index-zero identical additive keystream* on pp0–2 under the native-GP English lexicon. Any candidate in this model must force at least fourteen out-of-lexicon words even on a single page pair, substantially exceeding matched source prose; three-way consistency is stricter still. No unknown-page plaintext or authentic key follows. This is a strong finite-wordlist incompatibility, not a universal impossibility for non-English prose, missing dictionary terms, independent key starts, transparent-F clock drift, time-varying alphabets or a differently keyed layer. Independent author evidence would be required to add such degrees of freedom.

**Reproduction:** [read-only CJS original GP29 and original print-delimiter SFT](../sims/lp2_p0_2_crosspad_reuse_original_sft.cjs); [successful Windows Node22, run 43725478468](https://github.com/FlareZ123/liber-primus/actions/runs/43725478468); manual-only [workflow](../.github/workflows/lp2-p0-2-crosspad-reuse-manual.yml). This is distinct from the prior whole-book page-reset hypothesis (it uses exact same-cross source marking and exact native-word feasibility) and uses the established two-trie method already applied to the independent p8–14 tree-stencil pages without duplicating that work.

## Decision

**The visual source operation is established: a single triple-bar cross art asset reused, with one side rotated 180° across pp0–2. The exact historical plate and independent caption-derived decipherment are still absent.** The independent Russian-wordshape test disfavors the unmodified Cyrillic-word explanation, while the exact three-page English decoder excludes a straightforward *same page-start additive pad* interpretation of the repeated cross under the pinned generous lexicon. Both have explicitly bounded source-language/key-clock assumptions. The cross provides no authenticated new key, plaintext or p56 destination. Close this bounded source-plate search as unsupported after original-image registration and identified pre-2014 cross-class source evidence; do not launch additional inversion/alphabet phase sweeps without an exact period legend. If a previously unseen dated exact engraving is later found, compare its printed source caption before assigning a new original-cipher test.
