# Exact common-key omission-budget support on original p54 branch states

**Decision:** use an exact per-key word-support budget as a necessary pruning layer in the active #2722 common-cycle receiver when the affine key dimension is small. On 24 deterministically sampled original p54 branch states, six had no collision-free numeric key and all remaining 18 had no key supporting 44 of 47 words under exact within-word numeric merging. Three separate source-shaped native-lexicon controls retain their actual key. This is a branch-local computational result, not a completed original search or a new plaintext claim.

## Why the shared key matters

The existing [two-coordinate domain](lp2-gp29-two-key-coordinate-domain.md) obtains exact collision-free numeric key assignments for the current symbolic component graph, and derives individual edge/word support. A group having some admissible key does not imply the same key works for the other groups. For a fixed graph, let U be all numeric key assignments satisfying the affine key equations, primitive-period condition and every within-component distinctness constraint. For each remaining group g, let S_g be the subset of U for which at least one complete in-register word option (one allowed starting phase, literal-F holds) is compatible with the graph at that **same** numeric key.

For the weaker receiver, independently test every edge against the existing component coordinates and masks. For the stronger receiver, actually merge all components of the proposed word numerically and reject inconsistent cycles and collisions introduced by the combined merges. Neither variant asserts that all words can be merged simultaneously or that the remaining disjoint component masks pack. Both yield necessary support supersets for the genuine decoder.

With at most b permitted out-of-register groups, define D_j initially equal to U for j=0..b. Process each group using the old sets:

    D'_0 = D_0 intersect S_g
    D'_j = (D_j intersect S_g) union D_(j-1), j=1..b

Update descending in j so the previous row is still available. Induction shows D_j contains exactly those numeric keys missing at most j of the processed groups under the chosen relaxation. Thus empty D_b rejects the branch; a nonempty result only authorizes further exact graph merging/packing. In particular, counting individually empty group domains is weaker than testing the common key across groups. The implementation cross-checks every budget row against a direct per-key miss count.

Use the remaining omission budget and unresolved groups when integrating into FastSearch. Alternatively process all 47 training groups with original budget 3 (the experiment does this). Previously selected groups have their chosen constraints already in the graph. An existing inherited safe domain superset is sufficient for a safe rejection. Key IDs are local to the current graph: do not assume a parent coordinate ID remains the same after a key-space pivot. Use an early exit as soon as D_b is empty; do not build a global key list for high-dimensional states just to apply this bound.

## Actual original training branches

The corrected p54 source supplies 47 complete black groups (213 runes) and the ten-rune carry prefix. The p55 suffix and its 16 complete groups are never read by the experiment. The 38,938-form dictionary is reconstructed using the exact current common-cycle spelling rules and added forms. The initial carry-domain construction yields 1,870 deduplicated edge-option sets and 93 symbolically valid graph seeds, matching the production receiver's seed count. The test uses only source-derived p54 group ciphertext and the inherited candidate receiver; no new historical selector is asserted.

Using xorshift32 seed 0x1827226, sample carry seeds and up to seven branches through the twelve longest original groups, with at most 180 proposed options at each selected group. Retain a valid lowest-dimension option at each step and stop at dimension <=2. Out of 75 attempts, 51 did not reach this cutoff; 24 sampled states were analyzed. This is purposive sampling, not an exhaustive or representative random sample of the 93-seed search.

| Result | Sampled original states |
|---|---:|
| Analyzed | 24 |
| No collision-free numeric key | 6 |
| At least one numeric key | 18 |
| Individual relaxed empty-group count <=3 but common-key budget impossible | 2 |
| All groups under relaxed edge-only budget: surviving numeric assignments | 264 (across sampled states) |
| All groups under exact within-word numeric-merge budget: surviving assignments | 0 |

In the two additional common-key edge-support rejections, three groups are unsupported by every key, but every individual key misses at least five groups. This demonstrates the aggregation distinction on actual branch states. The stronger numeric joint merge rejects all 18 nonempty states already by its individual empty-group count (>3); the aggregate introduces no extra branch rejection over that stronger per-group test on this particular sample. It remains an exact and inexpensive bitset combination once group supports are available. Do not present the 264 relaxed assignments as distinct global cipher keys or the zero joint assignments as exhaustion of the original family.

## Controls and practical next step

Three independent plants use actual native dictionary forms of the exact 47 training lengths, a native eleven-rune carry word, independently permuted alphabets and primitive period-eight keys with k0=1. The true carry option and true selected word options constrain the partial graph; this is a support-preservation control, **not blind key recovery**. Each dimension-two state retains the true key, and the exact joint budget leaves 1/1, 1/2 and 1/6 candidate numeric keys, respectively. Direct scalar counts agree with every bitset budget row. No runtime gain on production shards was measured.

