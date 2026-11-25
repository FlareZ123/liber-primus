# Terminal table: exact reversible graph-equivariance and p55 identifiability

**Agent9, 25 November 2026. Decision: the address-free, graph-equivariant bijection family is either contradicted or nonidentifying on every one of 384 frozen layouts. No unknown plaintext or authentic key.**

## Source and distinction from prior work

The original pp49–51 32×8 table has 256 source cells and, under conditional radix59/60 interpretations, a successor graph. P57's "shed our own circumferences" and the signed words/map/numbers/direction message motivate, but do not authenticate, this geometric receiver: p55 occupies 76 rim cells and p56+p57 occupy 180 inner cells. P56's 85 solved plaintext runes and p57's 95 clear runes are independent known output constraints. See [the graph-polynomial decision](lp2-terminal-graph-allpoly-inverse.md): every stationary affine mixed-operator filter fails the 16 interior scans; unconstrained full-signature lookups may memorize. A different question remains: can **any reversible address-free graph-equivariant transform** explain the known data, and if so does equivariance itself identify p55? This result is independent of the decoder's degree, linearity, neighborhood radius or algorithm. Absolute-address operations, arbitrary keyed positional labels, additional input channels and separately keyed pages are outside its scope.

Freeze 24 interior placements (16 row/column straight or snake scans from four corners, plus eight concentric ring walks with one consistent corner/direction) and eight independent outer-ring placements (four corners, either winding); both source radices give 384 cases. Each retains every original ciphertext rune, including the incoming p55 carry. Inputs and exact blob SHA are pinned in the [SFT](../sims/lp2_terminal_graph_equivariant_stabilizer_sft.cjs). The p56 prime-minus-one/F-hold replay checks 85/85, 84 consuming steps; p57 is checked equal to the clear source. This is a test of an additional common decoder hypothesis, not a claim that the historically distinct known pages originally used one graph cipher.

## The exact discriminator

Let G be the full automorphism group of the directed functional graph (permutations commuting with its successor map), acting on GP29 color tapes. For a ciphertext C and its proposed plaintext P, a bijective graph-equivariant decoder D must satisfy

```
D(g C) = g D(C) for every g in G.
Stab(C) = Stab(P).
```

The equality follows by equivariance in one direction and injectivity in the other. Conversely, equality of stabilizers is sufficient for *existence* of some abstract equivariant bijection carrying C to P: on the orbit of C define gC→gP, which is well-defined and bijective onto the orbit of P. If the orbits are different, use the inverse map on the second orbit and identity elsewhere; if they coincide, the orbit map alone is a permutation. This existence proof supplies no compact key or author-selected operation.

For a colored functional graph, peel noncycle vertices. Compute canonical rooted colored subtree types bottom-up, multiplying the order of the stabilizer by the factorial of each repeated child type. For each cycle, multiply by the number of matching cyclic rotations, and for groups of identical decorated cycles multiply by the factorial of their component multiplicity. Exact vertex orbit classes follow from the anchored decorated-cycle sequence and then parent-orbit plus subtree type. This includes subtree swaps, cycle rotations and repeated-component permutations, not merely equal-ciphertext sibling leaves. Compare the algorithm with all 120 permutations on each of 100 seeded five-node functional graphs; exact group orders and all 2,500 pair orbit decisions agree.

For each original C, all vertices in a ciphertext stabilizer orbit must share P. Two contradictory known plaintext values in one orbit therefore reject the layout. Next, give each remaining free ciphertext orbit a different fresh symbol outside GP29; retain known values and propagate them to any outer cell in the same orbit. This artificially fine coloring Q must have at least the ciphertext stabilizer. If Stab(Q) strictly contains Stab(C), every GP29 completion of Q also has that extra symmetry, since completing Q only merges colors. Reject without guessing any unknown plaintext. The joint coloring (C,Q) verifies the subgroup inclusion exactly.

For the remaining layouts, sample 12 seeded assignments of GP29 colors to free orbits. A completion whose exact stabilizer order equals that of C has the identical stabilizer (inclusion already holds); it is an explicit witness to abstract reversible equivariant compatibility, not a decipherment. Different witnesses prove nonidentifiability. No language score, original p55 plaintext, fitted secret or independent source hypothesis is used to choose a witness.

## Exact original result

| Radix | Layouts | Cipher symmetry contradicts known P | Unavoidable extra plaintext symmetry | Layouts with explicit valid completions | Distinct tested completions across layouts | Forced p55 offsets per feasible layout | p55 offsets varied among witnesses per layout |
|---|---:|---:|---:|---:|---:|---:|---:|
| 59 | 192 | 32 | 112 | 48 | 418 | 0–2 | 74–76 |
| 60 | 192 | 8 | 96 | 88 | 754 | 0–2 | 74–76 |
| Total | 384 | 40 | 208 | 136 | 1172 | 0–2 | 74–76 |

