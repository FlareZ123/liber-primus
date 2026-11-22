# Higher-replicate, exact-word-length challenge of a published sparse collision-repair generator

**Agent 6, 2026-11-10. Status: independent, exact-length and 5,000-replicate reproduction of externally published mechanism M1; no recovered LP2 cipher, plaintext, or key.** The proposed repair mechanism already appears as **M1 t6** in [pnotisdev's earlier phase-25 simulator](https://github.com/pnotisdev/cicada3301/blob/main/work/mech25/sim25.py), with [60-run comparative results](https://github.com/pnotisdev/cicada3301/blob/main/results/analysis/mech25.txt) showing a similar match for lag six and failure at lag five. The new contribution here is tighter length-matched simulation, full 5,000-replicate tails, explicit per-word hit multiplicities, and simultaneous checking of all already known structural constraints. **This is a stronger falsification/reproduction, not a newly invented cipher mechanism or a cryptanalytic breakthrough.**

## Mechanism: collision repair with a word-local affine target

The previously proposed M1 construction obtains two otherwise unusual corpus features from one state update by generating an underlying uniform 29-symbol ciphertext stream and replace selected immediate collisions:

1. Draw a provisional value \(U_i\) uniformly from \(\{0,\ldots,28\}\).
2. If \(U_i\neq C_{i-1}\), retain \(C_i=U_i\).
3. If \(U_i=C_{i-1}\), repair it with probability \(p\). Where the current displayed word has at least six preceding runes, try to emit \(T(C_{i-6})\) for
   \[
   T(x)=(24-2x)\bmod29.
   \]
   If this target still equals \(C_{i-1}\), or if the position is within the first six characters of its word, select uniformly from the 28 alternatives to \(C_{i-1}\).
4. If collision repair is not selected, retain the repeated rune.

All 2,896 actual word lengths are retained. The anti-repeat condition continues **across displayed word boundaries**, while the affine target has **word-local eligibility**. The only continuous parameter is fixed independently of lag-six counts by the observed 86 immediate ciphertext repeats among 12,955 contiguous rune transitions:

\[
p=1-\frac{29(86)}{12,955}=\mathbf{0.8074874565804708}.
\]

Why this is plausible: the rule sends *some of the adjacent-collision probability mass* toward the six-step affine target. It therefore increases the number of exact six-step affine pairs even though most ciphertext symbols remain uniformly distributed. On the 1,290 eligible positions, an ordinary anti-repeat generator yields about 45 affine matches, while the targeted rule produces roughly 78. No plaintext- or key-specific assumption is required to produce this *ciphertext-only signature*.

The target \(T\), its intercept 24, and its lag 6 were **selected historically after viewing LP2**; they are not derived independently from manuscript artwork or a key. Because this published family was already simulated elsewhere, the evidence here chiefly improves precision and makes the stringent lag-five falsification reproducible on the exact LP2 word-length vector.

## Reproducible challenge and out-of-fit constraints

The exact [CommonJS reproducer](../sims/lag6_sparse_collision_repair.cjs) generated **5,000 synthetic manuscripts per model**, fixed pseudorandom state \`0x31033019\`. Inputs are the original transcribed first 55 rune-bearing LP2 records; the runeless physical page 50 and solved final two pages are excluded. Each synthetic manuscript contains 12,956 runes partitioned into the **same 2,896 word lengths**. The comparison model uses the *same estimated repair rate* but selects a uniformly random nonrepeating replacement rather than the affine target.

The unmodified job succeeded on [GitHub Actions run 42763764899](https://github.com/FlareZ123/liber-primus/actions/runs/42763764899). Tables show simulation mean ± one SD, with empirical one-sided p-values calculated as \((1+\mathrm{tail})/(5,001)\).

| Observable | Original LP2 | Random collision repair | Affine-target collision repair |
| --- | ---: | ---: | ---: |
| Within-word affine matches at lag 6 | **80** | 44.580 ± 6.557 | **78.029 ± 8.675** |
| Distinct words containing ≥1 lag-six affine match | **74** | 42.857 ± 6.202 | **72.895 ± 7.860** |
| Additional affine matches beyond one per hit word | **6** | 1.723 ± 1.322 | **5.134 ± 2.336** |
| Maximum such matches for any of 29 source rune identities | **7** | 4.505 ± 0.970 | **6.512 ± 1.169** |
| Equal adjacent runes *within* displayed words | **63** | 66.867 ± 8.219 | 66.751 ± 8.209 |
| Equal adjacent runes *between* displayed words | **23** | 19.074 ± 4.326 | 19.211 ± 4.343 |
| Nonadjacent repeated-rune pairs inside length 4–9 words | **526** | 511.368 ± 21.354 | 511.243 ± 21.721 |

The original 80 six-step matches fall well within the targeted model's predictive distribution (upper-tail p = **0.4253**), while the basic random-repair model is short by more than five of its SDs (upper p = **0.00020**). Word multiplicity, maximum source-rune hit concentration and the split between inside-word and crossing-word adjacent repeats also lie in ordinary targeted-model ranges. No extra parameters were introduced to fit these comparisons, but the original mechanism and target were chosen with knowledge of LP2. The doublet *total* itself is fitted, so individual within- and crossing-word counts are useful checks without being fully independent evidence.

## What decisively fails

Two previously identified short-range features were **never used** to choose the rule, and the targeted model misses them:

| Independent withheld statistic | LP2 observation | Targeted model, 5,000 runs | One-sided empirical p |
| --- | ---: | ---: | ---: |
| All word-internal lag-five identical-rune pairs | **104** | 72.591 ± 8.483 | **0.000600** |
| Lag-five repeats of the particular rune ᛋ (GP index 15) | **11** | 2.509 ± 1.566 | **0.000200** |

The candidate also predicts about **44.47** word-internal lag-six identical-rune pairs, against **32** observed (lower-tail p ≈ **0.0324**), and about **111.49** lag-four same-rune pairs, against **131** (upper p ≈ **0.0370**). These latter discrepancies are modest and were selected for inspection after earlier data exploration; the lag-five mismatch is the primary falsifying constraint. The 104 lag-five pairs include 11 of index 15, so these two tests are correlated and their p-values should not be multiplied.

**This generator does not satisfy the full known LP2 ciphertext profile.** It should not be promoted as the cipher or a means to recover the underlying plaintext. Its strongest use is as a small explicit demonstration that a **sparse 80%-rate collision-repair channel** can create the lag-six anomaly while preserving nearly uniform ciphertext and suppressing immediate repeats across words.

## Constructive information-loss bound

Even setting aside the lag-five failure, the published M1 repair mechanism **cannot be a universally invertible cipher by itself**. The [independent executable proof](../sims/lag6_repair_preimage_bound.cjs), successfully run as part of [CI 42764644445](https://github.com/FlareZ123/liber-primus/actions/runs/42764644445), identifies **79 of the 80** actual lag-six affine matches where the emitted rune differs from its immediate predecessor. Let \(Y_i=T(C_{i-6})\ne C_{i-1}\) at any such site. Holding the past *output* fixed, a collision-approval bit of 1 and either of these two distinct raw input runes produces the identical \(C_i=Y_i\):

* raw \(U_i=Y_i\): the rune is emitted directly, with no collision;
* raw \(U_i=C_{i-1}\): a collision is approved and rewritten as \(Y_i\).

Since both cases emit the same rune, subsequent feedback is identical. The code constructs a **single fixed collision-approval mask** with all 79 such bits set to 1; it verifies that the original raw stream, each of 79 individually modified raw streams, and the stream with all 79 changes emit *exactly the observed 12,956 LP2 runes*. Every subset gives another valid raw preimage with that same mask. Consequently, **one legitimate fixed approval schedule admits at least \(2^{79}\approx6.04\times10^{23}\) distinct raw input strings** mapping to this ciphertext. The bound is constructive and does not depend on assumed language frequencies. It is a statement about this candidate mechanism, **not** proof that the actual LP2 cipher used it.

Under the stochastic iid uniform-input model with independent collision-repair probability \(p=0.807487...\), and treating the approval decisions as unobserved, the posterior probability that each ambiguous affine output originated from a repaired collision is \(p/(1+p)=0.4467458\). The corresponding binary conditional entropy is **0.9918015 bit per site**, or approximately **78.35 bits** across the 79 sites, apart from any other ambiguous outputs. This entropy figure is conditional on the specified iid model; any external message redundancy can reduce linguistic ambiguity, and a separate repair/erasure side channel could restore exact decoding.

A stream key whose values are *known* does not generally repair this many-to-one information loss: additive stream decryption maps each of the distinct raw inputs to a distinct underlying plaintext. A lossless implementation requires additional state, redundant coding, or auxiliary collision information. The mechanism thus provides a useful *forward* explanation for the affine anomaly while leaving the actual plaintext-recovery architecture fundamentally underspecified.

## Consequence for cryptanalysis

The original lag-six anomaly need not imply a dense six-state cipher or a six-period keystream. A stateful rare-event rewrite could reproduce it. For comparison, the separately tested 3301-residue additive recurrence [failed a positive-control-backed held-out plaintext attack](affine-3301-keystream-heldout.md).

The next useful mechanism must supply, **without choosing each collision site after seeing the ciphertext**, the extra lag-five equalities (including the rune-ᛋ specificity), the low lag-six identity count, and an invertible state/erasure schedule to permit key or plaintext recovery. A repair rule alone that lacks such a mechanism remains a generative conjecture.
