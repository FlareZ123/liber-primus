# Public ciphertext Latin-width keyword clock — exact all-key prefix inverse (#3066)

**Decision:** retire the frozen continuous q8/q13 public ciphertext-width additive keyword receiver for the native GP29 register on terminal p54–55. Four independent sparse-zero native plants recover 100% of their key symbols and plaintext (892/892 fitting runes, 304/304 held); the original all-key optimal fitting-prefix bigram scores are below every one of 572,025 matched 223-rune reference windows. Both frozen prefix winners have zero legal p55 continuations. No unknown plaintext or authentic key is recovered.

## Source-constrained receiver

The [2013 chart](../resources/external/2013-twitter-stage-gematria-source.md) visibly provides single- and multi-letter expansions. Freeze its canonical repository order and choose the shorter printed NG alias, canonical C and S, and IA (IO has the same width); U is the printed 2013 expansion. The width vector in GP order is

`[1,1,2,1,1,1,1,1,1,1,1,1,2,1,1,1,1,1,1,1,1,2,2,1,1,2,1,2,2]`.

For a non-F plaintext rune p, emit c=(p+K[t]) mod29, then t←(t+width(c)) mod q. Literal plaintext F emits zero and holds t; a consuming ciphertext zero remains legal whenever K[t]≠0. Freeze q=8,13, start phase0, no resets or additional alias variants. The chart and native F convention are authentic; their combination as a clock is conjectural.

Use the 223-rune physical p54 body after the established nine-rune opening (p54 indices 9…231), withhold all 76 physical p55 runes, and retain continuous state. Ignore printed word boundaries throughout. This is the previously used terminal 223/76 geometry, not a fit-selected starting position.

## Exact all-key algorithm

Enumerate every literal-hold/consuming-zero history. Each fixes the phase at every consuming position, even without the key. Each consuming c forbids exactly K[t]=c; a history is legal iff all q allowed-symbol sets are nonempty. The product of their cardinalities counts exactly the compatible keys for that history. Summing these products counts **key-history pairs**, not distinct keys. This is exact for the frozen model.

For each history, score all possible keys using native smoothed unigram-first/bigram transitions (unigram pseudocount .5, bigram backoff mass10). Each consecutive consuming pair advances by 1 or 2 around the phase ring, so its likelihood term connects phase j to j+1 or j+2. A pair involving a held F is unary or constant. Conditioning the first two key variables breaks the circular factor graph into a width-two chain. Max-sum DP over successive two-key states with the three wrap factors gives the **global** best bigram score over every key for that history, without sampling the astronomical keyspace. Backtrace is checked against direct scoring and full forward replay. Max over histories is the exact original bound (up to floating-point summation).

For constructive prediction, start at each history's exact bigram-optimal key and refine by deterministic cyclic coordinate ascent on smoothed native trigram likelihood (backoff mass4, at most eight passes). Select the best prefix-only trigram candidate and freeze its actual key, hold history, terminal phase and last-two plaintext context; exact suffix Viterbi allows all legal literal-F/consuming-zero transitions. This refinement is **heuristic** rather than an exhaustive trigram optimizer; the separate bigram bound is exact. No suffix contributes to key or history selection.

An auxiliary exact spacing-free anchor capacity counts the maximum disjoint dictionary intervals with ≥9 active runes (physical length≤24). Use the fixed TextBlob lexicon plus nontarget solved-native words, canonical greedy GP spelling. For each history, group words by literal-F mask and require every active rune's inferred key value to belong to its full-prefix domain and agree on repeated phases within the word. Earliest-finish scheduling yields the maximum disjoint intervals, allowing different keys for different anchors. This is deliberately relaxed; the original q13 cap is non-discriminating. Never interpret these isolated words as one compatible plaintext.

## Independent planted recovery

Each plant is a separate 299-rune native section slice. Exclude its entire source section from native scoring and native-word augmentation. The deterministic 32-bit LCG keys are sampled until the prefix contains exactly one consuming zero in addition to its genuine held Fs, selecting only sparse-zero geometry (not language or recovery scores), so every plant exercises ambiguity. This is a matched sparse-zero calibration, not an assertion of recovery for arbitrary zero-rich inputs.

| Period | Native section / offset / seed | Key draws | Prefix zero histories | Exact key | Fit | Frozen p55-size holdout | Exact bigram score |
|---|---|---:|---:|---|---:|---:|---:|
| 8 | WELCOME / 0 / 3301 | 63 | 128 | yes | 223/223 | 76/76 | -613.596305 |
| 8 | KOAN1 / 350 / 1033 | 68 | 32 | yes | 223/223 | 76/76 | -589.974486 |
| 13 | LOSS OF DIVINITY / 0 / 133 | 48 | 32 | yes | 223/223 | 76/76 | -631.046789 |
| 13 | KOAN2 / 0 / 331 | 121 | 8 | yes | 223/223 | 76/76 | -586.873760 |

