# p0 55×13 page-key matrix: per-page circulant Hill gate

**Current decision:** fixed 13-block, shared-affine, chained, scalar-feedback, and word-local circulant receivers remain negative. The word-local image test excludes arbitrary shared output alphabets and every independent page orientation, without a language model. The exact affine column-mean repair of the singular p50 panel also gives nonprose, even after integrating every possible null-mode restoration. The page-row assignment and singular p50 alignment remain conditional structural observations.

## Question

Can the 715-symbol opening payload be read as 55 per-page 13-symbol keys, with each row defining a 13×13 circulant Hill matrix for the corresponding LP2 page?

This is a bounded extension of the source-derived p0 partition:

- p0 has a 13-rune red title and a 13-dot boundary mark.
- The first black rune is TH (GP29 index 2).
- Removing that one sentinel from the p0–p2 opening stream after the title leaves 715 symbols = 55 × 13.
- The 55 rows can be paired, in order, with the 55 pages p1–p55.

The source does not explicitly say that rows are page keys or that a row defines a circulant matrix. The p15 4×4 Hill analysis shows that Hill operations are within the manuscript's demonstrated mathematical vocabulary, but it does not establish this 13×13 construction. This test asks whether that simple construction has a plaintext receiver.

## Frozen receiver

For each key row `k`, construct one of the two standard 13×13 circulant orientations:

```
M[i,j] = k[(j - i) mod 13]
M[i,j] = k[(j + i) mod 13]
```

Treat each page p(i+1) as 13-symbol column-vector blocks and decrypt each complete block with:

```
P = inverse(M) * C (mod 29)
```

Map key row 0 to p1, ..., key row 54 to p55. Decrypt complete 13-symbol blocks only; leave a page's final incomplete block untouched rather than inventing padding. Skip p50, which is the numeric table and has no rune ciphertext in the canonical corpus.

No row-specific parameter, matrix search, padding search, or language-model fitting is performed. A native GP29 trigram model (excluding the solved p56/p57 sections) is used only to score the resulting pages.

## Result

**Outcome: rejected.**

| Measurement | Right-shift circulant | Left-shift circulant |
|---|---:|---:|
| Text pages scored | 54 | 54 |
| Invertible key matrices | 54 | 54 |
| Singular key matrices | 0 | 0 |
| Median decoded trigram score | -3.5414 | -3.5452 |
| Median raw trigram score | -3.5483 | -3.5483 |

The native GP29 control median is -1.8161. The best decoded page is p38 under the left-shift orientation, at -3.4414; its output remains non-prose. The median score changes are only +0.0069 and +0.0031 over raw ciphertext, respectively. Neither orientation produces a native-language page.

**Decision:** the 55×13 rows do not act as per-page 13×13 circulant Hill keys under either standard cyclic orientation. This rejects this specific receiver, not every possible use of the 55×13 partition.

## Reproduction

Run from the repository root:

```sh
node sims/lp2_p0_13row_circulant_hill_pagekey_gate.cjs
```

The script asserts the 13 + 1 + 715 source partition, constructs the two circulant orientations over GP29, decrypts the 54 rune-bearing pages, and prints page scores and leading outputs. The calculation was executed in the connected JavaScript runtime against the repository corpus; no CI run is claimed.

## Relation to existing work

The [p0 13×55 matrix gate](../sims/lp2_p0_13x55_matrix_gate.cjs) tests row/column OTP and per-page Vigenere/keyed-alphabet receivers. The [p15 Hill4 transfer gate](lp2-p0-red13-body716-p15-hill4-gate.md) tests a different 4×4 key source and block size. This report tests the distinct possibility that each 13-symbol row is itself a compact key for a circulant 13×13 Hill matrix.

The row-to-page mapping and circulant construction remain hypotheses, not source-established mechanisms. No nonlinear or more elaborate matrix family is justified by this negative result alone.

## 2026-11-26: exact shared affine correction (Agent 7)

A single secret 13-rune output offset is a low-parameter extension of the fixed page-key Hill model. For every page, decode complete blocks as `P = M_page^-1 C - b (mod 29)`; the same unknown vector b and the same orientation apply across every page. No individual page offsets or row reordering. Exclude p0–2 as key material, fit p3–39 (8736 runes), hold out p40–55 (3224 runes; p50 has no rune ciphertext). The remaining 267 trailing runes on these 52 text pages are outside the block model. Bigram likelihood uses 2296 native runes in five sections, with add-0.5 smoothing and a uniform key prior. Four native sections are withheld from model construction.

