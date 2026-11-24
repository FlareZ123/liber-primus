# P15 spiral followed by the authentic p56 prime clock: all-origin original-cipher inverse

**Agent26, 24 November 2026. Decision:** reject this specific layered receiver. No unknown LP2 plaintext or key recovered. The result is a language-independent reachability exclusion of 105,664 direction/phase/origin triples, rather than a dictionary-score failure. [Standalone SFT](../sims/lp2_p15_spiral_prime_fhold_allorigin_sft.cjs).

## Source-selected operations and the missing binding

The p15 physical numeric square has a verified center-out clockwise path, represented on a row-major 4×4 array by `[5,6,10,9,8,4,0,1,2,3,7,11,15,14,13,12]`. The independently solved p56 encryption is `C_i=P_i+(prime_j-1) mod 29` for non-F plaintext, while plaintext F=0 emits 0 without consuming a prime. The SFT reproduces all 85 actual p56 ciphertext runes from the independently transcribed solved GP text. This test asks whether the geometric p15 movement and actual p56 value-changing cipher compose, rather than using the p15 printed values as a periodic additive key. No first-party source specifies this composition or its starting prime origin.

The frozen target is all 1,883 actual GP29 runes from p15 offset20 (after the original 13-dot mark) through p22, including 70 zeros. The page/line/word delimiters remain fixed layout. In each direction, rearrange complete 16-rune blocks according to the source path or its inverse. Grant every 0–15-rune unpermuted leading fragment and leave the incomplete final block unchanged. This covers 32 precisely defined block arrangements, not arbitrary unknown permutations or blocks crossing the excluded red rubric. Try all zero-based prime sequence origins 0–3301, continuous across physical pages, without fitting a reset.

## Exact finite-state inverse

At input index i, h is the count of literal plaintext F holds, so the next consuming prime index is origin+i-h. From each reachable h:
- If ciphertext is F, emitting plaintext F and incrementing h is always legal.
- Compute P=(C-(prime[origin+i-h]-1)) mod29. A consuming transition retaining h is legal if and only if P is nonzero.

These two cases cover every possible F interpretation exactly. Empty reachable state means **no plaintext of any language** can produce that input under the candidate, irrespective of dictionary or scoring. A block permutation is bijective and every original outer input replays exactly. If the sender instead applied the geometric permutation to plaintext before prime encryption, the unpermuted ciphertext must first admit the same prime-clock inverse; the reference test addresses that order under the same clock assumptions.

## Executed original result

| Receiver | Block phases | Prime origins/phase | Longest legal prefix (all phases) | Training-prefix survivors | Full survivors |
|---|---:|---:|---:|---:|---:|
| Clock after spiral readout | 16 | 3302 | 612 (phase7, origin1444) | 0 | 0 |
| Clock after inverse spiral readout | 16 | 3302 | 907 (phase13, origin1328) | 0 | 0 |
| Unpermuted reference | 1 | 3302 | 539 (origins2480/2481) | 0 | 0 |

At exact phase0, the two respective maxima are 430 and 586. The aligned training cuts are 913–928 runes; the exceptional 907-rune prefix still dies before its own 925-rune cut. No original heldout plaintext exists in the tested family. The origin bound is a deliberately generous finite range motivated by the historical identifier 3301; it is not a theorem about all possible prime indices. The unpermuted comparison is a reference, not a claim of novelty for direct prime-clock tests.

## Native positive controls and actual key recovery

The donor is the first 1,883 runes of solved native GP sections `0_koan_1, 0_loss_of_divinity, jpg107-167, jpg229`, in canonical order. The language prior is trained only on the other five sections, using smoothed unigram/backoff bigram probabilities. Four separate encryptions at independently fixed origins and differing spiral phases are inverted. Rank every reachable origin using only its aligned training prefix, freeze the chosen origin, and decode the complete legal path; exact forward replay is mandatory. The full path optimization can use suffix evidence to disambiguate F interpretations, so the withheld accuracy measures frozen-origin decoding, not prediction of the literal F mask without observing the suffix ciphertext.

| Planted origin | Selected origin | Full rune accuracy | Withheld rune accuracy | Full replay |
|---:|---:|---:|---:|---|
| 0 | 0 | 1883/1883 | 955/955 | exact |
| 133 | 133 | 1879/1883 | 962/966 | exact |
| 1033 | 1033 | 1883/1883 | 961/961 | exact |
| 3301 | 3301 | 1881/1883 | 956/956 | exact |

The algorithm recovers all four original planted prime origins, with six F-ambiguity rune errors overall; four occur in withheld suffixes. This is not an assertion of unique mathematical inverse: some origins admit several terminal hold counts. It validates the exact source clock and useful key-ranking method under the planted model.

## Causal decision

Do not fund another variant that only changes these two fixed block directions, leading phase, or origin within 0–3301. The p15 spiral remains solved independently, and the p56 prime rule remains genuine; the proposed binding is rejected on the unchanged original source. Different prime sequences, origins outside this range, hidden resets, different outer transpositions, or other encryption layers remain untested. This is not a general negative against using the p15 geometry.

**Execution:** exact committed SFT function was executed using the fetched repository JSON in the invocation's JavaScript runtime. No Windows Actions run is claimed. Run `node sims/lp2_p15_spiral_prime_fhold_allorigin_sft.cjs` from the repository root for complete per-phase and planted outputs.

Related earlier work: [bare joint rune/gap spiral](lp2-p15-spiral-joint-rune-gap-original-gate.md), [p15 printed-value F-interrupter](lp2-p15-spiral-authentic-finterrupter-fixed-clock-original-gate.md). Those are different receivers, not repeated tests.
