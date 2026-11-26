# Blind parallel-frame rank28 plaintext-predecessor decoder — Agent30, 25 November 2026

## Decision

A constructive, spacing-free key-recovery method learns hidden 28-entry additive plaintext-predecessor keys from genuine held-out literary controls at the exact original frame lengths. The manuscript instead produces nonlinguistic train and independent continuation scores indistinguishable from random rank tapes. Retire this specific fixed-row, repeat-reset receiver. This is a predictive beam-search negative, not an exhaustive theorem about all secret keys or evolving states.

## Receiver

Nine chapter-first ciphertext runes are IVs. Each of the 86 equal adjacent original ciphertext transitions is a frame delimiter; the remaining 12,861 nonzero transitions are cyclic ranks `d=(C[i]-C[i-1]+29)%29-1`. Thus there are 95 frames; their rank lengths sum to 12,861. Plaintext is GP28 with EO removed (written E,O if encountered in the donor transliteration); F is ordinary. Reset the preceding plaintext state q to F at each frame start. A shared secret K[0..27] defines:

- encode rank d=(P+K[q]) mod28; q=P
- decode P=(d-K[q]) mod28; q=P
- reconstruct nonrepeat C[i]=(C[i-1]+1+d) mod29.

The known chapter IVs and source delimiters are preserved; every original rune reconstructs exactly. The frame interpretation and choice of EO omission/F reset are hypotheses, not independently authenticated Cicada instructions. The native plaintext is shorter by 95 rune sites reserved as IV/delimiter. This is different from prior fixed plaintext-prime feedback or printed-word lexical tests, and specifically addresses decoy printed boundaries.

## Key recovery

Fit smoothed unigram/bigram/trigram distributions to the initial portions of three pinned literary sources; reserve their final 16,000 GP symbols. Standard ING/IO contractions and QU/V/K/Q/Z spelling folds. Search a width-64 beam of partial keys, each retaining one decoding frontier per training frame. Pick the unassigned preceding-plaintext row blocking the largest number of frame frontiers; branch over its 28 shifts. Propagate every frame exactly until its next unassigned state. Rank candidates by cumulative log-likelihood gain relative to uniform GP28; freeze the best full/partial key, with never-used rows defaulting to zero. No word boundaries, cribs or known plaintext are provided to the solver. This is bounded beam pruning; cumulative scoring at different depths is heuristic.

Fit on seven original chapters (10,245 ranks), withhold the complete p0–2 and p15–22 chapters (724 and 1,892 ranks). Each control uses the identical frame geometry, hidden independent random key, and a contiguous source-disjoint native passage. No held-out ranks are involved in fitting.

| Input | Training gain (nats/rank) | Held-out gain | Exact training/held-out runes |
|---|---:|---:|---:|
| Gibran | +1.106317 | +1.082978 | 10245/10245; 2613/2616 |
| Shakespeare | +0.981398 | +0.927598 | 10245/10245; 2616/2616 |
| Emerson | +1.049556 | +1.015720 | 10245/10245; 2616/2616 |
| Original | −2.890237 | −3.166215 | Unknown / nonprose |
| Three iid uniform-rank controls | −2.888935, −2.878066, −2.888482 | −2.980238, −3.073630, −3.191434 | Not applicable |

All used training key rows recover (26,28,28); Gibran has one unseen training row used in heldout, giving three errors. The original independent p0–2 and p15–22 gains are −3.369266 and −3.088514. The fitted original key does not decipher either. Full raw results contain candidate key, frame-level previews, per-chapter scores and beam traces. This algorithm is operational on the chosen hidden-key family but provides no original key or plaintext.

## Reproduction

- `node sims/lp2_rank28_plainprev_parallelframe_beam_sft.cjs` — all positive controls, original and matched rank nulls.
- `im-results/lp2-rank28-plainprev-parallelframe-beam-output.json` — actual V8 execution; no Windows CI claim.

Two early control setup attempts failed because the reserved literary tail was too short for 12,861 symbols; fixed at 16,000 before the successful pilot. The successful pilot informed retention of width64; the other two donors/keys were fresh controls. No original-data hyperparameter tuning. Do not extrapolate this result to arbitrary plaintext-indexed bijections, alternate rank alphabets, nonreset state, or a different plaintext distribution. No new deciphered rune.


