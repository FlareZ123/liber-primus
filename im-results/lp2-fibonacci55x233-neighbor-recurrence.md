# Key-free Fibonacci-neighbor inverses on the 55 × 233 GP28 register

**11 November 2026, Agent 6. Bounded original-input negative.** No unknown Liber Primus plaintext, historical key, operative cipher, or destination was recovered. The manuscript-wide state remains as described in [the authoritative synthesis](../results/README.md).

## Why this specific reversible operation was tested

The original LP2 artifact has 55 rune-bearing unsolved physical pages, with 12,956 ciphertext runes. Taking the first rune of each physical page as an initial predecessor and treating all 86 adjacent equal-rune events as non-consuming markers leaves exactly **12,815 = 55 × 233** successor ranks in a 28-symbol alphabet. Both 55 and 233 occur explicitly in p15's independently established Fibonacci-prime spiral. This combination suggests a cheap *key-free* test of the familiar Fibonacci recurrence, either serially or as a left-plus-up accumulation on a 55-row by 233-column register.

The rectangle is **retrospectively inferred**: p15 offers sixteen Fibonacci values, and the original per-page active-rank counts do not equal 233. Neither a page-IV convention nor a transparent-duplicate rule is authenticated by an LP2 decipherment instruction. This experiment asks a narrow question: does this particularly simple reversible recurrence expose direct GP28 English?

For each page, let its first GP29 ciphertext rune be `iv`. Each later non-repeated GP29 rune `c` is reduced to predecessor-excluding rank `r = c` if `c < previous`, otherwise `r = c−1`, with `previous` the last ciphertext rune. Consecutive identical runes do not consume a rank. The rank list is exactly 12,815 entries. The original page IVs and repeated-rune event positions are retained as **side information**, so the rank stream reconstructs all **12,956/12,956 original ciphertext runes**. That round-trip only validates the conversion.

On the rank stream `R[0..12814]`, the frozen inverse candidates are:

- **One-dimensional book clock:** `P[i] = R[i] − R[i−1] − R[i−2] (mod 28)`, with zero values before `i=0`.
- **One-dimensional 233-rank row clock:** the same recurrence, restarting at each consecutive rank row of length 233.
- **Two-dimensional, row-major 55 × 233:** `P[row,col] = R[row,col] − R[row,col−1] − R[row−1,col] (mod 28)`, with zero values beyond the left and top edges.

Each is fully reversible when the register and boundary rule are fixed. The two-dimensional forward positive control constructs `R[row,col] = P[row,col] + R[row,col−1] + R[row−1,col] (mod 28)`, and the unmodified inverse recovers exactly **12,815/12,815** independent GP28 Shakespeare control ranks.

## Original result

A fixed GP28 trigram model from `resources/control/shakespeare_first300k.txt`, with 0.2 additive count smoothing, yields the following mean natural-log probabilities per trigram (higher is more English-like). The model approximates source GP spellings with the usual two-letter runes and maps Latin K/Q/V/Z to C/C/U/S; it is a *calibration diagnostic*, not a proof of the true historical language.

| Stream | Mean GP28 trigram log probability |
| --- | ---: |
| Original untransformed GP28 rank stream | −12.691144 |
| Original inverse: one-dimensional continuous | −12.659635 |
| Original inverse: one-dimensional reset every 233 ranks | −12.660903 |
| Original inverse: two-dimensional left-plus-above | −12.740437 |
| Independent native Shakespeare GP28 control | −7.749038 |
| Synthetic two-dimensional encryption, before inversion | −12.754995 |
| Synthetic two-dimensional encryption, after exact inversion | −7.749038 |

The strongest original variant remains **4.91 nats per trigram worse** than native English and produces no coherent unknown plaintext at the start or across the stream. The serial inverse's small improvement over raw is irrelevant on this scale and is not evidence of key recovery.

**Decision:** retire these three exact *key-free, mod-28, predecessor-excluded* direct-English inverses. This does **not** exclude an independently keyed Fibonacci generator, a different matrix geometry, a non-English/packed intermediate format, or a cipher in which repeated runes carry recoverable source-selected information. A future proposal should first specify how its state/key and all repeat/IV semantics arise from original instructions, then recover original plaintext.

## Reproduce

Run the single-file CommonJS [SFT](../sims/lp2_fibonacci_55x233_neighbor_inverse_sft.cjs) with Node.js. It asserts the original page/rune/duplicate counts, every page-level original-rank reconstruction, and exact encryption/decryption of an independent 55 × 233 native-GP control. It prints the exact input SHA-256 values, candidate previews and all likelihood diagnostics.

This is complementary to the already published [55 × 233 fixed-phase, all-secret capacity exclusion](fibonacci233-nonzero-phase-capacity.md): that earlier result covers static per-phase alphabet maps and multiple traversals; this bounded experiment tests an explicit **evolving neighbor recurrence**.
