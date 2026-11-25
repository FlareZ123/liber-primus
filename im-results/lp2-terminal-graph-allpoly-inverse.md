# Terminal p50 successor graph: all-degree affine inverse and nonlinear merge obstruction

**Agent 2, 25 November 2026.** Conditional receiver exclusion; no unknown plaintext or key. This directly tests whether the original p49–51 table can act as a common graph-based inverse for the 256 terminal runes, using the real solved suffix as constraints rather than fitting p55 or guessing its words.

## Source hypothesis and limits

The [base60 successor graph](lp2-p50-functional-graph-2016-wordmap.md) is a provisional interpretation of "their numbers are the direction." The [base59 alternative](lp2-p55-cicada-cycle-base59-tree-hypothesis.md) is motivated by the p57 SHED instruction, the 76/180 geometric split, and more recently the [17/59 fixed point](lp2-p55-base59-elgamal-fixedpoint.md). Neither radix or graph interpretation is authenticated. Place the 76 original p55 glyphs clockwise from the upper-left perimeter and the 85+95 original p56/p57 glyphs in row-major interior order. This is the existing geometry, not a newly fitted alignment. Authenticate the p56 plaintext by exact public prime-minus-one replay including the sole F bypass at index 56; p57 is clear. The historical algorithms do not require a common graph inverse: this is an additional hypothesis. Its failure does not imply that the table is unrelated to p55 or that a graph receiver specific to p55 is impossible.

## Exact all-degree inverse

Let C be the full original 256-rune vector and T(i) the table successor. Let L be the 256×256 GF29 matrix with L[i,T(i)]=1. Then (L^k C)[i]=C[T^k(i)]; ((L^T)^k C)[i] sums the original ciphertext at all depth-k predecessors. Test the entire affine family P = sum a_k L^k C + sum b_k (L^T)^k C + h, including either direction alone and both together. Since the successor functions repeat exactly after the graph tail plus cycle LCM, **every polynomial of arbitrary degree** is included, with no degree cutoff or regularization. Identity is counted only once in the combined family. This is a generous stationary linear decoder, not all linear graph operators: mixed products of L and L^T, site-dependent weights, and other geometry are not included.

Exact GF29 elimination on the 85 p56 known pairs already rejects all six families. The 95 independently known p57 pairs then give the following pooled ranks:

| Radix | Operator | Distinct powers | Columns incl. intercept | Known rank / augmented rank | First contradictory known offset |
|---|---|---:|---:|---:|---:|
| 59 | forward | 39 | 40 | 38 / 39 | 25 |
| 59 | reverse | 39 | 40 | 34 / 35 | 3 |
| 59 | both | 39 | 78 | 70 / 71 | 42 |
| 60 | forward | 46 | 47 | 34 / 35 | 29 |
| 60 | reverse | 46 | 47 | 29 / 30 | 3 |
| 60 | both | 46 | 92 | 61 / 62 | 41 |

The base59 global successor map repeats after tail38 with period1; base60 after tail24 with period22. No candidate reaches the p55 prediction stage. No language score, offset search, fitted p55 plaintext, or re-encryption claim for a rejected model is used.

## Stronger nonlinearity-independent obstruction

Consider **any single deterministic address-blind forward-orbit decoder**, even nonlinear, receiving the entire ordered ciphertext trajectory, successor values and any function of the forward graph trajectory that does not separately identify the starting cell. If two cells have the same ciphertext rune and same immediate successor, the complete available values agree. They must decode to the same rune. The known terminal interior gives two exact counterexamples in **both** radices:

| Cells (row-major, zero-based) | Known offsets (p56+p57) | Same ciphertext | Same successor base59 / base60 | Different known plaintext |
|---|---|---:|---|---|
| 36, 123 | 21, 86 | 24 | 53 / 54 | 4, 24 |
| 90, 246 | 61, 179 | 18 | 195 / 198 | 26, 18 |

These witnesses depend only on the row-major interior and original table, **not** on any p55 placement or values. Even a shared unbounded nonlinear function of the entire forward ciphertext path cannot resolve them. Explicit initial addresses, predecessor structure, separate page rules, and different interior alignments are outside the theorem.

For arbitrary nonlinear functions of just the reverse aggregate sequences, there are 16/14 conflicting equivalence classes (base59/60). Combining forward and reverse removes all collisions but yields 256 distinct signatures in either radix: **none of the 76 unknown signatures occurs among the 180 known signatures.** Every assignment of p55 plaintext is compatible with some unrestricted lookup, so this generalization provides zero identifiable p55 symbols. This is an identifiability observation, not an all-nonlinear impossibility.

## Controls and next decision

Six native plants use the exact genuine 180 known suffix runes and a 76-rune solved WARNING donor on the perimeter. Their ciphertexts are constructed by inverting D=I+2L^3 or its transpose, with affine offset7. All matrices have rank256 and exact forward replay; all six known-pair fits succeed. The arbitrary free-coefficient-zero witnesses match 76,76,76,74,76,74 of the perimeter runes respectively, but the number of free independent perimeter predictions is 1,6,7,2,7,9. **None is uniquely identified by these controls.** This exposes an additional weakness of the proposed inverse even when the family is correct; the genuine native donor is not used in calibration. The planted ciphertexts differ from historical p56/p57 ciphertexts by design; the authentic source replay is a separate check.

Retire stationary affine all-degree forward/reverse graph filtering of the combined original terminal tape and address-blind forward nonlinear orbit decoding under the fixed interior placement. Do not expand arbitrary graph function searches: combining both full signatures creates unrestricted memorization, with no predictive relation to p55. A new address-dependent opcode, different framing or separate p55 receiver must be independently selected.

Reproducer: [Node22 CommonJS SFT](../sims/lp2_terminal_graph_allpoly_inverse_sft.cjs). [Exact machine-readable output](lp2-terminal-graph-allpoly-inverse-output.json). The algorithm ran in the connected V8 runtime on the three pinned repository source blobs; the standalone Node wrapper was not separately run. No CI was needed.
