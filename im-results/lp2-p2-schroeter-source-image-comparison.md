# LP2 p2 Schröter/Fortey source-image comparison, 18 November 2026

**Decision:** The specific historical figure currently used to motivate p2's alleged “six pairs of limbs” is **not registered to the actual p2 line drawing**. No original plate/edition, caption, first-party operator or GP29 ciphertext inverse has been recovered. Retire the p2 artwork as independent support for T6 until a newly sourced instruction changes the evidence.

## Exact comparison performed

1. Original manuscript input: `resources/liber-primus/19.jpg` (original combined-book image 19, physical LP2 p2), 2400×3600. The bug illustration occurs near x870–1610 and y2620–2940. The crop visibly has a plate-covered, tapering abdomen and several legs concentrated near the narrow right-hand end.
2. Historical candidate input: `https://www.strangescience.net/pics/leggy.gif`, 250×91. Its host [labels the original “Leggy trilobite”, 1774, J. S. Schroeter](https://www.strangescience.net/stinv.htm) and identifies Richard Fortey's *Trilobite!* (2000) as its secondary reproduction. The source picture has a bulbous central section and several underbody appendages. It is a source-labeled visual candidate, not an image extracted directly from an original 1774 copperplate.
3. [Executable source-only comparison](../sims/lp2_p2_schroeter_plate_image_gate.py) downloads the candidate GIF at runtime and compares it against the committed original JPEG. In each image it takes the threshold-165 dark-pixel bounding box, preserves aspect ratio on an 80×32 white mask, then computes intersection-over-union. The test does not fit cipher keys, choose runic positions or train against plaintext.

| Source GIF orientation | P2-mask IoU | Intersection / smaller ink area |
| --- | ---: | ---: |
| Natural | 0.261468 | 0.530233 |
| Horizontal mirror | 0.224944 | 0.469767 |
| Vertical flip | 0.242470 | 0.499225 |
| 180° rotation | 0.284047 | 0.565891 |

The original shapes share a generalized segmented animal profile, but their interior anatomy and limb placement visibly differ. The low IoUs do **not** amount to a statistically calibrated proof of different lineage: line density, stylization, cropping, scaling and inverting the drawing may alter overlap. The comparison **does reject an assertion of demonstrated pixel- or trace-level plate identity**. [Windows Python 3.12 / Pillow 11.3 source-input CI run](https://github.com/FlareZ123/liber-primus/actions/runs/44292112077) contains the complete GIF, 80×32 masks and computed metrics in the job logs.

## Historical-source gap and 2014 human-solve test

Richard Fortey's *Trilobite!* (2000) describes a fanciful, two-headed reconstruction attributed to Schroeter (1774), including speculative legs. That description is compatible with the candidate GIF, but neither it nor Strange Science identifies the original German edition, plate, caption or a numbered extraction sequence. [Bibliographic catalogue of J. S. Schröter](https://mineralogicalrecord.com/new_biobibliography/schroter-johann-samuel/) distinguishes several 1774 publications: volume 1 of *Vollständige Einleitung* is catalogued with text and no plates, while volumes 3–4 (1778 and 1784) list fossil plates; volume 1 of his *Journal* (1773/74) likewise lists no plates; the 1774 *Beyträge zur Naturgeschichte* volume remains a different possible source. “Schroeter 1774” therefore fails to pin a specific inspectable copperplate.

This is a *historical candidate attribution*, not a signed 3301 clue. A 2014 human could have encountered Fortey or the attributed image, but no manuscript text or contemporaneous first-party instruction connects that author/figure with a key alphabet, direction, state update, IV or complete GP29 inversion. The only proposed six-position arithmetic has already failed its fully specified original-p2 and untouched-p3 tests in [the earlier report](lp2-p2-schroeter-trilobite-sixback-gate.md), and original p2 contains only 2 of 34 six-back T6 matches. There is no justification for another six-lag cipher sweep.

## Decision and reopening condition

Close this illustration-only branch with **zero unknown plaintext** and no claimed key. Reopen only if an authenticated reproduction of the actual 1774 engraving matches the original p2 mark and carries an *additional explicit direction / ordering / numbered operation*, or an independently signed 3301 source names the relevant plate/book and its role. Require an untouched source-exact whole ciphertext span plus a second holdout once an operation is fixed. An insect resemblance alone changes no cipher decision.
