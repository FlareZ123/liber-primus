# Opening 27-square: symmetric three-tap separable inverse

**Agent40, 26 November 2026.** Exhaustive bounded negative, not a decrypted page.

The p0–2 three-page illustrated opening contains exactly 262+266+201=729=27² GP29 symbols, with opposing three-bar crosses on each page. This supports considering an equal-side grid and symmetric local mixing, but neither the 27-square reading, local convolution nor the boundary condition is an authenticated instruction. The [two-axis integral receiver](lp2-p0-27square-2d-integral-source-inverse.md) is distinct: its mixed derivative is not this symmetric operator. This experiment asks whether the most direct reflection-symmetric three-tap row/column cipher can be decoded with all its coefficients unknown.

## Exact receiver

Let N=27, field GF(29), and C the unmodified row-major p0–2 tape. For each axis independently, take identity, L_t or its inverse, where (L_t x)_i=x_(i-1)+t x_i+x_(i+1), t=0…28, with either zero exterior or cyclic boundary. Singular operators are discarded, since they cannot give a lossless arbitrary-square cipher. Normalization loses no nonzero tap scale: any two axis scale factors can be absorbed into global a. For every pair of operators R,K, decode

P = a R C K^T + b (mod 29), a ∈ GF(29)×, b ∈ GF(29).

The inverse for replay is C=R^(-1)((P-b)/a)(K^(-1))^T. This includes one-axis variants, independent axis boundary conditions and independently direct/inverse local operators. Center-only taps are represented by identity plus global a. This does not include arbitrary nonseparable 3×3 filters, unequal opposite taps, non-affine alphabets, F interruptions, or arbitrary reordering. Zero-boundary singular t: 0,3,7,10,11,12,13,16,17,18,19,22,26. Cyclic singular t: 1,27. There are 33 and 55 distinct operators respectively, giving 7,744 operator/boundary pairs and 6,288,128 affine candidates. Identity is duplicated across boundary conventions; counts are enumerated cases, not distinct global functions.

## Recovery attempt

Use a fixed smoothed unigram model trained on the repository Gibran text (62,492 GP-normalized runes), with greedy per-word tokenization documented by the executable. No title crib is assumed. Score every affine candidate exactly by its histogram; independently retain maximum IoC (invariant under affine symbol relabeling). Bigram is diagnostic for the unigram winner, not optimized over all keys. Control comparisons use 297 disjoint 729-rune Shakespeare windows and four disjoint editor-normalized solved LP1 windows. The Shakespeare conversion is a literary GP simulation; the LP1 translation is an editorial reference, not a rune-exact independent physical transcription.

| Input | Max IoC over keys (or actual control IoC range) | Best unigram log score per rune |
|---|---:|---:|
| Original p0–2 | 0.0362230362 | -3.8972450153 |
| Shakespeare 297 native-register windows | 0.0540406096–0.0688923559 | -3.0712131603 to -2.9111200561 |
| LP1 editorial 4 windows | 0.0600174859–0.0625989237 | -2.9771569222 to -2.9538421221 |

Maximum-IoC original: zero rows L27 inverse, cyclic columns L2. Best unigram original: zero rows L14, cyclic columns L18, a=1,b=5; its bigram score is -4.6002927034 versus Shakespeare -2.9385831477 to -2.5456592419 and LP1 -2.6799920897 to -2.5821551651. Candidate begins B S X J H E E IA O EA OE E I EO NG G Y AE EA W S W IA D M TH J D N X EA Y D EA …; incoherent. Both maximization criteria lie beyond every finite comparison window. No plaintext candidate is authenticated.

Two disjoint Shakespeare plants, with fixed hidden keys (zero L6, cyclic inverse L6, a=7,b=19; cyclic L6, zero inverse L9, a=13,b=8), were encrypted and subjected to the same complete receiver. The exhaustive unigram winner exactly recovered both hidden keys and 729/729 runes for each plant. Replay was asserted whenever a new best unigram candidate was selected. This is a controlled native-register recovery test, not proof of the original author’s cipher.

## Decision

The complete symmetric separable three-tap square mechanism cannot recover ordinary GP-normalized English matching these finite control statistics. Since affine relabeling does not change IoC, no more global scale, offset or affine alphabet tuning can restore the missing marginal concentration. Retire this exact family; its failure does not settle the square framing or more general mixing. In the absence of a source-selected additional operation, do not extend the filter hierarchy.

Reproduce: `node sims/lp2_p0_27square_symmetric_separable_three_tap_sft.cjs` from the repository. [Executable](../sims/lp2_p0_27square_symmetric_separable_three_tap_sft.cjs) · [full output including the 729-rune original winner](lp2-p0-27square-symmetric-three-tap-output.json). The function was executed directly in the V8 runtime on the live repository inputs; no CI run is claimed.
