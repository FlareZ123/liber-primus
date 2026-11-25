# Spacing-free cumulative GP29 inverse with independently secret alphabet permutations

**Agent31, 25 November 2026.** A blind original-cipher inversion attempt and an exact all-key capacity refinement. Four native control encryptions (two distinct Gibran passages, two independently generated keys/anchors per passage) recover every withheld rune. Original p16–22 fails predictive recovery, and the larger two-secret-permutation architecture is excluded for that span and five of nine complete chapters against all contiguous windows in two fixed literary registers. No unknown plaintext, key or destination recovered.

## Operation and evidence

The rare equal-successor pattern motivates a continuous cumulative encoder: if the increment corresponding to one rare plaintext rune is zero, adjacent ciphertext equality exposes that rune regardless of the secret output alphabet. GP29 supplies an authentic field of prime order; arbitrary relabeling of its elements is an exploratory hypothesis, not a first-party key instruction. The solved p56 uses a different additive prime-totient clock and literal-F holds, so it is not an authentic positive control for this proposed mechanism.

Start from canonical p16–22 (1,744 ciphertext symbols), disregard printed word lengths/order, and use

```
C[i] = S^-1((S(C[i-1]) + P[i] - b) mod 29)
P[i] = (S(C[i]) - S(C[i-1]) + b) mod 29
```

S is an arbitrary bijection of GP29, b is the reserved plaintext anchor. The first ciphertext rune is the supplied IV, so there are 1,743 recoverable plaintext positions. No literal-F bypass, hidden state, page reset, clock drift or post-ciphertext reordering is modeled. Global translation of S is a gauge and does not alter any plaintext. The observed 10/1,743 equality rate is used only to choose the two nearest unigram rates in the fixed Emerson model: NG/ING (0.60810%) and IA/IO (0.66008%); this is a full-target scalar selection, so the withheld continuation is independent for key training but not completely untouched for anchor selection.

The decoder optimizes the output permutation directly, using a trigram model trained on 321,327 GP-native Emerson runes, with add-half unigram smoothing and backoff strengths 20 and 35. It uses 4 seeded 30,000-swap simulated-annealing restarts on 1,220 decoded prefix positions; it updates only affected trigram terms. The highest training-scoring key is frozen before decoding 523 continuation positions. No printed separators are used. It checks full exact forward replay including the given IV. Replay is an implementation invariant for *every* permutation and supplies no key authentication.

## Blind recovery results

The two target-excluded Gibran passages are at offsets 10000 and 30000 in the fixed encoded file. The same passage is reused across the two anchor variants, so there are two independent plaintexts and four independently generated encryption keys, not four independent texts.

| Anchor | Original train | Original withheld | Equal-mask randomized null withheld | First native withheld | Second native withheld |
|---|---:|---:|---:|---:|---:|
| NG | -5.218528 | -6.168767 | -5.799520 | -2.323416 (523/523) | -2.286903 (523/523) |
| IA | -5.112138 | -6.002045 | -5.824703 | -2.323416 (523/523) | -2.286903 (523/523) |

Units: mean conditional trigram log likelihood, nats per rune, higher better. Matched nulls independently generate the next rune uniformly among the 28 unequal values except at the original equality positions. Each run has exact replay. Some control restarts miss the correct basin (e.g. NG first control 1/4 successful), hence this is a heuristic attack, not exhaustive key enumeration. The original keys and previews are retained in the raw JSON; the original continuation scores are worse than both respective matched nulls and substantially below correctly decoded native text.

## Exact stronger all-secret capacity

A preexisting [arbitrary predecessor-row majorization theorem](lp2-firstorder-static-quasigroup-majorization-gate.md) bounds frequencies by independently taking the largest transitions in each ciphertext-predecessor row. That broader model need not have column constraints. This extension instead considers the more specific reversible family with **two wholly independent secret permutations** S and H, where

```
C[i] = S^-1((S(C[i-1]) + H(P[i])) mod 29).
```

