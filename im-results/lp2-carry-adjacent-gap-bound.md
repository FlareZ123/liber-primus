# Carry-adjacent partial boundary transport: exact obstruction (#2875)

**Status:** geometry and conditional all-secret obstruction executed; known-key native controls executed; blind unknown-key receiver calibration incomplete. No recovered plaintext.

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

## Executed bounded native control calibration
The initial expensive blind receiver was replaced with a known-key exact lexical DP, using a separate 33,389-word lexicon (TextBlob both spelling variants plus solved sections excluding WELCOME and p56; all singletons). It enumerates F-hold versus consuming-zero alternatives, tracking consumed symbols across group boundaries and minimizing OOV. This calibration lexicon is not the 35,944-word prior used in the original bound. WELCOME's established period-8 shifts and p56's prime-minus-one stream both reproduce every ciphertext rune (515/515 and 85/85) and match all authentic binary word-break positions. Use the authentic physical seams; plant partial transport by the frozen involution. A deterministic decoy reverses the native group-length sequence and drops internal strong-boundary labels; this is one limited negative control, not an exhaustive model of decoys.

| control | variant | identity min OOV | carry min OOV | planted moves | residual gap errors after carry |
|---|---|---:|---:|---:|---:|
|WELCOME|intact|2|14|8|16|
|WELCOME|partial|14|2|8|0|
|WELCOME|decoy|100|98|8|210|
|p56|intact|1|1|0|0|
|p56|partial|1|1|0|0|
|p56|decoy|16|15|0|28|

The WELCOME planted boundary tape is recovered exactly, and the identity grammar wins for intact control. Decoy does not approach the low-OOV positive result, though its carry score is slightly better than identity: prefer abstention over automatic selection. p56 has no active swap under authentic seams, so it checks rune/clock replay and cannot distinguish the two grammars. Known-key calibration is sufficient to demonstrate transport behavior, but is not blind unknown-key recovery. The conditional all-secret original bound already excludes the fixed grammar at q8 and q13, so do not expand expensive original key searches for it. Reproducer: `node sims/lp2_carry_adjacent_gap_control_sft.cjs`. Computation executed in connected JS runtime; standalone Node wrapper not independently executed.