Because every transition depends only on adjacent coordinates of b modulo 13, condition on b[0] and compute exact cyclic max-product and log-sum-exp, covering all 29^13 offsets for each of two orientations. Compare the marginal to iid uniform runes; posterior predictive log Bayes factors are full-data log marginal minus fit log marginal. Fit-only MAP replay is exact for every held original block.

| Receiver / data | Fit log BF | Predictive log BF | Held recovery |
|---|---:|---:|---:|
| Original right-shift | -4673.239 | -1922.217 | no coherent text |
| Original left-shift | -4702.896 | -1904.342 | no coherent text |
| Original orientation mixture | -4673.932 | -1922.217 | no coherent text |
| Native plant, right-shift | +145.708 | +242.269 | 338/338 |
| Native plant, left-shift | +145.708 | +242.269 | 338/338 |
| Matched-layout synthetic Markov plant, correct orientation | +6000.716 | +2184.815 | 3224/3224 |
| Matched-layout uniform null, orientation mixture | -4690.845 | -1819.304 | n/a |

The native plants use the same 663 independent-of-model native runes under different keys/orientations, so they are two cipher controls, not independent text samples. The synthetic control is generated from the fitted language model and calibrates the computation, not generalization. Both native plants and the synthetic plant recover the exact key from fit only. Original candidates remain non-prose; the original predictive marginal is worse than the single uniform null. Retire this shared-offset extension under the specified likelihood, not arbitrary matrix/offset schedules.

**Incidental structural observation:** the previously excluded p50 row is the only singular circulant among all 55 rows. Its indices are [20,11,11,5,20,7,28,23,1,23,12,28,14], sum zero modulo 29, rank 12, with all-ones null vector. All 54 rune-bearing-page rows have full rank and nonzero sum. This was discovered when the initial implementation inadvertently tried to invert p50; the receiver correctly skips it. The correspondence is interesting but post-hoc and does not establish the page mapping or a plaintext operation. Under exchangeable row labels conditional on exactly one singular row the chance of p50 is 1/55, without any correction for other searched structures. Do not promote it to a solved key or combine it with unrelated numerology.

Reproducer: `sims/agent7_p0_page_hill_shared_affine_sft.cjs`; results: `im-results/agent7-p0-page-hill-shared-affine.json`. Core executed in the connected V8 runtime on pinned corpus/native blobs, not standalone Node or CI. The rank observation was calculated separately by GF29 Gaussian elimination on all 55 rows.

## 2026-11-26: exact eight-symbol row receivers and p50 column-sum gate (Agent 7)

A natural consequence of the 13-rune key width is fixed 8-byte BASE29 integer packing (29^13 fits in 64 bits). The physical p50 panel is itself 13×8, permitting a second typed transformation: each 13-symbol row multiplies that panel to produce an eight-symbol key. These test the p1–55 mapping on the original unknown text, extending the older representative-page raw-rune key tests and distinct from its p3–57 matrix product known-page gate. Both valid panel alphabets (base60 and omitted-f base59) are included. The row50 rank exception selects no arithmetic operation by itself.

Four frozen banks: packed big-endian and little-endian bytes reduced mod29; row times physical p50 13×8 panel reduced mod29 under each radix. Each page starts at phase zero, both additive signs, ordinary consumption or authentic plaintext-F bypass. The latter is an exact DP over phase and previous plaintext: literal plaintext F yields C=F with no phase advance; a consuming branch may yield C=F from non-F plaintext, but cannot emit plaintext F. Bigram max-product chooses the best legal path without word assumptions; reachability failure requires no language model. All legal readouts replay the original exactly.

Across p3–55 (52 rune-bearing pages, 12227 runes), all eight ordinary variants are nonprose with mean log likelihood ratios vs iid uniform between -0.631 and -0.598 nats/rune. Under F holds, each fixed bank/sign has 48–52 impossible pages; a maximum of four pages retain any legal inverse. Surviving paths are nonprose. All 16 control configurations have complete legal paths; 14 recover all 683 held native runes, one 678/683 and one 681/683 because of intrinsic F ambiguity. The same native sample is reused across configurations. No key fitting was used. Retire these fixed typed receivers, not arbitrary q8 schedules.

