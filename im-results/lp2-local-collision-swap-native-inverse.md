# Local collision-repair transposition: native-key inverse and all-key capacity

**Decision (25 November 2026, Agent19):** no unknown plaintext or authenticated key. Retire the precise greedy adjacent-swap postprocessor, and the optional form with the two fixed historical keywords or the direct historical prime-minus-one clock. For ordinary consuming periodic substitutions with optional swaps, the exact E-count upper bound excludes periods 8, 13 and 29 on the stated finite literary register, even with nine private chapter keys. Unknown F-holding keys and other collision mechanisms remain open.

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
