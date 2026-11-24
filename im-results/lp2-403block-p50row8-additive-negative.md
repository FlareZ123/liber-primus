# 403-rune blocks with p50 8-byte row keys: negative direct additive gate

**Status:** rejected for the declared receiver; intermediate result, not an established decryption.

## Hypothesis

The existing floral-art audit records the repeated p40–55 two-cluster pattern read as 13 and 31, and the numeric p50 artifact is a 32×8 base-60 byte table. A separate arithmetic alignment is that the 12,956 unknown LP2 runes satisfy

```
403 = 13 × 31
12,956 = 32 × 403 + 60
```

This suggests a simple blockwise receiver distinct from a single global period-403 substitution: use one p50 table row per 403-rune block, with the row's eight byte values as a repeating period-8 additive GP29 key. The 32 rows cover 32 complete blocks. This is only a candidate interpretation; the source does not independently state that 403 is a block size, that rows are block keys, or that the eight columns form a repeating key.

## Reproduction

Inputs:
- `resources/liber-primus/lp2-corpus.json`, Git blob `054f2a0f780b7d46901acbe3d9bf4f0ac1801165`; flatten pages 0–55 in page order (p50 has no runes).
- `resources/liber-primus/base60-grid.json`, Git blob `4698c0806e6bab06a39cfbc3c3283b862de58b35`; decode each two-character token using the file's 60-symbol alphabet to a byte, then reduce mod29.

For block (j=0,ldots,31), take table row (j) as an eight-value key. At offset (t=0,ldots,402), use key value (K_{j,t}=row_j[tmod8]mod29). Test both (P=C-Kpmod{29}) and (P=C+Kpmod{29}). The primary score covers only the first (32×403=12,896) runes. The remaining 60-rune tail is deliberately untested because the source does not select a 33rd row/key. No F-skip, row reversal, or free phase is introduced.

Run from the repository root:

```sh
node sims/lp2_403block_p50row8_additive_gate.cjs
```

The script is `sims/lp2_403block_p50row8_additive_gate.cjs`.

## Result

| Stream | IoC | (29×IoC) |
|---|---:|---:|
| Original first 12,896 runes | 0.034480683 | 0.999940 |
| Subtract row key | 0.034478302 | 0.999871 |
| Add row key | 0.034457483 | 0.999267 |

The outputs remain at the uniform GP29 baseline (approximately 1.0 after multiplying IoC by 29). For comparison, the pinned native GP29 controls in the 31-mark phase-capacity gate have a weakest normalized IoC of 1.676676. Neither sign yields language-like symbol repetition.

## Decision and limits

Reject this direct `32 rows × 8-symbol key × 403-rune block` additive receiver. The 60-rune tail was not scored and no conclusion about a source-selected tail rule is implied. Do not rescue the failed result with arbitrary row permutations, phases, F-skip rules, or alternative byte mappings absent an independent source instruction.

This does not test a different per-block stream cipher or a nonlinear state machine. Those would require their own historical/source selector and a locked prediction. The 13/31 motif and 32×8 table have already been examined in `im-results/lp2-floral13-31-32row-affine-pair-cover-original-gate.md`; this report records only the distinct 403-block row-key receiver.
