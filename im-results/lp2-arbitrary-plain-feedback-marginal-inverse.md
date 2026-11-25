# Arbitrary nonbijective plaintext feedback: identifiability and blind inverse

## Model and theorem

Under ordinary consumption, C_i=P_i+f(P_{i-q}) (mod29), with unknown positive lag q and any deterministic f:GP29→GP29, not necessarily injective. Under a positive rational nonuniform iid plaintext law π and stationarity, let u_a=Σ_{x:f(x)=a}π_x. Then h=π*u and J_cd=Σ_x π_x u_{c-x} π_{d-f(x)} for ordered ciphertext pairs separated by q. The circulant of π is invertible: a rational polynomial of degree ≤28 that vanishes at a nontrivial 29th root must be proportional to 1+x+…+x^28, contradicting nonuniformity. Thus h identifies u. The circulant A of u is invertible by the same argument: if f is nonbijective at least one output bin has mass zero, so u cannot be uniform; if bijective u is a permutation of π. Consequently A^{-1}J has rows π_x times the cyclic translate of π by f(x). Positive π_x and distinct translates recover every f(x), including repeated image values. This extends the permutation-only noiseless inverse to all 29^29 functions. The theorem assumes the correct lag, iid law, exact probabilities and stationary interior; no claim of finite-sample identifiability or unique lag (e.g. constant f).

## Constructive finite-sample inverse

