# LP2: fixed distinguished-rune zero-delta event profile, with arbitrary changing secret keys

**Status:** exact original-ciphertext positional invariant and source-native GP language exclusion for one explicitly defined family. **No unknown plaintext, creator-selected key, complete cipher or destination was recovered.**

## What operational family is tested?

Consider a complete, reversible GP29 cipher that makes **the same single unknown plaintext rune** \(s\) responsible for each adjacent equal ciphertext pair:

\[
 C_i=C_{i-1}\ \Longleftrightarrow\ P_i=s,\quad i\ge1.
\]

Every other plaintext rune maps bijectively onto the 28 *different* next-cipher symbols. The 28-way map may use arbitrary secret fresh keys, arbitrary time-varying permutations, page or word clocks, and nonlinear state. This family includes the natural "escape rune" interpretation of a 28-nonzero-step encoder, while conceding much greater freedom than the stationary ciphertext-predecessor tables rejected in the existing [all-secret row-capacity work](lp2-cipherprev-quasigroup-majorization-allsecret-original-gate.md).

Its exact key-independent consequence is that the *positions of every occurrence of plaintext rune s*, after the initial unencrypted position, equal the *positions of every consecutive-ciphertext-rune repetition*. The identity of s is an unrestricted 29-way secret: every candidate is tested, and the best allowed result is reported.

The 29-way all-secret theorem **does not** apply to a time-changing designated escape rune, two or more special runes, a many-to-one encoder with sideband data, an operation conditioned on word position, changed word boundaries, a non-GP intermediate, or plaintext that departs from the native-language registers below. No Cicada source has been found authoring the tested iff rule.

## Original source and its three-part event profile

Use the original images' canonical rune transcription [lp2-transcription.txt](../resources/liber-primus/lp2-transcription.txt) and the page-by-page [GP29 indices](../resources/liber-primus/lp2-corpus.json). The 55 rune-bearing physical pages p0–p55 contain exactly **12,956 runes in 2,896 printed words** when their printed line and page carries are joined. The first cipher rune has no previous rune. On all later positions, the original invariant is:

| Source event | Original exact count |
| --- | ---: |
| C_i = C_(i−1), all eligible positions | **86** |
| Same event at first rune of printed word | **23** |
| Same event at last rune of printed word | **19** |

These are *event positions*, not frequency or coincidence fits; an arbitrary secret 28-way permutation at every other position cannot move them.

## All 29 secret markers compared with native-GP printed-word-matched controls

Use the project [native GP transliterator](../sims/lp2_native_gp_source_orthography_sft.cjs), calibrated to the exact 181-word solved LP1 and 95-rune solved LP2 p57 source. Independently draw each of the **2,896** words from Gibran and Shakespeare GP-encoded text with the **same individual lengths in the same original sequence** (1–14 runes); the original first rune is excluded from the candidate marker profile. The fixed source-length inventory is \`[83,448,720,513,317,256,216,156,78,52,32,18,4,3]\`.

For each of 29 possible marker runes compute expected total, first-word-position and last-word-position occurrences, plus variance from the empirical source-native length-conditioned word population. Define each candidate's discrepancy as the **largest** absolute standardized deviation across those three observables. Select the **smallest** discrepancy over all 29 candidate runes, thus granting complete freedom to the unknown marker identity without fitting any crypto key.

| Independent plaintext control | Best possible source marker | Lowest original maximum standardized deviation | Worst maximum deviation across 2,000 source-native matched controls | Controls as extreme as original |
| --- | --- | ---: | ---: | ---: |
| Gibran, *The Prophet* | GP G | **7.714970 σ** | 0.622438 σ | **0/2,000** |
| Shakespeare, first-300k corpus | GP P | **8.524712 σ** | 0.755704 σ | **0/2,000** |

The components of the best source fits are Gibran \`[7.714970, 5.919613, 0.015114]\` and Shakespeare \`[8.524712, 7.687359, 0.586760]\`, ordered [total, first, last]. These are **conditional Monte Carlo scores**, not a universal p-value for any arbitrary plaintext distribution or any anti-repeat cipher. The source-native reference spelling, reference word distributions, and printed boundaries are assumptions and potential failure points. The Monte Carlo bound 0/2000 per control is only for the specified statistic and population.

### Positive full-length changing-key inverse

A complete 29-state planted codec with fixed special rune EA (index28) and an **independent changing 28-way rotation at each rune** encrypts as follows, taking the first rune clear:

- If \`P_i=28\`, emit \`C_i=C_(i-1)\`.
- Otherwise \`C_i=(C_(i-1)+1+((P_i+k_i) mod 28)) mod 29\`.
- Invert delta0 to EA, and nonzero delta to \`P_i=(delta-1-k_i) mod28\`.

The tested native-GP 12,956-rune control round-trips **exactly**; both its ciphertext event profile and its corresponding plaintext-EA position profile agree. This demonstrates that the test detects a correctly implemented *evolving* key model and is not restricted to stationary maps.

**Independent execution:** [read-only CommonJS single-file SFT](../sims/lp2_one_symbol_zero_delta_wordprofile_sft.cjs), [Windows Node22 PASS, 22 November 2026](https://github.com/FlareZ123/liber-primus/actions/runs/45021695450).

## Research decision

Retire the entire family where **one fixed unknown source-native GP plaintext rune, regardless of changing nonmarker keys, always and only generates adjacent ciphertext equalities**. Further key search inside this family cannot change the exact original event positions.

A promising new hypothesis must first supply an *authored* reason to change the escape symbol by position, admit an independently indicated non-GP register or a source-selected sideband/exception rule. The test does not choose among those alternatives. The objective remains authentic unknown-page plaintext with an independently predictive inverse.
