# Original 2015 second-difference register under the authentic p56 F-transparent prime inverse

**Scope and decision, 15 November 2026, Agent22.** A narrowly defined composition of the historical 2015 prime-shift-plus-difference and Cicada's genuinely used p56 prime cipher is algebraically **incompatible** with original LP2 physical pp0–2 on **both** 2015-documented registers, under either of the two source-natural prime-clock origins. No previously unknown plaintext, new key or continuation address follows. This eliminates a specific proposed third stage, leaving the historical participant's first two operations as an unproved intermediate register.

## Human-observable path and competing explanation

A February 2015 participant proposed subtracting successive primes from original pp0–2 with an imagined preceding F, then taking a modular difference. Their recorded result has **40 adjacent equal transformed runes** across 729 original runes. A second difference renders these repeats as **40 literal F=0 symbols**, while the first-difference register contains 21 literal Fs. Both registers are independently reconstructed in the [source-exact 2015 report](lp2-2015-prime-delta-40-doublet-source-inversion.md). Cicada's actually solved physical p56 uses a **consecutive-prime-totient additive cipher whose plaintext F bypasses the key clock**. This raises one cheap, deterministic next operation: treat each of the two historical 2015 registers as p56-style ciphertext, accounting for every possible F interpretation.

The 2015 operations originated with *solvers*, not an independently verified Cicada instruction. Nothing on pp0–2 says to transfer p56's rule here. A wholly different second-stage system or a non-language intermediate remains a rival.

## Original-input transformation

From the untouched 729 physical pp0–2 GP29 rune indices `C[0..728]`, let `prime[0]=2, prime[1]=3` and all arithmetic be modulo29:

```text
S[-1] = -2 mod29 = 27
S[i]  = C[i] - prime[i+1]
D[i]  = S[i] - S[i-1]
E[0]  = D[0]
E[i]  = D[i] - D[i-1]           (i > 0)
```

The original `D` has exactly 40 equal adjacent pairs, and `E` contains exactly 40 zeros. No original symbol is changed or deleted. The inferred third-stage inverse tests every possible consumed-prime count at every position, merging clock-equivalent paths. For `E[i]=0`, allow either transparent plaintext F (no prime spent), or prime consumption when the decoded plaintext is non-F. For `E[i]≠0`, prime consumption is mandatory, and a decoded plaintext F is illegal because the original encoder would emit F directly. This is the exact known p56 cipher semantics, without guessing an F mask.

## Distinguishing outcome

| Source-natural prime-clock start | Register | Max simultaneous legal clocks | First impossible original index |
| --- | --- | ---: | ---: |
| index **0** (solved p56 starts at prime 2) | **first difference D** | 1 | **12** |
| index **1** (imagined F spends prime 2, start prime 3) | **first difference D** | 1 | **3** |
| index **0** | **second difference E** | 2 | **48** |
| index **1** | **second difference E** | 2 | **48** |

The participant's second-difference initial value has no documented preceding first-difference seed. Exhaustively assign **all 29 possible values of E[0]** under **both** prime-clock origins: all **58/58** original-cipher variants are impossible. One seed per origin dies at index0; each of the other 28 dies at index48. This eliminates the unspecified second-difference initial condition as a rescue for the frozen cipher. For either historical register and either prime origin, *all* retained F-skip interpretations encounter an impossible transition on original p0 before index49. This is a stronger structural obstruction than an unfavorable language score. A positive control uses **729 genuine solved-p57 GP runes**, repeated in their authentic order, encrypted with the same prime sequence and plaintext-F skip. Its complete 729-rune ciphertext has a surviving exact source plaintext clock at both starts.

The alternative explanation that the 2015 transform is merely a solver's diagnostic remains completely viable. **Do not** reintroduce this same layer by tuning prime starts, F masks, arbitrary offsets or phase resets without an original clue. A productive next candidate needs a genuine independent third-stage operator/key and a held-out original prose prediction.

[Single-file original-source Node22 CommonJS SFT](../sims/lp2_2015_twicedelta_totient_fbranch_sft.cjs) · [Prior original 2015 witness and its historical source](lp2-2015-prime-delta-40-doublet-source-inversion.md) · [Authentic p56 F-transparent positive calibration](lp2-p56-native-F-transparent-ninechapter-impossibility.md).
