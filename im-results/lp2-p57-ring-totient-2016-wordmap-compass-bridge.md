# Four-ring φ selector bridges the 2016 word map to the p32 H→X route

**12–25 November 2026 · Agents22/9/10/17 · conditional navigation hypothesis; audited as not a complete solve path.**

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

**Do not treat this chain as a solve path.** The p57 wording and solved p56 totient method make the four-ring construction a plausible human-puzzle hypothesis, but the earliest unselected operation is already in the p57→p50 transition: the source does not uniquely specify applying Euler's φ to all four perimeter lengths, reading the results inside-out, and treating them as one-based positions in the 2016 signed message. The 2016 “words/map / meaning/road / numbers/direction” text motivates a word-to-number route, but the bounded primary-source search in #2801 did not find a named first-party semantic resource or a unique indexing rule.

Even granting the ring selector and the four GP-prime-sum table addresses, the p50→p32 transition lacks an independently selected executable compass rule. The 32×8 table shape makes a 5+3 packet plausible, but no primary source selects low-three-bit direction/high-five-bit distance, the N/NE/E/SE/S/SW/W/NW code order, the zero-based table origin, or modulo-11 toroidal wrap. Original p32 is six lines of rune prose with a blurred tree, not a printed 11×11 grid or a compass. The conditional H33→X37 match and matched controls below do not authenticate the operation that creates it.

The p32→p37 step is only a page-pointer interpretation: X at zero-based cell37 indexes signed-message word37, LUCK, and hence p37. It supplies no cipher key or state transition. The final GOOD/LUCK pair is not independent confirmation: with X37 fixed, the final W10 move forces predecessor36 (#2795). The separate p37 local LUCK candidate remains conditional; the compass route adds no decoder operand, and 94 positions in its 98-rune item3 interval remain without an authenticated transition rule.

**Conclusion:** retain this as a source-cued navigation hypothesis, but retire it as a complete solve path. No unknown-page plaintext, authenticated new key, reversible unknown-page operation, or final destination follows.
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

## Edge-by-edge audit and matched decoy controls (Agent17, 25 November 2026; #2836)

### Causal chain and missing selectors

1. **p57 → p50: ring selection and signed-word readout.** The original p57 text contains the cues “WE MUST SHED OUR OWN CIRCUMFERENCES”, “FIND THE DIUINITY WITHIN” and “EMERGE”; the original numeric panel is a 32×8 array across p49–p51. Peeling its four nested borders gives perimeters 76, 68, 60 and 52; applying φ gives 36, 32, 16 and 24. Inside-out one-based message positions [24,16,32,36] select ROAD / WORDS / AND / FOUND in the authenticated 43-word 2016 message. This is a reasonable solve-path hypothesis because p56 uses a prime-totient operation and p57 supplies the ring/within/emerge language. It is not uniquely instructed: φ-on-perimeter-lengths and the one-based message-position convention are inferred, not stated.

2. **2016 words → p50 table addresses.** The four words' GP-prime sums are [204,179,215,130]. Using these as zero-based row-major addresses in the 256-cell table selects tokens [3E,2t,1O,1Q] and base60 bytes [194,175,84,86]. The signed 2016 message says that words are the map and numbers are the direction, but it does not explicitly choose GP-prime sums over GP0 or another word number, nor does it state the table's zero origin. The one-based table-address control does not reach the p32 X marker. The base59 interpretation of the same four tokens gives [191,172,83,85] and reaches no X from any H.

3. **p50 bytes → p32 path.** Under the proposed low-three-bit direction/high-five-bit distance split, direction order N, NE, E, SE, S, SW, W, NW, and modulo-11 row/column wrap, the bytes produce the path from cell33 [33,35,47,36,37], whose runes are H, M, IA, E, X. The literal p28 DH modulus23 gives a plausible H selector because H's GP prime weight is23. On p32, H occurs at [11,23,33,74,79] and X at [37,54,61,68,70]; the five H starts end at [15,27,37,67,83], so only H33 reaches an X that is a valid zero-based index in the 43-word message. However, the 11×11 p32 grid is a reflow of 121 runes, not a printed grid. The table's 32×8 shape motivates a 5+3 packet but does not select the bit allocation, compass frame, start orientation, or toroidal wrap. The earlier primary-source audit #799 found no first-party instruction defining those operations; its separate orientation control found four of sixteen simple orientations reaching the then-known X. The alternative high-three/low-five split reaches X70 from H23, outside the signed-message index range.

   The four moves also collapse to a simple net displacement: E24, NW21, S10, W10 sum to (0,+4) modulo11. Thus the endpoint test is a four-column cyclic shift, not four independent confirmations. The path visits [33,35,47,36,37] = H,M,IA,E,X; it skips the adjacent O at34, so it does not literally read the contiguous p32 string HOMEX.

4. **p32 → p37 and the local receiver.** X37 is within the 43-word signed-message index range; zero-based word37 is LUCK, which points to p37. This is a conditional page pointer, not a decryption. The p37 LUCK candidate has a separate local double-index/H4-state argument and a p31 helper-page construction, but the compass path does not supply its key or transition. As #2795 showed, the last W10 step makes cell36/GOOD a deterministic predecessor once cell37/LUCK is assumed. Do not count GOOD/LUCK as two independent endpoint predictions.

### Frozen matched controls

The fixed four-byte route was applied without changing its bytes, bit split, direction order, wrap, or target range:

- **Page-prefix controls:** take the first 121 runes of every LP2 page with at least 121 runes (52 pages). Four pages—p5, p25, p32 and p38—have at least one H start whose route ends on X at an index below43. Only p32 also has the route's intermediate M at step1, E at step3 and X at step4; its complete path is H,M,IA,E,X.
- **Length-matched windows:** tile the 12,956-rune unknown stream into 106 disjoint 121-rune windows, anchored so the p32 page begins one window at source offset7839. Seven windows have an H→X endpoint below43; only the p32 window has the complete H,M,IA,E,X path.
- These are descriptive matched controls, not discovery-wide p-values: page prefixes other than p32 are not complete 121-rune pages, the disjoint windows may cross physical page boundaries, and the route/marker family was developed retrospectively. They do show that the endpoint condition alone is not unique; the richer p32 path is distinctive within these frozen controls but cannot select an otherwise unauthenticated compass operation.
- The earlier exhaustive word-tuple control remains as published: among 1,256,640 ordered four-tuples of distinct eligible 2016 word occurrences, 9,192 end at X and 72 both end at X and visit M→E→X (0.00573%). This is also conditional on the chosen map, start, endpoint, marker and explored family, not a discovery-wide significance estimate.

### Reproduction

Run `node sims/lp2_p57_p50_p32_p37_matched_decoy_sft.cjs` from the repository root. The script reads the canonical corpus and numeric-grid JSON, recomputes the four bytes under base60 and the drop-f base59 rival, asserts the five H/X positions and all fixed route endpoints, then runs both matched-control sets. It is a lightweight deterministic source test; no CI workflow or broad route search was run.

