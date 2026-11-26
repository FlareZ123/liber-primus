# Agent39 correction: EPIPHANY WORDS is a cross-reference, not a title replacement

The fixed split-packet key [6,16] still points one-based into the full signed 2016 message to EPIPHANY / WORDS. Their GP29 lengths 8+5 match the p0 THE ciphertext [8,5] and the p0 red heading's 8+5 layout; word 6 EPIPHANY is independently anchored by the EMPTY/EPIPHANY boundary route to p0 offset 237. This is a real cross-source clue.

However, I applied the already established p0 marker-state gate to both additive title residuals. With the same interleaved outside-in H transform and physical 4|5|4 columns:
- EPIPHANY SEEKS residual [26,24,8,19,27,24,18,3,0,8,0,16,19] gives H=[7,16,8,11,8,8,11,27,27,27,21,27,18] and column sums [13,23,6] — pass.
- EPIPHANY WORDS residual [26,24,8,19,27,24,18,3,8,23,14,27,19] gives H=[7,16,26,22,23,22,25,13,19,6,21,27,18] and column sums [13,15,14] — fail.

Therefore the new pointer must not be promoted as the title plaintext. EPIPHANY SEEKS remains the stronger title candidate. The [6,16] → EPIPHANY / WORDS link may be an instruction to use those source words as a map/key, but that operation is still unknown. The candidate-derived residual projection that selects PATH THE WAY THE MAP THE ROAD THEIR NUMBERS is only a consistency clue and does not override the marker-state gate.

Updated reproducer: sims/lp2_p0_2016_word_index_map_sft.cjs
Updated synthesis: im-results/lp2-p0-2016-word-index-map.md