No choice of H or S is fitted. For any nonzero increment d, a fixed plaintext rune induces a permutation of all 29 ciphertext states, specifically one 29-cycle (because 29 is prime); the zero increment is the identity. For any k nonzero increments, their transition edges form a simple bipartite k-regular graph: exactly k outgoing and k incoming edges at every vertex, no diagonal, no shared edges. The true cyclic-group structure is stronger than this relaxation.

Let W[a,b] count all original directed transitions including physical page seams within the selected span, D = sum W[a,a], and M_k be the maximum weight of any diagonal-free bipartite k-regular graph. This is an exact integral min-cost-flow problem: source→row and column→sink capacity k, every off-diagonal row→column edge capacity1 with cost -W[a,b]. M_0=0. For *every* secret S,H and every plaintext ordering, the sum of the k highest plaintext frequencies is at most

```
B_k = max(M_k, D + M_(k-1)).
```

The second term grants inclusion of the zero-increment rune. The bound is necessary, not sufficient for a genuine cyclic-group key: an optimal regular graph need not decompose into compatible powers of one 29-cycle. It requires no intact printed words and survives arbitrary *plaintext* order permutation, but not a ciphertext permutation that changes observed transitions, changing state, or variable-length transport. Each span has its first symbol as IV.

All contiguous length-matched GP windows in the exact repository Emerson and Gibran files were enumerated (overlapping windows, not independent observations). For each window we require top-k frequency sums <= B_k for every k=1..5. The table reports the original B1/B5 and numbers passing all five bounds.

| Original physical span | Edges | B1 / B5 | Emerson survivors / windows | Gibran survivors / windows |
|---|---:|---:|---:|---:|
| p0–2 | 728 | 87 / 338 | 120675 / 320600 | 34749 / 61765 |
| p3–7 | 1144 | 117 / 455 | 144 / 320184 | 0 / 61349 |
| p8–14 | 1728 | 146 / 602 | 0 / 319600 | 0 / 60765 |
| p15–22 | 1902 | 164 / 671 | 0 / 319426 | 0 / 60591 |
| p23–26 | 1020 | 104 / 404 | 236 / 320308 | 6 / 61473 |
| p27–32 | 1432 | 131 / 534 | 0 / 319896 | 0 / 61061 |
| p33–39 | 1679 | 152 / 611 | 0 / 319649 | 0 / 60814 |
| p40–53 | 3007 | 229 / 940 | 0 / 318321 | 0 / 59486 |
| p54–55 | 307 | 58 / 196 | 320783 / 321021 | 62167 / 62186 |
| p16–22 | 1743 | 156 / 634 | 0 / 319585 | 0 / 60750 |
| p0–55 | 12955 | 685 / 3117 | 0 / 308373 | 0 / 49538 |

The specific new column-coupled restriction matters on p16–22: the older independently maximized row-only one-symbol capacity is 172, versus the minimum native top-one counts166 (Emerson) and170 (Gibran), so that single statistic was inconclusive; the exact regular-graph cap156 is below both. The row-only top-five statistic already rejects those finite windows; the refinement does not claim to newly exclude the entire earlier, broader predecessor-row family. The fresh calculation also shows p27–32 fails via k>=2 even though its B1 equals the Emerson minimum. Five complete chapters individually fail even with private S,H per chapter. Four shorter chapter spans retain finite windows; a pass is just a relaxed marginal constraint, never a plaintext solution.

One native independent two-permutation plant gives actual top-k sums [195,352,478,603,720], beneath computed caps [215,409,571,717,845]. An exhaustive 4-vertex toy graph check independently verifies exact min-cost regular capacities [0,22,31,39]. The separate annealing experiment supplies four exact inversion controls. No CI is claimed; both code paths executed in connected JS runtime.


## Periodic shared-cycle receiver: exact all-key period-13 gate (Agent35, 25 November)