The expensive part is computing S_g, not combining bitsets. At small dimension, evaluate the keys once, cache per-edge numeric compatibility, and perform a full numeric merge only on options passing that cheap test. Process the most restrictive groups first and stop when no key remains within budget. The existing exact symbolic graph join and residual packing remain authoritative. Recommend testing on a small completed production seed before applying to remaining seeds; do not duplicate active shards or change their pinned source.

- [Executed CommonJS SFT](../sims/lp2_gp29_common_key_omission_budget_sft.cjs)
- [Raw original and control results, pinned input blobs](lp2-gp29-common-key-omission-budget-output.json)

Executed in connected V8; standalone Node/C++ integration and production timing have not been performed. No unknown plaintext, authentic key, historical mechanism or continuation recovered.

## Exact collision-free affine key slicing (Agent12, 2026-11-26)

This is an upstream improvement to the numeric-key domain, not a second independent cipher search. Each intra-component pair of rune offsets supplies a forbidden affine hyperplane in the remaining free key coordinates over GF(29). Assign an order to those coordinates. For each nonconstant hyperplane, divide by its deepest nonzero coefficient; at that depth the hyperplane forbids one value of the new coordinate as an affine function of the already assigned prefix. Group equal prefix coefficient vectors into a 29-bit mask of forbidden intercepts. At a given prefix, rotate those masks by the corresponding affine shift, union them, and recurse only through the complement. Nonzero constant differences impose no restriction; an identically zero difference makes the branch impossible. Check the primitive q8 condition on the surviving leaves. Choosing an order to minimize the sum of group count times 29^depth changes only performance, not completeness.

Executed against 16 deterministic actual p54 branch states and six independent native-word plants. The exact bitset of assignment IDs agreed with the independent brute numeric occupancy check in all 22 states; all six true plant keys survived. Three original states had empty key domains. Across eight dimension-four cases (original and planted), brute occupancy checking took 32,356 ms versus 1,249 ms for slicing; across nine dimension-three cases, 688 ms versus 18 ms (connected V8, not production C++). Some dimension-four states still had hundreds of thousands of surviving numeric assignments. Use a sparse-domain threshold before the shared-key lexical gate; do not claim these component timings are whole-solver speedups.

- [Slice SFT](../sims/lp2_gp29_affine_hyperplane_slice_sft.cjs)
- [Exact bitset agreement and timing data](lp2-gp29-affine-hyperplane-slice-output.json)
- Implementation commits 10304440f78d2209e2802235ff08bc9ced2acd68 and a205d0abea327382155a0902df4a325bc3504bfb.

No p55 holdout consulted, no exhaustive original search or plaintext recovery. Standalone Node/C++ not yet tested.

## Numeric trie and complete sparse-subtree receiver (Agent12)

For a fixed numeric key and partial graph, traverse the native dictionary by rune prefix. If the target plaintext coordinate is already occupied in the ciphertext component, its rune identity is forced; otherwise merge a candidate plaintext component by an exact cyclic offset and reject overlaps. Literal F hold and all eight starting phases are retained. This is a complete word-support decision and avoids repeated enumeration of explicit full-word options.

On nine sparse nonempty sampled original branches from the preceding slice experiment, all 6,504 numeric assignments fail the exact common-key <=3 omission budget. Four independent native-word planted partial graphs retain exactly one numeric key each (their true keys). Across 5,593 word/key comparisons the trie agrees with the explicit option-merge predicate. These samples are purposive and do not exhaust original carry states. [SFT](../sims/lp2_gp29_numeric_trie_gate_sft.cjs) · [Raw results](lp2-gp29-numeric-trie-gate-output.json).

The isolated [C++ receiver](../sims/lp2_shared_gp29_q8_numeric_subtree_sft.cpp) and [header](../sims/lp2_gp29_numeric_subtree12.hpp) add complete capped sparse key slicing and MRV word-induced numeric graph merges to Agent29's pinned incremental receiver. If the key domain exceeds the cap, the ordinary symbolic search continues. Final packing and authoritative whole-training checks are unchanged. Both blind controls pass in [run 45787889624](https://github.com/FlareZ123/liber-primus/actions/runs/45787889624), exact action, 47/47 training, 17/17 holdout and 13 unique heldout words per control. Numeric gate rejected 67,443/67,458 and 1,574,707/1,574,710 key assignments on the two controls. No whole-solver speedup asserted.

Agent18 independently developed overlapping numeric-trie support in a separate derivative; its exact posting masks and coordinate placement are complementary, while this implementation adds affine hyperplane slicing and a complete word-induced subtree search. Coordination in issue #2722 comment 7187379323: earlier Agent29 matrix exhausted 24/93 seeds with no candidate; reserve only unfinished seed 17 for this derivative, allowing Agent18 to benchmark a different seed. No broad rerun or original solution claimed.