The zero-sum row50 circulant has image equal to the zero-sum subspace, so if p50's physical 13×8 array were direct encrypted columns every column would sum to zero mod29. Observed base60 sums [28,26,24,16,0,24,7,20], base59 [23,25,26,21,2,1,11,20]; both direct interpretations are impossible. Row sums also do not act as direct page ciphertext-sum checks (only p23/p50 match) or rune-count checks (only p50). This leaves the rank exception as a weak, retrospective mapping clue, not a decoded panel.

Reproducer: `sims/agent7_p0_page_rows_q8_receivers_sft.cjs`; output: `im-results/agent7-p0-page-rows-q8-receivers.json`. Core executed in V8 on the pinned source, no standalone CI. No unknown plaintext or authentic key recovered.

## 26 November: zero-eigenvalue scalar receiver (Agent 8)

The sole p50 singularity is specifically the zero **constant-mode eigenvalue**, so a separate direct receiver treats each row sum `a_p` as a scalar field multiplier rather than reusing the 13×13 Hill blocks. This supplies an inverse for all 54 rune-bearing page rows, while zero makes the p50 plaintext unrecoverable. The observed adjacency suppression independently motivates testing a first-order ciphertext-feedback term; neither feedback nor this scalar receiver is authenticated by the source.

For each page p3–55 (skip p50 and reserve p0–2 as key material), test
```
C_i = a_p * (g*P_i+b) + k*C_(i-1) mod29
P_i = g^-1 * (a_p^-1*(C_i-k*C_(i-1))-b) mod29
```
with shared k,b in GF29 and g nonzero (23,548 distinct tuples). Use first ciphertext rune as public IV per page, no printed-group assumptions. Exact shared-key search uses the pooled residual bigram histogram and a fixed add-0.5 smoothed native Markov model. Fit p3–39, freeze for p40–55; these are familiar manuscript ranges, not fresh independent manuscript holdouts.

| Result | Fit | Frozen continuation |
|---|---:|---:|
| Original, k=1,g=18,b=7 | −5097.578 / 8874 runes | −2007.521 / 3301 runes (−0.608155 per rune) |
| Three affine plants | 3/3 exact keys | 1008/1008 withheld runes (+0.709042 per rune each) |

Scores are log likelihood ratios against iid uniform GP29. Plants share the same four held solved sections but change keys, page allocation and IVs; they are three cipher controls, not three independent texts. All 3301 original held symbols re-encrypt exactly but decoded text is incoherent. The full original maximizer is unchanged. Even replacing the affine map by an arbitrary common bijection cannot produce more than 946 occurrences of its two most frequent plaintext symbols among 12175 original residuals over all 29 feedback coefficients (7.77%); relaxing to a different arbitrary bijection per page gives at most 1455 (11.95%). The nine pinned native solved sections individually have top-two fractions 17.83–28.24%; this is a finite-control comparison, not a universal linguistic bound.

**Exact transparent-F extension.** Replace `g*P+b` by any shared GP29 bijection S, and let plaintext F emit literal ciphertext F=0. Enumerate all 841 pairs (k,S(0)) and all possible incoming feedback states independently for each page. Permit an ordinary ciphertext zero only when the residual differs from S(0); handle both F semantics (hold previous consuming ciphertext, or update the feedback to zero). A 29-state Boolean reachability calculation keeps every valid inverse path; no language score or guessed plaintext. Both conventions reject 840/841 pairs on original p3 alone. Their sole survivor is k=0,S(0)=0, for which every rune is exactly a static page-scaled substitution with no remaining F ambiguity. On p3–55 this survivor permits only 891/12175 pooled top-two occurrences (7.32%), or 1374/12175 (11.29%) with page-private alphabet relaxation. Six planted arbitrary-permutation controls (three k values, both conventions, same 683 source runes) retain every true pair; each has 5–6 surviving pairs, so the feasibility gate does not claim key identification.

**Decision:** retire the source-row-sum scalar receiver with stationary ciphertext feedback, in the specified ordinary shared-affine and transparent-F arbitrary-shared-alphabet forms. The F-hold rejection is exact except for the static survivor, whose exclusion is conditional on the native frequency evidence. The rank/zero alignment itself remains unexplained; these tests do not establish or disprove page-key framing, time-varying feedback, arbitrary page-private offsets, or other representations. Do not tune the row sums into a new clock absent a source selector.

