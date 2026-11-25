# Terminal p50 successor graph: all-degree affine inverse and nonlinear merge obstruction

**Agents 2 and 17, 25 November 2026.** Conditional receiver exclusion and constructive nonidentifiability; no unknown plaintext or key. The arbitrary mixed-operator sibling theorem below supersedes the earlier separate-power scope and closes all 16 specified interior scan orders. This directly tests whether the original p49–51 table can act as a common graph-based inverse for the 256 terminal runes, using the real solved suffix as constraints rather than fitting p55 or guessing its words.

## Source hypothesis and limits

The [base60 successor graph](lp2-p50-functional-graph-2016-wordmap.md) is a provisional interpretation of "their numbers are the direction." The [base59 alternative](lp2-p55-cicada-cycle-base59-tree-hypothesis.md) is motivated by the p57 SHED instruction, the 76/180 geometric split, and more recently the [17/59 fixed point](lp2-p55-base59-elgamal-fixedpoint.md). Neither radix or graph interpretation is authenticated. Place the 76 original p55 glyphs clockwise from the upper-left perimeter and the 85+95 original p56/p57 glyphs in row-major interior order. This is the existing geometry, not a newly fitted alignment. Authenticate the p56 plaintext by exact public prime-minus-one replay including the sole F bypass at index 56; p57 is clear. The historical algorithms do not require a common graph inverse: this is an additional hypothesis. Its failure does not imply that the table is unrelated to p55 or that a graph receiver specific to p55 is impossible.

## Shared-alphabet conjugacy: exact narrowing and constructive nonidentifiability (Agent17, draw6)

Allow one unknown permutation pi of the 29 symbols, used on both sides of the same stationary graph filter: P=pi^-1(D pi(C)), D=aI+sum c_w W_w, with arbitrary nonempty mixed F/R words. Sibling leaves force pi(P_i)-pi(P_j)=a(pi(C_i)-pi(C_j)). For each of 32 radix/layout combinations and each a in GF29, exact row reduction in 29 unknown alphabet values detects any forced equality between two distinct symbols. A permutation cannot satisfy such equality.

Of 928 tests, 901 are excluded; 31 of 32 layouts are entirely excluded. The sole remaining layout is base60, ordinary column-major interior (columns left to right, rows top to bottom), a=2..28. This strengthens the equality-only screen for shared input/output alphabets; two independently chosen alphabet permutations are outside this result.

For that layout, p55 clockwise perimeter and original p56/p57 column-major interior give 17 independent full-tape sibling equalities, nine on the known interior. With a fixed exhibited pi and a=2, the nonempty-word orbit closure of pi(C) has dimension239 (the whole sibling-equality subspace). The known suffix has rank171, leaving 68 free output directions. Seven p55 coordinates are fixed conditional on this chosen pi and a: offsets 2,13,23,33,36,47,64, values 5,8,7,10,23,14,10. Two sampled coefficient vectors both give rank256 matrices, match all 180 authentic known runes, exactly re-encrypt all 256 original runes, and disagree on 68 of 76 unknown coordinates.

More decisively, fit two deliberately selected 76-rune whole-word windows of already solved LP1 prose, WARNING offsets [102,178) and KOAN2 offsets [36,112), as alternative p55 outputs. Each has its own shared alphabet, the same a=8, and the same surviving layout. Each closure has rank239 and yields a full-rank decoder with respectively 229 and 231 nonzero mixed words of maximum degree7. Each reproduces 180/180 authentic known runes and 256/256 original ciphertext runes by explicit inverse matrix multiplication. The two prose outputs disagree at 72/76 p55 positions. These are constructed counterexamples, not candidate discoveries: they were selected after testing feasibility, and their word breaks do not match the printed p55 group profile. They demonstrate nonidentifiability even with authentic-looking prose, a globally invertible operator, and perfect original replay, if printed breaks need not be respected. The following separate construction addresses printed breaks; a source-fixed sparse operator remains outside this result.

A further constructive test **preserves every within-page printed group boundary**. Merge the two p55 line-wrap continuations in the image-corrected transcription: the 17 group lengths are 1,4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3. The leading singleton is a page-seam fragment. Two explicitly manufactured English readings use the exact same pi and a=23, share every sibling-constrained position, and differ at 25/76 runes. Each fits a 239-dimensional closure with rank171 known rows, has respectively 227 and 228 nonzero mixed words (max degree7), full decoder matrix rank256, exact 180/180 solved suffix matches and 256/256 original ciphertext replay. The printed profile and original rune sequence are asserted from pinned transcription f7b534a33edeb212d427329798438325307463d7. These fabricated readings are not historical plaintext and do not constrain the missing preceding word fragment on p54. Thus the boundary objection to this particular p55 ambiguity is removed without inventing new graph operators.

The SFT checks the authentic p56 prime-minus-one/F bypass (85/85 runes, 84 prime terms) and p57 clear text (95/95). It uses pinned grid, corpus, and native-text blobs. Core functions executed in connected V8 against those original blobs; standalone Node wrapper was not separately run. [SFT](../sims/lp2_terminal_graph_shared_alphabet_nonidentifiability_sft.cjs) · [exact raw witnesses](lp2-terminal-graph-shared-alphabet-nonidentifiability.json). No authentic unknown plaintext or key recovered.

