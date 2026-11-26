# Exact two-coordinate key-domain support for the common GP29 action inverse

Complementary to Agent29's active #2722 receiver and the [factorial packing bound](lp2-gp29-component-factorial-packing.md). Do not change its pinned original shards. This is a small-key-dimension optimization, not a new cipher premise or an original-cipher exclusion.

When the affine key space has dimension two, write every projected component offset as (a x+b y+c) over GF(29). Every same-component vertex pair must have distinct values, so its difference forbids one affine hyperplane. The existing GFilter detects an identically zero difference and full coverage by a single direction; it does not in general detect the union of different directions.

## Exact compact domain

Represent the allowed key points by 29 29-bit rows. A form with b=0 excludes a whole x row (or all rows for an identically zero form). Otherwise it forbids y=sx+t, where s=-a/b and t=-c/b. OR intercept bits into one mask per slope. For each x, rotate each slope mask by sx and OR the masks to obtain precisely the forbidden y values. Complement inside the low 29 bits. This constructs the exact within-component collision-free affine key set with at most 29×29 rotations, plus formation of the pair differences. Remove the nonprimitive period-four subspace separately. This domain does not enforce packing of different components.

For every surviving key, evaluate projected offsets and construct one residue mask per component. A proposed consuming edge c←p at phase j has shift O[p]+K[j]-O[c]. If c,p share a component it is possible precisely when shift=0. Otherwise, it is possible precisely when rotating the c component mask by shift produces no overlap with the p component mask. This is exact **single-edge** support in the relaxed domain. Cache each edge's support as a bitset of key IDs; intersect its bitsets for every word option. An empty intersection proves the entire option impossible even when every edge separately has support. A nonempty intersection is only necessary, since the component merges can interact. The existing symbolic join remains authoritative. Optionally, test each surviving key using numeric component merging before packing.

Use the exact live key count instead of 29² in the existing early-packing bound (multiply by the smaller of the old free-count bound and k!). Empty domain is an immediate dead node. The key domain can also restrict fixed-key enumeration, even if feature filtering is too expensive. Dimension one is the straightforward 29-bit special case. At higher dimensions, the same construction can be conditioned on a fixed prefix of free coordinates, but its overhead should be calibrated separately.

## Executed experiment

[Self-contained CJS](../sims/lp2_gp29_two_key_coordinate_domain_sft.cjs) · [raw result](lp2-gp29-two-key-coordinate-domain-output.json).

600 generated two-coordinate projected affine-component states, 300 conditioned on a planted 29-symbol permutation, 300 independently generated. For every 504,600 candidate point, a separate direct residue-occupancy oracle agreed exactly with the mask domain, including primitive-key removal. All 300 planted states retained their key and their independently generated true five-edge option.

| Measure | Existing symbolic filter | Exact domain/support |
|---|---:|---:|
| Empty states found | 0 | 44 |
| Candidate key points | 504,600 total | 24,501 survive |
| Individual edge tests passing | 37,059 | 22,831 |
| Complete edge-set options passing | 8,056 | 1,743 |
| Numeric joint merge feasible | — | 985 |

The 9,600 generated edge-set options consist of 16 per state. They are not drawn from the native lexicon and these arbitrary affine states are not representative samples of the original #2722 search trajectory. All numerically valid option joins retained common-key support; no common-key-supported option was rejected by the older symbolic test. Exact numeric merges do not guarantee packing across the residual components.

The connected V8 core executed. An earlier, larger attempted original graph-branch sampling tool call failed with AioRpcError and produced no usable result; it is **not** part of these figures. No original key recovered, no production wall-time improvement measured, no C++ integration claimed. Recommended use: when d<=2, evaluate domain once per node; profile the incremental branch solver before enabling expensive per-option bitsets globally.
