# Fibonacci-indexed extraction from the LP2 base-60 table as section IVs

**Classification:** source-constrained, executable negative on a complete decryption mechanism. Agent 32, 2026-11-10. **No genuine LP2 key, rune plaintext, or destination recovered.**

## Mechanism and input

This distinct cross-clue hypothesis treats the authentic LP2 page-15 4×4 Fibonacci-indexed-prime square as an *index selector*, rather than concatenating its printed numbers directly into a key or IV as in prior tests. The independent 32×8 table spanning LP2 pages 49–51 supplies 256 bytes. A selection of sixteen table bytes forms a candidate 128-bit IV.

Four fixed sixteen-number selectors were used in their established clockwise spiral order: the unique Fibonacci prime ranks **[1,2,3,4,6,9,14,22,35,56,90,145,234,378,611,988]**, either one-based or zero-based when reduced mod256; the matching prime values; and the printed square numbers. Each selects bytes from either row-major or column-major serialized 256-byte table: **eight IV candidates**. The source-derived numerical square identity is historical community prior art, not a new discovery.

The table's eight complete 32-byte vertical columns independently serve as AES-256-CTR or ChaCha20 keys for the eight text groups defined in the earlier grid-section project, including its explicit 9-rune bridge merge. Section lengths are **[729,1145,1729,1903,1021,1524,1589,3316]** (12,956 original LP2 ciphertext runes). For each IV, the 16 named mode settings test cipher choice, reversed/forward column-key bytes, two byte-to-mod29 reductions, and additive sign. The exact maximum-weight eight-key/section assignment is found by the existing subset dynamic programming rather than greedy matching.

**Sealed selection and prediction:** choose the IV, algorithm, byte conversion, sign and 8-column assignment **solely from the first 400 runes per section** (3,200 runes). Continue the same stream at positions 400 onward of each section without key refitting. Assess the 9,756 original held-out runes by weighted decoded 29-rune index of coincidence. The 40 wrong-IV replicates each redo the entire selection using eight fresh random 16-byte IVs, including all 16 cipher/setting choices and optimal assignments.

## Executed output

Manual [GitHub Actions run 42755680789](https://github.com/FlareZ123/liber-primus/actions/runs/42755680789) succeeded against the committed source with Node.js 22. The winner was **row-major / Fibonacci-rank-one-based**, IV `cbe7a7baed5c0489c550dc7deaed483b`, ChaCha20, forward column bytes, modulo29 reduction, negative decoding sign, table-column assignment **[2,6,5,3,4,7,1,0]**. This postselected winner has training weighted IoC **0.0357628446**.

| Measure | Actual LP2 | Matched 40-random-IV search |
|---|---:|---:|
| Locked held-out weighted decoded IoC | **0.0344612464** | mean **0.0344791975**; maximum **0.0345986339** |
| Entire-family training selection upper-tail p | 0.585366 | 40 replicates |
| Locked held-out upper-tail p | **0.609756** | 40 replicates |

The uniform-29 baseline is 1/29 ≈ **0.03448276**. The decoded held-out section tails show no independently verifiable natural-language passage; their individual IoCs range from ~0.03379 to ~0.03498.

**Positive control:** encrypt 12,956 separately sourced Shakespeare GP runes with the actual source-selected rank-1 IV, AES-256-CTR, the eight true column keys in their printed order, modulo29 additive GP, then change 348 immediate-repeat output symbols (81% repair chance). The identical search recovered the exact original IV, algorithm, key orientation, byte reducer, sign and all **eight true column assignments**. Its locked held-out decoded IoC was **0.0586598399**. This demonstrates sensitivity to the specified direct additive cipher and English-like register despite the artificial doublet repair.

## Consequence and boundaries

The tested **eight source-indexed IV construction rules combined with raw grid-column section keys** fail the original ciphertext held-out prediction. There is no basis to claim the winning IV or assignment as actual secret material. This outcome does not exclude a hidden output alphabet, key-skips, another key-derivation function, multiple IV blocks, a different section partition, alternative numerical index semantics, or a different intermediate plaintext encoding. Its calibration has only 40 wrong-IV replicates, adequate to show absence of a substantial English-IoC signal but insufficient for subtle-tail inference.

Reproduce: [sims/fibonacci_indexed_grid_iv.cjs](../sims/fibonacci_indexed_grid_iv.cjs), on-demand [manual workflow](../.github/workflows/fibonacci-indexed-grid-iv.yml), original [LP2 256-byte table](../resources/liber-primus/base60-grid.json), [canonical original rune corpus](../resources/liber-primus/lp2-corpus.json). No scheduled or per-commit CI is installed.

**Further priority:** requires independently evidenced *key-use constraints* that actually predict plaintext. Additional unconstrained IV selection or postselected language score sweeps on the same table repeat negative work.
