# P8→p9 whole-word 87 and red-heading 12: a source-selected ternary-splice rival

**Agent16, 22 November 2026. Original-input discovery and bounded state-geometry decision; no recovered unknown LP2 plaintext, key, or verified decipherment.** This report treats the original p7–p9 manuscript as the complete experiment. It adds a source-readable operand to the existing p7 GF(3) codebook hypothesis and identifies the missing decipherment rule; it does not relaunch the already-tested additive/cubic/mutable-table inverse families.

## Three linked source observations

The original physical **p8** has a genuine **12-rune red heading**, split into two words of **4 and 8 runes**. Their GP29 *zero-based ordinal products modulo29* are precisely **4** and **3**. Multiplying these two products produces **12**. The entire red heading therefore gives **GP product12 and length12**. The final p8 black rune, `ᛇ` (the last of its 243 black runes), has **GP index12**; its word continues over the physical p8/p9 seam. The same ordinal-product operation was already motivated independently by the five red words at the end of p7. Among the nine unknown LP2 pages with red ink starting at the first rune, **p8 alone** has *both* its full contiguous red-heading product and heading length equal to its last rune GP index. The exact page/product/index controls are printed by the SFT.

The next **five black runes on p9**, completing the carried word, have GP29 ordinal product **5** (their exact indices are [26,7,25,6,11]). The two red-word products **4 and 3**, followed by the first whole word's black five-rune continuation product **5**, form the primitive integer right triangle **3–4–5**: **3²+4²=5²**. Its perimeter **3+4+5=12** equals the red-heading rune count, red-heading aggregate product **4×3=12**, and carried rune GP index12. Its ordinary area **(3×4)/2=6** equals the authentic complete page-crossing word length6. These relations share operands, so they cannot be counted as independent coincidences. They give a concrete, human-recognizable *geometric interpretation* of the observed seam, but no original illustration explicitly draws a right angle, specifies the ordinal-product rule, or commands a transform.

The **complete six-rune** word across the original page break is `ᛇ | ᚣᚹᚫᚷᛄ`, with zero-based GP values **[12,26,7,25,6,11]**. Its unmodified integer sum is **87=3×29**, congruent to zero modulo29. Inspecting *all 32* actual page-crossing words of the canonical original transcription, this is the **only** crossing word with GP sum zero modulo29; **five** crosses have length six. The total87 is inherently available only after continuing the printed word onto p9. Its crossing text has not been resegmented, and the final rune on p8 is retained unchanged.

The authentic p7 final red-word GP products are [11,26,8,15,2]. Taking their remainders modulo3 yields GF(3) taps [2,2,2,0,2], which generate exactly **242 distinct nonzero five-trit states**. Inserting the absent zero symbol while preserving the de Bruijn property has **exactly two positions: 87 and 208**. Original p8 black text has an ordinary *hyphen word boundary at position87* and a *full sentence stop at position208* (zero-origin rune counts inside black body). The completed crossing word's **87**, the mathematical **87** insertion position, and the black word-break **87** thus select one possible splice through three distinct kinds of source item. The competing **208** insertion position matches the black sentence stop and p7's literal rune count **208**. The latter was already documented in [the sentence-splice decision](lp2-p7-p8-sentence-selected-debruijn-splice.md).

These exact equalities support an **87-first hypothesis**, not a settled author-selected splice. Both alignments are original-source facts under the proposed mathematical model, and the GP product/sum/model/phase choices were recognized after extensive prior analysis. The document does not assign an authorship probability to the coincidences.

## Direct historical DH23 without interpolation

There is a further **simpler, human-readable** connection to the previous 2013 Cicada Diffie–Hellman example. Earlier [p6/p7/p8 DH source reconstruction](lp2-p6-p8-red-shamir-dh-fullstate-coverage.md) recovered the known DH23 tuple by interpolating the p7 five red words at five measured dot positions over GF29. The **p8→p9 3–4–5 seam** gives an alternative value of the example's private exponent **a=6** from the ordinary right-triangle area, and a value of the example's generator **g=5** from the actual p9 five-rune continuation product, **without performing any Shamir or quartic interpolation**.

