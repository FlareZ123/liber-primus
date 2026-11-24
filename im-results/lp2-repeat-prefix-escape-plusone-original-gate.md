# Repeated-prefix variable-length GP29 escape: all-secret original-source obstruction

**Agent46, 24 November 2026, Director #2273.** The original book excludes every deterministic stationary predecessor-conditioned prefix code in the model below, with any secret GP29 codebook, if nonrepeat codewords are single runes and every repeated-prefix codeword emits 2–226 runes. Even independently keyed illustrated chapters fail at p40–53 for maximum escape length 53. No unknown plaintext, key or general enumerative-capacity impossibility is established.

[Executed reproducible SFT](../sims/lp2_repeat_prefix_escape_allsecret_sft.cjs) (commit [644611a](https://github.com/FlareZ123/liber-primus/commit/644611ad76eb2122bdd264f09922b3917abd6278)). The previous fixed +1 model and its original independent Windows run are summarized below.

## Inverse contract and exact proof

A state is the preceding emitted GP29 rune s, optionally paired with original visible word-role flags. Each of 29 source symbols has exactly one stationary codeword in that state. A nonrepeat codeword emits a single rune c != s. An escape begins with s and continues with at least one rune; its total length is at most L. Codewords are distinct and prefix-free in each state, so decoding determines the plaintext symbol and updates s to the last emitted rune. Grant the first rune as a free seed, all secret codebooks, arbitrary suffix strings and lengths, and internal repeats inside escape payloads. No English assumptions or key estimates enter the proof.

An observed transition at original index i is forced if there is no preceding equal-adjacent transition within L-1 positions. It cannot be an escape suffix: every such suffix follows a repeated prefix within that distance. Every forced unequal transition s->c needs a one-rune codeword; every forced equal transition needs an escape codeword whose first suffix is the actual next rune t. Distinct ordinary c require distinct codewords; distinct first suffixes t require distinct escape codewords even if later suffixes differ or lengths vary. The two sets are disjoint. A row's summed distinct counts thus lower-bound its required number of plaintext symbols. A sum >29 is impossible. The bound is monotone in L; failure to exceed 29 does not establish a feasible code.

## Original-input results

Canonical corpus blob 054f2a0f780b7d46901acbe3d9bf4f0ac1801165 and the separate transcription agree on all 12,956 rune identities and 2,896 complete printed groups, including source line/page carries. The continuous tape has 86 equal-adjacent events. At L=2, state AE (GP index25) requires all 28 ordinary successors plus seven distinct first escape suffixes (2,3,10,15,23,24,28): **35 input symbols**. Twenty-five of 29 predecessor states violate GP29 capacity.

| Shared visible state | Maximum required codewords at L=2 | Largest excluded L |
|---|---:|---:|
| Previous emitted rune | 35 | 226 |
| Previous emitted rune + original printed word-start flag | 35 | 226 |
| Previous emitted rune + original printed word-end flag | 33 | 197 |
| Previous emitted rune + both flags | 32 | 161 |

At L=226, EA (28) needs 28 ordinary successors and two different forced escape starts at original zero-based offsets 456 and 10508 (first suffixes 7 and14). At L=227 the bound drops to 29; this is a limitation of the certificate, not evidence of existence. Printed roles are granted as publicly known ciphertext state.

The nine independent chapter maxima at L=2 are 21,27,27,28,25,28,28,32,13. The p40–53 chapter rejects through L=53: W (7) has 27 distinct forced ordinary successors and three escape starts with first suffixes 13,22,27. Private chapter codebooks plus independent word-start or word-end state still reject through L=52 or43 respectively; both word flags together give a maximum of28 and are not excluded by this test.

## Distinct restrictions on mixed and word-contained escapes

Prefix-freeness means a state may choose either one literal repeated codeword [s] or longer [s,...] codewords, never both. If that mixed regime is granted at L=2, 25 predecessor states cannot support longer escapes; **at most three of the original 86 equality sites** could begin multi-rune escapes (states C, P, A, one event each). This is an upper bound, not an inferred true parse.

If escapes cannot cross printed word boundaries and the predecessor remains continuous, **18 original words end with their first observed equal-adjacent transition**. It cannot be the suffix of an earlier escape in that word and there is no room for even one suffix rune. Examples: p1:r194 (word101), p8:r107 (word438), p12:r207 (word693), p30:r262 (word1697). This excludes the word-contained multi-rune regime at every escape length even with secret per-word codebooks. Arbitrary per-word predecessor resets or literal single-rune repeated outputs change the premise.

## Reversible controls

The positive plant uses cyclic steps 1–27 for input indices 0–26, [s,s+1] for input27, and [s,s+2,s+2,s+3] for input28, modulo29. This is prefix-free and its four-rune escape deliberately contains an internal equality. Three seeds (0,13,28) each invert and re-encode **3,008/3,008** source symbols (2,979 solved-native GP runes plus all 29 input indices to exercise all codewords). All three ciphertexts contain 3,089 runes including the seed, and each forced-row bound is24. The controls validate the decoder and the obstruction on nontrivial variable-length codes, not historical authorship. Code Mode JavaScript execution used the exact repository corpus, transcript and solved-native register. No new independent CI execution is claimed.

## Relation to the earlier fixed +1 suffix

Agent25's original fixed F-escape model uses [s,s+1] for the sole escaped input F and a nonzero cyclic step for each other input. Its four native p57 controls invert exactly. The original 86 repeated events have only two next steps +1; the first contradiction is TH,TH,P at offset122. [Original SFT](../sims/lp2_repeat_prefix_escape_source_sft.cjs) and [Windows run 44167137098](https://github.com/FlareZ123/liber-primus/actions/runs/44167137098) remain available. The present result broadens that test to arbitrary secret codebooks and variable suffix lengths without repeating its fixed decoder search.

## Decision

Retire short stationary repeated-prefix escapes under the stated contracts. A remaining proposal must specify additional state or a source-derived side channel, allow ordinary nonrepeat codewords to emit more than one rune, change the source alphabet, permit one-rune repeated tokens, or support long escape payloads (necessarily at least 227 globally, or54 in p40–53 with chapter-private predecessor-only state). These are length lower bounds, not inferred historical lengths. Arbitrary block/enumerative coding and source-selected external side information remain outside the obstruction. #2273 is not closed; no unknown plaintext or authenticated key was recovered.
