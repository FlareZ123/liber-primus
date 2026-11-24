# Prime-totient / move-to-front composed cipher: exact initial-alphabet recovery

**Agent19, 24 November 2026. Original-input cryptanalytic attack; no unknown plaintext or authentic key recovered.** Three full-size native positive plants recover an unrestricted nonlinear initial alphabet exactly, then all 12,956 plaintext runes. The corresponding best-fit LP2 inverses remain near-uniform. A key-independent assignment bound rejects the shared-alphabet architecture and the independently chapter-private variant against the declared native controls. This is not an authenticated Cicada cipher.

## Why this concrete model

Solved physical p56 authentically uses consecutive ordinary primes minus one as GP29 additive shifts (with a clear-F special case); the code reproduces all 85 source runes using that exact special case. The historical 2014 Stage08 bzip2 association motivates standard MTF as a distinct changing-state mechanism, as previously noted in [the 2015 prime-difference MTF study](lp2-2015-primeD-gp29-mtf-original-gate.md). That earlier experiment tested a different intermediate register, not this composition. No first-party instruction selects MTF as an LP2 layer. The new model is a deliberately limited **all-consuming** p56-like prime schedule combined with rank emission, without fitting an unknown F mask. It does not assert that p56 itself uses MTF.

Let k_i=(prime[i]-1) mod29, with prime[0]=2. Reset the prime clock and MTF list together either at book start, the nine physical chapter starts (0,3,8,15,23,28,33,40,54), or all physical page starts. Runeless p50 consumes nothing.

**A:** first shift plaintext P_i to S_i=P_i+k_i mod29, then MTF-encode S_i as a rank in the private initial GP29 permutation. **B:** MTF-encode P_i, then add k_i to that rank modulo29. Both are fully invertible. These two orders are not equivalent.

## Exact attack on A (not a key sweep)

Decode the original rank stream by ordinary MTF with identity initial list. The resulting abstract labels a_i are independent of the actual initial list. If pi maps initial labels to GP symbols, then P_i=pi(a_i)-k_i mod29. Every key is a 29-permutation.

For any fixed target plaintext letter t, form W[a,x] as the count of original positions with a_i=a and x=(t+k_i) mod29. Maximizing the possible occurrence count of t over every one of 29! keys is exactly a maximum-weight perfect assignment. Changing t just cyclically permutes columns, so the same exact bound applies to **every** output letter. For common keys across resets, combine the weights before solving; for entirely private reset keys, solve separately and sum. The same Hungarian solver with log native-letter frequency weights gives the globally optimal unigram key for the chosen training span. This is an actual recoverable-key attack, not sampled alphabets.

Training uses the original p0–39 positions (9,640 runes), untouched p40–53 (3,008) for holdout, and p54–55 for the remainder. Native log frequency prior comes from the checked-in solved LP1 reference only, excluding p56–57. Three full-length Gibran native-GP windows (source offsets 0, 10000, 25000 after the fixed author-text slice) have E counts 1520,1459,1497 and IoCs .06025925,.05972136,.06009170. The independently solved p57 reference exactly encodes its authentic 95 rune source.

## Original decision

| Reset clock | Fitted A full IoC | Fitted A held-out IoC | A any-rune max, common alphabet | A any-rune max, private reset alphabets | B any-rune max, private reset alphabets |
|---|---:|---:|---:|---:|---:|
| Book | .03469123 | .03461604 | 656 | 656 | 499 |
| Nine chapters | .03467496 | .03463638 | 663 | 1147 | 589 |
| Physical pages | .03473533 | .03439138 | 692 | 2528 | 787 |

The held-out A ceilings with even a separately optimized common alphabet are 218,211,218 occurrences of **any** rune versus native controls' E counts 326,334,354. The corresponding full-book common-A IoC ceilings are .05007890/.05044974/.05276652 by concentrating the maximum allowed mass into as few rune bins as possible. B's common-alphabet complete IoCs are .03448300/.03448305/.03447573; any common initial list only relabels its abstract output. Private B lists still cannot exceed the displayed global maximum frequency because each segment's histogram is invariant up to relabeling.

All original fitted inverses and literal B inverse outputs replay every original rune. No grammatical unknown prose appears. For the common-key A attack, independently plant the 12,956-rune Gibran offset-10000 native window under the nonlinear initial permutation (7i+3 mod29, entries 0 and 9 swapped). In all three reset regimes, fitting on p0–39 alone recovers **29/29 key entries and 12,956/12,956 plaintext runes**, including the untouched holdout. B's abstract-label permutation equivalence is likewise verified on the native plant in all three regimes. A 3x3 exhaustive assignment control also passes. All computation ran on exact repository input in the JavaScript tool runtime; no Windows CI run is claimed.

**Scope:** common-alphabet A and chapter-private A fail the necessary maximum-frequency condition for these particular ordinary native English controls; private-page A is not excluded by this bound. B is similarly incompatible even with private page alphabets. No universal English theorem or authentic MTF selector is claimed. The actual p56 clear-F clock is not included in these composed original inversions. Do not tune new prime phases or F masks absent an independent source clue.

## Reproduction

`node sims/lp2_prime_totient_mtf_assignment_original_sft.cjs` — Node22 CommonJS, no dependencies. Outputs all fitted alphabets, native controls, complete original/plant replay checks and per-segment private-key bounds. [Source](../sims/lp2_prime_totient_mtf_assignment_original_sft.cjs).
