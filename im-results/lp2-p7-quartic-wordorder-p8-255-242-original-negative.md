# P7 quartic as an order-sensitive complete-word key for original p8: finite negative gate

**Agent16; 22 November 2026. Director [#2304](https://github.com/FlareZ123/liber-primus/issues/2304).** This report tests a new finite source-typed receiver on **all original p8 ciphertext**, preserving the actual p3–p7 word order. **No unknown LP2 plaintext, authentic key, author-selected operator or destination was recovered.** All original unknown LP2 pages remain unsolved. The test excludes only the explicitly frozen operations below.

## Original source clue, intended route, competing explanation

The original p3–p7 five-page scroll contains exactly **255 complete printed words**, of which **13** are entirely red and **242** entirely black. The adjacent p8 contains **255 original GP29 runes**, including a red 12-rune heading; the following first **242** black runes form a second source-typed candidate recipient, excluding the final rune of a genuine p8→p9 continuation word. The equality of stream lengths makes a human-motivated one-word→one-rune key register possible; it does **not** prove that such a register was intended.

The final p7 five red words have native GP0 products **11,26,8,15,2**. Read as ascending GF29 coefficients they give the source-fixed polynomial

`P(x)=11+26x+8x²+15x³+2x⁴ (mod29)`,

whose exact roots of `P(x)-x` over GF29 are **3 and 4**, matching the next red heading's two whole-word products. `P′(4)=17` matches its final red rune. Those relationships independently motivate this experiment but do not select a cipher. See [source arithmetic](lp2-p7-p8-original-red-polynomial-fixedpoint.md).

The crucial rival is that printed word/rune count equality and the p7→p8 arithmetic are unrelated to ciphertext generation. Both may simply be intriguing retrospective coincidences. Prior all-abelian and GF4/radix59 register fits are documented elsewhere; **this experiment uses neither**.

## Frozen complete original-cipher gate

Before observing any original output, [Issue comment 7082976088](https://github.com/FlareZ123/liber-primus/issues/2304#issuecomment-7082976088) fixed these operations:

- Parse the **original** complete p3–p7 rune words with real hyphen/full-stop boundaries and cross-page word continuation. Use either all **255** printed words to generate one key symbol for each of p8's **255** original runes, or its **242** exclusively black words to generate one key symbol for the first **242** original p8 black runes after the 12 red heading symbols.
- At every input word boundary reset `s` to one source-typed native GP29 seed from **{0,3,4,17,19}**, respectively field zero, adjacent red title fixed roots, final title rune, or literal Roman XIX.
- Consume each rune's actual GP0 index `r` from first to last under one of four **order-sensitive** recurrences: `s=P(s)+r`, `s=P(s)-r`, `s=P(s+r)`, `s=P(s-r)`, all modulo29. Emit the **terminal state** as that word's one-rune key; no user-selected rune offsets, secret codebooks, period, reordering, GF4 correction, or fitted output map.
- Decrypt the actual p8 recipient with both `plain=C-key` and `plain=C+key` (mod29), exactly **4 × 5 × 2 × 2 = 80** frozen cases. Demand long actual source-native text or an independently usable key, with exact ciphertext replay and solved-control plants.

[Executable standalone Windows/Node22 CJS test](../sims/lp2_p7_poly_wordorder_p8_original_sft.cjs) reconstructs the input from `resources/liber-primus/lp2-transcription.txt`, `lp2-corpus.json` and physically derived red-span annotations; it asserts the whole-page source alignment, 255 and 242 counts and all 13 red word IDs. The code never uses previously fitted GF4 taps or any p50 table values.

## Results on the unchanged original recipient

| Recipient | Models | Original recipient GP IoC | Decoded GP IoC range | Highest decoded GP IoC |
| --- | ---: | ---: | ---: | ---: |
| Full p8, 255 runes | 40 | 0.0342751274 | 0.0322989038–0.0371159487 | 0.0371159487, `P(s-r)`, seed4, plus |
| P8 first 242 black runes | 40 | 0.0341209149 | 0.0327492198–0.0371386441 | 0.0371386441, `P(s+r)`, seed3, minus |

All **80** source-native outputs stay below **0.038 GP index of coincidence**, and their rune prefixes are nonprose. For context, the corpus's actual solved p57 95-rune cleartext has IoC **0.0627099664**; the existing manuscript-wide genuine native-GP 229-rune control study places the **minimum** of 3,517 original plaintext windows above **0.049529** (different sample lengths; compare conservatively). This contrast rejects these *direct* consumers as an explanation of ordinary source-language plaintext.

Every attempted original-cipher decoder exactly reencrypts its output to the original cipher tape, as required by the reversible additive arithmetic, and a genuine solved-p57 runic positive control is repeatedly planted, encrypted and exactly recovered under each key model. These positives establish implementation correctness, **not historical key identification**. The largest direct terminal-state exact match is just **16/255** (full) or **13/242** (black) among the frozen seeds/rules, and the `P(s±r)` terminal register is mathematically unable to reproduce the full p8 alphabet directly because `P` has only **19** possible GF29 output values whereas p8 uses **all29**.

## Decision

**Retire only these 80 fixed native order-sensitive quartic terminal-state word-key decoders for full/black p8.** Moving to arbitrary readouts, offsets, per-page fitted states or secretly labeled output alphabets would discard the source-selected gate. An alternative route requires original artwork/text to select the missing operation, a receiver distinct from these two word→rune tapes, or independent actual plaintext. The source polynomial's fixed points, seven-cycle and possible GF(29²) clock remain separate upstream hypotheses, **not a claimed decipherment**.

**Reproduction:** `node sims/lp2_p7_poly_wordorder_p8_original_sft.cjs`; [successful Windows Node22 run 45050695384](https://github.com/FlareZ123/liber-primus/actions/runs/45050695384) executed it using the existing read-only `.github/workflows/manual-readonly-commonjs-sft.yml` dispatcher.
