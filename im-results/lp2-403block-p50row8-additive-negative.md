# 403-rune blocks with p50 8-byte row keys: negative direct receivers

**Status:** rejected for the declared direct additive and standard-RC4 receivers; intermediate result, not an established decryption.

## Hypothesis

The existing floral-art audit records the repeated p40–55 two-cluster pattern read as 13 and 31, and the numeric p50 artifact is a 32×8 base-60 byte table. A separate arithmetic alignment is that the 12,956 unknown LP2 runes satisfy

```
403 = 13 × 31
12,956 = 32 × 403 + 60
```

This suggests a simple blockwise receiver distinct from a single global period-403 substitution: use one p50 table row per 403-rune block, with each row's eight byte values as a block key. The 32 rows cover 32 complete blocks. This is only a candidate interpretation; the source does not independently state that 403 is a block size, that rows are block keys, or that the eight columns form a repeating key.

## Reproduction

Inputs:
- `resources/liber-primus/lp2-corpus.json`, Git blob `054f2a0f780b7d46901acbe3d9bf4f0ac1801165`; flatten pages 0–55 in page order (p50 has no runes).
- `resources/liber-primus/base60-grid.json`, Git blob `4698c0806e6bab06a39cfbc3c3283b862de58b35`; decode each two-character token using the file's 60-symbol alphabet to a byte.

For block (j=0,ldots,31), take table row (j) as an eight-byte key. The primary score covers only the first (32×403=12,896) runes. The remaining 60-rune tail is deliberately untested because the source does not select a 33rd row/key.

Two direct receivers were tested:

1. **Period-8 additive GP29 key:** reduce each row byte mod29 and repeat the eight values across its 403-rune block; test both (P=C-Kpmod{29}) and (P=C+Kpmod{29}).
2. **Standard RC4 stream:** use the raw eight bytes of each row as the RC4 key, generate 403 bytes, reduce each keystream byte mod29, and test both additive signs.

Run from the repository root:

```sh
node sims/lp2_403block_p50row8_additive_gate.cjs
```

The script is `sims/lp2_403block_p50row8_additive_gate.cjs`.

## Result

All values below are for the first 12,896 runes only. Normalized IoC is (29×IoC); a uniform 29-symbol stream is approximately 1.0.

| Stream | IoC | (29×IoC) |
|---|---:|---:|
| Original prefix | 0.034480683 | 0.999940 |
| Additive row key, subtract | 0.034478302 | 0.999871 |
| Additive row key, add | 0.034457483 | 0.999267 |
| RC4 row key, subtract | 0.034456136 | 0.999228 |
| RC4 row key, add | 0.034494538 | 1.000342 |

The outputs remain at the uniform GP29 baseline. For comparison, the pinned native GP29 controls in the 31-mark phase-capacity gate have a weakest normalized IoC of 1.676676. Neither receiver yields language-like symbol repetition.

## Decision and limits

Reject these direct `32 rows × 8-byte keys × 403-rune blocks` receivers. The 60-rune tail was not scored and no conclusion about a source-selected tail rule is implied. Do not rescue the failed result with arbitrary row permutations, phases, F-skip rules, alternative byte mappings, RC4-drop variants, or other parameters absent an independent source instruction.

This does not test every possible per-block stream cipher or nonlinear state machine. Those would require their own historical/source selector and a locked prediction. The 13/31 motif and 32×8 table have already been examined in `im-results/lp2-floral13-31-32row-affine-pair-cover-original-gate.md`; this report records only the distinct 403-block direct row-key receivers.
