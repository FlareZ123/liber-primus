# Opening red13 columnar inverse with blind historical F-hold key recovery

**24 November 2026 · Agent 1 · Constructive original-cipher attack, bounded negative.** No new unknown LP2 plaintext or authentic key recovered.

## Causal hypothesis

Physical p0 has a red 8+5-rune heading and a 13-dot mark immediately before black prose. The p0–2 pages share the distinctive paired cross artwork and comprise 716 black body runes. A human might read the red13 heading as a column key (stable GP0 numeric order), then use the historical additive/F-transparent mechanism demonstrated in LP1. This is a conditional composite mechanism: the artwork/heading do not themselves authenticate either a columnar layer or additive clock.

The [raw red13 pure columnar test](lp2-p0-red13-columnar-body-gate.md) already tested a p0-only pure transposition; the [signed-title composite](lp2-p0-signed13-title-columnar-shared-cipher-gate.md) already tested a 13-shift key fixed by a conjectured EPIPHANY SEECS crib. Neither recovered plaintext. The present experiment instead recovers a secret periodic key *without a title crib*, after a fixed whole-chapter columnar inverse, with all latent plaintext-F holds handled explicitly. It is also distinct from the [earlier blind F-hold recovery](agent15-periodic-fhold-blind-key-recovery.md) on untransposed p0.

## Frozen decoder and predictive split

Source: canonical `resources/liber-primus/lp2-corpus.json`, physical p0–2 concatenated, drop only the original 13 red title runes. Stable-sort title indices `[15,8,18,3,6,19,27,0,15,26,18,21,5]` to obtain column order `[7,3,12,4,1,0,8,2,10,5,11,9,6]`. Inverse ragged row-write/column-read, 13 columns and 716 symbols. The row-order prefix [0,358) is the key-fit input; the row-order suffix [358,716) is withheld from key selection. Because this is a fixed transposition, the original physical column blocks interleave training and holdout positions; there is no learned permutation or use of suffix ciphertext in fitting.

Encryption model: for non-F plaintext, C=(P+K[j]) mod29 and advance j modulo period; plaintext F emits F with no advance. Then apply the fixed columnar transposition. Periods 8 and 13 are fixed from the actual LP1 keys. Ciphertext F branches between hold and ordinary non-F consumption. For each period, use 1,800 deterministic mask-seeded starts, unigram coordinate refinement (up to 15 sweeps), retain at most 128 keys ranked by prefix unigram score, rerank by exact fixed-key trigram Viterbi on the same prefix. Freeze the winning key **and** terminal phase and two-rune context; run Viterbi on the disjoint 358-rune suffix. Separately check complete-page key feasibility without requiring the frozen prefix path. No original holdout score is used to select keys.

Training: pinned `resources/external/relikd-solved-gp29-native-v1.json`; exclude the entire native target section from each planted control's language model. Original fitting uses all known native sections including solved LP2 p56/p57. Controls use native KOAN1 and LOSS OF DIVINITY, respectively, truncated to 716 runes and encrypted with the two historical keys under the new composite architecture. The true keys are only used for control generation and comparison; no key dictionary or target crib enters the fitting routine.

## Results

| Period / input | Distinct prefix keys | Winning key | Prefix score (nats/rune) | Frozen suffix score | Complete key legal? | Exact native prefix / suffix |
| --- | ---: | --- | ---: | ---: | --- | --- |
| 8 native KOAN1 plant | 286 | DIUINITY | -2.497561 | -2.906186 | yes | 355/358, 357/358 |
| 13 native LOSS plant | 67 | FIRFUMFERENFE | -3.067039 | -2.910267 | yes | 352/358, 358/358 |
| 8 original p0–2 body | 1,292 | TBARORIAU | -3.588392 | no legal path | no | unknown |
| 13 original p0–2 body | 1,340 | PUOEJYEEARFPIATHAE | -3.578034 | no legal path | no | unknown |

Both native keys rank first, and the 715/716 combined held-out rune score is independently compared with the original native inputs. Both controls forward-replay exactly despite residual F-path ambiguity; key recovery is exact, plaintext recovery is not exact at every prefix position. All selected original prefix candidates also re-encrypt their fitting ciphertext. The original winning key indices are [16,17,24,4,3,4,27,1] and [13,1,22,11,26,18,28,4,0,13,27,2,25]. Neither admits *any* legal full-chapter F-hold path, even if lower-scoring prefix paths are permitted. Neither prefix is sustained prose. Original runner-up gaps are only 2.494 and 6.837 nats, compared with control gaps 198.738 and 9.645.

