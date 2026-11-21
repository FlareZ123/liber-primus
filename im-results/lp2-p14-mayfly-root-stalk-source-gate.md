# LP2 p14 mayfly and rooted-stalk source gate

**Agent48, 21 November 2026.** Director Issue [#2023](https://github.com/FlareZ123/liber-primus/issues/2023). **Original-pixel finding:** the rooted stalk on LP2 pp8–14 is recycled in alternating page positions, without mirroring. **Source decision:** the historically documented mayfly illustration identifies a different LP2 drawing family, and no exact external source or author-specified decoding operation was recovered for p14. No new LP2 plaintext or key.

## First separate the original art objects

The actual LP2 p14 is original `resources/liber-primus/31.jpg`, 2400×3600. On the *left* is a narrow, rooted **stalk with side branchlets**. On the *lower right* is a side-profile **mayfly-like insect**, with one upraised net-veined wing, dark-banded strongly curved abdomen ending in three filaments, a head facing right, and legs/antennae. These are independent illustrations. Calling the plant a confirmed oak tree is incorrect: the p14 engraving has an extended narrow stalk and rootlets, with none of the thick trunk/branches of the differently printed p32 or p55 oak/tree imagery.

The original p23–26 images (archive 40.jpg–43.jpg) show another, nearly symmetric vertically aligned insect/wing design on both sides of each text column. The original p57 (archive 74.jpg) shows a dissipating version of this *vertical* shape. The p14 side-profile specimen has a visibly different outline and wing venation from that family; a source attribution for the later family cannot automatically identify p14.

## Strong within-manuscript control: seven rooted stalks, alternating placement

On original `25.jpg`–`31.jpg` (LP2 pp8–14), the rooted stalk appears in exactly this page order:

| Physical page | Image | Stalk location |
|---:|---|---|
| p8 | 25.jpg | left |
| p9 | 26.jpg | right |
| p10 | 27.jpg | left |
| p11 | 28.jpg | right |
| p12 | 29.jpg | left |
| p13 | 30.jpg | right |
| p14 | 31.jpg | left |

In decoded RGB pixels, the fixed source rectangle **(0,600,480,2950)** from p10, p12, and p14 is **identical byte-for-byte**. The p9, p11, and p13 right-side rectangle **(1910,600,2400,2950)** is also identical byte-for-byte within that group. The p8 left crop has noticeably different source pixels and is intentionally excluded from the exact equality claim.

A mirrored-orientation interpretation is **directly falsified**. Register p10's stalk pixels in the source box `(45,690,445,2870)` to p11 with pure rightward translation of **1784 native pixels**: the original dark-pixel masks (mean RGB below 120) have intersection-over-union **0.969451646**. Reflecting p11's right half left-right and optimising over 146 plausible horizontal shifts achieves **at most 0.102847221** IoU. The **same drawing is moved** between left/right margins without being flipped. Relative to p10, p8 retains its left-side orientation and geometry but is separately rendered rather than pixel-identical.

[Standalone source-pixel SFT](../sims/lp2_p8_14_plant_position_original_sft.py) uses the original JPEGs, Pillow, NumPy and explicit boxes. Its frozen assertions test exact same-side crop reuse, the 1784-pixel translation, no mirroring, and the p8 difference. This establishes a precise page-layout operation; it does **not** imply that changing page side is a ciphertext transformation or that the pattern is a secret key.

## Fixed stalk-side reading test

Director #2033 freezes one literal candidate: read every printed line from the side bearing the stalk, retaining top-to-bottom lines and page order. Accordingly the three right-stalk pages p9/p11/p13 have each line's glyph and punctuation order reversed; p8/p10/p12/p14 remain in their printed order. Slash denotes a line break and remains at the line end. The inverse reverses the same lines again, restoring every original line including punctuation. This tests a direct reading, not an independently specified second cipher layer.

Across the seven original pages the rule covers **1,729 runes** and **1,456** page-contained sliding 40-rune windows. The best window scores **−11.93957** nats/trigram under the pinned English-to-GP29 trigram model; none reaches its held-out native-text first percentile of **−8.90364**. The untransformed p8–p14 pages and the p3–p7/p15–p21 controls likewise have no 40-rune window reaching that threshold, whether read as printed or with the same parity reversal used purely as a diagnostic. Solved clear p57 scores **−7.81808** across 95 runes. A held-out English plant survives the exact line-map inverse. These are language-model diagnostics, not proof that every possible English string scores above the threshold.

**Decision:** this single side-to-reading-direction rule yields no coherent 40-rune plaintext, selected key, or typed receiver. The result does not prove the artwork decorative or exclude a different source-selected operation or an additional unknown cipher. Retire this particular direct reading rule without a direction/phase sweep. Original JPEG side placement and the fact that the drawing is translated rather than mirrored remain unchanged. Reproduce with [the source-native CommonJS SFT](../sims/lp2_p8_p14_stalk_line_direction_sft.cjs).

## Historical insect-image attribution and the missing exact p14 source

A [22 April 2022-era community source discussion](https://github.com/scream314/cicada3301/issues/20) records the claim **“Mayfly 5, vertically flipped is an exact match”** to `http://www.metafysica.nl/wings/thieme_90.jpg`. This URL is a complete illustrated plate cited as **Figure 4, specimen 5**, on the [metafysica.nl insect-flight site](https://www.metafysica.nl/wings/wings_14.html). Its printed underlying reference is *Thieme's Insektengids* (SEVERA, 1977), and the specimen is ***Ephemerella ignita*** (6–9 mm, family Ephemerellidae). A separate [earlier Uncovering Cicada PAGE 57 note](https://uncovering-cicada.fandom.com/wiki/PAGE_57) explicitly attributes **the p57 altered mayfly of pages 23–26**, *not p14*, to the same Figure 4 specimen5. The extant site returns an interstitial rather than raw `thieme_90.jpg` image bytes in this fetch environment; the 2022 exact-match claim therefore has **secondary community attribution**, while the source page's caption and illustration inventory can be inspected directly.

Consequently the 1977/2022 Figure4 specimen5 precedent **must remain scoped to the p23–26/p57 vertical imagery pending direct visual registration**. Identifying it as the exact *p14 side-profile* master without a pixel or geometry match would silently merge two different visible drawings. It does independently make the insect/instar motif historically intelligible.

Other inspected pre-2014/period natural-history source families: (a) the 1897 Halford *Dry Fly Entomology* plate; (b) the 1917 U.S. Bureau of Fisheries [Ephemeroptera plate](https://commons.wikimedia.org/wiki/File:Ephemeroptera_illustration.jpg); (c) 1969 T. T. Macan *The Study of Mayflies*; (d) Australian Museum mayfly anatomy material and its named illustrator. They explain an adult mayfly's upraised wings and paired/triple tail, but none inspected has a proven source-identical image of p14, a page-relevant sequence of cipher operands, or an executable source-authored decoding instruction. The p14 drawing's wing and tail are plausibly stylised by the LP creator, but the artwork origin remains unresolved.

## Life-stage identification gate (#2034)

**Agent33, 21 November 2026.** The p14 side-profile drawing has a large, expanded, veined upright wing and three apparent terminal filaments. These visible features support a **mayfly-like winged form**; its stylized, low-resolution anatomy does not establish a species, sex, or exact life stage. In particular, visible wing venation and tail count do not distinguish the winged subimago from the imago. No abdominal gills are clearly depicted, but absence in a simplified drawing is weak evidence. This is an anatomical interpretation of the drawing, not an authenticated artist's identification.

A pre-LP2 entomological source supplies the critical distinction: Edmunds and McCafferty, [“The Mayfly Subimago,” *Annual Review of Entomology* 33 (1988), 509–529](https://ephemeroptera-galactica.com/pubs/pub_e/pubedmundsg1988p509.pdf), pp. 509–510 and 515, describes a winged subimago and a winged imago as separate instars; the mature larval wing remains folded within a small casing. The two winged forms can be similar, and their distinction uses features including wing-membrane microtrichia, marginal cilia, gloss, and relative appendage lengths. A [2004 mayfly identification key](https://fishermonk.com/programs/keys/shortkey.html) independently describes nymphal wing pads and the two winged forms. Neither source identifies the p14 artwork. A line drawing with no preserved specimen, reliable scale, microscopic wing surface, or confirmed source plate cannot discriminate the two winged forms using these criteria. It is inconsistent with an ordinary intact aquatic nymph **if the drawing is an anatomically faithful mayfly**, but it does not select either winged instar.

The word “instar” itself does not select the nymph: the 1988 review explicitly applies it to both winged stages. The p57 parable's tunneling and emergence are a metaphor and provide no taxonomic caption or stage label for p14. The separate p23–26/p57 vertical artwork likewise lacks a directly registered and stage-labeled original plate in this record. Therefore p14 → p23–26 → p57 has no independently determined developmental sequence, and neither biological chronology nor the parable selects a unique permutation, cipher operand, or original-cipher receiver. No biological key was tested.

**Decision:** retire the proposed life-stage ordering as an unsupported decoding route. This is a bounded inference from the surviving images and cited biology, not a claim that the artist intended no mayfly reference. Reopen only if a source-identical, stage-labeled p14 image and an authored page-to-cipher instruction become available. The earlier p23–26/p57 specimen5 attribution remains a separate, secondary-source claim and must not be transferred to p14.

## Fork and source-selected operation

**What the source does fix:** a six-page exact reuse of rooted-stalk artwork, an L/R/L/R/L/R/L page-placement convention, and an original **translation (not reflection)** between the alternating drawings. The older mayfly plate is a valid separate historical comparison for the p23–26/p57 family.

**What is absent:** an independently proven p14 insect specimen-source match, a 2014-or-earlier source that specifies how to use the illustration to read one p14 rune, and a particular reversible GP29 cipher receiver. The uniform alternating stalk placement and duplicate master image supply a stable **layout clue** rather than an independent per-page key. Turning left/right into 1/0 and using it as a periodic cipher key would be an arbitrary, underdetermined mapping unless another authenticated clue specifies such a consumer.

**Director decision:** close this bounded image-attribution task with the exact reproducible original-geometry finding and historical-source separation. Future work should act only upon a newly recovered primary source for the *p14 side-profile* specimen or a source-authored instruction assigning the page layout to a specific ciphertext operation. Do not re-run generic mirror-reversal, mayfly-numerology or imago/instar key menus without such a selector.
