# Agent5: post-closure three-page difference-map hypothesis (20 Nov 2026)

This is a new, unvalidated lead discovered after closing #1943 and #1944. It may change the prioritization of the five-dot / p16–p49 work; it is not a plaintext or a proven cipher.

## Observation

The complete original-image census finds the five-dot stencil only on LP2 p7, p23 and p56. Their three pairwise orientation relations are:

| Pair | Relation | Page-number difference | Difference target |
|---|---|---:|---|
| p7 → p23 | vertical reflection | 23−7 = 16 | p16 |
| p23 → p56 | 180° half-turn | 56−23 = 33 | p33 |
| p7 → p56 | horizontal reflection | 56−7 = 49 | p49 |

All three differences are valid LP2 physical page labels. The target pages have a conspicuous three-part structure:

- p16 is the Liber AL III:47 page with the 10×8 grid, diagonal line and circled-cross.
- p33 carries the red heading decoded as THEIR RISE.
- p49 is the LP2 10×8 numerical block.

The p16 grid and p49 numerical block are an exact page-level shape match (both 10 rows × 8 columns). This supplies a possible independent route to the source/receiver pairing that the isolated p49 geometry audit lacked.

## 2016 signed-message cross-check

Using the existing zero-based 43-word register:

- index 16 begins ARE THE MAP, pointing naturally to p16's grid;
- index 33 begins WILL BE FOUND, consistent with the p33→p34 BE / p35 FOUND continuation already found by a separate route;
- index 49 is outside the word register, while p49 is the numerical-table target.

The authenticated 2016 message also says that its words are the map and their numbers are the direction. P33's THEIR RISE may supply the subtraction/rise operation. This is a coherent clue-constrained solve-path hypothesis, not proof: the word-register windows at16 and33 are both exact phrases, and the p33 phrase was already known.

## Why this deserves a new bounded decision

The previous #1943 negative result correctly showed that the isolated p23/p56 page-rise is not a unique word-register hit. It did not test the complete three-target map 16/33/49 against the original structures at p16 and p49. The full family now links the p16 source grid, p33 rise instruction, and p49 numerical receiver.

The exact p16→p49 operation remains unknown. The old p49 mask a1/b3/c5/d7 and phase-zero shear are not source-fixed, and the tested direct consumers remain negative. Do not promote this to a decryption.

## Proposed decisive test

Ask the Director to consider reopening the source-selection decision or commissioning one bounded successor: starting only from the original p7/p23/p56 stencil family, the 2016 signed phrase “their numbers are the direction,” and the original p16/p33/p49 pages, reconstruct whether the page-difference triad selects a unique p16→p49 line/circle operation. Freeze the operation and a withheld p49/p55 consequence before language scoring. Reject any mapping that needs the old arbitrary four-cell rasterization, an unselected phase, or post-output tuning.

Relevant commits: p49 source-gate audit 6f6358ab; familywise five-dot audit f2adc484. Supporting report: im-results/lp2-p23-p56-p33-their-rise-loop.md.
