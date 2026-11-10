# Arbitrary outer rune alphabets with a drifting key pointer

**Status (Agent 9, 10 November 2026): demonstrated attack component and calibrated synthetic recovery. No Liber Primus plaintext or key has been recovered.** This exploratory work belongs in `im-results/`; it does not establish LP2's actual encryption mechanism.

## Mechanism and exact optimization

Consider a 29-rune ciphertext of the form `C_i = sigma((P_i + K_{j(i)}) mod 29)`, where `sigma` is any unknown permutation of the 29 rune symbols and `j(i)` is the key draw that produced observed ciphertext rune `i`. If the key positions are known and a plaintext unigram probability `q_i(p)` is available, the log likelihood for each hypothesized inverse cipher label `g(c) = sigma^-1(c)` is

```
score(g) = SUM_i log q_i((g(C_i) - K_{j(i)}) mod 29).
W[c,t] = SUM_{i:C_i=c} log q_i((t - K_{j(i)}) mod 29).
maximize SUM_c W[c,g(c)] subject to g being a permutation.
```

That is an **exact maximum-weight 29 x 29 bipartite assignment**, solved by the Hungarian algorithm in `O(29N + 29^3)`. It optimizes over **all 29! outer permutations**. The optimality theorem applies to this conditional unigram likelihood and a known key-position assignment, not to a joint search over unknown keys, skips, word grammar or cipher families.

`sims/outer_permutation_assignment.cjs` implements the assignment and independent regression tests. `sims/outer_permutation_word_context.cjs` conditions `q_i` on the preserved word length and the position of each rune in its word. The synthetic English-to-GP encoder is a documented approximation, calibrated using 193,920 separate Shakespeare rune symbols, not a claim about the missing LP2 text.

## Why the skip alignment matters

Under a proposed soft anti-doublet filter, a repeated ciphertext candidate may be rejected and an extra key draw consumed without advancing plaintext. An incorrectly aligned key silently collapses the alphabet-recovery signal. A 3,000-symbol filtered plant incurred 95 extra key draws; fitting a fixed `j(i)=i` recovered **0/29** correct rune labels, while supplying the exact draw positions recovered **29/29**. The analogous 1,500-rune word-conditioned plant recovered 29/29 with known alignment, but only 2/29 without alignment.

A strict one-retry Viterbi algorithm for **known** outer alphabet in `sims/outer_permutation_alignment.cjs` tests the deterministic condition `g(C_(i-1))-g(C_i) = K_(j-1)-K_j (mod 29)` at a rejected draw, and scores plaintext rune likelihoods along each path. On a 1,200-symbol filtered plant, the known-alphabet Viterbi inferred the correct key position at 1,114 positions, with the correct final key-pointer drift of 24. The result is a maximum-likelihood path for the specified model, not a decoding of LP2.

`sims/outer_permutation_context_alignment.cjs` alternates a word-conditioned Hungarian alphabet fit and a skip-aware Viterbi path. Its first illustrative plant had no skips until output position 220. Starting from only a 60-rune prefix, the initial alphabet fit recovered 13/29 labels; one alternating update recovered 29/29 and the same 1,114 aligned positions as the known-alphabet oracle. The unusually late first skip makes this particular plant favorable.

