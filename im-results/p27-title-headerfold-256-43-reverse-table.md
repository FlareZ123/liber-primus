# P27 title header-fold: 256 / prime-43 table-interval bridge

**Status (11 November 2026): source-rare navigation structure selecting physical p50, the 256-cell table, P=43, and the left side of a 43-cell interval; the reversible decoder remains unresolved. No unknown LP2 plaintext or authentic cipher key recovered.**

## Upstream source route

This result continues the independently reproduced signed-2016 / p55 navigation route:

1. the signed 2016 base-58 word map sends each repeated **the** to the unique complete LP2 ciphertext word **FOLD**;
2. the cumulative signed route ends at physical **p55**;
3. folding the p55 sharp-tree image against itself yields mismatch bits 10010₂ = 18;
4. the 31 printed 13-dot marks delimit **32** physical fragments when coincident marks are retained, and one-based fragment **18** is exactly the red p27 title.

The duplicated p27/p55 DJU-BEI pair also has an exact numerical coincidence: its canonical word starts are 1,432 words apart, while the selected p27 section has 1,433 runes. These quantities use different units. The equality 1432 = 1433−1 is retained as an observation and **does not supply a direction, clock or state transition** without a source rule connecting word offsets to section-rune steps.

## Self-indexing title header

Fragment 18 is the 19-rune title MPYLSOAAEHLEEOIMLLSCP.

Its first rune is M, GP index **19**, exactly the title length. Removing that length header leaves **18 payload runes**, exactly the fragment number.

Across all 32 13-dot fragments, fragment 18 is the only nonempty fragment satisfying any of these three conditions:

- first rune index equals fragment length;
- remaining length equals fragment number;
- header-stripped fold equality mask equals 256.

## Literal header-aware fold

Fold the 18 payload runes outer-to-inner and write 1 for an equal pair, 0 for an unequal pair. The nine bits are exactly **100000000₂ = 256**.

The **only equal pair is P/P**. In Gematria Primus, P is index 13 and has prime weight **43**.

Thus one source-selected fold supplies two useful cardinalities:

- **256**, exactly the number of cells in the original 32×8 numerical table;
- **43**, exactly the size of the known interval between the table's two 193 cells, the authenticated 2016 signed-message word count, and the p55 shed-circumference interior channel.

Scanning every possible contiguous 19-rune window in the complete **13,136-rune LP2 source stream** finds exactly one match to the full pattern M=19, outer payload P/P, and no other folded equality: **p27 local offset 0**, the selected title. This is a source-rarity observation, not a discovery-adjusted p-value.

## The unequal fold pairs select p50 and a table-pointer orbit

The eight unequal folded pairs retain directional information. In the same outer-to-inner reading, write **1 when the left GP index is smaller than the right**. The bits are:

`00110010₂ = 50`

which directly names **physical p50**, the page carrying the 256-cell numerical table. Reading those same eight comparison bits inner-to-outer gives:

`01001100₂ = 76`

exactly the number of original p55 runes. The opposite comparison convention gives 205, and p50 table cell 205 itself contains byte 76; this last equality is retained as a secondary exact relation rather than used as an independent selector.

The unique equal pair already supplies **P's GP prime 43**. Treat each p50 table byte as the next zero-based cell address and start at cell 43. The functional-graph walk is:

`43 → 73 → 79 → 82 → 201 → 74 → 205 → 76 → 114 → 197 → 115 → 247 → 192 → 0 → 203 → 68 → 199 → 47 → 76 ...`

This has **18 distinct cells before first repeat**, exactly the header-stripped title length and fragment number. Its repeated state is **76**, exactly the full p55 rune count. The preperiod is 7 and the cycle length is 11. The first title word has length **3**, and after exactly three pointer steps the walk lands on **cell 82**.

This signature is selective inside the GP source vocabulary. Among all **29 GP prime weights** used as possible table starts, **P=43 is the only start** whose walk simultaneously has 18 distinct states, repeats at 76, and lands on 82 after three steps.

