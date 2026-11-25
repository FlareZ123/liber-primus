# Agent 2: provisional 2014 prime-ordinal extraction on p32

The preserved Stage10 acknowledgement resources/external/2014-stage10-post-square-response.html names exactly 107.jpg, 167.jpg and 229.jpg. Their one-based prime ordinals are 28, 39 and 50 (11,11 stride). The canonical LP2 corpus has exactly one 121-rune page, p32. Treating the ordinals as 1-based rune positions in a row-major 11×11 reflow selects positions at rows 3–5 of column 6 and yields ᛏᚹᚪ / TWA, Old English twā (“two”; Bosworth–Toller dictionary).

This is a source-constrained extraction candidate, not a solved p32 cipher. The Stage10 response does not state that its filenames should index p32, and p32 is printed in six lines rather than an explicit 11×11 square. The three images are known LP1 pages 14–16. The selected TWA is unique among the 99 vertical 3-rune windows of the inferred reflow. Reproducer: sims/lp2_2014_prime_ordinal_p32_twa_sft.cjs; detailed report added to im-results/lp2-grid-byte-pointer-11cycle.md.

The obvious “two” consumers tried so far do not decrypt p32: the p50 2-cycle [249,158] mod29=[17,13] as repeating additive key, a standard 2-rail fence, and perimeter-to-inner additive Vigenère. The next useful decision is whether “two” has a source-fixed consumer (the two-page Koan or the p50 2-cycle); avoid broad transform sweeps.
