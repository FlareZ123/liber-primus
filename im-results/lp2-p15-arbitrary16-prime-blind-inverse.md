# Blind permutation and prime-origin recovery without intact word boundaries

**Result:** useful constructive inverse algorithm, no unknown LP2 plaintext. This is a bounded spacing-free search, not an all-permutation theorem. It complements the exact source-spiral exclusions and the separate lexicon-conditional matching gate.

Target: original 1,883 runes p15 offset20 through p22. An arbitrary shared bijection rearranges every full consecutive 16-rune block after actual p56 transparent-F prime-minus-one encryption; final incomplete block remains untouched. Test lead0; origin initially 0, then all 0–3301. No printed word cuts are used. Train key selection on first928 ciphertext runes, leave955 for frozen-key continuation. Independent five-section native GP bigram prior: 1036 actual runes, smoothing .5 unigram and 5-count backoff. Donor: first1883 runes of other four solved source sections.

## Constructive receiver

For a fixed permutation and origin, exact Viterbi state is the cumulative F holds h and whether the previous rune held the clock. A consuming transition at i yields p=(c-K[origin+i-h]) mod29; p=0 is forbidden. Holding is permitted only for c=0. Since the previous consuming value is determined by i,h and ciphertext, two scores per h suffice. During swap annealing only, soften forbidden transitions with penalty12; final evaluation uses penalty1e6 (dominates every possible language likelihood difference). Accept only zero illegal transitions and exact forward replay. No claims based on non-replayable soft output.

Unknown origin initializer: for the first320 runes estimate previous visible-zero count z by complete block counts plus proportional current-block zeros; approximate latent F count by Binomial(z,.4), using the independent source prior. Marginalize over h to make a per-origin 16×16 unigram score matrix, find maximum-weight bijection by Hungarian assignment, then rank all3302 origins by Viterbi score on928 prefix. Anneal 500 swaps per top16 origin (seed3301), freeze the highest scoring origin/permutation, decode full original. This is an approximate initializer plus bounded optimization; the Viterbi receiver itself is exact at the chosen parameters.

## Actual native plants and original

Fixed unknown permutation (inner slot to observed column): [5,10,12,14,6,0,15,11,2,7,1,8,3,4,13,9].

| Test | True origin rank | Selected origin | Correct key slots | Whole plaintext correct | Withheld correct |
|---|---:|---:|---:|---:|---:|
| Known origin0, 4×1000 swaps | — | 0 | 16/16 | 1883/1883 | 955/955 |
| Hidden origin133 | 2 | 133 | 16/16 | 1879/1883 | 951/955 |
| Hidden origin1033 | 6 | 1034 | 16/16 | 1880/1883 | 955/955 |
| Hidden origin3301 | 4 | 3301 | 16/16 | 1881/1883 | 955/955 |

All four final plant outputs are legal and exactly replay original plant ciphertext. Near-origin ambiguity is expected because a literal-F/consuming-F interpretation can change effective initial state. Do not claim exact origin1033 recovered.

Original known origin0, 20×1500 swaps: best soft score −4.48861 nats/rune versus native −2.76205; 7 illegal transitions in928,18 in1883. Unknown-origin ranking/refinement selected origin1355, best soft score −4.46778, permutation [3,13,12,11,7,4,0,8,10,1,14,15,9,2,5,6], 6 illegal transitions in928 and12 in1883. No valid candidate; no withheld prose. This rejects only the bounded search, not all keys.

## Language-independent unrestricted permutation SAT experiment

A separate one-hot Boolean model of the same cipher at origin0/lead0 enforced the shared permutation and unary threshold state H(i,k)=h_i≥k. Transition H(i+1,k)=H(i,k) OR (literalF(i) AND H(i,k−1)); a consuming equality c=K is prohibited. Fixed plant and exact16-rune crib plant are SAT, full crib plant recovers all16 true permutation positions but only1419/1883 runes without language ranking. On actual original, 928-prefix SAT with permutation [13,12,0,2,15,14,10,3,1,11,6,7,8,4,5,9] and13 literal holds; exact replay and IoC0.03559173, fixed key dies at1071. 1280-prefix SAT with [4,3,2,6,13,0,9,12,11,1,7,14,10,15,5,8] and21 holds; IoC0.03507745, dies at1287. 1536-prefix timeout60s; full1883 timeout180s. No unconditional all-permutation exclusion is established. The SAT prefix witnesses are not plaintext candidates (nonlinguistic and fail continuation). The SAT tool was an exploratory local Python/ctypes libz3 implementation; main useful receiver is the reproducible C++ optimization.

## Reproduction

Run the source-only Node preparer with a scratch output directory; compile the two C++17 files with optimization, run from that directory containing raw.txt, donor.txt and prior.txt. Example Linux invocations used g++ -O3 -std=c++17; Windows CI is not claimed. Files:
- [source data preparer](../sims/lp2_p15_arbitrary16_prime_prepare.cjs)
- [known-origin anneal](../sims/lp2_p15_arbitrary16_prime_anneal.cpp): plant 4 1000 0; original 20 1500 0
- [unknown-origin rank and refine](../sims/lp2_p15_arbitrary16_prime_origin_rank.cpp): plant 133 320 .4 16 500, then1033/3301; original 0 320 .4 16 500
- [conditional arbitrary-permutation anchor bound](lp2-p15-arbitrary16-prime-allorigin-anchor-gate.md)
- [unconditional fixed spiral exclusion](lp2-p15-spiral-prime-fhold-allorigin-gate.md)

The C++ local experiments were executed; the published source is a transcription of those files (portable include filename and explicit return0 adjusted). No external CI claim. A potentially out-of-range previous-key index at an unreachable initial all-hold state was corrected before rerunning both known-origin results; identical outputs.

**Decision:** the recovery method is useful on planted transposition-plus-clock material, but there is no independent source support for arbitrary unknown block order. Do not expand arbitrary permutation search without fresh source selector.