The following source observations jointly reconstruct the entire *already-known historical* tuple using only directly visible rune indices, printed red words and the physical crossing word:

| Historical field | Original physical source | Reconstructed value |
| --- | --- | ---: |
| p | p7 **first rune** of first red word | **23** |
| e | p7 **second rune** of first red word, cross-check p8 second red-word product | **3** |
| g | literal p9 **five-rune suffix** product of the crossing word, cross-check p7 third red word's first rune | **5** |
| a | **(3×4)/2**, triangle area from p8 second/first red products 3/4 and p9 suffix product5 | **6** |
| b | p7 fourth red-word GP29 product | **15** |
| A | p7 third red-word GP29 product | **8** |
| B | p6 **single original red rune M**, index19 | **19** |
| K | p7 fifth red-word GP29 product | **2** |
| q | p8 first red-word GP29 product, cross-check **K² mod23** | **4** |

Exactly the DH23 equations `5⁶ mod23=8`, `5¹⁵ mod23=19`, `8¹⁵ mod23=2`, `19⁶ mod23=2`, and `2² mod23=4` hold. In p7's first two red words the first **[23,3]** have *product11* modulo29, while the second distinct word has product **26=23+3**, a further elementary sum/product cue if the field interpretation is adopted.

**Value of this alternative:** It avoids the high-assumption operation of measuring five dots and interpolating a quartic solely to recover a known historical parameter set. The geometry-based `a=6` is an independently specified arithmetic rule *once* the 3–4–5 interpretation is chosen. **Limit:** every field name and the use of triangle *area* were recognized against a previously published example. There is no author-labeled table identifying these as DH entries, no contemporaneous clue selecting a 2013 example as the LP2 output law, and no unknown manuscript plaintext. The earlier polynomial route may encode different information even if this simpler reconstruction is valid.

## A source-locked 60-cell receiver: direct GP29 inverse is negative

The same literal triangle yields **3×4×5=60**. The original 32×8 table on pp49–51 contains four successively inward concentric perimeters of lengths **76, 68, 60, 52**. Exactly the **twice-shed** ring has 60 original cells. This is an independently readable bridge to the solved p57 text's **SHED OUR OWN CIRCUMFERENCES** and to the period's sexagesimal cuneiform table, although no source commands a crossing from p8 to p50.

A single finite, reproducible receiver tests the simplest such bridge without choosing parameters from plaintext. Read the original **second inner perimeter (ring2)** clockwise from its original upper-left corner. Begin at **87 mod60=27** (the true crossing-word sum). Repeat those 60 original base60 byte values cyclically, reduce each value modulo29, and apply the **ordinary additive GP29 decryption** `P[i]=(C[i]−K[i]) mod29` to the entire original p9–p14 continuous stream. The opposite sign is retained as the one predeclared rival. The two original outputs are:

| Original input or reversible operation | GP29 index of coincidence, p9–p14 (1,474 runes) | Untouched p13 first200 |
| --- | ---: | ---: |
| Original ciphertext, unchanged | **0.03444083** | original source, unchanged |
| Ring60 value subtract | **0.03497233** | **0.03582915** |
| Ring60 value add | **0.03427687** | **0.03286432** |

Neither output produces coherent native-GP plaintext. Both exactly re-encrypt **1,474/1,474** original ciphertext runes under the same frozen phase and ring. Planted independently solved p57 source text encrypts and decrypts **95/95** using both signs. This is a narrowly negative **direct additive ring** decision: it cannot exclude an original-valued instruction using the perimeter as a locator, external object, state schedule, or nonlinear key. The multiplication yielding60 is a geometric clue **hypothesis**, and the missing operation remains the decisive blocker.

## Pythagorean GP29 rotation: a complete reversible original-input test

The recovered **3–4–5** triple has a canonical key-free reversible operation on pairs of GP29 symbols: a rational right-triangle rotation. For each source-chosen leg ordering **(a,b)=(3,4)** or **(4,3)**, take

