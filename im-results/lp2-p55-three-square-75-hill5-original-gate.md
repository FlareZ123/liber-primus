# LP2 p55: 75-rune three-square Hill5 inverse, source-selected keys

**14 November 2026, Agent12. Classification:** complete original-page-body inverse for a constrained, historically motivated cipher candidate, with a full native-GP positive control. **Negative for direct plaintext**; no recovered unknown text, original cipher, true key, or destination.

## Human-observable route and its weakest premise

Before LP2 was published, Cicada's 2014 sixth-onion instruction required participants to submit **three previously revealed number squares**. Their authentic printed shapes, retained as `resources/cicada2014-openpuff-magic-squares.txt`, are **5×5, 7×7, 5×5**. The clear final LP2 Parable says **“SHED OUR OWN CIRCUMFERENCES. FIND THE DIVINITY WITHIN AND EMERGE.”** Shedding only the middle 7×7 border produces **three 5×5 matrices of 25 cells each** in source order.

An additional original-page alignment makes these inputs eligible for a direct test: physical LP2 **p55 has 76 GP29 runes**, and its first glyph **NG** is a **word continuation from p54**. That leaves exactly **75 self-contained p55-body runes** after the carry, enough for three groups of 25. Earlier work on the same square source tested (i) its 17 printed rows as repeated word-key pads across all 76 p55 glyphs, and (ii) the three strict *interiors* (3×3, 5×5, 3×3) against p55's **43 within-word glyphs**. Neither is the **three 5×5 whole-body Hill cipher** below.

The objection is decisive to interpretation: neither the signed 2014 message nor the LP2 pages says to remove only the **middle** circumference, align the source 75 numbers to p55 after one carried rune, or apply Hill decryption. The 75/75 equality and a historical key source motivate **one affordable complete inverse**, not an authenticated decoder.

## Frozen reversible operation

Read exactly the three authentic squares in printed order. Use all 25 entries of square 1; the central 5×5 entries (rows and columns 1..5, zero based) of the 7×7 square 2; and all 25 entries of square 3. Reduce each entry modulo the **original Gematria Primus modulus 29**, yielding `K0,K1,K2`, three 5×5 matrices. All three have full rank **5** over GF29, so each has a unique inverse. No matrix, symbol, phase, alignment, square selection, source digit or plaintext letter is fitted.

Remove p55's opening carried rune (original GP index **21**, NG). The remaining **75 untouched original GP29 ciphertext indices** are divided into three consecutive 25-rune groups, each into five five-rune vectors. Decrypt with `P = K_i⁻¹ C mod29` (column vectors) or `P = C K_i⁻¹ mod29` (row vectors). These are the two conventional Hill choices. Forward replay multiplies by the same source matrices and must reproduce each original vector exactly.

The positive control takes **75 genuine clear GP29 runes from solved physical p57**, encrypts them using the historical three matrices, and requires exact native-rune recovery with each inverse. This proves both inverses work at the exact source block shapes. The test reads only the canonical original corpus and authentic square file.

## Unmodified p55 results

| Exact frozen candidate | Output GP29 IoC across all 75 runes | Forward original replay | Solved-p57 plant recovery |
| --- | ---: | ---: | ---: |
| Unmodified p55 body | **0.03855856** | Source | Source |
| Three Hill5 column-vector inverses | **0.04036036** | **75/75** | **75/75** |
| Three Hill5 row-vector inverses | **0.03819820** | **75/75** | **75/75** |
| Genuine clear p57 first 75 rune control | **0.05945946** | N/A | Source native GP |

**Full column inverse**, GP rune names separated by dots to preserve exact symbol boundaries:

`F.P.E.G.F.AE.Y.N.M.I.TH.L.EA.B.O.E.TH.G.IA.AE.D.F.E.C.A.A.OE.E.NG.NG.A.B.A.E.P.W.TH.OE.B.B.A.A.M.E.M.OE.EO.A.G.P.TH.D.U.B.W.NG.TH.O.R.P.T.L.S.TH.N.J.I.L.J.E.J.A.AE.N.Y`

**Full row inverse:**

`A.A.OE.I.S.EA.EA.N.O.NG.NG.R.T.L.N.IA.M.X.L.IA.OE.N.S.EO.EO.B.I.S.U.OE.T.A.D.H.R.D.P.E.P.O.A.B.T.N.B.IA.N.D.IA.E.P.L.Y.OE.IA.EO.U.A.C.U.H.E.N.EA.EA.C.I.L.I.AE.U.T.S.I.A`

Neither produces coherent source-native prose, recognizable instructions, or an independently selected key. Their almost chance-level rune IoCs are weak evidence of natural language; the positive control's considerably higher IoC is only a diagnostic, **not** a statistical impossibility theorem on arbitrary 75-rune text. Exact source re-encryption is demanded by invertibility and cannot alone authenticate a cipher.

## Independent CI execution

The manual 2014-square workflow now includes this source-75 direct inverse alongside its earlier independent 43-core/17-row tests. [GitHub Actions original-input run 43578451257](https://github.com/FlareZ123/liber-primus/actions/runs/43578451257) completed **successfully** with the new test on Node.js 22, including exact original reencryption and both complete positive recoveries. No CI workflow runs on repository pushes.

## Decision

The historically sourced three-square-to-three-Hill5 mechanism is now **fully specified and executed on the entire original 75-rune p55 body**, including both standard vector conventions and an exact native-GP planted control. It does not recover plaintext. Retire the direct Hill5 candidate without adding fitted rotations, extra shifts, source order permutations, or newly selected alphabets. The possible deeper role of the 2014 number squares remains open only if **an independent source clue** specifies its consumer. All original p55 source runes are untouched.

[Standalone original-input CJS SFT](../sims/lp2_p55_three_square_75_hill5_sft.cjs) · [historical 2014 square bytes](../resources/cicada2014-openpuff-magic-squares.txt) · [canonical runes](../resources/liber-primus/lp2-corpus.json) · [distinct earlier 43-core Hill candidate](lp2-p55-2014-magic-squares-three-core-hill-original-inverse.md) · [17-row complete p55 source pad](lp2-p55-2014-three-square-17row-full76-direct-inverse.md).
