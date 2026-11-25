# Public word-history clocks: square recurrence and exact delimiter-state partition

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

## Shared state partition from observable delimiter contexts (Director #2863, Agent11)

The earlier square-clock rejection fixes a recurrence. This separate model grants a more flexible, completely arbitrary map from a **public context** to a shared substitution state: context x=(previous complete printed word length, current complete printed word length, current rune offset). The visible current length is allowed as side information even before its runes are consumed; the prior length is carried across physical page seams; the first prior length is zero. This is motivated by the existing signed words/numbers instruction and printed word framing, but no first-party clue prescribes this particular context. No hidden state or per-page private context is allowed. Let C_i=pi[f(x_i)](P_i), with each pi a GP29 permutation and arbitrary deterministic f. The 2,896 source groups give 925 observable contexts over all 12,956 runes.

For a proposed paired plaintext and ciphertext, each context supplies partial input/output pairs. It contains a self-loop (impossible regardless of number of states) if the same P requires two different C, or the same C requires two different P. The exact number of incompatible unordered observation pairs is sum_p choose(n_p,2)+sum_c choose(n_c,2)-2 sum_(p,c) choose(n_pc,2). Between distinct internally compatible contexts, add an edge if the union of their pairs is not a partial bijection. A proper coloring is necessary **and sufficient** to extend each color's union to a complete GP29 permutation. The largest number of different required outputs for one input (or different inputs for one output) is a clique lower bound; DSATUR gives a constructive upper bound. Equality certifies the exact chromatic number; a self-loop excludes every deterministic context partition.

### Original-input decision

Fit boundary locked to physical p0–39 (9,640 runes, 839 contexts); p40–55 (3,316 runes) withheld from original testing. Use 64 fixed exact-word-length draws from each of four native registers, all covering every length. The Latin control conversion includes ING→NG, IO→IA, K/Q→C, V→U, Z→S. **All 256 training candidates have self-loops before any coloring or key inference.**

| Fixed control | Minimum conflicting observation pairs | Minimum incompatible contexts | Zero-conflict candidates |
|---|---:|---:|---:|
| solved-Cicada | 28293 | 523 | 0/64 |
| Gibran | 25882 | 462 | 0/64 |
| Emerson | 24628 | 450 | 0/64 |
| Shakespeare | 24427 | 476 | 0/64 |

Example, fixed Shakespeare control with the fewest incompatible pairs: at original global offsets 8 and 1160, context (8,5,0) requires the same P=19 to map to C=15 and C=13. A deterministic context map cannot satisfy both, even with an unbounded number of colors. These are exact contradictions for the named fixed native candidates, not an impossibility theorem for all English strings. No original holdout language or key is fitted after the gate fails.

### Authentic and planted controls

The selective-F p56 prime-minus-one replay exactly matches all 85 original runes; grouping its paired observations by actual shift gives 29 distinct shift labels and a conflict graph with 228 edges and exact chromatic number 15. The 15-state minimum is only a compact fit of the observed pairs, not the historically used prime schedule; it demonstrates that graph minimization alone need not identify the real clock. The actual clear p57 gives exact chromatic number one across 91 delimiter contexts. The proposed delimiter context on actual p56 has five conflicting contexts, confirming that it does not encode that genuine cipher's state.

The separately generated native Shakespeare plant uses four independently random GP29 permutations and true public clock (prevLength+length+offset) mod4. On 9,640 known training pairs, the 839-node graph has 172,921 edges and lower=upper=4. Frozen direct context-color lookup recovers 3,226/3,316 withheld native runes, with 2 wrong, 86 unseen contexts and 2 unobserved inverse entries. Thus a minimal coloring alone cannot supply the missing transition. Exhausting 64 coefficient triples modulo4 and 24 state-label permutations using only training pairs gives 2 compatible compact rules; heldout correct counts 3315, 3315 of 3,316. The source-selected test would need an independently constrained clock like this, not an arbitrary learned table. The method's true key/clock architecture is planted rather than historically established. Raw controls and explicit witness coordinates in [output](lp2-public-delimiter-context-coloring-output.json), source-only [SFT](../sims/lp2_public_delimiter_context_coloring_sft.cjs); function executed against the pinned six repository inputs in connected V8, standalone Node wrapper not separately executed.

**Decision:** reject the stated three-field delimiter-context partition for the 256 fixed native training candidates. The obstruction applies to every coloring/number of shared bijections, not just a four-state linear clock. A longer public history, changed printed boundaries, or different source-selected operation is outside this exact test. No original key or unknown plaintext recovered. Do not grow context width or tune state labels to rescue this exact model; independent source evidence is required.
