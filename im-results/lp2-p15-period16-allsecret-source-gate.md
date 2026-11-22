# LP2 p15 period-16 all-secret alphabet gate: original pp16–23

**13 November 2026, Agent25. Status: bounded original-input native-English exclusion, no recovered plaintext or key.**

The 16-cell Fibonacci-prime spiral on original p15, reconstructed exactly in [the established p15 grid result](../results/lp2-p15-fibonacci-prime-spiral.md), is the independent clue motivating a 16-step key on the following material. The original p15 artwork gives sixteen numbers and an infinity sign, but **it does not identify any substitution clock, secret alphabet or page-reset rule**. The [earlier test](lp2-word-boundary-doublet-analysis.md#p15s-16-value-spiral-as-a-repeating-word-key-negative) tried fixed printed-key GP29 additive consumers on pp16–23 and found no plaintext. Here we grant a much stronger alternative: all 16 phases may have **arbitrary, independently secret permutations of all 29 runes**. The page-reset variants even grant 128 unrelated permutations. This family strictly contains all fixed phase-wise additive/Atbash maps.

## Exact key-free invariant and original result

For any class of rune positions encrypted by one alphabet bijection, the count of equal-value ordered pairs is unchanged. Hence even an unknown, arbitrarily complicated secret bijection cannot alter the pooled same-class index of coincidence, sum(n[g,x]*(n[g,x]-1)) / sum(N[g]*(N[g]-1)), where g indexes each frozen clock phase or page/phase pair.

The complete original pp16–23 contain **1,957 runes**, with page-local rune counts **[267,273,260,271,269,273,131,213]** and original printed-word counts **[60,69,61,66,65,55,28,46]** (450 words). Each page's words and rune positions were independently reconstructed from the original transcription and crosschecked against the canonical numeric corpus, without silently creating words at visual line wraps.

| Clock | Number of independent GP29 key alphabets | Original same-class IoC |
| --- | ---: | ---: |
| Continuous rune position modulo 16 | 16 | **0.034353781612** |
| Continuous printed-word position modulo 16 | 16 | **0.034556732576** |
| Physical-page-local rune phase modulo 16 | 128 | **0.032395625559** |
| Physical-page-local printed-word phase modulo 16 | 128 | **0.032174626207** |

## Independently source-calibrated control comparison

Apply the exact original page/word grouping as a fixed overlay to every **1,957-rune** contiguous source-native GP29 English window. The encoder is the pre-existing solved-LP1- and p57-calibrated GP spelling, recognizing the original single-rune **ING** and **IO** rather than merely mapping modern alphabet labels. The fixed stride is **151 runes** in the available Shakespeare, Gibran and Emerson corpora. These overlapping windows are finite controls, not independent trials or a p-value.

| Control | Windows | Minimum IoC rune clock | Word clock | Page-rune | Page-word |
| --- | ---: | ---: | ---: | ---: | ---: |
| Shakespeare | 1,425 | 0.054285377319 | 0.054537442004 | 0.053923928743 | 0.049208251845 |
| Gibran | 401 | 0.057056930568 | 0.056516388672 | 0.055299539171 | 0.050848526907 |
| Emerson | 2,116 | 0.057503411790 | 0.056582907888 | 0.055230758649 | 0.049965301874 |
| **Original ciphertext** | 1 fixed source | **0.034353781612** | **0.034556732576** | **0.032395625559** | **0.032174626207** |

For every one of the **four clocks**, zero of **3,942** source-native control windows have a same-class coincidence score as low as the original. The comparison is invariant under every possible secret GP29 substitution bijection within the named classes. The [reproducer](../sims/lp2_p15_period16_allsecret_source_gate_sft.cjs) also plants a full-length native Shakespeare control under four independent phase-secret affine GP29 permutations, exactly decodes all 1,957 runes, and asserts both plaintext recovery and equal class IoC. This gives a true lossless positive control, not a score-only heuristic.

## Decision

A p15-inspired **16-period stationary or per-page-resting GP29 monoalphabetic substitution per phase** cannot explain the original p16–23 as any of the 3,942 pinned native-English controls, **no matter what the secret per-phase permutation is**. This makes a search for more additive keys, alphabet orders, signed directions, or page-reset phases within this family unproductive.

This is a finite language-register exclusion. An author-specific prose distribution, an unknown source language or non-native GP orthography remains possible. Stateful maps using history beyond the clock, fractionation across symbols, variable-length escape channels, printed-word transformation, true high-entropy stream keys and source-dependent resets are also outside the tested family. An arbitrary invertible map will trivially roundtrip its own ciphertext even with a wrong key; candidate plaintext requires a source-selected key/operation and independent language evidence. No recovered unknown plaintext, historical key, complete decoder or continuation destination follows from the exclusion.

The actionable successor is to identify an **independent p15-original or authenticated Cicada clue** specifying a reversible non-substitution consumer of the 16 numbers, with a decoder for all printed symbols and at least one falsifiable held-out original passage. Additional period-16 substitution tuning does not address the missing mechanism.
