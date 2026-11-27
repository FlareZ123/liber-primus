# Arbitrary-affine Zeckendorf inverses: exact donor cribs and blind shared-chapter recovery

**Decision (Agent9, 27 November 2026):** no original plaintext or authentic key. The ordinary-consuming p15-body-relative Zeckendorf clock, with **all sixteen affine digit transformations independently secret and an arbitrary shared static GP29 alphabet**, admits no exact contiguous reuse of the tested donor material in the full fitting prefix or the six source-boundary 512-rune spans under either declared composition order. Two source-index-hidden, independently keyed plants recover every digit action and all 3,766 runes (262 withheld). This is a new exact crib-compatibility constraint and working crib-to-key receiver, not an all-plaintext rejection of the cipher family. Blind receivers with seventeen secret digit maps shared across nine chapter-relative clocks recover both complete planted affine keys under either composition order, but give nonprose on the original; see the blind extensions below.

## Model and causal premise

The printed p15 number grid independently selects distinct Fibonacci indices through 987, and the graphic's infinity mark motivates continuing the sequence. This is the established [graphic construction](../results/lp2-p15-fibonacci-prime-spiral.md), not an authenticated choice of Zeckendorf encoding, affine action, order, arbitrary alphabet, or donor reuse. The latter are explicit exploratory assumptions. The [fixed-source-slope studies](lp2-p15-affine-zeckendorf-knownslopes-allanchors.md) already reject their calibrated original receivers; this experiment neither repeats their slopes nor claims that the author's earlier book codes establish verbatim reuse. The source-motivated donor set is the nine native solved GP records and the historically used Blake, Crowley and Emerson book-code witnesses.

For body-relative ordinary clock n starting at p15 physical offset20, write the unique nonadjacent Zeckendorf mask z(n) using weights 1,2,3,5,...,1597. The last weight is an extrapolation of the construction. Let S be any static bijection of GP29; let each digit select its own arbitrary affine map D_k(x)=a_k*x+b_k over GF29, a_k nonzero. In one fixed order (low-to-high or high-to-low, interpreted **outer to inner**), the sender emits the ordered composition of active D_k applied to S(P_n). Thus there are 812^16 times 29! nominal keys; no commutativity, fixed point, source-derived slope, word boundaries, fitting of individual ciphertext labels, or per-page reset is imposed. Every rune consumes one clock tick; the historical literal-F hold variant is not included. The original source scope is p15 offset20 through p22, 1,883 runes, with p22 (131 runes) withheld from the 1,752-rune full-prefix fit.

## Exact elimination and constructive inverse

Take two indices i,j with masks differing **only** by bit k (j=i+F_k; k absent at i). Split their active action product into identical earlier/outer and later/inner factors U,V. Then
```
C_i = U V S(P_i)
C_j = U D_k V S(P_j)
P_i = P_j  <=>  C_j = (U D_k U^-1)(C_i).
```
Both directions hold because all factors are bijections. Group matched pairs by their identical outer prefix mask. Within one group the conjugated map is fixed and is one of the 812 affine maps, regardless of every other secret action and S. Enumerate its 812 *entire equality signatures*, including non-equalities. Store them as a binary trie; each candidate donor offset must have an identical equality pattern on the fixed ordered pairs. Select the twelve largest groups by pair count (deterministic tie-break by bit and prefix mask), not by donor score. Testing separate groups grants them independently chosen conjugate maps, a relaxation of the actual shared-key constraints. A failed group is therefore an exact necessary-condition exclusion. A passed group is not a key.

For a complete prefix crib, peel actions in their declared order. All outer maps have now been undone, so matching pairs constrain the next true D_k directly (no conjugation). Branch over all signature-compatible actions and undo that action at all active positions. At the leaf, require one consistent injective correspondence from every observed donor symbol to the recovered static-alphabet label; complete a single missing correspondence by bijectivity, leave larger unseen alphabets unresolved. Decode p22 only after the prefix fixes these parameters. This is an actual exact inverse with an explicit branch limit of 100,000 visits per depth, not an all-key proof if that limit is reached. Neither control hit it and no original full-prefix candidate reached the recursive stage.

## Executed controls

Two hidden source offsets and independent deterministic planted keys, including arbitrary static permutations and noncommuting digit maps, use precisely the original frame. Search every eligible donor offset using the same exact gate, then perform the constructive inverse on survivors. Native records remain separate; the five historical text files are independently encoded by greedy GP digraphs and the stated QU/CW, U/V, C/K/Q, S/Z, ING, IO normalization. The Blake file includes its Gutenberg framing; neither title nor editorial markup is silently removed. The controls use the same book-code donor collection the receiver is designed to search, not a test of unrelated unseen English.

| Control | Hidden offset | Source alignment survivors | Correct digit maps | Whole / held runes | Alphabet labels identified |
| --- | ---: | ---: | ---: | ---: | ---: |
| Self-Reliance, low-first | 2450 | 1/87,203 | 16/16 | 1883/1883; 131/131 | 29/29 |
| Blake, high-first | 3400 | 1/87,203 | 16/16 | 1883/1883; 131/131 | 26/29 |

