# Apostrophe splitting and 29-based quote accounting

**Status:** intermediate structural hypothesis; no plaintext recovered. The observations below are reproducible from the current canonical transcription and punctuation annotation, but the annotation remains a derived layer: the original page images are authoritative for glyph identity and placement.

## Parse and source events

Using the 55 rune-bearing LP2 page segments, preserving words across line wraps (`/`) and page wraps (`%`), and treating the ordinary punctuation marks as lexical separators gives:

- 12,956 runes
- 2,896 canonical words
- 32 words crossing printed page boundaries
- 83 one-rune words, covering 28 of the 29 GP symbols
- 86 adjacent equal-rune pairs in the flattened rune stream

The annotation records four apostrophes before rune offsets **1110, 5138, 8515, 10089**. Each lies immediately before the final rune of a 3- or 4-rune canonical word:

| Physical page | Canonical word | Proposed split |
|---:|---|---|
| 4 | `ᛗᛉᛁᚹ` | `ᛗᛉᛁ` + `ᚹ` |
| 21 | `ᚫᚩᚣ` | `ᚫᚩ` + `ᚣ` |
| 35 | `ᛈᛖᛏ` | `ᛈᛖ` + `ᛏ` |
| 41 | `ᛉᛚᛄᚳ` | `ᛉᛚᛄ` + `ᚳ` |

This suggests a small, reversible segmentation grammar: an apostrophe is a boundary immediately before the final rune, separating a 2- or 3-rune stem from a singleton suffix. Rejoining each stem and suffix with its original apostrophe exactly restores the canonical token.

## Exact 29-symbol accounting

Applying that rule to all four marks produces:

- **2,900 tokens = 100 × 29**
- **87 singleton tokens = 3 × 29**
- The 87 singleton tokens collectively contain **all 29 GP symbols**.

Before the fourth split, the first three marks give 2,899 tokens and 86 singletons; both are one short of a multiple of 29. The fourth mark supplies the final increment in both counts. Its suffix, `ᚳ`, is also the only GP symbol absent from the original 83 singleton words. The first three suffixes (`ᚹ`, `ᚣ`, `ᛏ`) already occur among the original singleton symbols.

This is a notable alignment, not proof that the marks were intended as spaces. The fourth suffix's symbol occurs as the final rune of 43 of the 1,233 canonical 3- or 4-rune words (3.49%); that is a useful caution against overstating the alphabet-completion observation. The 29-multiple totals follow mechanically once the four observed marks are treated as splits.

## Quote channel

The seven annotated quote intervals have rune lengths:

`18, 19, 12, 58, 68, 160, 70`

Their word counts are:

`4, 5, 2, 14, 13, 34, 14`

Every quote boundary coincides with a complete canonical word. Together the spans contain **405 runes and 86 words**:

- 86 words = 3 × 29 − 1
- 405 runes = 14 × 29 − 1
- 86 quoted words equals the 86 adjacent equal-rune pairs in the complete stream.
- One adjacent equal-rune pair lies inside the quoted intervals; 85 lie outside.

These equalities suggest that quotes may identify a distinct channel, but no one-to-one mapping between quoted words and doublets has been established. The equality of their counts alone is not a mapping.

Two exact length identities invite key hypotheses:

- 12,956 = 32 × 405 − 4 (32 is also the count of cross-page words; 4 is the apostrophe count).
- 12,956 = 149 × 87 − 7 (87 is the proposed singleton-key length; 7 is the quote-span count).

## Quote GP-prime sums as 133-based page/word addresses (11 November 2026)

The original seventh-onion HTML independently supplies the number **133** in its title. For the seven already annotated whole-word quote spans, compute the sum of Gematria Primus **prime weights**, then interpret the quotient upon division by 133 as a zero-based word ordinal and the remainder as a **one-based scan number** in the combined LP1+LP2 75-image archive.

| Span | Runes | Words | Prime sum | Remainder / scan | Quotient / word |
| ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 18 | 4 | 948 | 17 | 7 |
| 2 | 19 | 5 | 1105 | 41 | 8 |
| 3 | 12 | 2 | 738 | 73 | 5 |
| 4 | 58 | 14 | 2684 | 24 | 20 |
| 5 | 68 | 13 | 3335 | 10 | 25 |
| 6 | 160 | 34 | 8042 | 62 | 60 |
| 7 | 70 | 14 | 3388 | 63 | 25 |

All seven coordinates point to existing words. Radix **133** is the **only** integer in the complete feasible domain 2–738 for which all seven pairs are valid combined-archive scan/word addresses. The first two remainders **17 and 41** independently occur as inverse multipliers modulo 58 in earlier source-number work. The third maps to solved *AN END* scan 73, zero-based word 5 (**WEB**); the fifth maps to first-release scan 10, word 25 (a rune spelling of **BELIEVE**). Their known content could constrain a future test. Literal repeating GP29 subtraction with those selected words does **not** recover readable quote plaintext.