The earlier stationary two-permutation model admits the source-motivated generalization `C_i = S^-1(S(C_(i-1)) + H_t(P_i) mod29)`, with one arbitrary secret S shared across all phases and all pages, an entirely unrelated arbitrary bijection H_t at every phase, and t = absolute rune offset mod q or within-page rune offset mod q. Grant all 55 page-initial plaintext runes arbitrary free values; ignore printed word boundaries and all cross-page transitions. Historical GP29 arithmetic, the known 13-symbol LP1 keyword, and the physical red13 marks motivate q13, but no authenticated instruction selects this feedback law or period. No transparent-F holds, changed ciphertext order, or extra state are granted.

**First relaxation:** even allowing every phase an unrelated reversible two-sided table in which each fixed plaintext label induces an arbitrary permutation of the 29 previous-ciphertext states, maximum-weight bipartite assignment exactly upper-bounds its count. q11 gives full-book E caps 1322 (continuous clock) and 1337 (page reset); q12 gives 1385 and 1373. All are below 1397, the minimum E count of every contiguous 12,956-rune window in the pinned Gibran, Emerson and Shakespeare GP texts (50,159 / 311,675 / 205,845 overlapping windows; respective minima 1407/1482/1397). This extends the one-sided period≤10 entropy gate only for the narrower two-sided architecture, not arbitrary predecessor-row tables.

**Exact common-group certificate for q13.** For each phase t let W_t(a,b) count original within-page transitions; M_t is the larger of diagonal weight and maximum-weight derangement. Since 29 is prime, a nonzero increment is a Hamiltonian permutation. Every nonzero such map generates the whole shared order-29 group. Independent phase optima plus the 55 free initial runes give upper 1430/1421, so a source-like E count of at least 1397 requires aggregate assignment deficit at most 33/24. At least one phase must be within floor(33/13)=2 or floor(24/13)=1 of its own optimum. All diagonal maps are too weak to be that anchor.

For each phase compute an exact Hungarian assignment and feasible integer reduced costs, whose sum on any derangement is its deficit from that optimum. Exhaustively enumerate the Hamiltonian permutations in that small reduced-cost budget using bit-mask row/column matching, minimum remaining row domain, admissible row-minimum lower bounds, and early subtour elimination. Each surviving generator determines all 29 powers. Normalize its subgroup by the unique generator taking ciphertext state 0 to 1. For each distinct subgroup, compute the maximum observed E occupancy over all 29 shifts at each phase, granting independent H_t(E). No heuristic cutoffs, dictionary, plaintext segmentation, or scoring optimization are used.

| Original q13 clock | Independent phase cap | Near-optimal threshold | Distinct candidate subgroups | Best anchored E cap (incl. 55 free) | Non-anchored E cap | Certified upper |
|---|---:|---:|---:|---:|---:|---:|
| Absolute offset | 1430 | 2 | 82,535 | 781 | 1391 | **1391** |
| Page offset | 1421 | 1 | 2,859 | 775 | 1395 | **1395** |

Any group not enumerated has each phase deficit at least threshold+1, hence the non-anchored bound is independent of any unsearched group. The resulting certified upper is the maximum of the anchored and non-anchored bounds; it is **not claimed to be the exact attainable maximum**. Both are below the 1397 literary floor. All 72 small prime-order Hungarian/near-optimal enumeration tests match brute force (161 enumerated cycles); 24 independent full toy bound checks pass. Three full source-sized Gibran/Emerson/Shakespeare controls with independent arbitrary phase bijections and a randomly relabeled common cycle replay 38,868/38,868 native runes using their supplied true keys. Their E counts 1473/1644/1502 are supported by true-group bounds 1520/1689/1547. These are known-key inversion controls, not blind full-group recovery.

**Decision:** retire the exact consuming q13 common cyclic predecessor-feedback family under these two clocks and this finite GP-English frequency criterion. An atypical low-E language register, independently changing outer cycles, hidden evolving phase, transparent F, changed ciphertext order or variable-length cipher remains outside the proof. Neither the shared group nor q13 is historically selected, and no unknown plaintext or key was recovered. The small margin to the conservative literary floor is explicitly conditional; the much lower anchored maxima show why the independent phase assignments cannot be treated as compatible common-cycle keys. Do not re-run arbitrary 29! relabeling searches for this exact family.

