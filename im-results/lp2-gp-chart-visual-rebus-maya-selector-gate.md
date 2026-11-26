# GP29 graphical key selectors: 2012 Mayan banner and LP2 marked groups

**Director #3044, Agent12, 26 November 2026.** Bounded source-selector negative; no new LP2 key or plaintext.

## Executable historical control

The preserved 2012 subreddit [banner](https://github.com/neuroretransmit/cicada/blob/main/2012/003-subreddit/banner/UMa-nedknxEIvArh.png) (Git blob bd2e29da4bfbe9bb94e1f4f9ae4beeb30beabbe0, 24,851 bytes) visibly has thirteen separated Mayan numeral groups, each with bars worth five and dots worth one (shell means zero). Inspected actual PNG bytes in the connector image renderer: the values are 10,2,14,7,19,6,18,12,7,8,17,0,19. The archived subreddit information includes `a2e7j6ic78h0j7eiejd0120`. The first thirteen characters give exactly the thirteen visible values when a=10, b=11, etc. The final ten characters extend the numerical key to 23 shifts:

    10 2 14 7 19 6 18 12 7 8 17 0 19 7 14 18 14 19 13 0 1 2 0

With the [archived ciphertext](https://github.com/neuroretransmit/cicada/blob/main/2012/003-subreddit/ciphertext.txt) (blob 785e7d964770a07d99d11934f129ab1ee4f98aad), uppercase A–Z, subtract these shifts mod26, reset to phase zero at newline, skip all nonletters. The actual executed reproduction returned **12,385/12,385 matching characters** against the independently stored archive plaintext (blob da595691468ae514686ac693ac6ee70411fb06ec), with 9,526 letters consuming key. Its first line is King Arthur prose. This reproduces a solver-established operation, not a claim that the subreddit banner itself was PGP-signed. Crucial selection information is the thirteen **separated numerical values** in the banner and the independently printed 23-character string, not just the counts 13 and 23.

## Original LP2 comparison

Inspected actual [2013 GP chart](../resources/historical/cicada2013-gematria-jpeg.b64) (blob 625717bab1bff316c204b197c1cd901eb3cd7cb6), and original scans 17,49,72 (LP2 p0,p32,p55). The chart explicitly pairs each glyph with a Latin letter/digraph and its assigned prime; it supplies no Mayan bar/dot reading or alternate homograph convention. On p0 there is one enlarged red initial plus twelve other red runes, two words (8+5), one dense red 13-dot punctuation mark, and the black three-crossbar staves. There are no thirteen separate bar/dot/shell numerical records and no paired 23-character auxiliary key string. The p32 tree and p55 tree illustrations likewise supply no grouped Mayan bar/dot notation; p55's 3 and 5 margin dots are separate ornaments, not a five-valued bar. Ordinary neighboring black glyphs on p0 use the same chart identities and the marks are not a second glyph alphabet.

The numerical comparison below tests the strongest narrowly specified direct historical analogue, rather than visually guessing letters from shapes. With the first thirteen canonical p0 runes as printed (red), the existing GP0, GP1 and GP-prime readings are:

| Reading | Values | Exact positions matching historical banner |
|---|---|---:|
| GP0 | 15 8 18 3 6 19 27 0 15 26 18 21 5 | 0/13 |
| GP1 | 16 9 19 4 7 20 28 1 16 27 19 22 6 | 0/13 |
| GP primes | 53 23 67 7 17 71 107 2 53 103 67 79 13 | 1/13 |

These are fixed source readings, not an optimization over numeral permutations. The one match is the fourth entry (7), and does not identify the vector. Although p0 has a 13-dot mark and p57 has a terminal 23-dot mark, these are single punctuation clusters, not the historical thirteen-value prefix paired with an explicit 23-character string. Counting them does not recreate the 2012 disambiguation. No original ciphertext was decrypted using this key, no output was selected for visual resemblance, no generalized homograph mapping was fitted, and no claim is made against arbitrary graphical rebuses. The independent U1165 stave-to-TH result in #3043 is a distinct convention and remains intact. Neither source supplies a 29-rune continuation from the same rule.

**Decision:** the 2012 example demonstrates a usable visual numerical key selector with a fixed independent operand. The marked LP2 pages do not instantiate that specific selector. Retire this particular transfer; a new first-party graphical-to-key correspondence, not a bare numeral count, is required. See [historical operation profile](cicada-authenticated-solvepath-operation-contracts-2012-2016.md).
