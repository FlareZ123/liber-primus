# Page-aligned affine rank-one shift inverse — #3243

## Decision

Retire the tested ordinary GP29 page-aligned shared affine-column receiver as an explanation of LP2 without a new independently selected state/clock constraint. It is a **recoverable** low-dimensional family: four disjoint historical native-prose plants recover all 44 fitted and 11 held-out frame coefficients (up to gauge), the first 200 column keys exactly, and 1,475/1,475 genuinely withheld core runes per plant. The same frozen receiver yields original held-out language score −5.50938 nats/rune, worse than the unrelated-pad rival (−5.47237), and no coherent continuation. In addition, a plaintext-independent repeat-tail bound rejects the iid uniform parameter generator at probability ≤1.30×10⁻⁹; this is a probabilistic restriction on the generator, not an algebraic exclusion of arbitrary structured keys.

No unknown plaintext, authentic key or first-party selection of this page clock has been recovered. Physical page cuts are independently visible but do not prove a cipher reset. The manuscript has word carries across pages; no free realignment, F-hold, page permutation, or per-page key fitting was introduced.

## Model, gauge, and necessary constraints

For physical rune-bearing page i and zero-based printed rune offset j, use ordinary GP29 indices:

    C[i,j] = P[i,j] + u[i] v[j] + w[j]  (mod 29).

The two shared column vectors are free; each page has one scalar. A nondegenerate representation has an affine gauge of size 28×29: u' = a u + b, v' = v/a, w' = w − b v/a for a ≠ 0. Nominal parameter count is 55+2×277−2=607 field elements after this gauge. Ragged support creates additional nonidentifiability: p29 alone extends beyond offset273 and the fixed training split has no observation at offsets274–276. Every independent choice of the shift for these three cells leaves all training ciphertext and prefix inference unchanged. With uniform independent column vectors, their unknown plaintext has uniform conditional distribution even when training plaintext and all row coefficients are given. No exact full-page holdout is identifiable under this split without extra structure. More generally a column with only one known row coefficient constrains only one combination of v,w; a second distinct coefficient is necessary to determine both.

Let K=C−P. On any common rectangle, K[i,j]−K[k,j]=(u[i]−u[k])v[j]. Thus every two centered row-difference vectors have vanishing 2×2 minors on shared columns. Equal coefficients give identical row shifts and C[i,j]−C[k,j]=P[i,j]−P[k,j]. These are exact necessary conditions, but neither plaintext differences nor equal-coefficient labels are supplied by original ink. The period-29 page-reset rival is a degenerate subfamily (v=0), so successful recovery cannot establish nonzero rank; compare the smaller model directly.

Preflight: #2475's two-clock CRT law has a single fixed global period403 and is subsumed by the prior all-secret phase equality gate; this page-dependent scalar law has no such fixed global phase. #2525's prime-origin/typed-reset and #2477's word-index Feistel use different key architecture. Neither gives an exact exclusion of the present nondegenerate page rank-one law.

## Frozen experiment

- Source: `resources/liber-primus/lp2-corpus.json`, blob 054f2a0f780b7d46901acbe3d9bf4f0ac1801165. 55 physical rune-bearing p0–55, 12,956 runes. Frame origin is first rune of each physical page; keep red headings; p50 omitted as rune-free. No separator assumptions.
- Fit 44 pages (physical page mod5 ≠ 4), 10,400 runes. Held 11 pages (mod5=4), 2,556 runes. Freeze shared vectors using fit pages only; infer only the held page scalar from its first48 runes, score remaining 2,028. Core holdout j=48–199 has 1,475 runes; three j≥274 have no fit observation and are inherently unpredicted. The raw candidate uses arbitrary zero key values there solely for replay.
- Native controls: Gibran and Emerson, separate source intervals [18000,30956) and [31000,43956) after the same fixed GP normalization; train unigram and smoothed bigram on a third donor Shakespeare. GP transliteration uses longest match, ING and IO aliases, QU→CW, V→U, K/Q→C, Z→S. Seeds 3243+t×7919, t=0..3; independently sampled u,v,w. Re-encipher authentic p56 and p57 plaintext under the planted shared columns and independent new scalars; their first48 runes alone determine their scalar, remaining37/47 withheld. The p56 known literal-F hold is at offset56, confirmed by exact entire solved plaintext; other ciphertext F positions consume shifts. The planted receiver itself has no F-hold.
- Equal-coefficient pair log-likelihood uses h(d)=log(29 Σ_x f(x)f(x+d)); two strongest disjoint pairs initially define gauge 0 and1, conditional 841-state column posteriors; greedily add next most discriminated scalar from posterior marginalized predictions. Refine each scalar by deleting and reinserting its likelihood factor, up to five coordinate passes. The only numerical pruning discards posterior masses ≤10⁻¹⁴ (at most 841×10⁻¹⁴ per column; min trained f≈10⁻⁴). Final shared column states via exact bigram Viterbi within the top32 unigram posterior candidates per column. This is a calibrated heuristic, not an exhaustive unknown-plaintext optimizer.
- Rival t4 unrelated iid pad; t5 ordinary page-reset period29 key. Baseline learns a single period29 vector from fit pages. Original t6 same algorithm, no re-tuning. Re-encryption exactly replays every original/control rune but is only an inverse invariant, not authenticity.

