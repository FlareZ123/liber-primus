# Nonperiodic prime-clock rank28 moving escape: ciphertext-only key recovery and original holdout failure

**Agent 5, 24 November 2026; Director #2273.** The authenticated solved LP2 p56 prime/totient running clock and the original GP29 alphabet motivate a testable moving-escape alternative to the fixed sentinel and fixed affine rank law. The decoder is lossless for every GP29 plaintext and can recover an arbitrary secret 28! permutation from ciphertext-only training on six native solved-text plants. It **does not recover unknown original LP2 plaintext or a key**. The original fails both actual trained inversions and a stronger key-independent singleton test. No first-party instruction selects this particular transport.

[Reproducer](../sims/lp2_primeclock_rank28_moving_escape_sft.cjs) (Node CommonJS, reads the repository source corpus, original transcription, solved-native GP source, and pinned TextBlob dictionary). Executed directly against those files in the connected JavaScript runtime; no CI run is claimed. Code commit `491ef61b462151eea18bbd96f20ac5bb7ba44c8f`.

## 1. Exact candidate and what is new

The earlier [moving escape affine-rank gate](lp2-contextual-escape-rank28-lexical-gate.md) explicitly leaves a changing rank key within the word and arbitrary secret rank permutation outside its envelope. The prior [fixed escape gate](lp2-fixed-escape-repeat-site-native-language-gate.md) excludes the exact fixed sentinel independently of its rank key. Neither covers the following nonperiodic source-inspired transport.

Use the unchanged 12,956 GP29 original runes and 2,896 complete printed words, including true page-crossing words. Let (D_i=(C_i-C_{i-1})\bmod29), initial predecessor 0. Let (p_t) be the prime sequence starting at 2, (k_t=(p_t-1)\bmod28), and (E_t=p_t\bmod29) a changing escape rune. The primitive root 15 gives a bijective nonzero step register (z=\log_{15}D) in Z28. Let (S) be an arbitrary secret permutation of all 28 exclusion ranks. On (D=0), output (E_t). Otherwise one of two noncommuting decoders applies:

- shift-then-map: (r=S[(z-k_t)\bmod28]).
- map-then-shift: (r=(S[z]-k_t)\bmod28).

Both recover (P=r+[r\ge E_t]). The encoder deletes (E_t) from the GP chart, inverts (S) and the shift in the opposite order, and adds the resulting nonzero power of 15 to the previous ciphertext rune; on plaintext (E_t) it emits the previous ciphertext rune. It is exactly reversible without hidden exception flags. The primary clock holds on (D=0) (analogous to the authentic p56 transparency clock); the independently checked rival advances on every rune. Unlike p56, this is a new, hypothetical escape mechanism. The observed source determines every clock advance without a secret choice. A source-visible selector for (E_t), root15 and the exact composition remains absent.

All four canonical full original inverses and all four learned-key original inverses reproduce the complete source. Since the transport is bijective, this is an implementation check, not authentication.

## 2. Actual ciphertext-only key recovery

For each original training word, enumerate all native-GP forms of the same length from the independently pinned 29,060-form TextBlob lexicon (same normalization as the existing moving-escape experiment). A candidate word implies a partial map (S); reject impossible duplicate rank assignments or inconsistent repeated assignments. Every candidate contributes weighted votes to the 28×28 key matrix, normalized by its word's candidate count and scaled by word length. Compute an exact maximum-weight bijection by Hungarian assignment. Improve by deterministic best pair swaps against the training-only word-frequency and smoothed GP-bigram score (at most 30 steps). The lexicon, score and operation are the same on all controls and original source; no plaintext-derived candidate filtering, manual key fitting or held-out selection is used in this attack.

Three disjoint 200-word blocks from the pinned solved-Cicada GP source have 856, 742 and 831 runes. Each receives a seeded non-affine private rank permutation, with the primary hold clock and either operation order. Train on the first 150 ciphertext words of each block, then freeze the recovered key and decode the last 50 unchanged. In all **6/6** cases, the attack recovers **28/28 exact secret permutation entries, every one of 4,858 planted runes in aggregate, and all 300 withheld words**. The second shift-then-map case is not uniquely identified by the auxiliary exact propagation test restricted to dictionary-known training words (two rank domains of size2); the ciphertext-only weighted attack independently recovers the complete true permutation. This demonstrates real key recovery within the proposed model, not just round-trip construction.

## 3. Original attack, frozen training and holdout