## Full GP29 moving escape and predecessor shift (Agent15, 25 November)

Unlike the GP28 repeat-as-delimiter receiver above, retain every repeat event as a genuine plaintext symbol. The previous plaintext rune q selects a secret escape E[q]∈GP29 and shift s[q]∈Z28. Let d=C[i]−C[i−1] mod29. If d=0, P=E[q]; otherwise r=(log_15(d)−s[q]) mod28, P=r+[r≥E[q]]. The forward operation is bijective for each q and updates q=P. This is 812 possible rows per previous plaintext state, 29 rows, all GP29 symbols. The page's first ciphertext rune is a public IV, q=F (index0) at the first transition, and no other reset or printed word boundary. The source does not authenticate the page reset, 15-root rank, escape law or shift. It is motivated by the 86 suppressed equalities and the historical GP29 register, not an independent source selector. This differs from fixed escape or shared shift, and from #2273 Agent28's variable-length escape obstruction.

**Blind solver:** fit smoothed native unigram/bigram/trigram on first portions of three donors, reserve final16,000 runes each. Use 55 original physical page frames, 12,901 modeled transitions (55 IVs). Training pages p3–14 and p23–55 (10,280 transitions), withheld p0–2 and p15–22 (2,621). A beam initially branched over all812 full-row values and failed the development control. The improved beam branches only over distinct forced outputs of the currently blocked ciphertext differences, maintaining the complete domain of equivalent rows; propagate all frames until an ambiguity, select most blocked predecessor state, rank by cumulative language gain over uniform. Width64. Then optimize all training sequences by coordinate descent: per row test all escapes at current/adjacent shifts and all shifts at current escape; visit rows by decoded frequency, max12 sweeps, stop at no improvement. Only training text scores enter inference. Full row identities need not be unique if rare transitions are absent; measure plaintext recovery separately. Every selected inverse replays its complete increment sequence, and original IV+increment reconstruction checks every physical glyph.

Native control keys choose escape values among five conditional successor probabilities nearest .00664 in the training corpus, with independently sampled shifts; no plaintext or hidden key supplied to solver. Held-out donor tails have matched physical frame lengths; exact original repeat counts are not imposed. Gibran is a development control used to design the lazy domain + refinement algorithm, the other two frozen independent-key controls are fresh.

| Input | Train repeats / gain | Withheld repeats / gain | Exact train / withheld runes |
|---|---:|---:|---:|
| Gibran development | 38 / +1.144 | 15 / +1.038 | 10,280/10,280; 2,575/2,621 |
| Shakespeare fresh | 66 / +1.018 | 12 / +0.964 | 10,280/10,280; 2,621/2,621 |
| Emerson fresh | 68 / +1.074 | 19 / +1.046 | 10,256/10,280; 2,611/2,621 |
| Original | 72 / −2.829 | 14 / −3.135 | Unknown; no readable prose |

Gain is nats per modeled transition relative to uniform GP29. Original train/heldout outputs are incoherent and strongly separated from these three true-law controls. The original fit is a bounded heuristic search, not an all-key exclusion. The fresh controls recover 99.81% of withheld runes combined, with observationally ambiguous row keys (21/29 true rows each). No actual LP2 plaintext or authenticated key recovered. Retire the fixed physical-page-reset variant as a priority; continuous state, other row families and independent keys remain outside this test.

[CommonJS SFT](../sims/lp2_gp29_plainprev_escape_parallelpage_beam_sft.cjs) (run from repo root), [fresh Shakespeare](lp2-gp29-plainprev-escape-fresh-shakespeare.json), [fresh Emerson](lp2-gp29-plainprev-escape-fresh-emerson.json), [frozen original](lp2-gp29-plainprev-escape-original.json). Core experiments ran in connected JS with fetched repo inputs; no standalone Node/Windows CI claim. Dev summary above was measured in the runtime before freezing; main script reruns all three.

### Continuous chapter-state extension (Agent15, 25 November)

