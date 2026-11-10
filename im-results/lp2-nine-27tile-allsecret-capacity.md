# Nine 27×27 LP2 tiles: exact all-secret per-coordinate S-box capacity

**10 November 2026. Evidence: exact original-cipher conditional theorem and 3,000 original-length source-native GP-English controls.** No unknown LP2 plaintext, historical key, complete cipher, or destination is recovered. Reproducer: [nine-tile CommonJS SFT](../sims/lp2_ninetile_d4_caesar_sbox_gate.cjs); [passing manual GitHub Actions run 42864784240](https://github.com/FlareZ123/liber-primus/actions/runs/42864784240).

## Why nine tiles are a source-defined candidate

The first **three original physical LP2 pages** contain 262+266+201 = **729 = 27²** runes. The sole genuine repeated adjacent 3+3-rune word pair ends at global rune offset **6,561 = 9×729 = 81²**. These exact source measurements are in [the bookend source report](lp2-repeated-wordpair-structure.md). Hence the complete first 6,561 runes also form **nine consecutive 27×27 tiles**, the first being pages 0–2. This framing is retrospective and unproven as Cicada intent. The original plaintext may not be a set of nine parallel prose passages.

A natural nine-way direct-GP candidate is to reuse one independently secret rune permutation at each aligned cell of the nine tiles, with possible tile-to-tile reflection/rotation and one fixed per-tile Caesar output offset. This is more general than any prescribed additive keystream or specified secret alphabet. The test allows **729 unrelated 29! substitution permutations**, **eight dihedral orientations per tile**, and **29 unrestricted GP29 output shifts per tile** without searching for their actual secrets.

## Exact model and symbol-equality invariant

Let `b=0,...,8` index tiles, `u` range over 729 canonical 27×27 coordinates, `π_b` be an unknown element of the eight-element dihedral symmetry group of the square, `a_b ∈ Z29` an unknown constant *output* shift, and `S_u` any permutation of all 29 rune labels, varying arbitrarily with `u` but shared across the nine panels. The declared one-rune-per-rune encoder is:

```text
C_b[π_b(u)] = ( S_u[P_b[u]] + a_b ) mod 29 .
```

For each pair of panels `b,c` and each coordinate, bijectivity gives the **if and only if** relation:

```text
P_b[u] = P_c[u]
    iff
C_c[π_c(u)] - C_b[π_b(u)] ≡ a_c - a_b (mod 29).
```

Thus arbitrary secret `S_u` cancels from every equality test. The only remaining unknowns are finite orientations and output offsets. The proof does **not** apply to hidden input shifts before `S_u`, differing S-boxes by tile, interleaving or missing plaintext symbols, non-GP intermediates, arbitrary tile-specific outer alphabet permutations, or unrestricted spatial maps.

For ordered tile pair `a,b`, exhaustively compute `W_ab(g,d)`: the number of aligned ciphertext rune pairs whose difference equals `d` modulo 29 after relative D4 transform `g`. Every pair has **8×29=232** possible registered difference histograms. The direct original alignment yields **886/26,244** equality pairs. Choosing the best orientation alone for every edge independently permits at most **1,187**. Choosing a free D4 and relative shift for each of the 36 panel edges yields the loose all-key upper bound **1,450**.

A stronger exact optimization uses the affine plane of order 3: its **12 three-point lines partition all 36 edges** of the complete graph on nine panels into 12 disjoint triangles. In each triangle `a,b,c`, fix `π_a=I` and `a_a=0` by symmetry, then enumerate all **232²=53,824** relative assignments to tiles b and c. Crucially, the relative b→c orientation and shift are algebraically constrained by the two a-rooted choices. For every unknown global set of nine secret orientations/shifts, each triangle's total equality count is no greater than that triangle's exact maximum. Because edges are disjoint across triangles, the **sum of 12 maxima is a rigorous source-original global upper bound**, even though the 12 independently maximized assignments need not agree.

| Source-registered test | Ciphertext maximum compatible with any declared secret key |
| --- | ---: |
| Original, no orientation or shift choices | 886 |
| Each pair independently chooses one of eight D4 orientations | 1,187 |
| Each pair independently chooses D4 plus 29 relative output offsets | 1,450 |
| **Globally valid 12-triangle D4/output-offset certificate** | **1,362** |

All figures are exact integer counts among **36×729 = 26,244** potential plaintext-symbol equality pairs. The SFT also publishes the maximizing four relative values and exact bound for each of the 12 triangles, and asserts that all 36 edges are partitioned once. No secret S-box or language parameter is used in constructing these four original-input capacities.

## Source-native calibration

Native plaintext pairs have a nonuniform GP29 marginal distribution, so independent GP-English excerpts produce substantially more equality pairs at the same aligned positions than near-uniform ciphertext. For each original-source control, the script samples 1,000 reproducible sets of **nine pairwise nonoverlapping, contiguous 729-rune GP passages**, preserving original lengths. The GP tokenizer follows the existing repository mapping (including `QU→CW`, `V→U`, `K→C`, `Z→S`, and GP digraphs). No parameters are selected on source texts.

| Independently checked-in GP-English reference | GP runes | Control mean equality pairs | Smallest of 1,000 | Controls ≤ original 1,362 capacity |
| --- | ---: | ---: | ---: | ---: |
| Shakespeare first 300k characters | 218,800 | 1,572.726 | **1,402** | **0** |
| Gibran, *The Prophet* | 63,114 | 1,575.671 | **1,452** | **0** |
| Emerson essays | 324,630 | 1,641.468 | **1,517** | **0** |
| **Total** | | | | **0/3,000** |

Reproducible xorshift32 seeds are `3301 + 137×corpus-index`, where indices are 1,2,3. Under the weaker independent-edge 1,450 bound, 6 of the Shakespeare sets would pass. The triangle-consistency improvement is therefore decisive for these supplied controls. The 0/3,000 count is finite empirical reference evidence, not a universal mathematical theorem about all possible English texts.

## The larger output-affine family remains unresolved

Allow a different **nonzero output multiplier** per tile as well as its Caesar offset, keeping the same unrestricted 729 shared-position substitution tables:

```text
C_b[π_b(u)] = (m_b * S_u[P_b[u]] + a_b) mod 29, m_b != 0.
```

Pairwise equal plaintext is now equivalent to one unknown *affine*, rather than Caesar-only, relationship of ciphertext labels. The extended reproducer exhausts **(8×28×29)²** combinations of relative D4 orientations, nonzero slopes and intercepts for each of the 12 K9 triangles, with exact admissible pruning. Algebraic consistency requires relative b→c multiplier `m_c/m_b` and intercept `a_c−(m_c/m_b)a_b`, along with D4 composition. The original **all-secret 12-triangle upper bound is 1,524/26,244**; the independent-edge ceiling is 1,646.

The new bound does **not exclude native GP-English** on the cited references: **155/1,000** Shakespeare, **119/1,000** Gibran and **2/1,000** Emerson sampled nine-panel sets have at most 1,524 matching plaintext pairs. The weaker 1,524 bound therefore leaves this broader per-tile output-affine architecture **OPEN**, while the original 1,362 output-Caesar-only finding remains intact.

A separate hidden-key source-native positive with 729 independent full alphabet substitutions, nine nontrivial multipliers, nine offsets and nine orientations exactly reconstructs and reenciphers **6,561/6,561** runes, and the all-secret certificate admits its true plaintext equality count. [Passing extended manual CI](https://github.com/FlareZ123/liber-primus/actions/runs/42867831354). No authentic affine multiplier, key or unknown plaintext is recovered.

## Hidden-key positive and authentic-input limits

A separate test draws **nine native Shakespeare GP windows**, privately chooses nine unrelated D4 orientations, nine Caesar output offsets, and independently shuffles all 29 rune labels at each of 729 positions. It encrypts all 6,561 runes under exactly the declared candidate model. The known concealed artificial key then recovers **6,561/6,561 plaintext runes**, independently reenciphers **6,561/6,561 ciphertext runes**, and the same **key-blind source certificate correctly accepts the plant**: its upper bound is no lower than the plant's authentic unencrypted equality count. A wrong-key roundtrip would not identify historical keys, and none is claimed.

**Conclusion:** If the source-derived nine-tile framing is intended, the original ciphertext is incompatible with *directly GP-English* nine-way coordinate-registered substitution by the same arbitrary secret S-box at each coordinate and only fixed tilewise output Caesar and D4 changes, as calibrated against all 3,000 independent literature-control sets. An alternative register, a changing tilewise hidden state, a more general mixing function, or a layout unrelated to the retrospective block boundary remains open. This is a strong bounded family exclusion and a useful identity-level cryptanalytic constraint, not decrypted manuscript content.