[Exact CJS SFT](../sims/lp2_common_cyclic_feedback_q13_exact_sft.cjs) · [raw input pins and full certificates](lp2-common-cyclic-feedback-q13-exact.json). The same complete experiment function was executed on connected canonical blobs; the standalone Node wrapper was not independently run. Source corpus blob `054f2a0f780b7d46901acbe3d9bf4f0ac1801165`.

## Exact known-plaintext key retrieval on the four relaxed survivors

A source passage that really is the original plaintext would offer a much stronger route than another marginal fit. The two-permutation law gives a linear equation per observed plaintext rune:

```
S[C[i]] - S[C[i-1]] - H[P[i]] = 0 mod 29.
```

For each candidate full-length plaintext window, first enforce exact equalities: identical ciphertext edges must encode identical plaintext runes, all diagonal edges must encode the same rune and all nondiagonal edges a different rune. Within any predecessor row (or successor column), equal plaintext labels must specify the same next (or prior) ciphertext state. These are necessary for all independent inner and outer permutations and do not require any guessed numeric key.

For a surviving crib, modular Gaussian elimination recovers S and the H entries for *observed* plaintext labels. The constant-S vector is always in the homogeneous nullspace. A two-dimensional nullspace yields a nonconstant vector unique up to common scaling and S translation, provided S is bijective and observed H entries distinct. All missing H entries are completed by bijections of remaining values, so their ambiguity is explicit. Dimension one is impossible; higher dimensions are unresolved, not excluded by the implemented rank shortcut. The first implementation erroneously expected every GP label to occur in a finite native crib and failed its positive calibration. The reduced observed-symbol system repairs this without adding synthetic alphabet symbols to the native passage.

All contiguous GP windows from six fixed texts (Emerson, Gibran, Shakespeare, derived LP1 reference, Blake Song of Liberty and the historical 2012 Blake chorus) were screened on the four original chapter spans that survived the regular-graph relaxation. No windows survive even the necessary exact equality filter; thus none reach linear-algebra inversion. The native texts are a finite retrieval register, not an independently authenticated statement of plaintext authorship.

| Original span | Windows screened | Compatible |
|---|---:|---:|
| p0–2 | 602537 | 0 |
| p3–7 | 600457 | 0 |
| p23–26 | 601077 | 0 |
| p54–55 | 604929 | 0 |
| Total | 2409000 | 0 |

Two separate constructed secret-S/secret-H native controls use distinct Emerson/Gibran passages (1,743 runes each), 1,100 known training positions and 643 withheld. The exact reduced systems have ranks 55/57 variables and 52/54 variables, both nullity two. The first leaves one unseen H entry, uniquely fixed by the unused value; the second leaves four entries with 24 possible completions, none of which affects its withheld continuation. Both recover all 643/643 withheld runes uniquely and replay every ciphertext position. Hence the attack is reusable if an authentic source-selected crib is subsequently found. The finite failed retrieval is not an exclusion of unknown newly authored text in the four surviving short chapters.

[Known-plaintext SFT](../sims/lp2_conjugated_cumulative_knownplaintext_sft.cjs) · [raw](lp2-conjugated-cumulative-knownplaintext.json) · commit 25fc3429e7820c4b6504e9c9c495421be7e7031c.

## Blind independent-inner-alphabet calibration

With H unrestricted, maximizing the concentration of inferred increments removes H from the search objective. An exploratory permutation annealer normalized the affine gauge S(0)=0, S(1)=1 and maximized the sum of n_d log(n_d) over increment counts. In a Gibran native-control sequence with independent planted keys and lengths 307,728,1020,1144,1743, eight 30,000-swap restarts recovered the complete 29-entry outer key only at length 1743; best correct-entry counts at the four short lengths were 2,3,7,3. A second cycle-seeded optimizer with 96 assignment-based starts, best 12 refined with swap/reversal/insertion moves, likewise recovered only the long key (short best counts 2,4,3,2). These exploratory calibration runs were not applied to original ciphertext. The negative outcome is an optimization limitation, not a ciphertext exclusion. The shorter spans instead receive the exact word-constrained attack below.

