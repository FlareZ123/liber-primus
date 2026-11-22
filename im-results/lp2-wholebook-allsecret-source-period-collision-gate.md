# Original LP2: all-secret repeating GP29 phase clocks through 4096

**Decision, 22 November 2026:** Original p0–55 offers **no whole-book stationary GP29 substitution period** in the finite window 6–4096 under a native-English GP-rune plaintext expectation. This removes the need to attempt 29! secret letter permutations at each of the source-visible candidate periods. **No plaintext or author-selected key was recovered.** The conclusion is conditional on the cipher using one consistent phase counter across the 12,956 unsolved runes. It does not exclude a page-local restart, a ciphertext-dependent state update, changed alphabet/transport, source-supplied one-time pad, or an untested longer period.

## Why a human would test this

The original manuscript and authenticated earlier Cicada puzzles supply several visually distinctive integer candidates for a repeating key's length: 49 (2014 7×7 square), 76 (p55 whole text and p50 outer ring), 95 (clear p57), 121 (p32 11² shape), 243 (p8 3^5), 256 (p49–51 table), 729 (opening chapter 27²), 1033 (2014 order-seven square), and 3301 (signed Cicada number). None of these numbers independently instructs a repeating substitution, but they make its necessary property test cheap and specific.

For an arbitrary *unknown secret permutation* \(\sigma_r\) of all 29 runes at every phase \(r\in[0,P)\),

```text
C[i] = sigma[i modulo P](M[i])
C[i] == C[j]  iff  M[i] == M[j]   when i modulo P == j modulo P
```

The equality invariant requires neither an English crib nor an assumed additive sign. It covers every stationary phase-specific GP29 Caesar, Vigenère, Beaufort, custom alphabet or secret per-phase bijective substitution, however high its secret entropy. It also allows the key to repeat over many printed words and page boundaries, with no punctuation/word reset. The period itself is tested before candidate key recovery.

## Full-source original computation

Input: unaltered `resources/liber-primus/lp2-corpus.json` physical p0–55, original rune count **12,956**, numeric-only p50 contributes zero. Empirical native-GP control: original clear LP1 physical p5, p10–13 and p15 plus literal LP2 p57, **1,096 native plaintext GP runes**. Their unequal-index pair-equality rate is **0.0596790321**, against original unsolved ciphertext empirical marginal equality **0.0344783979**. This is an empirical English-source control, not a universal statement about every possible plaintext language.

The first independent [whole-phase all-secret SFT](../sims/lp2_periodic_source_phase_allsecret_collision_sft.cjs) calculates **every unordered pair sharing the same phase**, rather than decrypting or fitting any key. It preselects the nine named source-visible periods and compares the source's equality rate with 120 independently seeded GP-native unigram-sampled 12,956-rune series. The original rate at every period is 0.03326–0.03475 versus simulated native controls approximately 0.0604–0.0606. **All 1,080 period × simulation comparators** exceed their original counterpart. The finite plus-one left-tail p at each source period is **1/121 = 0.00826446**; it is a simulation resolution bound, not a proven false-cipher probability.

| Clock period | Exact original equal/pairs | Original fraction | Native simulation mean |
|---:|---:|---:|---:|
| 49 | 58,934 / 1,706,364 | .03453777 | .06053902 |
| 76 | 37,692 / 1,097,860 | .03433225 | .06063033 |
| 95 | 30,321 / 876,996 | .03457370 | .06049871 |
| 121 | 23,688 / 687,154 | .03447262 | .06055874 |
| 243 | 11,547 / 338,935 | .03406848 | .06051772 |
| 256 | 11,168 / 321,400 | .03474798 | .06040619 |
| 729 | 3,646 / 108,715 | .03353723 | .06040917 |
| 1033 | 2,547 / 74,898 | .03400625 | .06046724 |
| 3301 | 634 / 19,062 | .03325989 | .06043175 |

A mathematically exact planted cipher independently supplies **729 arbitrary 29-symbol secret permutations**, encrypting a native-source GP rune generator in a 12,956-symbol message. Its phase-invariant coincidence is **0.06261325**, and the original plaintext and secret-ciphertext collision counts match exactly as required. The test can detect an eligible cipher.

The second [whole-period blind scan SFT](../sims/lp2_allsecret_phase_period_lagscan_sft.cjs) considers **all 4,091 periods from 6 to 4,096**, using only rune equality at lag P (the simplest consequence of the same necessary property), **before comparing the original to 32 complete uniform-position-shuffled original-ciphertext controls**. The most favorable original lag is **2039**, standardized excess **z=3.54598** over the exact original unigram rate, with **familywise plus-one p=0.666667** among the 32 shuffle maxima. The source-visible 49,76,95,121,243,256,729,1033,3301 lag standardized excesses are respectively **−0.435, −2.515, −1.181, +0.603, −1.085, −0.140, −0.672, +0.548, −0.384**. No single candidate yields native-text-like equality, and none rises above a familywise random search control. The separate positive 729-period planted secret phase cipher gives lag729 **755 equal** vs random-source expectation **421.57**, **z=16.527**, and its 729 exact equalities are verified against its unencrypted source.

Both SFTs run on **Windows Node22** and reproduce all original counts and positive controls: [full-phase PASS 45005390494](https://github.com/FlareZ123/liber-primus/actions/runs/45005390494) and [scan PASS 45005630468](https://github.com/FlareZ123/liber-primus/actions/runs/45005630468). All random control seeds, run counts, and exact source paths are committed in the SFTs.

## Research consequence and limitations

A 256-symbol grid key repeated throughout the manuscript, a 729-phase opening key reused globally, or a 3301-phase source-number key under a stationary secret GP29 alphabet would preserve enough equal plaintext letters for this source-conditioned experiment to detect. These specific whole-book stationary architectures are strongly inconsistent with the observed original signal. The result also generalizes to unrestricted, **unknown arbitrary** phase-specific secret alphabets, which direct additive-key scans do not cover.

The huge absolute difference from native controls also means the result is less surprising after earlier reports established the original unsolved book's unusually flat rune distribution. It is useful as a **finite all-secret key-family exclusion** and should be treated as supporting negative evidence, not a new cipher mechanism or independent proof of an intended key length. No decoded unknown word was inferred from phase coincidences. Continue only with a first-party operation or state rule that **changes dynamically with ciphertext, chapter, punctuation or another authenticated external key source**, and demands independently transferable plaintext; do not retune a fixed whole-book secret-period substitution from these source numbers.
