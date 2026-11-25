# Order-free cyclic additive-key histogram inversion

## Decision

An additive periodic cipher with balanced consuming key phase and phase-independent plaintext probabilities predicts a ciphertext histogram without knowing the order of any runes. This is therefore a direct candidate-key recovery experiment that tolerates any subsequent transposition, even one that destroys every printed word. It is an approximate statistical receiver: phase dependence, chapter-private keys, optional redraws and changed plaintext registers can change the distribution.

Fit the first 9,640 runes (p0–39), then predict the disjoint 3,316 runes p40–55. For a fixed native or literary prior, move the plaintext Fehu mass directly to ciphertext 0; distribute the remaining mass by the cyclic convolution with an integer shift histogram of total q. Minimize training total variation using 256 deterministic multistart single-unit coordinate descents, without inspecting holdout or hidden control keys during optimization. The literary prior is Gibran/Shakespeare; native is the solved GP source. Six disjoint target-excluded Emerson plants use unknown periodic q8/q13 additive keys, mandatory F holds and independent phase; the third of each group has optional one collision redraw at probability .8. The plant and original counts are frozen in [input](lp2-orderfree-shift-histogram-frozen-input.json). No claim of global optimization.

| Prior | q8 exact plant histograms | q13 exact plant histograms | Original q8 heldout TV / logLR | Original q13 heldout TV / logLR |
|---|---:|---:|---:|---:|
| Literary | 3/3 | 2/3 (remaining 12/13 digits) | .052788 / −.004488 | .048320 / −.002927 |
| Native | 3/3 | 1/3 (remaining 10/13 each) | .044534 / −.003085 | .048797 / −.003188 |

All six controls with either prior have positive heldout logLR (+.0206 to +.0748 nats/rune) relative to uniform. Original uniform heldout TV is .036646. Every fitted original key histogram is worse than uniform by both heldout TV and log likelihood. No recovered key. A near-uniform original histogram is the main obstacle, and the q13 control misses show the heuristic is not exhaustive. No further cyclic ordering search is warranted from these candidates.

[SFT](../sims/lp2_orderfree_shift_histogram_sft.cjs) · [raw](lp2-orderfree-shift-histogram.json). The experiment was run directly from the function subsequently committed, using the exact frozen source counts via connected JS. The optimization is reproducible from the frozen input; the Node wrapper and an exact MILP optimizer were not independently executed. The count-generation recipe uses GP29 tokenization (QU→CW, V→U, K/Q→C, Z→S, longest GP token first) of the pinned sources, and deterministic xorshift32 seed 0x253308f1 for the six Emerson windows starting at rune offsets 10000, 23000, 36000, 60000, 73000, 86000, length 12956 each. First 9640/last 3316 split. For each plant draw q shifts via rand()%29, then initial phase via rand()%q, then collision decisions via rand()/2^32. Native counts are all rune-bearing solved sections, original counts use canonical p0–55. This is a bounded predictive failure, not a general exclusion of short keys or transposition.
