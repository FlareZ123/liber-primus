# Source H/G quotient versus the 84 authentic p56 prime-totient key symbols

**Agent11 · 14 November 2026 · source-exact all-secret negative.** No unknown LP2 plaintext or creator key was recovered. The mathematical equality **252 = 3×84** has a historically meaningful second operand, but direct use under *any secret fixed GP29 alphabet bijection* is impossible in all twelve natural splits.

## Why this specific test

Original LP2 pp49–51 print a 256-cell base60 table. Its GP29 coefficient polynomial is divisible by the genuine source-selected degree-four factor formed from the PGP-signed 2013 BASE29 3301 worked example, **H = 3+26X+24X²**, and the original p39 red triad **G = 27+5X+15X²**. Retaining formal coefficient slots gives exactly **252 quotient GP29 elements**, high to low starting **0,12,9,28,2,25,23,21,18,28**.

The original solved p56 **AN END** is precisely **85** GP runes long. Its *historically authenticated* prime-totient encoder bypasses the one literal plaintext **F** at local rune position **56**, so exactly **84 primes are actually consumed**. The source table therefore contains three times as many quotient elements as the solved page has authentic key elements. This is a numerically motivated possible key-transfer clue, but neither original page nor the signed 2013 source instructs the 252-to-three-way partition.

## Frozen key-bearing test

Compute the actual 84 consumed p56 scalar key elements **K[i] = φ(prime[i]) mod29 = (prime[i]−1) mod29**, with i=0..83. Independently verify the complete original p56 ciphertext under this exact key and lone-F skip produces the established literal **ANEND** prefix. Divide the untouched table polynomial by H·G over GF29, checking zero remainder and the source quotient prefix. Make only twelve complete candidate source-to-key readings:

- **Three contiguous 84-cell quotient blocks** or **three deinterleaved 84-cell columns** of the 252 source elements;
- for each, **printed coefficient direction** or its **full reversal**.

Give each of these twelve readings any arbitrary unknown secret position-independent GP29 alphabet permutation, of which there are **29!**. A bijection necessarily preserves the entire equality relationship: source positions i,j carry identical values **if and only if** their proposed key positions i,j carry identical values. Count exact pairwise equality disagreements among 84 choose2=3,486 position pairs. This is a key-independent exhaustive decision on all 29! candidate maps, not a heuristic cipher/key search.

| All-secret original-source metric | Measured result |
| --- | ---: |
| Source-selected quotient slots | 252 |
| Authenticated p56 consumed key positions | 84 |
| Original three-way source layouts, including complete reversal | 12 |
| Fewest pairwise equality disagreements in 3,486 pairs | **192** |
| Greatest prefix allowing even a secret injective alphabet mapping | **10/84** |
| Original layouts compatible with all 84 historical key symbols | **0/12** |

In the best prefix case, a nonmatching source-key equality condition appears by the eleventh consumed key element. Since this is a mathematical invariant, optimizing any unknown secret GP29 alphabet cannot repair the contradiction. The source-based positive explicitly maps the genuine p56 84-key stream through an independent invertible affine alphabet and passes all **84/84** positions with **0/3,486** pair disagreements, independently validating the comparator.

## Decision

**Retire the exact interpretation “H/G quotient = three 84-rune encodings of p56's historical prime-totient key” under any fixed alphabet relabeling of one whole block or column.** The equality 252=3×84 alone does not authenticate a historical three-lane cipher; more elaborate stateful or shuffled consumers remain mathematically possible, but require a first-party source selector. This result does not contradict the established table factorization or actual p56 key. Avoid further alphabet guessing for this particular direct correspondence.

**Exact original input and fully runnable Windows-compatible CommonJS:** [sims/lp2_q252_p56_84key_allsecret_sft.cjs](../sims/lp2_q252_p56_84key_allsecret_sft.cjs). Reads only committed canonical original grid/corpus files, asserts 252/84/key prefix and actual 85-rune solved decoder, all 12 exact mismatch counts, and a complete 84/84 synthetic secret-alphabet positive. The exact committed source was executed in the JS runtime on exact source data fetched from GitHub; all assertions passed.
