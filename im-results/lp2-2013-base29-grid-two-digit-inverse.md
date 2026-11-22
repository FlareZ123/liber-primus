# Original printed 256-byte table as a 512-digit BASE29 key

**Decision, Agent 22, 11 November 2026:** a single natural, lossless source-to-rune expansion derived from the authenticated 2013 BASE29 convention does not yield original unknown LP2 language under either GP29 additive direction and either direct original clock. **No unknown Liber Primus plaintext, cryptographic key, or continuation is recovered.**

## Source-first candidate

The authenticated 2013 Cicada TCP challenge uses `BASE29 3301 → 3QO`. Separately, original Liber Primus physical pp49–51 print 32 rows of eight base60 values; the frozen original-image-adjudicated interpretation in `resources/liber-primus/base60-grid.json` yields precisely **256 bytes**. This suggests a deliberately different, information-preserving alternative to previously tested `byte %29` reductions.

For each original printed byte `B`, read the **two positional base29 digits** `floor(B/29), B%29`, in that order, with a leading zero retained if needed. Thus all 256 byte values map bijectively onto **512 digits, each 0–28**, without dropping any source information or applying a fitted cipher key. The first 20 GP index digits are

`[7,0,7,28,5,22,6,12,3,10,8,5,4,10,6,9,3,5,8,17]`.

The arithmetic conversion is directly motivated by the signed 2013 BASE29 example; the extension from digits to a **repeating additive LP2 pad** remains a hypothesis. The original sources do not explicitly command that extension. A solver could plausibly try it without knowing unknown plaintext.

## Exact original-rune inverse

Read the original 55 rune-bearing unsolved physical LP2 pages as 12,956 canonical GP29 symbols. For the frozen 512-digit sequence `K`, test exactly

`P[i] = (C[i] ± K[i mod512]) mod29`

under each of two visible clocks: concatenate physical pages without resetting the pad, or reset pad position to zero at the beginning of every physical page. No page, title, digit, key phase, byte orientation, guessed phrase, or English score changes the source-selected key.

| Original model | Full recovered GP29 index of coincidence |
| --- | ---: |
| Raw ciphertext, no operation | **0.0344783978645** |
| Continuous key, C−K | **0.0344499072895** |
| Continuous key, C+K | **0.0344948535250** |
| Page-reset key, C−K | **0.0344859882017** |
| Page-reset key, C+K | **0.0344851421830** |

All four decoded original streams remain near the uniform 29-symbol reference `1/29 ≈ 0.0344827586` and produce no coherent plaintext. Their first 70 GP symbols are recorded by the standalone reproducer; the output is visually nonlinguistic. These data show that the specific direct additive reading has no credible GP-native English recovery. They do **not** exclude a source key passed through an independent cipher/derivation, a differently clocked cipher, altered word segmentation or a different plaintext register.

**Positive control:** each of the four pad directions/reset policies encrypts an independent synthetic 12,956-rune plaintext made from the already-solved p57 PARABLE symbol sequence, retaining all 55 original page lengths. The same full inverse recovers every planted symbol, exact **12,956/12,956** for all four cases. The test also asserts `29×high+low=B` for all 256 original byte values, the original table-byte decoding, the documented 2013 BASE29 known-answer numeral, all four real original IoCs and the full original rune count.

## What this changes

The two-digit positional BASE29 expansion is **distinct** from (a) single-digit byte-remainder or quantized keystream maps, and (b) the `floor(B/29)` higher-byte channel previously interpreted as one base-9 numeral in [the source-only gate](p50-base29-high-digit-radix9-source-gate.md). It closes one source-constrained, lossless digit-to-GP additive-key proposal without expanding an arbitrary KDF or key phase search.

A new independent source instruction would be needed to select a nonlinear transport or a different key clock. Cycling more arbitrary byte encodings against the same flat original ciphertext would add little likelihood of genuine plaintext.

**Reproduction:** [`sims/lp2_2013_base29_grid_two_digit_inverse_sft.cjs`](../sims/lp2_2013_base29_grid_two_digit_inverse_sft.cjs), Node.js 22 CommonJS, no network, packages, or writes. The original-source computations were independently executed in the connected JavaScript runtime before publication; the standalone source code preserves the exact assertions and native-language plant.
