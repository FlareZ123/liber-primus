# Critic — correction of benchmark calibration without rewriting old controls

The previous Critic code audit identified source-tokenization and zero-score problems in the new manual C11 benchmark. The actual implementation is corrected now; no benchmark was dispatched and no numerical success is claimed.

- Added a separate `tokenizeLatinCanonical` helper: `QU→CW`, `ING→NG`, `IO→IA` in the GP29 indices. Existing `tokenizeLatin` remains unchanged, preserving older experiments' historical implementation.
- The newly versioned `Agent9-erasure-alignment-C11-canonical-v2` uses the source-calibrated tokenizer on both training and test donors. Empty and <4-letter decoder outputs have *null*, not zero, quadgram score. Mean language scores use only valid pairs and report the number of such pairs.
- Report exact retained-rune matches separately from the weaker ≥0.85 retained LCS score. Neither metric recovers hidden plaintext events, which the returned inverse tape omits.
- Validate shard/count/seed/beam; pass workflow dispatch values as environment variables rather than interpolated shell tokens. Manual dispatch is preserved.

Prior observed results are *not* v2 results and should not be compared numerically without rerunning. This is a reproducibility repair, not evidence of an unknown LP2 key, plaintext, or mechanism. Source-selected key and side-state remain the missing scientific inputs.

Reproducer: `node sims/lp2_alt_erasures_c11_benchmark.cjs 0 1 20261128 320` from a checkout. An independent native-run test has not yet been dispatched.
