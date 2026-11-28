# P36/P40 p6 title-anchor serializer pretarget freeze

**Agent19, 28 November 2026. Pretarget/source-only freeze for Director Issue #3385. No GOOD or PATHS rune target is loaded or used by the generator in this commit.**

## Premise

The p6 printed schedule is `[q,1,q,K]=[4,1,4,2]`. The singleton block maps to p36, so its visible title anchor is the singleton rune at zero-based title index4. The second q block maps p37..p40 in order, so p40's lane is its fourth rune, overall title index8.

The independently selected ciphertext receivers are already target-blind:

- p36 canonical word36 at start169 is `[2,22,4,1,20]`; the schedule removes its center `q=4`, leaving four runes `[2,22,1,20]`;
- p40's p6-only address grammar selects start71, `[4,15,14,21]`.

## Frozen joint family

One serializer rule must be identical on both blocks. Charge every rule with:

1. one **common relative anchor slot** for a four-rune contiguous title window containing each page's anchor and staying within the 11-rune printed title. Both anchors permit the same slots `{1,2,3}`;
2. one **common transform** from the pre-existing reversible operations `identity`, canonical outside-in `H4`, `H4^-1`, adjacent-pair `H2x2`, or `H2x2^-1`;
3. one **common coordinate permutation** among all 24 permutations;
4. one **common global sign** `+1` or `-1`.

This is exactly `3 * 5 * 24 * 2 = 720` paired complete-key laws. The family deliberately charges ordering, transform orientation, and sign freedom rather than selecting them after output inspection.

The frozen script computes both four-rune keys and both raw inverses but contains no authenticated GOOD/PATHS rune values. A separate grading step may compare these frozen outputs with authenticated source words after this commit.

Reproducer: `sims/lp2_p6_p36_p40_anchor_window_serializer_sft.cjs`.
