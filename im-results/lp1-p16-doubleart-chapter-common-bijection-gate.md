# LP1 p16 double-artwork intersection: original linked-chapter common-key obstruction

**Evidence type:** original-JPEG source-page selection and a key-independent necessary-condition test on two exact original ciphertext intervals. The manuscript is still unsolved. No unknown plaintext, authentic key, or destination is recovered.

## Human solve route, weak assumption and preselected inputs

The same LP1 segmented insect artwork appears on solved LP1 pp9,13,16 and is mirrored on encrypted LP2 p2. A different reclining figure is printed pixel-identically across LP1 pp14–16 and mirrored onto encrypted LP2 p22. These are two independently identifiable original illustrations, both copied into separate LP2 chapters. Their **solved-LP1 page-source sets intersect uniquely at LP1 p16**, whose original image contains a five-by-five / 3301 magic square. The exact four insect source-image copies and three footer copies, coordinates and image controls are pinned in [the original-JPEG census](lp1-lp2-crossrelease-artwork-raster-copies.md), reproduced by [its Python SFT](../sims/lp1_lp2_illustration_raster_reuse_sft.py).

An economical intended-human-path hypothesis would use that unique original page as a common key source for both illuminated LP2 chapters. The source-visible printed red chapter divisions designate LP2 **pp0–2** (729 runes) and **pp15–22** (1,903 runes), whose last pages display the borrowed insects/figure. The weakest premise is consequential: **the copied pictures do not state that the chapter ends govern the *entire* chapter's cipher, nor that both should share a cipher key.** This is one bounded test of that model, not evidence of author intention.

Use every original GP29 rune in the first 729 positions of each chapter in printed order. The image-defined source-page intersection, chapter starts, 29 GP symbols and zero relative position are frozen before ciphertext scoring.

## Key-independent necessary conditions

If the chapters share *any* otherwise arbitrary 29-symbol bijection at each local position i, C1_i=f_i(P1_i), C2_i=f_i(P2_i), then C1_i=C2_i iff P1_i=P2_i. The count of same-position ciphertext equalities is independent of the secret key. If they instead share arbitrary GP29 additive key K_i, with each chapter also allowed its own unknown constant offset a or b, then C1_i-C2_i=P1_i-P2_i+a-b (mod29). Thus the **maximum across all 29 difference bins** is invariant even if the offsets are secret. This compares all secret static chapter shifts in one exact test; no key guesses or word patterns are fitted.

## Executed original-cipher results

| Statistic on 729 aligned original symbols | Original | Frozen GP-English reference simulation (5,000 independent 729-rune pairs) |
| --- | ---: | --- |
| Same-position equal symbols, any common position-wise bijection, no relative offset | **20/729 (2.7435%)** | Mean **43.7506**; minimum **22**; **0/5,000** at or below original; plus-one one-sided p **0.00019996** |
| Max of all 29 mod29 symbol-difference bins, common additive pad with arbitrary per-chapter Caesar offset | **34/729 (4.6640%)**, tied modes 5,7,17 | Mean **45.3476**; minimum **33**; **23/5,000** ≤34; plus-one p **0.00479904** |
| Different original excerpt offsets on chapter pp15–22, fixed 729-rune first-chapter sample | Original fixed **20** | Mean **25.1798**; **862/5,000** ≤20; p **0.17257**. The authentic same-start alignment has no elevated equality compared with its own original-cipher page stream. |

The independent-language control uses repository-pinned Shakespeare, historically folded and longest-match encoded to **218,800 GP29 runes**; seed 3301 (xorshift32) fixes the 5,000 independently chosen source windows. Synthetic genuinely shared random 729-symbol GP29 pads with secret, different chapter offsets preserve the entire 29-bin difference histogram and give a **45-match** positive example, confirming the necessary invariant. This is an English-GP register exclusion. It cannot rule out Old English, a binary data register, different keys, arbitrary relative key-pointer shifts, complex state feedback or two-layer ciphers.

**Reproducibility:** [single-file CJS source](../sims/lp1_p16_double_art_chapter_sharedkey_sft.cjs), original canonical corpus and pinned Shakespeare reference. It prints the entire 29-bin original histogram, simulation results, source intersection and synthetic equality control. [Successful GitHub Actions run 43139902678](https://github.com/FlareZ123/liber-primus/actions/runs/43139902678), manual Node 22 on original checked-out repository, completed 12 November 2026. All assertions passed.

## Decision

The **common position-aligned alphabet/key reset at both visually linked chapter starts** does not explain their original ciphertext as GP-native English. The actual source-page intersection LP1 p16 is still a genuine, unusually specific original-art index. The 5×5/3301 square's global direct GP29 additive and Hill decoders were independently tested and negative in [the historical-square gate](openpuff-magic-square-remaining-gate.md). Without an independently selected alternative use of that square, there is no reason to fit more keystream phases or alphabet permutations to rescue the same architecture. The key/index remains unknown.