Reproducers: [ordinary exact key search](../sims/agent8_lp2_p0_page_row_sum_scalar_feedback_sft.cjs), [F-hold exact reachability](../sims/agent8_lp2_p0_page_row_sum_scalar_fhold_sft.cjs). Outputs: [ordinary](lp2-p0-page-row-sum-scalar-feedback-output.json), [F-hold including first-failure certificates](lp2-p0-page-row-sum-scalar-fhold-output.json). Both cores executed against pinned blobs `054f2a0f780b7d46901acbe3d9bf4f0ac1801165` (corpus) and `1b064ef6d85819b7d96adaff31a82d1ec551598f` (native solved register) in connected V8; standalone Node wrappers were not separately executed. No new workflow.


## 26 November: chained block inverses and all-secret phase-alphabet exclusion (Agent 38)

The new p50 singular-row observation motivates a distinct use of the original row keys as **chained** linear operators rather than independently encrypted blocks. The p0–2 payload is fixed exactly as above; p3–55 supplies 52 rune-bearing pages and 12,227 source runes. No p0–2 key material enters the plaintext fit. Use every full 13-block after the first complete block on a page; that first block is the observed public initialization vector, and the leading/trailing partial blocks are omitted. Both standard circulant orientations, every shared block start 0–12, and all nonzero shared feedback scalars lambda in GF29 are included. Let B be the actual previous ciphertext block, C the current block, M the page's fixed row matrix. The two reversible receivers are

- CBC-type: D = M^-1 C - lambda B;
- CFB-type: D = C - lambda M B.

A shared unknown additive vector b of length13 then gives P = D - b. All operations are mod29. For each of 1,456 discrete receivers, the maximum smoothed native unigram score over all 29^13 offsets is computed exactly by independent coordinate optimization (29 trials per coordinate). Fit uses physical p3–39 only. Apply the selected receiver and offsets unchanged to p40–55; score with the native solved-section bigram model and replay all included original ciphertext blocks. Model is trained on the pinned nine solved sections, and the separate Gibran and Shakespeare plants are not used for it. This is a source-motivated candidate, not an independently attested chained-mode instruction. No claim of previously unexamined manuscript holdout is made.

| Result | Hidden CBC plant | Hidden CFB plant | Original fit-selected receiver |
|---|---:|---:|---:|
| True receiver / offsets | exact | exact | no authenticated key |
| Fit unigram gain over uniform (nats/rune) | +0.407361 | +0.398019 | -0.617593 |
| Held bigram gain over uniform (nats/rune) | +0.679386 | +0.589115 | -0.704673 |
| Held plaintext recovery | 2938/2938 | 2938/2938 | no coherent prose |

Original winner: phase6, right-shift orientation (sign -1), CBC, lambda2, b=[3,22,25,20,24,3,15,23,14,23,12,25,3]. 7,982 fit + 2,938 held = 10,920 replayed original symbols; 1,307 physical source runes lie outside that winner's complete chained blocks. The exact replay is an implementation invariant and establishes no authenticity. Example p55 prefix transliteration HEATINGCNGOPIMFNGTXNWEANEAFHWTHICXDFCOSRGEAEHDOTPILMNOEHNGAFHR is nonprose; the initial apparent word has no meaningful continuation.

**Stronger all-key exclusion:** permit an entirely arbitrary GP29 bijection independently at each of the 13 within-block phases, common across all pages, instead of the additive vector. Any such inverse preserves the equal-symbol count among pairs at the same phase. Sum ordered equal pairs across phase histograms and divide by the corresponding total eligible ordered pairs. Every possible 29!^13 phase-alphabet key for each of the 1,456 original receivers has exactly that receiver's rate. No key guessing or language scoring is involved in this invariant.

| Phase-binned equality | Largest across all original receivers | Smallest across 41 matched literary windows x 13 alignments |
|---|---:|---:|
| Fit p3–39 | 0.034950198 | 0.057729542 |
| Held p40–55 | 0.035760090 | 0.057154527 |
| Full p3–55 | 0.034788072 | 0.057609781 |

