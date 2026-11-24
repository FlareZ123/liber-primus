# Phone-keyed 10-columnar transfer into the p56 prime/totient cipher: exact negative

## Question and source-constrained route

A recent cross-round observation combines the 2014 Stage11 HTML metadata with LP2:

- The original HTML has `title=133`, `div id=331`, and 58 image entries (`resources/historical/cicada2014-onion7-index.html`).
- Reducing 133 and 331 modulo 58 selects LP2 pages 17 and 41. Both have 273 runes; reducing the original values modulo 273 selects 1-based positions 133 and 58. Those runes are I and NG.
- Standard telephone-keypad/T9 mapping gives I → 4 and NG → 64, concatenating to 464 = 133 + 331.
- Six LP2 pages, not just p17 and p41, have 273 runes. On the two selected pages, 256 position pairs produce the same T9 concatenation 464. The selected I/NG pair is therefore a candidate selector checksum, not a unique plaintext crib.
- Original p41 (scan 58) has ten decorative dot positions, eight filled and two outlined. The 2012 Cicada phone number 2143909608 has eight nonzero and two zero digits. The count matches, but the exact dot traversal is not source-fixed.
- p41 has 60 complete body words, exactly six rows of ten. This suggests a testable 10-column interpretation of the ten-dot/ten-digit motif. A 10-column transposition is also a recognizable operation from the earlier 2014 round.
- The sum 464 also selects the 464th prime, 3301. The solved p56 cipher supplies a source-authenticated φ(prime) mod 29 substitution with plaintext F transparent.

The bounded hypothesis tested was therefore: use the 2012 phone number as a stable-ranked 10-column key, invert a 10-column transposition, then invert the authentic p56 φ(prime) cipher starting at the 464th prime (zero-based key pointer 463, prime 3301). Test both word and rune transposition units, and both ascending and descending digit-rank column order. Preserve p41's unworded prefix/suffix fragments outside the word-level transposition.

## Reproducible implementation

Run from the repository root:

```sh
node sims/lp2_phone10_columnar_phi464_gate.cjs
```

The script reads only the canonical corpus, transcription, English word-frequency list, and original 2014 Stage11 HTML. It verifies the 12,956-rune/2,896-word corpus, derives the selectors from the HTML, verifies the p56 85/85 known-plaintext positive control, and runs a synthetic 60-word/273-rune positive control with the same page geometry. The synthetic control confirms the columnar inverse and F-transparent prime/totient inverse are capable of recovering a full 60/60 dictionary path with exact forward replay.

## Results

| Selected page | Phone-key column order | Word-level inverse | Rune-level inverse |
|---|---|---|---|
| p41 | ascending digit-rank | no path; first dead at chunk 7 / rune 29 | no path; first dead at rune 47 |
| p17 | ascending digit-rank | no path; first dead at chunk 2 / rune 4 | no path; first dead at rune 84 |
| p41 | descending digit-rank | no path; first dead at chunk 8 / rune 33 | no path; first dead at rune 54 |
| p17 | descending digit-rank | no path; first dead at chunk 2 / rune 6 | no path; first dead at rune 1 |

The phone-number key's stable ascending column order (zero-based) is:

`[5, 8, 1, 0, 3, 2, 7, 9, 4, 6]`

The reverse read order is also tested. The 464th prime is 3301, and φ(3301) mod 29 = 23. All four original-data variants fail exact F-transparent reachability; this is stronger than merely obtaining poor English scores.

## Assessment

**Reject this fixed composition.** The candidate has a coherent human-solver motivation, but neither the 10-column word/rune transposition nor the source-derived p56 prime/totient clock produces a complete inverse on either selected page under the two standard column-read directions.

This does not disprove the 133/331 selector checksum, nor does it exclude every possible use of the p41 phone motif. It does exclude the tested 10-column phone-keyed transposition followed by the p56 φ(prime) cipher at prime 3301. Do not rescue this branch by searching arbitrary phases, alternate digit rankings, or unrelated keypad transforms without a new first-party instruction.

## Relationship to existing work

- The p41 phone-digit F-transparent additive family is already excluded in `im-results/lp2-p41-phone-digitpattern-ftransparent-anchor-gate.md`; this test addresses a distinct transposition receiver.
- The p56 prime/totient/F-transparent operation is validated on its own page and across prior all-secret transfer gates; this test adds the phone-derived 10-column transposition before that operation.
- The historical 2014 14-column transposition is documented in `im-results/cicada2013-twitter-2014-column14-original-inverse.md`. This experiment does not claim that the 10-digit phone key was used in that earlier stage; it tests a new LP2 transfer hypothesis.
- The 133/331/464 arithmetic has prior audits in `im-results/2014-stage11-133-331-prime464-original-gate.md` and `im-results/lp2-html133331-period464-allsecret-original-wordshape-gate.md`. The T9 selector relation is retained as a provisional checksum only.

No plaintext, authentic key, or established LP2 mechanism is recovered by this experiment.