An additional exhaustive support count on the 358-rune original row-order prefix (20 visible F) finds 1,048,450 feasible F masks for q8 and all 1,048,576 for q13. This is not a count of distinct keys; numerous masks can share keys. The search does not exhaust that joint key space. This auxiliary count is diagnostic, not an all-key exclusion.

## Decision

Retire the fixed red13 whole-chapter columnar/continuous historical q8 or q13 mask-seeded **predictive search** as a recovery route under this language model. The two independent controls establish that the procedure can recover real-sized hidden keys for the proposed layer order, but the original prefix-selected keys fail even the relaxed complete-key feasibility test. Do not infer an all-key exclusion. The distinct ordinary-clock arbitrary-order experiment below addresses a different receiver; do not expand phases or periods absent an independent source selector. A different cipher architecture, different framing or new independently sourced key remains open.

Reproduce from repository root:

```sh
node sims/lp2_p0_red13_columnar_blind_fhold_sft.cjs
```

The SFT reports candidate plaintext, scores, key indices, exact replay assertions, and holdout comparison. No CI run was started; the experiment executed directly against the repository corpus through the connected runtime.

## Agent 45: exact unknown-column and ordinary q13 key inverse (25 November)

This is a distinct, all-consuming clock experiment: neither the red-title-derived permutation nor a key is supplied. Every possible physical placement of the long column (13), permutation of the twelve remaining columns (12!), and 13-component GF29 additive key (29^13) is represented. Plaintext is written row-major with width 13, shifted by plaintext column, then transmitted column-wise in an unknown permutation; the single 56-symbol column must be plaintext column zero. The other twelve columns have 55 symbols. No authentic F hold is assumed in this experiment.

For each split, assign each physical column and candidate shift a vector of decoded training symbols. Precompute directed pair scores across rows for all adjacent column/shift assignments, plus the first-column unigram. Held–Karp subset dynamic programming over (used-short-column mask, last column, last shift) exactly maximizes the sum of quantized row-local unigram/bigram log probabilities. The recurrence adds a new unused column and its shift; backtrace gives the complete permutation and key. This is an exact optimum for the specified objective, not an exact optimum for a higher-order language model. Cross-row bigrams are omitted. The model uses native source unigram smoothing 0.2 and bigram backoff weight 8, with log scores rounded to 1/10000 nat.

Fit on zero-based complete rows 1..37 (481 symbols), hold out rows 39..54 (208 symbols). The union of all fitting physical positions across **all thirteen possible long-column placements** is disjoint from the corresponding union of holdout positions, asserted by the executable. No held-out score selects any permutation, shift, or split. The native control target section is excluded from training.

| Input | Fit nats/rune | Frozen holdout nats/rune | Exact recovered symbols |
|---|---:|---:|---:|
| KOAN1 first window | -2.48397 | -2.77268 | 716/716 |
| LOSS first window | -2.78898 | -2.71304 | 716/716 |
| KOAN1 final window | -2.54829 | -2.70558 | 716/716 |
| LOSS final window | -2.75985 | -2.73495 | 716/716 |
| Uniform null | -3.96551 | -5.21065 | n/a |
| Repeat-suppressed null | -4.00515 | -4.96389 | n/a |
| Original p0–2 body | -3.99258 | -5.22688 | unknown |

All four planted permutations and all 52 planted key shifts recovered exactly; 832/832 withheld native symbols recovered. The four windows overlap within two sections and are not four independent prose draws. Null two resamples 93.4% of encountered equal adjacent draws; it is not matched to the original exact repeat count. The original's held-out score is worse than either null and the complete decode is not sustained prose. The original winner is physical long-column position 5 (zero-based), plaintext-to-physical order [5,9,4,3,10,7,0,1,12,2,6,8,11] and shifts [19,10,13,25,3,26,22,11,16,20,24,19,19]; exact quantized training objective -19204329. Forward replay is 716/716, as it must be for any legal inverse.

**Decision:** retire the exact bigram predictive receiver for the ordinary q13 pre-transposition additive architecture on this body. The original does not support the winning key or order as plaintext. This is not a mathematical exclusion of every possible language/key under that architecture, and does not exclude arbitrary column orders with historical F holds or other clocks. No source authenticates the proposed transposition. The useful outcome is a constructive blind joint inverse, not a new Liber Primus solution.

Reproduce from repository root (C++17 GCC/Clang, Node CommonJS):

```sh
node sims/lp2_p0_column13_joint_exact_input.cjs tapes.txt
g++ -O3 -std=c++17 sims/lp2_p0_column13_joint_exact_sft.cpp -o column13
./column13 tapes.txt --original
```

The local compiled executable ran all seven searches, including four native controls and two nulls before the original. Canonical generated input matches local input length 3812 and FNV-1a 0x3e61f706. No CI run claimed. The executable reports all split objectives, keys, permutations and complete decoded sequences.
