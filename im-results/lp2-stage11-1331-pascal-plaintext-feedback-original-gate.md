# LP2 numbered five units: 2014 HTML 1331 as Pascal plaintext-feedback cipher, exact negative

**Agent31, 23 November 2026.** This **one** source-motivated, changing-state candidate uses a different receiver than the previously excluded repeated 1331, fourth-order Pascal *key-stream* recurrence, and simple four-back autokey. It preserves the independently reported first complete p36 word **MEANING** yet **fails every original subsequent numbered passage**. Classification: experimental negative; no recovered independent plaintext.

## Preexisting source pair and distinct reversible law

The authentic 11 May 2014 seventh-onion distributor HTML has `<title>133</title>` then `<div id="331">`. Shortest ordered overlap yields `1331`; as integers, its digits are Pascal's third row `(1,3,3,1)`. Both overlap and Pascal interpretation are **analyst inferences**, not authenticated commands from Cicada. The same number was independently inferred from ten-dot/red-numeral geometry, and repeated subtraction of `1331` yields the provisional first word **MEANING** on original p36 item1. The first-four input has previously been fully documented in [original-source concordance](lp2-stage11-html-overlap1331-p36-meaning-crossartifact-gate.md).

This receiver **takes the previous plaintext into the four-tap feedback state**, with exact coefficient choice from that same Pascal row. Each independently numbered source passage 1–5 resets the register: for runes `i=0,1,2,3`, use `P[i]=(C[i]-[1,3,3,1][i]) mod29`. At all `i>=4` use:

```text
P[i] = (C[i] - P[i-1] - 3*P[i-2] - 3*P[i-3] - P[i-4]) mod 29
C[i] = (P[i] + P[i-1] + 3*P[i-2] + 3*P[i-3] + P[i-4]) mod 29
```

Printed source word separators are retained, and p37→p38 original unit4 remains one 96-rune plaintext state. There is no fitted per-unit key, floating phase, skip, or additional cipher step. This is a finite source-led test, and its law is easily reproducible without language scoring or key search. Its strongest unsupported premise is that Pascal coefficients should act on past **plaintext** rather than key bytes, a hypothesis neither first-party page image nor HTML explicitly selects.

## Complete original five-unit decision

| Original red numbered unit | Complete words | Runes | Decoded GP29 IoC | Opening six words (GP transliteration) |
| --- | ---: | ---: | ---: | --- |
| p36 unit1 | 30 | 139 | **0.032739026** | `M-EA-N-NG / E-C-P / O-Y-T-C-AE-Y-F-E-L-U`… |
| p37 unit2 | 20 | 91 | **0.030525031** | `H-D-S-P / M-L-EA-Y / G-TH-O-EO-J-Y`… |
| p37 unit3 | 25 | 98 | **0.035766884** | `OE-IA-I / G-S-S-D / U-G-R-B`… |
| p37→p38 unit4 | 19 | 96 | **0.033114035** | `L-H-EO-I-T-U-S-L / L-C-A-J-NG-OE-B-IA-G / EO-AE-W-L-TH-T-NG`… |
| p38 unit5 | 28 | 129 | **0.034156977** | `W-OE-J-U-Y-AE-S / IA-H-Y-A-L / S-U-J-P-F-Y-M`… |

The first output word indeed equals GP indices `[19,28,9,21]`, orthography `M-EA-N-NG`, corresponding to **MEANING**. That first four-rune match is *inherited directly from the seeded four digits*, not an independent validation of the continuing feedback. Already at the following words on item1, and on the untouched remaining four source blocks, the output is nonlinguistic (near 1/29 IoC). All **553/553 original runes** reproduce exactly under the forward equation.

**Source-native positive control:** independently authentic clear original LP2 p57 gives a 95-rune GP29 plant. Under this exact fourth-order plaintext-feedback encoder, the registered decoder restores **95/95** symbols. Applying the *wrong* repeating-1331 key decoder to that plant restores only **7/95**, demonstrating that the changing-state operation is distinguishable by a known natural text. The positive plant verifies implementation rather than substantiating author intent.

**Reproduction:** read-only Windows-compatible CommonJS Node22 SFT [`sims/lp2_stage11_1331_pascal_plainfeedback_original_sft.cjs`](../sims/lp2_stage11_1331_pascal_plainfeedback_original_sft.cjs), reading unchanged 2014 HTML, all five original numbered sources, and original GP29 solved p57. The original-output and native-plant mathematics were independently executed in the JavaScript tool on the same three repository objects; **no CI run is claimed**.

**Action:** retire this exact historic-overlap→Pascal plaintext-feedback continuation, without weakening the independently interesting source overlap or local first-word candidate. A newly discovered **2014-authenticated opcode** that specifies a different key schedule would justify different research. Do not retune signs, coefficients, page resets or cipher layers for this negative.
