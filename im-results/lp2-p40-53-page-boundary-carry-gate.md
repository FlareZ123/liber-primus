# p40–p53 page-boundary carry gate

**Classification:** original-image structural correction; no cryptographic plaintext or key recovered.

## Decision

The four apparent one-rune starts on physical p42, p45, p49 and p52 are **cross-page word carries**, not independent one-rune words. This is not a new discovery of the carry mechanism: the repository's canonical continuous parser, sims/lp2_word_pages.cjs, already identifies exactly 32 cross-page words and includes these four. The original JPEGs independently confirm the relevant page-edge layout.

| Boundary | Original archive images | Canonical complete word | Length | Body offset |
|---|---|---|---:|---:|
| p41 → p42 | 58.jpg → 59.jpg | ᛟᛟᚳᛏᛄᛞ | 6 | 496 |
| p44 → p45 | 61.jpg → 62.jpg | ᚱᛗᛞᛋᚳ | 5 | 1315 |
| p48 → p49 | 65.jpg → 66.jpg | ᛇᚠᚢᛞᚣᚪᛚᚠᛡ | 9 | 2400 |
| p51 → p52 | 68.jpg → 69.jpg | ᛈᛚᚠᛈ | 4 | 2558 |

Body offsets count from the first rune after the eight-rune red p40 heading. In each image pair, the preceding page's final line has no printed word separator; the next page begins with one rune followed by the first word separator. This matches the p54 → p55 carry pattern (71.jpg → 72.jpg), whose complete carried word is 11 runes. The p53 → p54 boundary differs: p53 ends with terminal punctuation and the red13 chapter mark, and p54 begins a new red rubric (70.jpg → 71.jpg).

The canonical parser reports 12,956 unknown runes, 2,896 complete words and 32 cross-page words. These four are already included in that 32-word count; do not count them again or split them into separate page-local singleton words.

## Why this does not repair the 14-column tail

A carry changes **word segmentation**, not the set or count of ciphertext runes. The four leading runes complete words begun on the preceding pages; they remain in the p40–p53 body and in any cipher input.

The source counts are:

- p40–p53 contains 3,008 runes including the eight-rune red p40 heading.
- Excluding that heading leaves **3,000** body runes.
- The four carry runes remain in those 3,000 symbols.
- Therefore **3,000 = 14×214 + 4**. The tempting 2,996 = 14×214 count is obtained only by deleting four real ciphertext symbols and is not a valid stream.

The authentic 2014 order [2,8,9,1,12,13,11,4,5,7,3,0,6,10] is a reversible permutation, but the original LP2 source does not define how to place its four-symbol tail. Nor does it select an identity-changing stage after that permutation or provide a blind plaintext prediction. Accordingly, no 14-column transform or alternative tail convention was run. The 14-page count remains an insufficient selector for a complete LP2 decipherment; the independent p40 eight-column clues remain a separate, stronger branch.

## Reproducibility and limits

Run:

    node sims/lp2_p40_53_page_carry_gate.cjs

The script uses the canonical continuous parser, verifies the four exact carried words and their offsets, checks the p54→p55 positive structural control and the p53→p54 punctuation/chapter-boundary contrast, and asserts the 3,000-rune body count. It deliberately does not delete carry runes or execute a transposition. Original visual inputs are resources/liber-primus/58.jpg, 59.jpg, 61.jpg, 62.jpg, 65.jpg, 66.jpg, 68.jpg, 69.jpg, 70.jpg, 71.jpg and 72.jpg.

This result corrects the earlier claim that the four tokens were established standalone words and the arithmetic proposal that their deletion yields a valid 14×214 input. It does **not** establish a cipher key, a 14-column decryption, unknown LP2 plaintext, or a final destination. Reopen the 14-column branch only if an original source rule defines the four-symbol tail and independently selects the next identity-changing operation.
