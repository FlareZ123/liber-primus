# Arbitrary nonbijective plaintext feedback: identifiability and blind inverse

## Model and theorem

Under ordinary consumption, C_i=P_i+f(P_{i-q}) (mod29), with unknown positive lag q and any deterministic f:GP29→GP29, not necessarily injective. Under a positive rational nonuniform iid plaintext law π and stationarity, let u_a=Σ_{x:f(x)=a}π_x. Then h=π*u and J_cd=Σ_x π_x u_{c-x} π_{d-f(x)} for ordered ciphertext pairs separated by q. The circulant of π is invertible: a rational polynomial of degree ≤28 that vanishes at a nontrivial 29th root must be proportional to 1+x+…+x^28, contradicting nonuniformity. Thus h identifies u. The circulant A of u is invertible by the same argument: if f is nonbijective at least one output bin has mass zero, so u cannot be uniform; if bijective u is a permutation of π. Consequently A^{-1}J has rows π_x times the cyclic translate of π by f(x). Positive π_x and distinct translates recover every f(x), including repeated image values. This extends the permutation-only noiseless inverse to all 29^29 functions. The theorem assumes the correct lag, iid law, exact probabilities and stationary interior; no claim of finite-sample identifiability or unique lag (e.g. constant f).

## Constructive finite-sample inverse

Fit first 10,000 runes. Rank q=1..32 by empirical lagged mutual information, freeze the top lag. Estimate u via 1,000 simplex-mixture EM steps on the two pair marginals. Relax each f(x) into a categorical mixture over 29 cyclic shifts and take 240 EM updates on the pair likelihood given u; harden independently by maximal mixture weight. Refine arbitrary f by exact coordinate ascent of the stationary pair likelihood, up to 15 sweeps. For change f(x):a→b, ΔJ_cd=π_x[π_{c-b}π_{d-f(c-b)}−π_{c-a}π_{d-f(c-a)}+u'_{c-x}(π_{d-b}−π_{d-a})]; accepted change compared to rebuilt J. No all-different constraint.

Then optimize full stationary iid chain marginal likelihood by coordinate ascent (max four sweeps), merging states after noninjective transitions via logsumexp. For fixed f recover each strand's best initial plaintext via exact unigram likelihood, then refine f against a native trigram score for the decoded fit prefix (three sweeps, rare rows first). Trigram uses solved native sections only with hierarchical smoothing. Freeze map and initial states on first 10,000; deterministic continuation on 2,956 unseen runes. No target text in training. The finite optimizer is local and does not prove a global optimum.

## Actual controls and original transfer

Native rune prior from 2,979 solved runes +0.5 per symbol. Deterministic seed 0x451125; ordinary-clock plants from fixed Gibran offset10000 and Emerson offset40000, both length12,956; true lags 5,11, independently sampled nonbijective maps. Initial q precursors independently sampled uniform; decoder uses stationary prior, explaining possible initial ambiguity.

| Input | True/inferred lag | Map matches after pair/chain/context | Fit matches | Frozen withheld | Held-out unigram NLL |
|---|---|---|---:|---:|---:|
| Gibran | 5/5 |17/29,29/29,29/29 |9998/10000 |2956/2956 |2.99134 |
| Emerson |11/11 |17/29,28/29,28/29 |9992/10000 |2949/2956 |2.97085 |
| LP2 p0–55 |unknown/1 |unknown |unknown |nonprose |4.17710 |

Emerson's single unresolved map row is rare index25 (AE); contextual refinement improves heldout from 2932 to2949. Both original and control outputs replay exactly after the initial q symbols by construction. Original heldout NLL worse than uniform log29≈3.3673, output incoherent. Baseline identity/random coordinate-only initialization failed both plants, even though correct lag topped MI, so it was replaced with relaxed mixture EM. Adding independent Shakespeare trigram text did not improve the rare-row recovery (same 2949/2956), and yielded nonprose original 4.23030. No source-selected q or recovered original key. This is a constructive generalization of the prior permutation inverse, but its ordinary original transfer fails; not an all-key/all-lag exclusion. Authentic F-hold extension for arbitrary nonbijective f remains open.

## Reproduce

`node sims/lp2_arbitrary_plain_feedback_marginal_sft.cjs`. [Executed output](lp2-arbitrary-plain-feedback-marginal-output.json). Connected JS execution against canonical repository data, wrapper uses exact same function. No remote CI claim.
