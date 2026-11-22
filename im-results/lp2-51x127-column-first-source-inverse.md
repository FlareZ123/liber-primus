# 51×127 field-pair source inverse with column-first manuscript reading

**12 November 2026, Agent 5. Result:** the column-first physical traversal of the original LP2 GP29 ciphertext does **not recover native-GP plaintext** when combined with the specific p53-red/p54-Ac/p50-quotient additive or field-multiplicative masks described below. No authentic secret, instruction, unknown page plaintext or deep-web destination was obtained. The distinguishing experiment is a new traversal orientation; the underlying 51×127 numerical coincidence and row-first masks were previously investigated.

## Original-visible input and candidate human route

- The source p3 red triple \([13,23,2]\) defines an irreducible polynomial \(13+23u+2u^2\) over \(\mathbb F_{29}\), hence \(u^2=8+3u\). The marked p39 red triple \([27,5,15]\) defines \(15(X-24)^2\) and divides the original p50 256-byte table polynomial after GP29 reduction.
- Original p53 ends in exactly **51 marked red runes**; p54 begins with an oversized Ac (GP index **24**). The p50 polynomial divided by the monic \((X-24)^2\) has **254** GF29 quotient coefficients and zero remainder, naturally yielding **127 consecutive field pairs**. These are actual original-source quantities; treating them as a 2D cipher is a **hypothesis**.
- The entire unsolved LP2 input has **12,956 runes**, including a literal two-rune prefix \([15,8]\). The remaining \(12,954=51×127×2\) runes admit exactly 51 rows, 127 columns, and two GF29 coordinates per cell.
- A historical Cicada stage employed a columnar rearrangement. Accordingly the candidate missing step is to read the **same 51×127 glyph-pair matrix column-first**, rather than assuming the row-first stream order of prior [field-register investigations](red-triad-51x127-byte-register-gate.md).

The weakest premise is still independent selection of this grid geometry and of the mask operation: no surviving original instruction explicitly equates the p53 red symbols with row seeds or commands use of a 51×127 field-pair transpose. This study tests that finite interpretation without adjusting its parameters against language output.

## Frozen direct-inversion experiment

The committed [read-only CommonJS SFT](../sims/lp2_51x127_columnfirst_source_inverse_sft.cjs) reads the complete authentic corpus and p50 bytes and reconstructs the quotient polynomial. For source row \(r\) and column \(j\), it obtains the two-digit GP29 ciphertext cell using either row-first index \(127r+j\) or column-first index \(51j+r\).

Two source-fixed row elements are considered: \(S_r=(24,R_r)\) and \(S_r=(R_r,24)\), where \(R_r\) is the printed r-th p53 red GP index. Each interacts with the source p50 quotient pair \(Q_j\) using either field multiplication \(S_rQ_j\) in \(\mathbb F_{29}[u]/(u^2-3u-8)\), coordinate-wise GP29 addition \(S_r+Q_j\), or a zero-mask control. The output is reconstructed row-first or column-first, under both mask signs. These explicit factors give **48 models** (including repeated zero-mask controls). The model universe is finite and contains no hidden key fitting, phase, reset, per-page word manipulation, or cipher-symbol omission.

For language scoring, the SFT learns a Laplace-smoothed 29-symbol trigram distribution on the first 190,000 characters of the pinned Shakespeare reference, using declared GP digraph tokenization. An independent Gibran reference provides a same-length **12,954-rune** native-English control. Both controls and all scored candidate outputs use the same scorer. GP index-of-coincidence is separately reported.

| Original output / control | GP29 IoC | Mean trigram log likelihood (nats/rune) |
| --- | ---: | ---: |
| Untouched original suffix | **0.03447896** | **−12.54219** |
| Best of all 48, row-first → row-first, additive seed (Ac,R), subtract | **0.03446776** | **−12.50611** |
| Best **column-first → row-first**, multiplicative seed (R,Ac), add | **0.03449265** | **−12.51779** |
| Independent native-GP Gibran, 12,954 runes | **0.06039670** | **−7.87755** |

The new column-first interpretation yields neither a language-like glyph distribution nor a recognizable sentence. Its score is over 4.6 nats/rune below the native-language control. The overall winner remains row-first, already explored previously, and is likewise ciphertext-like. Printing more trigram-selected variants would not constitute evidence of a key.

## Exact original-input and reversal controls

- The source SFT asserts original rune count **12,956**, two-rune prefix **[15,8]**, p53 red marker count **51**, p54 index **24**, p50 quotient length **254**, and exact zero division remainder.
- To test the newly proposed traversal itself, it encrypts **12,954 native-GP Gibran runes** by placing a source-masked row-first plaintext into the original **column-first** ciphertext order. The exact inverse recovers **12,954/12,954** runes; swapping the independently specified row seed fails the equality control.
- The script asserts the raw, best-total and best-column-first output measurements, preventing inadvertent sign or source-order changes.

**Decision:** retire this direct column-first/row-first pair-permutation with fixed p50-quotient and p53/p54 row masks. A future 51×127 continuation needs a separately visible reversible operation, a new key/state with genuine independent sourcing, or a different plaintext register. Do not infer a complete LP2 solution from the dimensional identity.