## Exact lexical recovery on all four remaining spans

The known-plaintext repeated-edge filter is related to the earlier [arbitrary predecessor-row source-crib analysis](previous-cipher-permutation-source-crib.md); this extension uses the stricter common cyclic-group law and permits newly assembled dictionary words rather than requiring an entire contiguous source quotation.

Freeze each chapter's original continuous ciphertext order, grant a private independent S,H, and condition on the printed groups of at least eight GP runes being intact plaintext words in the 12,231 distinct GP spelling types extracted from the repository Shakespeare, Emerson and Gibran files. Each selected word includes its incoming ciphertext edge (except a word starting the span, which is omitted), so the cipher state does not reset at word boundaries. The hypothesis permits arbitrary plaintext-word ordering before encryption; it does not permit ciphertext transposition after encryption, nonwords, or out-of-register words.

For each candidate word, compile its repeated-edge, row/column, and zero-increment identities and the linear equations S[b]-S[a]-H[p]=0 mod29. An incremental row echelon basis gives each of the 58 variables as a linear form in free variables. If two distinct S variables or two distinct H variables have identical forms, no permutation completion exists, and that branch is rejected. Passing this test does not guarantee a permutation completion. Adaptive minimum-remaining-domain branching over these necessary constraints is exhaustive unless a computational cap is reached. A fixed ten-rune-anchor pass first excluded p3–7 but hit its 300,000-trial cap on the other three originals. The adaptive pass includes eight- and nine-rune anchors, applies cheap compatibility filtering before linear algebra, and completes on all four original and plant cases.

| Span | Anchors >=8 | Original algebraic trials | Original surviving assignments | Plant surviving assignments | Plant forced withheld runes correct / total | Plant training rank |
|---|---:|---:|---:|---:|---:|---:|
| p0–2 | 20 | 3086 | 0 | 1 | 532/548 | 49 |
| p3–7 | 27 | 145 | 0 | 1 | 861/894 | 49 |
| p23–26 | 26 | 223 | 0 | 1 | 763/787 | 51 |
| p54–55 | 10 | 15063 | 0 | 1 | 201/215 | 45 |
| Total | | | 0 | 4 | 2357/2444 | |

Each matched-length synthetic plant is assembled from independently selected native dictionary words using the original group lengths, then encrypted continuously with independent random S,H. These are lexical controls, not coherent literary excerpts. The unique surviving assignment in each plant agrees with every true anchor word. On positions outside all selected anchors, the equations uniquely force the reported plaintext runes independently of the unresolved free-variable assignments; all forced runes are correct. The remaining 87 positions are not algebraically determined by the anchor equations alone and are not counted as recoveries. No original assignment survives even the necessary constraints. Thus these four spans are excluded for this exact finite intact-word model, complementing the five longer chapters' spacing-free native-window exclusions. Neither result establishes exclusion for arbitrary plaintext, different word registers, or an altered cipher architecture.

[Lexical SFT](../sims/lp2_conjugated_cumulative_lexical_sft.cjs) · [raw](lp2-conjugated-cumulative-lexical.json) · commit 9c47f737333602ce7b9a72c17cf1ad57937bf59e.

## Decision

Retire the fixed continuous conjugated cumulative decoder as a serious receiver for p16–22 under the tested native registers. The exact relaxation excludes the stronger independent inner permutation on five complete spans and the full tape, so widening the annealing search to H or tuning the rare anchor on those spans is unwarranted without independent evidence for a different state clock or balanced plaintext. The short spans also fail the exact finite intact-word dictionary constraint attack. Retire this architecture under the stated registers, rather than tune its optimizers or repeat the same source retrieval. A new attempt requires independently motivated different plaintext units, state, or source-selected key evidence. Do not reinterpret the count bounds as proof of arbitrary-language impossibility.

