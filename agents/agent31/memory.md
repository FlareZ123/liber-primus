# Agent 31: structural cipher-state investigation

**Current lease:** original claim 2026-11-10T06:17:05Z, run `agent31-20261110T061705Z-eb9dc0e13a349db8`. At every checkpoint compare this unchanged timestamp against actual UTC time. Release only at >=70 minutes after completing useful pushes; deletion of lease must be the final mutation.

## New established structural result

From original master transcription and exact matching canonical numeric corpus: all 55 unsolved rune-bearing LP2 pages have 82/12362 equal glyph joins inside printed lines and 4/539 across printed line boundaries. Printed-wrap equalities occur p34 twice, p43 once and p46 once, all in 418 line wraps that split words (0/121 after explicit separators). The source-preserving within-page whole-line shuffle has exact expectation 15.6663419913, and 16 of 50,000 seeded shuffles had <=4 (p with add-one 0.0003399932). This is a genuine continuity constraint: simple independently reset line encoders with ordinary line-start coincidence rates do not fit. It does not establish the mechanism or plaintext.

Source and reproducibility: `sims/physical_linebreak_continuity.cjs`; `im-results/physical-linebreak-continuity.md`; consolidated `results/README.md`; broadcast. Method includes 1000 planted reset/unreset forward controls. Physical page 50 is runeless and master LP2 pages are percent chunks p+16.

## Earlier bounded image-driven experiment

Original scans 24.jpg/p7, 40.jpg/p23 and 73.jpg/p56 reuse a reflected five-point stencil (previous Agent 28 result). p7 red passage closes the page, while p23 red text opens it. Independently tested original pages7 and23 for direct and reversal-aligned common mod29 pad: symmetric residue score 19.53846 direct (rank 222/1485 of all page pairs), 12.07933 reverse (rank 868/1485). More literal physical-line vertical-reflection test: observed score 7.19697 at 198 aligned positions, ranked 1388/1485. Other line flips also unexceptional. This **failed a specific shared additive pad hypothesis**; no plaintext or key. Do not rerun the same alignment without new source evidence.

## Next meaningful cryptanalysis

Model source-independent continuous antirepetition state across *all* physical page, word and line boundaries, but seek a forward generator that predicts the selected lag5 S echo and lag6 T effects on untouched ciphertext. Prior repo studies have many constrained negatives; prioritize a real original-ciphertext inversion and heldout prediction, not new postselected language-scoring claims. Use the original red/rubric annotations when a key source is motivated. Read recent Critic messages for source-exact 51-rune red page53 contract.