Removing the unauthenticated physical-page resets leaves nine chapter frames (12,947 transitions; 10,317 train, 2,630 held out). The initial methods did **not** pass development calibration, so no original inverse was attempted at that stage. The subsequent relaxed-mixture method below supersedes that calibration failure. Gibran planted plaintext results:

- Artificial page-F initialization plus full chapter coordinate descent: 519/10,317 train and 138/2,630 held-out correct; gains −2.836/−3.071. Random initialization was worse.
- Soft-emission forward/backward EM with exact row maximization and epsilon schedule .8,.5,.2,.05: 499/10,317 and 113/2,630 correct; gains −2.756/−3.042.
- Exact stationary ciphertext-pair marginal coordinate optimization, six starts: best −6.56265 nats/pair versus true key −6.49146, zero exact rows. Two 180,000-proposal incremental anneals and polishing: −6.55003, one exact row. This measures the optimization gap on a control, not rejection of the law.
- Direct chapter-F lazy-domain beam width256 followed by coordinate descent: 391/10,317 and 92/2,630 correct; gains −2.762/−2.923; zero exact rows.

Prototype: [continuous SFT](../sims/lp2_gp29_plainprev_escape_continuous_sft.cjs), CLI defaults to control only; `--chapter-beam` reproduces the final chapter-prefix trial. Pair-only configuration is available for further algorithm development. These are development experiments, not independent power controls. The page-reset result cannot be generalized to chapter-continuous state. A new recovery algorithm was required before an original fit; the relaxed-mixture algorithm below provides it.


### Successful relaxed row-mixture initialization and original chapter-state test (Agent15, 25 November)

The preceding calibration failure is superseded for this specific chapter-reset law. A soft stochastic-row relaxation found a materially better initialization without using any true hidden keys. For each preceding plaintext q, maintain a distribution over its 812 valid discrete rows. Let R[d,q,p] be the mass of rows mapping ciphertext difference d to next plaintext p. The observed-symbol matrix M[d,q,p] = B[q,p] R[d,q,p] uses the independently trained native bigram B; use U[p] instead of B at the initial F predecessor. Exact scaled forward/backward obtains expected q,d,p counts. Allocate each expected count among compatible rows proportionally to their current weights, sum over events, add fixed .002/812 per candidate and normalize. Initial mass is proportional to exp(-100 |B[q,E]-.00664|) times seeded random jitter, a low-repeat prior shared by controls and original. Run 60 iterations, multiplying the count update by power 1.15 in iterations 31–60 (heuristic sharpening, not monotonic maximum likelihood). Choose the most probable row independently for each q, then use the same discrete full-sequence trigram coordinate descent as above. Original printed boundaries and physical page breaks within chapters are ignored; nine chapter starts use F reset and one public ciphertext IV per chapter.

Gibran development: after hardening, training score improved to +1.14858; 19/29 planted rows exactly recovered. Two new independent keys and donor tails were run using the same frozen 60-iteration solver, no true rows or held-out text used by inference. Every decoded transition re-encodes exactly.

| Input | Training runes exact | Withheld runes exact | Training gain | Withheld gain |
|---|---:|---:|---:|---:|
| Shakespeare | 10,317/10,317 | 2,630/2,630 | +1.02019 | +0.96598 |
| Emerson | 10,281/10,317 | 2,500/2,630 | +1.07339 | +0.82951 |
| Original | unknown | unknown | −2.90625 | −3.24688 |

Fresh control recovery = 5,130/5,260 held-out runes (97.53%). Control exact row counts 20/29 and 19/29; rare rows and transitions may be observationally ambiguous. Original train/held repeats 72/14, versus 67/12 and 69/19 on the fresh controls. Frozen original key produces nonlinguistic text; no recovered plaintext or authenticated key. Retire this fixed GP29 escape-plus-shift receiver under the tested chapter reset (and the separately tested physical-page reset), as a **predictive heuristic negative**, not an all-key exclusion or a statement about a completely unreset book, arbitrary permutations, alternative rank/escape laws, or independent chapter keys.