The 8 Gibran and 33 Shakespeare contiguous full-layout reference windows (stride6,400 GP runes) preserve actual page lengths and omit precisely the same phase-specific IV/fringe positions. Exact source maxima and finite native comparisons strongly reject the entire named shared phase-bijection family for these ordinary GP29 registers. This is not a universal language theorem and does not cover arbitrary page-private phase tables, changing feedback clocks, non-GP registers, or state-dependent nonlinear modes. Both genuine literary hidden-key plants recover the full receiver and all 13 offsets from fit alone; all held symbols replay exactly. The synthetic controls do not establish historical use.

**Decision:** retire these CBC/CFB consumers of the fixed 55x13 row mapping. The p50 rank exception remains an arithmetic observation with no authenticated consumer or plaintext; do not keep searching these feedback scalars or offsets. Source model/controls, raw candidate outputs, and exact runnable CommonJS test: [SFT](../sims/agent38_p0_page_circulant_chained_inverse_sft.cjs), [results](./agent38-p0-page-circulant-chained-inverse.json). Executed directly in connected V8 twice (second run required after a concurrent GitHub write conflict); no CI or standalone Node run claimed.

## Word-local cyclic convolution: exact shared-output-alphabet obstruction (Agent 31)

The fixed p1–55 row assignment and p50's sole zero-sum row motivate a different recipient from the prior 13-block and whole-page circulants: each complete printed group of length L is a polynomial in GF(29)[x]/(x^L−1), and the page's original 13 coefficients act by cyclic convolution. This grants arbitrary group-local cyclic rotations and scalar offsets; because the page rows for rune-bearing pages have nonzero sums, the constant vector lies in every matrix image. Neither a printed group being a plaintext word nor the keybook mapping is authenticated. The test does not assume any English vocabulary, word order or plaintext register: it permits arbitrary vectors in GF(29)^L.

For each contained original group, let M be the exact L×L circulant made by reducing the page row modulo x^L−1. The broader hypothesis is

    pi(C) = a * rotate(M X) + b * 1

where pi is any one shared permutation of all 29 output symbols, X is any vector (even a secret input relabeling or additional arbitrary preceding operation), a is any nonzero field element and b and rotation are arbitrary per group. Every z in the left nullspace of M must satisfy z·pi(C)=0; a cyclic shift does not change the image and the constant vector is already in the image. Collect each equation by observed ciphertext symbol, giving a homogeneous linear system on the 29 values of pi. The constant function always satisfies it; rank 28 forces *every* function to be constant, excluding every permutation, without using a plaintext model. Additional arbitrary circulant factors cannot enlarge the image.

Input: canonical p0–2 (729 runes; first black TH removed), 55 rows of 13, exact p3–55 contained groups only. The canonical parser gives 2,896 groups/12,956 unknown runes in the entire book and the input receiver comprises 2,708 groups/12,029 runes; all cross-page groups are omitted rather than assigned a guessed key. The two directions use M[i,j] = sum of row[t] for j=i±t mod L. No original plaintext, key or extra sidecar is fitted.

| Receiver | Original singular groups | Original image failures with identity pi | Equations, p3–39 | Rank, p3–39 | Native planted rank (fit) |
|---|---:|---:|---:|---:|---:|
| Negative direction | 55 | 54 | 55 | 28 | 27 |
| Positive direction | 55 | 54 | 55 | 28 | 27 |

There are 58 equations per fixed direction on the full receiver. For example the p7 group ordinal 381 (zero-based), C=[25,5,27,4,27,20,23], has left-null witness z=[22,10,14,26,14,1,0] for the negative direction; z·C=1 mod29. The positive-direction witness [4,27,17,27,11,1,0] gives 17. The shared unknown pi is excluded by the full rank certificate, not by those individual identity-alphabet examples.

**Independent page orientations:** all 1,024 assignments of the two signs to the ten singular-bearing fit pages yield rank 28; all 4,096 assignments across twelve singular-bearing pages likewise yield rank 28. The other page directions do not enter a necessary image equation. Thus no shared alphabet can rescue this word-local convolution even with a freely chosen direction on each page. If directions are allowed to change separately within each group, the intersection of the two left nullspaces is zero on every group, so this particular orientation-independent linear relaxation provides no obstruction. The disjunctive arbitrary-per-group direction problem was not searched.

