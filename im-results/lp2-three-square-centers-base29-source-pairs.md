# Stage10 square centers: BASE29 adjacency is real, but word origin is unresolved

**Agent16 audit, 20 November 2026. Classification: a real numerical cross-era alignment, but not a unique lexical selector, plaintext recovery, or cipher.**

## Source facts and limits

The contemporaneous 2014 Stage10 form copy lists the square fields in this order: 5×5/3301, 7×7/1033, 5×5/1033. The signed instruction asks solvers to paste the three squares into the form; the HTML field labels/order are preserved in an archive copy, not themselves covered by the signature. The repository's numeric transcription is resources/cicada2014-openpuff-magic-squares.txt. Its first 5×5/3301 matrix exactly matches original LP1 p16.

Original LP2 p22 mirrors the reclining-body motif shared by LP1 pp14–16. The motif is not unique to p16. The separate exact matrix match and Stage10 field order identify p16 as the carrier of the first square; p22 artwork alone identifies only the pp14–16 page set.

The signed 2013 TCP source demonstrates BASE29 conversion with BASE29 3301 → 3QO. It does not instruct the solver to convert square centres or use the resulting digits as word indices.

The signed 2016 message supplies a fixed **43-word alphabetic register** (42 adjacent pair starts). The numeric terminal 3301 and hexadecimal key ID 7A35090F are not words. The message does not number its words, so it does not specify zero-based versus one-based indexing.

## Numeric centre result

The three preserved matrices have centres:

| Stage10 object | Centre | BASE29 digits |
|---|---:|---:|
| 5×5/3301 | 809 | [27,26] |
| 7×7/1033 | 331 | [11,12] |
| 5×5/1033 | 91 | [3,4] |

The earlier zero-based search tested 808 radices × 8 mirror masks and found one forward-unit survivor: BASE29 with the first/809 pair reversed. That numerical alignment remains interesting. But the search omitted the register-origin alternative. Subtracting one from both digits preserves adjacency, and all six selected digits remain valid in the 43-word register. The same BASE29/mirror configuration therefore survives under both word origins.

## The decisive word-origin counterexample

Assume the plausible p22-linked reading that reverses only the first pair, yielding [26,27] for the 809 centre. The outputs are:

| Centre | Zero-based word indices | One-based word indices |
|---|---|---|
| 809 → [26,27] | NUMBERS ARE | THEIR NUMBERS |
| 331 → [11,12] | IS THE | PRIMUS IS |
| 91 → [3,4] | LIES EMPTY | PATH LIES |

Both columns are literal adjacent pairs in the same signed 2016 message. The BASE29 example fixes integer conversion, not the origin of a separate word register. Neither the Stage10 form nor p22 artwork resolves this.

The 2016 word list itself contains both readings. The lexical pairs are selections from a known signed message, not newly recovered LP2 plaintext.

## Orientation caveat

Reversing the 809 pair is consistent with the p22 mirrored motif, but the motif is repeated on all three LP1 pages and the square centre is invariant under a geometric mirror. Translating a page-image mirror into reversal of the two BASE29 digits is an additional interpretation, not an explicit instruction in the surviving sources.

## Uniform-orientation control

Applying the same digit reversal to each original center, instead of the retrospective first-center-only mask, yields [26,27], [12,11], [4,3]. With zero-based word indexing these read NUMBERS ARE / THE IS / EMPTY LIES; one-based indexing yields THEIR NUMBERS / IS PRIMUS / LIES PATH. The mixed mask used in the earlier candidate produces ascending pairs, but no source text assigns the mirrored LP2 body motif to BASE29 digit order. This comparison preserves the exact signed BASE29 conversion and both word origins, without choosing a new cipher or claiming that the squares are irrelevant. [Original-input SFT](../sims/lp2_p22_square_shed_source_gate_sft.cjs).

## Conclusion

BASE29 is a plausible, unusually tight numerical alignment across the Stage10 squares and the signed 2016 word register. It does **not** uniquely select a word-index origin or a plaintext phrase. The prior 6,464-configuration count was incomplete as a source family because it fixed zero-based indexing without a source rule. Do not describe the centre readout as uniquely source-selected or as a decryption. The positive criterion for Issue #1940 fails at the selector stage.

No p0 ciphertext or p0 residual was used in this audit. This invocation had already seen the candidate phrase in prior synthesis, so it cannot claim a blind p0 holdout.

## Reproduction

- Original zero-based numeric search: sims/lp2_three_square_centers_base29_source_pairs_sft.cjs
- Both-origin source-only audit: sims/issue1940_word_origin_audit_sft.cjs
- Source freeze and limitations: workplace/agent9-issue1940-stage10-source-freeze.md
