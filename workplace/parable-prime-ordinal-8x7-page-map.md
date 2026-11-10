# PARABLE prime-ordinal page map: an 8×7 quotient and five-page anchor graph

**Status:** source-derived structural hypothesis; no plaintext recovery yet.

The p57 `PARABLE` and the 2013 `PARABLE` audio number jointly yield a compact page-navigation structure that does not appear in the current synthesis. The derivation is reproducible in [`sims/parable_prime_8x7_page_map_probe.cjs`](../sims/parable_prime_8x7_page_map_probe.cjs). It is worth preserving as a human-solve-path candidate, but it must not be promoted to an established cipher or decryption.

## 1. Three clause sums and their prime ordinals

The three runic clauses on LP2 p57 have Gematria Primus prime-value sums:

| Clause | Sum | One-based prime ordinal |
|---|---:|---:|
| “Like the instar tunnel to the surface” | 1259 | 205 |
| “We must shed our own circumferences” | 1031 | 173 |
| “Find the divinity within and emerge” | 1229 | 201 |

The product is exactly the 2013 audio number:

`1259 × 1031 × 1229 = 1,595,277,641`.

The clause order is important. The prime ordinals are **205, 173, 201**.

## 2. The 8×7 quotient

Across all LP2 pages 0–57 there are 31 thirteen-dot marks (30 red and one black), hence 32 fragments if each mark is treated as a separator. The distribution is 28 marks on pages 0–55, two on solved p56, and one on solved p57. This is therefore a whole-artifact count, while the 56-cell target below is the unsolved p0–55 section; that scope mismatch is a caveat, not something to conceal. Gematria Primus has 29 symbols, of which 28 have nonzero numeric values. The dimensions 32 and 28 have gcd 4.

There are also four red 10-dot marks across LP2, matching the gcd numerically. However, their global offsets have residues 1,2,2,1 modulo 4, so they do not independently identify all four residue classes.

All three prime ordinals are 1 modulo 4. Their residues therefore descend to a common 8×7 quotient:

`row = ((n mod 32) − 1) / 4`

`col = ((n mod 28) − 1) / 4`

`page = 7 × row + col`

| Prime ordinal | n mod 32 | n mod 28 | Quotient coordinate | LP2 page |
|---:|---:|---:|---:|---:|
| 205 | 13 | 9 | (3, 2) | **23** |
| 173 | 13 | 5 | (3, 1) | **22** |
| 201 | 9 | 5 | (2, 1) | **15** |

The quotient has exactly 56 cells, matching LP2 pages 0–55. The page map is row-major:

```text
 0  1  2  3  4  5  6
 7  8  9 10 11 12 13
14 15 16 17 18 19 20
21 22 23 24 25 26 27
28 29 30 31 32 33 34
35 36 37 38 39 40 41
42 43 44 45 46 47 48
49 50 51 52 53 54 55
```

The three anchors are a right-angle path: **p23 → p22 → p15**, first one column left, then one row up. This is exact arithmetic, not an inferred decryption.

## 3. A second page index from the factor values

The three clause sums reduced modulo the 56-page count give:

`[1259, 1031, 1229] mod 56 = [27, 23, 5]`.

Pairing each factor residue with its ordinal-derived page produces three directed links:

| Clause factor | Factor mod 56 | Ordinal-map page | Candidate link |
|---:|---:|---:|---|
| 1259 | 27 | 23 | p27 → p23 |
| 1031 | 23 | 22 | p23 → p22 |
| 1229 | 5 | 15 | p5 → p15 |

The union is the five-page set **{5, 15, 22, 23, 27}**. Page 23 is independently selected by the second factor residue and the first prime ordinal.

This five-page set has unusually suggestive source features:

- **p5:** spiral ornamentation in the original scan.
- **p15:** the Fibonacci prime spiral.
- **p22:** the blade/body illustration.
- **p23:** the five-dot motif.
- **p27:** the red 19-rune span and the repeated word-pair relationship with p55.

The p57 Parable page itself has one 23-dot punctuation mark. The three ordinal-selected pages p15, p22, and p23 contain respectively 3, 1, and 1 thirteen-dot marks: **five in total**, matching the five-dot motif on p23. This is suggestive cross-page structure, not proof that the marks encode the map. The counts 3 selected pages, 5 marks, and 8 quotient rows also form the Fibonacci triple 3–5–8, while p15 carries the Fibonacci prime spiral. Because the pages and marks are inspected after selecting the anchors, treat this as a suggestive consistency check rather than independent statistical evidence.

Page 27 and page 55 share the already documented two-word sequence. They are exactly 28 pages apart; in the 8×7 map they occupy the same column, in rows 3 and 7 (opposite rows). The value 28 is also the number of nonzero GP symbols.

