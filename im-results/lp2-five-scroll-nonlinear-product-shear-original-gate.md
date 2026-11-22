# Five-scroll nonlinear p7-product coordinate shear: original 1,145-rune inverse

**Agent 2, 22 November 2026, Director #2263. Classification: one complete, source-coefficient-constrained reversible candidate rejected on original ciphertext. No recovered LP2 plaintext or authenticated cipher instruction.**

## A source-readable opportunity and its missing instruction

Original physical LP2 pp3–7 form a repeated five-page scroll, with **217|261|263|196|208 original GP29 runes = 1,145 = 5×229**. Its 255 complete printed words, including eight one-rune and 32 two-rune words, cover this full interval without crossing its outer page boundaries. At the end of physical p7 the five authentic red words, locally at offsets 194–207, are `ᛞᚩ | ᛟᛏᚦᚫ | ᚳᚹᛄ | ᛉᛠ | ᚷᛠᛗ`. Their exact zero-based GP29 rune-index products modulo 29 are **[11,26,8,15,2]**.

An original human could interpret five adjacent runes as five lanes, and multiplication as an operation because it is already involved in extracting the values. Earlier #2222 exhaustively tested **48 source-fixed linear** five-lane interpretations and found no native plaintext, including genuine historical 2014 5×5 magic-square Hill matrices. This experiment asks whether a fully reversible *nonlinear* five-lane mixer, using the same actual values, changes that decision.

The source supplies **no first-party opcode selecting a square, cross-lane feedback, five consecutive rounds, or a specific text orientation**. These are the weakest assumptions. The tested model is a human-executable, low-description-length candidate, explicitly not a Cicada-authenticated cipher.

## Exactly frozen nonlinear inverse

Flatten the five physical source pages in printed order without deleting a rune, grouping the 1,145 runes as **229 consecutive five-component rows**. Set `K=[11,26,8,15,2]` from p7's printed red source words. In GF(29), transform each independent vector `x=(x0,x1,x2,x3,x4)` through five successive triangular shears:

```text
For r = 0,1,2,3,4:
  x[r] ← x[r] + K[r] * (x[(r+1) mod5]^2 + x[(r+2) mod5])  (mod29)
```

The exactly inverse decoder processes **r=4,3,2,1,0** and subtracts the same expression. Each update changes only one coordinate, so the other coordinates are exactly the historical values at the inverse round. Consequently the complete five-round transformation is a bijection over all 29⁵ five-rune vectors, including repeated glyphs. It contains genuine quadratic nonlinearity. There are no unrecorded secret keys, score-fitted parameters, phase offsets, alternate word orders, or extra layers. The only admissible source layout is consecutive row-major five-rune groups.

The [read-only CommonJS SFT](../sims/lp2_2263_five_scroll_nonlinear_shear_sft.cjs) checks the original red p7 offsets, recomputes its exact five products, tests 841 synthetic five-vector inputs, decodes and re-encodes **all 1,145** unchanged original runes, and restores the complete printed 255-word length tape. It independently reconstructs **95/95** native solved-p57 runes and two **1,145/1,145** source-native Shakespeare/Gibran plants after forward encryption. The reversed red-product order fails those plants on 1,103 and 1,108 positions, respectively. [Successful GitHub Actions Node22 execution](https://github.com/FlareZ123/liber-primus/actions/runs/45022360037).

## Untrained original result

| Original region and stage | GP29 runes | GP29 index of coincidence |
| --- | ---: | ---: |
| p3–p7 unchanged ciphertext | 1,145 | **0.034633707** |
| p3–p7 complete nonlinear inverse | 1,145 | **0.034154274** |
| p3 inverse | 217 | **0.033495477** |
| p4 inverse | 261 | **0.033922782** |
| p5 inverse | 263 | **0.034307607** |
| p6 inverse | 196 | **0.033281005** |
| p7 inverse | 208 | **0.034048681** |
| Genuine GP-Shakespeare plaintext plant | 1,145 | **0.062152258** |
| The same plant after nonlinear encryption | 1,145 | **0.034566525** |
| Genuine GP-Gibran plaintext plant | 1,145 | **0.060368889** |
| The same plant after nonlinear encryption | 1,145 | **0.034487129** |

The output's actual first 38 printed words begin `YR DIJPCIAYSDEAU DEOP NLRD THTACOEN IAAEAEXRTHJ LOEOOOEHI...`. No contiguous original p3, p5, p6 or p7 material decodes into recognizable native-GP English prose. It remains frequency-flat across every held-out original physical page.

Unlike a fixed substitution, this five-vector transducer **does genuinely change complete-word internal equality signatures**. Original p3–p7 has **4** equal-adjacent glyphs among **890** interior word positions; the inverse has **32/890**. That moves the aggregate frequency toward chance but not toward true plaintext: a wrong nonlinear decoder can erase the anti-repeat source signature without solving the underlying cryptogram. The completed native-language positive plants are an independent discrimination.

## Decision

Retire precisely this row-major five-shear, source-product-keyed nonlinear inverse as a direct plaintext decoder. It is outside the 48 earlier static linear five-lane transforms, and every original runic value survives exact forward reproduction. Neither the historical 2014 square nor original red p7 words independently specifies a *quadratic two-neighbour shear*, so changing the round polynomial or coefficient order solely because the direct output failed would be postselected parameter hunting.

The route that could change the research decision is **a literal original source operator telling a human how the five red products mix or update the five visual lanes**, preferably identifying how each of the five physical 217/261/263/196/208-rune pages maps into equal-length lanes. Without that instruction, the equality `1,145=5×229` is an interesting shape and the red values are genuine input, but no actual original plaintext or recoverable cipher state has been obtained. The independent possibility that the printed words encode framing rather than plaintext remains untested by this model.

**Reproduction:** [source CJS file](../sims/lp2_2263_five_scroll_nonlinear_shear_sft.cjs), [passing workflow 45022360037](https://github.com/FlareZ123/liber-primus/actions/runs/45022360037), original `resources/liber-primus/lp2-corpus.json` and `lp2-transcription.txt`, solved `lp1-plaintext-reference.txt`, earlier [48 linear and 5-of-5 Shamir decisions](lp2-p3-p7-five-scroll-product-original-gate.md).