The **50-independent-plant** study in `sims/outer_permutation_context_power.cjs` used fresh random hidden alphabets and independent mod-29 key streams, the same 81% collision rejection, widths 60/100/160/300, and up to five alternating optimization updates. The initial prefix-only algorithm recovered the complete 29-symbol alphabet in **26/50** trials; the true pad outscored one independently drawn wrong pad in **41/50** trials, and median correct key-position alignment was **89.58%** (CI [42744668097](https://github.com/FlareZ123/liber-primus/actions/runs/42744668097)).

The improved algorithm enumerated the location of **one early rejected draw** at positions 1 through W-1 for prefixes W=60 or 100; it retained up to four distinct top-ranked alphabet assignments alongside the no-skip candidate and then ran the same alternating solver. This increased full-alphabet recovery to **37/50**, with the true pad ahead of one matched wrong pad in **47/50** trials; median key-position accuracy increased to **98.42%** and median true-minus-wrong score margin was **+2,367.83 log units** (CI [42745114710](https://github.com/FlareZ123/liber-primus/actions/runs/42745114710)). This is a useful measured improvement, though **13/50** planted keys still escaped complete alphabet recovery. The experiment compares each true key with just one independently sampled wrong key and **cannot** establish a family-wise detection threshold over thousands or millions of candidate secrets.

Reproduction: [`sims/test_outer_permutation.cjs`](../sims/test_outer_permutation.cjs), [`sims/outer_permutation_context_power.cjs`](../sims/outer_permutation_context_power.cjs), and opt-in [`outer-permutation.yml`](../.github/workflows/outer-permutation.yml). Synthetic tests use fixed public seeds and report all parameters. The planted tests validate a hypothetical English-like GP plaintext and one particular collision filter; they do not imply those assumptions hold for LP2.

## Actual LP2 input and bounded candidate scan

`sims/outer_permutation_sha_probe.cjs` parsed **12,956 runes** and **2,896 word units** from the shared LP2 transcription and tested 27 historically motivated password phrases under SHA256(seed||counter_BE) and SHA256(counter_LE||seed), both key signs, with an arbitrary learned outer alphabet. It examined the first 200 and 350 runes and compared each best-of-108 candidate with 4,000 randomized wrong-key scores.

- Window 200: best `2014-01-05`/suffix-BE/sign+, score -676.17; 90/4,000 nulls scored at least as high (raw tail p=0.0227, Bonferroni bound 1).
- Window 350: best `THE WORDS ARE THE MAP`/suffix-BE/sign-, score -1323.40; 60/4,000 nulls scored at least as high (raw p=0.01525, Bonferroni bound 1).

**Neither is a candidate key or decryption.** Crucially, the 350-rune plant with a genuine SHA key and 81% rejection-sampled extra key draws scored **p=0.467** against 1,000 wrong SHA keys, with only three correct rune labels. Thus this direct candidate screen has insufficient sensitivity to rule out skip-based cipher mechanisms. Its well-powered scope is narrower: with zero extra draws the same 350-rune plant recovered 29/29 symbols, beating all 1,000 wrong keys (p<0.001); rewriting ten repeat collisions *without consuming extra key draws* also recovered 29/29 and beat all 1,000 wrong keys (p<0.001). Actual LP2 supplied no signal for those bounded, aligned-key alternatives.

### Joint skip-and-alphabet scan on the real manuscript

The strengthened [`sims/outer_permutation_real_skip_scan.cjs`](../sims/outer_permutation_real_skip_scan.cjs) searched the first **1,200 genuine LP2 runes**. For each of the same 108 named-seed, digest-layout and sign combinations, it maximized over arbitrary outer rune permutations, 12 prefix-width and initial-skip-hypothesis groups, and up to five word-contextual Hungarian/Viterbi updates. The key remained one continuous SHA-256 counter-mode stream beginning at offset zero, with at most one rejected key draw per output rune in the strict filter. It then ran **250 independent random SHA counter seeds through the same full search**, so control scores include the benefit of alphabet and skip fitting.

The best named option was `THE KEY IS ALL AROUND YOU` with suffix-BE counter and positive sign: log score **-5284.147**, first-skip hypothesis at output position 3, inferred final drift 13. The random-key control median was **-5382.025**, and the **random maximum was -5279.289**, higher than the best named candidate. **Three of 250 controls** scored at least as high, giving the prespecified corrected empirical raw upper-tail **p=(3+1)/(250+1)=0.01594 per selected comparison**. The nominal Bonferroni bound over 108 named variants is **1**. The next-best `CICADA` candidate scored -5285.733. None constitutes credible plaintext or a recovered key.

A successful workflow is [run 42745382206](https://github.com/FlareZ123/liber-primus/actions/runs/42745382206). A null result over these 108 strings and two hash layouts is evidence only about this bounded construction and tested candidate list; it is **not** a general exclusion of SHA-256 keystreams, arbitrary alphabets or all key-skip processes.

## What would materially advance decryption

The next hard problem is to optimize the unknown outer map and key-pointer path when **multiple skips occur before the first informative prefix**. Searches over two early skips, marginalizing over skip paths rather than choosing a single Viterbi path, and stronger context-dependent language likelihoods are concrete next directions. Before claiming a real-key hit, use a matched null for the full multi-hypothesis search, recover legible plaintext, and verify an unchanged key and alphabet on held-out pages. A valid breakthrough needs independent recovery across material not used for key or alphabet selection.

Agent 20 independently developed an exact phase-marginalized HMM for mod-29 arithmetic-ramp keys ([`sims/skip_phase_hmm.cjs`](../sims/skip_phase_hmm.cjs)). We coordinated to keep arbitrary **outer ciphertext alphabet** search distinct from arbitrary **key-state schedule** search. Both can benefit from position-conditioned language priors, and neither currently decodes the actual LP2 manuscript.
