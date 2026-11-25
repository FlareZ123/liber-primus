# Prime-gap lookup and p56-constrained gap corrections: exact original-cipher gates and bounded inverse

Agent43, 25 November 2026. No authentic unknown plaintext/key.

## Hypotheses and exact results

Let p[j] be the j-th prime, zero-based, and g[j]=p[j+1]-p[j] the full integer next-gap, not mod29. Two distinct models:

1. Ordinary additive key K[j]=f(g[j]) for **every arbitrary secret function f** and origin 0..3301, no Fehu hold. On 12,956 original runes, partition ciphertext by its gap class. In each class the maximum possible count of any fixed output rune equals the largest ciphertext-bin count, regardless of the additive shift. Summing and maximizing all origins gives exact global E ceiling **685** (origin426). This also covers arbitrary per-gap bijections. All 562,060 contiguous same-length encoded Emerson/Gibran/Shakespeare reference windows require E≥1408 (individual minima1491/1416/1408; counts308372/49537/204151). Thus the model is inconsistent with all these native-register donor windows; not a proof against every possible prose.

2. The more source-bound shared lookup K[j]=p[j]-1+f(g[j]) mod29 with native transparent plaintext F. Authentic p56 replays all85 runes and consumes84 primes; it fixes f=0 on gaps1,2,4,6,8,10,12,14. Every affine per-gap map of p[j]-1 is similarly fixed to identity on these gaps except gap1 with its single observed residue; gap1 occurs only once. Grant independent completely arbitrary shifts at every other gap occurrence (a strict relaxation of all shared unknown corrections and all shared per-gap affine maps). Exact bitset cursor reachability, starting simultaneously from all 3302 permitted origins, yields:

| Scope | Total runes | Max legal prefix |
|---|---:|---:|
| p0–55 continuous |12956|1008|
| p0–2 |729|729|
| p3–7 |1145|828|
| p8–14 |1729|793|
| p15–22 |1903|868|
| p23–26 |1021|978|
| p27–32 |1433|664|
| p33–39 |1680|594|
| p40–53 |3008|1009|
| p54–55 |308|308|

The common p56-calibrated additive and affine families are therefore excluded for full-book and seven chapter-local continuous clocks even with free unknown-gap shifts; only opening and terminal chapters survive this relaxation. A distinct arbitrary per-gap permutation relaxation fixes only residue pairs seen on p56 and grants all other transitions free; it **survives** all scopes and is not excluded by this theorem.

## Constructive inference on remaining two scopes

For the additive corrections only, enumerate every development-feasible origin and all visible-zero hold/consume masks with a backward cursor-DAG prune and exact per-gap nonzero-plaintext domains. Use first p0–1 (528) or p54 (232) as training; select top256 masks/origins by exact separable unigram maximization, then bounded trigram coordinate ascent (3 restarts, ≤12 sweeps) over the unknown gap corrections. Freeze origin, endpoint, correction map and final plaintext context. Unobserved gap corrections default to zero and are counted if encountered in holdout. Exact fixed-key Viterbi holdout has no key fitting. Trigram model uses Emerson only. This is a bounded language receiver, not exact maximum over all keys.

| Original | Complete fit paths | Nominated paths | Best fit nats/rune | Heldout |
|---|---:|---:|---:|---|
| p0–1 → p2 |128156|256|−5.252113|No legal continuation|
| p54 → p55 |46|46|−5.148911|No legal continuation|

Both prefix readouts are nonprose. On two distinct native GP29 controls from LP1, the hidden gap correction function is arbitrary on uncalibrated gaps (planted as 7g+13 mod29; not supplied to the inverse). Both true origins167/987 are recovered from 91,621 and11,003 fit paths; 229/232 and523/528 training runes, 72/76 and201/201 withheld runes recovered. Two heldout occurrences in the short plant use unseen gaps; the correct seen-secret entries are4/7 and9/11. Thus the receiver does not fully recover all planted keys, even though it discriminates the two planted texts from original. No all-key negative is claimed on the two surviving scopes.

**Decision:** retire ordinary gap-indexed static bijections for the tested full-book donor register; retire common p56-calibrated additive/affine corrections for continuous full-book and seven chapter scopes. The bounded additive lookup inference on the remaining two scopes is negative; do not call their entire key space excluded. No source instruction independently selects a gap-dependent correction. Avoid further fitting on these prefixes unless a new source fixes unknown gap entries or a distinct validated mechanism.

[SFT](../sims/lp2_p56_calibrated_prime_gap_lookup_sft.cjs). Core exact and bounded receiver computations executed in V8 on pinned repository inputs; no Node/CI run claimed.
