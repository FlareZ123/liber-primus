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
- The p32 target and H/X origin now have cross-source constraints (see the 25 November audit below); the complete operation is still not stated by one source. The remaining interpretive links are φ of each ring length, inside-out order, GP-prime-sum-as-zero-based-table-address, the low-three-bit direction/high-five-bit distance split, and modulo-11 wrap.

## Rejected source-specific astronomical overlay (separate from the ring route)

A 1504 *Mundus Novus* source lead describes 3+2+6 southern-sky star groups at nominal 9.5°, 12.5° and 32°; a 2026 reconstruction proposes eleven named stars. The exact 11-star count makes the p32 11×11 rune grid tempting, and 32° makes the p50 32×8 table tempting. I tested those correspondences with a frozen south-pole map: centre (5,5), RA=0 at top, east-left, 32°→five cells, and the three source group radii assigned to their respective stars.

- Reading the eleven mapped p32 cells in source group order gives GP tokens **A, L, W, IO, IO, U, A, J, J, J, J**. Several stars collide in the same cells; this is not a plaintext or useful path.
- Treating p50 as group-radius rows 10/13/32 and RA-octant columns, then applying the existing byte compass rule from H cell33, selects **[164,82,79,206,206,230,180,180,180,180,180]**. Under the source-consistent east-left orientation the route returns to H cell33; the mirror control ends at cell86. Neither reaches X cell37. The six outer-group stars collapse to the same table cell/byte.

This rejects the obvious 11-star→p32 and 3+2+6→p50 compass overlays. It does **not** test or strengthen the separate four-ring φ→2016-word→p50→p32 route above; that route remains provisional on its own stated assumptions. Reproducer: [Vespucci star-map overlay gate](../sims/lp2_vespucci_star_map_overlay_gate.cjs). The source-dot geometry and non-unique triangle comparison are documented in the [five-dot constellation gate](lp2-p56-five-black-dots-constellation-gate.md), with exact page reflections in the [mirrored-emblem bridge](lp2-mirrored-five-dot-original-page-bridge.md).

## Base59 rival holdout on the same four selected words

The four ring-selected words and their GP-prime-sum addresses are unchanged. Reinterpret only the four corresponding p50 tokens under the drop-f base59 rival, keeping the same zero-based addresses, start H at p32 cell33, direction = byte & 7, distance = byte >> 3, and 11×11 wrap.

| Word | p50 address | token | base60 byte | base59 byte |
|---|---:|---|---:|---:|
| road | 204 | `3E` | 194 | 191 |
| words | 179 | `2t` | 175 | 172 |
| and | 215 | `1O` | 84 | 83 |
| found | 130 | `1Q` | 86 | 85 |

The stored base60 interpretation reproduces the existing route:

| Step | byte | direction / distance | p32 cell | rune |
|---:|---:|---|---:|---|
| start | — | — | 33 | H |
| 1 | 194 | E / 24 | 35 | M |
| 2 | 175 | NW / 21 | 47 | IA |
| 3 | 84 | S / 10 | 36 | E |
| 4 | 86 | W / 10 | 37 | X |

The fixed base59 rival instead gives:

| Step | byte | direction / distance | p32 cell | rune |
|---:|---:|---|---:|---|
| start | — | — | 33 | H |
| 1 | 191 | NW / 23 | 32 | TH |
| 2 | 172 | S / 21 | 21 | W |
| 3 | 83 | SE / 10 | 9 | W |
| 4 | 85 | SW / 10 | 120 | EO |

Thus the same four source-selected words, addresses, start and compass rule reach the p32 **X/cell37** marker under base60, but end at **EO/cell120** under base59. This is a discriminating negative for the global base59 compass serialization and additional support for base60 in this receiver. The p32 11×11 target is independently selected by the signed 2016 EPIPHANY/DEVOTED values; the new all-H audit derives H33 as the unique origin reaching the only X whose cell index is valid in the 43-word message. The compass bit split and modulo-11 wrap remain provisional, and the p22 dual-radix perimeter hypothesis is a separate local claim. Do not infer arbitrary per-cell radix switching from this result.

The original p50 grid resource stores the base60 alphabet `0-9A-Z a-x`; the 2013 ALL AROUND selector independently favors base60. The new holdout is consistent with those source constraints. The base59-only `CIRCUMFERENCES/EMERGE` hits in the p22 square report should remain conditional and should not be used as evidence for a global base59 p50 decoder.

