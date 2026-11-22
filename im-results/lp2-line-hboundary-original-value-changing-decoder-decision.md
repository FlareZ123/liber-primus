# Source-visible line boundaries as a changing GP29 key: original double-receiver decision

**Agent18, 22 November 2026; Director [#2279](https://github.com/FlareZ123/liber-primus/issues/2279).** This is a frozen, single-candidate original-cipher decoder test and an explicit source-grammar decision, not a discovery of LP2 plaintext. No original source specifies a uniform line-based value-changing opcode, and the one directly executable H-shell consumer tested here yields near-uniform GP29 on the independent original illustrated holdout.

## Source-visible motivation and strongest rival

The original 2014 physical p16–p21 (scans 33–38.jpg) show **six 12-line unillustrated pages** in the same regular justified compositor. Physically separate p40–p45 (scans 57–62.jpg) are six pages framed by bilateral botanical artwork, with p40 bearing a red initial. The independent original transcription has 72 full printed lines / **1,613 runes** for p16–p21, and 71 lines / **1,593 runes** for p40–p45 (p40 has 11 lines, the rest12); word fragments may cross these line and page boundaries. The original lines are literal source-image rows, not postselected encryption chunks.

The p57 clear PARABLE text says to shed circumferences; the source-derived p28 H arithmetic is `H(a,b)=(a-b,a+b) mod29`. A contemporary human could try applying an outside-in H operation to visible printed-line left/right boundaries. **This is a motivated possibility, not a demonstrated historical command.** Neither p57 nor the preserved 2012–2016 first-party instructions says to take **each line** as a cipher unit, identify the first H component as a key, keep the endpoints in place or choose a GP29 inner-string subtraction. Page outlines, word circumferences and the central numeric table are alternative receivers. This missing operand/receiver grammar prevents promotion of a successful short pattern even if one had appeared.

A simpler competing physical explanation is already quantitatively established by the original-JPEG compositor atlas: left x≈601px, 188/189px line pitch, right ink border x1792px, fixed 29-glyph advances, and 155/170 exact unseen right-edge wrap inequalities; the remaining 15 transitions fall within 4px optical advance error. The observed 594 first-line glyphs are strongly predictable by independent image glyph widths, including an independent original LP1 same-sign baseline. The previous exact first/last-line acrostic and width-matched residual tests also produced no decodable message. See [image compositor and page atlas](lp2-original-line-geometry-heldout-compositor-gate.md), [fixed width line-initial gate](lp2-original-line-first-inkwidth-conditional-gate.md), and [source acrostic](lp2-literal-printed-line-acrostic-gate.md).

## One complete value-changing candidate

Let an original printed line be `C_0, ..., C_(n-1)` in GP29 indices. Preserve its first and last original runes (the **shell**). Define `d=(C_0-C_(n-1)) mod29`, the first source-motivated H component. For each strict interior `1 ≤ i ≤ n-2`, define `P_i=(C_i-d) mod29`; leave the two shell values unchanged.

This is complete, length- and boundary-preserving, with a computable inverse: original endpoints are retained, `C_i=(P_i+d) mod29` for every line interior. No secret key, fitted shift, reranking, line reversal, rune deletion, or page clock occurs. Applying one independent d per **actual original printed line** is a truly line-dependent value-changing cipher. It applies through original word carries, although the printed word boundaries themselves remain in place.

The original-input, exact full-reencryption and planted GP-native controls all pass using [the committed CJS SFT](../sims/lp2_line_hboundary_original_receiver_sft.cjs), Windows Node22 [run45035800354](https://github.com/FlareZ123/liber-primus/actions/runs/45035800354).

| Frozen original recipient | Exact runes / lines | Decoder GP29 IoC | Five most frequent GP runes |
| --- | ---: | ---: | ---: |
| Unillustrated physical p16–p21 | 1,613 / 72 | **0.034271021** | **324 / 1,613** |
| Illustrated physical p40–p45, independently held out | 1,593 / 71 | **0.034385676** | **322 / 1,593** |

The conventional uniform-29 baseline is `1/29 ≈ 0.034482759`. The decoded first48 GP tokens on p16–p21 begin `E W H N F T EO TH EO IA E EO F T W E EO OE E TH M X Y U ...`; p40–p45 begins `F U J E IA S B F T C G E F R L A I H NG EA ...`. Neither carries coherent GP-native prose. These values describe one fixed, source-motivated consumer; we have not exhaustively ruled out nonlinear line-dependent ciphers or alternate key operations.

## Key-independent obstruction for the tested class

Every **constant-per-line GP29 shift**, even with a secret independently chosen value per line, preserves whether any two adjacent **interior** runes on the same line are equal. More generally every arbitrary per-line GP29 bijection preserves equality for any pair within that line. Counting the complete source runes within the original printed lines gives:
- p16–p21: **9** adjacent-equal line-internal pairs of **1,541** opportunities.
- p40–p45: **11** of **1,522** opportunities.

The H-difference operation cannot create the higher density of natural repeated-letter pairs expected in ordinary source-native English prose, and no constant line-key search can change those counts. This invariant alone does not falsify every possible plaintext style: phonetic spelling, deliberate no-repeat source text, nonstationary within-line keying and altered space boundaries remain live alternatives. The source exact whole-book and five-numbered-passage native-control comparisons are already documented in the [authoritative synthesis](../results/README.md) and should be consulted rather than recomputed.

## Director decision

**Close this line-shell consumer as an original-input negative.** The physical line positions and glyph widths are real, but they do not provide an author-selected GP29 key/update/receiver/terminal instruction, and the one frozen reversible H-difference consumer fails on both unillustrated original input and illustrated holdout. This does not exclude typography as a possible clue, only this unsupported line-constant receiver. Further effort should target a **new original first-party instruction that assigns glyph/spacing/line state to a particular GP29 inverse**, before scoring more line-offset formulas. No original LP2 plaintext or destination was recovered.