**Every nonrejected layout has multiple explicit complete witnesses, and none of the 76 offsets is forced to a common value across all 136 feasible layouts.** All 248 rejections are exact, independent of the random completion search. The remaining 136 are constructively feasible, not merely unresolved by a test. Counts of witness tapes are summed within layouts, not asserted distinct across layouts. Every individual feasible layout has at least 74 outer coordinates actually varied by the witnessed completions. The random witness search is not an exhaustive count of GP29 completions and the sample does not prove every theoretically free coordinate can attain every rune.

Six native constructed controls use original p56+p57 plaintext, independent 76-rune WARNING/WELCOME/KOAN donors, and both actual source graphs. The reversible equivariant plant leaves cycle vertices unchanged and emits C_i=P_i+P_parent(i) elsewhere. Recover all 256 runes in each plant by reversing parent-before-child order; all six survive the compatibility receiver, all predicted forced outer values are correct, and each has many other compatible output tapes. The control cipher itself is invertible; identifying it from symmetry and known pairs alone is not established.


## Stronger constructive local receiver: arbitrary parent-pair permutation rows

A natural compact reversible alternative to unrestricted graph interpolation is a stationary causal rule on each noncycle vertex v, with successor u:

```
P[v] = H_(C[u],P[u])(C[v])
```

Grant each of the 841 parent ciphertext/plaintext contexts its own completely arbitrary permutation of 29 symbols. Cycle values and unknown outer values are unrestricted. This subsumes dependence on either parent symbol alone, their difference, and arbitrary affine or nonlinear reversible child substitutions conditioned on their pair. On the 24 interior placements per radix, test only original known-known noncycle edges, requiring both function consistency and injectivity. Outer placement cannot affect these equations.

| Radix | Known edges/layout | Determinism contradictions | Injectivity contradictions | Either contradiction | Conflict events/layout |
|---|---:|---:|---:|---:|---:|
| 59 | 130 | 23/24 | 24/24 | 24/24 | 7–16 |
| 60 | 126 | 24/24 | 24/24 | 24/24 | 4–17 |

**All 48 placements fail every such reversible local rule**, independently of p55. Even the noninjective deterministic relaxation fails 47/48. The event counts compare successive observations per lookup row/input (or output); they are not minimum edit distances. In canonical row-major radix59, children 12 and 179 have identical parent pair (18,18) and C=15 but distinct P=9,15. Children 11 and 26 also have parent pair (18,18), distinct C=22,2 and identical P=18. For radix60, children 123 and 36 share parent 54, identical C=24 and distinct P=24,4. These are exact original-source obstructions.

Six constructed controls use the actual two graphs and solved native p56+p57, with 76-rune donor slices from p56 on the rim and randomly seeded permutations per context; cycle vertices unchanged. All reconstruct 256/256 using the planted key, with no contradiction on their known interior. This establishes the receiver consistency and invertibility, not blind key recovery. The executed numerical core and controls are in [SFT](../sims/lp2_terminal_graph_parent_pair_sft.cjs) and [raw JSON](lp2-terminal-graph-parent-pair-output.json). The standalone wrapper has not separately run in CI. No new source selector authenticates this receiver; no plaintext is claimed. More distant, address-dependent, differently aligned, or separately keyed graph operations remain outside this test.

## Consequence

Retire the arbitrary parent-pair local permutation receiver, and **unrestricted address-free graph equivariance as a sufficient p55 key-recovery principle** on these 384 placements. The earlier linear-filter rejection is not being repeated: this analysis covers all bijective equivariant maps, including nonlinear operations of arbitrary complexity. For the surviving layouts, arbitrary interpolation is possible because automorphism stabilizers alone carry little information. Do not promote any conditional forced glyph or randomly completed tape. A new attempt must provide an independently selected compact operation, positional labels, or a different source-to-page relation. No authentic plaintext, decoder, key, or continuation destination has been recovered.

[Executable CJS SFT](../sims/lp2_terminal_graph_equivariant_stabilizer_sft.cjs) · [Executed JSON, per-layout cases and two representative witnesses per feasible layout](lp2-terminal-graph-equivariant-stabilizer-output.json). The numerical core executed against the exact pinned repository blobs in connected V8; the standalone Node wrapper has not separately run in CI. The JSON represents the two sample tapes using the original GP rune characters rather than numeric indices.