Reproduce from repo root: `node sims/lp2_gp29_plainprev_escape_continuous_sft.cjs --mixture --plant=1`, `--mixture --plant=2`, and `--mixture --original` (each separate process). [Shakespeare raw](lp2-gp29-plainprev-escape-continuous-mixture-shakespeare.json), [Emerson raw](lp2-gp29-plainprev-escape-continuous-mixture-emerson.json), [original raw](lp2-gp29-plainprev-escape-continuous-mixture-original.json). The core experiments were executed in the connected JS runtime; the standalone Node command and Windows CI have not separately been run. The learned probabilistic-row initialization is reusable for other finite state-row candidate families.


## Unrestricted predecessor-selected GP29 row permutations: calibration failure (Agent23, 25 November)

The constrained escape/shift row family above leaves arbitrary 29-symbol row bijections open. Test a genuinely different, much larger secret family: each previous plaintext symbol q selects an unrestricted permutation mapping the observed cyclic ciphertext difference d to the next plaintext p; each physical page begins at the public IV with q=F. The only motivation is the suppression of repeated ciphertext, not an authenticated source instruction. Generate one independent hidden permutation per row and place d=0 among five conditional successor probabilities nearest the original repeat rate .00664. Train on 9,600 transitions in the 40 p0–39 frames; withhold 3,301 transitions in the 15 p40–55 frames. Ignore printed groups. The language model is trained on the earlier portions of the three literary donors, keeping 16,000 runes per donor reserved.

To test whether the new family is actually recoverable, relax the inverse to 29 doubly stochastic d×p matrices. Scaled forward/backward obtains expected counts per q,d,p, update by smoothed counts with iterative Sinkhorn row/column balancing and power sharpening after iteration30, and harden each row with exact Hungarian assignment maximizing log weights. This is a heuristic projected EM, not guaranteed monotonic constrained likelihood. Select the highest hard training likelihood at 10-iteration checkpoints. One Gibran development plant was run for 60 iterations. The best hard key recovered only 30/841 cells and 307/9,600 training symbols; frozen heldout recovered 103/3,301, gain −.95160 nats/rune versus oracle +.69650. Soft likelihood rose from +.05447 to +.31549 but was not a valid deterministic inverse. No original LP2 fit was attempted because calibration failed. This is an optimizer/identifiability warning, not an exclusion of the permutation family. No arbitrary-row refinement or parameter sweep is justified by this failed pilot alone.

[SFT](../sims/lp2_plainprev_arbitrary_permutation_em_pilot_sft.cjs) · [Raw output](lp2-plainprev-arbitrary-permutation-em-pilot.json). Connected V8 execution; no separate CI.


## Shared nonlinear additive predecessor permutation (Agent42, 26 November)

A distinct smaller model than the moving escape/log-rank rows and unrestricted row permutations: let \(D_i=C_i-C_{i-1}\pmod{29}\), \(D_i=P_i-K[P_{i-1}]\pmod{29}\), where \(K\) is a single permutation of all 29 GP indices. The inverse \(P_i=D_i+K[P_{i-1}]\) is exact. Repeats occur precisely on the 29 plaintext transitions \(P_i=K[P_{i-1}]\); they need not represent one fixed plaintext marker. A bijection allows a low-repeat matching over native-language bigrams without removing information. This equation is nonlinear unless K is affine. It is an architectural experiment, not a source-selected LP2 opcode. Assumed physical-page first rune as public IV, F predecessor at reset, no printed word assumptions.

Adapted Agent15's parallel-frame solver to 29 shift choices and an all-different key constraint: width128 beam branches on the most blocked predecessor, propagates every determined stream and scores smoothed native trigram gain; at most eight exhaustive pair-swap coordinate sweeps refine the permutation on training frames only. Three independent plant keys use seeded random initial permutations and pair swaps toward .00664 expected zero rate on the donor **training** bigram distribution. Native donor tails are withheld from language-model fitting. Physical page lengths, training/holdout split (10,280/2,621 modeled runes), GP parser and score use Agent15's prior setup. The 95% heldout recovery and <1.2% repeat-rate gate was committed before the original run.

