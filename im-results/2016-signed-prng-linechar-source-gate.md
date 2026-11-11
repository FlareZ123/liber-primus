# 2016 signed-message PRNG line:character gate (Issue #174)

**Decision, 11 November 2026:** the 16-word readout is exactly reproducible, but its word-to-coordinate operation is not independently source-selected. The apparent `PRNG` in “map their meaning” is a conditional substring rather than an authenticated cipher instruction. The issue's source gate is negative. No original unknown-LP2 plaintext, PRNG family, key or seed follows.

## Reproduction on original transcription

Run `node sims/2016_signed_prng_linechar_gate_sft.cjs` from the repository root. Inputs are `resources/historical/cicada2016-4gq25-outguess.asc` (signed 2016 text), `resources/lp2-transcription.txt` (printed line separations), and `resources/liber-primus/lp2-corpus.json` (GP alphabet/primes). The source text's 43 alphabetic words exclude the digit-containing verification key ID; signed PGP text was independently verified in `resources/cicada2016-4gq25.md`. The SFT checks all 16 instruction words and all 43 signed words on unchanged ciphertext.

The candidate transcribes each signed-message English word with **longest-first GP tokenization** (K→C, V→U), adds its GP prime weights to `S`, then writes `S=29q+r`. It addresses one-based **printed LP2 line r+1, rune q+1** globally from physical p0 onward, ignoring print separators and punctuation.

| 2016 word | Prime sum S | q,r | Remainder-line address | Result |
| --- | ---: | --- | --- | --- |
| MAP | 211 | 7,8 | line9 / rune8 | P |
| THEIR | 114 | 3,27 | line28 / rune4 | R |
| MEANING | 319 | 11,0 | line1 / rune12 | NG |

The exact 16-word output is `L C B P P R NG NG P A R R TH B P C`; the contiguous output `P R NG` spells PRNG in GP transliteration. Extending **the same frozen operation** to all 43 signed words yields `E P M C M AE OE P M E EA NG P S L C B P P R NG NG P A R R TH B P C I R EA N N AE P J Y B EO O S`. There is no coherent second instruction or independently identifiable seed in that full output.

## Independent address and spelling controls

1. **Ordinary high-to-low quotient/remainder assignment:** interpreting `q+1` as line and `r+1` as character, the other natural base-29 orientation, gives `OOB W Y IA NG OOB T OOB IA X R OOB OE Y IA D` on the exact same 16 words. Four lookups fall outside their physical lines. Therefore the formula is not a convention-free line:character reading; the successful mapping requires the opposite assignment.
2. **Counting word-separator slots:** keeping one position for each printed word separator and stop instead of deleting every nonrune gives `L U W P X R E - P B OE R F W P -`. The PRNG substring disappears. This is a literal position-counting control, not an assertion that the manuscript prints ASCII hyphens.
3. **English-to-GP token ambiguity:** `MEANING` as `M EA N I NG` has sum319 and yields NG. Splitting the written English EA into E + A while keeping NG gives sum374 and **line27/rune13 = D**. The 2016 signed message does not explicitly freeze longest-first GP spelling of ordinary Latin words; a chosen spelling convention affects the claimed operator name.
4. **Source antecedent:** “Liber Primus is the way. Its words are the map.” The nearest referent of “Its” is Liber Primus. Feeding the **signed message's own 16/43 words** into LP2 is a researcher-specified choice, even though the words are authenticated.

These are independently checkable alternatives to the **lookup rule**, not a phase or seed search. The three-word match is genuine conditional arithmetic and original-ciphertext indexing; the source does not select the indexing direction or punctuation and spelling policy.

## Historical instruction gate

The documented first Cicada book codes are **explicit coordinate records**, with source selection supplied separately. The 2012 extracted Mabinogion code prints `1:20`, `2:3`, etc. and its archived explanation interprets first index as line, second as character; the text source is supplied through a Reddit literary clue ([historical transcript](https://github.com/scream314/cicada3301/blob/master/2012.md#the-duck-decoy-caesar-and-outguess)). The 2013 PGP-signed book code states that it *is* a book code, gives a literary riddle and directly prints `I:1:6`, `I:2:15`, etc. ([archival transcript](https://github.com/scream314/cicada3301/blob/master/2013.md)). The 2014 GEB book code uses explicit `chapter:line:word:letter` tuples ([historical transcript](https://github.com/scream314/cicada3301/blob/master/2014.md)). GP prime sums were genuinely used in 2014 (for example `Patience is a virtue`→761), but those numbers were not generally promoted to implicit line/character addresses.

Thus historical source practice supports **the possibility** of a book code and a prime-sum operation, while providing no original instruction that combines word-sum base29 remainder with printed-line/rune offsets and no reason to privilege the required reverse-order assignment. The independently signed 2013 BASE29 command provides numeral syntax, not this LP2 address grammar.

## Research disposition

Do **not** attach any PRNG implementation or search a 13-token remainder for seeds on the evidence of this substring. The full-message and wrong-convention controls do not independently distinguish a historical random generator. The strongest missing source input is an authenticated instruction defining **word source, English→GP tokenization, rune-only line character counting, and quotient/remainder coordinate orientation**. If such a source emerges, the fixed readout is available for an untuned original-cipher test. Otherwise close #174 as an unsupported selector and redirect effort to genuinely source-selected original-cipher inverses.

This is a bounded rejection of one conjectured selector, not a mathematical exclusion of all PRNG-based encipherments.
