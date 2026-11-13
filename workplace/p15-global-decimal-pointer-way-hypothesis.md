# Original p15 spiral: rune-pointer hypothesis and word-address follow-up

**Status: exploratory source-address and word-map hypotheses; no authenticated cipher/key/plaintext.** This is a candidate *human reading instruction* worth preserving without broad numeric/parameter searches.

## Source-visible starting material

The original LP2 physical p15 image (`resources/liber-primus/32.jpg`) shows this exact 4×4 number square, with its visually red central value **3299**:

```text
3258 3222 3152 3038
3278 3299 3298 2838
3288 3294 3296 2472
4516 1206  708 1820
```

The [established spiral reconstruction](../results/lp2-p15-fibonacci-prime-spiral.md) determines the clockwise from-red order `[3299,3298,3296,3294,3288,3278,3258,3222,3152,3038,2838,2472,1820,708,1206,4516]`. The independently signature-verified 2016 Cicada clue says **“Liber Primus is the way. Its words are the map, their meaning is the road, and their numbers are the direction.”** The 2016 wording postdates the 2014 book, so it is an interpretive clue rather than a contemporaneous p15 caption ([verified source record](../resources/cicada2016-4gq25.md)).

One economical literal reading of *numbers are the direction* is to treat the 16 **printed decimal numbers themselves**, with no mod reduction, as **zero-based addresses** into the complete original p0–55 unknown LP2 GP29 rune sequence. The canonical unsolved p0–55 corpus contains exactly **12,956** such runes (55 nonempty pages; physical p50 is a numeral table with no runes); the **complete original LP2 p0–57 release** contains 13,136 runes. Every printed number is below 4,517, so every address and rune is **identical under either source-authentic p0-based endpoint**, without relying on the unsolved-only truncation.

## Actual readout and rival clocks

In the original clockwise order from the red cell, the addressed GP rune labels are exactly:

```text
OE W A Y L U M U L H T G AE B U M
```

In particular, the three numerals immediately following the visually red center address original physical **p13** at local positions **104, 102, 100**, and read **W A Y**. This agrees with one word in the later signed instruction, but the remaining 13 addressed symbols do not form a comparable phrase, and the center symbol is **OE**, not a plaintext or confirmed key.

The same original sixteen numbers under a **one-based** address convention give:

```text
W G IA X F O EO NG H A EA I W L L F
```

A standard **row-major, zero-based** reading of the original square gives:

```text
M U L H U OE W T L Y A G M U B AE
```

These alternatives do not begin with WAY at the corresponding red-center successor position. For a direct whole-source control, the complete original **13,136-rune LP2** stream contains **exactly three** cyclic stride-two descending `W,A,Y` triples at zero-based W positions **2959, 3298, 4126**; the red p15 centre selects the middle one. This finite count is descriptive and does not give a post-search probability of intentionality. The apparent word requires the investigator-chosen full-unknown-book zero-based address convention and the already-source-selected clockwise spiral. It is not a cryptographic prediction because many cross-artifact readouts have already been tried in the broader repository. Using the *end* of an artificially truncated unsolved-only stream as an address origin can manufacture another apparent English fragment; this is excluded from consideration because the original complete release includes solved p56/p57.

## Source-derived word-map and GP-prime-sum follow-up (Agent14, 13 November 2026)

The signed 2016 instruction says “Its words are the map ... their numbers are the direction.” The p15 spiral independently supplies a finite sequence of distinct Fibonacci values. I tested those values as zero-based addresses in the original p0–55 printed-word stream, then applied the established Gematria Primus prime-weight sum to each selected word. This is a plausible human-solve-path hypothesis, not an authenticated instruction. The parser is checked against the canonical stream: **2,896 complete words / 12,956 runes**.

| Fibonacci word offset | Physical page | Selected word (GP transliteration) | GP-prime sum |
| ---: | ---: | --- | ---: |
| 0 | 0 | SHEOGMIAF | 347 |
| 1 | 0 | SYENGC | 315 |
| 2 | 0 | THJGAE | 160 |
| 3 | 0 | FJOE | 122 |
| 5 | 0 | NEWBASOEEOINGU | 563 |
| 8 | 0 | PBN | 133 |
| 13 | 0 | SPTFPUNGYNGXIA | 618 |
| 21 | 0 | HEO | 64 |
| 34 | 0 | XGTH | 69 |
| 55 | 0 | FOEWAEOELFAE | 463 |
| 89 | 1 | GWY | 139 |
| 144 | 2 | PALUEANLJ | 464 |
| 233 | 4 | TH | 5 |
| 377 | 7 | CLEAP | 238 |
| 610 | 11 | NEOOX | 124 |
| 987 | 18 | FH | 25 |

