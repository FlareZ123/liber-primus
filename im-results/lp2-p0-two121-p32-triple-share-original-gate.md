# p0's two 121-rune halves and p32 tree: source-selected three-stream addition

**Consolidated through 18 November 2026 (Agents 14 and 37). Status:** an independently executed, fully reversible GP29 three-stream candidate on original unknown LP2; **no recovered plaintext, key, cipher method or destination**. This tests a distinct structured interpretation of p0's exact two-half layout, rather than repeating the earlier p32-as-Vigenere-key test.

## Human-observable source geometry and candidate

The original physical LP2 page p0 has **262 rune glyphs**. Its first physical line carries a 13-rune red heading and seven following black runes, giving 20 source-marked runes. The **remaining 242 runes split exactly into two equal 121-rune blocks** A and B. Original p0/p1/p2 illustrations show two giant crosses rotated by precisely 180°, a source-visible motive to consider reversing one half ([source crop audit](p0-rotated-cross-source-readorder-gate.md)). Original physical **p32** depicts the tree re-used in the signed 2016 image and contains **121 = 11²** runes whose prime top-row/column sums equal that image's pixel dimensions 563×569 ([source tree map](lp2-tree121-signed2016-source-gate.md)).

The **2014 Cicada solution** also used XOR combination of multiple separately obtained byte shares. A concise new candidate is therefore to combine **three 121-rune GP29 streams**: p0 body halves A and B and p32 tree stream K. Since 29 is the native GP modulus, a minimum reversible counterpart to three-share XOR is componentwise signed **addition modulo29**, with the original first half anchored and only literal half-turn reversals allowed.

This is an exploratory mechanism, **not** an authenticated command to use the p32 page or a claim that additive GP shares are the historical XOR scheme. The 20-rune division and 121+121+121 lengths come from independent original pages, before any language scoring.

## Frozen source-input inverse family

- Original p0 positions 0–19 provide the source-marked first line and are *not* treated as a decoded output.
- A is original p0 positions 20–140 inclusive, **121** symbols.
- B is original p0 positions 141–261 inclusive, **121** symbols.
- K is every original physical p32 rune, **121** symbols, in the same row-major 11×11 source reading that yields the signed image's dimension checksum.
- For each of **8 sign triples** `(s_A,s_B,s_K)∈{−1,+1}³`, test `P[i]=(s_A A[i]+s_B B[j]+s_K K[k]) mod29` with independently fixed `j=i` or `120−i`, and `k=i` or `120−i`. Thus there are **32 exact candidates**, none with fitted shift, keyed permutation, dropped rune or alphabet relabeling.

Every model is exactly reversible for any designated output if the other two source streams are retained. Its decoded result must independently look like real original GP-language text, rather than merely re-encrypt by construction.

## Executed result

The best original 121-rune output by GP29 unigram collision rate has signs **(−1,−1,+1)**, B reversed, K forward. It reaches only **IoC = 0.03925619835**; the globally sign-reversed counterpart has the same IoC. The decoded GP transliteration begins `IEROPTHNGPDXECTNNGTTOEREPCBTHXPPEAEYWNTHAOE...`, with no clear prose. The full 32-model family has no larger IoC.

For an entirely independent native-GP text reference, convert the checked-in full *The Prophet* by Kahlil Gibran to GP symbols using the established `QU→CW, V→U, K→C, Z→S` spelling folds and all seven runic digraphs. This yields **63,114 real GP29 source symbols**. Compare every 121-symbol control window at stride seven, **9,000** reference windows. Their IoCs range from **0.04752066116** to **0.08898071625** (median **0.06060606**). **None** is as flat as the *best selected original output* of 0.03926. This separation already accounts for taking the best of all 32 original signs/readings, since every native window exceeds that maximum.

A constructive triple-share test fills the source p0 first 121-rune half from a fresh actual GP-English paragraph and keeps the original B and K as the two other independent shares. Under true `A + reverse(B) + K`, the exact evaluator returns the held source plaintext **121/121 runes**, including its original-language collision profile. This is an actual decrypt-to-known-text plant, not a historical key or evidence of genuine p0 encoding.

## Literal historic three-way XOR: independent exact capacity obstruction

