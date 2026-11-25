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