Fit first 10,000 runes. Rank q=1..32 by empirical lagged mutual information, freeze the top lag. Estimate u via 1,000 simplex-mixture EM steps on the two pair marginals. Relax each f(x) into a categorical mixture over 29 cyclic shifts and take 240 EM updates on the pair likelihood given u; harden independently by maximal mixture weight. Refine arbitrary f by exact coordinate ascent of the stationary pair likelihood, up to 15 sweeps. For change f(x):a→b, ΔJ_cd=π_x[π_{c-b}π_{d-f(c-b)}−π_{c-a}π_{d-f(c-a)}+u'_{c-x}(π_{d-b}−π_{d-a})]; accepted change compared to rebuilt J. No all-different constraint.

Then optimize full stationary iid chain marginal likelihood by coordinate ascent (max four sweeps), merging states after noninjective transitions via logsumexp. For fixed f recover each strand's best initial plaintext via exact unigram likelihood, then refine f against a native trigram score for the decoded fit prefix (three sweeps, rare rows first). Context score uses solved native sections only with hierarchical smoothing; its row denominators include section-final context counts, so it is a slightly subnormalized scoring proxy, not a calibrated predictive probability. Freeze map and initial states on first 10,000; deterministic continuation on 2,956 unseen runes. No target text in training. The finite optimizer is local and does not prove a global optimum.

## Actual controls and original transfer

Native rune prior from 2,979 solved runes +0.5 per symbol. Deterministic seed 0x451125; ordinary-clock plants from fixed Gibran offset10000 and Emerson offset40000, both length12,956; true lags 5,11, independently sampled nonbijective maps. Initial q precursors independently sampled uniform; decoder uses stationary prior, explaining possible initial ambiguity.

| Input | True/inferred lag | Map matches after pair/chain/context | Fit matches | Frozen withheld | Held-out unigram NLL |
|---|---|---|---:|---:|---:|
| Gibran | 5/5 |17/29,29/29,29/29 |9998/10000 |2956/2956 |2.99134 |
| Emerson |11/11 |17/29,28/29,28/29 |9992/10000 |2949/2956 |2.97085 |
| LP2 p0–55 |unknown/1 |unknown |unknown |nonprose |4.17710 |

Emerson's single unresolved map row is rare index25 (AE); contextual refinement improves heldout from 2932 to2949. Both original and control outputs replay exactly after the initial q symbols by construction. Original heldout NLL 4.17710 versus uniform-output cross-entropy under the same native prior 4.160489579; the near-baseline value is not by itself a statistically decisive language rejection. Output is incoherent. Baseline identity/random coordinate-only initialization failed both plants, even though correct lag topped MI, so it was replaced with relaxed mixture EM. Adding independent Shakespeare trigram text did not improve the rare-row recovery (same 2949/2956), and yielded nonprose original 4.23030. No source-selected q or recovered original key. This is a constructive generalization of the prior permutation inverse, but its ordinary original transfer fails; not an all-key/all-lag exclusion. The spacing-free literal-F q1 extension is now implemented and calibrated below; the frozen original receiver fails. Other lags remain open.

## Reproduce

`node sims/lp2_arbitrary_plain_feedback_marginal_sft.cjs`. [Executed output](lp2-arbitrary-plain-feedback-marginal-output.json). Connected JS execution against canonical repository data, wrapper uses exact same function. No remote CI claim.


## Spacing-free arbitrary stationary predecessor function with authentic Fehu bypass (Agent19, 25 November)

This is a constructive extension of the ordinary-clock marginal receiver above and of the [intact-word exact nonlinear F-hold gate](lp2-plaintext-autokey-q1-allfunction-fhold-original-gate.md). It removes all printed-word assumptions. Use one common stationary f on the 28 nonzero plaintext symbols, arbitrary last-consuming plaintext initialization, and the native cipher's literal Fehu behavior. If P=0, emit C=0 and hold the last consuming symbol x; otherwise emit C=(P+f(x)) mod29 and set x=P. Ciphertext zero can be an ordinary consuming output. No source clue proves this feedback rule. Unlike raw q8/q13 delayed feedback, this is a one-step consuming clock and may evade the earlier word-constrained negative.

### Blind key recovery

Train a GP-native bigram model B on the pinned Shakespeare text; let π be its stationary distribution and h=π(0)=0.020381549. For the iid initialization, use π conditional on nonzero to model the active stream. The visible adjacent-pair law is (1−h)^2 times its active pair law plus h(1−h) times the two one-zero marginal terms and h² at (0,0). Estimate the unknown active-shift marginal by 800 mixture EM iterations, then each row's relaxed shift distribution by 240 pair EM iterations. Harden and coordinate-optimize the exact Markov pair distribution for up to ten sweeps. In the Markov law, A[x,y]=B[x,y]+B[x,0]B[0,y]/(1−B[0,0]) is the next-active transition. Consecutive consuming (x→y→z) contributes π[x]A[x,y]B[y,z] to ciphertext pair (y+f(x),z+f(y)); consume→hold, hold→consume and hold→hold contributions follow the same stationary chain. This pair estimator is just an initializer.

Use exact sum-product over 56 live hidden states (last consuming plaintext x=1..28, previous visible plaintext either x or zero) and relaxed row distributions w[x,a]. A consuming transition to z>0 emits c with factor w[x,(c−z) mod29] and the appropriate bigram probability; a hold emits zero, retains x and changes the visible-context flag. Initialize each row as .35 times the iid mixture, .64 on the Markov-pair hard digit, .01 uniform. Each of 45 exact forward/backward iterations accumulates expected shift counts E[x,a] and sets the next row proportional to (E[x,a]+.02)^1.04. The small sharpening makes this a generalized heuristic optimizer, not monotonic ordinary EM. Harden at all 46 iterations, admit only maps with exact deterministic full-prefix reachability, select by exact marginalized likelihood. Freeze selected map and Viterbi terminal state on the first 10,000 runes; decode the 2,956-rune continuation with every legal hold history. Check exact forward replay. No dictionary or printed separators.

### Actual controls and original

Two target-excluded literary plants, Gibran offset10000 and Emerson offset30000 in the pinned native encodings, each 12,956 runes; separately generated arbitrary nonbijective keys and primers using seed 0x19aef10. The prior and parameters were fixed before original fitting. Pair-only initializers were weak (3/4 correct rows for Gibran and 4/5 for Emerson, iid/Markov respectively); the sequence EM is the substantive recovery step. The oracle column gives full-tape Viterbi accuracy even with the true key, demonstrating inherent hold ambiguity.

| Input | Recovered observable rows | Selected iteration | Fit runes | Frozen heldout | Heldout MAP nats/rune | True-key oracle full tape |
|---|---:|---:|---:|---:|---:|---:|
| Gibran | 27/28 | 19 | 9984/10000 | 2954/2956 | -2.609259 | 12938/12956 |
| Emerson | 28/28 | 12 | 9980/10000 | 2950/2956 | -2.632768 | 12930/12956 |

None of the 46 hardened maps admits the complete 10,000-rune original training sequence. Longest legal prefix over all hardenings is 154/10000 at iteration 14; final hardened prefix 35. Consequently no frozen original key or plaintext candidate is nominated and the 2,956-rune suffix is not decrypted. Soft-model score at iteration 40: -3.365531 nats/rune, but a stochastic row mixture is not a legal deterministic key and its score is not evidence of historical encryption.

This is a calibrated finite search, not exhaustive over 29^28 keys. It is materially stronger than the intact-word exclusion in the specific sense that decoy spacing no longer prevents key recovery on controls. No unknown LP2 plaintext, authentic key or destination is established. Retire this fixed shared-map search procedure unless a new selector or justified optimizer improvement appears; chapter-private maps or other clocks remain distinct. [Reproducer](../sims/lp2_arbitrary_plainprev_fhold_spacingfree_em_sft.cjs) · [complete output](./lp2-arbitrary-plainprev-fhold-spacingfree-em-output.json). The experiment function ran on pinned repository source inputs in connected V8. The Node wrapper was not separately executed.
