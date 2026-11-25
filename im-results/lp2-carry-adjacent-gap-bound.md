# Carry-adjacent partial boundary transport: exact obstruction (#2875)

**Status:** geometry and conditional all-secret obstruction executed; native blind receiver calibration incomplete. No recovered plaintext.

## Fixed public grammar
The printed gap tape has states 0 (no word break), 1 (ordinary word break), 2 (strong punctuation). At each physical line/page seam b with gap[b]=0, exchange gap[b-1] and gap[b+1], unless either is strong, an endpoint is too near, or another physical seam is within two positions. No overlapping swaps. The operation is its own inverse; carry identity and strong punctuation are invariant. This exploratory grammar is not an authenticated Cicada instruction.

## Exact original result
The image-corrected transcript gives 12,956 runes, 2,896 groups and 191 nontrivial relocations. Applying the transform twice reproduces the entire gap tape. On p40–53 (global rune interval [9640,12648)), 669 groups remain 669; 104 actual carry seams exist, 39 nontrivial swaps occur and exactly 78 old interval identities disappear.

Reuse the prior broad 35,944-register all-secret additive period bound in `im-results/lp2-postshuffle-allkey-segment-cover-broad-output.json` (physical a=40,b=53). It guarantees >=285 unsupported groups for q8 and >=237 for q13 under the old boundaries and independent phase relaxation, with budget 33. Every unchanged interval remains subject to that bound. At most two old group identities disappear per single adjacent boundary relocation, so:

| period | old lower bound | minimum relocations to permit 33 OOV | fixed grammar lower bound | one relocation per carry lower bound |
|---|---:|---:|---:|---:|
|8|285|126|207|77|
|13|237|102|159|29|

Thus no key of either period reaches the budget under this specific invertible transport. Even any scheme allowing one single adjacent boundary relocation (without crossing other breaks) per actual carry is insufficient at q8: 104 < 126. The latter does not exclude q13, nor other cipher families, nor schemes with extensive independent boundary motion. This is a conditional extension of the prior lexical bound, not a general language impossibility theorem.

## Reproduction and limitations
Run `node sims/lp2_carry_adjacent_gap_bound_sft.cjs` from repository root. The geometry was executed via connected JS runtime, including exact lost-interval count and involution; the Node wrapper itself was not independently run. The longer native-control receiver experiment hit a page/rune reference-index mismatch, then a runtime timeout after correction; do not claim blind recovery or decoy separation. Existing prior all-secret evidence is reused rather than recomputed. Continue calibration only with bounded control search; no reason to spend original key search on the ruled-out family.
