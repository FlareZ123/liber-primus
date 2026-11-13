# Physical pp54–55: competing original 256+52 linewise and 9+256+43 wordwise alignments

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

The [successful original-input Windows CI run 43268495670](https://github.com/FlareZ123/liber-primus/actions/runs/43268495670) executed the unchanged committed script with Node.js 22 and all assertions passed. The single runnable test `sims/p54_p55_256_inner52_sft.cjs` asserts **232 / 24 / 52 / 256 / 308** against original input, checks every original rune round trips, plants a complete 308-rune native-GP source and recovers it **308/308**, and deliberately changes the key order to ensure the control fails. It prints the full decoded-p55 substrings, IoCs and known-52 comparison; it does not write files or use network services.

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

## Distinct word-exterior partition: 9 + 256 + 43, and a frozen p50 overlay (13 November 2026)

A separately selected *original wordwise* partition of the **same 308-rune physical pp54–55 chapter** now gives a different exactly 256-unit register. Under the original source red annotation, p54 begins with **9 red header runes** and has **223 following black runes**. The preceding [source-adjudicated p55 word register](p55-original-33-exterior-43-interior-source-framing.md) has **33 exterior (first/last) runes**, including the single rune completing a p54-carried word, and **43 strict word-interior runes**. Consequently

```text
p54 opening red title                              9
p54 remaining black body                          223
p55 complete-word first/last + carried exterior   33
p55 complete-word strict interiors                43
                                                    ---
                                                   308
p54 black + p55 exteriors = 223 + 33 = 256
```

This is **9 + 256 + 43** with no missing or synthesized source runes. The independent **256** printed cells of the p50 numeric grid can now pair one-to-one with the *entire p54-black plus p55-word-exterior register*, and the independent **43** p55 interiors remain separate. The p57 solved reference says to shed circumferences, so a human could tentatively remove first/last runes of p55's complete words. The 2016 signed message contains 43 alphabetic words, and the historically required 2014 three magic squares contain 43 interior cells. These are plausible selector cues, none of which explicitly says to apply word-exterior deletion on p54 or combine its body with p55 boundary runes.

This **competes with** the preceding 256+52 *linewise* cut. The linewise cut includes p54's red title and crosses a p55 word at position256, whereas this 9+256+43 read sets the title aside and deinterleaves 33 p55 word-exterior runes before pairing with the table. The two registers are different and should not be conflated as one confirmed key.

**Finite original-cipher overlay:** keep the 256 exterior GP29 rune identities, and pair positionwise in source order with all 256 original p50 table bytes in printed row-major order. With each byte reduced mod29, the directly identical GP index matches are **10/256**, and exact byte-to-GP-prime matches are **1/256**. An independent **2,000 fixed-inventory shuffle** of the 256 exterior runes yields 10 or more matches with add-one upper-tail **p=0.4242878561**; original row order is unexceptional. The authenticated p56 additive GP29 inverse, `P[i]=(C[i]−grid[i]%29) mod29`, gives **IoC=0.0336703431**, while its opposite sign gives **0.0343443627**, both nonlinguistic. Bytewise XOR of the grid with the rune-index byte values produces **103/256 printable ASCII** (coincidentally equal to the unmodified grid), and XOR with GP prime-byte values gives **88/256**; neither gives plaintext/file magic. Both sign models re-encrypt all 256 original rune values and recover source-native GP plants.

**Decision:** the original 9+256+43 partition is a new possible geometry-driven bridge between the p50 table and p55 interiors, with a more natural word-boundary treatment than the 256+52 line cut. Its direct row-major identity, additive and XOR interpretations fail. A future original *source-selected* operation on the 256 paired symbols, and an explicit role for the 43 retained inner runes, remain missing. Neither numerical alignment may be promoted to an authenticated decoder.

[Exact fully executed SFT](../sims/lp2_p54_p55_9_256_43_word_exterior_sft.cjs), preserving the original 43 interior positions and all physical page runes.

## Research choice

The 256+52 page/line/table match and the separately reconstructed 9+256+43 title/word/table match can each be used as **predeclared, alternative original register boundaries** if an independently authenticated document or unmistakable artwork selects a real operator. The direct row-major+inner-ring additive inverse is now negative; reversing the clock, fitting a new phase, inventing S-boxes or padding the 52 cells would evade rather than resolve its failed premise.

**For Director #614:** no source presently identifies an unambiguous complete, rune-changing operation that converts this geometry into plaintext. Do not present this count correspondence as a solved chapter. A meaningful successor would require an original clue fixing both the table readout and how the resulting register acts on the entire 308-rune source, followed by a held-out p54/p55 original decryption and exact re-encryption.
