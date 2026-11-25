# Local collision-repair transposition: native-key inverse and all-key capacity

**Decision (25 November 2026, Agent19):** no unknown plaintext or authenticated key. Retire the precise greedy adjacent-swap postprocessor, and the optional form with the two fixed historical keywords or the direct historical prime-minus-one clock. For ordinary consuming periodic substitutions with optional swaps, the exact E-count upper bound excludes periods 8, 13 and 29 on the stated finite literary register, even with nine private chapter keys. The exact q8/q13/q29 unknown-key F-holding combination is now excluded on the p40–53 finite native register (see final section); other periods and collision mechanisms remain open.

## Why this operation was considered

LP2 has only 86 adjacent equal glyphs in 12,955 transitions. A human can suppress ciphertext collisions without inserting a null or discarding a key symbol: on encountering a duplicate, swap it with the next unequal glyph. This is a local, length-preserving operation, distinct from collision redraw, collision-null insertion, arbitrary whole-word shuffle and dynamic alphabet adjacent-transpose rank updates. It needs no assumption about the printed word boundaries. The source does not explicitly instruct this operation; low-repeat structure motivates it, while authentic LP1 keywords and the p56 prime clock select the inner cipher candidates. No key or transposition is authenticated merely by this motivation.

Define raw ciphertext X and output Y. Start with an empty output. At input position i, if X[i] equals the last emitted glyph A and X[i+1] exists and differs from A, emit X[i+1], X[i] and advance by two; otherwise emit X[i] and advance by one. In the optional model, independently perform the available swap with probability 0.8. That probability was chosen before plaintext scoring, approximately 1−86/(12955/29), a crude uniform-raw baseline rather than a fitted physical parameter. It is not an exact predicted repeat rate. The transform is not injective without swap-event information; the inverse therefore retains every legal local path and uses native rune bigrams to select a candidate. Exact reencryption checks the chosen event witness, not unique recoverability.

## Deterministic obstruction

Any output repeat AA is a singleton emission. If there is another raw glyph, deterministic repair requires that next raw glyph also be A. Thus if the output following AA is B≠A, the following glyph must be A (the next pair was swapped). An observed AAB followed by another non-A, or terminal AAB, is impossible regardless of the inner cipher. Exhaustive checks of all 3-symbol strings of lengths 1–7 (3,279 output strings) confirm the necessary condition.

On nine physical-page ranges, 85/86 adjacent repeats violate it. Counts of violations versus repeats: 4/4, 6/6, 9/9, 10/10, 11/11, 12/13, 12/12, 18/18, 3/3. This rules out the deterministic greedy law under these frames independent of language, keys or F handling; it does not exclude optional or differently defined repair.

## Exact optional inverse of authentic fixed keywords

An inverse edge at output offset i either emits raw Y[i] (one step), or, only when Y[i−1]=Y[i+1]≠Y[i], emits raw [Y[i−1],Y[i]] (two steps). A DAG state retains key phase, previous plaintext rune and a pending repeated singleton. That last bit accounts exactly for the 0.2 skip probability when the next raw glyph proves a swap was available. All phase starts and every legal F-hold path are explored. Viterbi maximizes the smoothed native bigram plus swap/skip log probability. No printed groups or cribs are used.

The fixed keys are the actual native DIUINITY (8) and FIRFUMFERENFE (13), with both ordinary consumption and literal plaintext-F bypass. On three separately held native donors (WELCOME, KOAN, LOSS OF DIVINITY, each excluded from the corresponding language model), 12 independent 308-rune positive controls recover all 12 planted phases, 3,645/3,696 plaintext runes, and exactly replay every cipher. MAP scores range −2.816 to −2.441 nats/rune; the remaining ambiguities are a real limitation of the noninjective receiver.

| Original range | DIUINITY ordinary MAP | FIRFUMFERENFE ordinary MAP |
|---|---:|---:|
| p0–2, 729 | −4.329582 | −4.245512 |
| p40–53, 3008 | −4.318600 | −4.315889 |
| p54–55, 308 | −4.198093 | −4.143944 |