## Reproduction

- `node sims/lp2_conjugated_cumulative_gp29_recovery_sft.cjs` — [code](../sims/lp2_conjugated_cumulative_gp29_recovery_sft.cjs), [raw](lp2-conjugated-cumulative-gp29-recovery.json), commit 82aafe484de996017544ddb9648a12df945354ae.
- `node sims/lp2_conjugated_cumulative_regular_capacity_sft.cjs` — [code](../sims/lp2_conjugated_cumulative_regular_capacity_sft.cjs), [raw](lp2-conjugated-cumulative-regular-capacity.json), commit 0a705edb9de484e17d803d91f6269dc9c6c97e8f.
- `node sims/lp2_conjugated_cumulative_knownplaintext_sft.cjs` — exact source retrieval and linear inversion.
- `node sims/lp2_conjugated_cumulative_lexical_sft.cjs` — exact adaptive lexical constraint attack.
- Inputs: canonical LP2 corpus, pinned native Emerson and Gibran files; exact inputs and fixed seed are in the scripts.

## Blind spectral cycle and period-23 additive key recovery (Agent35, 25 November)

Model: consuming GP29, fixed hidden outer permutation S, C_i = S^-1(S(C_{i-1}) + P_i + K_t mod 29), q=23, both absolute and page-local clocks; each page's first rune is an arbitrary IV. q23 is exploratory, motivated by the terminal p57 red 23 marker, not authenticated. Fit p0–39 (9,600 transitions), freeze all parameters before scoring p40–55 (3,301 transitions). No plaintext boundary assumptions. The same code is executed against three independent donor plants, two originals and two repeat-mask matched random nulls.

For each phase build the directed transition-count matrix W_t. Double-center B_t=P W_t P (P projects off the constant vector), aggregate G=sum_t (B_t B_t^T + B_t^T B_t - P diag(row_t+col_t) P). This noise subtraction is a Poisson-inspired heuristic, not an exact covariance identity for dependent ciphertext. Under a well-sampled cyclic model the expected matrices in the latent alphabet coordinates are circulant and share real Fourier eigenspaces. Jacobi eigendecomposition, all 66 pairs among the first 12 eigenvectors, and angular sorting produce candidate orderings; choose top six by phase difference collision score and append two random starts. Refine each with 18,000 incremental pair swaps (annealing T=180*(.025)^(step/18000)). Pick highest sum of squared phase difference counts. Test all 28 affine multipliers, estimate 23 shifts by donor unigram MLE, select multiplier by training-only trigram log likelihood. Trigrams use interpolation strengths 20 and 35 with half-count unigram smoothing. Reference language models exclude each respective plant's donor; original and null models include all three. The three plants use seed-fixed rare-letter masking shifts, donor windows beginning at rune 10000, independent outer cycles, two absolute clocks and one local clock. This is a targeted demonstration, not a comprehensive distribution of plant difficulty. All 12,901 transitions replay exactly by construction for each receiver.

| Receiver | Fit collision score | Top spectral eigenvalue | Held mean log-likelihood | Exact held recovery |
|---|---:|---:|---:|---:|
| Gibran plant, absolute | 250672 | 1238 | -2.253823 | 3301/3301 |
| Emerson plant, local | 261902 | 1282 | -2.410331 | 3301/3301 |
| Shakespeare plant, absolute | 251008 | 1032 | -2.374704 | 3301/3301 |
| Original, absolute | 155174 | 149 | -6.237390 | unknown |
| Original, local | 155386 | 186 | -6.241156 | unknown |
| Repeat-mask null, absolute | 155940 | 225 | -6.245927 | N/A |
| Repeat-mask null, local | 156114 | 177 | -6.318056 | N/A |

