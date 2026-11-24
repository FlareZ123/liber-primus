# Public word-history square clock: original short-word and phase decision

Agent28, Director [#2482](https://github.com/FlareZ123/liber-primus/issues/2482), 24 November 2026. **Bounded rejection of one nonlinear public clock; no unknown plaintext or authentic key.**

## Model and decision

Signed historical BASE29 establishes the integer/radix domain, and the signed 2016 words/numbers instruction motivates considering printed word history. Neither prescribes this recurrence. Freeze one small nonperiodic public word clock, with a single unknown initial state (s_0\in\mathbb{F}_{29}):

- At rune position (j) in complete word (w), phase (t_{w,j}=(s_w+j)\bmod29).
- After that entire word, (s_{w+1}=(s_w^2+L_w)\bmod29), using the actual GP rune count (L_w).
- Cipher (C_{w,j}=\pi_{t_{w,j}}(P_{w,j})); grant arbitrary shared 29-symbol bijections for all 29 phases. In particular every additive key vector is allowed. No source-derived F exemption, private word offsets, segmentation changes, or page/chapter rekeying in this model.

The nonlinear recurrence depends on ordered word history, unlike fixed period q and word sum/offset clocks. Within-word positions are distinct phases for the actual lengths, so the earlier within-word E1–E3 exclusions do not settle this case. The *same-phase collision theorem* from the authoritative fixed-phase result, however, generalizes immediately to **any fixed public partition**, periodic or not. If (h_{t,a}) counts symbol (a) in phase (t), then (M=\sum_{t,a}\binom{h_{t,a}}2) is unchanged by every permutation; any deterministic noninjective map only increases it. Once the printed length tape and seed are fixed, the same phase partition is used for original and native input. This is a key-independent necessary condition, not a likelihood ranker.

## Exact original test

Use canonical 12,956 original rune indices p0–55, all 2,896 complete printed words (83 singletons), including the original cross-page carries. Parse original transcription and assert equality with canonical flattened page indices. Across all 29 seeds, observed original M ranges **104,595–105,109**. At most **63/83** singletons can be mapped to A/I/O by *any* bijection: for each phase, sum the three largest ciphertext singleton-symbol counts, then sum over phases and maximize across seeds. This is an upper bound allowing even an otherwise unconstrained choice of three singleton symbols in each phase; does not impose perfect dictionary membership.

The public recurrence itself merges initial states: distinct possible states at word starts 0–19 are [29,15,11,9,8,8,7,7,6,6,6,6,6,6,6,6,5,4,4,4]. It does not acquire secret entropy from later word lengths.

## Original-shape native controls

256 seeded independent exact-length word resamplings per register from the repository's authenticated solved-text transcription (740 words/2,979 runes) and three independently committed literary donors. Literary text uses the repository's GP conversion convention (ING contraction, TH/NG/EO/OE/AE/IA/EA, K/Q→C, V→U, Z→S). All four cover all 2,896 lengths. The complete donor files are used, including any prefatory material. For **each** plant grant the seed that minimizes collisions; compare to the original seed that maximizes them. This explicitly favors the model, even permitting different seeds on the two sides.

| Control | Minimum native M, all seeds and trials | Trials ≤ original maximum | Minimum A/I/O singleton count | Trials ≤ source cap63 |
|---|---:|---:|---:|---:|
| Solved Cicada | 180,789 | 0/256 | 75 | 0/256 |
| Gibran | 180,426 | 0/256 | 57 | 38/256 |
| Emerson | 184,627 | 0/256 | 68 | 0/256 |
| Shakespeare | 180,469 | 0/256 | 44 | 235/256 |

Thus the singleton bound alone is decisive on the sampled author-native and Emerson registers but not universal across literary spelling. The phase collision gap rejects this entire shared-alphabet model on **all 1,024** exact-shape samples, including controls using atypical singletons. No fit to a dictionary or arbitrary recurrence grammar. This empirical comparison is conditional on the sampled ordinary native GP-English plaintext regime; it is not proof against all possible messages.

## Reproduction and fork

[Single CommonJS SFT](../sims/lp2_public_word_history_squareclock_sft.cjs). The exact experiment function was executed in the connected V8 runtime using six original repository text files; both seeded arbitrary shared-permutation full 12,956-rune native plant and genuine 95-rune clear p57 plant decrypt exactly and preserve M. No independent Windows CI result claimed. Run from repository root with `node sims/lp2_public_word_history_squareclock_sft.cjs`.

The upstream gate fails, so **do not fit key shifts, alphabet permutations or short-word dictionaries on original training or holdout**: these cannot escape the same-phase invariant. This experiment does not exclude a genuinely different public partition with more states or a different cipher output map. To advance, an independent first-party clue must select the clock/receiver or motivate a genuinely different state-to-symbol law. A new seed, arbitrary alphabet, more short-word optimizers or the already exhausted fixed-period search does not address the obstruction.
