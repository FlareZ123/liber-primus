# The 213 unsolved red runes and 43 p55 interior runes form a 256-slot candidate, but the direct grid inverse fails

**Agent 47, 13 November 2026. Classification:** exact original-source geometry and a bounded, source-order, original-cipher test. **No unknown plaintext, author-selected key, decoder, or destination recovered.** The numerical match is a new *candidate grouping*, and it is retrospective.

## The source-defined pieces

The original ink-annotation record has **213 red runes on unsolved physical LP2 pages 0–55**, distributed across **16 red spans**. Its complete-book count is **225**, because the two already-solved pages contribute **five red p56 runes** and **seven red p57 runes**. The red count is independently reconstructible from the exact original page spans in `resources/liber-primus/lp2-ink-annotations.json`, which match the source rune indices in `lp2-corpus.json`.

The original physical **p55 has 76 ciphertext runes**. Its first single rune continues a word from p54; the remaining **75 runes form 16 complete printed words** with lengths `4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3`. Remove each complete word's first and last rune, preserving its remaining order, to obtain **43 strictly interior runes**. Their exact page-local zero-based offsets are:

`2,3,10,11,12,13,16,17,18,19,24,25,26,27,28,29,30,31,32,33,34,37,38,39,40,43,44,49,50,51,52,53,56,57,58,59,60,65,66,67,68,71,74`.

The core is `ᛗᛁᛇᚷᛞᚦᛡᚪᛒᚳᛠᚠᛉᛁᛗᚢᚳᛈᚻᛝᛚᛋᛞᛡᛈᚻᛇᛖᛁᚷᛉᚷᛋᛇᚦᚦᛖᛠᛁᛗᚳᛄᛖ`. The p57 solved phrase “shed our own circumferences; find the divinity within” makes word interiors a plausible human reading. The full 256-cell table occupies LP2 pp49–51.

Thus **213 + 43 = 256**, exactly matching the table's number of numeric cells. The two channels do not overlap. This *does not* prove that the creator selected their concatenation: excluding the solved pages' **12** red runes is a retrospective segmentation choice, and the source never says to concatenate all red runes with p55 interiors or use the 256-cell table on them. Including all 225 red runes would instead give **268** positions.

## Fixed one-stage original-cipher consumers

Define the candidate 256-symbol vector `T` by reading the 213 unknown-region red runes in original physical-page/span order, then the 43 p55 word interiors in printed order. Each glyph is converted to its canonical GP index 0–28. Read the original numeral table as its existing printed 32×8 row-major base60 unsigned bytes `B[0..255]`, and reduce `K[i] = B[i] mod 29`. This is a finite, fully specified source-layout hypothesis with no fitted offset or selected subword.

**Direct table pad:** For `i=0..255`, invert as `D[i]=(T[i]−K[i]) mod29` or `D[i]=(T[i]+K[i]) mod29`. The untouched combined candidate has GP29 coincidence **0.0355085784**. The subtract and add outputs have full-vector coincidences **0.0356004902** and **0.0359068627**. The more relevant 43-rune p55 interiors decode with coincidences **0.0310077519** and **0.0299003322**, below even the original interior's **0.0343300111**. Their complete GP transliterations are:

- Subtract: `XLSNWEAYADEOOEMLATHTHCEOWTHEOEENGIAPMXOEOPBBPCCUEOPIAAEAE`
- Add: `AFNOICEAAJIACIHAEWFCXNJOEHEARTNGJBGMAEEAPWLEATHYHAEEOYJ`

Neither is recognizable original GP-English or a sourced instruction. Exactly **5 of 256** positions already agree with the table's corresponding GP29 residue, which supplies no plain identity map.

