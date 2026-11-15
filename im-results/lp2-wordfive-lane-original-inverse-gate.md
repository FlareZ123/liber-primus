# Five-lane printed-word rearrangement against original LP2 (#971)

**15 November 2026, Agent41. Verdict:** The exact, human-executable, five-lane **within-word transposition** tested here is reversible but fails to recover genuine unknown-page plaintext. More strongly, *every* pure within-word position permutation preserves key independent observations that contradict ordinary direct GP29 English under the original printed boundaries. This is a bounded exclusion of transposition-only models; it does not exclude a source-selected value-changing second stage, moved word boundaries, non-GP intermediate text, or stateful encryption.

## Frozen operation and its author-visible premise

The original LP2 five-dot designs and excess within-word lag-five equalities make a five-lane rearrangement a plausible simple operation. For a printed word of length L, place rune positions 0,5,10,... in lane 0; positions 1,6,11,... in lane 1; and likewise through lane 4. Concatenate the five lanes to *encode*. To *decode*, fill the lane 0 slots from the ciphertext, then lane 1, etc. The operation is specified entirely by L and the printed word start. There is no rune substitution, key, fitted phase, alphabet choice, or exception repair. Breaks joining original page-spanning words are preserved. The alternative opposite direction was also evaluated as a non-tuned orientation control.

All 2,896 original printed words, including 32 physical-page carry events, contain 12,956 source runes. The script checks their exact joined sequence against the independent normalized original-page index records in `resources/liber-primus/lp2-corpus.json`. The independent authentically clear GP29 p57 is a **95-rune positive inverse control**, exactly reconstructed in both directions.

## Decisive original-source measurements

| Original feature | Untouched LP2 | Lane-major inverse | Opposite orientation |
| --- | ---: | ---: | ---: |
| Within-word lag-five equalities / 2,105 opportunities | 104 | **14** | 69 |
| Adjacent equal runes within words / 10,060 opportunities | 63 | **164** | 218 |
| Distinct glyphs across 83 original singleton words | **28** | **28** | **28** |
| Global pooled symbol index of coincidence | **0.03447839786450569** | **0.03447839786450569** | **0.03447839786450569** |
| Original reconstruction via reverse transform | Identical | **2,896/2,896 words** | **2,896/2,896 words** |

The original source histogram is exactly `[458,450,455,458,424,443,438,401,414,446,471,450,399,445,458,434,442,445,439,436,460,454,492,439,482,445,448,470,460]`. Both lane orientations preserve every one of these counts. The known clear-GP p57 reference yields pooled IoC **0.06270996640537514**, much more concentrated than the original ciphertext.

The inverse changes 104 within-word five-back echoes into 14 while raising within-word adjacency equalities from 63 to 164. It supplies no readable original text. Because the five-lane transform cannot change a singleton at all, it leaves the source's **28 distinct one-rune glyphs** on 83 standalone words. A literal ordinary-English GP29 rendering under the same breaks would typically use the one-rune words A and I (and possibly O), so this invariant already prevents interpreting the direct five-lane inverse as ordinary English under the original segmentation. This single-symbol argument is independent of which five-lane order or word-specific *position* permutation is tried.

The strict global histogram invariant is even broader: **a pure permutation of rune positions anywhere in this entire original 12,956-rune book cannot make its aggregated GP29 frequencies into English plaintext frequencies**. A permutation does not alter symbol identities. This does not mathematically preclude an unusually uniform artificial plaintext register or a subsequent rune-changing cipher.

## Decision and research consequence

Reject the **frozen 5-lane-only decoder** without an expensive search over per-word rotations and lane orders. The exact point of failure is identified before selecting an English scoring function: both the singleton inventory and the 29-value multiset are immutable for *every* within-word rearrangement. The original lag-five signal is real as a ciphertext statistic but cannot by itself authenticate this transposition.

The next viable causal branch must obtain **an independent source-selected rune-changing operation, changed segmentation, or other typed alphabet/receiver**. Adding an unconstrained second operation to rescue a false first stage would be non-discriminating. This issue establishes no unknown-page plaintext, historical key, or final destination.

**Standalone reproduction (Windows Node22):** [`sims/lp2_wordfive_lane_original_sft.cjs`](../sims/lp2_wordfive_lane_original_sft.cjs). The SFT prints original, inverse, opposite-orientation and p57-control statistics, and asserts exact full-book bidirectional reconstruction.
