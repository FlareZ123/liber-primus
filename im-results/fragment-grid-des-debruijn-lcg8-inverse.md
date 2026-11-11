# Source-fixed de Bruijn × LCG8 table-key test

**Classification:** bounded negative; structural row/column crosslink retained. No unknown plaintext, authentic key, complete cipher, or destination recovered.

## Source-derived indexing

The 31 original 13-dot marks create 32 full-text fragments, including empty fragments 8 and 11. The black-marker-anchored 32-state order is:

`BLACK = [13,26,20,9,18,4,8,16,0,1,2,5,10,21,11,23,14,29,27,22,12,24,17,3,7,15,31,30,28,25,19,6]`.

The p55 ornament's two pale positions, combined with the 8-column width, select fragment indices 8 and 11. In the BLACK order, `BLACK[8]=0` and `BLACK[11]=5`, matching the two literal zero-token columns in the original 32×8 table.

A second, independent column order is the full-period recurrence `x <- 13*x + 31 (mod 8)), giving:

`LCG8 = [0,7,2,1,4,3,6,5]`.

The two zero cells in the original table are `(row 24,col 0)` and `(row 28,col 5)`. Applying the inverse BLACK row map and LCG8 column positions gives:

| Original zero cell | BLACK inverse fragment | Full-text fragment length | LCG8 byte position |
|---|---:|---:|---:|
| (24,0) | 21 | 8 runes | 0 (first byte) |
| (28,5) | 28 | 5 runes | 7 (last byte) |

Thus the zero columns are anchored by the two empty fragments, while the zero rows map to fragments 21 and 28. Fragment 28 is in the solved p56/p57 tail, not among the 28 unknown-page fragments. This is a two-dimensional structural crosslink, **not** a direct mapping of zero rows to empty fragments and not a cipher key.

## Cipher hypothesis tested

A 32×8 row is a natural 8-byte DES key. I therefore tested the single combined, source-fixed assignment:

`key(fragment f)[j] = base60Grid[BLACK[f]][LCG8[j]]`.

The original unknown text was split using all 31 physical punctuation events, preserving both empty fragments. The 28 fragments covering pages 0–55 were tested with 96 fixed DES configurations:

- CTR or OFB;
- zero, fragment-index, or grid-row IV;
- forward or reversed key bytes;
- direct GP29 or transparent-EA GP28 output register;
- modulo or scaled byte reduction;
- both output signs.

No ciphertext-selected phase or fitted key was introduced.

## Result

| Measure | Training | Held-out |
|---|---:|---:|
| Untreated original | −6.191417 | −6.185340 |
| Best training-ranked candidate | −6.104974 | −6.222688 |
| Best held-out-ranked candidate | −6.157803 | −6.094346 |

The best training candidate improves its training score slightly but worsens held-out score; the best held-out candidate remains ciphertext-like. Neither yields readable text. The source-native planted control recovers all **12,956/12,956** runes and ranks its true configuration **1st of 96**, with exact re-encryption.

**Decision:** reject this exact BLACK-row × LCG8-column DES construction. This does not reject DES under other source-derived key/nonce mechanisms, nor does it establish that BLACK or LCG8 is the intended table traversal. Do not expand this into arbitrary DES modes or KDF searches without a new independent clue.

## Reproduction

- Implementation: [`sims/fragment_grid_des_debruijn_lcg8_inverse.cjs`](../sims/fragment_grid_des_debruijn_lcg8_inverse.cjs)
- Compact output: [`im-results/fragment-grid-des-debruijn-lcg8-inverse.json`](fragment-grid-des-debruijn-lcg8-inverse.json)
- CI: [workflow](../.github/workflows/fragment-grid-des-debruijn-lcg8-inverse.yml)
- The existing [de Bruijn row-only DES test](../sims/fragment_grid_des_debruijn_inverse.cjs) and [13/31 LCG row/column DES test](../sims/fragment_grid_des_lcg_inverse.cjs) are distinct prior negatives; this test evaluates their previously uncombined row/column composition.
