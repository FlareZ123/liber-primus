# Native-key post-encryption whole-group shuffle: exact phase-graph decision (#2678)

## Decision

Neither of the two validated solved-key additive GP29/Literal-F mechanisms can produce the unknown LP2 printed-group inventory under the 10,842-entry frozen lexical register, even with a 5% arbitrary out-of-vocabulary allowance **per chapter**. This is an exact lexical-domain obstruction under the H-shuffle premise, independent of group permutation and even granting arbitrary starting phase per group. It is not a claim about H-decoy, unknown secret keys, or all possible plaintext vocabularies. No unknown plaintext or key has been recovered.

## Inputs and inverse

The canonical physical LP2 tape has 12,956 runes in 2,896 complete printed groups; the original transcription parser joins physical line/page carries and checks exact tape identity. The nine analysis cuts are rune offsets 0,729,1874,3612,5506,6527,7960,9640,12648,12956 (seven internal dollar-mark chapter breaks plus the terminal p54 heading). Source blob identifiers are recorded in [raw results](lp2-native-key-postshuffle-phase-graph.json).

Freeze WELCOME additive offsets [23,10,1,10,9,10,16,26] and KOAN [0,10,4,0,1,19,0,18,4,18,9,0,18]. Reproduce 515/515 and 319/319 known historical ciphertext runes from the exact canonical LP1/source-native controls before testing the unknown text. For a non-F plaintext symbol p, c=p+K[s] modulo 29 and next phase s+1 modulo q; plaintext F (ordinal zero) emits zero without consuming. At every ciphertext zero both the literal hold and consuming nonzero preimage are admitted; nonzero ciphertext has one possible consuming preimage or no valid edge. For each original complete group enumerate all starting phases and every legal hold schedule, retaining exact lexical (start,end,word) triples.

The 10,842 lexical types replicate #2684's donor construction: first 80% of Gibran, Shakespeare and Emerson texts converted by frozen GP conventions, plus source-native solved sections other than the WELCOME and KOAN key controls. No unknown LP2 is used to train the lexicon. Printed groups are not authenticated plaintext words; H-decoy invalidates this lexical premise.

A shuffled sequence of groups after encipherment must admit one edge choice per group forming a directed Euler trail. The solver branches over phase-edge domains with exact suffix bounds on signed vertex degree, then uses Hierholzer traversal to check connectedness and the specified start. It verifies each witness by forward encoding. The finite original obstruction occurs **before** the graph search: an empty lexical domain cannot be rescued by any ordering, phase balance or connectivity. Allowing every missing group an arbitrary edge still requires fewer missing groups than the fixed 5% budget.

## Controls and actual recovery limits

Six target-excluded contiguous 40-group donor windows (three for each key) are selected from the final 20% by full lexical coverage and presence of both held and consuming zero events. Each is encoded continuously from phase zero and deterministically shuffled. All 240 true word/phase edges are present; all six exact graph searches find forward-replaying witnesses in 41–302 nodes. Witnesses recover 226/240 correct group plaintexts, 222/240 exact original word/phase edges; only 2/6 witnesses identify every true word. The six unrelated independent-per-group key/phase nulls cover only 5–14/40 groups and all have empty domains.

No witness reproduces the complete genuine word order. Even fixing one feasible selected-edge graph, permuting distinct ciphertext-group identities within equal (start,end) edge classes preserves all phase constraints and yields at least 192–9,216 distinct ciphertext group sequences across the plants (individual log10 bounds in raw output). This is a constructive lower bound, not the full number of Euler trails. Thus even a successful inventory gate would not uniquely identify historical order without additional source constraints.

## Original all-phase coverage

| Chapter (rune offsets) | Groups | WELCOME covered | KOAN covered | Allowed OOV |
|---|---:|---:|---:|---:|
| 0–729 |158|25|26|7|
| 729–1874 |255|39|42|12|
| 1874–3612 |385|52|62|19|
| 3612–5506 |435|70|94|21|
| 5506–6527 |224|29|42|11|
| 6527–7960 |326|53|66|16|
| 7960–9640 |378|42|62|18|
| 9640–12648 |669|87|113|33|
| 12648–12956 |66|8|14|3|
| **Total** |**2896**|**405**|**521**|**140**|

Both fixed keys fail every chapter by huge margins. At least 2,491 (WELCOME) or 2,375 (KOAN) printed groups have no valid frozen-register word at any phase. This implies a minimum of 78% missing groups in even the most favorable individual chapter. No original phase-graph trail meeting the budget exists; no original language order scoring or graph search is needed. The proof grants more phase freedom than a real continuous clock, so arbitrary rotations, cross-page carries and post-cipher whole-word permutations do not rescue these particular keys within this register.

## Reproduction and next decision

- [CommonJS SFT](../sims/lp2_native_key_postshuffle_phase_graph_sft.cjs): run from repository root with `node sims/lp2_native_key_postshuffle_phase_graph_sft.cjs`. Core executed directly on all pinned repository inputs in connected JavaScript runtime; standalone Node wrapper not separately run. No CI.
- [Exact raw results](lp2-native-key-postshuffle-phase-graph.json): input blob IDs, phase-domain coverage, control witnesses and ordering bounds.
- Source: [Director issue #2678](https://github.com/FlareZ123/liber-primus/issues/2678). Related unknown-q8 long-anchor receiver #2684 is independent.

Retire only these two authentic fixed-key receivers under whole-group preservation. Do not tune the native keys or reorder word salads to rescue them. A next genuine H-shuffle route requires independently selected secret key/state or a source-derived ordering constraint; an H-decoy model needs spacing-free inference. The control ambiguity demonstrates why even valid phase balance and perfect forward replay cannot independently identify intended order.