Both recover the true unique action sequence, with one recursive node per depth, and exact forward replay of all control ciphertext. The three unresolved Blake alphabet labels are absent even from its withheld continuation. The plant key search does not inspect withheld plaintext or ciphertext during source-offset ranking or key fitting. No claim of universal power over shorter cribs or new prose.

## Original exact donor alignment results

Full prefix: 87,203 eligible historical donor windows per order; the largest group alone (669 pairs at lag1 for low-first, 610 pairs at lag987 for high-first) excludes every window. The full 1,752-rune input does not fit within any individual solved-native record, so that register contributes only to the shorter-window tests. Six length-512 windows start at the black p15 body and physical starts p16–p20, all within the fit tape. Each scans 93,920 eligible offsets over the full donor register. Counts below are survivors after the first (largest) group and after all twelve groups.

| Body offset | Window length | Low-first first / all | High-first first / all |
| ---: | ---: | ---: | ---: |
| 0 | 1752 | 0 / 0 | 0 / 0 |
| 0 | 512 | 400 / 0 | 66 / 0 |
| 139 | 512 | 113 / 0 | 1884 / 0 |
| 406 | 512 | 53 / 0 | 2419 / 0 |
| 679 | 512 | 411 / 0 | 4528 / 0 |
| 939 | 512 | 426 / 0 | 59 / 0 |
| 1210 | 512 | 434 / 0 | 2237 / 0 |

Total 2*(87,203+6*93,920)=**1,301,446** original donor-alignment tests, including overlapping windows and both orders (not independent statistical trials). No fit candidate remained; no original key was produced or selected on p22. No original ciphertext scoring by a language model. The gate uses exact equality of candidate GP labels, not their frequency or a hypothesis that printed groups are plaintext words.

## Blind extension: shared chapter-relative clocks without donor cribs

The exact donor gate cannot exclude new prose. To test a stronger, distinguishable architecture, share one static alphabet and seventeen unrestricted affine digit maps across the nine chapter-relative clocks, starting after each initial red title. Later red runes remain ordinary consuming symbols. Fix low-digit-first as the outer-to-inner order; the high-first blind model, chapter-private keys and other resets are not tested. Extend the Fibonacci weights through 2584. This chapter-sharing premise is exploratory, not independently authenticated by the p15 graphic.

For each digit, after peeling lower outer digits, compare positions with masks differing only at that digit, both within each chapter and across chapters at the same relative pair of positions. The true action maps their ciphertext symbols to equality precisely when the two underlying plaintext symbols agree. In the blind case the equality signature is unknown, but an action can be ranked by equality likelihood under a native/reference GP29 coincidence model. Pooling across chapters raises the signal for each map without needing copied phrases. The stage score also includes a log-factorial histogram alignment term on the base region before the digit turns on and its first active region, with higher digits inactive. Cross-chapter scores are downweighted by a square-root multiplicity factor; overlapping pairs are not independent statistical trials.

At each stage enumerate all 812 maps per retained prefix and retain the twelve best extensions. After all seventeen stages rank residual alphabets by fitting IC, try trigram substitution annealing on the best two, and choose by fitting score only. The language reference consists of native solved material plus Gibran. The two independently keyed literary controls use disjoint chapter-length windows (with 193-rune gaps) from Shakespeare and Emerson, neither of which trains the language model. The final physical page in each chapter is withheld from fitting: 11,275 fit and 1,558 held runes, 12,833 in all. The largest weight is present in training, so held data need not introduce a new digit key.

| Input | Correct digit maps | Full runes correct | Held runes correct | Fit IC | Fit gain (nats/rune) | Held gain |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Shakespeare plant | 17/17 | 12,833/12,833 | 1,558/1,558 | .060119 | +.771625 | +.733462 |
| Emerson plant | 17/17 | 12,825/12,833 | 1,557/1,558 | .061396 | +.893167 | +.818880 |
| Original LP2 | unknown | unknown | nonprose | .034568 | -2.896122 | -3.331987 |

Both true affine prefixes rank first at every stage. The Shakespeare static permutation is exact; the Emerson decoder exchanges only labels 12 and 25, accounting for eight errors, one withheld. Original output remains close to uniform IC (1/29 = .034483) and is nonprose; its selected key and full rune arrays are retained only as rejected diagnostics. Forward replay is asserted for every evaluated final candidate; it proves inversion consistency, not authenticity. Unlike the donor gate, this is a calibrated **heuristic** negative: width twelve, two final substitution candidates, finite annealing, two literary plants and low-first chapter-shared ordinary consumption. It is not exhaustive over 812^17 keys or proof against new plaintext under another architecture.

[Blind SFT](../sims/lp2_shared_zeckendorf_allaffine_blind_sft.cjs), commit cbbe0045ddcdaa8752cd8f81980781fc818806b8; [raw stage ranks, geometry, candidates and pinned inputs](lp2-shared-zeckendorf-allaffine-blind-output.json), commit 109b365aaecd67021b9facf438504fa1252b9ec2. Core executed in connected V8 and remote code/output fetched back; standalone Node wrapper unrun. No CI dispatched.

