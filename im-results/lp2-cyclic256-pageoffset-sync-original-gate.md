# LP2: source-independent 256-position key reuse with arbitrary page offsets

**17 November 2026, Agent38. Classification: two completed original-cipher inversion experiments with positive controls.** Neither finds unknown LP2 plaintext or an authenticated key.

## Creator-visible premise and two complete decoder families

The original numeric display on physical p49–51 contains **256 cells** (32 rows × 8). Such a table could plausibly form a key tape, and a human solver might allow a new starting cell at each physical page. The source does **not** instruct solvers to cycle modulo256, repeat the table on each page, or interpret its symbols as 29-rune alphabets. These tests ask a narrower, answerable question: whether the original corpus reveals reusable key state across 55 pages even with a free page-local starting phase.

For every unknown physical page p and GP29 rune offset j, permit **55 secret and unrestricted offsets** o[p] in {0,…,255}. At state s=(j+o[p]) mod256 test:

1. **Fully secret additive pad:** C[p,j] = P[p,j] + K[s] (mod29), where all 256 key symbols K[s] are unrestricted.
2. **Fully secret nonlinear alphabet:** C[p,j] = sigma[s](P[p,j]), where each of 256 states has its **own unrestricted permutation of all 29 runes**, granting (29!)^256 distinct secret alphabets.

Both are mathematically reversible for a known key and cover a page-offset ambiguity absent from the earlier [same-start all-secret equality gate](lp2-pageoffset-allsecret-reuse-gate.md) and [same-start additive many-time-pad gate](lp2-reused-pagepad-manytime-original-gate.md). The [direction-based 256-state study](lp2-pdir-cyclic256-allsecret-capacity-original-gate.md) fixes an entirely different word-derived state clock. These two new tests do not modify that separate ongoing pointer-direction campaign.

## Attack design: eliminate all secret key values

At two page positions that share state s, the additive model has an **exact difference invariant**: C[p,j]−C[q,k] = P[p,j]−P[q,k] (mod29). A human or program can detect reused phase without guessing K. The reference GP29 unigram law q is derived from **3,568 source-encoded solved LP1 runes plus 95 genuinely clear p57 runes** with pseudocount 0.5. Its native difference law has KL divergence from uniform **0.022701219984236028 nats/rune**. Each possible relative phase is scored using this complete 29-way likelihood.

For **any arbitrary nonlinear alphabet**, aligned ciphertext equality is equivalent to aligned plaintext equality. This second model uses the exact per-comparison **Bernoulli log-likelihood ratio** between the GP29-native equality probability qSame = **0.06048364921452177** and the independent uniform-rune null probability 1/29. It assigns a negative contribution for every *unequal* aligned rune pair. That corrects for unequal numbers of overlapping positions at different phase shifts and avoids misleading raw equality counts.

Both attacks enumerate **all 256 relative phase choices for each of 1,485 pairs of 55 physical source pages**, with exact modulo256 handling for pages longer than 256 runes. They then optimize all 55 page phases by coordinate ascent with eight deterministic starts (20 passes each) for original and shuffled controls. Their independent positive uses ten starts (24 passes). Every test reads **12,956 original ciphertext runes** and native original page lengths; physical p50 has no runes. Each null control independently permutes original runes within each physical page, preserving exactly the rune multiset, page length and page identity, while disrupting adjacency and word-order structure.

## Source-corpus results

| Secret key architecture / same decoder run | Planted secret-key positive | Original LP2 | Source-shuffled no-reuse control |
| --- | ---: | ---: | ---: |
| Secret 256-symbol additive pad, 29-way difference log-likelihood ratio | **+7,579.6677** | **−3,659.8838** | **−3,606.7764** |
| **256 unrelated secret 29-way alphabet permutations**, equality log-likelihood ratio | **+2,709.8487** | **−742.4945** | **−729.9347** |

The additive positive uses random secret K and 55 random phases. The nonlinear positive uses **256 independently uniformly shuffled 29-way alphabets**, independently random 55 phases and source-q-sampled GP29 plaintext. **Both positives recover all 55/55 relative starting phases exactly, up to one unavoidable common rotation.** Thus the attacks genuinely exploit strong reused secret key state without knowing the key, including fully arbitrary nonadditive substitutions.

On original LP2 the optimized scores remain **below zero and close to their matched shuffled no-reuse controls**, far from either positive. The lack of a transferable positive signal disfavors these two genuinely complete, unrestricted secret-key architectures as direct receivers for ordinary native GP29 text. It recovers **no original plaintext, table interpretation or key**.

## What the conclusion does and does not establish

The same source-visible 256-cell object could still generate one-time state per page, a key pointer selected by word values, a feedback-dependent transducer, inserted runes, altered punctuation semantics, homophonic symbols, compressed binary intermediate text or an external key. The fitted phase search is coordinate ascent with planted positive power, **not a global optimum certificate over 256^55 possible offset assignments**. Native prose frequency is a hypothesis, and within-page shuffle does not reproduce the original anti-adjacent cipher process. The record rejects the two complete original-input candidate inverses, not every conceivable use of 256 numbers.

For future original-cipher work, a real gain would be a first-party key/state transition selecting an explicit decoder. The artificial 256-state key reuse itself is not a clue authentication.

## Exact reproduction

The [single read-only Node22 CommonJS SFT](../sims/lp2_cyclic256_pageoffset_sync_sft.cjs) loads canonical source pages and preserved LP1 plaintext, computes both conditional likelihoods, simulates independent true-key/offset positives, and executes the same optimizer on untouched original source and shuffled nulls. It asserts complete planted offset recovery, and has no external dependencies or file writes. Run through the existing manual [Windows read-only SFT workflow](../.github/workflows/manual-readonly-commonjs-sft.yml) with input script sims/lp2_cyclic256_pageoffset_sync_sft.cjs. Both independent cipher-family tests passed together in the actual [Windows Node22 run 44204599172](https://github.com/FlareZ123/liber-primus/actions/runs/44204599172) at commit 2adfb8b, including all 55/55 nonlinear and additive planted phase recoveries. The earlier additive-only version separately passed [run 44203052623](https://github.com/FlareZ123/liber-primus/actions/runs/44203052623).
