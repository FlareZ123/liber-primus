# LP2 p15 4×4 source geometry: sixteen-lane word-order gate

**14 November 2026, Agent14. Classification: bounded original-input negative, no recovered plaintext/key.** The 4×4 numerical square printed on physical LP2 p15 and the whole book's **2,896 complete printed words = 181×16** jointly motivate a sixteen-lane word-order hypothesis. The original source does **not** show the language-order relationship that a fixed sixteen-lane round-robin complete-word interleaver would preserve. This tests the **chapter-restarted sixteen-lane** variant, distinct from the previously tested whole-book 181×16 spiral/column inversions and exact **all-16! global-column** optimizer in [the original global spiral study](lp2-p15-spiral-181word-transposition.md) and [the global all-order study](lp2-p15-spiral-16column-word-dp-gate.md). Prior [8-/32-lane word-length MI](lp2-original-wordlength-grammar-mi.md) motivated the chapter-aware invariant here. The global p15 avenue was already extensively rejected; this is a scoped extension, not a newly discovered key.

## Reversible proposal and source control

Under this proposal, ordinary GP29 prose words are divided into 16 contiguous lanes **separately within each of the nine original visual chapters**, and their complete words are read out round-robin across lanes. Any fixed but unknown permutation of the 16 lane labels within a chapter leaves pairs of words 16 positions apart in the same lane, so the association of their word lengths is invariant under a secret column order. A valid solver could reverse the interleaver with knowledge of the lane order, but the original source supplies neither a specific permutation nor evidence it was used.

The parser uses [original canonical runes/word separators](../resources/liber-primus/lp2-transcription.txt) with [the 29-symbol alphabet](../resources/liber-primus/lp2-corpus.json). Line and physical-page wraps join ongoing words. It asserts 12,956 unknown runes and 2,896 printed words, with source chapter word counts **[158, 255, 383, 437, 224, 326, 378, 669, 66]**. There are 2,752 valid lag-16 within-chapter pairs. Each length is clipped to 1..8 or 9+; lag-16 plug-in mutual information is measured in nats.

The null makes **1,500 seeded chapter-local Fisher–Yates length shuffles**, preserving each chapter's word lengths and preserving chapter boundaries. Positive controls are real Gibran, Shakespeare, and Emerson text encoded with source-native GP29 spellings, taking 2,896 complete words each and actually applying the 16-lane transformation within exactly the same nine chapter-sized windows. Complete inverse deinterleaving recovers all **2,896/2,896** source word lengths per positive control. Each has a separate 350-shuffle chapter-matched null.

| Register | Lag-16 MI | Shuffled mean | z-score | Upper-tail plus-one p |
| --- | ---: | ---: | ---: | ---: |
| **Original untouched LP2** | **0.0093991735** | **0.0118382971** | **−1.19234** | **0.895403** |
| Gibran GP, 16-lane scrambled | 0.0537404206 | 0.0125107491 | +18.61716 | ≤0.002849 |
| Shakespeare GP, 16-lane scrambled | 0.0275868316 | 0.0120092914 | +7.22796 | ≤0.002849 |
| Emerson GP, 16-lane scrambled | 0.0439984722 | 0.0119353922 | +15.93136 | ≤0.002849 |

The original unrestricted cross-chapter lag-16 MI is additionally **0.0088237048**. For Gibran, the actual interleaver suppresses lag-one MI to **0.0138710926** while retaining lag-16 MI **0.0537404206**, validating that the test detects the intended architecture. The original value is *below* its own shuffled mean.

## Decision, remaining alternatives, and reproduction

**Retire a fixed-per-chapter 16-lane complete-word interleaver restoring ordinary GP-native prose** as the primary p15 4×4 hypothesis under original printed word boundaries. This is a source/register-conditional negative. It cannot exclude changing lane permutations, sixteen-word *blockwise* routes, transposition within runes, shifted segmentation, other languages, or an arbitrary cipher unrelated to p15.

The original 181×16 count and the p15 source spiral were recognized and tested extensively in earlier reports. The count is potentially coincidental; neither the square nor the factorization authenticates a route. Simple sixteen-word *local square* spiral permutations have also already been tested in [the 181×16 source study](lp2-p15-spiral-181word-transposition.md); further local variants require a source-selected operation rather than another free permutation. All measurements here were computed directly on GitHub-pinned source files with deterministic chapter-local shuffles, and the complete Node 22 SFT passed in [Actions run 43569120000](https://github.com/FlareZ123/liber-primus/actions/runs/43569120000). The companion [single-file Node.js SFT](../sims/lp2_p15_sixteen_lane_wordlength_sft.cjs) is the reproducible executable implementation. No unknown LP2 plaintext, historical key, or final deep-web destination has been recovered.
