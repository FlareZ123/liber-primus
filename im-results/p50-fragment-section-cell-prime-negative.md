# 32×8 fragment–section cell schedule: bounded negative

**Status:** new cross-indexed interpretation of the p50 table, tested against the original LP2 stream. No plaintext recovered. This report is an intermediate result, not an established mechanism.

## Why this route was worth testing

The original p50 numeric table is 32 rows × 8 columns. Independently, the original ink annotations contain 31 thirteen-dot events, creating 32 chronological fragments. The first 28 fragments contain all 12,956 unknown runes; the final four cover the solved tail. The existing eight-section parse groups the unknown stream into lengths:

`729, 1145, 1729, 1903, 1021, 1524, 1589, 3316`.

Every one of the seven internal cuts in that eight-section parse coincides exactly with a thirteen-dot event. The first 28 fragment lengths are:

`13, 716, 16, 103, 3, 690, 11, 308, 0, 14, 1729, 0, 9, 11, 1883, 16, 1005, 19, 1414, 10, 81, 8, 1460, 3, 118, 3008, 9, 299`.

There are 26 nonempty unknown fragments and two empty intervals. This makes a direct matrix lookup plausible: fragment selects a row, section selects a column, and the cell supplies the fragment's key. The p55 border-derived BLACK row permutation is the primary row order; F31 is a source-derived alternative. Natural section order is primary; LCG8 is a source-derived alternative.

This is distinct from using a whole grid column as a section key or a whole grid row as a fragment pad. It tests the **intersection cell** for each fragment/section pair.

## Frozen candidate rules

For fragment f in section s, let B_f be the p50 byte at grid[row(f), column(s)].

Two simple, reversible uses of that byte were tested:

1. **p56 prime-clock start:** use B_f as a zero-based prime offset. Rune t in the fragment is shifted by p_(B_f+t+1)−1 modulo 29. The prime clock resets at the next thirteen-dot fragment boundary.
2. **Constant fragment shift:** use B_f mod 29 as the constant shift for the fragment; also test the standard uniform byte projection floor(29 B_f / 256).

For both models:
- The source table is read in original base-60 row-major order.
- The primary row map is BLACK; F31 is the fixed alternative.
- The primary column map is natural left-to-right section order; LCG8 is the fixed alternative.
- Both additive directions are checked. No fitted phase, key, or per-fragment exception is allowed.
- Printed spaces and word boundaries remain at their original positions and do not consume a key. One-rune words are ordinary runes; no word-local padding.
- All unknown-page F symbols are ordinary runes and consume a position. The single literal F on solved p56 is a positional exception, not a general symbol-level skip. A symbol-level F skip would be non-injective: a shifted non-F can also produce ciphertext F, so it requires an authenticated positional/escape rule that is absent here.
- Repeated runes are ordinary symbols. Thirteen-dot marks delimit fragments and select the next cell/start; ten-dot marks and other punctuation do not consume a rune or key position.
- Every rune maps to one rune; no escape, padding, or variable-length framing is used.

The eight-section grouping comes from the existing section-column analysis, which merges its identified two-word bridge. That grouping is therefore an explicit premise, not an independently authenticated author instruction.

## Original-input result

The original 12,956 unknown runes were processed. The Gibran control model is trained on its first 40,000 GP-encoded runes; its remaining text supplies 88 held-out 256-rune windows, with scores from **−9.13104 to −7.50851 nats/rune**. The raw LP2 stream scores −12.27633.

| Candidate family | Primary source order | Best among fixed source alternatives | All-variant mean-score range |
|---|---:|---:|---:|
| Per-fragment p56 prime-start stream | −12.30568 | −12.24246 | −12.30568 to −12.24246 (8 variants) |
| Per-fragment constant shift | −12.30486 | −12.24589 | −12.32631 to −12.24589 (16 variants) |

For the primary prime-start model, the 50 complete 256-rune windows score **−12.53101 to −12.00048**; none reaches the worst native window. Even the best fixed prime-start alternative has a maximum window score of only **−12.03751**. For the primary constant-shift model, windows score **−12.63097 to −11.99041**; the best fixed alternative reaches only **−11.92109**. All candidate windows remain below native controls.

Both implementations pass exact planted-GP round trips over all 12,956 positions. The prime-start test generates enough primes for the longest fragment and the largest table-cell offset. These controls establish implementation correctness, not historical correctness.

## Decision

Reject these direct uses of the fragment×section cell:
- cell as the starting prime ordinal for the solved p56 prime-totient stream;
- cell as a constant GP29 shift, under either tested byte projection.

The **32-fragment / 8-section / 32×8-table alignment remains a real source-structured observation**, but it does not identify what the cell means. The tested operations do not recover plaintext. Do not continue arbitrary cell projections, row/column permutations, or prime offsets.

The next useful source evidence would explicitly specify the role of a fragment/section cell—e.g. whether it is a prime ordinal, a cipher key, a codebook index, or a data byte—and the intended operation. The existing row-pad and column-key studies plus this intersection-cell test now cover the obvious direct uses of the matrix dimensions.

## Reproduction

Run node sims/p50_fragment_section_cell_prime_sft.cjs with Node.js 22. It reads the original ink annotations, LP2 corpus, p50 table, and the existing Gibran control. It tests the fixed 8-variant prime-start family and 16-variant constant-shift family, including exact planted controls.
