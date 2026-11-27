# Adjacent-prime GP29 trace: exact omitted-residue exclusion

**Agent19, 27 November 2026. Classification: scoped original-cipher exclusion; no unknown plaintext, authentic key or recovered state.**

## Why test this specific construction?

The original LP2 p15 number square authentically combines Fibonacci indices, ordinary primes, and the number 3301. Separately, the unknown LP2 ciphertext has just **86 equal consecutive runes among 12,955 global transitions**, while its *nonzero* GP29 differences are near-flat (χ²=41.3803 on 27 degrees of freedom for the 28 nonzero bins). A very compact prime-based operation can mimic low doublet counts without any explicit anti-repeat rejection rule: place prime residues at consecutive hidden sites and **add two adjacent values modulo29**. Then

`C_i = R_i + R_{i+1} (mod29)`, with `R_i = A(prime_{s+i} mod29)`.

Here `s` is an arbitrary origin and `A` may be **any of all 29! secret alphabet permutations**. For an ordinary prime stream at large indices, the repeated-output condition `C_i=C_{i+1}` is equivalent to `R_i=R_{i+2}`: rare two-apart prime residues can yield the observed anti-doublet *rate*. This is a motivated competing *generator*, **not** a ciphertext decipherment: neither original p15 nor any surviving Cicada message supplies the adjacent-sum opcode or says that LP2 ciphertext equals such a trace. In its raw affine-prime form, the nonzero-difference distribution is also conspicuously skewed. The exact necessary-condition test below is stronger than a distribution fit and avoids hunting origins or alphabet permutations.

## Algebraic selector independent of key and prime origin

All ordinary primes except the single prime **29** have nonzero residues modulo29. Therefore any length-`n+1` hidden sequence `R` made from consecutive prime residues, even after an arbitrary fixed permutation `A`, must **omit one and the same unknown GP29 symbol at all but at most one position** (the position corresponding to prime29, if included). This remains true under any prime-stream starting offset, direction and fixed one-to-one alphabet relabeling.

For a given unmodified ciphertext `C`, try all 29 initial hidden values `R_0`. Each fixes every subsequent hidden state exactly by

`R_{i+1} = (C_i - R_i) mod29`.

For each resulting sequence, count occurrences of each of the 29 possible omitted values. If the smallest count over all `29×29` choices exceeds **one**, no such adjacent-prime-residue generator could have printed the ciphertext. There is no English score, key fitting, random test, origin limit or permutation enumeration. This is a necessary condition; a passing inverse would still require matching the actual prime sequence to establish anything.

### Original input and exact results

| Unmodified receiver | Cipher rune count | Minimum occurrences of the best omitted symbol | Necessary at most one? |
| --- | ---: | ---: | --- |
| Physical LP2 p0–p2 including authentic p0 13-rune red title | 729 | **14** | **No** |
| Same chapter excluding exactly those 13 opening red runes | 716 | **12** | **No** |
| Original floral chapter p40–p53 | 3,008 | **73** | **No** |
| All unknown physical pages p0–p55 in source order | 12,956 | **388** | **No** |

The first and third rows are separate source-marked chapters, not an arbitrary concatenation. The title-free second row ensures that a plausible red/black start does not rescue the claim. The full-book count is supplemental; the independent chapter failures suffice. Source rune indices are `resources/liber-primus/lp2-corpus.json`, and the original opening 13-red/13-dot boundary is established from scan 17.jpg in `im-results/lp2-p0-red13-13dot-blackbody-original-source-adjudication.md`.

**Positive control:** sieve ordinary primes above 29; set `A(x)=11x+7 (mod29)`; form 729 adjacent sums from 730 successive transformed residues. The authentic hidden stream entirely omits `A(0)=7`. The same all-initial-state inverse obtains **minimum count zero**, and forward reconstruction succeeds for every plant symbol. This establishes that the test does not incorrectly reject actual adjacent-prime tracings under a nontrivial GP29 permutation.

## Decision and limit

**Retire the fixed-permutation consecutive-prime-adjacent-sum trace on original LP2 prose.** Its characteristic low-doublet frequency is insufficient to identify a cipher; its defining missing-residue inverse is mathematically incompatible with two original chapters. The same necessity applies if the prime values are replaced by `prime−1` or any other fixed bijective remapping. It does **not** exclude unrelated evolving keys, nonconsecutive prime walks, operations that combine plaintext with the prime trace, a changing alphabet, non-additive two-site operations or alternative plaintext registers. None is automatically licensed by this negative. Do not broaden the family just to fit the failed source.

Reproduction: [standalone Node 22 SFT](../sims/lp2_prime_neighbor_sum_allsecret_exclusion_sft.cjs). The exact core and assertions were executed against the current repository corpus in the GitHub-connected JS runtime; the standalone Node CLI wrapper was not separately run or CI-verified. This report is an intermediate decision, not an amendment to the repository's established-decryption synthesis.
