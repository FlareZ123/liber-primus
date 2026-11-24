# Five-phase affine slopes with arbitrary word-local phase permutations and offsets

**Agent9, 24 November 2026. Conditional original-input key-recovery experiment; no authenticated plaintext.**

The historical five-back echo motivates a shared multiset of five nonzero GF29 slopes. Unlike the earlier fixed-phase difference-histogram test, allow **each printed word an arbitrary permutation of the five slopes and five independently unknown offsets**. This gives every word independent local alignment, direction and phase ordering. In the physical-clock version, all symbols consume; in the historical F-hold version, literal plaintext F emits F and does not advance the word-local consuming clock. Both use unchanged printed groups, native GP29 alphabet and a finite pinned English dictionary. No first-party source selects this model or its slope/offset law.

At each phase, subtract the first observed pair: deltaC = a * deltaP mod29. Equal plaintext requires equal ciphertext and unequal plaintext determines exactly one nonzero a; further pairs must agree. Every candidate word yields a multiset of required slopes (including multiplicities); unconstrained phases are free. A five-slope key is admissible exactly when it contains that partial multiset. The five independent offsets always exist once the slope relations agree. Enumerate all multiset completions (201,376 possible keys), then intersect the exact constraints. This is an all-key word-lexical test, not a statistical fit. Arbitrary local permutation is a relaxation of any rotation or direction schedule.

Fit on long words (10–14 runes) starting in the first half of each physical chapter, then freeze all surviving keys before testing the remaining half. Word starts are used to assign page carries. The whole-book case fits on the first half of the continuous rune tape. The 2,896 printed groups and all 12,956 rune values align with the canonical source. The distinct per-word all-private test also counts individually empty candidate domains. These counts are conditional on the fixed native lexicon and original group boundaries. No OOV wildcards or post-selection of shorter anchors.

## Positive controls

The first 24 distinct long GP words in each of three pinned literary sources that are covered by the same TextBlob lexicon are encrypted with independently fixed keys, shuffled per-word phase assignments and random per-word offsets. Twelve words fit, twelve words are withheld. This deliberately conditions on lexical coverage and is a long-word key recovery calibration, not an assertion of prose recovery. Actual clear p57 rune words replay exactly under both clocks with known planted phase and offsets.

| Source | Clock | Fit keys | Exact key | Held-out truth admitted under unique key | Held-out uniquely recovered |
|---|---|---:|---|---:|---:|
| Gibran | physical | 1 | yes | 12/12 | 12/12 |
| Gibran | F hold | 1 | yes | 12/12 | 12/12 |
| Emerson | physical | 1 | yes | 12/12 | 12/12 |
| Emerson | F hold | 1 | yes | 12/12 | 12/12 |
| Shakespeare | physical | 1 | yes | 12/12 | 12/12 |
| Shakespeare | F hold | 1 | yes | 12/12 | 12/12 |

## Original results

| Scope | Clock | Fit long words | Held-out long words | Feasible fit keys | Keys compatible with all withheld words | Individually impossible long words |
|---|---|---:|---:|---:|---:|---:|
| book | physical | 54 | 55 | 0 | not scored | 14 |
| p0-2 | physical | 2 | 4 | 0 | not scored | 0 |
| p3-7 | physical | 5 | 5 | 0 | not scored | 1 |
| p8-14 | physical | 8 | 8 | 0 | not scored | 2 |
| p15-22 | physical | 4 | 11 | 0 | not scored | 4 |
| p23-26 | physical | 4 | 3 | 0 | not scored | 1 |
| p27-32 | physical | 10 | 4 | 0 | not scored | 1 |
| p33-39 | physical | 6 | 7 | 0 | not scored | 1 |
| p40-53 | physical | 13 | 11 | 0 | not scored | 3 |
| p54-55 | physical | 1 | 3 | 1731 | 0 | 1 |
| book | F hold | 54 | 55 | 0 | not scored | 14 |
| p0-2 | F hold | 2 | 4 | 0 | not scored | 0 |
| p3-7 | F hold | 5 | 5 | 0 | not scored | 1 |
| p8-14 | F hold | 8 | 8 | 0 | not scored | 2 |
| p15-22 | F hold | 4 | 11 | 0 | not scored | 4 |
| p23-26 | F hold | 4 | 3 | 0 | not scored | 1 |
| p27-32 | F hold | 10 | 4 | 0 | not scored | 1 |
| p33-39 | F hold | 6 | 7 | 0 | not scored | 1 |
| p40-53 | F hold | 13 | 11 | 0 | not scored | 3 |
| p54-55 | F hold | 1 | 3 | 2310 | 0 | 1 |

For physical and F-hold clocks respectively, 14 and 14 of 109 original long words have no possible lexicon preimage even with entirely private per-phase affine slopes and offsets. Of those, 9 and 9 have no ciphertext F, so there is no latent hold at those locations.

The original scope results are a bounded all-key decision for the specified lexical model. A surviving key, where present, is only a necessary relation: private offsets and phase arrangements remain unidentified, so no short-word plaintext can be inferred from it. Any full decipherment would need a source-selected law for those states. No authenticated key or plaintext was recovered. Do not extend this free phase-key search without a new clue or a materially different plaintext model.

## Reproduction

Run `node sims/lp2_wordprivate_shared_slope_multiset_sft.cjs` from the repository. [Raw output](lp2-wordprivate-shared-slope-multiset-output.json) contains the exact per-anchor fit trace and frozen holdout results. Input blobs used here: `resources/liber-primus/lp2-corpus.json` @ `054f2a0f780b7d46901acbe3d9bf4f0ac1801165`; `resources/liber-primus/lp2-transcription.txt` @ `43bfeb6bf8dabaf25b0446cc519f8d91d205d8a7`; `resources/control/english_wordfreq_textblob.txt` @ `140e1d22b5f8c45deddd2e8b25549d9d6307d938`; `resources/control/gibran_prophet_58585.txt` @ `df260a07d56bf5998d40a6360b6132c35c252d10`; `resources/control/emerson_essays_2944.txt` @ `a92be8ba5b3511a003a22ba31523c14397aaa83a`; `resources/control/shakespeare_first300k.txt` @ `94c677ad9dd50771c6670e0c4e4dad9052b46d85`. The pure experiment function was executed against these exact repository inputs in the current invocation; Node22 CLI execution was not independently run. The program asserts the 201,376-key count, repeated-slope multiplicity, full original tape alignment and exact planted replay. Earlier neighboring tests: [common slope per word](lp2-wordlocal-fivephase-additive-keyless-source-gate.md), [shared fixed phases with private offsets](lp2-word5-fixedphase-allsecret-affine-original-gate.md), and [arbitrary per-word phase substitutions](lp2-wordphase-fullpattern-crossfit-lexical-inverse.md).
