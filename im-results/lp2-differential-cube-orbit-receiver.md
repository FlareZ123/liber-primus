# Differential GP29 cube receiver: actual inverse, secret partition, and sharp periodic capacity

**Agent14, 27 November 2026. Decision:** retire the tested direct cumulative-cube six-phase clock and its chapter-private arbitrary orbit-permutation extensions of periods 6 and 8 against the fixed native-language reference register; period13 is likewise excluded in eight chapters, but not by the histogram bound alone in the terminal chapter. Arbitrary per-rune cube-round counts and a wholly secret fixed input alphabet cannot align with any tested contiguous donor window. The ciphertext-only variable-round attack does not reliably recover blind controls. **No unknown LP2 plaintext, authentic key or destination recovered.** This is a distinct cumulative receiver, not a repetition of the direct pointwise cube orbit test or a new author-selected cipher.

## Source premise and explicit sender

The signed-2016 candidate `Q(x)=x^3 mod29` and six-element GP29 cubing orbit are documented in [the source-word-number study](lp2-signed2016-wordnumber-cube-operator.md) and [the adjacent red p7/p8 study](lp2-p7-p8-complete-cube-orbit-receiver.md). The interpretation is conditional and historically postselected. Direct independent cubing rounds preserve the original rune orbit histogram and have already failed native language. A cumulative operation is a distinct rival motivated by the original suppression of equal adjacent ciphertext runes: let the first physical rune of each tested chapter serve as IV, and encode subsequent positions by

```
D_i = (C_i - C_(i-1)) mod 29
C_i = C_(i-1) + Q^(k_i)(H(P_i)) mod 29
```

where H is a fixed permutation of GP29, and Q has order six. A known chart and clock provide a reversible decoder. This model accounts for equal adjacent output exactly when H(P)=0; it does not erase runes, assume printed words are plaintext words, or use transparent-F skips. The cumulative combiner, IV policy and clock are exploratory: no signed source selects them. An independently evidenced receiver/clock, rather than another numerical fit, is required before promoting this route.

## 1. Direct fixed-round clock: blind original inverse

Use `H(P)=P-b mod29`, round count `k_i=(phase+dir*i) mod6`. Search every b, all six phases and both directions (348 configurations). Fit only the 502 increments from physical p27–28, including the chosen initial IV, and freeze the key on the remaining 930 increments through p32. The direct hypothesis b=2, phase0 is also evaluated without fitting. Train an interpolated trigram register on the first half of pinned Gibran (native GP normalization specified in the script). Two independently sourced Shakespeare/Emerson 1,432-rune plants have hidden anchors, phase and direction.

| Target | Prefix mean log probability | Frozen continuation mean log probability | Held exact runes |
|---|---:|---:|---:|
| Original, best prefix key b25/phase4/forward | −5.345735 | −5.565421 | unknown |
| Original, source-motivated b2/phase0/forward | −5.805162 | −5.800226 | unknown |
| Shakespeare plant | −2.518782 | −2.495721 | 930/930 |
| Emerson plant | −2.517880 | −2.605671 | 930/930 |

Both blind key triples are exactly recovered. Every best candidate is forward-replayed, including the original. Original previews are nonprose. Replay is automatic for every fixed key and is only a correctness invariant.

## 2. Exact arbitrary-round crib inverse with an arbitrary static secret alphabet

Q has orbit sizes 1,1,6,6,6,6,2,1, including the singleton 0,1,28. With entirely arbitrary round counts k_i, observing D_i gives its orbit. For an aligned candidate P, every repeated plaintext label must map to the same observed orbit, and at most that orbit's cardinality of distinct plaintext labels may map to it. These two conditions are **necessary and sufficient**: assign distinct residue labels in each demanded orbit, complete the partially specified chart to a bijection, and choose a power of Q taking each assigned residue to the corresponding observed D. This permits all secret per-position round counts and every fixed input chart, without a fitted English key. Each chapter is granted a separate chart and a freely supplied initial IV. It does not permit a changing chart or reordering plaintext before the receiver.

Test all contiguous exact-length windows of the pinned Gibran, Shakespeare, Emerson and nine authentic transcribed solved-GP records separately. Normalize the literary files by the explicitly frozen QU→CW, V→U, K/Q→C, Z→S, ING→NG, IO→IA convention and greedy GP digraphs. Full-length comparisons across nine chapters: **0 / 5,370,737**; first 32 increments of each chapter: **0 / 5,431,788**. These are finite reference alignments, not independent random samples. Two separate hidden static-chart, variable-round plants each recover their correct 1,432-rune source window as the unique compatible window in the corresponding donor; each admits a constructed compatible chart and exact forward replay of 1,432/1,432 increments. Chart and individual round counts are not asserted unique.

## 3. Blind ciphertext-only variable-round receiver

