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

## Agent 38 — blind transparent-F cycle AND ragged column order (28 November 2026)

This closes the constructive algorithmic gap between the preceding fixed-title-order F-hold search and ordinary-clock joint search. Test the same 716 black opening runes, with authentic plaintext-F hold (F emits F and consumes no key, all other runes consume and cannot decrypt to F) followed by unknown width-13 ragged columnar transposition. The long-column split, column permutation, additive cycle and F mask are secret. No source authenticates this composition.

For a known cycle, a shared column-prefix beam retains starting phase, number of held F's and last hold/consume in every row. Exact remaining-column feasibility allows independent suffix permutations per row solely for pruning; compose phase trajectories across rows. At complete order the objective equals exact legal Viterbi. Beam 256 at every depth, all 13 physical splits.

For unknown cycle, alternate exact conditional optimizations of a row-local bigram objective:
- Given order and mask, adjacent consuming symbols give pair potentials on a cycle of 29-valued key variables; held F contributions are unary/constant. Enumerate first key value, optimize the cycle by DP.
- Given key and physical hold mask, phase after visiting subset S is start + |S| - held(S) mod q. Row starts depend only on preceding rows' total holds. Thus decoded adjacent columns depend on subset/last column, enabling exact Held–Karp order DP.
- Given key/order, Viterbi optimizes hold mask. During alternating search only, permit illegal consuming F with six-nat penalty to traverse disconnected basins; final inverse is strictly legal.

1000 starts per split (13,000 per case), at most 20 iterations, random starts and perturbed elite states, seed 7701033+3301*split. Keep top eight states, refine key cycles with legal prefix beam. Choose best LEGAL_WIN training score across all splits. Native GP unigram smoothing .2, bigram backoff8, quantization128/nat; exclude entire target native section from training. Train rows 1–37 (481 runes), bridge38, withheld39–54 (208 runes); row0 and last singleton also excluded. Across all possible splits training and withheld physical positions are disjoint. Free training initial phase permits cycle rotation. Freeze end phase for bridge and holdout; independent complete inverse must replay ciphertext exactly. Global joint search is heuristic.

| q13 input | Key and order recovered | Train nats/rune | Bridge+held nats/rune | Exact held/full |
|---|---|---:|---:|---:|
| KOAN1, historical key plant | both | -2.48379 | -2.77955 | 208/208; 716/716 |
| LOSS OF DIVINITY, random key plant | both up to cycle rotation | -2.78900 | -2.68701 | 208/208; 716/716 |
| Original black p0–2 | none established | -4.07480 | no legal path | no legal full inverse |

Both plants recover all 481 training runes. Seeds3301/3302 produce distinct hidden orders, and control2 generates random key after permutation. Original training winner split11 has no legal held or complete path; 12/13 split winners have no complete legal inverse. Split4 does replay fully but scores -4.62807 nats/rune, nonprose. Its existence means no all-key legality exclusion. Known-cycle solver independently recovers both planted orders and 1432/1432 runes with historical q13 key supplied. For original, historical, literal red13, conditional EPIPHANY SEECS difference cycles give train -4.41239/-4.44562/-4.47622, no legal held/full path for each selected order.

**Decision:** working constructive blind algorithm on this composite model, no authentic unknown plaintext or key. Retire bounded q13 attack. q8 is a separately tested possible clock (same width13, title 8+5 and authentic LP1 q8); no arbitrary additional periods selected.

Reproduce from repo root (C++17 GCC/Clang; local Linux GCC executed, no CI claim):

```sh
node sims/lp2_p0_column13_joint_exact_input.cjs tapes.txt
g++ -O3 -std=c++17 -DPERIOD=13 sims/p0-column13-fhold/joint_generic.cpp -o joint13
g++ -O3 -std=c++17 -DPERIOD=13 sims/p0-column13-fhold/solver_generic.cpp -o solver13
./joint13 tapes.txt control1 4 1000 20 6
./joint13 tapes.txt control2 0 1000 20 6
./joint13 tapes.txt original 11 1000 20 6
./solver13 tapes.txt 256 all
```

For complete blind selection run each case for splits0..12, choose best training score, never holdout. Both actual source files transferred with exact local Git blob matches; [code](../sims/p0-column13-fhold/), [raw q13 scores](lp2-p0-column13-blind-native-fhold-q13.json).

### Period 8 and reverse layer order: completed blind controls

**Same layer order, q8:** apply the same q13 joint receiver and budget, compiled with PERIOD=8; the historical DIVINITY cycle and a random q8 cycle are independently planted. Both true keys (rotation-equivalent), both unknown column orders and all 1432 native runes recovered; 416/416 withheld. The original training winner split4 score -258321/61568 = -4.19570 nats/rune; all 13 split winners have no legal held or full path. This is a bounded heuristic negative.