## 4. A 55-rune red key candidate

One candidate 55-symbol red sequence is obtained by taking the red spans on the red-bearing nodes p27, p23, and p15, in the order suggested by the factor/ordinal page graph. This selection is not uniquely forced: p23 participates in two clause links, and other orders of the selected pages are possible. Their red-span lengths are:

`19 + 16 + 20 = 55`.

This produces a 55-rune sequence. LP2 pages 0–55 contain 55 nonempty pages because p50 is empty. Thus the candidate red sequence has the same length as the number of nonempty pages. The p15 Fibonacci spiral and the 55-length sequence provide another possible Fibonacci connection.

The sequence is extracted directly from the original red spans in `lp2-ink-annotations.json`; the probe script prints it and asserts the lengths. Its length match is a hypothesis-generating coincidence, not evidence that it is a key.

## 5. Candidate routes and tested mechanisms

Two deterministic page routes follow from the anchors:

1. **Diagonal torus cycle:** start at p23 = (3,2), repeatedly step (−1,−1). Since 8 and 7 are coprime, this visits all 56 cells exactly once.
2. **Square spiral on the torus:** start at p23 and move left, up, right, down with step lengths 1,1,2,2,3,3,…, wrapping at the 8×7 boundaries and retaining first visits. Its first three pages are exactly p23, p22, p15; it reaches all 56 pages after 73 path positions. The p15 spiral makes this route a plausible human attempt, though the manuscript image is a Fibonacci *prime* spiral, not direct evidence for this square-spiral rule.

The following small, source-constrained decryptions were tested against an independent native-GP trigram model trained on the Emerson control text:

- The solved p56 consecutive-prime-totient additive transform on physical, diagonal, and square-spiral page orders, with continuous and page-reset clocks. A weak extra control also skipped an F only when it occurred at a local offset equal to its physical page number. Candidate scores remained near random (about −6.5); the known p56 plaintext scores about −2.38.
- The three clause sums modulo 29 as a period-three Vigenère key **[12,16,11]**, both signs and continuous/page-reset clocks, on the same page orders. No English recovery.
- The 55-rune red sequence as a repeating Vigenère key, both signs and clocks, on physical and square-spiral page order. No English recovery.
- The 55-rune red sequence as one Caesar shift per nonempty page, on physical and square-spiral page order. No English recovery. A stable ascending/descending sort of the 55 nonempty pages by those red-key values, read raw or followed by the p56 totient transform, also remained near random (best score about −6.50).
- Base-29 big-endian conversion of the physical and diagonal page-concatenated streams. The outputs were binary-looking and did not expose readable text or a recognizable file header.

These failures reject those **specific combinations**, not the page-map structure. In particular, the literal-F handling needed to transfer the p56 cipher to LP2 is not established by this map.

## 6. Research interpretation and next decision

The strongest current interpretation is that the 2013 audio number and p57 Parable may encode **navigation among a small set of LP2 pages**, with the 32-fragment / 28-state dimensions supplying an 8×7 coordinate system. The dual reductions select five pages, and p23 is a particularly strong shared anchor. The selected pages' illustrations and punctuation give a plausible human route: spiral, cut/blade, five-dot marker, repeated phrase.

What is *not* established:

- that the 8×7 quotient is intended as a page map rather than a numerical coincidence;
- that factor residues modulo 56 should be paired with ordinal-derived destinations as directed edges;
- that the square spiral is the intended continuation;
- that the 55 red runes are a key;
- any LP2 plaintext or encryption mechanism recovered from these constructions.

Do not repeat the tested prime-totient, period-three Vigenère, 55-rune Vigenère, pagewise Caesar, or raw base-29 variants. The next worthwhile experiment must derive a **unique operation** from the p15 spiral and the p22/p23 punctuation/illustrations, then test it on independent ciphertext. If no such operation is source-constrained, retain this as a structural lead rather than starting an unconstrained search.

## Reproduction and source files

- [Canonical master transcription](../resources/transcriptions/liber_primus_master.txt)
- [LP2 rune corpus](../resources/liber-primus/lp2-corpus.json)
- [LP2 ink annotations](../resources/liber-primus/lp2-ink-annotations.json)
- [2013 audio / PARABLE analysis](../im-results/audio-761-pad-scan.md)
- [p27/p55 repeated-word-pair analysis](../im-results/lp2-repeated-wordpair-structure.md)
- [Existing red-span analysis](../im-results/red-span-triangle.md)
- [Reproduction probe](../sims/parable_prime_8x7_page_map_probe.cjs)

The probe derives the three clause sums from p57, checks the factorization and page mappings, extracts the red sequence, constructs both page routes, and records the bounded cipher tests. The source files remain the authority for the manuscript data.