The pointer interpretation therefore independently reaches the left table bracket used below, without converting the 1,432-word / 1,433-rune coincidence into a direction rule.

## Independent ornament arithmetic reaches the same table bracket

The source-image route now supplies a second way to reach the table interval before using the P=43 pointer orbit. In ordinary p55 ornament order, the two complete values are **13** and **31**. Their difference is **18**, reproducing the selected fragment number; value13 is GP index **P**, and fragment18's sole equal payload pair is again **P/P**, whose GP prime is **43**.

The archived 2013 `NUMBER` service returns **`+`** when a prime's decimal reversal is also prime. Both 13 and31 satisfy that rule. If that historical plus response is read as the elementary arithmetic cue to add the paired ornaments, **13+31=44**, and the **44th prime is 193**. In the original base60 table, 193 occurs only at cells **83 and127**, exactly **44** positions apart, enclosing the already selected **43** cells. An exhaustive table check finds no other prime-valued base60 entry whose duplicate separation equals its own one-based prime ordinal.

This also creates a conditional radix discriminator. Under the base59/f-skip fork, the two `3D` cells become 190, 193 occurs at cells **61 and234**, and the exhaustive self-indexed prime-distance set is empty. The ornament route therefore independently predicts the exact base60 193/44/43 bracket, conditional on the plus-as-addition interpretation. Since the 2013 server did not state that its plus response should later be treated as an arithmetic operator, retain this as strong source-constrained navigation evidence rather than an authenticated decoder.

## The pointer decomposition predicts a missing p55 corner

The P=43 orbit decomposes into a **7-state preperiod** followed by an **11-state cycle**. These sizes are source-active rather than descriptive only:

- **7 + 11 = 18**, the fragment number and header-stripped title length;
- **7 × 11 − 1 = 76**, the exact original p55 rune count.

The duplicated six-rune `DJU-BEI` sequence makes a locked geometric prediction. Its p27 copy starts at local offset **28 = 4×7** and its p55 copy starts at **70 = 10×7**. In a seven-column row-major layout each copy fills columns 0–5 of a row. P55 ends immediately after its six runes, leaving one unfilled seventh cell. P27 continues for that cell: local offset **34 is AE**, GP index 25, prime 101.

Appending this source-predicted **AE** to p55 produces exactly **77 = 11×7 runes**, and the final seven-rune row becomes identical on both pages:

`DJU-BEI-AE`

This is a falsifiable completion derived from the independently selected pointer dimensions and duplicated ciphertext. It is stronger than padding p55 with an arbitrary rune.

The completed 11×7 rectangle has two further exact source relations:

- its center cell is original p55 offset **38 = D**, the first rune of the established LP1 key `DIUINITY`;
- its literal perimeter contains **32 cells**, exactly the number of rows in the complete 256-cell numerical table, whose width is **8**, the length of `DIUINITY`.

These relations motivate geometry-first successors, but they do not yet specify a reversible cipher. Direct tests remain negative: the fixed p27/p55 row fold around the completed `DJU-BEI-AE` anchor stays ciphertext-like; natural 11×7 route transpositions do not approach native GP language; and applying the established `DIUINITY` Vigenère key to the 45 cells left after stripping the grid perimeter produces no readable plaintext, including the unique row-major phase that aligns key D to the center D.

## Mirrored table bracket selects the 43-cell interval

The signed word **lies** has GP-prime sum 224, giving the already frozen base-58 address **physical p50 word index 3**, global table cell **83**, token 3D, byte **193**.

The 256-cell table contains exactly two byte-193 cells, at **83** and **127**. Their outward neighbors are both byte **201**:

- cells 82–83 = **[201,193]**;
- cells 127–128 = **[193,201]**.

The cells strictly between the two 193 boundaries are exactly **84–126**, i.e. **43 cells**. This mirrored bracket is a same-representation table fact and independently agrees with the P/P prime weight 43.