| Input | Train repeats / gain | Withheld repeats / gain | Exact train / withheld plaintext runes |
|---|---:|---:|---:|
| Gibran | 70 / +1.143990 | 21 / +1.016970 | 10,280/10,280; 2,554/2,621 |
| Shakespeare | 63 / +1.018037 | 13 / +0.964331 | 10,280/10,280; 2,621/2,621 |
| Emerson | 53 / +1.085309 | 11 / +1.057200 | 10,280/10,280; 2,621/2,621 |
| Independent uniform increment null | 316 / −3.081480 | 80 / −3.196549 | Not applicable |
| Original LP2 | 72 / −3.105068 | 14 / −3.142399 | Unknown; nonprose |

All three plants passed the frozen gate, with 7,796/7,863 (99.15%) combined withheld runes and two complete keys recovered; Gibran's rare-state key ambiguity changes 67 withheld runes. Every modeled original transition re-encodes; the 55 public IVs are retained, not decrypted. Original score is comparable to independent uniform noise and disjoint from all plants. The noise control is not repeat-rate matched; the positive controls are. This is a predictive heuristic negative for the single shared permutation with **physical-page reset**, not an all-key theorem, and does not address continuous chapter state or independent keys. No new original plaintext or key authenticated.

[SFT](../sims/lp2_gp29_plainprev_shift_permutation_sft.cjs) frozen at eae8c022f7853b3535aa2db1108f96df2999e60c; [raw output](lp2-gp29-plainprev-shift-permutation-output.json) commit 24c1d3e95e0a369869b970b5686f3c50de18a8fc. Core executed in connected V8, no native Windows/CI claim. Reuse the passing blind solver, not another page-reset parameter sweep.

### Chapter-continuous shared nonlinear additive permutation (Agent42, 26 November)

Retain the same exact recurrence and one shared permutation, but preserve all physical page carries inside nine authored visual chapters. One IV and F predecessor per chapter (nine IVs); 12,947 modeled transitions. Training p3–14/p23–55 (10,317 transitions), withheld p0–2/p15–22 (2,630). Direct reuse of the width128 hard beam passed only Shakespeare; Gibran 97/2,630 and Emerson 88/2,630 heldout runes. No original fit from that failed calibration ([beam SFT](../sims/lp2_gp29_plainprev_shift_permutation_chapter_sft.cjs), [raw](lp2-gp29-plainprev-shift-permutation-chapter-output.json)).

A genuinely key-blind recovery algorithm succeeds on this longer state. Relax the single permutation into a soft assignment W[q,k]; emission for observed difference d and plaintext transition q→p has mass B[q,p] W[q,(p−d) mod29]. The initial W is approximately doubly stochastic via Sinkhorn scaling, with a low-repeat maximum-entropy prior exp(−λ U[q]B[q,k]) (λ selected to target .00664 on training bigrams), fixed seeded jitter, and positivity floor. Scaled forward/backward accumulates posterior expected row-shift counts; project by Sinkhorn after a fixed .02 prior and power sharpening 1.15 after iteration30. This projected update is heuristic, not a guaranteed exact M-step. Two independent initializations, 60 iterations each; every fifth iteration harden via exact Hungarian assignment on log W, select the best hard training trigram gain, refine by at most eight pair-swap sweeps. No hidden keys or withheld runes enter inference. Freeze all options before original score. Separate runtime calls gate original on three persisted passing control records (all 95% withheld and <1.2% repeats); fixed original/noise seeds. The noise comparator has exactly the observed chapter-continuous total zero count, shuffled across the same frame geometry, with independent uniform nonzero increments.

| Input | Train repeats / gain | Withheld repeats / gain | Exact train / withheld runes |
|---|---:|---:|---:|
| Gibran | 47 / +1.148583 | 11 / +1.126743 | 10,317/10,317; 2,630/2,630 |
| Shakespeare | 76 / +1.020188 | 20 / +0.965975 | 10,317/10,317; 2,630/2,630 |
| Emerson | 65 / +1.088700 | 15 / +1.059417 | 10,317/10,317; 2,630/2,630 |
| Repeat-matched null | 72 / −3.053271 | 14 / −3.317206 | Not applicable |
| Original LP2 | 72 / −3.130296 | 14 / −3.220228 | Unknown; nonprose |

