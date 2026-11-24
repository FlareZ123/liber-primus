# Plaintext-weighted, nonperiodic prime-index clock: exact inverse and original test

## Decision

The historical p56 cipher is extended without changing its shift law or transparent-F convention. The state is a zero-based prime ordinal j. For a non-F plaintext rune p, encode C=(p+prime[j]-1) mod29, then advance j by g(p). For F, output zero and retain j. The four frozen rules g are 1, p+1, the GP prime value of p, and that value minus one (its totient). This differs from periodic weighted-key advancement: the indexed sequence is the actual nonperiodic prime sequence. The authentic LP1 statements about primes, totients, and words/numbers, and the p15 prime-ordinal graphic motivate testing these particular rules, but do not select one as the historical unknown-page mechanism.

The decoder admits every initial ordinal 0..463 (through the 464th prime), every legal transparent F branch, and no assumed printed word boundaries. It propagates the exact set of reachable ordinals. For C=0 retain j as a possible F; for any C compute p=(C-(prime[j]-1)) mod29, and admit the consuming transition only if p!=0. Coalescing equal j loses no future legal continuation. For ranking, retain the best trigram score per (j,previous two plaintext symbols), with a language model trained exclusively on seven native solved LP1 sections. Fit a prefix and freeze its highest-ranked complete state before scoring the disjoint suffix. No key or text is inferred from a successful round trip alone.

## Actual original ciphertext results

| rule | p0–2 (729) | p40–53 (3008) | p54–55 (308) |
|---|---:|---:|---:|
| unit | 565 | 628 | 308 |
| ordinal | 241 | 114 | 153 |
| GP prime | 322 | 119 | 308 |
| GP totient | 560 | 250 | 141 |

Numbers are exact maximum legal prefix lengths across all 464 initial ordinals and all F histories. No family reaches a full opening or p40–53 chapter; the latter does not reach the frozen 1500-rune training cutoff. The opening unit and totient prefix fits have scores -4.8128 and -5.0264 nats/rune and die in the held-out portion at zero-based offsets375 and386.

On the terminal chapter, only unit and GP prime have full legal paths. Exact path counting gives three unit histories across origins 167/168, all coalescing at terminal ordinal472; eight GP-prime histories across origins 357,373,405,413,423,429,441,443, coalescing at ordinal16450. The best complete-path scores are -5.23048 and -5.04580 nats/rune respectively. The prime model's frozen seed423 prefix (154 runes) scores -4.99843, its 154-rune withheld continuation -5.09318, and it replays all308 original ciphertext symbols. Its first withheld transliteration is AETHAEADTHNGTHTCEAMJNGOENGYIEBNCWUIACMOEBOEGXWEAOERNEOLPFAETHEANGPCCOGYCAAUPBPTHCSPWEOBUGEASWIABJWRNPIEOEYTHADGEOIHPJEAWFIANGAESEAJ; no credible plaintext. This full legal-path enumeration closes the temptation to interpret a surviving terminal ordinal as a unique key.

## Controls

| Control | True / selected origin | Prefix correct | Withheld correct | Forward replay |
|---|---|---:|---:|---|
| Authentic p56 unit | 0 / 0 | 60/60 | 25/25 | exact |
| p57 ordinal plant | 73 / 85 | 69/70 | 25/25 | exact |
| p57 prime plant | 73 / 73 | 70/70 | 25/25 | exact |
| p57 totient plant | 73 / 73 | 67/70 | 2/25 | exact |

Authentic p56 is a direct encryption control, and p57 is held out of the language-model training. The ordinal plant demonstrates origin coalescence/ambiguity; the totient plant demonstrates that local prefix ranking is not reliable for a highly dynamic clock. Neither weakness affects the exact reachability exclusions. The GP-prime model recovers the complete actual plant and seed from its prefix and independent withheld continuation. Its native withheld score -1.98786 contrasts with the original terminal score -5.09318.

## Scope and reproduction

Execute [SFT](../sims/lp2_plaintext_weighted_prime_index_clock_sft.cjs) with Node (no dependencies) from the repository. Inputs are the canonical LP2 corpus and native solved reference; computation was executed in connected V8. No independent CI run is claimed. The result eliminates these explicit uninterrupted local-chapter clock rules and origin range where the legal path set is empty. The terminal survivor has no linguistic evidence. Other advances, independently selected larger origins, different state resets, transposition and alternate representations remain possible. No unknown plaintext or authenticated key recovered.
