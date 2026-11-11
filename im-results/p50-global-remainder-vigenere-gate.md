# p49–p51 remainder-key clock gates

**Disposition: reject the two simplest fixed additive/subtractive uses of the full 256-cell table as a GP29 key.** Neither the book-global clock nor a reset at each page recovers plaintext.

## Human-solve-path hypothesis

The printed p49–p51 numeric table has 256 cells. LP2 uses a 29-symbol Gematria Primus alphabet, and the signed 2013 TCP challenge authenticates a `BASE29` operation. A solver could plausibly try reducing the table's byte representation modulo 29 and using the resulting 256-symbol stream as a repeating additive key. This is not a source-proven instruction: the historical `BASE29` command does not say to reduce the LP2 table modulo 29 or use it as a cipher key. The page boundaries are visible in the original artifact, so a per-page reset is a plausible alternative to one continuous book clock. Both models are frozen at phase zero and use the same row-major key; neither fits a phase or changes table order.

This is **distinct** from:
- the p55-only direct remainder-prefix test in [`p50-base29-remainder-direct-p55-gate.md`](p50-base29-remainder-direct-p55-gate.md);
- the 10,240-rune M7-orbit-complement test, which permuted the remaining fragments and table rows in [`p50-m7-nonlinear-stream-composition.md`](p50-m7-nonlinear-stream-composition.md).

Here the target is the complete **12,956-rune p0–p55 stream in original page order**, not the M7-selected 10,240-rune complement.

## Frozen test

- **Ciphertext:** the 55 rune-bearing pages among p0–p55, concatenated in original page order; p50 is the numeric table and contributes no runes. Total: 12,956 symbols.
- **Key source:** the full 256-byte row-major p49–p51 table from `base60-grid.json`, cross-checked byte-for-byte against `lp2-grid-256.json`.
- **Key mapping:** `K[i] = B[i] mod 29`. The key contains all 29 GP residues and repeats with period 256.
- **Global clock:** start at key[0] on p0's first rune; continue across page boundaries without reset. Separators do not consume key symbols.
- **Page-reset clock:** reset to key[0] at the first rune of each of the 55 rune-bearing pages. Separators do not consume key symbols.
- **Operations:** `P = C − K (mod 29)` and `P = C + K (mod 29)`.
- **Language control:** native-GP transliteration of `gibran_prophet_58585.txt`; first 40,000 symbols train a smoothed trigram model, and 22,441 held-out 256-symbol windows provide the reference range.
- **Nulls:** 512 deterministic Fisher–Yates permutations of the same 256-symbol key multiset per clock model (seeds `0x20261111` global and `0x20261112` page-reset).

The four source files are pinned by Git blob IDs in the reproducer: corpus `054f2a0f780b7d46901acbe3d9bf4f0ac1801165`, base60 grid `4698c0806e6bab06a39cfbc3c3283b862de58b35`, 256-byte grid `39c4f098566fc5eba9d6738416a2fd193f800701`, and Gibran control `df260a07d56bf5998d40a6360b6132c35c252d10`.

## Results: one continuous book-global clock

| Readout | Raw ciphertext | C−K | C+K |
|---|---:|---:|---:|
| Mean native-GP trigram log score | −12.27632833 | −12.27945349 | −12.28055528 |
| Index of coincidence | 0.03447840 | 0.03446720 | 0.03445152 |
| Complete non-overlapping 256-rune windows | — | 50 | 50 |
| Windows at or below the worst held-out native window (−9.22531953) | — | 50/50 | 50/50 |
| Best candidate-window score | — | −11.89064185 | −11.92366893 |

Both decryptions slightly **worsen** the full-stream score relative to raw ciphertext. All 50 candidate windows in each direction score below even the worst held-out native-GP window.

| 512 shuffled-key null | C−K | C+K |
|---|---:|---:|
| Null median | −12.29048433 | −12.28883685 |
| Null 95th percentile | −12.26589387 | −12.26055215 |
| Null maximum | −12.23983564 | −12.23352884 |
| Shuffles scoring at least as well as the fixed key | 127/512 | 164/512 |
| Add-one empirical upper-tail p | 0.2495 | 0.3216 |

The fixed table order is not exceptional among permutations of the same key symbols. Both outputs round-trip exactly under the inverse transform; the result is a negative cryptanalytic test, not an implementation failure.

## Results: reset the key at each page

| Readout | Raw ciphertext | C−K | C+K |
|---|---:|---:|---:|
| Weighted mean page-wise trigram log score | −12.27645804 | −12.27822341 | −12.30616874 |
| Unweighted mean of 55 page scores | −12.27566846 | −12.27828912 | −12.31496874 |
| Pages above same-length native-GP 95th percentile | — | 0/55 | 0/55 |
| Pages above same-length native-GP 99th percentile | — | 0/55 | 0/55 |

The best page under C−K is p48 (271 runes, score −12.04200; native 95th percentile −7.57171). The best under C+K is p52 (263 runes, score −12.02320; native 95th percentile −7.56985). No page approaches the native-GP range.

| 512 shuffled-key null | C−K | C+K |
|---|---:|---:|
| Null median | −12.29183416 | −12.28972573 |
| Null 95th percentile | −12.26353614 | −12.26306560 |
| Null maximum | −12.23642009 | −12.24535626 |
| Shuffles scoring at least as well as the fixed key | 99/512 | 428/512 |
| Add-one empirical upper-tail p | 0.1949 | 0.8363 |

Both page-reset decryptions round-trip exactly. No page enters even the 95th percentile of same-length held-out native-GP windows.

## Decision and limits

Retire these two exact models: full row-major `B mod 29` table, phase zero, period 256, with either one continuous p0–p55 rune clock or a reset to key[0] at each page, under additive or subtractive GP29. Do not rescue them by fitting phases, reversing the key, permuting rows, or adding M7/field layers without a new original-source clue that selects the change.

This does **not** reject other uses of the p49–p51 table, a different source-selected key mapping, a separately specified state machine, or other key material. It also does not establish that the 2013 `BASE29` command was intended to be reused in LP2.

## Reproduction

Run from the repository root:

```sh
node sims/p50_global_remainder_vigenere_gate.cjs
```

The script verifies all input Git blob IDs, source dimensions, byte-grid equality, GP control length, exact inverse round-trips for both clocks, and the recorded scores/null results.