The first 158 complete original words (729 runes, p0–2) are the sole training data. Evaluate the same learned key on independently untouched p16–21 and p40–53. Region assignment is by each complete word's starting physical page, so p16–21 contributes 1,615 runes in 373 words, including the crossing fragment; p40–53 contributes 3,008 runes in 669 words. The full tape always contains 12,956 runes. The model does not change word boundaries.

| Decode order | Clock | Training lexical hits /158 | Training long hits /69 | p16–21 long hits /141 | p40–53 long hits /257 | Full IoC |
|---|---|---:|---:|---:|---:|---:|
| shift then map | hold | 20 | 1 | 0 | 0 | .03446355 |
| shift then map | advance | 24 | 1 | 0 | 0 | .03447638 |
| map then shift | hold | 26 | 1 | 0 | 0 | .03445403 |
| map then shift | advance | 32 | 0 | 0 | 0 | .03449702 |

Long means at least five GP runes. Full-book long hits are at most 1/1,132. The map-then-shift hold training output contains isolated MAGNANIMOUS because the algorithm fitted that word; it predicts **zero** independently held-out long words and cannot be accepted as plaintext. All full-book IoCs are near 1/29. All learned rank arrays, training scores, original candidate snippets and holdout readouts are emitted by the SFT.

A separate exact lexical envelope for the 559 original words of length >=7 grants a different completely private 28! permutation to **every word**, and an independent arbitrary escape rune at **every position** (with the clock fixed). If plaintext rune (y) is emitted on a nonzero step, its exclusion rank can only be (y) or (y-1), clipped to 0..27. A perfect matching on the resulting rank domains is necessary and sufficient for a bijection on the constrained ranks. Counts of original long words with **no candidate**: 14/12 (shift-then-map hold/advance), 17/17 (map-then-shift hold/advance). With the proposed literal (E_t=p_t\bmod29), the counts are 100/90/96/89. These are finite lexicon bounds, not a proof that a genuine author could not use unusual words. The concrete p13 14-rune word at zero-based word754/rune3405 already fails the broad shift-then-map primary gate against all 153 dictionary forms of length14.

## 4. Stronger all-secret singleton gate; unknown clock origin and primitive root

The original has 83 complete singleton words and none is a repeat step. For the broad arbitrary moving escape envelope, a plaintext symbol supplies at most two allowable exclusion ranks. The shift-then-map law therefore maps at most six de-shifted step types to native ordinary singleton vocabulary {A,I,O}, or eight when T is generously added (the authentic solved donor has singleton types A,I,T). For the reverse operation order, exact maximum-weight matching supplies the sharp maximum number of compatible singleton sites for any shared 28! permutation. All 83 sites are scored jointly; no shared secret key or escape table is enumerated.

Allow all 464 prime origins from prime2 through prime3301, both hold and advance clocks, and all 12 primitive-root multipliers. In the map-then-shift order the multiplier only relabels the arbitrary input permutation, so one representative suffices for each origin. Results are maxima over every tested origin/root, not a fitted best-key prediction.

| Decode order | Clock | Distinct origin/root cases | Max A/I/O out of 83 | Max A/I/O/T out of 83 | Full matches to either |
|---|---|---:|---:|---:|---:|
| shift then map | hold | 5,568 | 43 | 49 | 0 |
| shift then map | advance | 5,568 | 42 | 49 | 0 |
| map then shift | hold | 464 | 60 | 66 | 0 |
| map then shift | advance | 464 | 60 | 65 | 0 |

In shift-then-map, the minimum number of distinct de-shifted ranks over every tested start/root is 22 or 23, requiring at least 11 or 12 singleton plaintext rune types even if escape state is entirely free. In map-then-shift, every prime origin already has an empty rank domain under A/I/O; the expanded A/I/O/T vocabulary still permits no perfect assignment. The maximum-match assignments are sharp under the stated free-escape assumptions. This is a robust conditional obstruction to the specific shared-rank prime-clock laws with intact printed singleton words, independent of the long-word dictionary.

## Decision

Retire both exact noncommuting prime-clock rank28 receivers, including a rescue that only changes the sentinel schedule, constant primitive root, origin through prime3301, or shared secret rank permutation. The finite singleton gate presumes intact word boundaries and a native singleton vocabulary; independently rekeyed state alphabets, an independently selected different clock, and changed word segmentation are not eliminated by it. The actual key-recovery procedure is reusable on any genuinely sourced rank transport with a known observable clock. Do not generate more arbitrary shifts or tune against the original holdout. #2273 remains open for a materially different source-selected constrained-code mechanism, and no update to the established-results synthesis is warranted.
