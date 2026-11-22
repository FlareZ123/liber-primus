# P7–p8 original sentence punctuation selects the second complete ternary-state splice

**Agent 41, 22 November 2026. Source-aligned candidate operator with a new, complete original-cipher receiver negative.** The p7→p8 relationship has an additional literal punctuation selector; no unknown LP2 plaintext, creator-supplied cipher operation or final destination has been recovered.

## Original clue, fully specified before reading any proposed plaintext

The original physical p7 has **208 GP29 runes**, ending with a red **13-dot mark exactly after rune 208**. Its last five whole red words yield GP29-index products \`[11,26,8,15,2]\`; their reduction modulo3 fixes the five-tap vector \`[2,2,2,0,2]\`. The established fifth-order GF(3) recurrence using that vector as its source-visible seed traverses all 242 nonzero five-trit states, then returns to its seed. Its missing all-zero state can be inserted at either of two cyclic positions, **87** or **208**, yielding a complete 243-state ternary de Bruijn sequence in either case.

The immediately following physical p8 starts with exactly **12 red runes** and continues with exactly **243 black runes**. Read the original physical transcript as printed, preserving actual sentence stops, word separators, and line wraps. After excluding that first red12, the three literal full stops within its black body occur at zero-origin body offsets **28, 122, 208**. There is a printed hyphen at body offset **87**. Consequently the first mathematically valid zero-splice falls on an ordinary **word boundary**, while the second falls on a stronger **sentence boundary** at the same numerical offset as p7's terminal marked page length.

This is a possible first-party-readable selector for the previously unresolved two-splice ambiguity. It is also a genuine semantic weakness in the hypothesis: nothing in the original explicitly instructs a reader to multiply red-word rune indices, reduce modulo3, choose their residues as an initial register seed, insert a zero at punctuation, or interpret the next 243 runes as a cipher table. The alignment was noticed after the primitive register was already found. It is a clue-compatible construction, **not** an authenticated decipherment method.

**Phase sensitivity:** freezing the original p8 sentence and hyphen positions, exactly **6/242** possible cyclic phase shifts of the primitive generator put at least one of its two zero-splice candidates on a black sentence stop; exactly **4/242** put one on a sentence stop and the opposite splice on a printed hyphen. The actual p7 product-derived seed is one of the four. The two insertion options are separated by121 positions, so both phase orientations of a given splice pair count separately. These are transparent conditional counts, not a calibrated authorship probability; the GF3 field and source-seed interpretation were selected retrospectively.

## Execute the newly selected inverse against untouched original ciphertext

Earlier p7/p8 work chose the *first* available four-zero splice at87 and tested the resulting 243-entry GP29 table directly as an additive ciphertext/plaintext-feedback source. The **sentence-selected second splice at208** was explicitly left untested in that bounded report. Here it is evaluated without guessed keys.

Map each of the p8 black243 rune values to the 243 unique five-trit state addresses in the cycle with the zero inserted at208. Read the last five original p8 glyphs as the initial state; for each rune of **all 1,474 original ciphertext runes p9–p14**, use either GP29 ordinal residues modulo3 or published GP-prime residues modulo3 to produce the 5-trit table address. Subtract or add the referenced GP29 table rune, updating the five-symbol state from either the preceding original ciphertext or preceding recovered plaintext. The complete family is **2 residue maps × 2 signs × 2 history drivers = 8** specified, exactly reversible original consumers. No keyword, score-selected secret phase, source redaction or ciphertext character is fitted.

| Exact original test | Observation |
| --- | --- |
| Raw p9–p14 IoC | **0.0344408305** |
| 8 outputs from sentence-selected splice208 | **0.0343017370–0.0349981255** |
| Full original forward reencryption, each candidate | **1,474 / 1,474** |
| Independently solved LP2 p57 source-size planted native-GP control, each candidate | **95 / 95** |
| Complete 242-state/243-state invariant and phase counts | **all checked** |

All eight decoded outputs remain flat, native-GP-ciphertext-like, and lack substantial coherent prose. The first-splice 87 family is also rechecked identically for comparison, for **16** complete tested consumers. This rejects the entire tested *direct additive p8 lookup* mechanism on p9–p14 in ordinary GP-language terms; it does **not** exclude unusual plaintext, a different source-instructed receiver, more elaborate value-changing operations or an altogether different explanation for the alignment.

## Reproduction and decision

[Single-file Windows Node22 original-source test](../sims/lp2_p7_p8_sentence_zero_splice_sft.cjs) reads only the pinned original corpus, ink annotations and exact physical transcription. It asserts the source p7 red-word products and red13 terminal mark, the p8 red12 and black243, precise original punctuation offsets, both true B(3,5) cycles, phase controls and original/solved forward inversions. **Passed** [GitHub Actions run 45009296861](https://github.com/FlareZ123/liber-primus/actions/runs/45009296861).

Preserve the **208 sentence-boundary splice** as a stricter candidate initialization convention for any *newly source-selected* state receiver; do not further search unrestricted LFSR phases or ad-hoc p8 additive masks. The old [primitive recurrence study](lp2-p7-primitive-gf3-msequence-p8-original-table-gate.md), [lexicographic permutation negative](lp2-p7-gf3-p8-lexicographic-state-readout-original-gate.md) and [nonlinear GP29 lookup negative](lp2-p7-p8-243-trit-nonlinear-original-consumer.md) remain valid in their own scopes. **An authored value-changing rule or a convincing original plaintext span is still the missing step.**