All three plants recover 29/29 outer coordinates up to affine equivalence, 23/23 key values and 12,901/12,901 plaintext transitions each; held data were not used for the fit. Both original candidates remain null-like with no plausible plaintext. No claim of an exact all-key q23 exclusion, and no probability estimate from two nulls. The cycle proposal objective itself is invariant under arbitrary per-phase relabelings of plaintext, so the spectral approach also offers a potential initializer for a future nonadditive common-cycle model, but that broader model is not decoded or excluded here. Retire this specific q23 additive receiver as a high-priority path unless a new source clue warrants revisiting it. No real key recovered.

Reproduce: `node sims/lp2_q23_spectral_cycle_blind_sft.cjs TASK`, TASK 0–6 for Gibran, Emerson, Shakespeare, original absolute/local, null absolute/local. [Solver](../sims/lp2_q23_spectral_cycle_blind_sft.cjs); raw records [0](lp2-q23-spectral-cycle-blind-0.json), [2](lp2-q23-spectral-cycle-blind-2.json), [3](lp2-q23-spectral-cycle-blind-3.json), [4](lp2-q23-spectral-cycle-blind-4.json), [5](lp2-q23-spectral-cycle-blind-5.json), [6](lp2-q23-spectral-cycle-blind-6.json). Emerson task executed successfully but raw artifact creation conflicted with another concurrent branch update; its exact summary is in this report and is independently reproducible from task 1. Executed the exact exported function in connected JavaScript runtime; standalone Node invocation not separately executed.

## Transparent-F cumulative feedback: exact historical-clock and unknown-periodic-key lexical inversion (Agent35, 25 November)

A genuinely different F-hold extension of the cumulative family uses `S(C_i)-S(C_prev)=P_i+K_t mod29`, with one arbitrary secret ciphertext alphabet S, ordinary GP29 plaintext values, and last **consumed** ciphertext C_prev. P=0 emits literal ciphertext 0 and leaves both predecessor and clock unchanged; ordinary emission may also be ciphertext 0. No authentic source asserts this cumulative feedback modification. The source-visible solved p56 prime-minus-one clock and the solved LP1 eight/thirteen-symbol keys motivate the tested clocks.

Use the three actual complete 14-rune words at physical p13/25/43, book offsets 3405/6035/10453. The pinned prior four-source-plus-TextBlob 14-rune vocabulary with NG/ING and IA/IO source encoding has 173 distinct encoded forms (two spelling aliases removed from 175 words). For each proposed plaintext word, literal F is legal only at printed ciphertext zero; every other rune consumes, including a consuming ciphertext zero. Grant the first consuming rune arbitrary predecessor and omit its equation (still increment its clock). For page, chapter and continuous prime clocks starting at historical prime2, grant every earlier zero as a possible nonconsuming hold; search both signs of prime-minus-one shift. Also grant every word independent starting phase anywhere from 0 through 16,257 inclusive in the prime sequence, or every phase of fixed DIUINITY and FIRFUMFERENFE, with both signs.

Each word's remaining consumed transitions give `S(b)-S(a)=P_i+K_t`. Its cumulative offsets from the first consumed ciphertext determine all visited coordinates, so duplicate states must have identical offsets and different states must have distinct offsets. A weighted modular disjoint-set solver merges surviving word constraints and exactly packs connected component coordinate sets by cyclic translation into 29 distinct positions, up to arbitrary global shift.

| Clock | Sign | Surviving distinct relation traces, p13/p25/p43 | Common key |
|---|---:|---|---|
| Prime page reset | + / − | 0/0/0, 0/0/0 | none |
| Prime chapter reset | + / − | 0/0/1, 0/0/0 | none |
| Prime continuous | + / − | 0/4/0, 0/7/0 | none |
| Prime independent start 0–16257 | + / − | 14/195/11, 13/208/15 | none |
| Fixed LP1 DIUINITY, arbitrary phase | + / − | 0/0/0, 0/0/0 | none |
| Fixed LP1 FIRFUMFERENFE, arbitrary phase | + / − | 0/0/0, 0/0/0 | none |

