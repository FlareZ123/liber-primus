# Numeric namespace ambiguity: GP chart, Wisdom, BASE29 and LP2 (#3200)

**Decision:** an operationally resolved historical numeric namespace distinction exists, but is field-specific and does not select an LP2 receiver. The same ambiguous token `18` occurs in the original 2014 Wisdom square and twice in LP2 p51. The Wisdom numerical output fixes its decimal value; LP2 has a different fixed-width mixed-ASCII field. A decimal-if-numeric hybrid loses source spelling information under both remaining byte conventions. Retire that direct reversible transport absent an authored tag. No unknown plaintext or key.

## Historical discriminant

The original [2013 Gematria Primus JPEG](../resources/historical/cicada2013-gematria-jpeg.b64), blob 625717bab1bff316c204b197c1cd901eb3cd7cb6, was visually inspected. It says an order and a value; each rune has one unique printed prime. The C/K, S/Z, NG/ING, IA/IO aliases share a value per row, not two numerical interpretations. Multi-character segmentation is separate (#2976/#2429).

The signed [2013 BASE29 protocol](../resources/external/2013-tcp-server-signed-source.md) establishes 3301→3QO. Contemporaneous participant logs (not themselves signed) record 30→11 and 1033→16I. The explicit command selects positional BASE29, not ordinary decimal.

The separate 2014 LP1 p05 Wisdom mixed rune-word/ASCII integer square has an exact numerical 5×5 matrix in the same original binary, recovered from its reversed-hex suffix. [Source note](../resources/external/2013-0-wisdom-source.md) and [original-byte reproduction](2014-magic-square-direction-map.md). This is a single 2014 artifact, not two independently acquired source objects. All seven distinct decimal spellings are also legal minimal BASE29 tokens. The actual numeric output distinguishes the readings:

| Printed token | Historical output | BASE29 |
|---|---:|---:|
| 272 | 272 | 1887 |
| 138 | 138 | 936 |
| 131 | 131 | 929 |
| 151 | 151 | 987 |
| 18 | 18 | 37 |
| 226 | 226 | 1746 |
| 245 | 245 | 1803 |

The literal decimal rule selected by four first-row numerals predicts all three held distinct spellings 18,226,245 in the same artifact. All 12 numeric cells match decimal, 0/12 BASE29; 13/13 rune-word cells match GP prime sum, 0/13 either zero- or one-based GP order sums. The established 25/25 equivalence is prior art; the explicit decimal/BASE29 comparison and transfer mismatch are new. This resolves the rank/value distinction for the historical mixed square, not a universal numerical decoder.

## Unknown LP2 transfer gate

The corrected prose transcription contains only six standalone ASCII numeral tokens outside graphic fields: 7 (p10) and labels 1–5 (pp36–38). Decimal and BASE29 coincide on every one. The p15 spiral and p33–39 cuneiform are different graphic types and not counted here.

The p49–51 panel has 256 fixed two-character ASCII cells; 42 are digit-only (five leading zero); 124/256 are outside the signed BASE29 alphabet. The Wisdom grid instead mixed decimal literals and native rune words, not fixed-width alphanumeric codewords. Token 18 occurs at p51 zero-based local cells 19 and 40 (global 203,224), and has readings decimal18, BASE29 37, radix60 68, radix59 67. This exact lexical overlap is not a matching typed input. No independently authored per-cell radix selector is present.

Grant, as a conditional obstruction rather than an author claim, the obvious mixed interpretation: decimal for digit-only cells, the existing uniform radix60 or radix59 for every other cell. Both maps collapse 161 distinct observed spellings to 143 distinct integers. For example, 18 and 0I both become 18 under either hybrid. A source-class tag would be needed for reversible spelling recovery.

| Hybrid | Collision classes | Ambiguous positions | Compatible assignments with fixed original multiset |
|---|---:|---:|---:|
| decimal / radix59 | 18 | 51 | 226748160 (27.76 bits) |
| decimal / radix60 | 18 | 53 | 604661760 (29.17 bits) |

The exact fixed-inventory count is the product over collided value classes of n! divided by the factorials of observed spelling counts. These are distinct assignments to the same integer tape, not claims that they satisfy a later independent constraint. A deliberately lossy consumer or decoder retaining source class is outside scope. The [uniform base59/base60 equivalence](lp2-p50-radix-codebook-overlap-source-gate.md) remains unchanged.

Director fork: require a same-field historical operand/output or an authored class tag before a frozen receiver. No new alias or radix sweep.

## Reproduction

[CommonJS SFT](../sims/lp2_numeric_namespace_ambiguity_sft.cjs), `node sims/lp2_numeric_namespace_ambiguity_sft.cjs`; [raw counts and input blobs](lp2-numeric-namespace-ambiguity-output.json). Exact numeric core executed in connected V8; Node file-reading wrapper not independently run. No new CI.
