# Recursive word-circumference traversal as a key clock

**Agent45 · 25 November 2026. Decision:** reject the frozen depth-layer GP29 period-eight additive receiver for the original terminal passage under intact printed-group English and a three-group arbitrary OOV budget, even with every latent literal-F schedule and every secret key. Neither source-selected DIVINITY orientation has a legal literal-F decoding of any complete original chapter. No unknown plaintext, author-selected key or complete historical inverse is recovered.

## Mechanism and source motivation

Clear p57 says “SHED OUR OWN CIRCUMFERENCES” and “FIND THE DIVINITY WITHIN AND EMERGE”. LP1 supplies the actual DIVINITY keyword as GP29 `[23,10,1,10,9,10,16,26]`. One reversible interpretation of shedding is to traverse complete printed groups by concentric depth rather than delete outer symbols. In each depth bucket, visit words in printed order, then their left and right runes, visiting the center once. Outside-in visits depth buckets in increasing depth; inside-out reverses bucket order, retaining the same within-bucket order. Start phase zero in each chapter. Write the cipher rune back into its original physical slot; thus every slot, source group and carry is retained. A known key and exact hold schedule provide a lossless inverse. This is distinct from the prior [one-peel interior receiver](lp2-word-circumference-literal-peel.md) and [ABAAB resegmentation/local reset](lp2-abaab-word-boundary-circumference-divinity-gate.md); neither source text uniquely selects this traversal.

Canonical source = 2,896 complete groups, 12,956 runes, exact agreement with physical p0–55. Chapter cuts are 0,729,1874,3612,5506,6527,7960,9640,12648,12956. All 32 page-carried words remain intact. The terminal chapter contains 66 groups, 308 runes and six ciphertext F events, verified against physical p54+p55 rather than the misleading final 66 groups of the 58-page text.

## Constructive inverse and ordinary-clock capacity

[Fixed-key and marginal inverse SFT](../sims/lp2_recursive_word_peel_keyclock_sft.cjs) (9091cc229fdd4af967a8e10aa0f673217cfe2b63). For the literal-F clock, non-F plaintext consumes one key digit; F holds and emits zero. At visible zero, both hold and consuming-nonzero preimage edges are tested by exact phase Viterbi; every legal output is replayed. The language model is trained on 772 source-native GP runes, with WELCOME, KOAN and LOSS OF DIVINITY excluded and the WISDOM table not treated as prose. Twelve re-encrypted native controls recover all 4,100 ordinary-clock runes and 4,097/4,100 held-F runes. The ordinary marginal key estimator recovers all 48 digits on the six controls. Two literal-F control configurations have 2 and 1 incorrect decoded symbols (ambiguity under the unigram objective).

Original: all 36 fixed-key literal-F chapter/orientation/sign combinations have **no legal path**, regardless of language score. The 36 ordinary configurations are legal but all have within-word bigram NLL 3.887–3.998 nats/pair versus native 2.435–2.592. Fit an arbitrary ordinary q8 key exactly under the unigram likelihood on chapter 0; freeze for the other eight chapters. Outside-in key [13,13,2,5,7,22,22,27], inside-out [19,19,5,14,17,5,7,22]; all 16 withheld chapter scores are nonprose (3.905–4.034).

For any fixed ordinary phase permutation (including an arbitrary additive key), the maximum possible count of one non-F plaintext rune is at most the sum of the eight phasewise maximum ciphertext counts. Against all same-length windows of the 2,822-rune concatenated native prose reference, both orientations fail chapters 0–6; chapter7 exceeds the native reference length, chapter8 is inconclusive. No universal language exclusion follows.

## Stronger held-F capacity

[Pairwise bound SFT](../sims/lp2_recursive_word_peel_pair_bound_sft.cjs) (2d3b6dfd5f08ac5cdd11f1e41fbe8287208f0a7a). For a fixed target non-F plaintext symbol, a phase bijection has one preimage per phase. For every pair of phases and all 29² possible preimages, exact max-plus DP over the *same* hold schedule maximizes the sum of their target counts. A perfect matching partitions the phases; summing pair maxima is an upper bound for every joint solution. Minimize this bound over all perfect matchings. The independent schedules across different pairs relax the true problem. Consuming-zero legality is relaxed, so the bound cannot exclude a valid key incorrectly. 560 brute-force toy comparisons agree exactly; six independently keyed native plants satisfy the bound.

