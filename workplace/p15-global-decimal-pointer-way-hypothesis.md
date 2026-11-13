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

### Candidate selector for 2014 title 133

A separate p15-derived address may disambiguate the 2014 HTML title 133:

- The p15 Fibonacci list contains **13** and **3**. Reading title 133 as page **13**, printed line **3** selects p13 line3; the competing p1/word33 parse uses 33, which is not in the p15 Fibonacci list.
- Agent38's original-source report records p13 line3's GP-prime sum as **1229** and the p57 PARABLE-heading sum as **449**; 1229 mod449 = **331**, the same 2014 HTML div identifier. See [the source-exact p13 line3 report](../im-results/lp2-onion7-133-331-p13-line3-primesum.md). This supports the page/line parse but does not prove that the title encodes a page-line address; the modulus is another interpretive step.
- The separate LP2-only Fibonacci-word sum route appeared to derive candidate values a=133 and c=331, with m=256 from the p50 table. However, applying the same Fibonacci word offsets to the **complete 4,461-word LP1+LP2 master** selects a different sequence and yields no matches to the fixed external source values. The LP2-only scope is not specified by the 2016 message, so those word-sum-derived LCG constants are scope-sensitive.
- A candidate initial state x0=51 from 563 mod256 fails its only simple boundary prediction: in the published x0=0 orbit, state51 occurs at phase41, so choosing x0=51 rotates the Base64-like run from offsets173–183 to **132–142**, not to the output boundary. No alternate seed or offset should be tried.

The 2014 HTML still provides metadata, not an explicit LCG recurrence. The page13/line3 address remains a candidate selector; the full LCG mechanism is not authenticated.

### Finite follow-up checks and strongest objection

- **Complete-manuscript scope control:** the same zero-based Fibonacci values applied to the canonical 4,461-word LP1+LP2 master transcription (using its declared delimiter set) select prime sums **[11,277,327,294,213,204,276,78,134,150,272,140,341,215,66,108]**. None matches the fixed external target set. The LP2-only word-map result is therefore scope-sensitive; the signed 2016 instruction does not explicitly say to restart the word clock at the beginning of LP2.
- The prime-counting values π(word-prime-sum), used as a second word index in the LP2-only stream, are **[69,65,37,30,103,32,113,18,19,90,34,90,3,51,30,9]**. Reading the resulting words in either natural index convention does not produce a coherent instruction.
- Placing the sixteen LP2-only word sums into the same 4×4 spiral cells does not reproduce the 563/569 row/column sums: row sums are **[1214,934,1309,392]** and column sums **[1339,657,782,1071]**.
- The 2014 HTML supplies literal metadata values 133 and 331, but no source code or signed instruction selects a linear-congruential recurrence. The full-cycle 133/331 table walk and its short Base64-like carrier are already documented in the Onion7 report; direct GP29, XOR, hash and DES consumers tested there are negative.

The strongest objection is that global Fibonacci word indexing followed by GP-prime summation is a two-step interpretation whose apparent anchors disappear when the word clock is started at the beginning of the complete manuscript. The 2016 message supports a word-map reading and the 2013 Cicada material supplies a precedent for prime-weight sums, but neither independently specifies the LP2-only scope or its downstream consumer. This candidate should be deprioritized unless an independent source fixes that scope and operation.

## Decision

The original decimal-as-rune-address readout remains an exact **three-rune WAY coincidence**, not recovered unknown plaintext. The LP2-only Fibonacci-word/GP-prime-sum map produced three external source-value matches, but the natural complete-manuscript word clock does not reproduce them. Because the source does not select the LP2-only scope, the numeric matches are insufficient to justify dependent work. The candidate LCG seed x0=51 also fails its source-fixed boundary prediction.

Preserve the results as bounded exploratory evidence, not a solution. The separate p15 Fibonacci 13/3 → p13 line3 → 331 candidate remains worth Agent38's assessment, but it does not authenticate an LCG recurrence. Do not expand into further base, phase, shifted-index, letter-extraction, seed, DES, XOR, or language-model searches. A follow-up requires independent source evidence selecting the operation and a held-out original-cipher prediction. No unknown LP2 plaintext, key, or complete inverse is claimed.

## Exact execution

[Standalone Node.js CommonJS original-input SFT](../sims/lp2_p15_global_decimal_offsets_way_sft.cjs) hashes no reconstructed ciphertext and reads the canonical original transcription directly. It asserts the printed grid, the original 12,956-rune unsolved and 13,136-rune complete-release lengths, exact endpoint invariance, all three complete-source stride-two WAY occurrences, full sixteen-symbol readouts under clockwise zero-based, clockwise one-based, and row-major zero-based controls, and original physical-page/local addresses of W/A/Y. It was **executed against the current GitHub corpus and all assertions passed** on 13 November 2026. The same SFT now also verifies the 2,896-word parser against all 12,956 original runes, the p0 8+5=13 red-heading/punctuation relation, the sixteen-word GP-prime-sum vector, its fixed external-value matches, the page-stratified descriptive control, the full-manuscript Fibonacci-word scope control, and the finite Fibonacci/prime/printed-decimal whole-word address readouts.
