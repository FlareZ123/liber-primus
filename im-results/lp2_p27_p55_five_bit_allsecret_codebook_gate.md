# All-secret five-bit codebook obstruction for p27→p55 interiors

**Original-input deterministic exclusion, 13 November 2026 (Agent 17).** Original p27 has a 19-rune red heading and **215 black runes = 5×43**. Physical p55 has one inherited cross-page carry plus a 75-rune body of 16 complete words; removing each word's first and last rune leaves **43 strict interior runes** containing **21 distinct GP29 values**. The identical terminal `DJU-BEI` ciphertext word pair on p27 and p55 further motivates examining this pair of pages. Five-dot p55 ornament geometry suggests the historical five-bit/Baconian family as a *conditional* direct channel. The source image prints p27's black runes in eleven unequal lines; neither hypothetical 5×43 packing is given as an instruction.

**Result:** Neither of the two conventional packings (five consecutive 43-rune rows, or 43 consecutive five-rune tuples) can directly encode all 43 original p55 interiors under **any stationary unknown binary assignment to the 29 original source rune identities and any unknown injective five-bit-to-GP29 codebook**. This grants every possible source-rune-to-0/1 assignment, both bit orders, and arbitrary GP output-label permutations. The argument avoids brute-force 2²⁹ search.

### Short original-input contradictions

A fixed injective 5-bit decoder maps a five-bit tuple to one output rune. Therefore two equal p55 output runes force the corresponding five source bits to match positionwise. Treat each original p27 rune class's secret bit as an unconstrained variable, then union the required equality classes. Only **two repeated-output observations** suffice to force two **different** p55 ciphertext runes to share identical five-bit tuples:

| Source p27 layout | Two equal-output requirements (0-based p55 interior positions) | Distinct outputs forced to have identical code |
|---|---|---|
| Five 43-rune rows | rune I at interior positions **1=13**, rune H at **18=25** | interior positions **30** (X) and **41** (J) |
| 43 sequential quintets | rune C at positions **9=16**, rune E at **27=36** | interior positions **21** (S) and **27** (E) |

For each layout, **all 22** repeated-output requirements collectively collapse **all 29 source-rune bit variables into one equivalence class**. All 43 source quintets would thus have the same code, contradicting the 21 original output types. There are **872 distinct-output position pairs** compelled to have identical codes. An exhaustive check finds no contradiction without a repetition constraint or from any single repeated-output requirement; the printed two-repetition witnesses are minimal in that sense.

An independently constructed source-shaped positive control assigns fixed secret bits to all 29 input rune identities, computes the 43 source quintets and maps each distinct five-bit code injectively into GP29 labels. The same equality-graph decision accepts each of the two planted 43-position channels.

### Exact scope and research consequence

The exclusion assumes **fixed binary color per rune identity**, **the same five-bit source grouping throughout**, **one output GP29 symbol per five-bit code**, and an **injective codebook**. This is a strong all-secret negative for direct Baconian or five-bit identity-code interpretation of the p27 215-rune body as the p55 43-rune interior ciphertext. It does *not* exclude a variable bit color by position, a lossy alias codebook with multiple codes per output, five-rune word generation of a separate secret key, independent cipher layers, or any channel that moves the output outside the 43 p55 interiors. Both input packings remain hypothesized, as the image does not print five 43-rune rows.

**Decision:** Retire this direct p27→p55 stationary five-bit/codebook decoder under both natural regroupings. Preserve the actual 215/43 length relation and original repeated motif as possible higher-level navigation clues. This complements the existing GF29/GF43 Shamir and all-secret quadratic transfer exclusions without redoing their searches.

[Source-exact, fully positive-controlled standalone Node 22 SFT](../sims/lp2_p27_p55_five_bit_allsecret_codebook_sft.cjs).