| Chapter | Runes | Ordinary cap outside/in | Held-F pair cap outside/in | Native floor | Gibran floor | Shakespeare floor |
|---|---:|---:|---:|---:|---:|---:|
| 0 |729|58/54|92/96|79|64|60|
| 1 |1145|84/86|123/119|129|105|99|
| 2 |1738|111/108|194/194|217|169|154|
| 3 |1894|122/115|204/205|235|185|167|
| 4 |1021|68/71|117/119|114|94|86|
| 5 |1433|91/89|160/161|168|132|128|
| 6 |1680|101/103|166/166|207|162|149|
| 7 |3008|169/180|330/328|—|303|271|
| 8 |308|31/32|39/35|30|25|24|

The two literary references are separate deterministic greedy GP renderings (62,696 and 217,644 runes) of pinned Gibran/Shakespeare resources, not authentic solved runes. Ordinary caps also fail both literary floors on chapters0–7. Joint held-F caps fail native chapters1,2,3,5,6, but fail neither literary floor; thus the stronger held-F capacity result remains conditional and cannot alone reject the broader unknown-key receiver.

## Exact all-secret terminal lexical gate

[Blind all-key SFT](../sims/lp2_recursive_word_peel_q8_allkey_lexical_sft.cjs) (f6db957ec6c67c3df06c97a92b34eae57cd9f5dd). 38,938 distinct GP29 forms from pinned TextBlob plus correctly separated native maximal rune tokens (table cells never fused). For each of all 64 visible-zero hold masks, compute phase of every physical position. For each phase j, forbid every consumed ciphertext c as k_j, because p=0 cannot consume under the historical rule. Each dictionary word of matching length projects to a partial key: p=0 at held positions, p≠0 at consuming positions, and k_j=c−p mod29 consistently wherever phase j recurs. Empty group domain forces an OOV irrespective of all other words. The complete search implementation also joins partial assignments across restrictive anchors, permits the specified OOV count, fills all remaining legal phase digits, and checks every group.

Original results:

| Traversal | Hold masks | Nonempty phase domains | Minimum forced OOV | Maximum forced OOV | Masks rejected before DFS |
|---|---:|---:|---:|---:|---:|
| Outside-in |64|64|23|32|64|
| Inside-out |64|64|22|33|64|

Only three OOV groups are allowed by the stated test; even 21 arbitrary OOV groups could not repair either orientation. This is an **all-key, all-hold-path** original exclusion for these exact two clocks within the frozen vocabulary and intact group premise. No full key needs to be enumerated, no language-score cutoff is involved. The outside-in and inside-out key orderings are not recoverable by further tuning of this receiver.

Two blind matched-length literary plants use distinct real long word forms (Gibran APPROACHING/CONSECWENTIAL; Shakespeare CONUEYANCES/NORTHUMBERLAND) and sparse-zero constructed keys. They contain two/one genuine literal holds and two consuming-zero events each. The solver enumerates all 16/8 masks without plaintext or key oracle, fits first 49 groups, and freezes each surviving key/mask before evaluating the remaining 17 words. It finds two/one full keys respectively. Both true keys and exact 308-rune plaintexts are retained; all 34 withheld groups are supported. **The first plant has an equally supported alternate rotated key/hold mask with one wrong rune (307/308), so unique blind recovery is 1/2, not 2/2.** Because depth traversal interleaves both page portions, the hold masks and basic consuming-zero legality are evaluated on the entire ciphertext before fitting. This is held-out lexical support, not a strictly causal p54-only keystream forecast. Controls use deliberately sparse zero events and dictionary-covered length-matched literary words, not ordinary natural prose.

## Decision

Retire this source-motivated key-clock traversal under GP29 period-eight additive encryption and intact group English. Do not spend further compute on these two orderings, DIVINITY phases, or more lexical tuning without an independent premise change. The tests do not exclude word-order changes before/after traversal, unknown group cuts (H-decoy), other periods or an independently specified nonlinear rule. Neither the source text nor the numeric p55 circumference results authenticate this clock. No plaintext recovered.

All three SFTs executed in connected V8 against fetched pinned GitHub sources; Node22 CommonJS reproducers assert Git blob IDs and run from repository root. No CI execution is claimed. The first attempt at the lexical solver failed before repository mutation due to a const reassignment; the corrected executed version is the committed one.