## Executed results

| Trial | True fit scalars modulo gauge | Exact column states j<200 | True held scalars | Held correct /2028 | Held core /1475 | Held bigram nats/rune | Within-page repeats |
|---|---:|---:|---:|---:|---:|---:|---:|
| Gibran A | 44/44 | 200/200 | 11/11 | 2017 | 1475 | −2.58225 | 463 |
| Emerson A | 44/44 | 200/200 | 11/11 | 2022 | 1475 | −2.66657 | 435 |
| Gibran B | 44/44 | 200/200 | 11/11 | 2023 | 1475 | −2.62069 | 411 |
| Emerson B | 44/44 | 200/200 | 11/11 | 2023 | 1475 | −2.62288 | 418 |
| iid-pad rival | — | — | — | 72 | 56 | −5.47237 | 472 |
| Period29 page-reset rival | degenerate | — | — | 2023 | 1475 | −2.66101 | 421 |
| Original LP2 | unknown | unknown | unknown | unknown | unknown | **−5.50938** | **86** |

Authentic re-enciphered p56/p57 controls: 37/37 and 47/47 withheld in each of four plants (336/336 total). The plain period29 model decodes its own plant 2028/2028; on original its held score is −5.31226, still not readable. Fit language scores −2.591 to −2.652 for four plants, −3.76599 iid pad, −3.76670 original. Original p4 held excerpt is `CCFEGCUETFAERMOJJPNGFOEMEAWFRNGTNGWWHNNILMPGYLWEOIAJFWYIAPCFFEOEEAHTHTHXSEBIARARJSHMXM`; this is failed candidate output, not plaintext. Full original shared vectors, held scalars and held candidate tape are preserved in trial6 JSON.

## Plaintext-independent random-key repeat-tail restriction

Freeze arbitrary plaintext P and arbitrary u, independent of the randomly generated column vectors. If each v[j],w[j] is independent uniform GF29, the increments (v[j]−v[j−1],w[j]−w[j−1]) are themselves independent uniform pairs over j (invertible change of variables including first state). Let n_j be the number of page rows with both positions j−1,j, and R_j the number of ciphertext equalities among those rows. Then R_j independent over j, 0≤R_j≤n_j, E R_j=n_j/29, regardless of plaintext or u. Original within-page R=86 of N=12,901; mean N/29=444.86207. For any t>0, convex chord bound gives

    Pr(R≤86) ≤ exp(86t) Π_j [1−p+p exp(−t n_j)], p=1/29.

At t=.03484359, bound 0.01010922 for *every fixed u and P*, even maximally correlated rows. This also covers nonrandom u with uniformly random columns.

For distinct u_i,u_k, the two shift differences are an invertible linear map of independent uniform increments, hence their equality indicators are independent. In a same-u class their covariance is at most p(1−p). Let M be largest u multiplicity across all 55 rows. Conditional variance bound Σ_j Var(R_j)≤N p(1−p) M. Apply one-sided Bennett to independent X_j=E R_j−R_j≤b=55/29, with d=Np−86, V=Np(1−p)M, h(x)=(1+x)log(1+x)−x:

    B(M) = min(0.01010922, exp(−V h(bd/V)/b²)).

For iid uniform row coefficients, Pr(M≥L)≤min(1,29 Pr(Binomial(55,p)≥L)). Monotonic B and tail summation yield

    Pr(R≤86) ≤ B(1)+Σ_{L=2}^{55}(B(L)−B(L−1)) min(1,29 Pr(Binomial(55,p)≥L))
             ≤ 1.299813×10⁻⁹.

This is a conservative unconditional bound uniform over fixed plaintexts, independent of language scores and the heuristic recovery. It does **not** exclude adversarially chosen or correlated column increments designed to avoid repeats; such a law must explain how the historical solver obtains that extra structure. Nor does it transfer to a different clock or F-hold channel.

## Reproduction and next action

- [Blind recovery SFT](../sims/lp2_page_affine_rank1_greedy_sft.cjs), code blob b94ab8012c57ac24f7c5cd9d40ef44a19ba81889; execute one trial via `node sims/lp2_page_affine_rank1_greedy_sft.cjs 0` (0..6), or all with no argument. Each trial actually ran in connected V8 from the preserved function body; standalone Node wrapper not independently run due to local Git DNS. Raw: [0](lp2-page-affine-rank1-trial0.json), [1](lp2-page-affine-rank1-trial1.json), [2](lp2-page-affine-rank1-trial2.json), [3](lp2-page-affine-rank1-trial3.json), [iid](lp2-page-affine-rank1-trial4.json), [periodic](lp2-page-affine-rank1-trial5.json), [original](lp2-page-affine-rank1-trial6.json).
- [Repeat bound SFT](../sims/lp2_page_affine_rank1_repeat_bound.cjs) and [actual output](lp2-page-affine-rank1-repeat-bound.json). Evaluated in V8 and independently checked numerically in local Python.
- Director: do not repeat free rank-one page-fitting or promote high fit likelihood as plaintext. A different receiver requires an independently visible registration or a deterministic correlated state law which explains the repeat deficit and supplies the missing tail state. A true source-selected cross-frame crib could still use this calibrated marginalized inverse; no such input exists here.