Reproduction: `node sims/lp2_phi_ring_2016_wordmap_compass_bridge.cjs`. The SFT now asserts both paths and their distinct endpoints.

## Source-constrained H→X selection and p37 handoff (Agent9, 25 November 2026)

The four-move route's origin and endpoint can now be selected rather than supplied.

- The literal p28 Diffie–Hellman modulus is **23**. In GP29, H has prime weight **23**. The p32 121-rune grid contains H at zero-based cells **[11, 23, 33, 74, 79]**.
- The p32 grid contains X at **[37, 54, 61, 68, 70]**. The authenticated 2016 message has 43 alphabetic words, so its valid zero-based word indices are 0–42; only X at cell **37** is a valid message-word index. The word at zero-based index 37 is **LUCK**, and the independent signed-message page map selects physical p37. This is an index handoff, not a prime-weight equality: X's GP29 prime weight is **47**, not 43.
- The 2016 message independently selects the p32 map: GP0(EPIPHANY)=121, exactly the p32 rune count; GP0(DEVOTED)=102 addresses p50 cell 102, token **0W**, whose base60 value is 32. Here GP0 is the sum of zero-based GP29 rune indices, not prime weights. See the [p32 signed-source selector](lp2-tree121-signed2016-source-gate.md).
- Apply the same four fixed base60 moves to every H occurrence. The five final cells are **[15, 27, 37, 67, 83]**; only H at cell **33** reaches any X, namely X at cell **37**. Under the same four addresses and compass rule with the drop-f base59 rival, the five final cells are **[98, 99, 120, 29, 34]**; none is X. Thus H33 is the unique H origin reaching the uniquely indexable X, conditional on the selected four moves and compass decoder.
- The p50 table is 32×8: 32 possible distances and eight compass directions naturally fit a five-bit/three-bit move code. The opposite bit allocation (high three bits for direction, low five for distance) reaches X70 from H23, but cell70 is outside the 43-word signed-message index range. The low-three-bit direction/high-five-bit distance allocation reaches the only indexable X37.
- The terminal two visited p32 cells are **[36, 37]**, which index the signed words **GOOD / LUCK**. This matches the separate p32 DIRECTION fold [7,8]+29=[36,37] in the [signed-tail corridor synthesis](lp2-p32-p42-signed-tail-page-corridor.md): a second navigation operation converges on the same endpoint.
- The resulting **p32 cell37 → 2016 word37 LUCK → p37** handoff aligns with the existing [p37 LUCK candidate](lp2-p37-luck-doubleindex-state-inverse.md). That local candidate uses a direct-DH-state key shell and a double-index receiver; it is **not** a 17-state ring. The handoff does not independently validate the p37 cipher or establish p37 plaintext.

This narrows the start and endpoint choices, but it does not prove the complete operation. In particular, the φ-of-perimeter selector, inside-out order, zero-based p50 addressing, byte-to-compass split and modulo-11 wrap remain interpretive. The route is still navigation evidence, not a decryption or final destination. Reproducer: [unique H→X and p37 handoff SFT](../sims/lp2_phi_ring_2016_compass_unique_hx_handoff_sft.cjs).

## Decision

This is a **promising, reproducible navigation bridge** from the solved p57 instruction through the p50 numerical grid and authenticated 2016 word map to the p32 H→X marker. The 25 November source-selector audit now derives the H origin and X endpoint conditionally: p28's DH modulus 23 selects H; only H33 reaches X37 under the low-three/high-five base60 moves; X37 is the only p32 X that indexes the 43-word 2016 message, where word37 is LUCK and selects p37. The final two visited cells [36,37] select GOOD/LUCK and match the separate p32 DIRECTION fold. The reversed bit allocation reaches X70, outside the message index range; the drop-f base59 rival reaches no X.

The bridge remains provisional. The source material does not yet establish φ of each ring length, inside-out order, zero-based p50 addressing, the byte bit split, or toroidal wrap as one complete operation. The p37 LUCK receiver is itself a provisional local candidate; the navigation handoff is not independent validation of its cipher. No unknown-page plaintext, authentic key, or final destination has been recovered.

The p32–p42 warning corridor is already synthesized in lp2-p32-p42-signed-tail-page-corridor.md; do not repeat its page-index work. The next useful decision is whether the p57 ring-totient selector and p50 compass serialization can be selected prospectively from the original p57/p50 artifacts, without conditioning on the known GOOD LUCK endpoint. Seek an independent source cue or a held-out prediction; do not expand the same four-byte route with new offsets or encodings.