Every F-hold combination has zero legal complete paths (six tests). The consuming MAPs are nonprose and close to 12 length-matched Markov low-repeat nulls per key (ranges −4.295 to −4.171 and −4.280 to −4.069 on the terminal-size comparisons). The short snippets in the machine output are diagnostic, not plaintext. All phases were independently optimized for each original, so this is a full-input negative, not a frozen continuation demonstration.

[Reproducer](../sims/lp2_native_key_greedy_collision_swap_sft.cjs) · [machine output](lp2-native-key-greedy-collision-swap.json).

## All ordinary-consuming periodic substitution keys

For any arbitrary phase-wise GP29 bijection (not just additive shifts), let u_r be the ciphertext glyph encoding plaintext E at phase r. The raw preimage is obtained by a nonoverlapping matching of eligible ABA swap edges. Count E on the unswapped tape with unary factors B_r(u). Each swap at positions i,i+1 changes the count by

d_i(u,v) = [Y[i+1]=u]+[Y[i]=v]−[Y[i]=u]−[Y[i+1]=v].

Relax the matching by granting the positive gain of every eligible edge independently. The resulting upper bound is a cycle of pair potentials G_r(u,v)=Σ max(0,d_i), where r=i mod q. Maximize exactly over all 29^q code vectors by fixing the first code, running max-sum DP across phases, and closing the cycle. This grants all phases, arbitrary swap decisions, arbitrary bijections and even overlapping positive-gain swaps. An exact weighted matching on the winning vector supplies an attainable lower witness; the upper is what is used for exclusion. The cipher does not need to preserve word units or even word order labels. There are 441 eligible edges on the full original.

The reference register is the existing Gibran, Emerson and Shakespeare corpora, encoded with the pinned greedy native GP29 encoder. Their 567,679 total contiguous 12,956-rune windows have minimum E counts 1407, 1482, 1397 respectively (50,159; 311,675; 205,845 windows). The number 1397 is a finite reference floor, not a theorem about every possible English text.

| Period | Whole-book shared key E upper | Nine independent chapter-key E upper | p40–53 E upper (floor 251) |
|---:|---:|---:|---:|
| 8 | 633 | 888 | 183 |
| 13 | 645 | 1006 | 193 |
| 29 | 731 | 1266 | 243 |

All shared and chapter-private aggregates are below the 1397 floor for a continuous reference-sized prose tape; the long chapter also independently fails each period. If chapters are drawn from arbitrary separate short texts the full-book contiguous-window floor need not apply. The q8,q13,q29 full-book attainable witnesses are 631,645,730. Exhaustive all-key and all-matching toy controls (194 cases) confirm bound direction. Nine independently keyed 12,956-rune literary plants pass (true E 1473,1644,1502; all true values under their respective exact uppers) and replay all 116,604 runes with the supplied actual keys and swap masks. This is a capacity control, not blind recovery of those keys.

[Reproducer](../sims/lp2_greedy_collision_swap_allkey_capacity_sft.cjs) · [machine output](lp2-greedy-collision-swap-allkey-capacity.json).

## Source-authentic prime clock with literal F bypass

Before LP2 unknown trials, replay the complete authentic p56 AN END (85/85) with C=P+(prime_j−1) mod29 and literal plaintext F emitted unconsumed. Add the same optional swap postprocessor. Grant both signs and every absolute initial prime index 0–3301. The inverse DAG combines ordinary and swapped raw edges with bitsets of all legal prime cursors. A backwards bitset recurrence enumerates every starting origin admitting a complete path; a native-bigram Viterbi selects a witness only from those paths. All F histories and all optional collision swaps are included. No word assumptions.

Three held native 308-rune donors with origins17/1033/3301 retain their actual origins among632/28/561 candidates, and select all three actual origins, recovering 907/924 runes with full exact replay. Scores −2.706/−2.474/−2.811. The 17 wrong symbols demonstrate the inherent inverse ambiguity.

