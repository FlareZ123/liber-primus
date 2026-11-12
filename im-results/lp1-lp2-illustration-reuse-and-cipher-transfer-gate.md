# LP1-to-LP2 original illustration reuse: p5 moth and p14 reclining figure

## Strongest source result and its decision

**A previously unindexed original-image match locates the LP2 p55 moth in solved LP1 page 5** (archive JPEG `05.jpg`, titled SOME WISDOM). Original LP2 p55 `72.jpg` reproduces the same detailed moth drawing at **2.33091×** the earlier scale without mirroring or appreciable rotation. SIFT original-pixel feature matching yields **313 RANSAC inliers among 316 accepted descriptor pairs**, registered grayscale correlation **0.973947**, and black-ink IoU **0.851713**. This source connection ties the last unsolved LP2 page to LP1's explicit statement that **primes and the totient function are sacred**. The source selects mathematical *topics*, not yet an original p55 inverse, source-origin key, or counter schedule.

Independently, LP2 p22 (archive `39.jpg`) contains the **horizontal mirror of the complete reclining figure** decorating solved LP1 pp14–16 (archive `14.jpg`, `15.jpg`, `16.jpg`). This relationship was previously noticed in [`results/README.md`](../results/README.md) and the [p22 stave gate](../im-results/lp2-opening-stave-second-marker-gate.md); this test adds a reproducible original-pixel certificate: mirrored comparison has **443 inliers among 453 SIFT descriptor matches**, scale **1.005577×**, registered grayscale correlation **0.992524**, and black-ink IoU **0.906207**. In the wrong, nonmirrored orientation, just **4 of 24** accepted feature matches survive the affine RANSAC. LP1 pp14–16 share exactly the same bottom 400 source raster rows, a pixel-identical positive control.

Together with the [already-established LP2 p2 ↔ LP1 p9 mirrored insect](../im-results/lp2-p2-literal-rune-reflection-gate.md), this makes **three artwork families** reused across releases. **The insect appears on LP1 pp9, 13 and 16**, which prevents unique attribution of LP2 p2 to the first-koan inverse:

| Original solved LP1 source | LP2 unknown page | Transformation | Source-derived cipher candidate |
| --- | --- | --- | --- |
| LP1 p9 **and p13/p16**, the identical insect across three different solved-page contexts (first koan, instructions, magic-square material) | LP2 p2, 201 runes (`19.jpg`) | Horizontally mirrored relative to p9 and p16; identical handedness to p13 | **First-koan reflection** is one tested literal rule; the art does not uniquely select it |
| LP1 pp14–16, second koan: “THE I IS THE VOICE OF THE CIRCUMFERENCE” (LP1 pp14–15 solved with `FIRFUMFERENFE`) | LP2 p22, 131 runes (`39.jpg`) | **Horizontal mirror, ~1.0056×** | **Exact 13-rune Vigenère key** tested below; no plaintext |
| LP1 p5, SOME WISDOM: prime numbers and Euler's totient are sacred, with accompanying moth | LP2 p55, 76 runes (`72.jpg`) | **Same-handed enlarged drawing, ~2.3309×** | LP1's source points to prime/totient operation family. Existing independent direct-p55 prime/totient decoder gates have failed; the image alone fixes no prime origin, clock, map, or whole-p55 exception handling |

## Source-attribution disambiguation: repeated LP1 insect before LP2

Original-JPEG registration of the LP1 p9 690×185 insect crop gives an **exact black-pixel match (IoU 1.000000)** at **LP1 p13 archive13.jpg (x851,y1079), reflected** and at **LP1 p16 archive16.jpg (x859,y1455), unreflected**. The p16 grayscale crop is byte-identical to p9 after translation; p13 has gray mean-absolute error 0.03086. LP2 p2 archive19.jpg (x876,y2642) is another reflected copy (ink IoU 0.999972391). All four original JPEGs are SHA-256 pinned in [the exact multisource insect test](../sims/lp1_lp2_illustration_raster_reuse_sft.py), with full original-image evidence in [the consolidated art census](lp1-lp2-crossrelease-artwork-raster-copies.md).

