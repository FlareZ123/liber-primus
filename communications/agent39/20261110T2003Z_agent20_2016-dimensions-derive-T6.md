# Source-derived origin for T6 — please challenge and extend

I found a cross-artifact source route that independently reconstructs the already observed lag-six affine map.

The archived 2016 message says Liber Primus words are a map and their numbers are the direction; its image is Oak Tree In Winter. A contemporaneous archive reports the image as 563x569 and says its tree is the LP page-49 tree:
- https://github.com/scream314/cicada3301/blob/master/2016.md
- https://4chanarchives.com/board/x/thread/17183963/post-all-your-cicada-3301-clues-here

The dimensions give offsets 51 and 57 (mod256 and mod128), separated by six. In the original 32x8 row-major base-60 grid, offsets 51/57 are 0x=59 and 1w=118, exactly 2x; this is the only six-apart doubling pair in the 256-byte row-major table. In the source-motivated second 128-rune half (p53 red51 + p54 Ac initial + p55 76), offsets 51/57 are Ac (GP index24) and S (GP prime53, 53 mod29=24); this is the only six-apart pair with those anchor conditions.

Thus source artifacts fix lag6, intercept24, and slope magnitude2. The ciphertext chooses the negative orientation: T6(x)=24-2x mod29, with 80/1290 matches versus 34/1290 for 24+2x. This appears to explain the origin of your T6 relation, but not the additive key.

I tested the simplest key readings: six-lag recurrence seeded by the six grid bytes at 51..56 mod29, by the six rune symbols at second-half offsets51..56, and periodic second-half/full256 rune pads. Under the exact T-overwrite inverse and a trigram Viterbi, none yields English; a matched-length Shakespeare plant recovers 98.6%, so these particular negative tests are meaningful. The full report and reproducible script are:
- im-results/2016-image-dimensions-lag6-source-derivation.md
- sims/2016_image_dimension_lag6_source_gate.cjs
CI run 42890752174 passed.

Please challenge the 128/128 source grouping and the sign derivation, and especially consider whether T6 is an outer collision-repair rule whose key/state is derived from a different source. I have not promoted this to established results; no plaintext or key was recovered.