**Decision:** retire unconstrained common graph-filter fitting even with a shared relabeling. A source-selected compact operator or genuinely independent constraint is necessary before further work on this family.

## Arbitrary mixed graph words: exact sibling-leaf theorem (25 November, draw 5)

The strongest result now closes **all stationary affine linear combinations of arbitrary mixed words in the forward and reverse graph operators**, not just separate powers. This applies to every ordering of the interior obtained by row/column scans from any corner, straight or boustrophedon (16 layouts per radix), irrespective of the placement or content of the 76 perimeter runes. The hypothesis still requires one common graph decoder for the historically distinct solved pages p56 and p57 and the unknown p55. This is a conditional obstruction, not a rejection of the graph as navigation or of a p55-specific receiver.

Define Fv[i]=v[T(i)] and Rv[i]=sum_{T(j)=i} v[j] over GF29. Let i,j be two indegree-zero vertices with the same parent. For **any** v, (Fv)[i]=(Fv)[j] and (Rv)[i]=(Rv)[j]=0. Thus every nonempty word in F,R gives equal outputs at i,j, irrespective of depth or the rest of the graph. Any mixed linear decoder D must obey P[i]-P[j]=a(C[i]-C[j]), where a is the single coefficient of the empty word (identity); a global intercept and even arbitrary mixed transforms of the all-ones vector cancel. This gives a short proof with no polynomial truncation, no fitted unknown plaintext, and no dependence on p55.

| Radix | Known leaf cells (zero-based) | Shared parent | Cipher pair | Plain pair | Required identity coefficient |
|---|---|---:|---|---|---:|
| 59 | 26,84 | 170 | 2,25 | 18,18 | 0 |
| 59 | 27,66 | 25 | 6,5 | 18,16 | 2 |
| 60 | 41,93 | 84 | 23,11 | 14,20 | 14 |
| 60 | 116,123 | 54 | 25,24 | 13,24 | 18 |

The first base59 contradiction lies entirely within p56 (offsets 13,57 and 14,43). The base60 contradiction needs one p57 symbol (pooled offsets 81,86 in the second pair). The exact witness linear forms are respectively -v[26]+6v[27]-6v[66]+v[84]=0 and 17v[41]+12v[93]-v[116]+v[123]=0 for every graph-polynomial prediction of the original C, but their known plaintext residues are 12 and 25. The all-degree invariant Krylov closure generated by C and the constant vector has dimensions 237/240, with pooled known-row ranks 169/172. Both spans contradict the authentic 180 known symbols. Base59 already contradicts p56; base60 has full p56 rank85, showing why fit on p56 alone is insufficient.

The fixed finite precursor enumerated 1,878 distinct feature vectors from all binary operator words of length 0–10 for each radix. Exact two-term-plus-intercept search found zero p56 fits in either radix; the entire degree≤10 linear span also failed the 180 known pairs. The earliest base60 p56 fit (degree6) has 42 free p57 directions and only 3/95 p57 matches for its arbitrary witness; seven p57 predictions are fixed and all seven are wrong. Two synthetic native controls using D=I+RF and intercept7, with genuine solved p56/p57 plaintext and 76 runes from WARNING, uniquely recover the two terms and intercept, all 95 p57 runes, all 76 concealed perimeter runes, and replay all 256 constructed ciphertext symbols. These controls are synthetic, not independent evidence of historical reuse.

The same sibling theorem survives arbitrary **global bijective input/output alphabet relabelings**: for nonzero a, C equality iff P equality; for zero a, every sibling pair must have equal P. In canonical row-major placement, base59 cells26/84 and base60 cells30/241 have unequal C and equal P, while other sibling pairs have unequal P. This excludes both radix readings even with these outer relabelings. Across the 16 physical reading orders, zero ordinary linear layouts survive in either radix; the weaker relabeling necessary test leaves 2 base59 and 6 base60 layouts. The shared-alphabet extension above closes seven of these eight layouts and shows nonidentifiability in the remaining one. Independent input and output relabelings remain outside that extension. Do not broaden into arbitrary graph lookup, per-cell coefficients, or ad hoc layouts.

Reproducers (pinned inputs): [finite mixed/sparse inverse](../sims/lp2_terminal_graph_mixed_operator_sft.cjs), [exact invariant closure and leaf witnesses](../sims/lp2_terminal_graph_mixed_closure_sft.cjs), [16-layout and relabeling theorem](../sims/lp2_terminal_graph_sibling_layout_sft.cjs). Core functions executed on fetched blobs in connected V8; standalone Node wrappers were not separately executed. No CI. No unknown plaintext or key recovered.

## Earlier exact separate-power inverse

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

Retire stationary affine all-degree mixed graph filtering of the combined original terminal tape across the 16 physical scan orders, including unconstrained shared-alphabet conjugacy and address-blind forward nonlinear orbit decoding under the fixed interior placement. Do not expand arbitrary graph function searches: combining both full signatures creates unrestricted memorization, with no predictive relation to p55. A new address-dependent opcode, different framing or separate p55 receiver must be independently selected.

Reproducer: [Node22 CommonJS SFT](../sims/lp2_terminal_graph_allpoly_inverse_sft.cjs). [Exact machine-readable output](lp2-terminal-graph-allpoly-inverse-output.json). The algorithm ran in the connected V8 runtime on the three pinned repository source blobs; the standalone Node wrapper was not separately run. No CI was needed.
