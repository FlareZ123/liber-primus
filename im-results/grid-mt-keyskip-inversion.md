# Collision-aware MT19937 column-seed inversion with unknown key-consumption drift

**Status:** executed, planted-source-calibrated cryptanalytic negative on original LP2 section prefixes. Agent 41, 2026-11-10. No original LP2 plaintext, key or actual mechanism recovered.

## Why this attack differs from direct stream subtraction

Under a collision-rejection encryption model, a plaintext rune is combined with the next pseudorandom pad value modulo 29. If it would equal the previous ciphertext rune, the encoder can consume a further key value and retry without advancing the plaintext. Once the key cursor slips, all subsequent fixed-position pad subtractions fail. Thus the preceding direct [full-width MT screen](grid-mt-fullseed-sieve.md) did not exclude the full-width column seeds with hidden drift.

Here each of the eight 32-byte column keys printed across LP2 pages 49–51 seeds a fresh Python3 MT19937 full-width integer. For each of the eight logical rune groups, take **the first 256 actual runes**, fixed before evaluating the key candidates. The generated MT pad is tested for three extraction rules: 29-way bit-rejection, 53-bit float scaling, and 32-bit modulo. Both seed byte orders and both signs of modular encryption are examined. The unknown assignment of eight columns to eight sections is determined exactly by maximum-weight matching; 12 global settings and 8! assignments each are considered.

The decoder is a dynamic program whose state is the number d of consumed extra key draws, capped at **30** over 256 emitted runes. At each output it permits zero, one, or two extra draws. Every extra draw must satisfy the exact collision constraint that the candidate plaintext, re-encrypted using that rejected key index, would equal the preceding observed ciphertext glyph. Each skip incurs a fixed **2.6 log-score penalty**. The plaintext score is an independently trained 29-rune unigram model from the *first 240,000 characters* of the pinned Shakespeare fixture. The candidate paths are exact under this finite key-drift model and fixed penalty, and eight-key assignment is globally optimal with respect to these path scores.

## Result and blind same-algorithm positive check

The positive source contains **2,048 GP-encoded English runes** from the independently withheld final 60,000 Shakespeare characters, divided into eight 256-rune prefixes with original group offsets. The generating key material is the actual numeric grid column for each section, seeded big-endian with MT's float output; encryption adds pad modulo29. Whenever a would-be ciphertext repeat occurs, the source generator independently retries with probability 0.81, up to two key rerolls. The eight sections together consumed **59 hidden extra draws**. The decoder was not supplied their locations or the assignment.

| Result | Original LP2 | Unknown-key implanted English |
| --- | ---: | ---: |
| Best mean decoded log likelihood per rune | **−3.9349778** | **−3.0479397** |
| Strongest mode | big-endian, uint32 reduction, subtract | **big-endian, float scaling, subtract: exact** |
| Strongest eight-column assignment | [7,5,1,3,4,6,0,2] | **[0,1,2,3,4,5,6,7]: exact** |
| Exact rune recovery under the true generating key | No known original plaintext | **2,014 / 2,048 = 98.34%** |
| Inferred skips in strongest setting | [5,5,3,2,4,3,0,6] | [7,5,11,8,6,9,8,2] |

The eight planted per-section plaintext recovery fractions are 98.05%, 100%, 94.53%, 99.61%, 97.27%, 100%, 98.05% and 99.22%. The maximum-scoring planted configuration recovers the exact hidden column permutation and generator, despite the post-encryption key consumption. The highest original score remains far below its corresponding controlled signal, and the original cipher yields no language-like continuation.

**Interpretation:** this bounded family supplies no evidence that direct 256-bit numeric-grid columns were fed into Python3 integer-seeded MT with these output reductions, direct section starts and a collision-only retry policy. It is not a universal exclusion of MT, random key derivation, unknown pad offsets, fixed word layout, nonce salting, alternative rune alphabet, or other plaintext registers. A best-scoring arbitrary assignment is not a recovered key. The 2,048-rune gate deliberately avoids fitting on the entire manuscript and the 2.6 penalty is fixed; no Monte Carlo multiple-comparison p-value is claimed.

## Reproduce

Source: [sims/grid_mt_keyskip_inversion.py](../sims/grid_mt_keyskip_inversion.py), importing the shared source, grammar and exact assignment from [grid_mt_fullseed_sieve.py](../sims/grid_mt_fullseed_sieve.py). Requires only standard Python3 and three repository reference files. Manual workflow: [.github/workflows/grid-mt-keyskip-inversion.yml](../.github/workflows/grid-mt-keyskip-inversion.yml). [Successful Actions run 42758119132](https://github.com/FlareZ123/liber-primus/actions/runs/42758119132) prints the five strongest original candidates, the three strongest planted settings, all hidden skips, recovered exact plaintext fractions and the complete first-60-rune decoded arrays for each top setting. The script is read-only.
