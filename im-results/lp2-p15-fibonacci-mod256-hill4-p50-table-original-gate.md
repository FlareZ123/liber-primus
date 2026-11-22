# LP2 p15 Fibonacci 4×4 as a reversible byte Hill key for the original p49–51 numeral table

**Agent 3, 14 November 2026. Classification: original-input bounded negative; no recovered plaintext, historical cipher key, or destination.** Reproducers: [mod-256 source-locked inverse](../sims/lp2_p15_4x4_mod256_grid_inverse_sft.cjs), [GF(256) source-locked inverse](../sims/lp2_p15_gf256_hill4_grid_original_sft.cjs). Both passed on Windows Node22: [mod-256 CI 43623005788](https://github.com/FlareZ123/liber-primus/actions/runs/43623005788) and [GF(256) CI 43623708245](https://github.com/FlareZ123/liber-primus/actions/runs/43623708245).

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

## Direct byte Hill in the AES GF(256) field: independent fixed-algebra extension

A byte Hill cipher can alternatively use the field GF(2⁸) instead of the integer ring Z/256Z. The historically conventional AES field with the irreducible polynomial `x^8+x^4+x^3+x+1` makes even entries invertible whenever nonzero. This removes the ring determinant obstruction for the printed-distance and prime-value matrices: **all four p15 source arithmetic matrices are nonsingular over GF(256)** (established by exact Gauss-Jordan inversion). Keep the identical original p49–51 256-byte row-major source, four-byte word alignment, original source matrices, eight dihedral orientations, and four matrix/inverse/transpose conventions, for **4×8×4 = 128 fixed direct byte operations**. No unknown plaintext, byte phase, source key or IV is fitted.

The best original output is prime-ordinal K⁻¹ with 113/256 printable ASCII bytes (including TAB/CR/LF), longest printable run **10**, initial bytes `49a3e49caab30a061bae60c610d27902`. The longest run itself is `,j4[\ra=r$l`, with an embedded CR and no readable instruction. All 128 outputs range **84–113** printable bytes. Against **1,000 complete-family matched nulls** that shuffle only the original exact 256-byte inventory and then repeat all 128 candidates, **647** shuffled maxima are at least 113 (plus-one upper tail **648/1001 = 0.6473526473526473**; null median 114, 95th percentile 121). The source-original result is ordinary under the matched selection rule, despite the incidental ten-byte printability run.

A separate 256-byte English ASCII plant is transformed with a source-key matrix, then the exact finite-field inverse recovers **256/256 original bytes**, proving a real byte decryption is possible. [Source-exact SFT](../sims/lp2_p15_gf256_hill4_grid_original_sft.cjs) includes a frozen 256×256 field multiplication table, all 128 keys, invertibility assertions, original outputs, matched null and this positive control; [Windows Node22 run 43623708245 passed](https://github.com/FlareZ123/liber-primus/actions/runs/43623708245). The source gives no first-party instruction that LP2 uses GF(256) or a Hill cipher. None of the direct inverses yields original unknown plaintext.

## Research decision

**Retire both direct mod-256 and AES-field GF(256) four-byte Hill inversions of the original 256-table payload under the four p15-authenticated numeric matrices, their eight orientations and four key/direction conventions.** In the mod-256 integer ring, the p15 printed distances and prime-value matrices fail the invertibility requirement because their determinants are even; the separate GF(256) implementation includes all four and also produces no authentic decoded register. Nothing here rejects other numeric-table functions, the p15 spiral's unrelated 29-symbol uses, or a historical key/IV not yet found. In particular, the creator did not independently select base60, the modular256 Hill operation, or the p15-to-p50 linkage. This source-visible option yields no authentic unknown Liber Primus plaintext and warrants no key/phase expansion solely to improve incidental ASCII score.

See [p15 source Hill29 gate](fibonacci-square-hill4-gate.md), [existing p15-grid AES/ChaCha gate](fibonacci-square-grid-unwrapping.md), and [Cicada-authenticated base60 source audit](lp2-cicada-authenticated-base60-alphabet-audit.md) for the distinct prior scopes.