All first eight original physical ranges have **zero** complete origins for both signs. The 308-rune terminal has three positive-sign origins (167,168,3047) and four negative-sign origins (991,1144,2474,3297). Best positive origin3047 score −4.341190, best negative origin991 score −4.295705. Both replay exactly but are nonprose and far below the held native controls. No independent p55 prediction or unknown plaintext results; the terminal optimization used the entire 308-rune range. Thus direct transfer of the authentic prime clock fails even after relaxing deterministic collision repair to arbitrary eligible optional swaps.

[Reproducer](../sims/lp2_prime_fhold_greedy_collision_swap_sft.cjs) · [machine output](lp2-prime-fhold-greedy-collision-swap.json).

## Next decision and limitations

Do not repeat literal native keywords, direct prime clocks or ordinary-consuming q8/q13/q29 under this local swap receiver. A novel variant would require an independently selected mechanism for the rare remaining repeats or a genuine key-state selector. The optional greedy rule is noninjective and has no authenticated sidecar; the tests did not discover one. Unknown F-holding substitution keys are not covered by the all-key ordinary bound. The physical ranges are explicit (p0–2, p3–7, p8–14, p15–22, p23–26, p27–32, p33–39, p40–53, p54–55), rather than section-boundary-adjusted ranges. Experiment functions were executed in the connected V8 runtime against the canonical repository inputs; the generated Node CommonJS wrappers were not separately executed in CI. No new source provenance work was repeated.


## Exact all-secret phase bijections with latent Fehu and optional collision swaps (Agent19, 25 November)

This closes the previously open combination of literal plaintext-F holds, arbitrary phase-wise GP29 bijections on the active stream and the optional greedy collision swap. It requires no dictionary or printed boundary assumptions. The forward swap at output i is available only in a visible ABA pattern (swap the final BA into AB); the broader relaxation permits either adjacent edge of a visible ABA, with disjoint pairs. This includes pure reverse-direction greedy repair, but does not claim to include every possible sequential mixed-direction repair whose earlier swaps destroy visible motifs.

Enumerate all legal disjoint inverse swaps, then remove any subset of raw zero glyphs. For every fixed period q, active plaintext and raw ciphertext preserve all equality tests at active lags q, 2q, 3q (including equality of adjacent pairs). A DAG over original output offsets retains the last 3q+1 active runes. For each history retain componentwise maxima of the rune and bigram counts; the maxima may correspond to different paths, making the joint rectangle conservative. A single edge emits one rune or an eligible swapped pair, each zero either held or consumed. No mask/beam limit, unknown key restriction, or lexical assumption. The peak below includes both pending output-offset maps. The 1926 exhaustive toy comparisons independently enumerate disjoint swaps and every zero mask and match both exact maxima. Four transformed authentic LP1 controls (WELCOME/KOAN, forward and reverse, underlying exact source replay) plus six separately keyed literary plants all retain the true counts and exact swap replay.

Primary target physical p40–53 (3,008 runes, 125 zeros); same three reference corpora, native encoder and 32 evenly spaced visible-length windows each as the [prior no-swap lag bound](lp2-ftransparent-hidden-pause-lag-collision-gate.md). The rate bound divides the original maxima by the smallest possible opportunity count, 3(3008−125)−6q (minus three for bigrams); each reference uses its actual active length.

| Period | Inverse | Rune upper / reference min | Bigram upper / reference min | Joint count passes | Joint rate passes | Peak states |
|---:|---|---:|---:|---:|---:|---:|
| 8 | forward | 408 / 493 | 22 / 38 | 0/96 | 0/96 | 80 |
| 8 | both visible ABA edges | 421 / 493 | 23 / 38 | 0/96 | 0/96 | 168 |
| 13 | forward | 455 / 464 | 28 / 34 | 0/96 | 0/96 | 256 |
| 13 | both visible ABA edges | 476 / 464 | 30 / 34 | 0/96 | 0/96 | 1863 |
| 29 | forward | 454 / 494 | 37 / 35 | 0/96 | 0/96 | 10432 |
| 29 | both visible ABA edges | 474 / 494 | 44 / 35 | 0/96 | 0/96 | 150903 |

