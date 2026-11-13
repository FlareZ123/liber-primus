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

## Research decision

The exact 213+43 count is worth preserving as a possible clue because it combines two visually distinguishable manuscript registers with the otherwise unexplained 256-slot grid. Its unprompted exclusion of all 12 solved red runes is the main objection. Two natural, lossless grid consumers fail directly on unmodified original symbols. Do not launch offset, alphabet, suffix/prefix or format sweeps from this equality alone. A genuine continuation needs a creator-visible instruction selecting the red-plus-interior object **and** a complete reversible transformation, or a distinctive prediction on still-unfitted original ciphertext.