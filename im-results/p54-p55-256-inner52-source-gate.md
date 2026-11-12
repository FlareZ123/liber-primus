# Physical pp54–55: a complete 256+52 original-source chapter alignment

**Decision, 12 November 2026 (Agent 8, Director #614):** A new exact page/line boundary alignment permits one fully specified 308-rune original-chapter inverse with the printed 32×8 table, but the cheapest complete source-shaped additive operation produces no recognizable GP-native plaintext. The 52-rune suffix also fails a complete held-out solved-p57 phrase by **51 of 52 glyphs**. This excludes the specified operation only. No authentic key, hidden-service endpoint, instruction, or unknown plaintext was recovered.

## Why a contemporary player might test this

The original table on physical pp49–51 has **32 rows × 8 columns = 256 printed two-symbol numerals**. The complete final unknown visual chapter is **p54=232 runes** plus **p55=76 runes**, and the original p55 image prints four rune lines of lengths **24 / 22 / 22 / 8**. Therefore the 256th symbol since the p54 chapter opening falls **exactly at the end of p55's first visible line**:

```text
original p54          232 runes
original p55 line 1    24 runes
                     ---------
whole first block     256 runes = 32×8 printed numeric grid

p55 lines 2–4         52 runes = innermost 32×8 ring
whole p54–55 chapter  308 runes = 256+52
```

The four one-cell concentric shells of the printed grid have lengths **76 / 68 / 60 / 52**. Solved p57 says to shed circumferences; independently, its final **52 runes** from **SHED** onward exactly occupy the smallest ring length. An earlier investigation mapped **p55+p56+p57 =76+85+95=256**, with p55 matching the outer ring and solved p56/p57 the 180 interior cells. The new p54-to-p55-line-one alignment is a distinct possible framing and is not an alternative transcription.

**Objections:** the 256 cut lies **inside** a p55 word wrapped across printed lines (the original seventh complete word occupies offsets23–35). No authenticated source selects p54 as the first register position, requires the table to recur for 52 more cells, or equates the last 52 p55 glyphs with the final 52 solved p57 runes. A visually appealing boundary match is not a cipher. The conditional base60 interpretation remains a hypothesis, not original plaintext or a guaranteed key.

## One concrete complete inverse, frozen before evaluating original output

Keep the original 308 rune indices in printed physical order, including the first p55 rune `NG` carried from p54. Define **K[0..255]** as all 256 printed numeric-table bytes in original row-major reading, each reduced modulo29. Define **K[256..307]** as the 52 innermost ring bytes, clockwise from its original top-left cell **(row3,col3)**, with the same modulo29 reduction. The first source-visible p54 rune is the key-clock origin. Use the already authentic Cicada arithmetic direction `P_i=(C_i-K_i) mod29`; its exact inverse is `C_i=(P_i+K_i) mod29`. There is no chosen offset, keyword, reshuffling, word-dependent phase, or probability-fitted mapping.

The single runnable test `sims/p54_p55_256_inner52_sft.cjs` asserts **232 / 24 / 52 / 256 / 308** against original input, checks every original rune round trips, plants a complete 308-rune native-GP source and recovers it **308/308**, and deliberately changes the key order to ensure the control fails. It prints the full decoded-p55 substrings, IoCs and known-52 comparison; it does not write files or use network services.

| Original-source outcome | Exact readout |
| --- | --- |
| Full 308-rune ciphertext GP29 IoC | **0.03382123** |
| 308-rune directly decoded GP29 IoC | **0.03335589** |
| p55 76-rune directly decoded IoC | **0.03333333** |
| Last 52 directly decoded GP29 IoC | **0.03393665** |
| Solved p57 final 52 native-GP IoC | **0.06636501** |
| Original solved-p57 final52 matched in decoded p55 suffix | **1/52** |
| Complete inverse and planted prose recovery | **308/308**, passed |

The first 80 decoded runes begin `ALEAJBYRUXIEODGYIASXBNBGIYWOEPJNLCFERNGTXOEI...`; the p55 first24 begins `THDYCUEORSLMEAAURUJUJMWAFEA`; the last52 are printed in full by the SFT. These do not yield coherent original-script prose. The p57 comparison is explicitly **conditional** on a suspected reuse, not proof that p55 should read the p57 passage.

## Research choice

This new 256+52 page/line/table match can be used as a future **predeclared original register boundary** if an independently authenticated document or unmistakable artwork selects a real operator. The direct row-major+inner-ring additive inverse is now negative; reversing the clock, fitting a new phase, inventing S-boxes or padding the 52 cells would evade rather than resolve its failed premise.

**For Director #614:** no source presently identifies an unambiguous complete, rune-changing operation that converts this geometry into plaintext. Do not present this count correspondence as a solved chapter. A meaningful successor would require an original clue fixing both the table readout and how the resulting register acts on the entire 308-rune source, followed by a held-out p54/p55 original decryption and exact re-encryption.
