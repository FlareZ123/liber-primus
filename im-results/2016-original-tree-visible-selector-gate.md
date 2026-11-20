# 2016 signed tree image: bounded original visual-selector gate

**Status (20 November 2026; Agent15 and Agent7): no executable image-selected decoder.** The original 2016 carrier contains an unlabelled oak/tree motif, but it supplies no branch values, traversal, alphabet, start/stop rule or reversible LP2 operation. The exact-title Fox Talbot photograph candidate has now been tested and rejected as the source image. No LP2 plaintext, key, state transition or destination follows.

## First-party material and visual inventory

The archived original [4gq25.jpg](https://github.com/scream314/cicada3301/blob/master/assets/2016/4gq25.jpg), also stored at `resources/historical/cicada2016-4gq25.jpg`, is 563×569 pixels, 26,342 bytes, Git blob SHA `22027296dcd7df53c5127e6aadbabeaf3223f72d`. A second [archived copy](https://github.com/micheloosterhof/cicada-2016/blob/master/stage01/4gq25.jpg) matches that byte identity. Its [OutGuess payload](https://github.com/micheloosterhof/cicada-2016/blob/master/stage01/4gq25.jpg.outguess) contains the signature-verified statement that Liber Primus's **words are the map, meaning the road, and numbers the direction**. The signature authenticates those words, not a specific visual hypothesis.

The community archive's [2016 page](https://github.com/scream314/cicada3301/blob/master/2016.md) captions the motif as the `Cicada Logo` and `Oak Tree In Winter`. That is an archive caption, not a Cicada-authenticated source attribution. The visible raster shows the message in white prose on a black field, the number `3301`, OpenPGP suffix `7A35090F`, an extremely dim leafless tree/oak and the Cicada motif. It contains no **labelled branches, arrows, numbered cells, 29-symbol legend, compass rose, explicit start, output alphabet or stopping condition**. A tree supplies many possible directions (trunk-to-leaf, leaf-to-root, clockwise branches, etc.) and none is chosen by a visible cue.

The size pair 563 and 569 is an *actual source fact*. The old observed p0-word6/p1-word33 GP-prime sum matches and p32 tree association were already tested [here](lp2-2016-image-first-two-wordsum-gate.md), along with the risk that pages, conversion and word slots were selected after reading original ciphertext. The [original JPEG audit](2016-tree-jpeg-structure-gate.md) and [source-history note](../resources/historical/cicada2016-4gq25.md) establish the container and the unverified stock-art identity. This report does not reopen those dimension, source-provenance, pixel-grid or whole-word-walk searches.

## Exact-title historical photograph candidate: rejected

The archive caption suggested a bounded source check against William Henry Fox Talbot's [*Oak Tree in Winter*](https://foxtalbot.dmu.ac.uk/resources/wintertree.html). The Talbot archive identifies its image as a salt print from a calotype negative, early 1840s, 19.5 × 16.6 cm; its linked `oakTree.jpg` is 600×689 pixels. The title match is the only selector for this candidate; it is not evidence that the two pictures are the same.

The original-source SFT compares the fixed 2016 tree ROI `4gq25.jpg[85:515,80:485]` against the Talbot image. It uses SIFT features (3,000 maximum, contrast threshold 0.006, edge threshold18), Lowe ratio0.70 and RANSAC homography threshold5px. The finite comparison covers all eight dihedral orientations (four rotations and their reflections) and four fixed contrast/polarity pairings: **32 variants**.

- Talbot source bytes: SHA-256 `904b6b4000758211789e94747f8c8ddf68b1e6c3909a4236d306023dc52fcbf4`, dimensions600×689.
- 2016 carrier bytes: SHA-256 `a8340ad04b83fb3130e7ed9172867a440812e87089d6aa2b932d97c6ae38aebe`, dimensions563×569.
- Across all32 2016↔Talbot variants: maximum3 Lowe-ratio matches and **zero RANSAC inliers**.
- Positive self-registration controls: 2016 carrier730 inliers; Talbot image928 inliers.
- Negative source controls: LP2 p55 tree0 inliers; p8 branch art4 inliers.

The controls show the registration pipeline detects stable features in both original images while rejecting unrelated manuscript tree art. The exact Talbot photograph, or a simple crop/scale/rotation/reflection/contrast derivative, is not supported as the 2016 background. A hand-redrawn derivative or generic shared tree motif is not excluded, but neither is an executable selector.

Reproducer: `sims/cicada2016_fox_talbot_oak_source_match_sft.py`; manual workflow run [44697985567](https://github.com/FlareZ123/liber-primus/actions/runs/44697985567), job `136159244176`. The script pins the Talbot image SHA and dimensions.

## Test against the actual solving requirement

The source could lead an ordinary solver to consider a tree/trie or roots-and-branches metaphor. However, neither the visible carrier nor the rejected Talbot candidate provides a **particular branch enumeration, 29-way map, start and stop, or arithmetic operation on word primes**. A unique transfer to p55's 16 complete words or another original page cannot be inferred from the illustration alone. The contrasting solved LP1 p05 picture visibly supplies an actual 5×5 numerical register and external square context; the 2016 tree has no corresponding labelled cells. The 2016 prose remains high-level guidance, without an explicit cipher schedule.

**Decision:** no independently selected image-origin operation with two prospective original-cipher predictions was recovered. Do not produce another key/rotation/direction enumeration from this unlabelled motif, and do not identify the 2016 oak with Talbot's photograph. The community's ClipartBest stock-art link remains an unverified candidate; a genuinely new original mark or independent signed instruction fixing branch values and traversal could reopen this gate. The broader signed words/numbers clue remains unresolved.
