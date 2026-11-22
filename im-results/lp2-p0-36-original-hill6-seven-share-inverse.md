# P0 eight-word corridor: source-fixed Hill6 and seven-share GF29 receivers

**Agent44, 22 November 2026. Classification: original-source registered inverse negatives. No unknown-page plaintext, authenticated key or complete LP2 cipher has been recovered.**

## The original-data decision

A separately discovered historical address candidate (Agent12, [2014 HTML corridor](lp2-2014-html133331-p0-36word-corridor.md)) sends the literal May 2014 title **133** and HTML id **331** through the printed 256-cell base60 table to original physical p0 rune offsets **141** and **177**. This yields one complete eight-word ciphertext corridor of **36 runes**, original word lengths **4,6,3,4,8,7,3,1**. The source table's only two literal zeros sit at cells192 and229; exactly **36 bytes**, cells193–228, lie strictly between them. This motivates a 6×6 matrix candidate. Independently, the original table divided over GF29 by the already known 2013 signed BASE29 factor H and p39 red-word factor G has a formal **252-digit quotient = seven 36-digit rows**, motivating a seven-share candidate.

**Key premise still unauthenticated:** no creator instruction says that these numeric addresses identify p0 plaintext, that the zero bracket forms a Hill matrix, or that the seven quotient rows are secret shares. The tests below are deliberately frozen literal readers with no fitted text or phases.

The complete original p0 ciphertext in the selected interval, rendered as GP transliterations while retaining exact original word boundaries, is:

```
MTNE EAJNLGB XGTH YIDA NGGMJROLEO YTPITHDJ OEHL EA
```

## Exact operations and original results

**Hill6:** read the original 36 zero-interior bytes row-major into a 6×6 GF29 matrix, reduce each byte modulo29, and take each successive six-runic ciphertext block as a column vector. The matrix is invertible, so both direct and inverse orientations are exact. The 36-symbol original outputs below preserve the eight original printed-word lengths:

| Source key orientation | Applied matrix | IoC | Original output |
| --- | --- | ---: | --- |
| Rows | Inverse | 0.02222222 | `DYFY GNNGCEAIA XWH IAEIAB RXOITHOEOR UCEHTHEN JTNG C` |
| Rows | Direct | 0.06825397 | `FEOFY FIABWMN YNNG YNGOO TBSFEGMB EOGUNMFF BFL Y` |
| Columns | Inverse | 0.02857143 | `IYYEA AEGEONGOEH MAEN HNIJ TBPOAETFE TIALCPBM LYTH M` |
| Columns | Direct | 0.03015873 | `MEOPD EALEAUCD MHF ECOG IYFSIAEOHX BIAGAEAETHG AEAG D` |

One short-window IoC (rows/direct) is relatively high from repeated rune fragments, but the complete output still has no coherent original GP-English words. The authentic 36-symbol p57 clear control, deliberately encrypted with the same matrix and inverted, returns **36/36** exactly. All original transformations round-trip exactly.

**Seven GF29 shares:** the high-coefficient-first divisor `H×G = [12,17,11,21,23]` produces an exact GF29 remainder **[0,0,0,0]** on the canonical 256-byte source table. Preserve the formal leading zero of its 252-digit quotient and divide it into seven consecutive 36-symbol rows. Treat the rows as evaluations at fixed x=1 through x=7 of an unknown degree-at-most-six polynomial for each column, and Lagrange-evaluate at x=0. The recovered 36-element pad is then added to or subtracted from the exact 36-rune original p0 corridor without shifting, restarting or selecting characters.

| Source-fixed additive sign | IoC | Original output |
| --- | ---: | --- |
| − | 0.03174603 | `OEMHT PNEOBIR IAIR GTOEAE OLOEOEEOYTHTH OEMGXYJS PEU B` |
| + | 0.03809524 | `TPIL XPGDTHU UTHF BRAD INGTFAENNOE UPLGWGW THIAI I` |

The seven fixed interpolation coefficients are **[7,8,6,23,21,22,1]** modulo29. A withheld 36-rune actual clear p57 plant is recovered **36/36**, and the actual 36-rune ciphertext is exactly reproduced after reversing each tested operation. No unknown plaintext emerges.

## Decision

These two operations are **not viable direct decoders** for the historical-addressed 36-rune p0 corridor. Their arithmetic source matches and positive-control invertibility are exact, while their full original outputs are not intelligible native GP prose. This excludes only the stated single-block Hill6 and seven-share x=1..7 direct-key consumers; it does not exclude nonlinear key expansion, different source-selected operands, other locations or a future first-party deciphering instruction. Avoid optimizing matrix dimension, interpolation points, phase or output window to manufacture a match.

[Self-contained Windows Node22 source SFT](../sims/lp2_p0_36_hill6_shamir7_sft.cjs) · [verified GitHub Actions run44973038350](https://github.com/FlareZ123/liber-primus/actions/runs/44973038350). The SFT uses unchanged original transcripts and bytes, checks both source selectors, and asserts exact inverses and genuine p57 positive controls.
