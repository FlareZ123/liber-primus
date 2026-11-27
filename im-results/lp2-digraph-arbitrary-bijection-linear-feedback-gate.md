# All-matrix feedback removal for an arbitrary GP29 digraph permutation

**Agent36, 27 November 2026 — exact original-input gate and constructive matrix recovery.** No unknown plaintext or authentic key. The direct stationary digraph-permutation gate already excludes a static 841-entry map in the matched native register; this extends it to a genuinely evolving ciphertext-dependent offset. The original p49–51 two-character numerical cells weakly motivate a digraph register, but do not authorize this cipher or its clock. The exact solution method can be reused if a source independently specifies a pairwise linear feedback receiver.

## Complete model and inverse

Use consecutive physical-order GP29 pairs as vectors in GF(29)^2. Consider every possible 2×2 matrix A, singular or nonsingular, and an arbitrary secret bijection π on all 841 digraphs:
 
    C_i = π(P_i) + A C_(i-1) (mod 29)
    D_i = C_i - A C_(i-1)
    P_i = π^(-1)(D_i)

Exclude the first complete block of each framed interval to grant any IV. Any affine constant and any invertible left multiplier on C_i can be absorbed into π; the model therefore includes B C_i = π(P_i)+A' C_(i-1)+b for invertible B. This is distinct from [static digraph permutations](lp2-gp29-digraph-permutation-allkey-original-gate.md), the [GF841 scalar octet feedback](lp2-gf841-affine-feedback-octet-support-recovery.md), and the [four-rune affine CBC family](lp2-dense-affine4-cbc-lexical-original-gate.md). No literal-F skip or variable framing is claimed.

## Exact fast search, including all 707,281 matrices

For any two distinct transition indices i,j, equality of residuals is equivalent to

    A (C_(i-1)-C_(j-1)) = C_i-C_j.

The zero predecessor difference contributes a fixed collision iff the current difference also vanishes. Normalize every other predecessor difference to its unique projective direction v=(1,t), t in GF(29), or (0,1). Apply the same nonzero scalar to the current difference, obtaining w. Accumulate integer counts W_v(w) from all unordered pairs of observed transitions. For any A its exact unordered residual collision count is

    constant + sum over the 30 directions v of W_v(A v).

This reduces each matrix evaluation to 30 integer table reads, independent of message length. The maximum is exact, including singular and zero feedback. The winning matrix and five fixed matrix examples in each search are cross-checked against direct residual enumeration. Because π is bijective, residual collisions must equal plaintext digraph collisions regardless of π. For n residual blocks and maximum unordered collision count K, the number of distinct symbols in **every** candidate residual satisfies S >= ceil(n²/(2K+n)) by Cauchy–Schwarz. This last bound is language-independent.

## Blind matrix-recovery controls

The source-native GP rendering follows the earlier static digraph gate (greedy chart tokenization, QU→CW, V→U, K→C, Z→S). Encode independent contiguous Shakespeare and Gibran windows of 12,956 runes using two seeded arbitrary 841-way permutations and independently chosen matrices; infer A from only the first 3,239 ciphertext blocks. Matrix rows are encoded as 29a+b.

| Native source | Hidden matrix rows | Exact recovered rows | Ties | Held collision rate | Held decoded blocks with oracle π |
|---|---|---|---:|---:|---:|
| Shakespeare | 137,722 | 137,722 | 1 | .00564652 | 3239/3239 |
| Gibran | 612,48 | 612,48 | 1 | .00714253 | 3239/3239 |

The matrix is recovered without plaintext or the hidden permutation. Oracle π is used only to demonstrate the held inverse, so this is not a claim of blind arbitrary-permutation recovery.

## Original manuscript decision

All 12,956 unknown runes in the pinned canonical source, both continuous pair phases. Also grant every authentic visual chapter its own completely unrelated matrix and completely unrelated secret 841-entry permutation. Native floors are the minimum collision rates over the same geometry and both phases, in 33 unscreened Shakespeare and 8 Gibran full-length windows at stride6400. Original maximums optimize every matrix and both phases; native minima optimize the adverse direction. No result below is a universal English theorem.

| Source interval | Best original residual collision rate | Lowest matched native rate | All-matrix minimum support bound (both phases) |
|---|---:|---:|---:|
| Whole p0–55 | .00124497 | .00530818 | 715 |
| p0–2 | .00197860 | .00477908 | **261 exact minimum** |
| p3–7 | .00164685 | .00472547 | 295 |
| p8–14 | .00147330 | .00509742 | 381 |
| p15–22 | .00145971 | .00519106 | 399 |
| p23–26 | .00170939 | .00494253 | 273 |
| p27–32 | .00154747 | .00493624 | 340 |
| p33–39 | .00149414 | .00531789 | 373 |
| p40–53 | .00135459 | .00523308 | 496 |
| p54–55 | .00348554 | .00421397 | 100 |

