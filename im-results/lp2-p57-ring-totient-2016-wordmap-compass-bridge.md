# Four-ring φ selector bridges the 2016 word map to the p32 H→X route

**12 November 2026 · Agent22 · provisional navigation result, not a decryption.**

## Result

The solved p57 PARABLE says **“WE MUST SHED OUR OWN CIRCUMFERENCES”** and **“FIND THE DIVINITY WITHIN”** (see the [literal p57 circumference study](lp2-p57-literal-word-circumference.md)). The complete numerical grid spanning physical pp49–51 is a 32×8 array. Peeling its nested rectangular borders gives four perimeter lengths:

| Layer, outside → inside | Rectangle | Perimeter | Euler φ |
|---|---:|---:|---:|
| 1 | 32×8 | 76 | 36 |
| 2 | 30×6 | 68 | 32 |
| 3 | 28×4 | 60 | 16 |
| 4 | 26×2 | 52 | 24 |

The φ operation is motivated by the solved p56 prime-totient cipher and the p57 wording; applying it to all four perimeter *lengths* is a new interpretation. The resulting values are valid one-based positions in the authenticated 43-word 2016 signed message. Reading from the innermost ring outward (“emerge”) gives positions **[24,16,32,36]**:

| 2016 message position | Word | GP tokens | Prime weights | Sum |
|---:|---|---|---|---:|
| 24 | road | R O A D | 11, 7, 97, 89 | **204** |
| 16 | words | W O R D S | 19, 7, 11, 89, 53 | **179** |
| 32 | and | A N D | 97, 29, 89 | **215** |
| 36 | found | F O U N D | 2, 7, 3, 29, 89 | **130** |

This uses the exact 43-word extraction and greedy GP tokenization/prime weights already implemented in sims/lp2_2016_signed_prime_rank_p55_sft.cjs; the source payload is resources/historical/cicada2016-4gq25-outguess.asc. The four selected words are semantically salient in that message's “words/map”, “road”, and “Seek … found” instructions.

The existing GP-prime-summed-word-to-p50-table-address convention has appeared in the provisional p32 word-map work in results/README.md. Applying it here, as **zero-based** indices into the complete 256-byte lp2-grid-256.json, selects:

| Word | Table address | Table byte | Compass instruction |
|---|---:|---:|---|
| road | 204 | 194 | E, distance 24 |
| words | 179 | 175 | NW, distance 21 |
| and | 215 | 84 | S, distance 10 |
| found | 130 | 86 | W, distance 10 |

The existing 2016 compass decoder (sims/lp2_2016_43word_compass_sft.cjs) maps direction = byte & 7, distance = byte >> 3, and walks the p32 11×11 grid modulo 11. Starting at p32 cell **33 = (3,0) = H**, the four selected bytes produce:

| Step | Selected word | Cell | Coordinate | GP rune |
|---:|---|---:|---:|---|
| start | — | 33 | (3,0) | H |
| 1 | road | 35 | (3,2) | M |
| 2 | words | 47 | (4,3) | IA |
| 3 | and | 36 | (3,3) | E |
| 4 | found | 37 | (3,4) | X |

The p32 runes at indices 33–37 spell **HOMEX**. Thus this four-step route starts on its H and ends on its X, passing through the M, E, X cells in that order (with an off-marker IA cell between M and E; it skips O). The existing 43-word compass route, using the separate p50 byte interval 84–126, also ends at **cell 37 / (3,4) / X**. This is a second route to the same map endpoint, not a recovery of the map's plaintext.

## Discriminating controls and limitations

- **Table indexing is material.** Treating the GP sums as one-based cell numbers instead (addresses sum−1 = [203,178,214,129]) selects bytes [68,166,251,179] and ends at p32 cell **99**, not X. Zero-based addressing is consistent with the repository's array-based table and existing compass SFT, but the printed table does not explicitly label a zero origin. This is a real weakness, not a detail to hide.
- **Inside-out ordering matters for the marker path.** The inside-out order [24,16,32,36] visits [35,47,36,37], hence M→E→X. The reverse, outside-in order [36,32,16,24], still has the same final cell (the displacement sum is order-independent) but visits [34,23,35,37], not M→E→X. Four of the 24 permutations of the selected word set satisfy the M→E→X subsequence; the source-motivated inside-out order is one.
- **Exhaustive descriptive control.** Of the 43 message-word occurrences, 35 have GP-prime sums below 256 and can directly address the table. Enumerating all **1,256,640 ordered four-tuples** of distinct eligible occurrences gives 9,192 routes ending at X and 72 that both end at X and visit M→E→X in order (**0.00573%**). This is a post hoc combinatorial control conditioned on the chosen p32 start, endpoint and marker, not a discovery-wide p-value or correction for all investigated operations/markers.
- A naive page-local split of the four φ-selected LP2 pages gives 196 word tokens (14²), but the canonical full-book word parser assigns page-boundary continuations to their preceding pages: only **193 words start** on those four pages. The 14×14 coincidence is therefore a segmentation artifact and is not used.
- The selected page numbers [36,32,16,24] are valid LP2 pages; their original images show, respectively, a cuneiform header, the tree, text without an illustration, and a mirrored insect-like illustration. These visual observations are not inputs to the route.
- The prior p50_outer76_totient_p55.md test applied φ to the *76 perimeter byte values* as an additive key for p55 and encountered the source zero (φ(0) undefined). This investigation is distinct: it applies φ to the four **perimeter counts** to select message-word positions; it does not use φ(byte) or decrypt p55.
- The route combines individually motivated pieces, but the complete chain is not explicitly stated by one source. In particular, “φ of each ring length”, inside-out order, GP-prime-sum-as-zero-based-table-address, and reuse of the existing p32 compass origin are still interpretive links.

## Decision

This is a **promising, reproducible navigation bridge** from the solved p57 instruction through the p50 numerical grid and signed 2016 word map to the p32 H→X marker. It does not recover unknown-page plaintext, an authentic cipher key, or the intended final destination. The next useful work is independent reproduction/adversarial review of the complete chain and investigation of what the X endpoint signifies—not additional unconstrained transformations of the same four bytes.

## Reproduction

Run from the repository root:

    node sims/lp2_phi_ring_2016_wordmap_compass_bridge.cjs

The script verifies the source alignment, ring arithmetic, 43-word parsing, selected GP encodings, table bytes, both compass routes, one-based-address negative control, and the exhaustive 35-word four-tuple control.
