# Full-corpus p49–p51 remainder-key gate

**Disposition: reject the fixed book-global period-256 additive/subtractive key.** This is a bounded negative result, not a plaintext recovery.

## Human-solve-path hypothesis

The printed p49–p51 numeric table has 256 cells. LP2 uses a 29-symbol Gematria Primus alphabet, and the signed 2013 TCP challenge authenticates a `BASE29` operation. A solver could plausibly try reducing the table's byte representation modulo 29 and using the resulting 256-symbol stream as a repeating additive key. This is not a source-proven instruction: the historical `BASE29` command does not say to reduce the LP2 table modulo 29 or use it as a cipher key. The experiment tests the simplest fixed version before inventing offsets, resets or extra layers.

This is **distinct** from:
- the p55-only direct remainder-prefix test in [`p50-base29-remainder-direct-p55-gate.md`](p50-base29-remainder-direct-p55-gate.md);
- the 10,240-rune M7-orbit-complement test, which permuted the remaining fragments and table rows in [`p50-m7-nonlinear-stream-composition.md`](p50-m7-nonlinear-stream-composition.md).

Here the target is the complete **12,956-rune p0–p55 stream in original page order**, not the M7-selected 10,240-rune complement.

## Frozen test

- **Ciphertext:** the 55 rune-bearing pages among p0–p55, concatenated in original page order; p50 is the numeric table and contributes no runes. Total: 12,956 symbols.
- **Key source:** the full 256-byte row-major p49–p51 table from `base60-grid.json`, cross-checked byte-for-byte against `lp2-grid-256.json`.
- **Key mapping:** `K[i] = B[i] mod 29`. The key contains all 29 GP residues and repeats with period 256.
- **Clock:** one continuous key clock beginning at the first rune of p0; no page resets. Spaces, punctuation and page separators do not consume key symbols because the corpus index contains rune symbols only.
- **Operations:** `P = C − K (mod 29)` and `P = C + K (mod 29)`. No phase fitting, reversal, row sorting, or key tuning.
- **Language control:** native-GP transliteration of `gibran_prophet_58585.txt`; first 40,000 symbols train a smoothed trigram model, and 22,441 held-out 256-symbol windows provide the reference range.
- **Null:** 512 deterministic Fisher–Yates permutations of the same 256-symbol key multiset, tested under both signs (seed `0x20261111`).

The four source files are pinned by Git blob IDs in the reproducer: corpus `054f2a0f780b7d46901acbe3d9bf4f0ac1801165`, base60 grid `4698c0806e6bab06a39cfbc3c3283b862de58b35`, 256-byte grid `39c4f098566fc5eba9d6738416a2fd193f800701`, and Gibran control `df260a07d56bf5998d40a6360b6132c35c252d10`.

## Results

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

## Decision and limits

Retire this exact model: full row-major `B mod 29` table, period 256, phase zero, one continuous p0–p55 rune clock, additive or subtractive GP29. Do not rescue it by fitting a phase, reversing the key, resetting at selected pages, permuting rows, or adding an M7/field layer without a new original-source clue that selects that change.

This does **not** reject other uses of the p49–p51 table, page-local keys, non-additive transforms, a separately specified state machine, or other source-derived key material. It also does not establish that the 2013 `BASE29` command was intended to be reused in LP2.

## Reproduction

Run from the repository root:

```sh
node sims/p50_global_remainder_vigenere_gate.cjs
```

The script verifies all input Git blob IDs, source dimensions, byte-grid equality, GP control length, exact inverse round-trip, and the recorded scores/null results.