**Reverse order:** first transpose plaintext into physical columns, then apply the authentic F-hold clock continuously along physical ciphertext. This is distinct from transposing after encryption. Retain the identical physical train/bridge/held coordinates. Relax the starting phase of each training column independently (a superset of any globally continuous physical clock). For a fixed key, enumerate every legal mask/phase path in every column; the row-local GP bigram objective is a generalized traveling-salesperson path through column groups and path variants. Subset/last-variant DP optimizes all 12! column orders per fixed long-column split and all variant assignments exactly. After freezing key/order, predict each column's held section from its training end. Separately enumerate all full legal physical clock paths with exact suffix-count pruning; rank using only training row scores, not withheld language. This may repair a relaxed training path that cannot be globally connected. Full enumeration cap 10 million, never reached in these runs.

For unknown key, 300 random unigram starts per split alternate independent-column HMM (free phases, six-nat illegal penalty) with exact shift histogram optimization, keep best 64 distinct cycles. Run 80 joint starts, alternating exact subset order DP with fixed paths, exact chain variant DP with fixed key/order, and single- and pair-coordinate optimization of the general key phase graph (not globally exact). At most 15 joint iterations. Seed 33017713+3301*split. Retain best 16 states, refine their cycles with exact legal generalized order DP, choose best training score across all 13 splits.

| Reverse input | q | Recovered key/order | Exact train / independent held / global full |
|---|---:|---|---|
| KOAN1 historical plant | 13 | both | 481/481; 208/208; 716/716 |
| LOSS random plant | 13 | both | 481/481; 208/208; 716/716 |
| KOAN1 historical plant | 8 | both | 480/481; infeasible relaxed continuation; 713/716 |
| LOSS random plant | 8 | both | 478/481; 208/208; 702/716 |
| Original opening | 13 | none | score -233123/61568, no held path, zero global legal paths |
| Original opening | 8 | none | score -241489/61568, no held path, zero global legal paths |

Both q8 control ambiguities persist even when the true cycle is supplied: the bigram model prefers a few incorrect F-path symbols. The exact global decoder counts 13752/252 legal full paths for the q8 controls, 8/7776 for q13; hence key/order recovery does not imply a unique plaintext under the Fhold rule. This is explicitly imperfect q8 full-text calibration, not a failure to recover key/order. The original has zero legal global paths for each of the 26 split winners (13 per period); all also fail independent per-column held prediction. Fixed historical/red/conditional-title cycles for reverse order q13/q8 also have zero global legal paths (two q8 cases already impossible on every training split). Since encryption is last, this legality constraint for a given key is independent of the transposition. No exhaustive claim over unknown keys.

Build with `g++ -O3 -std=c++17 -DPERIOD=13 sims/p0-column13-fhold/reverse_joint.cpp -o reversejoint13`; use PERIOD=8 for q8. Run `./reversejoint13 tapes.txt control1 4 300 80` or control2/original, all splits0..12. Fixed-cycle exact solver: compile reverse.cpp instead and run `./reverse13 tapes.txt control1` (or control2, original-historical, original-red, original-title). Local executions completed; [q8/post and reverse raw split scores](lp2-p0-column13-blind-native-fhold-q8-reverse.json). No new unknown plaintext/key.

### Authentic p56 prime-minus-one stream, unknown column permutation

A third distinct receiver uses the actual p56 nonperiodic stream `(prime[j]-1) mod29` with the same native F-hold rule, then unknown width-13 ragged transposition. No fitted key values. The prefix-state DP replaces periodic phase with cumulative hold count and row-absolute index. The suffix table contains exact reachable cumulative hold bitsets for each remaining column subset, independently relaxed per row, and composes row trajectories. The training origin ranges 0–26 to cover the first omitted row and possible 12/13 consumed red-heading symbols; full replay tests origin 0,12,13. Beam256 per depth and all 13 physical splits; identical train/bridge/withheld partition and native language model.

Both independently permuted native controls (seeds3301,3302, origin0) recover exact order and all 481 training, 208 held and 716 full runes. Original training winner split12 scores -4.41429 nats/rune, key start1/end472, no legal bridge/held path and no complete inverse. **All thirteen original split winners** fail both held continuation and full replay at origins0,12,13. This is a calibrated bounded beam result, not a proof over every permutation. No original plaintext/key. Retire this receiver at this budget; a genuinely new source-selected operation is required to justify further variation.

Reproduce: compile `g++ -O3 -std=c++17 -DPERIOD=13 sims/p0-column13-fhold/prime_column.cpp -o prime_column`, then run `./prime_column tapes.txt control1 4 256` (control2/original and all splits0..12 for complete blind selection). Local GCC execution completed; [raw split scores](lp2-p0-column13-prime-fhold-blind.json). The C++ source is exact local Git blob 7dfff1470b449bef9b39f80a176a6b334d05351c.
