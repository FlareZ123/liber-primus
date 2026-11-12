# LP1-to-LP2 original illustration reuse: p5 moth and p14 reclining figure

## Strongest source result and its decision

**A previously unindexed original-image match locates the LP2 p55 moth in solved LP1 page 5** (archive JPEG `05.jpg`, titled SOME WISDOM). Original LP2 p55 `72.jpg` reproduces the same detailed moth drawing at **2.33091×** the earlier scale without mirroring or appreciable rotation. SIFT original-pixel feature matching yields **313 RANSAC inliers among 316 accepted descriptor pairs**, registered grayscale correlation **0.973947**, and black-ink IoU **0.851713**. This source connection ties the last unsolved LP2 page to LP1's explicit statement that **primes and the totient function are sacred**. The source selects mathematical *topics*, not yet an original p55 inverse, source-origin key, or counter schedule.

Independently, LP2 p22 (archive `39.jpg`) contains the **horizontal mirror of the complete reclining figure** decorating solved LP1 pp14–16 (archive `14.jpg`, `15.jpg`, `16.jpg`). This relationship was previously noticed in [`results/README.md`](../results/README.md) and the [p22 stave gate](../im-results/lp2-opening-stave-second-marker-gate.md); this test adds a reproducible original-pixel certificate: mirrored comparison has **443 inliers among 453 SIFT descriptor matches**, scale **1.005577×**, registered grayscale correlation **0.992524**, and black-ink IoU **0.906207**. In the wrong, nonmirrored orientation, just **4 of 24** accepted feature matches survive the affine RANSAC. LP1 pp14–16 share exactly the same bottom 400 source raster rows, a pixel-identical positive control.

Together with the [already-established LP2 p2 ↔ LP1 p9 mirrored insect](../im-results/lp2-p2-literal-rune-reflection-gate.md), this makes **three illustrated LP1-to-LP2 reuse routes** grounded in original JPEGs:

| Original solved LP1 source | LP2 unknown page | Transformation | Source-derived cipher candidate |
| --- | --- | --- | --- |
| LP1 p9, first koan: “DO FOUR UNREASONABLE THINGS EACH DAY” (LP1 pp6–9 solved by `P=2−C mod29`) | LP2 p2, 201 runes (`19.jpg`) | Known horizontal image mirror | **Exact koan reflection rule** tested below; no plaintext |
| LP1 pp14–16, second koan: “THE I IS THE VOICE OF THE CIRCUMFERENCE” (LP1 pp14–15 solved with `FIRFUMFERENFE`) | LP2 p22, 131 runes (`39.jpg`) | **Horizontal mirror, ~1.0056×** | **Exact 13-rune Vigenère key** tested below; no plaintext |
| LP1 p5, SOME WISDOM: prime numbers and Euler's totient are sacred, with accompanying moth | LP2 p55, 76 runes (`72.jpg`) | **Same-handed enlarged drawing, ~2.3309×** | LP1's source points to prime/totient operation family. Existing independent direct-p55 prime/totient decoder gates have failed; the image alone fixes no prime origin, clock, map, or whole-p55 exception handling |

## Test of two source-fixed, literal operation transfers

The known LP1 first-koan original inverse is `P = (2 − C) mod 29`, *different from* the generic GP29 Atbash `P=28−C` already tested on p2. On the complete 201 original LP2 p2 rune indices, it leaves unigram index of coincidence **0.03562189** (exactly unchanged, as a bijection must), and the first 85 transliterated output letters are

`NEOUDSXMJHDXEOOIAXOEDXPAEMHJAMREEADPOANGIANGDUFDCOEBXAELEUIOTHOENGPHRIIAHXLRNEONGTHSLHNGFIAJTPMEAAEXSHFWOEYC`.

There is no coherent native-GP plaintext; the result is exactly the expected behavior of arbitrary monoalphabetic substitution on the high-entropy original.

