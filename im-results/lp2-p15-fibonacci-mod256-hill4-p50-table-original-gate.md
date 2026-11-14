# LP2 p15 Fibonacci 4×4 as a reversible byte Hill key for the original p49–51 numeral table

**Agent 3, 14 November 2026. Classification: original-input bounded negative; no recovered plaintext, historical cipher key, or destination.** Reproducer: [read-only Node22 single-file test](../sims/lp2_p15_4x4_mod256_grid_inverse_sft.cjs). [Successful Windows original-cipher CI run 43623005788](https://github.com/FlareZ123/liber-primus/actions/runs/43623005788).

## Human-visible hypothesis and exact missing instruction

Physical LP2 p15 prints a 4×4 square of sixteen numbers reconstructed from Fibonacci-indexed prime numbers. Physical pp49–51 print a 32×8 array of 256 two-character alphanumeric tokens. A 2014 participant actually converted that latter object into 256 bytes using a sexagesimal convention, but no Cicada-authenticated text explicitly defines the base-60 digit alphabet or instructs a 4×4 matrix cipher. A straightforward, historically available candidate is to interpret the p15 square as the key to a four-byte Hill cipher over the byte ring Z/256Z, processing the table's 64 consecutive four-byte column vectors in their original printed order. This is different from the already tested p15 4×4 Hill on 29-symbol unknown runes and from AES/ChaCha using p15-derived keys against the 256 bytes.

The input is the unchanged, image-audited `resources/liber-primus/lp2-grid-256.json`, 256 row-major byte values; SHA-256 of that committed *JSON file text* is `2a77dc623df45ddd126d10d2fffbafead4efd161d2acc07644809deac00a2089`. The four source arithmetic representations of p15's printed 4×4 square are distances from 3301, underlying primes, their one-based prime ordinals, and Fibonacci indices. Their respective determinants modulo256 are **192, 224, 243, 133**. The first two are even and hence cannot serve as reversible modular-256 Hill keys; the **prime-ordinal** and **Fibonacci-index** matrices have odd determinants and are invertible. We retain only these two, independently source-selected four-by-four matrices, without changing entries or fitting a key.

For each of the two invertible matrices, cover all eight square dihedral orientations and the four natural matrix/vector and cipher/encrypt directions: K, K⁻¹, Kᵀ and (K⁻¹)ᵀ. Thus 2×8×4 = **64 declared cases**, some algebraically equivalent. The inverse uses the exact adjugate modulo256. This test assumes four-byte block alignment from the table's first cell and no IV; it does not try fitted offsets, rotations of byte positions, column shuffles or invented keys.

## Exact original result

| Statistic | Original table / selected output |
| --- | --- |
| Table cells processed | 256 bytes = 64 four-byte blocks |
| Best of 64: matrix | Prime-ordinal matrix, unrotated/unreflected, transpose |
| Best output printable ASCII including tab, CR, LF | **115/256** |
| Best output's longest contiguous printable run | **4** |
| Best output first 16 bytes | `fbe32839db00cd2e392b26f22016fadf` |
| All candidate output printable range | **85–115/256** |
| Complete original matched null | Shuffle the exact 256 table bytes, then select the maximum printable score over the same 64 matrices, **1,000 trials** |
| Matched null maximum median; 95th percentile | **111; 120** |
| Null maxima at least the original best | **236/1,000**, plus-one upper tail **237/1001 = 0.23676323676323677** |
| Independent 256-byte ASCII plant | **256/256 bytes exactly recovered** under the source matrix and its modular inverse |

The best original output begins with nontext bytes `fb e3 28 39 db 00 cd 2e...`, so it does not begin with an ordinary ASCII/PGP-armor/ZIP/gzip/PNG/PDF magic string. No candidate gives coherent plaintext. The 115 printable bytes are not unusual under the exact whole-family, original-byte-histogram-preserving randomization. The planted ASCII message proves the modular inverse works on a real byte-like language packet; it cannot validate the source manuscript's choice of a Hill cipher. All SFT assertions passed using Windows latest / Node.js22 in the linked CI run.

## Research decision

**Retire direct four-byte Hill inversion of the 256-table payload using either p15's actual invertible prime-ordinal or Fibonacci-index matrix, including their eight orientations and both matrix directions.** The original p15 printed distances and prime-value matrices fail a basic requirement for any reversible Hill4 over bytes, since their determinants are even. Nothing here rejects other numeric-table functions, the p15 spiral's unrelated 29-symbol uses, or a historical key/IV not yet found. In particular, the creator did not independently select base60, the modular256 Hill operation, or the p15-to-p50 linkage. This source-visible option yields no authentic unknown Liber Primus plaintext and warrants no key/phase expansion solely to improve incidental ASCII score.

See [p15 source Hill29 gate](fibonacci-square-hill4-gate.md), [existing p15-grid AES/ChaCha gate](fibonacci-square-grid-unwrapping.md), and [Cicada-authenticated base60 source audit](lp2-cicada-authenticated-base60-alphabet-audit.md) for the distinct prior scopes.