\[
R_{a,b}^{\pm}=5^{-1}
\begin{pmatrix}
a & \mp b\\
\pm b & a
\end{pmatrix}
\pmod {29},\qquad 5^{-1}\equiv6\pmod {29}.
\]

Because `a²+b²=5²`, both matrices have determinant **1 modulo29**, and the opposite sign is their exact inverse. The actual **six-rune crossing-word length6** equals the needed modular inverse of5, a source-compatible additional check. This rule is mathematically motivated, but there is **no original instruction to apply Euclidean rotations to rune pairs**; it is a test, not an authenticated decoder.

The original seam fixes the first pair: the p8 final rune12 paired with the p9 first rune26, followed by the remaining four runes of their one whole printed word. Test a continuous sequence containing this carried rune and **all 1,474 unchanged p9–p14 ciphertext runes**, as well as the independent source-visible alternative of restarting pairs at each original whole-word boundary. Grant both leg orders and both rotation signs: **8 complete, fixed, reversible original-cipher tests**, without fitting an offset or cipher key. Each restores **all 1,475 input runes**, and authentic solved p57 GP29 text of **95 runes** survives a planted forward/reverse pass. The original outputs' full IoCs lie **0.03421–0.03479**; each untouched p13 first200 remains **0.03362–0.03538**. Every result remains ciphertext-like.

As a separately source-frozen complete packet, p8's second red8 and black243 plus the five genuine p9 continuation glyphs comprise **256 symbols =128 pairs** (excluding only the first red four-rune title). The strictly black p8+continuation packet is **248=124 pairs**. Both are wholly paired without a fabricated terminal symbol. The **8** analogous triangle rotations give p8→p9 packet IoCs **0.03474–0.03582**, with no language signal. All runes are retained, including the carried black rune; all original packets exactly re-encrypt.

**Decision on this operator:** the right triangle does choose a complete reversible linear GP29 operation, and the authentic page seam supplies pair framing. Its simplest native-cipher receiver is **negative** across the full untouched p9–p14 body and both physically complete p8→p9 packet scopes. Do not rescue this failed test with fitted leg coefficients, invented cipher layers, or an unpublished phase.

## p7 b15 exponentiation of GF(3^5): a finite nonlinear original receiver

The DH source reconstruction supplies **b=15** as the literal product of the fourth p7 red word. For the p7 red-derived primitive degree-five polynomial **f(x)=x⁵+x⁴+x²+x+1 over GF3**, the nonzero field has order **242**. Crucially, **gcd(15,242)=1**, so the familiar Diffie–Hellman operation `s↦s¹⁵` acts as an **exact permutation of all 243 GF(3⁵) states**, including zero. Its inverse exponent is **113**, since `15×113≡1 (mod242)`. Of the five p7 red products **[11,26,8,15,2]**, only **15** is coprime to242, making this a bounded source-selected alternative to an arbitrary state ordering.

Freeze the p7-constructed **87-splice** five-trit state sequence, assign the 243 actual p8 black runes to its 243 states in *original printed order*, and read each output key glyph from field state `(state_i)¹⁵` in the p7 polynomial basis. This uses a genuinely nonlinear 243-state address permutation, with no omitted black rune. The simplest fully reversible GP29 **receiver** is the 243-symbol cyclic key stream added to or subtracted from the original entire 1,474-rune p9–p14 ciphertext. The field permutation's 243/243 uniqueness and its exact inverse113 are asserted. Original keys are fixed before scoring.

| Frozen original receiver | Full p9–p14 GP29 IoC | Independent p13 first200 |
| --- | ---: | ---: |
| Unchanged original | **0.03444083** | source |
| Subtract exponent15 state-key cycle | **0.03447491** | **0.03507538** |
| Add exponent15 state-key cycle | **0.03427042** | **0.03346734** |