## Reproduction

Run from the repository root:

    node sims/lp2_phi_ring_2016_wordmap_compass_bridge.cjs
    node sims/lp2_phi_ring_2016_compass_unique_hx_handoff_sft.cjs

The script verifies the source alignment, ring arithmetic, 43-word parsing, selected GP encodings, table bytes, both compass routes, one-based-address negative control, and the exhaustive 35-word four-tuple control.

## Conditional endpoint dependency and receiver-state audit (Agent10, 25 November 2026; #2795)

**Decision:** the two existing routes converge on the same developed signed index, but the final GOOD/LUCK pair is not an additional independent discriminator, and the compass supplies no new p37 decoder operand. Do not pursue another compass layout, signed-word map, or local key search on this basis.

The following is an exact dependency analysis, not another navigation search. Hold the previously published four table addresses, bytes, orientation, and 11×11 torus fixed. In unwrapped (row,column) coordinates:

| Point | Byte | Unwrapped position | Wrapped row-major cell |
|---|---:|---|---:|
| Start | — | (3,0) | 33 |
| ROAD | 194 | (3,24) | 35 |
| WORDS | 175 | (−18,3) | 47 |
| AND | 84 | (−8,3) | 36 |
| FOUND | 86 | (−8,−7) | 37 |

The last byte is 86 = 8×10+6, selecting W10. On the hypothesized torus, W10 is exactly E1. Conditional on the already selected endpoint X37=(3,4), reversing this last move forces (3,3)=36. Thus **GOOD/LUCK is a deterministic consequence of endpoint 37 and the already selected last byte**, regardless of the first three moves or origin. The separate DIRECTION fold also adds the same constant to two consecutive indices, so once its final index is 37, the first is necessarily 36. Neither two-word readout constitutes two independently predicted endpoint labels. This does not erase the conditional H-origin/X-endpoint match itself: with the four moves fixed, H33 remains the only H that reaches the indexable X.

Wrapping is indispensable even before the endpoint: the first E24 displacement cannot fit in any bounded 11×11 grid. The supplied original p32 (49.jpg) visibly prints six lines of ordinary rune prose and a blurred tree; the 11×11 array is a derived reshape, with no visible toroidal boundary instruction. Original p37 (54.jpg) visibly prints numbered sections 2/3/4, but no new authored rule selects within-page ordinal 37 or a key transition from the compass endpoint. The bounded primary-source audit #799 already searched the first-party signed texts and found no selected 5+3 orientation/wrap convention. #1361 and #1801 constrain other navigation proposals, not this missing operation. In particular #1801's frozen numbered-section/word-length readout selects p32, not a p37 key update. No new independent comparator could be selected without reusing developed targets. No new target was opened as a prospective holdout.

For the actual p37 item3, the already fitted LUCK crib fixes four positions (146–149) of the 98-rune interval [91,189). The remaining 94 positions include exactly four ciphertext Fehu symbols. To illustrate the still-unconstrained state when no transition law is supplied, an arbitrary per-position consuming additive pad admits 29^94 plaintext completions (456.650 bits); under literal plaintext-F transparency and freely chosen consumed shifts, it admits 28^90×29^4 distinct plaintext completions (452.094 bits). For nonzero C, P cannot be F; for zero C, P can be F or any non-F with the corresponding consumed shift. These are exact counts **only in these deliberately unrestricted per-symbol models**, not estimated entropy or a claim about the finite local H-shell family. The compass gives no independent restriction on those unknown positions. The published fixed-q4 section continuation already fails; do not infer that a different arbitrary key schedule is authenticated.

Reproduction (executed directly on canonical corpus blob `054f2a0f780b7d46901acbe3d9bf4f0ac1801165` and grid blob `2550eae357442912220e05dc51147523a61dd75a`): take table bytes at [204,179,215,130], start (3,0), use the published direction vector and distance byte>>3; accumulate without modulus and then reduce both coordinates mod11. Compute the penultimate cell independently by subtracting the last move from (3,4). From p37.indices.slice(91,189), remove offsets 146–149 and count zeros in the 94 remaining symbols. No CI, key fitting or alternate compass layout was run. The conditional local LUCK candidate is retained; it is not a recovered section or an independently validated transition.
