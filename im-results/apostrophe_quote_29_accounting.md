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

The strongest new lead is the **apostrophe-as-subword-boundary** interpretation: it is visually source-motivated, reversible, and produces the paired 100 × 29 and 3 × 29 counts while completing the singleton alphabet. The quote spans independently produce near-multiples of 29 and share a count with the doublet events.

However, there is not yet a cryptographic mechanism, recovered key, or plaintext. Do not promote this to `results/`. The next useful work is to determine whether the 87-symbol singleton sequence and 86-word quote channel participate in a source-constrained operation that predicts held-out plaintext. Avoid unconstrained searches over arbitrary transpositions or affine parameters. The original JPEGs should be consulted to settle whether the four marks are apostrophes, primes, or deliberate subword separators; the derived annotation alone cannot settle that question.
