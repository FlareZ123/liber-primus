# Exact binary-affine rigidity of the original GP29 pair support

**Agent25, 28 November 2026.** A new all-secret necessary-condition result for a GP29-to-GP29 inverse, distinct from the fixed bit-block ASCII exclusion and the previously tested canonical q8 XOR-feedback cyclewalk (#2818). No source selects this affine architecture; the theorem eliminates its cross-lane binary mixing without assuming a donor text, word order, or a language score.

## Original observed support

Use the canonical physical p0–55 continuous tape (12,956 runes), form disjoint consecutive rune pairs at offsets 0 and 1, and ignore printed boundaries. In the 29×29 directed support, the absent pairs are exactly:

- Offset 0: (1,12), (5,5), (8,8), (16,16), (17,17), (20,20), (22,22), (23,23), (28,28). 832/841 observed; 20 full rows and columns.
- Offset 1: (13,13), (17,17), (24,24). 838/841 observed; 26 full rows and columns.

In each alignment the missing edges form a matching: at most one missing edge per row and per column. This property is invariant under arbitrary independent relabeling of the two input alphabets.

## Frozen candidate inverse and theorem

Grant each input and each output lane an unrelated secret injection of the 29 GP symbols into the 32 five-bit values. A single fixed invertible affine map over GF(2) on the concatenated ten bits operates on each pair, at either alignment. No invalid output code may be silently discarded, cycle-walked, or supplied by a side channel. The question is whether a genuinely cross-lane affine action could map the original pair stream to two valid GP29 output lanes.

**Theorem.** For either original alignment, every surjective five-bit affine projection of the ten input bits that depends nontrivially on both input lanes has output support at least 30. Thus a valid GP29 output lane must depend on exactly one input lane. Since the full ten-bit transform is invertible, the two outputs must use different input lanes: the transform is block diagonal or block antidiagonal. Its entire valid-on-original family reduces to two arbitrary one-rune bijections and an optional fixed pair swap.

### Proof

Let A,B⊂GF(2)^5 be the two secret input code sets, each of size29. Write one output as Lx+My+t, where L,M are linear maps with ranks r,s>0 and the combined map [L M] has rank5 (necessary because an invertible 10×10 matrix has independent output rows). The observed inputs are A×B minus the missing matching.

If r=5, more than16 full columns of the original exist. A nonzero M has fibers of size at most16; hence two full columns y1,y2 have different M values. Their images are two translates of the same 29-element set L(A). Translation by a nonzero vector is a fixed-point-free involution; an odd-size set cannot be invariant under it. Thus their union has at least30 elements. The case s=5 uses full rows symmetrically.

Suppose r,s≤4 and r+s≥5. Set U=im L and V=im M; U+V=GF(2)^5, so for each target z (with t removed) there are exactly D=2^(r+s−5) decompositions z=u+v, u∈U, v∈V. Their u and v components are each distinct across decompositions. Fibers in the full five-bit domain have sizes f=2^(5−r) and g=2^(5−s). Removing three codes can leave at most floor(3/f) empty L fibers and at most floor(3/(f−1)) singleton L fibers, and analogously for M. For two nonempty fibers of sizes a,b, their Cartesian product contains an observed edge unless a=b=1 and the unique edge is missing: a missing matching cannot cover any larger nonempty rectangle.

Consequently at most

floor(3/f)+floor(3/g)+min(floor(3/(f−1)),floor(3/(g−1)))

of the D decompositions can fail. Up to exchanging the two lanes, the complete relevant rank table is:

| r,s | D | Upper bound blocked | Lower bound output support |
| --- | ---: | ---: | ---: |
| 1,4 | 1 | 1 | 30 (complementary images case) |
| 2,3 | 1 | 0 | 32 |
| 2,4 | 2 | 1 | 32 |
| 3,3 | 2 | 1 | 32 |
| 3,4 | 4 | 2 | 32 |
| 4,4 | 8 | 5 | 32 |

For the exceptional (1,4) case, U,V are complementary. The rank-one fibers have ≥13 surviving inputs each, so both rank-one image elements occur in every nonempty rank-four fiber even after deleting the matching. At least15 of the16 rank-four fibers remain nonempty, giving at least30 distinct outputs. This completes the mixed projection proof. An arbitrary fixed output injection of size29 cannot contain such a support. If one map is zero, the other must have rank5; two outputs using the same input lane would contradict invertibility of the full transform.

## Reproduction and scope

[Executable SFT](../sims/lp2_pair_binary_affine_rigidity_sft.cjs), source blob `4d34a9c1898ad2119198632c2f3c719fe8b31e3b`, corpus blob `054f2a0f780b7d46901acbe3d9bf4f0ac1801165`. Exact original support and the rank table are checked. An additional deterministic sanity suite samples 128 independent secret alphabets/surjective mixed projections per rank type, each evaluated on both alignments: 2,816 checks, no violation of the proved bounds (observed minima30 or32). 512 pure-lane checks all have support29. The sampling is not the basis of the exhaustive theorem. Two restricted-domain mixed XOR plants on actual clear p57, at both pair offsets, recover 94/94 runes; their first output lanes use24 and27 codes, respectively. Their sparse pair support violates the original matching premise, as it must. This shows that mixed XOR can be legal on a restricted source and the proof is not a generic assertion of invalidity. The exact persisted source ran in connected V8 with require/assert adapters; no separate Node/CI execution claimed.

**Decision:** a direct fixed binary-affine pair decoder cannot implement any genuine cross-lane mixing on the original full tape. The only surviving maps are per-parity independent one-rune relabelings plus optional swap, already covered by the manuscript's much broader fixed-phase map constraints when evaluated against native prose. No new fitting of those old families. This theorem does not cover private/page-varying maps, a different pair transport order, nonlinear cycle-walking or other constrained encoders, variable widths, or arbitrary unobserved plaintext registers. No authentic key/plaintext and no claimed intended binary decoder.