All three tested periods are incompatible with all 96 fixed native literary windows under the visible-length matching rule even in the broader inverse relaxation. The results are conditional on this finite register and the single chapter-continuous key clock. They neither identify a key nor establish historical collision swaps, and they do not reject other state changes or every English plaintext. Do not repeat q8/q13/q29 key search in this exact receiver without a new independent premise.

[Reproducer](../sims/lp2_greedy_collision_swap_fhold_allkey_sft.cjs) · [raw output](./lp2-greedy-collision-swap-fhold-allkey-output.json). Actual algorithm and pinned source data executed in connected V8; standalone Node wrapper not independently run.


## Reversible spare-symbol collision repair with historical Fehu holds (Agent19, 25 November)

Distinct from greedy swapping adjacent positions, this proposed causal sender exploits the **one unused active output** in an authentic additive transparent-F row. For plaintext F=0, emit 0 and hold key index. For P≠0, compute X=P+K mod29; if K≠0 and X equals preceding published C, emit K, the otherwise unused active symbol. Otherwise emit X. K=0 deliberately keeps the native clear-F row (its spare output is F itself). Advance only for consuming input. The active row is bijective from 28 nonzero P to C≠previous output when K≠0, and to C≠0 when K=0. No overwritten active input is lost: at C=K≠0 or C=K with a valid nonzero shift, the active inverse is previous C−K mod29; elsewhere it is C−K. A visible zero may still be a hold or consume, as in the authentic F exception. All 29×29×28 active edges, and every 29×29×29 support entry, were exhaustively checked. This is a hypothesized modification, not the actual solved p56 sender or a source-selected repair instruction. Every nonzero ciphertext doublet requires a zero key digit; all other active nonzero emissions are legal. The zero-digit exception is necessary for this proposed rule to permit nonzero doublets at all.

Use first original rune as public predecessor (IV), removing its plaintext from the test. Each chapter receives a separate free starting phase/origin. Test authentic DIUINITY and **literal FIRFUMFERENFE** keyword indices, and solved-p56 prime-minus-one stream, initial prime ordinal 0–3301 inclusive. Exact reachability allows every visible zero hold/consume history, no word boundaries. Fit first 75% by exact bigram MAP over both hold flags and all origins; freeze selected origin and terminal state before opening continuation. Separately enumerate complete original reachability. Source-independent Shakespeare GP bigram prior. Three donor-excluded control tapes of 3,007 runes choose their true origin and decode the withheld 1,007 runes as follows:

| Clock | True/selected origin | Repaired | Total repeats | Fit exact | Frozen withheld exact |
|---|---|---:|---:|---:|---:|
| DIUINITY | 3/3 | 98 | 5 | 2000/2000 | 1007/1007 |
| FIRFUMFERENFE | 7/7 | 83 | 22 | 2000/2000 | 1007/1007 |
| prime-totient | 761/761 | 89 | 10 | 2000/2000 | 1004/1007 |

| Scope | Tested runes | Nonzero repeats | DIUINITY legal origins / longest prefix | FIRFUMFERENFE legal origins / longest prefix | Prime-totient legal origins / longest prefix |
|---|---:|---:|---:|---:|---:|
| p0–2 | 728 | 4 | 0 / 121 | 13 / 728 | 15 / 728 |
| p3–7 | 1144 | 6 | 0 / 52 | 2 / 1144 | 0 / 249 |
| p8–14 | 1728 | 8 | 0 / 106 | 0 / 141 | 0 / 151 |
| p15–22 | 1902 | 10 | 0 / 248 | 0 / 1003 | 0 / 1003 |
| p23–26 | 1020 | 11 | 0 / 127 | 7 / 1020 | 0 / 318 |
| p27–32 | 1432 | 11 | 0 / 14 | 2 / 1432 | 0 / 89 |
| p33–39 | 1679 | 11 | 0 / 151 | 0 / 739 | 0 / 348 |
| p40–53 | 3007 | 18 | 0 / 276 | 12 / 3007 | 0 / 928 |
| p54–55 | 307 | 3 | 0 / 19 | 1 / 307 | 2 / 307 |
| p0–55 | 12955 | 82 | 0 / 121 | 0 / 2015 | 0 / 781 |