Whole-book phase 0 maximum 26,027 unordered collisions at rows [160,160], phase 1 maximum 26,102 at [1,1]. Both give a near-uniform residual; neither is an authenticated key. Training on the first 6,478 original runes selects [245,556], collision .00127006; frozen on the final 6,478 runes (omitting the first pair of that split), .00119125. No transfer toward native structure.

The Cauchy–Schwarz lower bound alone excludes any fixed 256-symbol (octet) residual codebook in seven of the nine chapters. For p0–2, a separate exact support enumeration of all 707,281 matrices in each phase gives minimum support 267 (three ties) and 261 (one tie); **zero** matrices have support ≤256. Thus the byte-alphabet interpretation is mathematically impossible in the first eight visual chapters even if each chooses its own feedback matrix and arbitrary codebook, under these fixed pair clocks. The terminal chapter has too few pairs for this capacity argument. This is independent of language or the choice of an octet-to-pair bijection.

## Reproduction and decision

- [CommonJS standalone SFT](../sims/lp2_digraph_arbitrary_bijection_linear_feedback_sft.cjs).
- [Exact raw results and source blob pins](lp2-digraph-arbitrary-bijection-linear-feedback-output.json).
- Executed the projective core and exact opening support enumeration in connected V8; standalone Node wrapper not separately executed. Exact direct residual computations check the projective search. One concurrent Contents write conflict on the opening support extension was retried successfully.

Retire this stationary arbitrary-digraph-plus-linear-ciphertext-feedback family for the tested native-English and octet registers. The result does not exclude plaintext-feedback inside π, arbitrary nonlinear or changing feedback, alternate segmentation or independent missing state. Do not promote the exploratory p50 motivation to an author instruction. The projective incidence method is reusable for exact matrix inference if another source-constrained architecture reduces to residual equality. The authoritative plaintext frontier is unchanged. The source-motivated ordinary-clock periodic extensions are also negative (below).

## Authentic-key-length periodic extension: all matrices and all permutations per lane

The two authentic LP1 additive keys have 8 and 13 runes; in a fixed all-consuming pair clock these imply periods 4 and 13 blocks, respectively. This is a distinct generalization of the stationary model, not an arbitrary period sweep. Grant every lane r=i mod q its own entirely independent A_r and arbitrary bijection π_r. The previous projective search applies separately to the observed transitions in each lane; importantly the predecessor remains the immediately previous **original** ciphertext pair, not the previous pair in the lane. Allow all 707,281 matrices in each lane and both global pair alignments. Any phase-dependent additive key is absorbed into π_r. The phase origin is immaterial because all lane keys are free. This is an ordinary-consuming exploratory receiver; literal-F held clocks are not included.

| Pair period | Original phase 0 pooled maximum | Original phase 1 pooled maximum | Smallest pooled native rate | Largest individual original rate | Smallest individual native rate | Minimum all-matrix support bound across all lanes |
|---:|---:|---:|---:|---:|---:|---:|
| 4 | .0013545893 | .0013454642 | .0052573099 | .0013689416 | .0049733885 | 504 |
| 13 | .0017413088 | .0017263175 | .0052512509 | .0018832846 | .0043958530 | 258 |

Pooled means sum of exact ordered collisions divided by sum of eligible ordered comparisons within lanes. Both the pooled and individual comparisons use the same 33 Shakespeare and 8 Gibran native windows and exact phase geometry as above. Since even the best individual original rate is below every matched native lane, no fitted combination of independent lane permutations can recover that reference register. The support bound is stronger and language-independent: **all** matrices in **every** lane require more than 256 distinct residual symbols, even at period13.

Positive controls use independently randomized 841-element lane permutations and matrices on contiguous native windows beginning at donor offset6400, infer the matrices on first 4,860 blocks, and freeze them on remaining 1,618 blocks:

| Pair period | Donor | Matrices uniquely recovered | Held plaintext with oracle lane permutations | Held pooled rate |
|---:|---|---:|---:|---:|
| 4 | Shakespeare | 4/4 | 1618/1618 | .0058909666 |
| 13 | Gibran | 13/13 | 1618/1618 | .0077191085 |

The arbitrary lane substitutions are not recovered blindly. These controls establish recovery of the linear feedback component, not a complete blind plaintext inverse. No unknown-page key or plaintext emerged.

[Periodic CommonJS SFT](../sims/lp2_digraph_periodic_projective_feedback_sft.cjs), [q4 raw](lp2-digraph-periodic-feedback-q4-output.json), [q13 raw](lp2-digraph-periodic-feedback-q13-output.json). Both executed in connected V8 using the pinned source and exact projective method; q13 evaluated the pinned authored script's computational function. Standalone Node wrapper not separately run. Retire both historic-length ordinary-clock extensions rather than expanding arbitrary periods without a source-selected clock.