**A more constrained source-selected checksum:** The 2014 original LP2 release had **58 JPEG pages**. Exactly **one** of the seven printed quotation spans contains **58 ciphertext runes**, namely span 4 (14 words, prime sum 2,684). Excluding this independently size-selected span leaves six spans with **347 runes / 72 words** whose complete original GP-prime-weight sum is precisely

`948 + 1105 + 738 + 3335 + 8042 + 3388 = 17,556 = 133 × 132 = 133(133−1).`

The six-rune-span complement is therefore divisible by the source-visible title 133, with quotient 132. Equivalently, the sum of all seven quote primes modulo 133 is **24**, exactly the 58-rune quote's own remainder. It is possible that the selected span carries state/control data while the other six form a checksum, but **no such role is confirmed**. The exact original source arithmetic is fixed without choosing an omission from the postcomputed sums.

A **one-million-draw matched original-word/rune-span null** using the six remaining printed length/word-count shapes and seeded xorshift32 initial state 0x13358 yielded **535/1,000,000** draws with exactly 17,556 and **7,544/1,000,000** divisible by 133. The former is a narrow conditional match rate **0.000535**, under this specific preselected source relation. It does **not** account for all other available selections and numerical functions. The same original-input SFT reproduces the counts. Using the 58 original quote runes directly as a **58-period GP29 Vigenère key** for all 12,956 unsolved runes, both signs and whole-book/page clocks, produces no recognizable GP English (IoC 0.03445–0.03453 versus 0.06271 on clear solved p57; scores roughly −7.47 to −7.53 versus −4.42). The complementary one-symbol-per-page Caesar interpretation is likewise language-negative. These finite key tests reject direct use of the 58-rune passage as an ordinary mod29 pad, not its possible role in another explicitly specified architecture.

**Historical and hypothesis-selection caveats:** the publisher's actual 2014 LP2 HTML links were numbered **0.jpg–57.jpg**. The 1–75 combined scan order is a later community archive convention, or one a reader would have to infer by concatenating both releases. The publisher's HTML alone does not specify this. The word index must also be read as zero-based. This is an exact conditional source-number correspondence with no authenticated instruction and no decryption.

A controlled null reselects seven source spans with the **same printed word and rune counts** as the observed spans, independently and with replacement. There are **[232,204,192,128,51,64,80]** eligible spans in the respective matched pools. The exact product of fixed-133 address-valid proportions is **0.00648797**; with 100,000 seeded xorshift32 selections, **634** sets are valid under preselected 133. When permitting the radix to be fitted *after* seeing the seven sums, **24,149** of 100,000 sets are valid under *some* radix. Just one matched set reproduces the independently noticed first two ordered residues (17,41) and has valid addresses for all seven; this sparse tail is exploratory and does not adjust for alternate operations or other selected marks. Reproducer: [source-locked quote address SFT](../sims/lp2_quote133_pageword_source_gate.cjs). **No unknown LP2 plaintext, key, or cipher has been identified.**

## Rejected simple key interpretations

The reproduction script tests the obvious additive mod-29 interpretations:

1. Concatenate the 405 quoted runes as a repeating key and skip one key symbol at each apostrophe.
2. Use the 87 singleton tokens as a repeating key and skip one key symbol at each quote-span start or end.
3. Use one singleton or doublet rune as a Caesar shift for each of the 86 quoted words.
4. Use first differences of the singleton sequence as the 86 per-word shifts.

Both signs are tested. None produces recognizable English; the English quadgram score does not support plaintext recovery. These tests reject only these simple additive constructions, not every possible use of the marked material.

Reproduce with:

```sh
node sims/apostrophe_quote_29_accounting.cjs
```

The script asserts the counts and prints the exact language-model scores and candidate previews. Its scoring uses `resources/control/duko_round27_english_quadgrams.txt` and the corpus's GP transliteration; treat that score as a heuristic, not a proof of non-plaintext.

## Assessment and next decision

Two unproven source operations remain: the reversible **apostrophe-as-subword-boundary** split produces paired 100 × 29 and 3 × 29 counts; the quote GP-prime sums have a source-selected **58-rune exclusion → six-span 133×132 checksum**. A further quote → 133-division page/word mapping additionally depends on later combined 75-scan numbering.

However, there is not yet a cryptographic mechanism, recovered key, or plaintext. Do not promote this to `results/`. The next useful work is a historically motivated, source-fixed operation that predicts plaintext from the quoted spans or the seven selected source words. Direct GP29 repeating-word keys fail. Avoid postselected moduli, freely chosen transformations and arbitrary transpositions. The original JPEGs should be consulted to settle whether the four marks are apostrophes, primes, or deliberate subword separators; the derived annotation alone cannot settle that question.