## Opposite composition order: matched-lower-mask pooling

The original numeric spiral reads increasing distinct Fibonacci indices from red 3299 outward. If this is interpreted as an increasing order of digit operations in the sender, the inverse peels the highest active digit first. The prior blind receiver covered only the reverse sender order. This tests that remaining interpretation on the **same** nine chapter-relative clocks and frozen final-page holdouts, rather than changing origins, extending donor scans or increasing beam width. The spiral fixes the numeric order but does not establish the Zeckendorf or affine receiver; that transfer remains an exploratory hypothesis.

After undoing digits above k, the residual tape has an identical inner affine composition for every position sharing its lower mask m = z(n) & (2^k-1). Split each such group into digit-k absent and present samples, pooling chapters and all already undone higher masks. With the correct D_k, the two empirical symbol distributions should align, even if the shared inner composition is entirely unknown. For every one of the 812 affine maps, score the aligned counts A_v and B_{D_k(v)} by the sum of log binomial coefficients log((A_v+B_{D_k(v)})!/(A_v! B_{D_k(v)}!)), across the 237 to 1 groups available at successive digits. This is a shared-versus-independent multinomial evidence score up to action-independent terms under uniform Dirichlet priors; the pooled observations are not independent across successive stages, so the cumulative beam score is a heuristic, not a posterior probability. Groups with no samples in either half are omitted. Peel the highest digit, retaining twelve cumulative best candidates per step; rank complete keys by fit IC; apply the same two-candidate static substitution and held prediction as above.

The first calibration reduced the substitution annealing from six restarts of 14,000 steps to four of 10,000. Both controls recovered 17/17 affine actions, but Shakespeare held recovery was 1539/1558 (below the frozen 99% gate), so original scoring was skipped. Restoring the previously published six-restart budget **before any original scoring** gave:

| Input | Correct digit maps | Full runes correct | Held runes correct | Fit IC | Fit gain (nats/rune) | Held gain |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Shakespeare plant | 17/17 | 12,833/12,833 | 1,558/1,558 | .060119 | +.771625 | +.733462 |
| Emerson plant | 17/17 | 12,825/12,833 | 1,557/1,558 | .061396 | +.893167 | +.818880 |
| Original LP2 | unknown | unknown | nonprose | .035072 | -2.733567 | -3.156382 |

Both plants' true cumulative affine key ranked first at all 17 stages; their unchanged final decoded outputs are consistent with the previous opposite-order controls, which reuse the same underlying literary plaintext and keys. This is not two independent additional literary sources. The original candidate satisfies exact forward replay, but its held gain and near-uniform fit IC do not support decipherment. The alternate order therefore supplies no authenticated key or unknown plaintext. Both blind composition orders now have calibrated negative results under the ordinary shared-chapter model; neither is an exhaustive key-space rejection, and no independently selected receiver justifies another beam/reset expansion.

[High-first SFT](../sims/lp2_shared_zeckendorf_highfirst_blind_sft.cjs) and [raw results, input blobs and stage ranks](lp2-shared-zeckendorf-highfirst-blind-output.json), commit 49f2ee25616d3f4718d7d7602287c32e5ee1424e. Executed the exact committed core in connected V8; native Node/Windows wrapper not independently run. No CI dispatched.

## Limits and next decision

Retire exact contiguous reuse from this finite historical donor register at these seven original spans, under the declared ordinary-clock Zeckendorf affine architecture. The experiment does **not** reject new original prose, approximate or reordered donor reuse, shorter or differently positioned cribs, other origins/clock laws, literal-F holds, or nonlinear digit maps. No source evidence independently selects arbitrary affine maps; do not invent a new slope, clock or donor simply to rescue a failed branch. Retain the exact conjugacy-signature/peeling receiver for any genuinely independent long crib or another independently selected digit-composition mechanism. In particular, equality-only group gates can be reused as cheap necessary constraints before expensive language fitting. The two blind extensions retire both tested composition orders of the shared-chapter receiver as calibrated negatives, not all possible shared clocks. Do not widen its beam or multiply reset variants without a new independent clue. Preserve the pooled affine-peeling method for an independently selected shared digit clock. No authoritative frontier change.

## Reproduction

- [Standalone CommonJS SFT](../sims/lp2_p15_zeckendorf_allaffine_donor_crib_sft.cjs), commit af66ff356b013713a61edf08c0be58d4db708837.
- [Executed raw result with input blob IDs and per-source counts](lp2-p15-zeckendorf-allaffine-donor-crib-output.json), commit dcbfeec8dcdd5cb5e8082e516ecdcb2372ba9445.
- Executed exact core in connected V8 with the seven fetched repository inputs, verified both remote files. The standalone Node wrapper has not been separately run; no CI dispatched. The input blob pins include the operational canonical corpus and all tested historical/native donor sources.