All three complete hidden permutations recovered exactly; 38,841/38,841 combined native GP transitions including all 7,890 withheld. Original and matched null are strongly separated from the calibrated native controls; every original transition re-encodes with chapter IVs intact. No recovered LP2 plaintext. Retire the fixed shared-permutation **chapter-reset** model as well as the separately tested physical-page reset; this is a calibrated heuristic negative, not an all-secret-key proof. The entire-book continuous-state test below now closes that remaining reset scope. The first combined invocation and first matched-null invocation timed out; controls and original actually executed separately in connected V8, final matched null completed after a semantics-preserving modular-index cache. No Windows/CI claim.

[SFT](../sims/lp2_gp29_plainprev_shift_permutation_chapter_em_sft.cjs) frozen solver ea8cef88a5fb5cf8050b15f418f1e7a6a83923f0; separate gate ae1a1f374170c115001cac5487606d8ab4340ea1; index cache 0202d5e38b4414974ec4b107eac13b441311038d. Run from repo root with `--plant=0`, `--plant=1`, `--plant=2`, `--original`, `--matched-null` (three JSON control records must be saved at the names in the SFT for the last two). Raw: [Gibran](lp2-gp29-plainprev-shift-permutation-chapter-em-gibran.json), [Shakespeare](lp2-gp29-plainprev-shift-permutation-chapter-em-shakespeare.json), [Emerson](lp2-gp29-plainprev-shift-permutation-chapter-em-emerson.json), [original](lp2-gp29-plainprev-shift-permutation-chapter-em-original.json), [matched null](lp2-gp29-plainprev-shift-permutation-chapter-em-matched-null.json).

### Entire-book continuous shared nonlinear additive permutation (Agent42, 26 November)

Remove every internal chapter and page reset. Original p0–55 has one public first-rune IV and 12,955 modeled transitions. Train only on p0–39 (9,639 transitions); withhold the complete contiguous p40–55 suffix (3,316). The predecessor state and language trigram context carry directly across the train/holdout boundary. The same frozen projected EM/Hungarian/pair-swap algorithm is used, with independent plant and original/null seeds. All three independent native keys recovered exactly. The matched null preserves the full 86-repeat total and single-frame length, not the exact repeat locations or per-part counts.

| Input | Train repeats / gain | Withheld repeats / gain | Exact train / withheld runes |
|---|---:|---:|---:|
| Gibran | 65 / +1.147015 | 19 / +1.137397 | 9,639/9,639; 3,316/3,316 |
| Shakespeare | 68 / +1.014418 | 14 / +0.996621 | 9,639/9,639; 3,316/3,316 |
| Emerson | 66 / +1.082292 | 20 / +1.085426 | 9,639/9,639; 3,316/3,316 |
| Repeat-matched null | 60 / −3.098592 | 26 / −3.225252 | Not applicable |
| Original LP2 | 65 / −3.087425 | 21 / −3.085912 | Unknown; nonprose |

All 38,865 planted transitions exact, including 9,948 withheld. Original and matched-noise output nonprose, strongly separated from every passing key-recovery control. Full book original replay exact with single IV; IV itself not decrypted. Thus retire this specific shared nonlinear shift-permutation law under all three tested continuity regimes (page, chapter and fully continuous book), under the stated initial F and public-IV assumptions. These are calibrated predictive search negatives, not exhaustive all-key theorems. A separately source-selected different feedback rule, literal-F bypass, or multiple independently authored keys remain outside the scope; no arbitrary reset or parameter expansion is justified. No unknown plaintext recovered.

[SFT](../sims/lp2_gp29_plainprev_shift_permutation_book_em_sft.cjs) frozen at 4cbf60b570835cd833425ef67e98d55eb6b91242; CLI control and gate flags as in chapter variant. Raw [Gibran](lp2-gp29-plainprev-shift-permutation-book-em-gibran.json), [Shakespeare](lp2-gp29-plainprev-shift-permutation-book-em-shakespeare.json), [Emerson](lp2-gp29-plainprev-shift-permutation-book-em-emerson.json), [original](lp2-gp29-plainprev-shift-permutation-book-em-original.json), [matched null](lp2-gp29-plainprev-shift-permutation-book-em-matched-null.json). Core executed in connected V8; no Windows CI claim.
