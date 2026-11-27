# Opening-stave second-marker gate

**Decision:** no second independent, source-selected twig/cipher-rune marker was found. Close Issue #194 as a bounded evidence decision. This does not erase the measured p0 3|3 geometry or prove that the opening figures are purely decorative; it establishes that the proposed reading has not yielded an independently selected cipher symbol, key, or reversible operation.

## What remains supported on p0

The existing [original-image geometry SFT](../sims/lp2_opening_stave_geometry_sft.py) fixes the two p0 crops on original scan `17.jpg`. Each has three prominent branch groups on each side of its main axis at thresholds 80, 85 and 90. The same-side p1/p2 crops (`18.jpg`, `19.jpg`) are pixel-identical; the p0 left/right figures are 180-degree counterparts under the existing registered comparison. The original red-span annotation fixes 13 red runes at p0 offsets 0–12, followed by black GP rune TH at offset 13.

The 3|3 geometry is compatible with Hahal-runa, but the source-family choice changes its value. Derolez's *Runica Manuscripta* (1954), ch. II, pp. 89–122, reconstructs the Anglo-Saxon Isruna tract from five manuscript witnesses. It defines Hahal-runa as encoding the group/row on the left and the rune's position on the right; the Futhorc uses three groups of eight for its first 24 runes. In the Futhorc order matching the opening 24 GP29 symbols, the third group is `t b e m l ng oe d`, so **3|3 = E**. Of those witnesses only Salzburg explicitly separates a fourth group of four. Cotton Domitian A IX f.11v independently gives 3|3 = E and contains Ior, but marks no Ior-group boundary. [Source and exact ambiguity](lp2-anglosaxon-isruna28-gp29-gate.md). [Digitized Derolez text](https://old.katab.asia/special/Rene_Derolez_-_Runica_Manuscripta.pdf). By contrast, the reversed Younger Futhark 6:5:5 order `tbmlʀ / hnias / fuþork` does give **3|3 = TH**, as described by [Uppsala University](https://www.runforum.nordiska.uu.se/blog/cryptic-runes/); [Menota §18.3.13](https://www.menota.org/HB4_ch18.xml#18.3.13) confirms the usual row/position convention. That TH readout is a cross-family import, not the default Hahal-runa readout for the Anglo-Saxon Futhorc used by GP29. The first black p0 glyph is visibly TH, but it is ciphertext, not independently known plaintext; using it to select the Younger order is post hoc. The 180° paired motifs may suggest reversal, but do not uniquely select reversed ætt order. The p0 pair and repeated copies are not independent confirmations.

## The only plausible crossbar near-match: p22

The original scan `39.jpg` (physical p22) contains a horizontal beam-like illustration below the text. The existing p0 branch-profile function was applied unchanged to its fixed ROI `(627, 2235, 1739, 2632)`, after the two possible quarter-turns. The counts below are numbers of lateral-profile peaks selected by that function, not hand-assigned rune values:

| Rotation of p22 object | Threshold 80 | Threshold 85 | Threshold 90 |
| --- | ---: | ---: | ---: |
| 90° counter-clockwise | 6\|3 | 5\|3 | 4\|3 |
| 90° clockwise | 3\|6 | 3\|5 | 3\|4 |

Only the clockwise/threshold-85 setting gives 3|5, which Menota's example reads as R. The same fixed detector gives 3|6 at threshold 80 and 3|4 at threshold 90. The source does not select a quarter-turn, a threshold, or a rule for treating the illustration's smaller projections as branches. Thus the R reading is not stable under the already declared robustness thresholds. The image has three dominant transverse projections, but its full profile is an irregular horizontal object rather than a clean branch-rune.

**Historical heraldic source gate (Director Issue #325).** The pre-2014 [Papal Cross description](https://symbolsproject.eu/explore/crosses/papal-cross.aspx) defines a staff with three horizontal bars near its top, diminishing in length toward the top. The [Catholic Encyclopedia's historical review](https://www.newadvent.org/cathen/04533a.htm) notes that double- and triple-bar crosses often have chiefly heraldic existence. The p22 beam can be made to resemble a three-bar staff after a quarter-turn, but its three projections are spaced along the long shaft rather than grouped near one end; their placement and lengths do not reproduce the defining Papal Cross arrangement. This is a broad three-bar resemblance, not an exact heraldic source match, and neither source selects the rotation, branch order, or a cipher readout. The lower p22 figure is a separate mirrored LP1 footer strip, not part of the upper beam.

**Orientation premise correction (Director #2780, 25 November 2026).** Archive `17.jpg`–`19.jpg` are physical **LP2 p0–2**, not solved LP1; the genuinely solved LP1 footer counterparts are archive `14.jpg`–`16.jpg`, and correspond to the lower reclining figure, not to the crossbar. Direct examination of the supplied original four JPEGs confirms the opening pair has its longest transverse bar at one end of the three-bar cluster, whereas p22 is a differently drawn horizontal beam. The existing geometry SFT already performs both fixed quarter-turn registrations, requiring the best p22-to-p0 ink IoU to be below .70 versus above .95 for the genuine 180° opening-template pair. Thus visual similarity does not establish a rotated copy. The period-available [Daniel E. Beards, *The Russian Three Bar Cross*, 20 June 2013, New Jersey State Library](https://dspace.njstatelib.org/items/f9a772bb-bbcb-4055-88af-a8450987b09d) identifies the upper inscription, central principal crucifixion bar and sloping lower footrest. The [Orthodox Church in America explanation](https://www.oca.org/questions/liturgicarts/the-russian-orthodox-cross) supplies the same distinct roles, but no instructional cipher geometry. The opening engraving's longest arm at one end of its three-arm cluster is not the canonical central main arm; the p22 object does not acquire the conventional sequence merely by rotating. This rules out treating the dated generic religious identification as an exact source diagram, not every possible religious allusion. #1381 already searched for a joint p22 plate and considered Yagi, cross and Ogham alternatives; #1168 found no complete inscription, #1146 rejected the fixed three-rail inverse. No new independent historically documented operation, exact source drawing or authored target coordinate is established. No cipher sweep warranted.

There is no unique adjacent text prediction either. Canonical p22 has 131 runes, begins NG, ends X, and contains 11 TH tokens and 5 R tokens. If the below-text image is instead treated as a pointer to the next page, p23's red span occupies offsets 0–15 and the first black rune after it is EA, not R or TH. Neither association is selected by the image.

## Other branch-like artwork

A page-by-page visual pass over the 58 original LP2 scans found no other discrete staff with a stable, source-readable branch-count layout.

- The tree in the left margin on pp8, 10, 12 and 14 is the same pixel-identical crop on scans `25.jpg`, `27.jpg`, `29.jpg` and `31.jpg`. The right-margin tree on pp9, 11 and 13 is likewise pixel-identical across `26.jpg`, `28.jpg` and `30.jpg`. These are repeated full tree drawings with roots and multiple irregular branches, not separately varying stave symbols.
- The left and right vine-border crops on p49 (`66.jpg`) and p55 (`72.jpg`) are pixel-identical between those pages. The p55 central dead-tree image belongs to the already reviewed tree-source branch (Issue #240); it supplies no new branch-rune selector.
- The p22 beam is the only other plausible crossbar object. Its profile and page association fail to select a unique rune, as detailed above.

The reproduction script [`lp2_second_twig_marker_gate.py`](../sims/lp2_second_twig_marker_gate.py) uses the existing p0 peak detector, the original JPEGs, the canonical corpus and ink annotations to reproduce the p22 threshold/orientation counts, repeated tree/vine crops, and p22/p23 text-boundary checks.


## 26 November p0 E/TH and 13+1+55×13 update

The p0 3|3 motif now has two competing source interpretations that must remain separate:

- In the Anglo-Saxon Isruna/Hahal-runa Futhorc order matching the first 24 GP29 runes, 3|3 = **E**. The 13-rune red heading is `SHEOGMIAF` + `SYENGC`, and the third rune of each word is E. This is a precise local correspondence between the two staves and the two red words.
- In the reversed Younger Futhark 6:5:5 order, 3|3 = **TH**, matching the first black p0 glyph. If that glyph is then treated as a sentinel, the p0–p2 corpus partitions as 13 red runes + 1 black TH + 715 remaining runes, where 715 = 55×13. This suggests a 56-row, 13-symbol page-key matrix (red row for p0 plus 55 rows for p1–p55).

The 55×13 consequence is exact, but it is conditional on treating the same TH glyph that selected the reversed order as a sentinel; it is not an independent confirmation of that order. Simple page-specific Vigenère, prime-valued shifts, keyed-alphabet, one-time-pad and title-keyed transposition receivers have failed on representative pages/segments. The matrix is therefore a structural hypothesis, not a validated key schedule. See the [consolidated stave and receiver report](lp2-p0-cistercian-staves-totient-partition-hypothesis.md) and [reproduction gate](../sims/lp2_p0_13x55_matrix_gate.cjs).

The absence of a second independently varying branch-rune mark remains unchanged. Neither the E/E correspondence nor the conditional TH sentinel yields a source-selected operation, key, or plaintext.

## Conclusion and reopening condition

The p0 3|3 motif has two underdetermined readings: E under the source-family Futhorc Hahal-runa order (matching the third rune of both red-title words), and TH under reversed Younger Futhark (matching the first black glyph). Treating TH as a sentinel yields the conditional 13+1+55×13 partition, but the simple matrix receivers fail and the sentinel choice is not independently authenticated. No second independent asymmetric mark validates either reading; no key, reversible operation, or plaintext follows. Do not use the same p0 artwork as independent evidence for the 27×27 three-rune-node proposal, and do not continue branch-count searches over the repeated tree/vine artwork.

Reopen only if a new original artifact or explicit puzzle instruction fixes the applicable Futhorc/Younger ordering and orientation, supplies a second clean symbol whose reading makes a predeclared prediction on independently anchored ciphertext, or selects a concrete receiver for the 55×13 material.