The known second-koan inverse is `P = C − repeating FIRFUMFERENFE` with the 13 GP29 indices `[0,10,4,0,1,19,0,18,4,18,9,0,18]`. On original p22, continuous page-initial subtraction without guessed skip positions has IoC **0.03487962**, against raw **0.03581914**. With the deliberately less favorable blanket “every ciphertext F is unencrypted” interpretation, IoC is **0.03429243**. Both full-position outputs are nonlinguistic. For scale, genuinely solved original p57 has IoC **0.06270997**. The LP1 p14–15 special two F skip positions are known from its own source and do *not* specify skip positions on LP2 p22, so this audit does not fit any.

These two tests reject the *literal original solved-section cipher transfer selected solely by artwork identity*. They do not exclude a different source-defined stateful inverse or a later external dependency.

## Source-selected p55 Wisdom-square 25-step inverse: completed negative

The moth is drawn **above LP1 p5's 5×5 number square**, furnishing a sharper original-source candidate than the general word “totient.” The literal LP2 p55 page has **76 runes**, of which the original GP29 `F` at zero-based **position 25** falls exactly after a first 25-rune pass. A **single non-consuming F** at that predetermined position leaves precisely **75 processed runes = three full 25-cell square cycles**. The location is a defensible frozen hypothesis because the original solved LP2 p56 cipher has a one-F non-consuming exception; whether the authors intended the same rule here remains unknown.

Read the original LP1 p5 5×5 square row-major starting at **272**, repeat it three times, and let each modular key element be **Euler's φ(square cell) modulo 29**, based on the original printed “TOTIENT FUNCTION IS SACRED.” Use the documented solved-p56 subtraction sign, `P_i = C_i − φ(square[i mod 25]) mod29`, with the one fixed literal-F skip at p55 position25. No offset, reverse orientation, extra F, page/word resets or arbitrary codebook is fitted.

The 25-element key is:

`[12,15,10,14,5,4,24,19,12,6,25,23,14,23,25,6,12,19,24,4,5,14,10,15,12]`.

The complete 76-rune LP2 p55 result, rendered in GP29 Latin transliteration with original punctuation omitted, is:

`NINAETHJOEAWNTEONHFDSCOEUAEOEDTHTFTHANTFNPTHHGDNGNRBDCEBUWREOIADEAAEUPJBEOMEOMHHJORWSMMGTWOIA`.

Its native-GP symbol IoC **0.03333333** is worse than the original ciphertext's **0.03789474**, and far below solved p57's **0.06270997**. This exact source-selected 3×25 totient inverse produces no meaningful plaintext. A positive control using 75 actual solved-p57 runes plus one explicit F in the same position round-trips under the identical cipher schedule. Reproduce with [`sims/lp2_p55_wisdom_moth_square_sft.cjs`](../sims/lp2_p55_wisdom_moth_square_sft.cjs) (`node sims/lp2_p55_wisdom_moth_square_sft.cjs`).

The observation 76 = 3×25 + 1 is an intermediate **locked structural coincidence**, not a proof of intended key length. This negative test does not justify changing the square traversal, trying every F, or importing an unspecified extra prime-index transform.

## Reproducer and scope

Run `python sims/lp1_lp2_illustration_source_transfer_sft.py` with OpenCV/SIFT, NumPy and Pillow in the repository checkout. It consumes only `resources/liber-primus/{05,14,15,39,72}.jpg`, the canonical `lp2-corpus.json`, and the two externally established solved LP1 decipherment equations. An optional `--archive /path/to/liber-primus-jpegs.zip` supplies the same original JPEGs. Both good and wrong orientation, source image crop extents, 0.72 feature ratio threshold, RANSAC reprojection threshold 5, and direct-key clocks are frozen in code.

**Decision:** retain the LP1 p5 moth ↔ LP2 p55 source link as a concrete new candidate selector and annotate p22 with its original-pixel certificate. The distinct same-handed enlargement and mirrored reuses show that *reuse alone* does not uniquely select a reversible operation: direct historically attested original-section operations fail on the two independently motivated targets. For p55, demand an independent, complete prime/totient indexing and F-exception rule before another inversion search. No unknown LP2 plaintext or genuine key has been recovered.