The P=43 pointer walk lands specifically on **cell 82**, the left neighbor of the first 193 boundary. This makes **84→126** the source-oriented interval branch. It still does not specify the reversible byte/rune operation. The previously tested reverse ordering 126→84 remains useful only as a conditional negative.

## Conditional reverse-order direct tests

Before the cross-unit direction problem was identified, the reverse order 126→84 was frozen and tested under direct operation families already used elsewhere in the repository. The negatives remain valid for that conditional ordering.

### 43 signed-addressed LP2 words

Using reverse cells 126→84 as one GP29 additive shift per signed-message-addressed LP2 word gives same-source key-order shuffle upper tails:

| Model | Original mean log score | Upper tail |
| --- | ---: | ---: |
| subtract reverse byte mod29 | **−4.799898** | **0.81409** |
| add reverse byte mod29 | **−4.633761** | **0.21639** |

### P55 shed-circumference interiors

Applying the same conditional reverse bytes positionwise to p55's 43 interior runes gives:

| Model | Original mean log score | Upper tail |
| --- | ---: | ---: |
| subtract reverse byte mod29 | **−4.503814** | **0.22069** |
| add reverse byte mod29 | **−4.786443** | **0.79055** |

The outputs are unreadable.

### Source-oriented forward interval

The pointer-selected forward cells **84→126** were then tested under the identical p55-interior GP29 additive model and the same **4,000** key-order shuffle control per sign:

| Model | Original mean log score | Upper tail |
| --- | ---: | ---: |
| subtract forward byte mod29 | **−4.463345** | **0.16746** |
| add forward byte mod29 | **−4.501544** | **0.33342** |

Neither forward direction distinguishes the source order, and both decoded strings remain unreadable. Thus the pointer result improves **orientation**, while the direct additive byte/rune operation remains rejected.

### Complete 76-rune periodic interval gate

The fold also supplies **76**, so the simplest complete-page use repeats the forward 43 bytes across all **76 original p55 glyphs**, preserving p55's printed word boundaries. This covers the 33 exterior runes directly. Under the fixed GP-English model:

| Model | Mean log score | Same-key shuffle upper tail |
| --- | ---: | ---: |
| subtract repeated forward43 | **−4.849444** | **0.89011** |
| add repeated forward43 | **−4.764426** | **0.80922** |

Both outputs are far below native GP controls; random permutations of the same 43 bytes usually score better. Direct Euler-φ, prime-index/totient, and cell-address variants of the same interval also fail to improve the original-cipher distribution enough to justify expansion.

A table-internal ordering does not rescue the channel. Following byte pointers from each of the 43 selected cells until first return to cells 84–126 yields a target for every start, but only **14 distinct targets**. The induced map is many-to-one and cannot supply a reversible 43-item permutation.

Other finite checks under the reverse hypothesis also fail: the 43 bytes have only **27 distinct residues modulo43**, and direct XOR or modular ± byte readouts using signed-word and selected-word sums reach at most **22/43** printable ASCII.

## Decision

The durable route is:

**FOLD → p55 → fragment18 → self-indexing p27 title → comparison mask50 = p50 → equality P/P = prime43 → 18-state table-pointer orbit → repeat76 = p55 length → cell82 → forward 43-cell interval.**

The title fold and pointer orbit now select the table, a source-oriented side of the 43-cell interval, and the p55-length state 76 without relying on the cross-unit 1,432/1,433 coincidence. They still do not determine the reversible operation consuming the table interval, p55 interiors, and signed-message words. The 1,432-word / 1,433-rune coincidence must stay separate from direction claims unless a source instruction bridges those units.

Do not expand arbitrary byte KDFs, permutations or phase searches. The orientation question is materially narrowed; a useful successor needs an independent source-visible rule for the **reversible operation**.

**Reproduce:** node sims/p27_title_headerfold_256_43_reverse_sft.cjs
