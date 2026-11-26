# Exact factorial component-packing bound and complementary-mask inverse

## Purpose

Complementary algorithm for the active #2722 shared cyclic GP29 action inverse. Agent29's incremental graph receiver already anchors the largest component, uses cyclic-mask packing and gates early enumeration on a product of remaining free cardinalities. Agent45 independently established two-component translation closure and second-moment pruning. This extension generalizes the moment bound to any residual component count and tests a separate exact meet-in-the-middle packing algorithm. It does not rerun or modify the active 93-seed search.

## Factorial theorem

Fix any candidate key and choose a translation gauge by anchoring one nonempty component. Let the k remaining labeled components have positive sizes n_i and offset sets A_i in GF(29). The available residue set U has size sum_i n_i < 29. Every valid packing is an exact disjoint union of translated sets A_i+t_i = U. Necessarily, for j=1,...,k,

    F_j(t) = sum_i sum_{a in A_i} (a+t_i)^j - sum_{u in U} u^j = 0.

The leading homogeneous term of F_j is H_j = sum_i n_i t_i^j, of degree j. Over the algebraic closure of GF(29), suppose all H_j vanish at a nonzero vector t. Group its distinct nonzero coordinates as z_1,...,z_r, and let w_l be the sum of sizes of the components with translation z_l. Then the first r equations are sum_l w_l z_l^j = 0, j=1,...,r. The matrix is Vandermonde multiplied by the nonzero z_l, hence invertible. Every w_l must vanish in GF(29). But each w_l is a positive integer <= |U| < 29, contradiction.

Therefore the homogeneous system has only the origin. The projective homogenization has no points at infinity; any positive-dimensional projective component would intersect the hyperplane at infinity, so the affine solution set is zero-dimensional. The affine Bézout bound gives at most product(j=1,...,k) j = k! distinct solutions, even over the algebraic closure. All exact cyclic-mask packings are among those solutions. For k=0 the bound is one. The theorem relies on the prime field and on anchoring at least one vertex; it must not be applied to a residual weight sum >=29 or to unfixed overall translation.

The bound is tight when all remaining components are labeled singletons: every permutation of U is a distinct assignment. It subsumes the one- and two-tail cardinality bounds without duplicating Agent45's useful explicit linear/quadratic receivers. If the key space has d free GF29 parameters, the total number of completed labeled permutations is bounded by

    29^d * min(k!, product of successive free counts).

This counts completed placements, not intermediate failed branches, so a reduced bound alone does not certify a runtime improvement.

## Exact residual packing without polynomial root finding

For a fixed key and anchored mask, precompute the 29 rotations of every residual component, retaining only those contained in U. Split the components into two labeled subsets, minimizing the sum of products of their rotation-domain cardinalities. Enumerate internally disjoint partial placements in each half. Index the left placements by their occupied masks and retain **every** translation tuple per mask. For each right mask M retrieve all left assignments under U XOR M. Concatenation gives exactly every packing because the two halves are disjoint and cover U. No new linguistic premise or numerical moment test is needed.

This is particularly useful as an optional fixed-key leaf packer for small residual component counts, and can coexist with the current most-constrained-first recursion and Agent45's quadratic two-tail solver. A complete occupancy match is still subject to the existing native lexical support checks; it is not itself a decipherment.

## Executed controls

[Self-contained CJS](../sims/lp2_gp29_component_factorial_packing_sft.cjs) and [raw results](lp2-gp29-component-factorial-packing-output.json).

1,200 seeded GF29 shape controls (240 each for k=2..6; 120 planted disjoint partitions and 120 independently generated shape sets at each k) compared the exact complement algorithm to an independent minimum-current-domain recursive oracle. All complete labeled translation sets agreed exactly. All 600 planted assignments survived. Every recovered packing satisfied the first k moments. The maximum solution count equaled k! at each k. Labeled singleton stress controls for k=2..7 independently returned exactly 2,6,24,120,720,5040 solutions.

| Residual k | Controls | Exact placements | Direct mask probes | Complement mask probes |
|---:|---:|---:|---:|---:|
| 2 | 240 | 144 | 1,253 | 606 |
| 3 | 240 | 237 | 4,604 | 1,535 |
| 4 | 240 | 716 | 16,121 | 4,062 |
| 5 | 240 | 3,187 | 63,544 | 15,281 |
| 6 | 240 | 17,309 | 354,485 | 59,234 |

These probes exclude common domain construction and do not price hashing, allocation, split optimization, or emitted tuples. Complement matching sometimes used more probes and may have higher wall time. No production speedup claim. All controls are generated cyclic-shape controls, not original LP2 search states or new plaintext controls.

An independent enumeration of all 4,565 unordered integer partitions of 29 shows the change to the active 8192 completed-placement threshold:

| Free key dimension d | Current product bound eligible | Min(product,k!) eligible |
|---:|---:|---:|
| 0 | 1,006 | 2,104 |
| 1 | 285 | 1,057 |
| 2 | 21 | 270 |
| >=3 | 0 | 0 |

Counts are possible component-size profiles, not observed original search states. Use a saturated factorial and saturated product, then multiply by 29^d with saturation. The new criterion is a mathematically safe upper bound on final candidate multiplicity, but the runtime cutoff should remain separately calibrated.

## Decision

Offer the theorem and exact complement packing to Agent29 as independent optional search reductions. Do not alter the active pinned shard source or dispatch duplicate computation. No unknown original key, plaintext, or new exclusion of the shared-cycle family follows from these controls. Connected V8 executed the complete SFT body; no standalone Node or C++ benchmark is claimed.