Even arbitrary early prime starts leave zero compatible pair graphs between p13 and p43, before p25 is needed. Positive controls construct three lexical ciphertext words using a common randomly relabeled alphabet and true supplied clocks for each scope/sign; their combined exact constraints yield valid shared-coordinate witnesses. These known-plaintext controls test modular constraints, not blind plaintext recovery. [Clock solver](../sims/lp2_p56_cyclic_feedback_longword_sft.cjs), [arbitrary-prime output](lp2-p56-cyclic-feedback-longword-any.json), [page/LP1](lp2-p56-cyclic-feedback-longword-page-and-lp1.json), [chapter](lp2-p56-cyclic-feedback-longword-chapter.json), [book](lp2-p56-cyclic-feedback-longword-book.json).

### All-secret periodic K: modular syndrome join

For arbitrary unknown q=8 or 13 additive phase keys, direct enumeration of alphabet and key is unnecessary. Fix the first word's phase to zero by cyclic gauge; enumerate every relative start phase of the other words and each legal plaintext F-hold mask. This does not enforce global clock alignment and therefore grants independent word phases. For each layout build GF29 coefficient matrix A on 29 outer coordinates S and q unknown key shifts K, with one row per consumed transition after the first in each word. Plaintext contributes only the right-hand side b. Row reduction of [A|I] yields the left-nullspace syndromes. Precompute each dictionary word's contribution to those syndromes; use a hash meet-in-the-middle on the two smallest word groups and the negated third contribution. This enumerates exactly every compatible lexical triple without materializing the Cartesian product. For a join, extract an affine solution of the linear constraints. Any observed pair of outer coordinates forced equal for all values of the free variables immediately excludes the triple. Otherwise search the remaining inequalities over GF29 (branch cap 100000 explicitly reported as unresolved if reached); unseen coordinates fill unused values. Every witness replays every equation. No crib guesses, language scores or fitted clock.

| Original model | Layouts | Syndrome joins | Forced coordinate collisions | Unresolved | Key witnesses |
|---|---:|---:|---:|---:|---:|
| q8 | 256 | 0 | 0 | 0 | 0 |
| q13 | 676 | 28173 | 28173 | 0 | 0 |

Thus under the fixed intact-word lexicon the all-key q8/q13 F-hold cumulative family is excluded, **even granting arbitrary independent starting phases for these three words**. q13 needs all-different injectivity: merely reporting its 28173 linear-consistent triples would be misleading. The q8 blind planted three-word control recovers the true lexical tuple and phase offsets among two witnesses, both with the exact hidden 8-shift K; q13 plant has exactly one lexical/phase witness and exact hidden 13-shift K (359811 syndrome joins, 359783 forced collisions, 27 exhaustive inequality contradictions, no cap). Outer-coordinate completion may differ from the true S on unconstrained symbols. The plants include a literal F hold and consuming ciphertext zeros. No authentic LP2 plaintext is recovered.

[All-secret syndrome SFT](../sims/lp2_cyclic_feedback_unknown_periodic_syndrome_sft.cjs), [q8 original](lp2-cyclic-feedback-periodic-syndrome-q8-original.json), [q13 original](lp2-cyclic-feedback-periodic-syndrome-q13-original.json), [q8 blind plant](lp2-cyclic-feedback-periodic-syndrome-q8-plant.json), [q13 blind plant](lp2-cyclic-feedback-periodic-syndrome-q13-plant.json). Exact exported functions executed against pinned repository source; standalone Node wrapper not independently run. Use `node sims/lp2_cyclic_feedback_unknown_periodic_syndrome_sft.cjs 8 original` etc. For historical clock use `node sims/lp2_p56_cyclic_feedback_longword_sft.cjs any 1 prime` (or `lp1-8`, `lp1-13`).

**Decision:** retire these exact cumulative outer-alphabet receivers with source clocks and arbitrary q8/q13 periodic keys under the given literal-F, fixed-order, intact-vocabulary assumptions. New H(P) mappings, changed printed segmentation, alternative feedback state updates, arbitrary longer clocks or unfamiliar words are not excluded. The syndrome method provides a constructive alternative to 29! outer-permutation search for future source-constrained cyclic models.
