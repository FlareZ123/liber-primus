# P15 original-global spiral address readout: full-source decision

**Agent18 / Director issue [#2274](https://github.com/FlareZ123/liber-primus/issues/2274), 22 November 2026.** The opening three black cells of the authentic physical p15 numerical spiral read `WAY` as **zero-based global GP29 rune addresses**. Extending that *same frozen addressing rule* through every printed cell produces no complete plaintext, source-authored key, or endpoint. A directly motivated GP29 Vigenère-key consumer on the neighboring original ciphertext also fails. The three-letter coincidence remains an observation, not a reason to terminate the spiral or to identify a historical decoder.

## Original object and prospective rule

- The original physical LP2 p15 is 2014 scan `resources/liber-primus/32.jpg`; its printed 4×4 matrix, in rows, is:
  ```
  3258  3222  3152  3038
  3278  3299  3298  2838
  3288  3294  3296  2472
  4516  1206   708  1820
  ```
- The red numeral **3299** is the spiral center. Following the black cells outwards in the source-visible spiral gives the **full** sixteen-position sequence `3299,3298,3296,3294,3288,3278,3258,3222,3152,3038,2838,2472,1820,708,1206,4516`. The already-established closed form is `|3301 - prime(F+1)|` for the distinct Fibonacci indices `F=0,1,2,3,5,8,13,21,34,55,89,144,233,377,610,987` ([established original object](../results/lp2-p15-fibonacci-prime-spiral.md)). This formula reconstructs the **numbers**, without independently specifying how to consume them.
- Prospective rule tested here: count the unknown LP2 physical pages p0–p55 as one GP29 rune tape, omitting printed punctuation and non-runes; use each numeral as a literal **zero-based** rune position. This assumption was chosen because it produces the advertised `WAY`, and is therefore *not independently proven creator intent*. The original corpus has 12,956 runes in this region; all sixteen indices fall within it.

## Exact entire original-ciphertext readout

| Spiral cell | Printed value | Physical page | Zero-based page-rune index | GP transliteration |
| ---: | ---: | ---: | ---: | --- |
| Red center | 3299 | p13 | 105 | OE |
| 1 | 3298 | p13 | 104 | W |
| 2 | 3296 | p13 | 102 | A |
| 3 | 3294 | p13 | 100 | Y |
| 4 | 3288 | p13 | 94 | L |
| 5 | 3278 | p13 | 84 | U |
| 6 | 3258 | p13 | 64 | M |
| 7 | 3222 | p13 | 28 | U |
| 8 | 3152 | p12 | 219 | L |
| 9 | 3038 | p12 | 105 | H |
| 10 | 2838 | p11 | 178 | T |
| 11 | 2472 | p10 | 75 | G |
| 12 | 1820 | p7 | 154 | AE |
| 13 | 708 | p2 | 180 | B |
| 14 | 1206 | p4 | 260 | U |
| 15 | 4516 | p18 | 214 | M |

The **full 16-cell** read is `OE W A Y L U M U L H T G AE B U M`. Omitting the visibly red origin gives **15 black runes**: `W A Y L U M U L H T G AE B U M`. Thus `WAY` appears only if reading starts after red3299 and stops *after exactly three black cells*. No printed stop, field length, key boundary, target, or checksum at that point was located. The next twelve runes are `L U M U L H T G AE B U M`.

The three `WAY` runes are visually on the **same physical p13 text line**, taken **backwards in steps of two**: p13 local offsets104 W,102 A,100 Y. W belongs to the next printed word; A and Y lie in an earlier four-rune word. The source therefore does not print a contiguous `WAY` word there. With one-based global indexing, the same three black values return `G IA X` rather than `WAY`. The author-signed January 2016 phrase “Liber Primus is the way” provides a possible retrospective semantic association but **does not instruct a player to use global zero-based rune numbers, stop after three cells, or take a hidden key**; it also postdates the LP2 release.

## Direct, bounded value-changing inverse

A fully specified key-extraction possibility uses **all 15 black spiral outputs as one 15-GP-rune key**, rather than discarding twelve inconvenient addresses. Its one-rune longer rival includes the red center as a 16-GP-rune key. Because earlier authenticated Liber Primus material uses GP29 Vigenère, apply the standard `P[i]=(C[i]±K[i mod keyLength]) mod29` under each sign to the adjacent original p15 body and p16–p21 source. The two F-transparent scoring variants are preserved for comparison, but they require the original ciphertext F-mask to invert when ambiguous, so they are **not demonstrated standalone cipher inverses**.

Original source, test target, full code, re-encryption invariant and planted ambiguity details are in [the committed SFT](../sims/lp2_p15_global_spiral_way_source_sft.cjs); successful Windows Node22 run [45035165228](https://github.com/FlareZ123/liber-primus/actions/runs/45035165228).

| Exact unmodified target | Runes | GP29 IoC range for 15-rune source key | GP29 IoC range for 16-rune source key |
| --- | ---: | ---: | ---: |
| p15 body after initial nine header runes | 150 | 0.03490–0.04072 | 0.03409–0.04143 |
| p16–p21 (holdout-adjacent corpus) | 1,613 | 0.03485–0.03595 | 0.03434–0.03585 |
| p15–p21 combined | 1,772 | 0.03446–0.03636 | 0.03453–0.03605 |

The p16–p21 results remain near the GP29 random baseline `1/29≈0.03448`, with no sustained readable native prose. These values cover two signs × ordinary/F-transparent clock for each frozen source key and are exact original-input tests, not random-key optimization. The only fully self-inverting variants without side information here use ordinary Vigenère. Using `WAY` as a three-rune repeating key on the **remaining twelve** black extracted runes yields `P G OE D AE J N J EA I G OE` or `IA AE T H S C D U OE A AE T`, neither a plaintext command.

## Decision

The exact **numeric Fibonacci-prime spiral** remains authenticated. Global-zero-based addressing explains the first three `WAY` letters and creates a 15- or 16-rune original-data register, but supplies no author-authenticated rule for what the complete register means. The simple historically recognizable cipher consumer directly tested here does not decrypt the neighboring text. **Retire the three-cell “stop at WAY” as a key selector and the 15-/16-key Vigenère consumers.** Reopen this route only if independent original source material supplies a stopping/recipient instruction or a typed use for all fifteen black positions.

This is intentionally distinct from the prior p15 Fibonacci-number key-schedule, nonlinear state machine, and Zeckendorf-code experiments ([#2252](https://github.com/FlareZ123/liber-primus/issues/2252), [#2225](https://github.com/FlareZ123/liber-primus/issues/2225), [#1469](https://github.com/FlareZ123/liber-primus/issues/1469)). **No previously unsolved LP2 plaintext has been recovered.**
