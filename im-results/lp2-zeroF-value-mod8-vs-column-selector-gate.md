# zeroF raw-value-mod8 versus physical-column selector gate

## Decision

Replacing zeroF's radix-dependent nonzero `byte mod8` selector with the literal source-visible p50 column number preserves the same broad structural effect but does not dominate the frozen value selector.

Under the exact existing native-GP control samples, physical-column indexing is closer to the untouched LP2 target on the leading-zero share of adjacent repeats in **3/3** registers. Value-mod8 is closer on total adjacent-repeat count in **3/3**. Lag-five is split: physical column is closer only for Emerson.

The simple source-visible rival therefore confirms that the zeroF effect is not uniquely diagnostic of `byte mod8`. It leaves the nonzero eight-way selector underselected.

## Frozen comparison

Everything except the nonzero exception index is unchanged:

- predecessor-cell timing `(i-1) mod256`;
- phase-zero global clock;
- leading-zero cells map to F/GP0;
- nonzero exception register `[F,TH,EO,NG,OE,AE,IA,EA]`;
- same reversible swap with previous ciphertext;
- same 48 matched-layout native-GP controls per Shakespeare, Gibran and Emerson.

The two nonzero selectors are:

- value-mod8: `special[base60_byte & 7]`;
- physical column: `special[table_cell_index & 7]`.

No other selector, phase, direction, alphabet or score was varied.

## Prospective controls

Untouched LP2 target:

- adjacent repeats: 86;
- within-word lag-five equalities: 104;
- leading-zero share of adjacent repeats: 33/86 = 0.3837209302.

Control means:

| register | selector | adjacent | lag5 | low60 repeat share |
| --- | --- | ---: | ---: | ---: |
| Shakespeare | value mod8 | 139.729167 | 117.937500 | 0.396798 |
| Shakespeare | physical column | 140.833333 | 117.958333 | 0.393535 |
| Gibran | value mod8 | 168.604167 | 117.583333 | 0.413053 |
| Gibran | physical column | 169.645833 | 117.937500 | 0.410288 |
| Emerson | value mod8 | 164.541667 | 129.604167 | 0.416717 |
| Emerson | physical column | 165.687500 | 129.062500 | 0.413606 |

Relative to the untouched target:

- physical column is closer on low60 repeat share in 3/3;
- value mod8 is closer on adjacent-repeat count in 3/3;
- lag5 favors value mod8 for Shakespeare and Gibran, physical column for Emerson.

The differences are small compared with the transform's overall displacement from native controls.

## Original inverse

Both rules are exact involutions and re-encrypt the untouched original exactly.

Value-mod8 inverse:

- changed positions: 549;
- adjacent repeats: 478;
- low60 repeat share: 114/478 = 0.238493724;
- lag5: 99.

Physical-column inverse:

- changed positions: 546;
- adjacent repeats: 462;
- low60 repeat share: 113/462 = 0.244588745;
- lag5: 96.

These inverse summaries are consequences, not selector evidence.

## Source interpretation

The column rule has a direct human-visible motivation that value-mod8 lacks: the original table is literally eight columns wide, and #1555 already established that the exception register has exactly eight source-derived symbols. It also avoids the unresolved base60 versus drop-f-base59 radix fork.

Its failure to outperform value-mod8 consistently means source simplicity alone does not identify the historical rule. More importantly, two materially different selectors produce similar structural normalization. The frozen zeroF evidence therefore cannot be used to infer the exact nonzero selector from the normalization itself.

## Reproduction

`sims/lp2_zeroF_value_mod8_vs_column_sft.cjs` derives the source register, reuses the exact deterministic native-GP control sample, guards the previously published value-mod8 statistics, compares the single column rival, and verifies exact original roundtrips.

Shared CI PASS: https://github.com/FlareZ123/liber-primus/actions/runs/44396002989

## Consequence

Keep the eight-symbol register as source-motivated. Treat the nonzero selector as unresolved. Do not choose between value-mod8 and physical-column indexing from the current structural effect, and do not expand to a larger selector menu without a new source clue.
