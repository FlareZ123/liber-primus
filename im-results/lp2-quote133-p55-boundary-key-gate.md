# Quote-133 address runes do not decode the p55 circumference

**Agent42, 13 November 2026. Bounded source-constrained cross-link negative. No unknown LP2 plaintext, authentic key, complete cipher inverse, or destination recovered.**

## Human-solve hypothesis

The existing [quote-133 address report](lp2-quote133-pageword-address.md) records seven quotation spans whose GP-prime sums, divided by the historical Onion7 HTML title **133**, yield seven valid addresses in the later combined 75-scan LP1+LP2 archive. Two selected words are controls: LP1 scan 10, word 26 is **TWO**; solved LP2 p56 scan 73, word 6 is raw **WLAE**, which the independently established p56 inverse renders **WEB**. The seven selected words concatenate to **33 GP runes**.

Original LP2 p55 has **76 runes**: one incoming carry rune completing the previous page's word, followed by 16 complete printed words. Taking the carried word's final on-page rune and the first/last rune of each p55 word gives **33 exterior runes**; the strict word interiors contain **43 runes**. The source p55 geometry file and canonical 76-rune corpus agree exactly.

A plausible cross-link is to use the 33 quotation-addressed runes as a GP29 key for the 33 p55 exterior runes, or as a repeating key for the 43 p55 interior runes. Historical 2014 Stage04 used subtractive GP29 Vigenère, and LP1 p5 explicitly calls primes and the totient sacred. This makes a direct additive/totient test reasonable, but **no original source instructs the player to combine these streams**. The title-133 addressing remains a hypothesis and uses the later combined archive order, not the original Onion7 58-image numbering alone.

## Frozen inputs

| Quote | Combined scan | Word | Runes |
|---:|---:|---:|---:|
| 1 | 17 (LP2 p0) | 8 | 4 |
| 2 | 41 (LP2 p24) | 9 | 5 |
| 3 | 73 (LP2 p56) | 6 | 3 |
| 4 | 24 (LP2 p7) | 21 | 8 |
| 5 | 10 (LP1 p10) | 26 | 3 |
| 6 | 62 (LP2 p45) | 61 | 2 |
| 7 | 63 (LP2 p46) | 26 | 8 |
| **Total** | | | **33** |

Quote-address key:
~~~text
H B N IA | G L F S H | W L AE | C H OE EA N P C TH | T W O | C J | E T U H P C TH S
~~~

P55 exterior:
~~~text
NG AE W S B X M S AE F U W R B EO M F B C EO E EA S E S TH OE C X D U B I
~~~

P55 interior:
~~~text
M I EO G D TH IA A B C EA F X I M U C P H NG L S D IA P H EO E I G X G S EO TH TH E EA I M C J E
~~~

## Decisive tests and results

The reproducer asserts the 2014 HTML title 133 and 58 image IDs, all seven prime sums and addresses, the selected source words, the 76 p55 glyphs against both the canonical corpus and original-image coordinate list, and the 33/43 position partition.

All operations are fixed at the natural first symbol; no rotations, phases, offsets, or word permutations are searched.

1. Direct GP29 additive Vigenère in both signs on the 33 exterior and 33 quote-key runes, plus the additive counterpart.
2. The quote key repeated over the 43 p55 interior runes, in both signs.
3. Prime-value and prime-minus-one/totient remappings of the quote-key runes, applied to exterior and interior.
4. Five-bit XOR of aligned GP29 indices.

Neither direct additive direction produces readable plaintext. The exterior-minus-key output begins with **P H IA** (transliterated “PHI”), but the remaining 30 tokens are nonlinguistic; this isolated prefix is not evidence for a totient decode. The reverse subtraction, additive output, repeated-key interior outputs, and prime/totient variants are also nonlinguistic. Five-bit XOR produces **29** and **30** at positions **0** and **11**, outside GP29.

The standalone Node 22 reproducer preserves the exact original indices, page-local positions, full token outputs, and an arithmetic round-trip positive control: [lp2_quote133_p55_boundary_key_gate.cjs](../sims/lp2_quote133_p55_boundary_key_gate.cjs).

## Decision

**Reject only this direct quote-address-to-p55 transfer family.** The 33-to-33 length match does not identify an operation, and the source-natural GP29 additive/totient and 5-bit XOR tests recover no plaintext. Do not rescue the result with rotations, offsets, arbitrary permutations, alternate alphabets, or further arithmetic layers absent an independent original clue.

This does **not** disprove the quote-133 page/word-address hypothesis, the p55 word-circumference instruction, or a different independently specified operation. This report adds only the tested cross-link and its negative result.
