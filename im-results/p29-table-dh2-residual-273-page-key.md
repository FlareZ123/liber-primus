# Original p29/table polynomial residual as a 273-rune direct page key

**Decision: bounded direct-key negative.** No unknown Liber Primus plaintext, authentic cipher, or continuation is recovered. This closes one literal consumption of an independently defined residual, without inventing start phases or fitted substitutions.

## Source inputs and selected finite test

[Previously established original-source algebra](p29-signed2013-dh2-gadic-congruence.md) gives the exact GF29 identity **P = S + 2G + G²R**, using original physical p29 as the 277-rune descending-coefficient polynomial P, the printed 256-byte p50 table S, G=[15,5,27] from the p39 red triad, and signed 2013 DH worked-example shared value 2. Align polynomial constant terms and divide P−S−2G by G²=[22,5,23,9,4]. This gives **R of exactly 273 GP29 digits**, with zero remainder. These polynomial facts were established before this test.

The canonical original corpus has **six complete 273-rune pages: pp11,17,21,25,41,44**. As a frozen, low-cost hypothesis, take R in its unique printed polynomial order as an additive GP29 key on each independent page, preserving the page-local rune order: decode C−R and C+R mod29. All **12** original readouts are tested; no alphabet remapping, secret seed, phase, span trimming or score optimization is introduced. The signed sources give no instruction to treat R as a pad or select one of the six targets. Length correspondence by itself is insufficient evidence.

## Original results

| Physical page | Raw IoC | C−R IoC | C+R IoC | Exact C/R symbol matches |
| ---: | ---: | ---: | ---: | ---: |
| 11 | 0.03504094 | 0.03388278 | 0.03358651 | 12 |
| 17 | 0.03382892 | 0.03444839 | 0.03377505 | 7 |
| 21 | 0.03434066 | 0.03552575 | 0.03412519 | 11 |
| 25 | 0.03326331 | 0.03380198 | 0.03393665 | 13 |
| 41 | 0.03312864 | 0.03337104 | 0.03380198 | 7 |
| 44 | 0.03452920 | 0.03547188 | 0.03461000 | 10 |

R has IoC **0.0338019823**. The largest decoded IoC is **0.0355257488**, near the uniform 29-symbol baseline (1/29≈0.0344827586). None of the twelve original output prefixes is coherent native GP plaintext. Each output exactly re-encodes to the original 273 digits. An independent 273-GP-rune native-source plant formed from the already-solved p57 is also exactly recovered, confirming that this codec would recover genuine plaintext when used on such a message.

**Next choice:** Retire the exact R-as-direct-additive-273-key route. Keep the established p29/table/DH relation, which might require another register or original instruction. Do not expand phases or arbitrary operators based on these negative outputs.

[Self-contained CommonJS reproducer](../sims/p29_table_dh2_residual_273_page_key_sft.cjs). It verifies the exact original polynomial division, all target page lengths, inverse roundtrips, source-native plant, and the original result inventory.
