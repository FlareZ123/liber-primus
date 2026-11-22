# Quote-prime sums as 133-based page/word addresses

**Status:** intermediate source-constrained hypothesis; no unknown LP2 plaintext recovered  
**Reproduction:** sims/lp2_quote133_pageword_source_gate.cjs

## Proposed human solve path

The manuscript visibly marks seven quotations. LP1 page 5 explicitly calls the primes and the totient function sacred. The original 2014 Onion7 index has HTML title **133** and presents the 58 LP2 image IDs. A solver could therefore:

1. Convert each rune in each marked quotation to its Gematria Primus prime value and sum the values.
2. Treat the historical title 133 as a radix.
3. Divide each sum by 133, reading the remainder as a page address and the quotient as a zero-based word ordinal.
4. Resolve the page addresses against a combined archive containing the 17 LP1 images followed by the 58 LP2 images.

This is a plausible human route, not an authenticated instruction. In particular, the combined 75-image numbering is later than the original LP2-only Onion7 index.

## Exact source-derived arithmetic

The seven quote prime sums are:

[948, 1105, 738, 2684, 3335, 8042, 3388]

Across radices 2 through 738, **133 is the only radix for which all seven quotient/remainder pairs point to an existing page and an in-range word** when words are parsed with their actual printed boundaries.

| Quote | Rune length | Prime sum | Sum ÷ 133 | Combined page | Resolved source page | Word |
|---:|---:|---:|---:|---:|---|---:|
| 1 | 18 | 948 | 7 r 17 | 17 | LP2 p0 | 8 |
| 2 | 19 | 1105 | 8 r 41 | 41 | LP2 p24 | 9 |
| 3 | 12 | 738 | 5 r 73 | 73 | LP2 p56 | 6 |
| 4 | 58 | 2684 | 20 r 24 | 24 | LP2 p7 | 21 |
| 5 | 68 | 3335 | 25 r 10 | 10 | LP1 p10 | 26 |
| 6 | 160 | 8042 | 60 r 62 | 62 | LP2 p45 | 61 |
| 7 | 70 | 3388 | 25 r 63 | 63 | LP2 p46 | 26 |

The unique 58-rune quotation is quote 4. The other six prime sums total **17,556 = 133 × 132**. In source order, the first three sum to **2,791 = 21 × 133 − 2** and the last three to **14,765 = 111 × 133 + 2**. These exact relations are part of the same selected quote family, not independent confirmations.

## Correct word-boundary interpretation

The original script extracted every contiguous run of runes as a word. That incorrectly split words at printed line wraps. For example, the LP1 p10 transcription wraps parts of CIRCUMFERENCE and THREE across lines. A word parser must ignore slash markers and whitespace, close words on the manuscript's word/punctuation delimiters, and keep a page-crossing word assigned to the page where it begins. The corrected implementation follows the same start-page convention used by sims/lp2_word_pages.cjs.

This correction changes the second solved-page control:

- Combined page 10, word 26 is **TWO** on LP1 p10. It is not BELIEVE; BELIEVE was a line-fragment artefact.
- Combined page 73, word 6 is the raw ciphertext word ᚹᛚᚫ. The established p56 inverse recovers **WEB** there; the preceding fifth word is **DEEP**.

Thus the address map has one distinctive known plaintext anchor, **DEEP WEB**, and a second ordinary known-page control, **TWO**. It does not yet recover any unknown word.

The five unresolved addressed words, in quote order, are raw rune strings:

- LP2 p0, word 8: ᚻᛒᚾᛡ
- LP2 p24, word 9: ᚷᛚᚠᛋᚻ
- LP2 p7, word 21: ᚳᚻᛟᛠᚾᛈᚳᚦ
- LP2 p45, word 61: ᚳᛄ
- LP2 p46, word 26: ᛖᛏᚢᚻᛈᚳᚦᛋ

The seven selected words contain 33 runes in total. That happens to equal the 33 exterior runes counted on p55, but the equality alone does not specify a cipher or key operation.

## Conditional matched-window checks

The reproduction script compares each source quote with windows in the unknown LP2 transcription having the same rune length and word count. The seven pools contain **232, 204, 192, 128, 51, 64, and 80** windows.

With the corrected page-word parser:

- In 100,000 independent draws (xorshift32 seed 0x13413331), 11,515 draws admitted some common radix in the tested range; 215 made all seven addresses valid specifically at 133; none also reproduced the first two page residues 17 and 41.
- In 1,000,000 six-quote draws (seed 0x13358), 535 matched the exact sum 17,556 and 7,544 were divisible by 133.
- In 2,000,000 source-ordered triad draws around the unique 58-rune quote (seed 0x133581), 125 matched the −2/+2 residue balance and 7 matched both that balance and the exact total.

These are conditional matched-window experiments, not global p-values. The quote family, title, archive order, and test statistics are not a preregistered independent sample. They make the pattern worth retaining, but do not establish creator intent.

## What this does and does not establish

**Established:** the seven source-marked quote spans have the listed GP-prime sums; 133 is the unique tested radix giving seven in-range page/word coordinates under the corrected parser; the p56 address lands on the already-solved word WEB.

**Not established:** that the creator intended quotient/remainder addressing; that the combined 75-page numbering was available or intended at the relevant stage; that the five unresolved addressed words are plaintext; or that the addresses supply a key for the remaining manuscript.

The strongest objection is the missing source instruction connecting quote-prime sums to quotient/remainder page/word addressing in the combined archive. The next useful test is to find an independent, historically available clue for that exact operation or to use the five fixed word positions only within a separately source-selected cipher mechanism. Do not broaden this into unconstrained radix or key hunting.
