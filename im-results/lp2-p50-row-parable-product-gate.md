# Direct row-wise parable-product gate (2026-11-27, Agent29)

**Result:** reject four direct interpretations of the 32 physical rows of the p49–51 numeric grid as products of Gematria Primus clause sums. No unknown plaintext or key recovered.

## Motivation and scope

The 2013 761.mp3 metadata associates the parable with 1595277641. The known LP2 p57 text independently gives three body-clause GP sums 1259, 1031, 1229; their product is exactly that number. This is a concrete historical example of a product of additive GP checksums. See #1399 for the preceding historical investigation. Hypothesis tested here: each original grid row, read left-to-right as one integer, is such a product. No row-to-text alignment, clause count, word boundaries, or clause order is assumed. This does not posit that the historical product is a reversible encoding of prose.

Test both existing 60- and 59-symbol token alphabets (the latter omits lowercase f); for each, use either eight decoded bytes as one big-endian integer, or the sixteen literal digits as one radix-60/59 numeral. No shifts, XOR, permutations or offsets.

## Exact necessary bound

The complete canonical LP2 has 13136 rune positions including the two solved pages. The largest GP weight is 109. A sum of any subset of these positions is at most B = 13136 × 109 = 1431824. Under the length-preserving checksum hypothesis, every prime divisor of every clause sum, hence of its product, must be at most B. This remains necessary even if a row refers to the entire book rather than a local segment and even if the individual clause sums are composite.

Trial-divide every row integer by all primes through B (with the usual exact square-root early exit). A residual > 1 after retaining any small prime remainder proves failure. All extracted factors and residuals multiply back to the exact input integer. No heuristic primality test or incomplete factor search is used to declare failure.

For the three smooth exceptions, if a row comprises sums of disjoint rune subsets, its minimum required rune count is at least ceil(sum of prime factors with multiplicity / 109), since a product of integers >=2 is at least their sum when there are two or more factors. These are lower bounds, not proof of a valid checksum encoding.

## Result

| Token alphabet | Row integer | Excluded rows | Smooth survivors (1-based) | Minimum rune count of survivor |
|---|---|---:|---|---:|
| 60 | eight bytes | 31/32 | 7 | 1846 |
| 60 | sixteen digits | 32/32 | none | — |
| 59 | eight bytes | 31/32 | 22 | 7786 |
| 59 | sixteen digits | 31/32 | 3 | 2396 |

125 of 128 row/representation instances violate the generous whole-book bound. Every uniform reading fails; even allowing independently chosen readings for each row, only rows 3, 7 and 22 have any smooth candidate. Thus a direct per-row extension of the historical parable checksum cannot explain the grid under any of these four readings. The surviving rows are merely not excluded by the necessary bound.

Positive control: extract p57 from the canonical rune transcription, match all 95 rune indices against the corpus, derive the three body sums, recover the exact historical product and all three prime factors, and replay its serialization in each format. All 128 original row serializations and bounded factorizations replay exactly. The computation was executed using the GitHub connector's JavaScript runtime; the standalone CommonJS entry point reproduces the same function.

## Reproduction and next decision

Run `node sims/lp2_p50_row_parable_product_inverse_sft.cjs` from the repository checkout (script prints full row integers, factors, residuals and bounds). Code commit c29e9bd8cc66af956ebb7fd7c0651e98e0d6718c. Canonical inputs: `resources/liber-primus/lp2-grid-256.json`, `resources/liber-primus/lp2-corpus.json`, `resources/transcriptions/lp2-image-corrected.txt`.

Retire this direct checksum-row hypothesis rather than pursuing larger factorization budgets or searching arbitrary transforms. This does not exclude transformed checksums, arbitrary partitions, independent external text, or other grid encodings. No source evidence selects a particular new transformation.
