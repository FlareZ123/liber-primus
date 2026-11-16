# Terminal p55–57 256-rune frame: all-secret lookup and source-ring obstructions

**Agent48, 13 November 2026. Original known-plaintext structural negatives; no unknown page solved or recovered key.**

## Why this frame can select an experiment

The manuscript's final physical pages contain **76 unknown p55 ciphertext runes + 85 solved p56 runes + 95 clear p57 runes = exactly 256 runes**. The original pp49–51 numerical grid is **32 rows × 8 cells = 256 byte-valued entries**. More specifically, peeling its rectangular perimeter leaves four concentric rings of **[76, 68, 60, 52]** cells. The outermost 76 coincides with physical p55; its three interiors total **180**, the two solved terminal pages combined. This is a source-visible geometrical hypothesis with an independently known 180-symbol control. The previous, distinct p53(179)+p54-A(1)+p55(76) 256-frame interpretation is an equally available rival. No original instruction explicitly transfers the table to p55–57.

The known page-56 plaintext is `AN END WITHIN THE DEEP WEB ... TO SEEC OUT THIS PAGE` in exact GP orthography, and **85/85** plain GP indices are independently regenerated through the authenticated prime-totient inverse, including the literal-F exception at local offset56. Page57 has **95/95** source-native clear GP runes. These **180 known plaintext symbols** are the sole target. The 76 unknown p55 symbols are withheld, and no invented plaintext is used.

## Direct static table lookups under standard traversals

Assume an arbitrary secret **fixed deterministic byte→GP29 lookup** (or reverse GP29→byte lookup), with completely unrestricted codebook entries. Apply row-major, column-major, row-serpentine and column-serpentine grid traversals, each forward/reverse, and both terminal-rune directions. For forward terminal-rune order, grid positions 76–255 correspond to the known plaintext; for reverse order, positions 0–179 correspond to its reversal. No byte encoding, key guessing, external crib or cipher fitting is required.

| Grid reading | Best minimum edits, byte → rune | Best minimum edits, rune → byte |
| --- | ---: | ---: |
| Row-major, either reversal | 47 | 153 |
| Column-major, either reversal | 48 | 155 |
| Row-serpentine, either reversal | 44 | 154 |
| Column-serpentine, either reversal | **39** | **151** |

Each figure minimizes over the two grid directions and two terminal directions within its row. These are **exact all-secret lower bounds**, obtained by grouping positions with equal input values and selecting the most frequent target rune for each group. Every disagreement with that chosen output must change. All **16** orientations recover arbitrary planted byte→rune and rune→byte fixed codebooks exactly. [Source-native SFT](../sims/lp2_grid256_terminal_solved180_lookup_sft.cjs).

## Geometrically selected concentric-ring readout

The 76+68+60+52 ring decomposition provides an independently motivated alternative reading grammar. Map only the **three inner rings** to the same 180 known terminal plain runes; outer p55 remains hidden. Ring starts may be any of four corners; each runs clockwise/counterclockwise. Within that fixed corner/direction, test the four natural interior order/readout conventions: outside-in, inside-out, reversing each ring, or reversing the entire interior stream. Try the solved-text forward and backward orientations. This yields **4×2×4×2 = 64** layouts.

For each layout, grant **one completely independent, wholly secret byte→GP29 substitution codebook PER INNER RING**. This is far more permissive than a single shared table lookup: the same byte may encode different runes in different rings, and all 29 rune outputs may be selected freely. Every configuration nevertheless requires **at least 19 changes among the 180 authentic known symbols**, even after separately optimizing the three ring lookup maps. Restricting it to one fixed codebook for all three inner rings strengthens the minimum to **45 changes** in the same 64 candidate layouts. All 64 ring readouts reproduce positive arbitrary-secret-codebook plants exactly per ring. [Original geometric SFT](../sims/lp2_grid256_terminal_inner180_rings_sft.cjs).

The two tests differ in geometry and codebook freedom. The ring test checks the one source-geometrically salient way to separate unknown p55 from known pp56–57. The standard-layout test covers natural linear readouts. Both reject direct *fixed-symbol* decoding under their stated 16/64 traversals. The added inner30×6 rank test independently excludes an unknown single global Hill-6 or affine Hill-6 key under the natural inner-row and known-terminal alignment. A stateful cipher, running key, position-aware operation, source-defined permutation or other interpretation of the grid remains possible. Counting 256 alone supplies no such operator.

## Historical PARABLE clause-sum ring rotations (Agent 27, 16 November 2026)

The independently archived 2013 Cicada `761.MP3` metadata already contains the exact poem later printed as solved p57 **PARABLE** and its numerical product `1,595,277,641`. The original GP-prime sums are `[449,1259,1031,1229]` for the title and its three complete, punctuation-delimited body clauses; the product of the body sums is exactly the historical number ([historical source and previous arithmetic](audio-761-pad-scan.md)). The four original p49–51 grid circumferences have sizes `[76,68,60,52]`. This independently supplied four-number sequence gives a *possible*, but not authenticated, ring-start rule: rotate each ring by its corresponding sum modulo the ring length, producing `[69,35,11,33]`. The outer 76 symbols belong to wholly unsolved p55 under this terminal-frame hypothesis, so **the exact 35/11/33 inner rotations can instead be tested without accessing p55's unknown plaintext**.

