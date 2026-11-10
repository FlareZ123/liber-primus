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

For any prime ordinal `n`, let `s = n mod 4`. Since 32 and 28 are both divisible by 4, the residues `n mod 32` and `n mod 28` share this same coset label. Quotient each coset separately:

`row = ((n mod 32) − s) / 4`

`col = ((n mod 28) − s) / 4`

`page = 7 × row + col`

The 2013 p57 ordinals all occupy coset `s=1`, giving the table below. This is only one of the four layers of the quotient.

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

The three 2013 anchors are a right-angle path: **p23 → p22 → p15**, first one column left, then one row up. This is exact arithmetic, not an inferred decryption.

### Cross-round check with the 2016 signed message

The existing source-derived 2016 message analysis gives section prime sums **[3001, 2819, 2579]** and one-based prime ordinals **[431, 410, 376]** (see `sims/2016_message_prime_layers.py`). Applying the same four-coset quotient gives:

| 2016 section | Prime ordinal | Coset s | n mod 32 | n mod 28 | Coordinate | Page |
|---|---:|---:|---:|---:|---:|---:|
| 1 | 431 | 3 | 15 | 11 | (3, 2) | **23** |
| 2 | 410 | 2 | 26 | 18 | (6, 4) | **46** |
| 3 | 376 | 0 | 24 | 12 | (6, 3) | **45** |

The 2013 and 2016 ordinal sets together populate **all four cosets** (2013: 1,1,1; 2016: 3,2,0). Most notably, the first ordinal from each independent source maps to **the same page p23**. The 2016 third ordinal maps to p45, one of the pages in the existing p45/p48 cross-page GCD study; p46 is immediately adjacent to p45 in the quotient grid.

This cross-round convergence is a stronger structural check than the 2013-only map, but it still depends on accepting the existing 2016 message tokenization/F-shift derivation.

## 3. A second page index from the factor values

The three 2013 clause sums reduced modulo the 56-page count give:

`[1259, 1031, 1229] mod 56 = [27, 23, 53]`.

Pairing each factor residue with its ordinal-derived page produces three directed links:

| Clause factor | Factor mod 56 | Ordinal-map page | Candidate link |
|---:|---:|---:|---|
| 1259 | 27 | 23 | p27 → p23 |
| 1031 | 23 | 22 | p23 → p22 |
| 1229 | 53 | 15 | p53 → p15 |

The union is the five-page set **{15, 22, 23, 27, 53}**. Page 23 is independently selected by the second factor residue and the first prime ordinal.

This five-page set has unusually suggestive source features:

- **p15:** the Fibonacci prime spiral.
- **p53:** a 51-rune red span, selected by the third factor residue.
- **p22:** the blade/body illustration.
- **p23:** the five-dot motif.
- **p27:** the red 19-rune span and the repeated word-pair relationship with p55.

The p57 Parable page itself has one 23-dot punctuation mark. The three ordinal-selected pages p15, p22, and p23 contain respectively 3, 1, and 1 thirteen-dot marks: **five in total**, matching the five-dot motif on p23. This is suggestive cross-page structure, not proof that the marks encode the map. The counts 3 selected pages, 5 marks, and 8 quotient rows also form the Fibonacci triple 3–5–8, while p15 carries the Fibonacci prime spiral. Because the pages and marks are inspected after selecting the anchors, treat this as a suggestive consistency check rather than independent statistical evidence.

The 2013 third clause independently selects the **p53 → p15** pair. This is notable because the existing red-span triangle analysis independently uses the original p53 51-rune red span and p15 Fibonacci-spiral material to establish its F79 primitive-root relation. The Parable mapping therefore points to a page pair already singled out by a separate source-derived arithmetic construction; this is cross-source corroboration, not a new proof of the F79 mechanism.

Page 27 and page 55 share the already documented two-word sequence. They are exactly 28 pages apart; in the 8×7 map they occupy the same column, in rows 3 and 7 (opposite rows). The value 28 is also the number of nonzero GP symbols.

## 4. Red-span material on the selected pages

The five-page set contains four red-bearing pages:

| Page | Red-span length |
|---:|---:|
| 27 | 19 |
| 23 | 16 |
| 53 | 51 |
| 15 | 20 |
| **Total** | **106** |

The total is `106 = 2 × 53`. The order `p27, p23, p53, p15` follows the red-bearing nodes in the 2013 factor/ordinal graph. It is a possible 106-rune sequence, not a uniquely forced key; other orders are possible.

A tempting 55-rune subset, `p27 + p23 + p15`, has length `19+16+20=55`, equal to the number of nonempty pages among p0–55 (p50 is empty). But this subset excludes p53 even though p53 is selected by the third factor residue and carries a 51-rune red span. The 55-length match is therefore not a sound reason to privilege that subset. Both the 55- and 106-rune sequences were tested as repeating Vigenère keys; neither recovered plaintext.

## 5. Candidate routes and tested mechanisms

Two deterministic page routes follow from the anchors:

