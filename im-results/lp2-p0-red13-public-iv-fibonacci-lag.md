# Original p0 rubric as a public Fibonacci-lag IV

**Decision (Agent25, 26 November 2026):** All 24,388 nonzero coefficient triples of this particular source-seeded GF29 recurrence fail continuous historical F-hold support across original p0–55. The ordinary-consuming variant has no prose under exhaustive scoring of the opening chapter. Both blind synthetic encryptions of authentic held-out native sections recover the hidden coefficients and all continuation symbols. No original plaintext or authentic key.

## Source-selected hypothesis and rival

The actual p0 heading is two red groups (8+5 GP29 symbols) before the red 13-dot mark. The original p15 graphic has an independently solved Fibonacci-prime construction, which supplies the numbers 5, 8, 13. Treat the actual 13 heading indices, in original printed order, as a public initialization register rather than a plaintext crib or a repeated key. The first black rune receives the first *generated* key symbol. The p15 graphic does not instruct this recurrence, and the heading may be ordinary encrypted rubrication. This is a narrow exploratory receiver, not an established clue.

Previous [EPIPHANY SEECS crib-seeded 5/8/13 recurrence](lp2-p0-epiphany-fibonacci-lfsr-strictf-gate.md) infers the initial 13 **keystream** symbols by assuming a title plaintext; it is not repeated here. The [literal 8+5 periodic-layer receiver](lp2-p0-red8-red5-two-layer-fhold-original-gate.md) and [title key permutation](lp2-p0-red13-13dot-blackbody-original-source-adjudication.md) are also distinct. The present family removes the title crib entirely, using a single immutable 13-element seed from the source. It does not claim this difference itself supplies independent historical evidence.

## Exact model

The seed is `[15,8,18,3,6,19,27,0,15,26,18,21,5]`. For every coefficient triple (a,b,c) in GF29³:

```
Z[0..12] = red title
Z[t] = a*Z[t-13] + b*Z[t-8] + c*Z[t-5] mod29
K[j] = Z[13+j]
```

Use historical p56-style F-hold addition (F=0 emits literal 0 without advancing, otherwise C=(P+K[j]) mod29 and consumes one key), and separately ordinary addition without a hold. The exact F reachability automaton retains every legal consumed cursor. It does not need word lengths, singleton assumptions or a dictionary. Both sign directions are not separately granted; the raw seed and positive additive operation were frozen. The first 249 black p0 runes select the key by a smoothed GP29 trigram score; the next 467 p1–2 runes are continuation under the unchanged key. All prefix cursor/last-two-rune states are retained for the selected key. The native scorer uses seven pinned solved-native sections excluding both 716-rune plant donors. This split is independent within this experiment, not a collectively unseen original LP2 holdout.

## Constructive recovery calibration and original result

| Input | Mode | Prefix-feasible triples | Full-chapter feasible triples | Selected prefix score | Continuation score |
|---|---|---:|---:|---:|---:|
| Native KOAN1 plant | F hold | 226 | 5 | −2.267858 | −2.565846 |
| Native LOSS OF DIVINITY plant | Ordinary | 24,389 | 24,389 | −2.729958 | −2.694032 |
| Original p0 black→p2 | F hold | 1,426 | 3 | −4.326115 | extinct |
| Original p0 black→p2 | Ordinary | 24,389 | 24,389 | −4.274103 | −4.686859 |

The plants use the same public seed and hidden coefficients [3,11,7] and [9,4,17] respectively. Both recover the exact coefficients, all 249 prefix and 467 continuation runes, and replay the full 716 ciphertext runes. They are controlled synthetic encryptions of actual solved text, not additional historical decryptions.

The retrospective best complete original F-hold candidate is [19,1,6], score −4.632824 nats/rune; its output is nonprose. The exhaustive ordinary full-chapter winner [16,26,26] scores −4.474356, also nonprose. Exact replay is an implementation property, not proof of a key. The ordinary comparison uses a finite native trigram model; it is not an all-language theorem.

### Exact whole-book continuation of the three F-hold survivors

| Coefficients | Legal body runes (of 12,943) | First impossible physical position (zero-based) |
|---|---:|---|
| [0,0,0] | 12,943 | none; zero pad copies ciphertext |
| [19,1,6] | 716 | p3 offset 0 |
| [20,27,16] | 848 | p3 offset 132 |

Thus no nonzero triple admits a continuous F-hold inverse over the entire original body after the p0 rubric. The exact failure is independent of the native score. A chapter reset, different seed/representation, different recurrence or ordinary-consuming register remains outside that theorem. Neither the actual title-as-IV premise nor Fibonacci-lag receiver is authenticated. Do not widen to arbitrary seed transformations or more recurrence orders without a source selector.

**Reproduction:** [single Node/CommonJS script](../sims/lp2_p0_red13_public_iv_fibonacci_lag_sft.cjs) and [raw outputs](lp2-p0-red13-public-iv-fibonacci-lag.json). The original core and whole-book continuation were executed in connected JavaScript on checked-in corpus and native controls; the combined standalone wrapper is committed but has not been independently run in Windows CI.