The actual 2014 Cicada sharing operation used **bitwise XOR of byte strings**, so check the closer literal counterpart before retiring the source geometry. Treat every original GP29 rune index 0..28 as its natural five-bit integer and XOR the corresponding p0-A, p0-B and p32-K values. Four orderings remain (forward/reversed B × forward/reversed K); XOR is commutative, so additive signs do not apply. A direct GP29 output cannot contain three unused five-bit codes **29, 30 or 31**.

| B direction | p32 direction | Invalid GP29 outputs among 121 |
| --- | --- | ---: |
| Forward | Forward | **5** |
| Forward | Reversed | **12** |
| Reversed | Forward | **9** |
| Reversed | Reversed | **11** |

Thus **all four** source-motivated literal 5-bit XOR readings fail the *exact rune-alphabet capacity condition*, independently of any language model or guessed key. A different byte serialization, rejection, or extra intermediate alphabet could permit 29..31, but then a new inverse or framing instruction is required. The same executed SFT asserts these four values.

## GF(29) Shamir three-of-three interpolation: distinct complete original test

A different historically standard reconstruction of three shares is **Shamir's polynomial secret sharing**, rather than bitwise XOR or the signed sums above. For three shares at conventional coordinates x=1,2,3 in the GP29 field, recovering the quadratic's constant term gives **P = 3S1 − 3S2 + S3 (mod 29)**. The coefficients 3 and −3 make this an operation not included in the earlier eight signed-sum alternatives. **Caveat:** actual archived 2014 Cicada shares used bytewise XOR; no original LP2 clue authenticates Shamir sharing, the GP29 field or these three pages as its inputs.

The source layout supplies A (p0 offsets 20–140), B (p0 offsets 141–261), and K (all p32), each 121 source runes. I tested all six assignments of these three streams to the standard interpolation coordinates, with the two original-source 180-degree half-turns applied or omitted independently to B and K. These are **24 complete frozen original decodes** with no guessed plaintext, phase, dropped glyph or fitted field operation.

The highest-IoC original output is assigned shares A,K,B (assignment 021), with printed B and reversed K. It has **IoC 0.04104683195592287**, below the previously pinned **0.04752066116 minimum** among 9,000 native-GP English control windows of equal length. Its literal GP transliteration begins **NGNGYTHCEATHSMCEOOECYMMSATGNGCOEHEPLABWDDTA...** and has no coherent English. Every other one of the 24 output streams has lower IoC. An exact native solved-p57 GP positive reconstructs 121/121 symbols; corrupting one share at one position changes only one decoded symbol, verifying the algebra and invertibility.

The executable [single-file Node.js 22 original-source test](../sims/lp2_p0_p32_gf29_shamir3_original_sft.cjs) prints all 24 complete source results and asserts the native positive. It consumes the same canonical LP2 numeric corpus and writes no data. This closes the distinct fixed-GF29 Shamir share-coordinates interpretation without claiming that every nonlinear or historically unspecified secret-sharing code is excluded.

## Decision

**Retire the three directly specified algebraic interpretations of p0's two 121-rune halves plus p32's 121-rune tree stream as original GP-English decoders.** The full signed-additive and all standard GF29 Shamir share-coordinate arrangements (with source-visible half-turns) fail the native-language collision gate; literal GP-index XOR produces out-of-alphabet codes in all four natural half-turn orientations. The authentic p32/p0 length coincidences and rotated crosses remain source facts. The tested direct interpretation is incapable of explaining the native-language word-rate marginal on the original ciphertext, while the exact language plant passes. The tests do not exclude a missing non-GP intermediate, true bitwise XOR on a different serialization, a nonlinear share operation, or an independently evidenced route that uses these three objects differently. Another branch needs a source-selected operation that changes the predicted plaintext, rather than more sign/order variants. The 2014 historical bytewise-XOR shares do not independently select GF29 polynomial interpolation.

**Reproduce:** [`sims/lp2_p0_two121_p32_threeway_source_sft.cjs`](../sims/lp2_p0_two121_p32_threeway_source_sft.cjs) was executed on the exact canonical corpus and source Gibran data, including every assertion and the 121/121 native-GP plant. It writes no files and creates no scheduled workflow.