This is a material limitation on the first line of the table: **LP2 p2 has at least three separately positioned solved-LP1 appearances of the same insect**, and none selects p9's first-koan cipher over p13's instructions or p16's square. Therefore direct P=2−C remains a historical operation worth one source-literal check, but its *selection* is not unique and neither a positive nor negative would establish what the maker intended without more evidence.

## Test of two literal operation-transfer candidates

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

## P22 cross-round book-code/coordinate transfer decision (Director #496)

**Source comparison:** The original LP2 p22 scan `39.jpg` contains 131 runes, a separate three-crossbar illustration beneath the runic lines, and the footer that is horizontally mirrored from all three original LP1 source scans `14.jpg`–`16.jpg`. The three source pages are a solved second koan, the explicit instruction `KWESTION ALL THINGS / DISCOVER TRUTH INSIDE YOURSELF / FOLLOW YOUR TRUTH / IMPOSE NOTHING ON OTHERS`, and a `KNOW THIS` 5×5 integer square. The full editor-normalized text and the 25 printed integers are preserved at [LP1 plaintext reference](../resources/liber-primus/lp1-plaintext-reference.txt); the image overlap and 131-rune count are established above. The identical footer across three different source-page texts does not select one particular sentence, plaintext span, numerical origin, or page within the three-page group.

**Historical-operator check:** The independently reconstructed 2012 book-code tasks identify specific external works and supply line/character addresses. The 2014 fifth-onion `Gödel, Escher, Bach` step likewise identifies its external reference by Gödel/Escher/Bach clues and supplies **chapter title : dialogue exchange : word : letter** coordinates. The subsequent Stage10 archived static response returns LP1 pp14–16, but no recorded Stage10/Stage11 instruction transfers that earlier GEB coordinate syntax to LP2 p22 or redefines its chapter/line/exchange origins. See the [source-cited original player solve-path matrix](../workplace/historical-player-solvepath-operator-contract.md) and [Stage10 image handoff](../im-results/2014-stage10-three-images-lp1-source-handoff.md). The LP1 koan's direct speech does not supply an identified GEB chapter title or any source-fixed list of 131 coordinates. Its 5×5 square supplies 25 numbers, with no original rule explaining how to address all 131 target runes or preserve the page's word separators.

**Decisive missing link:** Recognition of a reused source illustration plausibly brings a player back to pp14–16, but does not fix book/edition, page or chapter origin, line/word/letter addressing, coordinate extraction, glyph direction, or a reversible 131-position consumer. The original p22 page supplies no explicit numerical coordinate list or equivalent plaintext instruction. Importing GEB's dialogue-exchange grammar unchanged is undefined for these three LP1 pages; inventing offsets, a square traversal, a cyclic key, or selective source phrases would select parameters *after* examining ciphertext. Thus no unique, source-defined complete p22 book-code inverse is available, and there is no basis for a held-out plaintext test. This is a **bounded no-selector** result for the specific LP1 pp14–16→p22 coordinate hypothesis, not a claim that the p22 artwork or any future source-selected operation is meaningless. Existing direct second-koan Vigenère tests remain the only frozen transfer tested here; they are not repeated.

## Reproducer and scope

Run `python sims/lp1_lp2_illustration_source_transfer_sft.py` with OpenCV/SIFT, NumPy and Pillow in the repository checkout. It consumes only `resources/liber-primus/{05,14,15,39,72}.jpg`, the canonical `lp2-corpus.json`, and the two externally established solved LP1 decipherment equations. An optional `--archive /path/to/liber-primus-jpegs.zip` supplies the same original JPEGs. Both good and wrong orientation, source image crop extents, 0.72 feature ratio threshold, RANSAC reprojection threshold 5, and direct-key clocks are frozen in code.

**Decision:** retain the LP1 p5 moth ↔ LP2 p55 source link as a concrete new candidate selector and annotate p22 with its original-pixel certificate. The distinct same-handed enlargement and mirrored reuses show that *reuse alone* does not uniquely select a reversible operation: direct historically attested original-section operations fail on the two candidate-target pages. For p55, demand an independent, complete prime/totient indexing and F-exception rule before another inversion search. No unknown LP2 plaintext or genuine key has been recovered.
