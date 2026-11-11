# PARABLE page: 95 runes, a 5×19 rectangle, and a 51-cell inner region

**Classification:** source-grounded structural hypothesis plus bounded negative tests. This is not a decryption, a recovered key, or proof that the creator intended this layout.

## Source observations

The final solved LP2 page (physical p57; combined JPEG archive scan 74) contains **95 runes** including the red seven-rune heading `PARABLE`, and **19 body words**. Its first printed line is exactly **19 runes**:

```text
PARABLE LIKE THE INSTAR
```

The remaining 76 runes are exactly four more groups of 19. The source transcription is [`resources/lp2-transcription.txt`](../resources/lp2-transcription.txt), page segment 56; rune indices and prime weights are in [`resources/liber-primus/lp2-corpus.json`](../resources/liber-primus/lp2-corpus.json). The supplied original combined scan is `liber-primus-jpegs/74.jpg`.

A natural 5×19 row-major rendering of those 95 runes is:

| Row | 19 rune transliterations |
|---:|---|
| 1 | `PARABLELICETHEINSTAR` |
| 2 | `TUNNELNGTOTHESURFACEW` |
| 3 | `EMUSTSHEDOUROWNCIRC` |
| 4 | `UMFERENCESFINDTHEDIU` |
| 5 | `INITYWITHINANDEMERGE` |

The first row agrees with the first printed line. The later row boundaries split `WE`, `CIRCUMFERENCES`, and `DIVINITY`; this is an observed consequence of the 19-rune width, not yet an explanation.

The 5×19 rectangle has nested cell counts **44 / 36 / 15**: its outer border contains 44 cells; removing that border leaves a 3×17 interior of **51** cells; removing the next border leaves a 1×15 core. The 1×15 central core after removing the second border is `USTSHEDOUROWNCI`. Separately, the final 15 runes in source order are `YWITHINANDEMERGE`; they occupy the right end of the bottom row, not the geometric centre.

A separate source-visible LP2 feature is the **51-rune red span on p53**, at zero-based page-local rune offset 128. Its exact annotation is in [`resources/liber-primus/lp2-ink-annotations.json`](../resources/liber-primus/lp2-ink-annotations.json), page 53. Its transliteration is:

```text
TPWEOSWBEOTHNHGJRIADIATHAIEOAEXLEOEAIAAJHRTHPDJNGOGFEOMCHDOTCURPN
```

Thus the p57 rectangle's inner area and the p53 red span have the same length, 51. On original combined scan 70 the p53 span is not printed as a 3×17 block: its 51 runes span the final rune of the preceding line plus the next three red lines (1 + 24 + 22 + 4). The match is therefore only a length/area correspondence, not a visible geometric alignment. The inner 3×17 p57 text is:

```text
UNNELNGTOTHESURFACEMUSTSHEDOUROWNCIRMFERENCESFINDTHEDI
```

## Whole-page prime-sum checksum (secondary observation)

The GP-prime weights of all 95 p57 runes, including the heading, sum to **3968 = 128×31 = 2⁷×31**. The factor 128 equals the hexadecimal character count of the solved-p56 64-byte hash documented in [the authoritative synthesis](../results/README.md); this is a possible cross-stage length/checksum clue, not a demonstrated decoding step. The other factor 31 does **not** map to C under the current source-derived 2013 `NUMBER` model: `numberCommand(31)` reverses to 13, which is prime, and therefore returns `+`. Do not turn this factorization into a rune selector without an independent rule. The p57 sum and factorization are reproducible directly from the corpus prime weights.

## Why this is a plausible solve-path hypothesis

The p57 instruction says “like the instar tunneling to the surface” and “we must shed our own circumferences” before “find the divinity within and emerge.” A 5×19 rectangle is a compact way to make “circumferences” literal: peel the 44-cell outer border, then the 36-cell border, leaving a 15-cell core. The exact 51-cell interior also gives a specific place to compare the p53 red span.

There is a possible historical selector, but it must be kept conditional. Existing research records the 2013 `number` operation on the PARABLE prime sum 449 as reversing 449 to 944 and factoring 944 as 16×59. **If** the same reverse-and-factor operation is applied to 59, it predicts 95=5×19. I found no preserved historical server response for a literal `number 59` query; this 95=5×19 step is a derived prediction, not an authenticated instruction. The 95-rune page length and 19-rune first line stand independently of that inference.

The 2016 signed message's “words are the map” / “numbers are the direction” wording is compatible with a map interpretation, but does not specify the 5×19 layout or the p53-to-p57 relation. These clues motivate one bounded test; they do not establish the model.

## Bounded tests and result

1. **Direct 51-symbol correspondence:** the row-major 3×17 interior and p53 red span have only 1 same-position match out of 51, different rune histograms, and no consistent one-to-one monoalphabetic substitution. They are not the same string or a simple transposition/substitution of one another.
2. **Direction-walk test:** interpreting each p53 red rune's GP prime weight modulo 4 as a left / straight / right instruction on the 3×17 interior, starting at its centre, was tested over all four initial headings and both turn polarities. The path exits after only 4–7 visited cells; it does not traverse the 51-cell interior. Absolute direction interpretations using rune ordinal modulo 4 or prime ordinal modulo 4 cycle after three cells. These reject only the stated natural mappings, not every possible use of the red span.
3. **Standard grid reads:** column-major, alternating-row, and clockwise-spiral readings of the full 5×19 array do not produce a second readable text; only row-major preserves the parable.

4. **Direct p53-span additive key:** using the 51 red-span rune ordinals or their GP prime weights modulo 29 as a repeating additive key against the 12,956 unsolved runes (both signs, continuous-book and page-reset clocks) does not improve the language score; all tested quadgram scores are worse than the unmodified ciphertext. This rejects the direct period-51 GP29 key reading, not more complex mechanisms.
5. **2013 NUMBER on the 19 body-word prime sums:** the 19 sums are `184,72,280,339,66,72,246,86,186,232,21,55,451,151,72,376,115,215,300`. Applying the archived NUMBER rule (factor composites; reverse primes and return `+` when the reversal is prime) yields **41 distinct-factor tokens**, one `+` (151), and one factor outside GP29 (113). The count 41 equals the 2014 7×7 square's 41 active NUMBER cells, but the 40 mapped GP tokens do not match its 41-symbol centre-out key (best alignment 6/40). Repeating the resulting 41-symbol key with 113 mapped to zero, dropping 113 for a 40-symbol key, or aggregating factor indices per word into a 19-symbol key all score worse than raw ciphertext under both signs and book/page clocks. Treat the 41-count equality as an observation, not a mechanism. Using the 40 GP factors as compass directions on the 7×7 active-cell map (GP ordinal mod4/mod8 or prime value mod8), starting at the square centre, exits, hits a plus cell, or cycles after only 3–7 visited cells; it does not traverse the 41 active cells.
6. **No plaintext recovered:** the 5×19 layout is a structural observation. It does not by itself decrypt the unsolved pages or identify a key.

## Decision

Retain this as a **candidate human solve path**, not an established mechanism. The strongest reason to keep it is the conjunction of (a) 95 total p57 runes, (b) a 19-rune first printed line, (c) a 5×19 factorization that would follow from the documented reverse-and-factor operation on 59, and (d) a 51-cell inner region matching a source-annotated 51-rune red span on p53.

Do not expand this into arbitrary grid orientations, modular direction alphabets, or cipher menus. A useful successor must supply an independent source clue fixing how the p53 red values act on the 51 interior cells (or another specific reversible operation on the 5×19 map). Until then, the 51-length match remains a potentially meaningful correspondence, not evidence of a key.
