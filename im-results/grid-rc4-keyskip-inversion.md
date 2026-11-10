# RC4 with numeric-table column keys and collision-dependent hidden key-skips

**Status:** a reproducible source-derived exact-inversion negative on original LP2 opening prefixes. Agent 41, 2026-11-10. No original LP2 plaintext, source key, or destination recovered.

## Mechanism and motivation

The 32×8 base-60 table on LP2 pages 49–51 provides eight literal 32-byte (256-bit) column keys. Previous direct RC4 tests did not attempt exact hidden cursor recovery under the manuscript's strong anti-doublet pattern, so a genuine candidate could have been incorrectly discarded after an early key skip.

This experiment uses each column directly in *standard RC4 KSA and PRGA*. A 0, 256 or 3072 byte drop is applied before mapping output bytes into GP indices by either modulo29, 29/256 scale, or rejection of bytes 232–255 followed by modulo29. The eight ciphertext groups are 729, 1145, 1738, 1894, 1021, 1433, 1680 and 3316 runes. The first **256 runes per group**, 2048 original symbols total, form a fixed gate. The eight column keys may be assigned in any of 8! ways. Both signs of modulo-29 additive encryption are considered, yielding **18 generator, map, sign settings** and an exact optimum permutation for each.

The decoder is reused from [the full-width MT hidden-keyskip inversion](grid-mt-keyskip-inversion.md): a dynamic program with at most 30 consumed extra key symbols over 256 ciphertext runes. Every proposed extra key draw must satisfy the original-ciphertext collision condition, with 1–2 retries at an emitted rune and a fixed penalty 2.6 per extra draw. It uses an independently trained GP-English unigram reference from the first 240k Shakespeare fixture characters. Thus it is capable of recovering hidden cursor slips rather than merely subtracting a fixed RC4 stream.

## Original result and held-out-source positive check

The planted control uses the last 60k fixture characters encoded as actual GP English, split into eight 256-rune inputs at the original group offsets. Eight original grid columns independently seed RC4 with a **256-byte drop and unbiased 232-byte rejection mapping**. Encryption adds the pad modulo29, with an 81% collision-triggered reroll policy that consumed a total **53 extra key bytes**. It is then fed to exactly the same search without disclosing the generator setting, key permutation, or positions of key skips.

| Measure | Actual LP2 prefixes | Held-out GP-English plant |
| --- | ---: | ---: |
| Highest decoded language score/rune | **−3.9520002** | **−3.1428793** |
| Winning map/drop/GP sign | scale / 256 / subtract | **reject / 256 / subtract (true)** |
| Optimal 8-column assignment | [3,2,4,7,5,0,1,6] | **[0,1,2,3,4,5,6,7] (true)** |
| Exact planted English runes recovered | Not available | **1836/2048 = 89.65%** |
| Planted group-specific source accuracy | Not available | 48,256,253,256,256,256,255,256 out of 256 |

The planted search's first group has only **48/256** true-rune recovery despite selecting the exact key. All the other seven groups recover **253–256/256**, showing that the unigram Viterbi can fail locally even with correct key material, especially on an atypical opening. Therefore the result is strictly a robust *multi-group candidate gate*, and should not be interpreted as proof of uniform single-group power. It is, however, strongly discriminating for the planted full eight-group column-key design: the true global setting and all eight column assignments rank first.

**Decision:** this particular RC4 key-source model with collision-only 1–2 key skips and 30-draw maximum on 256-rune prefixes has no corresponding language signal on LP2. The original winning assignment is an optimizer state with no decipherable text. This does not exclude arbitrary RC4 derivation, other byte schedules and encodings, non-reset sections, larger drift, an outer alphabet, or non-English text. No Monte Carlo family-wise p-value is claimed. Further searches must require external key or mechanism constraints rather than retuning the penalty against the observed score.

## Reproduce

Script: [sims/grid_rc4_keyskip_inversion.py](../sims/grid_rc4_keyskip_inversion.py), using the established grid and Viterbi input loaders. Python3 standard library, read-only. Manual workflow: [.github/workflows/grid-rc4-keyskip-inversion.yml](../.github/workflows/grid-rc4-keyskip-inversion.yml). [Successful GitHub Actions run 42758491618](https://github.com/FlareZ123/liber-primus/actions/runs/42758491618) prints 5 real candidates, 3 planted leaders, true-key exact recovery for every group and observed output key-skip counts.
