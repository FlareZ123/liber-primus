# Agent24: p0 marker → p50 coordinate → 2016 word-map candidate

Status: **unvalidated navigation hypothesis; no LP2 plaintext recovered.** Please assess whether this merits a bounded independent test rather than extending it by analogy.

## Frozen inputs

The existing p0 square-state/Rise report establishes a source-selected row-difference readout, sorted by RISE:

- 2016 signed-message word indices: **[15, 18, 20, 26]**
- Corresponding authenticated source words and lengths: **WORDS(5), MAP(3), MEANING(7), NUMBERS(7)**

The p50 numerical page is a **32×8 row-major table**. A natural book-map interpretation of “its words are the map” is to use each source word's zero-based word index as the table row and its one-based word length as the column. The four selected cells are:

| Source word | Table coordinate (row, column) | p50 value |
|---|---:|---:|
| WORDS (index 15, length 5) | (15,5) | 13 |
| MAP (index 18, length 3) | (18,3) | 92 |
| MEANING (index 20, length 7) | (20,7) | 250 |
| NUMBERS (index 26, length 7) | (26,7) | 251 |

The raw values are strictly increasing; the last two are consecutive. Reducing by the authenticated message's 43-word count gives **[13, 6, 35, 36]**, which index the same signed message at **WAY, SEEKS, FOUND, GOOD**. They are also valid LP2 page numbers (p13, p6, p35, p36).

## Why this is worth a look

The chain uses independently visible structure at each step: the p0 marker's established four-word readout, the p50 32×8 table shape, source word indices/lengths, and the signed message's 43-word count. The output words are thematically relevant and the resulting page addresses are in range. This may be a compact interpretation of “words are the map; numbers are the direction.”

## Strongest objection / controls

This is **not** a decryption. The row/column convention and the mod-43 reduction still need independent validation. Other unselected p0 channels and off-by-one/direct-offset controls also yield plausible-looking source-word fragments, so semantic resemblance alone is not evidence. The selected difference channel is better motivated than those controls because the p0 report independently selects it (all four indices fall in the central instruction interval), but that does not validate the table consumer.

A decisive follow-up should freeze a prediction on p13/p6/p35/p36 before looking for matches: e.g. a specific structural relation, marker, or reproducible page-local output implied by the four page labels. Do not expand into arbitrary permutations, alternate moduli, or word reordering. If no such prediction can be stated from the source, retire the branch.

## Reproduction inputs

- `im-results/lp2-p0-square-state-rise-key-serializer.md`
- `resources/liber-primus/lp2-grid-256.json`
- `resources/historical/cicada2016-4gq25-outguess.asc`

Direct calculations: table offsets **[124,146,166,214]**, values **[13,92,250,251]**, modulo-43 source indices **[13,6,35,36]**.
