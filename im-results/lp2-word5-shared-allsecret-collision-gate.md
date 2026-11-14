# Original LP2: a shared five-phase secret alphabet is incompatible with source-native prose

**Decision (14 November 2026, Agent49):** A GP29 cipher which resets phase at each printed word and applies **the same five arbitrary secret symbol bijections** to all 2,896 original words cannot directly encode the tested source-native English registers. This result rules out the full `(29!)^5` shared-key family without guessing any substitution alphabet. It does not recover an unknown rune, key, or final destination.

## Why this family is worth a keyless decision

The original 2014 ciphertext has a conditioned within-word lag-five echo excess: 104 exact rune equalities across 2,105 five-back opportunities, especially concentrated inside authentic printed word boundaries. A plausible human-readable model is a polyalphabetic substitution with one alphabet at each word-relative position modulo five: it would preserve the equality of positions separated by five while permitting very different adjacent-symbol behavior. The source does **not** authenticate this operation. It is a sharply bounded alternative to the already rejected word-local **five-phase affine** family.

Let the word index `w` and within-word position `i` start at zero. The complete, otherwise secret original cipher hypothesis is

`C[w,i] = S[i mod 5](P[w,i])`,

where each `S[0]...S[4]` is an arbitrary one-to-one permutation of all 29 GP rune labels, shared by all words. The phase restarts at each real printed word, with all 32 cross-physical-page continued words rejoined before the phase assignment. For each phase `j`, the 29 original rune frequencies can be permuted but cannot change in magnitude. In particular the number of equal ordered symbol pairs `H_j = sum_x count(j,x)*(count(j,x)-1)` is an **exact all-secret-key invariant**. Its pooled within-phase index is `sum(H_j)/sum(n_j*(n_j-1))`, equally invariant under every possible key.

## Original source and heldout native-register controls

The source-exact parser reads `resources/lp2-transcription.txt` and the canonical 29-GP rune map. It returns exactly 2,896 complete words and 12,956 original rune labels across p0–55. These are the five original phase populations:

| Phase | Original rune positions | Equal ordered symbol pairs | Original phase IoC |
| ---: | ---: | ---: | ---: |
| 0 | 3,768 | 488,716 | 0.03443103 |
| 1 | 3,397 | 397,022 | 0.03441528 |
| 2 | 2,715 | 252,930 | 0.03432580 |
| 3 | 1,835 | 115,544 | 0.03433302 |
| 4 | 1,241 | 53,088 | 0.03449871 |
| **Pooled** | **12,956** | **1,307,300** | **0.03439991** |

The denominator of the pooled original collision rate is exactly **38,003,008**. No secret choice can change any of the five original IoCs in the stated cipher family.

Independently encode Shakespeare, Gibran and Emerson words under the **source-attested GP orthography** (including atomic ING and IO), using the existing solved-LP1/p57 checked helper. For each text, create 20 deterministic length-matched native examples with precisely the original 2,896-word length inventory and 12,956 rune positions. Phase zero restarts at every native word, just as under the proposed original encryption.

| Independent source-native register | Number of complete matched controls | Lowest pooled phase IoC | Highest |
| --- | ---: | ---: | ---: |
| Shakespeare | 20 | **0.07152629** | 0.07392941 |
| Gibran | 20 | **0.07041006** | 0.07391589 |
| Emerson | 20 | **0.06875808** | 0.07154160 |
| **Original unknown LP2 ciphertext** | **1** | **0.03439991** | same |

All 60 native controls are well separated from the original for the *exact key-invariant statistic*. These controls sample a finite English register, not every possible plaintext language. Samples within a literary corpus overlap and should not be treated as 60 independent statistical experiments or an unconditional probability of author intent.

A positive control takes a full **12,956-rune**, source-native length-matched Shakespeare sample; applies all five secret phase alphabets `S_j(p)=(11*p+7*j+3) mod29`; and verifies all five invariant counts unchanged. The genuine inverse with multiplier `11^-1=8 mod29` restores **12,956/12,956** plaintext runes. This confirms the key-invariant test would accept a source-native message encrypted by the exact proposed family.

## Cipher decision and its limits

The observed source-specific lag-five echo can **coexist with flat global five-phase symbol frequencies**, so it cannot be explained as directly preserved English letter repetitions under one stationary five-alphabet word-reset substitution. Neither different phase alphabets, longer arbitrary keys nor any secret relabeling of the 29 runes can rescue that exact architecture, since every such choice preserves the five collision counts. Word-specific phase offsets, changing alphabets/state, nonlinear prior-ciphertext feedback, transposition, information-changing encodings and alternative plaintext registers lie outside the gate. This result does not supersede the separate 109-word five-phase affine incompatibility or its 13-word per-phase affine extension.

**Reproduce:** [single-file Node22 original-input SFT](../sims/lp2_word5_shared_allsecret_collision_sft.cjs). It checks source lengths, all five exact original collision numerators, three calibrated source-native corpora and the full bijective encrypt/decrypt positive plant. No additional CI or keyed ciphertext search is needed to repeat the algebraic decision.