Freeze the three original inner rings in clockwise top-left traversal, apply the above rotations in outward-to-inward order and compare with the actual solved p56 + clear p57 180-rune control. Even granting **one completely arbitrary secret byte→GP29 lookup per inner ring**, the number of irreconcilable original-position outputs is **[8,7,6]**, or **21/180**. Three other non-fitted readout controls (reverse winding, reverse terminal text) yield **21, 22 and 20** inevitable disagreements respectively. An arbitrary secret lookup deliberately planted independently on each rotated source ring fits **0 errors in all four** cases, checking the collision argument. Full original-source reproducer: [`lp2_parable_three_inner_ring_rotations_sft.cjs`](../sims/lp2_parable_three_inner_ring_rotations_sft.cjs).

**Decision:** Even the unusually concrete historical clause sums cannot rescue an *ordinary fixed-symbol ring codebook* on the exact terminal known-plaintext register. A position-dependent original cipher remains possible, but p57 never explicitly commands modular rotation, byte-to-GP encoding, a state update or this particular 256-rune alignment. The source pairing itself is a hypothesis, and the 2013 prose's circumference imagery also admits the documented philosophical reading. No unknown plaintext, key, or non-polynomial inverse has been recovered. Retire this bounded direct route rather than tuning later ring phases or a more complicated lookup after the negative.

## Inner30×6 original-terminal all-secret Hill6 gate (Agent 1, 15 November 2026)

The exact 32×8 original table has a **30×6 interior** after removing its 76-element perimeter. The final physical p56+p57 have **180 independently known GP29 plaintext runes**, forming 30 rows of six without padding. If one unknown global 6×6 Hill matrix over GF29 maps those rows to the printed interior table reduced modulo29, the row space of the table must be contained in the six-dimensional row space of the known source. Even allowing a single extra unknown additive six-rune offset imposes an augmented-rank bound.

On either (a) **actual decoded p56 + clear p57** or (b) **printed p56 ciphertext + clear p57**, with source-original row-major interior table Y and terminal known 30×6 matrix X:

| Exact original GF29 rank | Both source-register cases |
| --- | ---: |
| rank(X) | **6** |
| rank(Y) | **6** |
| rank([X,Y]) | **12** |
| rank([X,1]) | **7** |
| rank([X,1,Y]) | **13** |

Thus there is **no choice of an arbitrary secret shared 6×6 matrix A** satisfying Y=XA and **no shared affine map A,b** satisfying Y=XA+1b: necessary joint ranks would have been at most 6 and 7, respectively. This conclusion is independent of unknown key values and excludes even noninvertible matrices under this fixed original-source alignment. The test reconstructs p56 plaintext from the authenticated prime-totient rule including its literal-F bypass, then plants an independently invertible affine Hill6 transform on all **180** native solved GP29 runes and recovers **180/180** correctly. The original-image table geometry is a hypothesis, with no Cicada-signed instruction selecting this operation. A changing secret, different geometry, or nonlinear rule remains possible. [Reproducible source-native SFT](../sims/lp2_grid256_terminal_inner180_hill6_sft.cjs) · [passing Windows Node22 run 43680299436](https://github.com/FlareZ123/liber-primus/actions/runs/43680299436).

## Original terminal GF257 outer-ring erasure decoder (Agent 1, 15 November 2026)

The original 32×8 printed table has concentric rings of **76, 68, 60 and 52** cells. Original p55 has **76 unknown** GP29 runes; original p56 has **85 authenticated decoded plaintext** runes; original p57 has **95 clear** runes. An unusually direct complete-p55 route is a Shamir/Reed–Solomon-style *erasure decoder*: treat the original 256 unique row-major grid addresses as elements 0–255 of **GF257**, place the **180 known terminal GP29** values at the three inner rings, interpolate the unique polynomial of degree at most 179, and recover the outer 76 values as candidate unknown p55 plaintext. The historical use of Shamir sharing makes this a motivated finite experiment, while no original source specifies a GF257 code or grid-address mapping.

Freeze **four start corners, both traversal senses, both inner ring stacking orders** and **two original p56 registers** (authenticated p56 plaintext plus p57 clear, or printed p56 ciphertext plus p57 clear) for **32 original-source cases**. Every candidate recovered p55 rune must lie in the native GP29 interval 0–28, requiring no unspecified output encoding. Actual exact results:

| Source-constrained original check (best over all 32) | Result |
| --- | ---: |
| Valid reconstructed GP29 rune values | **16 / 76** |
| Exact reconstructed symbol matches against original printed p55 ciphertext | **2 / 76** |
| Predicted values modulo29 matching printed p55 | **5 / 76** |

For the natural top-left clockwise outside-in layout, using actual decrypted p56 yields **8/76** GP29-compatible values and using printed p56 gives **10/76**. All 32 fail because **at least 60/76** field values cannot be GP29 plaintext symbols. A source-native positive control takes all 180 true known GP29 rune values as coefficients of a synthetic degree179 GF257 polynomial, encodes 256 sites and reconstructs **all 76/76 independent withheld field values**, verifying full erasure recovery. [Exact CommonJS/JSDoc source test](../sims/lp2_terminal256_ring_gf257_erasure_sft.cjs). The printed table's *values* select only geometry here. This decisively rejects only the stated literal keyless GF257 systematic-code interpretation. No recovered original plaintext, source selected key, or historical interpolation opcode.

**Research decision:** retire deterministic fixed byte↔GP29 lookup on the p55–57 terminal 256-frame, including an arbitrary separate static lookup for each of the three exact inner rings. Do not create variable alphabets, phases or extra keys to rescue these negatives without a new original clue. The grid and solved ending still offer promising source-constrained controls for any genuinely new reversible operation. There is no newly authenticated plaintext, destination or key.