The first two Fibonacci addresses select p0's two red words, of lengths **8** and **5**, which together form the original 13-rune red span followed by the 13-dot mark. The first two prime sums, 347 and 315, are the already recorded p0 red-heading values; their difference is 32 and their sum is 662 with π(662)=121, matching p32's page number and original rune count. This is the existing p0→p32 candidate route, not an independent confirmation.

### Cross-round numeric matches

Three of the sixteen word sums match a small, explicitly frozen set of independently documented source values:

- **F=5 → sum 563:** the p0 word beginning NEWBAS has GP-prime sum 563, matching the p32 top-row prime sum and the width of the signed 2016 tree image.
- **F=8 → sum 133:** the selected p0 word PBN has GP-prime sum 133, matching the title of the archived 2014 Onion7 delivery HTML.
- **F=144 → sum 464:** the selected p2 word PALUEANLJ has GP-prime sum 464, equal to π(3301). Also, **464−133=331**, matching the 2014 HTML div identifier. Thus the two selected word sums 133 and 464 can reproduce the HTML's 133/331 pair by a single difference. This is a possible source path to the 133/331 LCG constants, not evidence that the LCG recurrence itself is intended.

Two further sums, **463** at F=55 and **5** at F=233, equal members of the p15-derived prime list p_(F+1). They are internal cross-links to the same p15 construction, not independent external matches.

The fixed external target set used for a descriptive control is **{133,331,563,569,464,121,32,3301}**: the archived HTML identifiers, signed-image dimensions, p32 page/rune geometry, and 2013 BASE29 anchor. The sixteen Fibonacci-selected words hit 563, 133 and 464. Conditioning a hypergeometric null on the selected words' actual physical-page distribution gives **0.448 expected hits** and **P(X≥3)=0.0040013**. This is only an exploratory, page-stratified comparison: the target set and hypothesis were recognized retrospectively, the null does not preserve exact within-page word positions, and the project has examined many other numerical correspondences. It is **not** a discovery-wide significance claim or proof of intentional construction.

### Finite follow-up checks and strongest objection

- The prime-counting values π(word-prime-sum), used as a second word index, are **[69,65,37,30,103,32,113,18,19,90,34,90,3,51,30,9]**. Reading the resulting words in either natural index convention does not produce a coherent instruction.
- Placing the sixteen word sums into the same 4×4 spiral cells does not reproduce the 563/569 row/column sums: row sums are **[1214,934,1309,392]** and column sums **[1339,657,782,1071]**.
- The 2014 HTML supplies literal metadata values 133 and 331, but no source code or signed instruction selects a linear-congruential recurrence. The full-cycle 133/331 table walk and its short Base64-like carrier are already documented in the Onion7 report; direct GP29, XOR, hash and DES consumers tested there are negative.

The strongest objection is that global Fibonacci word indexing followed by GP-prime summation is a two-step interpretation. The 2016 message supports a word-map reading and the 2013 Cicada material supplies a precedent for prime-weight sums, but neither independently specifies this global word clock or its downstream consumer. This candidate deserves Director review because it links the p15 spiral, p0 opening, p32 tree, 2014 Onion7 metadata and 2016 signed image with a small fixed sequence. It does **not** justify another free search over ciphers, bases, offsets, seeds or table permutations.

## Decision

The original decimal-as-rune-address readout remains an exact **three-rune WAY coincidence**, not recovered unknown plaintext. The stronger exploratory candidate is the Fibonacci-word/GP-prime-sum map above: it produces three external source-value matches and a possible derivation of the 2014 HTML's 133/331 constants. Its strongest missing premise is the author-selected global word clock and prime-sum consumer; the retrospective match set and page-stratified null are not proof.

Preserve this as a Director-review candidate, but do not claim that the 133/331 LCG is intended or that its Base64-like carrier is a key. The existing direct LCG consumers remain negative, and the OpenPuff route remains blocked pending the repository owner's authorized positive control. Do not expand into further base, phase, shifted-index, letter-extraction, seed, or language-model searches. A follow-up requires independent source evidence selecting the operation and a held-out original-cipher prediction. No unknown LP2 plaintext, key, or complete inverse is claimed.

## Exact execution

[Standalone Node.js CommonJS original-input SFT](../sims/lp2_p15_global_decimal_offsets_way_sft.cjs) hashes no reconstructed ciphertext and reads the canonical original transcription directly. It asserts the printed grid, the original 12,956-rune unsolved and 13,136-rune complete-release lengths, exact endpoint invariance, all three complete-source stride-two WAY occurrences, full sixteen-symbol readouts under clockwise zero-based, clockwise one-based, and row-major zero-based controls, and original physical-page/local addresses of W/A/Y. It was **executed against the current GitHub corpus and all assertions passed** on 13 November 2026. The same SFT now also verifies the 2,896-word parser against all 12,956 original runes, the p0 8+5=13 red-heading/punctuation relation, the sixteen-word GP-prime-sum vector, its fixed external-value matches, the page-stratified descriptive control, and the finite Fibonacci/prime/printed-decimal whole-word address readouts.