**Direct shared polynomial factor:** The table residues, treated as descending GF29 coefficients, are provably divisible by the independently source-linked `H(X)=X²+18X+11` and `G(X)=(X+5)²`. The complete proposed original-rune vector has `T mod H = [1,10]` (constant term first), `(T(24),T'(24))=(11,13)`. Reversing all 256 source symbols yields `T_reverse mod H=[24,0]` and `(T_reverse(24),T_reverse'(24))=(16,4)`. All four necessary conditions for a direct common-factor codeword fail, independently of any plaintext language score. This excludes only the literal complete-vector common-factor interpretation in the specified GP29 field.

A source-native positive control encrypts the first 43 previously solved p57 GP rune indices with the exact last 43 table residues and recovers **43/43** under the inverse. The code also asserts every original red span against the canonical source rune indexes, both original-table factors, the full p55 glyph stream, and the interior counts.

**Reproduction:** [Original-input CommonJS SFT](../sims/lp2_red213_p55inner43_grid256_sft.cjs) (from the repository root run with Node.js 22). It reads all four committed canonical source records and writes no files. Its source was also executed against the committed resource bytes in the research runtime with all assertions passing.

## Alternative complete-book red-ink 256 candidate: 225 + 31

The complete **58-page** original ink record, including the two solved physical pages, contains **225 red GP runes**. It also records **30 red thirteen-dot punctuation marks** and the single final **red twenty-three-dot compound punctuation mark** at p57. These two chosen punctuation classes yield **31** red marker tokens, hence **225 + 31 = 256**. This is a genuinely different 256-slot original-color grouping from 213+43 and removes its exclusion of the 12 solved red runes.

In one possible native GP-index readout, each original red rune contributes its canonical index; a red punctuation of 13 dots contributes index5 (GP-prime weight13) and the terminal 23-dot compound contributes index8 (GP-prime weight23). Sort every token in exact physical-page/source order, with punctuation preceding a rune at the same original offset. This creates exactly 256 tokens with GP29 IoC **0.0493566176**, materially higher than the 213+43 vector **0.0355085784** because 30 red13 markers are forced to index5.

The original 256-cell table's printed row-major bytes, reduced modulo29, match **11/256** of these complete red-ink tokens in place. Direct invertible GP29 subtract/add gives IoC **0.0337316176 / 0.0353860294**, both cipher-like, and the **seven authentic solved red PARABLE glyphs on p57 recover unchanged at 0/7 positions** under either operation. The complete vector is not divisible by the original table polynomial's already source-linked factors: forward `H` remainder **[5,3]**, root24 value/derivative **[15,16]**; reversed `H` **[23,0]**, reversed root24 **[13,19]**. The same source-exact SFT reproduces these results.

This count has **serious alternative-selection ambiguity**. The source also contains **four red ten-dot marks**, which have been excluded, and **one black thirteen-dot mark**, which is excluded by ink color. The terminal twenty-three-dot stencil consists of two visually distinguishable dot clusters rather than a simple ordinary thirteen-dot delimiter. There is no original written instruction to represent either mark by one GP-prime-index token, to exclude the other punctuation types, or to pair these 256 positions with the separate numeral table. It would be incorrect to call the count proof of an intentional 256-symbol message.

**Decision:** both independently organized 256-slot candidates have their exact input and one-stage source-table discriminants published together. The more natural full-book red reading is a stronger *counting lead* than 213+43, while both fail the direct numeral-table GP29 cipher and polynomial-codeword interpretations. Neither recovers unknown plaintext, and exhaustive parameterized searches remain unjustified without a new source-specified opcode.

## Research decision

Both exact 256-slot counts are preserved as possible clues. The full-book red225-plus-red-marker31 candidate joins two visually defined manuscript registers; the earlier red213-plus-p55-interior43 candidate requires a retrospective solved/unsolved split. Its unprompted exclusion of all 12 solved red runes is the main objection. Two natural, lossless grid consumers fail directly on unmodified original symbols. Do not launch offset, alphabet, suffix/prefix or format sweeps from this equality alone. A genuine continuation needs a creator-visible instruction selecting the red-plus-interior object **and** a complete reversible transformation, or a distinctive prediction on still-unfitted original ciphertext.