Both outputs remain nonlinguistic under the native-GP solved controls, while both exactly reencrypt all **1,474** original glyphs and recover independently planted solved p57 **95/95**. This rejects the **source-derived DH exponent15 address + direct additive GP29** consumer, including both signs. It does not refute using GF(3⁵) as a nonlinear state machine with a *different original author-selected output law*. The secret-exponent interpretation and treating p8 as a table were never first-party instructions. [Standalone original-input and planted controls](../sims/lp2_p8_crossword87_header_product_zero_state_sft.cjs) and [Windows PASS 45037533141](https://github.com/FlareZ123/liber-primus/actions/runs/45037533141).

## Strict physical carried-zero interpretation fails its necessary condition

There are **242** page-contained black runes before the one black rune carried into p9. A tempting model reserves that last black rune for the **all-zero five-trit address** following a contiguous 242-state nonzero cycle. With p7's exact five-tap sequence and original source phase held fixed, completing the cyclic 243-state de Bruijn register by either legal zero splice places its **all-zero address** at **black offset83** (splice87) or **offset204** (splice208). The original carried black rune occupies **offset242**, whose five-trit address is **78 in both valid registers**.

Consequently, the **literal source-phase cyclic five-trit-address model** cannot treat the 243rd, page-carried rune itself as the all-zero table cell. This objection **does not** exclude a separate special/sidecar field, a different state ordering, or an independently source-selected cyclic phase rotation. Any such recovery must supply its own author-visible selector. Source imagery alone does not authenticate a five-trit address table.

## What the observation changes, and what is still missing

The newly shared original word gives a **concrete, source-read 87-selector** competing with sentence208. The red heading simultaneously singles out the **real carried GP symbol** via the exact operation already proposed for p7. Both facts refine the human solve-path hypothesis more than another arbitrary phase or key search would.

For a decipherment, the creator must still select **one value-changing and reversible rule** connecting p8's 243 black glyphs, the ternary state register, and ciphertext at p9 onward, with a reproducible first-state initialization and original cross-page word handling. The source currently chooses **neither** how to generate a five-trit address from authentic ciphertext/plaintext nor what an address does to a GP29 rune. One independently geometry-selected 60-byte ring as a direct additive stream, the fixed 3–4–5 rational pair rotation, and a p7-derived DH15 nonlinear GF(3⁵) table walk are now explicitly negative (above). Prior exhaustive first-cycle and state-table models already tested additive/cubic output and read/mutate variants on original p9–p14 without native-GP prose: [p7 sentence splice](lp2-p7-p8-sentence-selected-debruijn-splice.md), [mutable table](lp2-p8-original-mutable-ternary243-state-gate.md), [all-secret state/rank28](lp2-p8-243-five-trit-allsecret-rank28-original.md). Those failures cannot be rescued by retuning an unseen key.

**Decision:** Preserve the self-contained, empirically verified red-products4/3, black suffix-product5, heading/carry12, and crossword87 data as source-selected operands and prioritize an *independently readable output equation*. Reject the **strict source-phase carry-is-zero de Bruijn framing**. In the absence of an authored operator, no original-p9 reverse decipherment is defined and issue #2267's complete-machine objective is unmet. A successor is justified only by a new original clue fixing a typed receiver, followed by a frozen test on untouched p9/p13 material.

## Reproduction

[Read-only Node22/CommonJS original-source SFT](../sims/lp2_p8_crossword87_header_product_zero_state_sft.cjs) uses only the canonical `lp2-corpus.json`, `lp2-ink-annotations.json` and page-preserving original `lp2-transcription.txt`. It asserts the complete 32-word crossing register, nine red-heading controls, the literal 3–4–5 triangle, both p7 GF(3) splice coordinates, real p8 punctuation, the all-zero address objection, direct complete historical DH23 field reconstruction without dot interpolation, plus the 60-ring direct inverse, eight physically framed Pythagorean GP29 pair rotations, their eight full p8-p9 packet inverses, and solved-language round trips. [Original Windows Node22 GitHub Actions PASS](https://github.com/FlareZ123/liber-primus/actions/runs/45037533141) verifies the actual committed script. No synthetic decryption, language score, or plaintext has been promoted into this source decision.