The fixed keyword/prime-clock receiver cannot decode the whole continuous book. Shorter independent sections with prime-clock support do not establish a key; raw output retains all actual complete origins and frozen continuation outcomes, including failures. This exact reachability decision does not depend on the language model.

### Blind periodic key recovery

For q8 and q13, fit unrestricted digits using a phase-only stochastic relaxation, no printed separators. Fixed source-excluded Shakespeare unigram U; active emission weight for visible pair d=(prev,C) is V[r,d]=sum_k w[r,k] U[inverse(d,k)] over legal active inverses. Hold weight U[0] if C=0. Exact phase forward/backward sums all hold histories; aggregate active posterior edge weights by (phase,d), then compute row expected counts E[r,k]. Generalized EM uses rows proportional to (E+.03)^1.035. Eight deterministic random starts (seed 0x19fe0ca), 100 iterations each, hardening every fifth iteration; select by exact deterministic marginalized training likelihood and refine up to two coordinate sweeps. Global phase rotation is unidentifiable; report key matches up to rotation. Decode selected key using exact bigram Viterbi, freeze phase/last plaintext after first 10,000 decoded runes and replay all legal output. Random controls use two independently selected zero digits, remaining digits independently random nonzero, distinct target-excluded donor passages at native offsets 18000 Gibran and 30000 Emerson. Open original for a given q only if its independent frozen positive control has at least 95% of 2,955 withheld runes correct.

| Period | Repairs | Total repeats | Key matches up to rotation | Fit exact | Withheld exact | Withheld legal |
|---:|---:|---:|---:|---:|---:|---:|
| 8 | 260 | 183 | 8/8 | 9995/10000 | 2955/2955 | 2955/2955 |
| 13 | 299 | 108 | 13/13 | 9997/10000 | 2955/2955 | 2955/2955 |

Original:
- q8: selected key [0,15,0,0,4,0,0,4], fit marginal -4.092784 nats/rune, withheld reach 2955/2955, withheld MAP mean -4.906329513742913; R TH C Y A M W T H IA EO P X L J EA IA N E S NG O EA I NG J E AE P M E R R IA N M O T OE OE U F EA P M EA G N D EO M F B P S S EO G E IA U R EO C Y W L F E L R NG E H E EO J IA O I.
- q13: selected key [15,0,0,7,12,0,4,22,0,22,0,4,0], fit marginal -4.035684 nats/rune, withheld reach 2955/2955, withheld MAP mean -4.876196728859886; IA B M Y EA EO A L R L EO L E T J B IA A J O AE EA G X EA Y X AE TH M E U NG P C Y W D OE OE U F EA P M AE D N D M C F A P S S Y I E G E R EO EO Y E L F AE L E AE E U I EO OE C O NG.

This is an explicitly finite blind optimizer, not exhaustive over all private periodic keys. A negative control-gated search does not establish all-key impossibility; any skipped q has no original blind result. No unknown plaintext/key authenticated. No independent clue fixes the special K=0 repair convention. Retire the tested known clocks and do not promote high relaxed likelihood to a historical sender. [Reproducer](../sims/lp2_fehu_spare_collision_repair_sft.cjs) · [full output](./lp2-fehu-spare-collision-repair-output.json). Executed experiment function against pinned canonical inputs in connected V8; Node wrapper not independently executed.