All four true keys are the exact bigram winners already; refinement preserves the true key and F history. All fitted and held runes replay exactly. The controls contain 7,5,5,3 visible prefix zeros respectively.

## Original decision

| Period | Legal p54 histories | Exact compatible key-history pairs | Global best bigram | Best refined trigram | Relaxed ≥9-active anchor max | Frozen p55 |
|---|---:|---:|---:|---:|---:|---|
| 8 | 8/8 | 1,957,662,243 | -919.486238 | -986.748633 | 6 | no legal path |
| 13 | 8/8 | 28,663,707,928,888,320 | -877.054461 | -952.433771 | 24 | no legal path |

The selected q8 prefix key [18,17,14,0,18,27,27,16] holds indices56,186; q13 [23,18,19,27,3,25,7,15,27,10,0,18,27] holds indices32,56. They replay the original prefix exactly but produce nonprose and no legal frozen continuation. The q8 exact bigram key differs at slot3 (3 instead of 0), emphasizing the distinction between bigram certificate and trigram winner. The complete 299-rune original admits some other legal keys: exact full-tape key-history counts from a separate feasibility calculation are 1,226,639,469 (q8) and 23,137,930,578,778,572 (q13), across all 64 zero histories each. Thus suffix failure is a prediction failure, not a claim of universal structural impossibility.

The original model is trained on all nine solved-native sections. Its minimum over all 1,481 within-section contiguous 223-rune native windows is -568.942932. To test the concern that this is in-sample, apply the **same frozen model** to three independently authored and repository-pinned donor tapes using the established GP normalization and crop conventions:

| Reference | 223-rune windows | Worst bigram score | At or below q8 optimum | At or below q13 optimum |
|---|---:|---:|---:|---:|
| Gibran | 46,612 | -685.142775 | 0 | 0 |
| Shakespeare | 216,884 | -730.423114 | 0 | 0 |
| Emerson | 307,048 | -698.696843 | 0 | 0 |

No possible q8 or q13 key-history pair can produce a 223-rune fitting prefix with bigram score as high as even the worst of these 570,544 independent reference windows. This is an all-key conditional register exclusion, not an unconditional theorem about every imaginable English text. It is substantially stronger than failed heuristic key recovery. The q13 anchor bound allows up to 24 independently compatible intervals and therefore does not select a key; all-key language optimization is the discriminating gate.

## Reproduction and scope

- [Exact receiver and positive-control SFT](../sims/lp2_ciphertext_width_keyword_sft.cjs): from the repository root run `node sims/lp2_ciphertext_width_keyword_sft.cjs original 8` and `original 13`; controls `0 8`, `1 8`, `2 13`, `3 13`.
- [Independent reference-floor SFT](../sims/lp2_ciphertext_width_reference_floor_sft.cjs): `node sims/lp2_ciphertext_width_reference_floor_sft.cjs`.
- [Original q8 raw](lp2-ciphertext-width-keyword-original-q8.json), [original q13 raw](lp2-ciphertext-width-keyword-original-q13.json), [control 0](lp2-ciphertext-width-keyword-0-q8.json), [control 1](lp2-ciphertext-width-keyword-1-q8.json), [control 2](lp2-ciphertext-width-keyword-2-q13.json), [control 3](lp2-ciphertext-width-keyword-3-q13.json).
- Canonical corpus blob 054f2a0f780b7d46901acbe3d9bf4f0ac1801165; native source 1b064ef6d85819b7d96adaff31a82d1ec551598f. Donors Gibran df260a07d56bf5998d40a6360b6132c35c252d10; Shakespeare 94c677ad9dd50771c6670e0c4e4dad9052b46d85; Emerson a92be8ba5b3511a003a22ba31523c14397aaa83a.
- Executed the committed experiment cores in connected V8 against repository inputs; standalone Node filesystem wrapper and CI not run. The native controls use sparse-zero selection by design. The reference-floor computation was executed in equivalent connected V8 prior to committing its standalone wrapper.

Retire this frozen law on the specified geometry; no new width alias, reset, phase, period or origin sweep is justified. The exact circular-factor DP is reusable for a genuinely source-selected short public clock with local phase jumps. The negative does not exclude other encoding layers, clock laws or non-native plaintext registers.
