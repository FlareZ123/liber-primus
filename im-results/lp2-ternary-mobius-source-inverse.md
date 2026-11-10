# Ternary incidence-algebra inverses on the original 6,561-rune square

**Scope and decision (10 November 2026).** The original unsolved LP2 first **6,561=3⁸=81²** GP29 runes end precisely after the book's first occurrence of its repeated six-rune two-word bookend. The solved LP1 5×5 square explicitly contains the word **MOBIUS**, while LP2 physical page 15 visibly specifies an ordered Fibonacci-indexed prime spiral. These independent clues motivate testing whether the source has been transformed by a *finite tensor-product zeta or Möbius transform* over the eight base-three coordinate digits. This study tests that directly invertible model on the unmodified original ciphertext. It finds **no recovered original plaintext, historical cipher, key, or destination**. Its strongest original GP unigram signal is indistinguishable in magnitude from random-like ciphertext, while positive controls recover authentic Latin plaintext exactly.

**Previously covered, distinct scopes.** Existing \`im-results/lp2-ternary-coordinate-additive-cipher.md\` tests an eight-trit *separable additive pad*; \`im-results/grid-boolean-mobius-original-inverse.md\` tests a five-bit Boolean inversion of the 256-cell table; \`sims/lp1_mobius_grid_inverse.cjs\` tests Dirichlet inversion over that grid. This study instead applies **3-state weighted incidence transformations directly between original GP rune positions on the 3⁸ original prefix**. Do not extrapolate it to the excluded additive or binary models.

## Exact reversible operations

Fix global source rune indices \`i=0…6560\` over LP2 p0 onward; do not reset at page or word boundaries. Write \`i = Σ(j=0…7) d[j] 3^j\`, each \`d[j]∈{0,1,2}\`. For each axis j, take three values \`(x,y,z)\` whose other seven ternary coordinates agree and whose jth coordinate is \`0,1,2\`, respectively. For edge coefficients \`a,b∈F29\`:

- Forward *zeta*, normal order \`0<1<2\`: \`(x,y,z)→(x, y+a*x, z+b*y+a*b*x)\`.
- Inverse *Möbius*, normal order: \`(x,y,z)→(x, y-a*x, z-b*y)\`, with x,y,z evaluated from the inverse's input.
- The reverse orientation \`2<1<0\` applies the corresponding upper-triangular prefix sums, with the exact inverse obtained by reversing those additions.

Apply all eight commuting axis transforms. Every candidate is bijective on **all 6,561 runes**, including every original adjacent doublet; no deletion, hidden marker, or language-fitted secret key is needed. An 8-bit mask independently chooses each axis's chain orientation.

The *unweighted family* fixes \`a=b=1\` everywhere, tests both transform directions, all 256 masks, and all 29 global input offsets \`Cᵢ→Cᵢ+t\`, for **2×256×29=14,848** explicit inverses. A global nonzero input scaling can be reduced to such an offset after factoring out an output-wide scaling, and arbitrary global output-rune relabeling leaves index of coincidence invariant. This covers the full family of these **global** affine input changes under a permutation-invariant IoC decision, without claiming that the output has a source-specified alphabet.

The *Fibonacci-weighted family* chooses exactly one of four pre-existing source orderings of the actual LP2 p15 square: its clockwise Fibonacci readout, the underlying prime values, the printed row-major values, and the primes corresponding to those printed entries. Assign its 16 numbers in successive pairs to \`a_j=s×key[2j]\` and \`b_j=s×key[2j+1]\` modulo 29. Both signs \`s∈{±1}\`, both transform directions and all 256 axis-orientation masks give **4×2×2×256=4,096** complete reversible configurations. This is source-motivated, but the source does not explicitly instruct a solver to read 16 square cells as eight ternary edge pairs. That unproved interpretation remains a constraint.

## Original-source results

| Test family and exact original prefix | Original best recovered GP29 IoC | Native control |
| --- | ---: | --- |
| Original ciphertext, untouched | **0.0345227805844588** | Unchanged |
| 512 unweighted directions/orientations, zero affine offset | **0.03461975977784469** | Original full source |
| **14,848** unweighted variants including all 29 offsets | **0.03469057735844848** | Latin GP source IoC **0.07503057609451266** |
| **4,096** fixed Fibonacci source-weighted variants | **0.03465145110984717** | Same Latin GP source IoC **0.07503057609451266** |

For comparison, authentic first-6,561-runic-glyph GP transliteration of the checked-in Shakespeare reference has IoC **0.06204656302392928**. The largest original direct-GP signal remains far from either authentic language control. This is a **bounded rejection of direct native-GP decoding using the declared transforms**. A different intermediate register, a post-tensor keyed state, a non-GP language or altered original position ordering can evade it; no manuscript-wide impossibility theorem follows.

**Blind weighted positive control.** Take the first 6,561 canonical GP runes of the independently published Latin Vulgate source, apply the **actual p15 clockwise integer spiral** as the eight pairwise weights, zeta direction +1, sign +1 and secretly chosen orientation mask **87**. Rerun the **same 4,096-model search without passing the secret model to the scorer**. The unique model with IoC >0.05 is the correct inverse \`(spiral_values, sign+1, direction-1, mask87)\`; GP IoC is **0.07503057609451266**. All **6,561/6,561** Latin runes are recovered exactly, and reencryption reconstructs every synthetic ciphertext rune. This shows the original no-signal result is not simply a broken inverse or ineffective statistic under the planted language model.

**Affine unweighted positive control.** The same genuine Latin plaintext is zeta-encrypted under secret mask173, then encrypted by \`C=5zeta(P)+17 mod29\`. The blind 14,848-model scan recovers the correct inverse orientation and mask173; maximizing GP IoC selects input offset5, which happens to decode **6,560/6,561** source runes. The true inverse input offset is12, and it restores **6,561/6,561** runes exactly. The difference is a single changed rune because the full tensor Möbius inverse of a constant input is one-sparse. The correct key is source-known in the planted control; the fitted maximum identifies an equivalence class, **not** an authenticated secret input offset. Synthetic forward reencryption is exact.

## Why these two bounded negatives matter and what remains

The source-specified 16-entry spiral admits a geometrically natural 8-pair incidence reading that has not been included in earlier additive trit-pad or Boolean-table inversions. The authentic control gives a discriminating, *full original-length* test of that reading. **Neither original transformation uncovers GP prose or a usable source key.** Future work should require an independent clue fixing a different coordinate ordering, ciphertext-to-state map, intermediary register or key interaction before reopening the same tensor family. Do not spend further compute optimizing a GP language model over unconstrained tensor masks: the source does not presently fix a historical extraction rule and the observed original rune distribution has no native-language signal.

Reproducers: [unweighted eight-axis inverse and affine control](../sims/lp2_ternary_mobius_zeta_inverse.cjs), [p15-source weighted inverse and blind native control](../sims/lp2_ternary_spiral_weighted_zeta_inverse.cjs). Original source: [canonical LP2 corpus](../resources/liber-primus/lp2-corpus.json); [Latin source word register](../resources/control/latin-vulgate-gp-wholewords.txt); [Fibonacci-prime spiral reconstruction](../results/fibonacci-prime-spiral.md). Exact original-script assertions prevent silently changing source ciphertext or the documented result. No change to the established-results synthesis is warranted.
