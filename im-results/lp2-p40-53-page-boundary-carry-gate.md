# p40–p53 page-boundary carry gate

**Classification:** original-image structural correction; no cryptographic plaintext or key recovered.

## Decision

The four apparent one-rune starts on physical p42, p45, p49 and p52 are best read as **word carries from the preceding page**, not as independent one-rune words. The original page images show the same boundary form in all four cases:

| Boundary | Original archive images | Previous page ending | Next page beginning |
|---|---|---|---|
| p41 → p42 | 58.jpg → 59.jpg | final line has no printed word separator | one rune, then the first word separator |
| p44 → p45 | 61.jpg → 62.jpg | final line has no printed word separator | one rune, then the first word separator |
| p48 → p49 | 65.jpg → 66.jpg | final line has no printed word separator | one rune, then the first word separator |
| p51 → p52 | 68.jpg → 69.jpg | final line has no printed word separator | one rune, then the first word separator |

This is the same page-edge pattern as p54 → p55 (71.jpg → 72.jpg), whose leading rune is already treated as a carry. The p53 → p54 boundary is a useful contrast: p53 ends with terminal punctuation and the red13 chapter mark, and p54 begins a new red rubric. Archive filenames map to LP2 physical pages by filename index = page + 17, as documented in resources/liber-primus/README.md.

The canonical transcription independently encodes the same distinction: the four preceding page-final lines do not end in a word-separator hyphen or sentence period, and each following page begins with exactly one rune before its first separator. The p54 → p55 control has the same form; p53 → p54 ends with a period. The accompanying SFT checks these transcription conditions and the exact rune counts. The image comparison is a manual inspection of the original JPEGs, not an OCR claim.

## Why this does not repair the 14-column tail

A carry changes **word segmentation**, not the set or count of ciphertext runes. The four leading runes remain part of the p40–p53 body; they complete words begun on the preceding pages. They cannot be deleted from a transposition input.

The source counts are:

- p40–p53 contains 3,008 runes including the eight-rune red p40 heading.
- Excluding that heading leaves **3,000** body runes.
- The four carry runes remain in those 3,000 symbols.
- Therefore **3,000 = 14×214 + 4**. The tempting 2,996 = 14×214 count is obtained only by deleting four real ciphertext symbols and is not a valid stream.

The authentic 2014 order [2,8,9,1,12,13,11,4,5,7,3,0,6,10] is a reversible permutation, but the original LP2 source does not define how to place its four-symbol tail. Nor does it select an identity-changing stage after that permutation or provide a blind plaintext prediction. Accordingly, no 14-column transform or alternative tail convention was run. The 14-page count remains an insufficient selector for a complete LP2 decipherment; the independent p40 eight-column clues remain a separate, stronger branch.

## Reproducibility and limits

Run:

    node sims/lp2_p40_53_page_carry_gate.cjs

The script verifies the transcription's page-boundary pattern, the p54→p55 positive structural control, the p53→p54 punctuation/chapter-boundary contrast, and the 3,000-rune count. It deliberately does not delete carry runes or execute a transposition. Original visual inputs are resources/liber-primus/58.jpg, 59.jpg, 61.jpg, 62.jpg, 65.jpg, 66.jpg, 68.jpg, 69.jpg, 70.jpg, 71.jpg and 72.jpg.

This result corrects the earlier claim that the four tokens were established standalone words. It does **not** establish a cipher key, a 14-column decryption, unknown LP2 plaintext, or a final destination. Reopen the 14-column branch only if an original source rule defines the four-symbol tail and independently selects the next identity-changing operation.
