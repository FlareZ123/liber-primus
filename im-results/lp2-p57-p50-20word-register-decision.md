# P57 twenty-word walk: original p50 word-number direction is not a decoder

**Agent8, 21 November 2026. Director task #2113. Classification: source-locked finite inverse rejection with two source arithmetic coincidences. No unknown-page plaintext, author-selected cipher instruction or key recovered.** [Windows Node22 PASS 44961710651](https://github.com/FlareZ123/liber-primus/actions/runs/44961710651) · [Complete CommonJS original-source SFT](../sims/lp2_p57_p50_word_register_gate_sft.cjs).

## Original clue and precise proposed consumer

The independently solved original p57 `PARABLE` contains **20 printed words**, including its separately printed title. Original p51 begins `WWP` with GP-prime sum **81**. The source-audited original p49–p51 32×8 numerical table, interpreted in base60 as the successor function `T[x]=byte[x]`, has

`T^20(81)=115`,

where 115 begins the independently observed 11-cycle. The authenticated 2016 signed message has an 11-word coda followed by two verification words. These are real source properties, but neither the p57 poem nor that signature explicitly tells a solver to synchronize a table step with a poem word.

To test a *specific executable* use of the 20 words, retain each physical word's printed source ordering and its established **zero-based GP29 sum** `G_i`. The signed message says that words form a map and their numbers give direction. A literal word-number transition would be

`state[i+1] = state[i] ± G_i (mod 256)`.

No unknown LP2 plaintext, dictionary or guessable key enters this necessary-condition test. An authentic fixed-direction step rule must fit all twenty source-prescribed transitions under one sign. For an even more generous falsification, allow either sign at every step.

## Exact original states and decision

The original source successor walk, independently calculated by the SFT, is:

```text
start     81
state  0  81   1  58   2 146   3  92   4 236
       5 238   6 129   7 179   8 175   9  18
      10  15  11 212  12  70  13 169  14 228
      15 144  16 125  17  20  18 102  19  32
      20 115
```

The exact p57 words and sums are:

```text
word         PARABLE LICE THE INSTAR TUNNELNG TO THE SURFACE WE MUST
GP0          120     53   20   78      94     19  20    67    25  51

word         SHED OUR OWN CIRCUMFERENCES FIND THE DIUINITY WITHIN AND EMERGE
GP0          64   8   19       131       42   20     105      38    56    83
```

**Only 2/20** transitions match `±G_i` even if the sign changes at each word. The negative match is word17 `DIUINITY` with GP0=105, since `125-105=20`. The positive match is the final word20 `EMERGE` with GP0=83, since `32+83=115`. Neither fixed all-positive nor fixed all-negative direction can account for the entire 20-word route.

There is a decisive **key-independent repeated-token obstruction**. The printed word `THE` occurs three times with the same source GP0 sum20, while the corresponding original successor edges are:

```text
THE at word 3:  146 -> 92    difference -54 ≡ 202 (mod 256)
THE at word 7:  129 -> 179   difference +50 ≡  50 (mod 256)
THE at word16:  144 -> 125   difference -19 ≡ 237 (mod 256)
```

Thus no fixed function of the printed word alone, even with an unknown constant re-encoding of its GP0 sum, determines the actual step size. Any correct word-level state register must add independently specified **current-state dependence, further context or another operation**. Appending freely chosen offsets or sign switches to rescue the word rule would merely fit observations.

The graph's last state **115** also happens to equal GP-prime sum(`WITHIN`), the eighteenth printed word. The last source edge **+83** equals GP0(`EMERGE`). Both are real numerical equalities, but a word position→state instruction for `WITHIN` or an instruction selecting exactly the last edge is absent. They cannot repair the earlier 18 step failures.

## Controls, scope and next decision

The exact test enumerates **all 256 possible table start states** without choosing a new start by English scoring. Thirty starts, including the original 81, attain at least two word-number step matches when either sign is allowed; 26 starts reach115 at step20. The authentic fixed start81 attains two matches, so the two local coincidences are not strong evidence for an authored twenty-step word-number rule.

An independent planted 256-cell successor map is constructed to obey the original twenty GP0 word steps exactly. Every intermediate state is distinct, and its whole twenty-step run is recovered by the same decoder, demonstrating the test accepts an actual source-number-driven map when one exists. Source parsing checks all **95/95** original solved p57 GP indices, the exact original page51 `WWP` and all printed word lengths. The 256-byte original table is consumed unchanged.

**Decision:** #2113's literal 20-word numeric-direction hypothesis fails as a source-consistent cipher instruction. Preserve the original **20-step 81→115** route and signed **11+2** coda relation as unresolved navigation correspondences. A different register requires a first-party source instruction choosing a state-aware word mapping and an operation that recovers untouched original LP2 runes with exact forward re-encryption. A length coincidence and two last-word numeric echoes do not deliver those missing inputs. No additional period/phase/key scan is warranted from this result.

**Reproduction:** `node sims/lp2_p57_p50_word_register_gate_sft.cjs` on Windows Node22, [successful original repository CI](https://github.com/FlareZ123/liber-primus/actions/runs/44961710651).