Grant a uniformly random independent Q-round count (likelihood assumption, not a source rule). Conditional on the orbit, each D has constant probability within that orbit. A chart's membership partition therefore suffices for exact observed-orbit likelihood. Train a GP interpolated trigram language model on 225,546 runes (Gibran, first half Emerson and first five solved records). Optimize the chart on only the 502-rune p27–28 prefix: six 1,800-swap bigram marginal-likelihood anneals, then three 900-swap trigram likelihood refinements. Freeze the winning partition. Exact forward likelihood and exact Viterbi decoding under the fitted chart are calculated on the untouched 930-increment continuation. Every returned Viterbi sequence can be reencrypted by choosing compatible per-position powers; that is not proof of plaintext.

| Target | Frozen held orbit likelihood (nats/increment) | Uniform GP orbit baseline | Recovered held plaintext | Held plaintext with true chart |
|---|---:|---:|---:|---:|
| Original | −1.829170 | −1.781841 | unknown | unavailable |
| Shakespeare plant | −1.854167 | −1.925846 | 230/930 | 576/930 |
| Emerson plant | −1.886711 | −1.928700 | 298/930 | 654/930 |

Only 10/29 and 15/29 hidden orbit memberships were recovered. Even supplying the true membership does not fully recover the plaintext under this LM; this is evidence of underidentification and limited attack calibration, not a general impossibility theorem. The original fitted model scores below its uniform-label baseline and produces English-like fragments through language-model selection. Do not call them recovered prose. The explicit original candidate, fitted chart and chosen round counts are retained in raw output for reproducibility only.

## 4. Sharp all-key periodic concentration bound

Broaden the model: give each chapter any static secret input chart H and any arbitrary orbit-preserving permutation at each phase of period q. Even different permutations inside each of the eight orbits are granted, so this includes every periodic cube-round schedule and a strictly larger family. Ignore printed word and plaintext ordering constraints entirely.

For each orbit O and phase j, let the original difference-rune counts within O be sorted descending, `a[j,O,r]`. A fixed set of r candidate plaintext labels in O can receive at most the r largest phase-local counts, hence its total across all q phases is bounded by the corresponding sum. Align every phase's ranks inside each O. Concatenate `b[O,r]=sum_j a[j,O,r]` across orbits and sort globally. For every k=1..29, the top-k plaintext frequency sum is at most the sum of the k largest b entries. These bounds are **simultaneously sharp** in the relaxed arbitrary orbit-preserving permutation family: rank-alignment constructs a particular inverse attaining every bound, verified against every original target. Any static H merely relabels the resulting counts.

Test q=6 (source cubing order) and native historical periods q=8,13. Grant each of the nine chapters a private chart and private phase maps. Compare all k, every matched native window, with no order constraints:

| Physical pages | Increments | q6: smallest max rank deficit | q8 | q13 |
|---|---:|---:|---:|---:|
| 0–2 | 728 | 96 | 80 | 67 |
| 3–7 | 1144 | 196 | 189 | 131 |
| 8–14 | 1728 | 332 | 310 | 275 |
| 15–22 | 1902 | 413 | 341 | 317 |
| 23–26 | 1020 | 163 | 162 | 108 |
| 27–32 | 1432 | 275 | 243 | 203 |
| 33–39 | 1679 | 316 | 316 | 257 |
| 40–53 | 3007 | 668 | 639 | 554 |
| 54–55 | 307 | 8 | 9 | 0 |

The deficit is the minimum over donor windows of the maximum over k of native top-k minus the sharp original bound. A positive value excludes all matched native frequency inventories regardless of plaintext order. Both q6 and q8 pass **zero** of 5,370,737 windows each. q13 passes only 27,736 of the 601,152 terminal windows and zero in the other eight chapters. The terminal q13 survivors are necessary-frequency candidates, not decodes; the stronger ordered arbitrary-round gate in section 2 rejects every exact contiguous window there. Six plants with secret arbitrary orbit-preserving maps and secret alphabet pass all 29 inequalities. Two distinct donor passages were reused across the three period controls, not six independent texts. A first runtime attempt at the rank gate stopped on a const reassignment; the corrected implementation executed completely and includes independent sorted-count checks at regular window intervals.

## Causal decision and limits

This rules out the direct cumulative fixed-clock receiver and sharply constrains its periodic private orbit-permutation extension. Variable per-position rounds cannot be justified by a language-looking inverse with discretionary chart and clock. Reopen only if an independently selected output chart, nonperiodic phase law, altered observation order, or real plaintext pairing changes this decision. The finite donor tests do not rule out all possible native-like prose, arbitrary changing charts, other nonlinear operations or a second cipher layer. No change to the established-results synthesis is justified by a conditional receiver failure.

## Reproduce

All three code cores executed in connected V8 using the exact fetched source inputs, with the input blob SHAs preserved in the raw JSON. Standalone Windows Node wrappers have not been separately executed; no workflow was created. From repo root:

- `node sims/lp2_differential_cube_orbit_receiver_sft.cjs` ([raw](lp2-differential-cube-orbit-receiver-output.json))
- `node sims/lp2_differential_cube_orbit_blind_partition_sft.cjs` ([raw](lp2-differential-cube-orbit-blind-partition-output.json))
- `node sims/lp2_differential_cube_orbit_periodic_capacity_sft.cjs` ([raw](lp2-differential-cube-orbit-periodic-capacity-output.json))

The six scripts/output objects were fetched back from main before this synthesis.
