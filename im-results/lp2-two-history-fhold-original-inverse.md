# LP2 two-history mixed-affine consuming-clock inverse (#2608)

## Decision

The proposed equal-tap two-history recurrence with authentic latent plaintext-F holds does **not** yield a predictive LP2 decoding on the frozen original p16–21 split. Unlike the single-tap q1–8 exclusion, this is not an all-key impossibility theorem: the relaxed support gate retains 13,955 noncancelling triples, and only the 128 best exact discrete-unigram candidates were refined with a language model. The original prefix-selected key has a dead held-out continuation.

## Receiver and exact algorithm

On consuming runes set X=uP (u=1..28), and C=X+a(Xprev1+Xprev2)+b(Cprev1+Cprev2)+d modulo 29. Plaintext F emits C=0 and holds both history registers; an observed zero may also be a consuming output with nonzero X. Coefficients a,b,d range over GF29. All effective first two consuming X values are allowed; both initial X histories must be nonzero, previous C histories arbitrary. The receiver is physical p16–21, 1,613 runes: first 600 for fitting, remaining 1,013 for one prediction. First two observed C are nonzero. Prefix FNV32 over numeric runes: 3426276579; 23 visible Fs.

A DP over (X1,X2,C1,C2) merges identical states. For b=-a,d=0,a!=0, delta=X-C obeys delta_next=-a(delta1+delta2); a nonzero a makes that recurrence invertible. The two-zero delta state is excluded from those cancellation cases; its static mapping is represented separately by a=b=d=0. Exact support over all 24,388 nontrivial triples: 13,955 noncancelling survive; no nonstatic cancellation survivor, 784 peak states, latest first dead position 599 (zero-based). Including canonical static gives 13,956 surviving normalized triples. This first-two-state relaxation may include unreachable primers when b=0.

For each triple the compiled ranker carries 28 independently maximized unigram scores at every state (score = round(10000 log(smoothed native frequency)), alpha=.5), retaining all states and evaluating all 28 scales. The union of top 128 from two coefficient shards is globally truncated to 128 by descending tuple. No branch pruning by language before unary rank. For those 128 keys, exact bigram and trigram Viterbi includes the two most recent physical F flags to reconstruct physical language context. Smoothing uses alpha8 interpolation with the lower-order conditional model. It checks that a legal primer exists; it does not identify original prior history uniquely. No lexical crib or original holdout used in fitting. At the selected trigram MAP prefix, both the key and full terminal state are frozen, then the remaining 1,013 observed runes are decoded once.

Training is Shakespeare's first300k plus native GP29 solved sections [0,2,7,8] (zero-indexed), 217,627 runes. Entire sections used in the controls are excluded from training. Prefix-only and holdout scores are nats/rune. Sources: canonical corpus blob 054f2a0f780b7d46901acbe3d9bf4f0ac1801165, native source 1b064ef6d85819b7d96adaff31a82d1ec551598f, Shakespeare 94c677ad9dd50771c6670e0c4e4dad9052b46d85.

## Actual results

| Tape | True key (a,b,d,u) | Selected key | True rank unary / bi / tri | Prefix trigram | Frozen suffix |
|---|---|---|---|---:|---|
| WELCOME + KOAN1 plant | (4,21,11,19) | exact | 1 / 1 / 1 | -2.365978 | 695/695, -2.288870 |
| LOSS + KOAN2 + INSTRUCTION plant | (24,7,20,3) | exact | 1 / 1 / 1 | -2.400315 | 563/563, -2.302873 |
| Original p16–21 | unknown | (26,5,25,13) | n/a | -5.883026 | impossible at zero-based suffix position 23 |

Both native prefixes 600/600 exact, both full forward replays exact; total 1,258/1,258 withheld runes. The original top unary candidate is (2,13,13,28), score -23093370 integer units; bigram also selects it. Trigram selects a different key, runner-up -5.960383. All 128 shortlisted keys legal on prefix. Selected original prefix begins LSLLNTUXOEAAAEAHEROESGNAGUTHHCDBNEOUGUNEEDAEOEPYXBTHSDNOXCICRAPEOMBWJ; it is not coherent language. Prefix terminal state [10,20,21,4,0] cannot traverse the suffix beyond its 24th physical rune. No claim that all 13,955 support survivors lack any language solution.

## Reproduction

- `sims/lp2_two_history_fhold_rank.cpp` — locally executed C++17 exact unary ranking, g++ -O3 -march=native; state buffer 4000 asserts on overflow (observed original peak 784); no cap hit.
- `sims/lp2_two_history_fhold_refine.cjs` — executed native and original refinement in connected V8.
- `sims/lp2_two_history_fhold_sft.cjs` — assembled Node22/g++ runner to recreate tapes, verify FNVs, run rank shards, gate original on native results, and print raw output. The constituent computations executed successfully; the combined wrapper was not separately run end-to-end.
- `im-results/lp2-two-history-fhold-control-ranking.json` and `im-results/lp2-two-history-fhold-original-ranking.json` — actual full outputs and exact top-128 key encodings.

The graphic p15 does not authenticate this particular receiver, tap coefficients or arithmetic. Retire this tested inference route, not arbitrary multitap feedback or switches, and do not tune using the failed original suffix.