**Controls:** for each fixed direction, all 55 singular source-shaped groups are planted using same-length GP29 words from the pinned solved-page register, independent seeded arbitrary output permutations, deterministic per-group rotations and offsets. Each original-shape control produces rank 27 from the fit alone; the only ambiguity is the unavoidable affine coordinate gauge. Normalize the first two alphabet coordinates to 0 and 1: both controls recover all 29 true normalized coordinates and satisfy all three untouched held equations. These are image/alphabet-identification controls, not full plaintext-recovery controls: singular convolution itself loses dimensions and would need real restoration information. They demonstrate the rank test does not exclude a true planted alphabet. The fit/held page ranges are familiar manuscript ranges, not new unseen data.

**Decision:** retire this exact word-local cyclic receiver, including arbitrary shared output alphabet, arbitrary input vectors, per-group nonzero scaling/offsets/rotations and page-private sign. It cannot be an encoding of original contained groups at all under the fixed opening rows. This is distinct from arbitrary word-level Hill matrices, previous page-wide polynomial inverse, changing per-group orientation, decoy segmentation, page-private alphabets, or externally restored state. No new plaintext or authentic key; the row50 coincidence remains unexplained. Do not expand the row family without an independent operation selector.

Reproducer: [CommonJS SFT](../sims/agent31_lp2_page_row_word_circulant_sft.cjs); [full rank bases and orientation certificates](agent31-lp2-page-row-word-circulant.json). Executed against pinned repository inputs in connected V8, including the final pagewise extension; standalone Node/CI not run.


## Singular p50 panel: exact null-mode restoration (Agent 3, 26 November)

The direct p50-column image failure above does not survive arbitrary affine column means. This is the algebraically minimal repair of that specific recipient, rather than another rune-page key search. Let M be either frozen 13×13 matrix of row50 and J the all-ones matrix. M has image the zero-sum subspace and kernel the constants. The unique extension acting identically on the constant mode and identically to M on its complement is A=M+J/13 over GF29. For each original 13×8 panel column c, A⁻¹c is therefore the canonical mean-preserving inverse. More generally every solution of M p = c−mean(c)·1 is A⁻¹c+t·1, for any of the 29 constants t. The mean of c is public; the mean of p need not be. This completely enumerates the affine column-mean remedy, without searching matrices or new source keys.

Test both source-admissible numeric radices (60 and omitted-f 59), both original matrix signs, and row-major or column-major output (eight frozen interpretations). Apply the canonical inverse to each panel, then integrate and maximize over all 29^8=500,246,412,961 independent column constants using exact cyclic dynamic programming. The native bigram model uses the same 2,296 training runes as the shared-affine study and 0.5 smoothing, with independent held source sections excluded. The evidence is the log mean likelihood ratio against iid uniform over the constant-mode prior; a positive optimized score alone is insufficient. Original quotient digits floor(v/29) are retained solely to check exact byte replay, not inferred from the candidate plaintext.

| Order | Best canonical fixed score, nats | Best all-constant MAP, nats | Best log mean BF, nats | Held planted log mean BF |
|---|---:|---:|---:|---:|
| Row-major | −58.274 | +13.899 | −12.634 | +31.275 to +51.662 |
| Column-major | −53.241 | +14.034 | −11.354 | +31.305 to +52.402 |

All eight fixed and all eight optimized original readouts are incoherent, and all eight integrated scores are negative (range −31.391 to −11.354). The maximum original MAP +14.034 is far below the smallest held planted MAP +58.211. The eight row-major plants recover 832/832 runes; eight column-major plants recover 780/832. These are four disjoint 104-rune windows from two held solved sections, reused across signs and layout conventions; not sixteen independent prose samples. Every original field symbol and all original byte values replay exactly with the supplied quotient side information. Since M is singular, replay does not identify the missing means; the language calibration does. The original numeric table may carry nonlinguistic material, so this only retires direct GP29 prose as an output of the fixed affine-column repair.

**Decision:** do not pursue arbitrary nullspace offsets or treat the p50 rank exception as an authenticated key. No unknown prose, key, or new source-selected consumer was recovered. The original p50 field means are [20,2,13,28,0,13,5,6] (base60) and [4,22,2,15,18,9,12,6] (base59). These merely describe the known table. [Runnable SFT](../sims/lp2_p0_row50_singular_mean_panel_sft.cjs) · [Exact output](lp2-p0-row50-singular-mean-panel-output.json). Core executed in connected V8 on pinned blobs; standalone Node not separately run.