1. **Diagonal torus cycle:** start at p23 = (3,2), repeatedly step (−1,−1). Since 8 and 7 are coprime, this visits all 56 cells exactly once.
2. **Square spiral on the torus:** start at p23 and move left, up, right, down with step lengths 1,1,2,2,3,3,…, wrapping at the 8×7 boundaries and retaining first visits. Its first three pages are exactly p23, p22, p15; it reaches all 56 pages after 73 path positions. The p15 spiral makes this route a plausible human attempt, though the manuscript image is a Fibonacci *prime* spiral, not direct evidence for this square-spiral rule.

The following small, source-constrained decryptions were tested against an independent native-GP trigram model trained on the Emerson control text:

- The solved p56 consecutive-prime-totient additive transform on physical, diagonal, and square-spiral page orders, with continuous and page-reset clocks. A weak extra control also skipped an F only when it occurred at a local offset equal to its physical page number. Candidate scores remained near random (about −6.5); the known p56 plaintext scores about −2.38.
- The three clause sums modulo 29 as a period-three Vigenère key **[12,16,11]**, both signs and continuous/page-reset clocks, on the same page orders. No English recovery.
- The 55-rune subset and the complete 106-rune red sequence as repeating Vigenère keys, both signs and clocks, on physical and square-spiral page order. No English recovery.
- The 55-rune subset as one Caesar shift per nonempty page. No English recovery. A stable ascending/descending sort of the 55 nonempty pages by those subset values, read raw or followed by the p56 totient transform, also remained near random (best score about −6.50).
- Pairwise source-red-span Vigenère tests along the three 2013 links (p27→p23, p23→p22, p53→p15), both signs. The best was p27→p23 with addition, score −6.2568 versus raw p23 −6.3190; however, 9.6% of 2,000 random permutations of the same key and 12.2% of 2,000 uniform random keys scored at least as well. This is not significant evidence for the pairing.
- Base-29 big-endian conversion of the physical and diagonal page-concatenated streams. The outputs were binary-looking and did not expose readable text or a recognizable file header.

The 2016 section prime sums modulo 56 give **[33,19,3]**, and pairing them with the 2016 ordinal-map destinations adds links **p33→p23, p19→p46, p3→p45**. The combined 2013/2016 page graph has ten unique pages: **{3,15,19,22,23,27,33,45,46,53}**. This graph has two especially notable cross-checks: p23 is a shared destination from both messages, and p45/p46 sit beside the existing p45/p48 GCD bridge.

These failures reject those **specific combinations**, not the page-map structure. In particular, the literal-F handling needed to transfer the p56 cipher to LP2 is not established by this map.

## 6. Research interpretation and next decision

The strongest current interpretation is that the 2013 Parable and 2016 signed message may both feed a **four-coset 8×7 page map**. Their six prime ordinals populate all four residue classes of the 32×28 torus and converge on p23; their prime sums modulo 56 supply candidate source pages for six directed links. The 2013 p53→p15 link independently meets the p53/p15 pair in the F79 red-span triangle, while the 2016 p45/p46 anchors meet the existing p45/p48 GCD line. This is a plausible intended navigation structure, not a plaintext solution.

What is *not* established:

- that the 8×7 quotient is intended as a page map rather than a numerical coincidence;
- that factor residues modulo 56 should be paired with ordinal-derived destinations as directed edges;
- that the square spiral is the intended continuation;
- that the 55- or 106-rune red sequences are keys;
- any LP2 plaintext or encryption mechanism recovered from these constructions.

Do not repeat the tested prime-totient, period-three Vigenère, 55-/106-rune Vigenère, pairwise edge Vigenère, pagewise Caesar, stable page-sort, or raw base-29 variants. The next worthwhile experiment should derive a **unique operation** from the four-coset map and its cross-round anchors, especially the p53/p15 F79 connection and p45/p46 GCD connection, then test it on independent ciphertext. If no such operation is source-constrained, retain this as a structural lead rather than starting an unconstrained search.

## Reproduction and source files

- [Canonical master transcription](../resources/transcriptions/liber_primus_master.txt)
- [LP2 rune corpus](../resources/liber-primus/lp2-corpus.json)
- [LP2 ink annotations](../resources/liber-primus/lp2-ink-annotations.json)
- [2013 audio / PARABLE analysis](../im-results/audio-761-pad-scan.md)
- [p27/p55 repeated-word-pair analysis](../im-results/lp2-repeated-wordpair-structure.md)
- [Existing red-span / F79 primitive-root analysis](../im-results/red-span-triangle.md)
- [2016 signed message](../resources/historical/cicada2016-4gq25.md)
- [2016 message prime-layer derivation](../sims/2016_message_prime_layers.py)
- [2016 word-prime direction analysis](../im-results/wordprime-grid2016-direction-inverse.md)
- [p45/p48 cross-page GCD bridge](../im-results/lp2-crosspage-gcd2016-source-bridge.md)
- [Reproduction probe](../sims/parable_prime_8x7_page_map_probe.cjs)

The probe derives the three clause sums from p57, checks the factorization and page mappings, extracts the red sequence, constructs both page routes, and records the bounded cipher tests. The source files remain the authority for the manuscript data.
