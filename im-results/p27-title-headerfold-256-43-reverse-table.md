# P27 title header-fold: 256 / prime-43 table-interval bridge

**Status (13 November 2026): source-rare p27→p50/p55 navigation structure with several bounded decoder exclusions, now including a complete all-secret stationary five-bit/codebook gate under both natural 5×43 packings. There is still no reversible original-cipher decipherment, unknown LP2 plaintext or source-authenticated key.**

## Upstream source route

This result continues the independently reproduced signed-2016 / p55 navigation route:

1. the signed 2016 base-58 word map sends each repeated **the** to the unique complete LP2 ciphertext word **FOLD**;
2. the cumulative signed route ends at physical **p55**;
3. folding the p55 sharp-tree image against itself yields mismatch bits 10010₂ = 18;
4. the 31 printed 13-dot marks delimit **32** physical fragments when coincident marks are retained, and one-based fragment **18** is exactly the red p27 title.

The duplicated p27/p55 DJU-BEI pair also has an exact numerical coincidence: its canonical word starts are 1,432 words apart, while the selected p27 section has 1,433 runes. These quantities use different units. The equality 1432 = 1433−1 is retained as an observation and **does not supply a direction, clock or state transition** without a source rule connecting word offsets to section-rune steps.


**Independent all-secret five-bit codebook gate (13 November 2026).** On the same 215 black p27 runes and 43 original p55 word interiors, an exact union-find proof excludes *every* stationary binary labeling of original rune identities plus *every* injective static five-bit-to-GP29 codebook, under both source-natural 5×43 packings. Only two observed equal-output pairs in each packing force unequal p55 outputs to have the same code; all 22 repetitions collapse all 29 original source-rune binary variables. The original-input proof recovers both planted GP29 codebook channels ([minimal witnesses, exact model and SFT](lp2_p27_p55_five_bit_allsecret_codebook_gate.md)). This rejects a direct Baconian source→ciphertext reading, while leaving keys and variable/lossy bit encodings untested.

## P27 black-body 5×43 link to p55, and a finite-field recovery gate

An independent **original-source length** relationship sharpens the existing p27/p55 bookend clue. The physical p27 image contains **234 runes**, beginning with the original **19-rune red title**; its **215 ordinary black runes = 5×43**. Across all 56 unsolved physical pages, this is the **only nonempty black-rune count divisible by 43** (the rune-free p50 is excluded). P55 has **43 strict word-interior runes** after the source-derived circumference stripping, and its left ornament has **five positions 01101**, whose filled positions are **2,3,5**. The exact adjacent two-word ciphertext pair `DJU-BEI` occurs at p27 offsets **28–33** and p55 offsets **70–75**; these are the only repeated contiguous six-rune positions in the entire 12,956-rune unknown corpus. The p55 occurrence is the **terminal two words**. Physical pages 27 and55 are exactly **28 pages apart**, closing the two halves of the 56 unknown pages, with 28=φ(29). The repeated pair was already documented in the [p27/p53 source report](p27-title-gridfold-p53-closure.md); the black-body multiple-of-43 relationship is an additional conditional observation.

**Important source constraint:** the 215 black runes are *not physically printed as five rows of 43*. The original p27 transcription has 11 ordinary text lines with unequal rune counts (its title occupies the first 19 runes of a 20-rune first line). Thus the 5×43 matrix is a mathematically possible **hypothetical regrouping**, and the source still lacks a direction to regroup. The page uniqueness is a conditional dimensional observation, not proof of an intentionally printed array.

This cluster **nominates a concrete original source-key experiment**: treat p27's 215 black runes as five source-symbol shares in each of 43 columns, then use the five-dot 01101 mask to select rows 2,3,5 for the 43 p55 interiors. The historically familiar 29-symbol alphabet supports a degree-2 Shamir polynomial over F29; if these were three of five authentic shares, the other two observed row values must match the unique degree-2 interpolant. For selected abscissae **2,3,5**, its value at zero uses coefficients **5,24,1 modulo29**. We fixed both ordinary ways to pack the source (five consecutive 43-rune rows and 43 consecutive five-rune groups) and both natural field readings (GP ordinals 0–28 and GP-prime weights modulo29), without searching secret coordinates or arbitrary row permutations.

| Original 5×43 interpretation | Both withheld shares correct / 43 columns | Exactly one withheld share correct | Neither correct |
|---|---:|---:|---:|
| Five rows of43, GP ordinal | **0** | 2 | 41 |
| Five rows of43, GP-prime residue | **0** | 5 | 38 |
| 43 groups of five, GP ordinal | **0** | 3 | 40 |
| 43 groups of five, GP-prime residue | **0** | 4 | 39 |

**Source-selected field-prime cross-check:** P/P on the red title independently supplies prime **43**, which is a second natural modulus for the hypothetical five-share construction. Repeating the exact three active rows 2/3/5 with **GF43** instead of GF29, both original regroupings and both GP encodings, still gives **0/43 columns whose two withheld rows both match** in every one of the four source-defined cases. Only **1, 1, 4, and 1** columns respectively match exactly one withheld row. The GF43 Lagrange predictions are `y₁=17y₂+41y₃+29y₅` and `y₄=14y₂+y₃+29y₅` modulo43. A 43-column synthetic GF43 degree-two plant reconstructs both withheld rows exactly, so this rejection is not caused by a faulty field implementation. [Reproducer](../sims/p27_p55_shamir_gf43_source_sft.cjs). The prime43 coincidence thus **does not rescue the 3-of-5 polynomial interpretation**.

A synthetic source-matched **43/43-column polynomial positive control passes**. All eight positionwise ± additive decodings using the interpolated 43-symbol candidates against the exact original p55 interior remain nonlinguistic (observed IoC **0.02215–0.05094**); no source-derived key or plaintext results. This **decisively rejects the direct quadratic 3-of-5 share interpretation of all five p27 glyphs** in the four fixed layouts/encodings. It leaves the page-pair and 5×43 dimensional observations available for a different *independently selected* reversible operation. Do not multiply alternative masks, row orders, coefficient rules, or decoder families merely to rescue the appealing arithmetic.

[Reproducer: exact original source assertions, both layouts, positive polynomial plant and all eight original inverses](../sims/p27_p55_five_by_43_shamir_source_sft.cjs) · [successful Node22 CI run 43026602093](https://github.com/FlareZ123/liber-primus/actions/runs/43026602093).

## Source-original 43-column polynomial transfer and p50 selector gate (Agent20, 11 November 2026)

**Key-independent result: every fixed GF(29) polynomial of total degree at most two in the five hypothetical p27 row symbols fails to reproduce all 43 p55 word-interior symbols.** This includes arbitrary linear/affine coefficients and all 15 quadratic square/cross-product terms. The degree-two extension is worth isolating because the original 2013 protocol and p50 grid contain explicit quadratic GF(29) material. Neither source actually instructs applying a five-variable polynomial to these pages, so the result excludes this specified original-cipher transfer family rather than proving a general LP2 architecture.

The original source supplies p27's 215 black runes after its 19-rune red title, and p55's 43 strict interiors from its 16 complete page-local words. Treat p27's black stream as either five consecutive rows of43 or 43 successive five-tuples, with both ordinary GP29 index and prime-weight-mod29 encodings. For each of these four exact original-input pairings, construct the 43×21 feature matrix `[1,x1,...,x5,x1²,x1x2,...,x5²]`. The 21 arbitrary secret coefficients are all free. Exact GF(29) elimination gives **input rank21 and augmented rank22 in every case**. The first 21 columns give a unique interpolating polynomial that already contradicts the *unfitted* 22nd column. Results:

| Five-symbol layout | GP29 encoding | Predicted column22 | Actual column22 | Initial-21 fit matches / 43 |
| --- | --- | ---: | ---: | ---: |
| 5 rows ×43 | Ordinal | 13 | 15 | 21 |
| 5 rows ×43 | Prime residue | 7 | 24 | 21 |
| 43 five-tuples | Ordinal | 24 | 15 | 23 |
| 43 five-tuples | Prime residue | 7 | 24 | 22 |

**A stronger, source-saturated quadratic transfer also fails.** The source-oriented p50 interval adds one original byte per column, and the authenticated 2016 message supplies exactly 43 ordered words whose canonical GP-prime sums have previously been established as a numeric clue. Appending the byte modulo29 and signed-word prime sum modulo29 to each p27 five-rune column gives **seven independently defined GP29 inputs**, with **36** monomials of degree≤2. For all four five-row layouts/encodings, the original 43×36 coefficient matrix has **rank36**; adding the 43 original p55 interior targets raises the rank to **37**. Thus **no single fixed quadratic function in all seven source-aligned values**, with any of its 36 secret coefficients, can map the original source triple (p27 body, p50 interval, signed 2016 word numbers) to p55's 43 original interior ciphertext symbols. The unique fit to the first 36 positions fails at physical source column37 (or38 in the five-rows/ordinal case):

| P27 layout | P27/p55 encoding | First failed column | Predicted GP29 | Original GP29 | Fitted matches / 43 |
| --- | --- | ---: | ---: | ---: | ---: |
| 5 rows ×43 | Ordinal | 38 | 20 | 28 | 37 |
| 5 rows ×43 | Prime residue | 37 | 24 | 9 | 36 |
| 43 five-tuples | Ordinal | 37 | 27 | 18 | 37 |
| 43 five-tuples | Prime residue | 37 | 15 | 9 | 36 |

The source SFT constructs the signed-word numbers directly from the signature-preserved message, asserts its 43 GP-prime residues, and plants arbitrary 36-term quadratic controls that survive all 43 original-length observations. This test includes all second-degree cross-products between the p27 row symbols, original p50 bytes, and signed-word numerical stream, not just a single guessed key. The weak assumption is still important: no signed or original manuscript instruction says the three sources should be connected through a **fixed GF29 quadratic** or that the target p55 stream should be their direct image. A changing polynomial or intermediate nonlinear transform remains outside the proof.

**Five-share interpolation, distinguishing the authentic 2013 construction.** The actual archived Cicada 2013 `ssss 0.5` challenge used share identifiers **2,3,5,7,8** and five shares of a **monic degree-five polynomial over GF(2^176)**, with modulus polynomial x^176+x^11+x^3+x²+1. Its positive reconstruction is preserved in [the separate historical SFT](../sims/2013_shamir_missing_shares_sft.cjs). It is inaccurate to describe that original method as GF256 or ordinary unqualified degree-four sharing. A monic quintic is recoverable from five shares because its leading coefficient is known, leaving five independent coefficients.

A *field-translated* p27 analogue reads each of the 43 hypothetical five-rune columns as those five historical share IDs, encodes runes in GF29 (GP ordinal or prime residue), subtracts each known x^5 term, interpolates the remaining degree-four polynomial and evaluates at x=0. The unique GF29 Lagrange weights are **[19,15,19,23,12]**, with **monic correction 27 mod29**. Under both natural p27 layouts and both GP registers the resulting 43 reconstructed symbols match the 43 original p55 interiors at only **1/43, 0/43, 1/43, 2/43** positions, respectively. Neither the reconstructed 43-rune readouts nor their direct C±K application to p55 is intelligible (all eight output IoCs **0.02436–0.03876**). An exact 43-column synthetic monic quintic plant passes the reconstruction in every layout and GP encoding. The source supplies the share IDs, field polynomial and monic term; adapting 176-bit elements to individual GP29 runes remains hypothetical.

For comparison, conventional GF29 degree-four Shamir interpolation with five contiguous x=1..5 row positions has coefficients `[5,19,10,24,1]`. That *different* analogue matches the original p55 target at **2/43, 1/43, 0/43, 2/43** columns and produces no coherent plaintext under the two direct additive signs. Its 43-column planted degree-four control also passes. Both versions and their exact original data are reproduced in [the p27/p55 source SFT](../sims/p27_p55_43_allsecret_affine_and_table_gate_sft.cjs).

**Decision for these Shamir analogues:** reject a direct p27 five-share reconstruction whose secret equals p55's original 43 interior ciphertext symbols, or directly acts as its additive key. The proper historic field, GP29 representation, coordinates, and intended target are not supplied together on the LP2 images, so this does not disprove a real use of Cicada's historical secret sharing elsewhere.

The smaller all-secret degree-one tests are likewise inconsistent: coefficient rank5/6 versus augmented rank6/7 across all eight models. For example, five-row ordinary GP indices without intercept fit [21,11,5,10,3] on the first five columns but predict **18** at column6 versus actual **2**; an arbitrary intercept gives [15,23,12,14,22,22] and predicts **6** at column7 versus actual **27**. A source-shaped positive control with 21 varied secret quadratic coefficients is fully consistent in each layout/encoding; both data and planted rank assertions pass in the [standalone original-input SFT](../sims/p27_p55_43_allsecret_affine_and_table_gate_sft.cjs). This is an algebraic obstruction to the entire declared secret-key family and does not require fitting an English-language score.

Two narrower candidates also fail in the same reproducible experiment. The original p50 byte interval at table cells84–126 supplies 43 bytes; reducing these modulo5 to choose p27 row symbols and applying C±K to p55's 43 original interiors gives eight incoherent outputs (IoC 0.02658–0.04540). The modulo5 selector is an unverified operation, and its short-output IoC is descriptive. Separately, removing the outside two of p55's 43 interiors leaves 41; concatenating them after p27's 215 black runes gives a speculative 256-rune p50 codeword. It fails both exact source-derived quadratic factor checks: under H=X²+18X+11 and G=(X−24)², the forward polynomial remainders are H=[21,24], G=[13,1]; the reversed sequence gives H=[13,0], G=[0,4]. This second circumference stripping and cross-page concatenation have no authenticated source instruction.

**Decision:** retire fixed degree≤2 GP29 polynomial transfers from p27's five hypothetical source rows to p55's strict interiors under either natural packing and register, even after providing all 43 source-aligned p50 bytes and signed 2016 word prime sums as extra polynomial inputs. Preserve the independently observed 5×43 lengths, p27/p55 repeated motif, and p50 interval as conditional navigation clues. These checks recover no plaintext, source-authenticated key or complete decoder.

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

## P55 shed-interior DIVINITY span reproduces 256

The solved p57 instruction gives a separate route into the same numeric structure. Removing the first and last rune of each complete p55 word, while treating the incoming p54→p55 word fragment as boundary only on p55, leaves **43 strict interiors**. GP index23 is D. Those interiors contain D exactly at one-based positions **5 and23**:

- **17** runes lie strictly between the D markers;
- their position difference is **18**, returning the fragment number;
- the inclusive D…D span is exactly **19 runes**;
- folding that span outer-to-inner gives **100000000₂ = 256**, with D/D the sole equal pair;
- the span center is rune **I**, whose GP prime is **31**.

Historical `NUMBER(193)` independently yields factors **17×23**, so the two factors are realized directly by the shed-interior D geometry. The first D position and inclusive span give **5×19=95**, whose decimal reversal is **59**, independently selecting the previously underdetermined 59 divisor in the p57 PARABLE route.

This is also a numerical cross-check on the ornament pair. The p27 title fold selects outer **P/P**, with P at GP index **13**; the p55 D…D span selects center **I**, with GP prime **31**. Reading those independently selected runes as **PI** is a plausible circumference mnemonic. The mixed index/prime numerical match is supportive rather than an authenticated instruction.

The p55 17-rune interval strictly between the D markers supplies a further conditional fold check. Outer-to-inner left-minus-right GP29 folding begins **T W O** and recursively reduces to **P**. That “TWO P” signature is unique across all 7,247 strict word-interior runes of unknown LP2. Numerically two P prime weights are **43+43=86**, exactly the GP-prime sum of p57 word **WE**, the shared node of its two five-cycles. The p27 outer P/P pair independently has the same total86. This triangulates the p27 P/P result with the p55 interior and solved p57 graph, conditional on the minus-fold sign.

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



## Source-constrained p27 5×43 prime-mask row selectors (negative)

**Human-route hypothesis.** The original p27 image has a 19-rune red title and a 215-rune black body, allowing a hypothetical 5×43 arrangement. The p55 ornament's left-side marks are 01101, with filled positions 2, 3 and 5. The signature-verified 2016 message has 43 words and says that its words are the map and their numbers the direction. The following two fixed interpretations use only those source-visible dimensions and the GP-prime sums of the signed words. The 5×43 grid is hypothetical, not printed; neither modulo rule is explicitly stated in the sources.

### A. Three-active-row selector

Use each signed word's GP-prime sum modulo 3 to select one of active rows 2, 3, 5, then take that column's p27 rune. This yields **EJSEAJFBOEONGEAREAOEDNEORNMOOCMEIAEOEPXNIRYEAGLOETDN**, with row counts 19/15/9. Treating it as an additive GP29 key for p55's 43 shed-interior runes, forward/reverse and C−K/C+K, gives:

| Variant | Mean GP-English log score | Output |
| --- | ---: | --- |
| forward C−K | −4.905468 | UEA YBEAL IAWXOE WUIJYWAEUREOU EOLOED MTH DNGPUNG GTHIACM OEMYE B N |
| forward C+K | −4.742408 | HNG IAAEP IAEOLB LEAENEOAXAEEOUI EYOO YOE PEAEAIAL AOEGEAB CUEONG C IA |
| reverse C−K | **−4.352920** | IT AEPOAE EAIAPA MSUBUGAAETB EOREN AEO ABWIW DFEAXE BSUM F F |
| reverse C+K | −4.563905 | EAR EAEAXH YNGNGS HXIAOHAESTHIAYD EPWB LNG EOOCEC WACME ICHL OE W |

The best output is **5.61 SD below** the held-out native-English control (10,693 matched 43-rune windows; mean −2.912985, SD 0.256766, range −3.833366 to −2.035201). A familywise maximum over all four direction/sign variants against **10,000** shuffles of the same 43 word-prime-sum multiset (xorshift seed 0x43a55) gives empirical upper tail **0.362764**.

### B. Five-row selector filtered by the ornament mask

The more literal five-row reading is one-based row **1 + (word-prime-sum mod 5)**; keep the selected rune only when that row is one of the ornament's filled positions 2, 3 or 5. This yields **TEBLOWFPDDRRCIPMFNGUOEOEDLOEDF** (26 runes) and skips 17 columns. The skipped count equals p55's 17 printed segments, but that is not independent evidence: the matched null preserves the same multiset of word-sum residues and therefore preserves the skip count.

The forward/reverse 26-rune outputs score **−4.282326 / −4.237420**. The best is **5.15 SD below** the held-out native-English control (10,696 matched 26-rune windows; mean −2.904066, SD 0.258722, range −3.805502 to −2.052807). A familywise maximum over both directions against **10,000** shuffles (xorshift seed 0x5f43) gives empirical upper tail **0.223678**. Neither orientation is plaintext or distinguished from its matched null.

Both selectors have exact synthetic row-selection controls; the additive GP29 bridge also round-trips exactly. **Decision:** reject these two exact row selectors and the direct additive p55 bridge. This does not reject all 43-unit relationships, but supplies no plaintext, key or reversible operation. Do not tune moduli, row orders, phases or key encodings.

**Reproduce:** `node sims/p27_43word_prime_mask_row_selector_sft.cjs`

## Signed 2016 GP word-length selector (bounded direct negative, Agent9)

The earlier 43-word tests used each 2016 signed word's GP-prime sum as a hypothetical row selector for the p27 black-body 5×43 regrouping. A still simpler, independently nameable interpretation of the signed clue's “words ... numbers” is each word's **GP rune length**, including the single GP digraphs and original order. This is an alternative source-derived input; **no source explicitly tells us to take the length modulo five, to repack p27 as five rows, or to perform additive decryption**.

Fix 43 ordered GP-rune lengths from the signed 2016 body (excluding the literal `3301` and OpenPGP armor), select `row = length mod 5` in the hypothetical five consecutive 43-rune p27 black rows, and read one index per column. Use the resulting 43 GP indices as a direct ±mod29 key against the exact 43 p55 “shed-circumference” interiors. Evaluate forward/reverse key order and both signs, four frozen variants, without searching phases or different masks.

The original 43-symbol outputs all lack coherent GP language. The highest **unigram index of coincidence** is **0.05980066**, for reverse-key **C−K**, versus raw p55 interiors **0.03433001**. This initially looks more concentrated, and only 299 of **30,000** shuffles of the same signed-word-length multiset (word positions permuted, p27 and p55 fixed) match or exceed the best four-variant IoC (familywise empirical upper tail **0.0100**). Crucially, the same IoC-winning stream has **five EO and five NG runes** in 43 positions, rare in native English GP. An independently trained Gibran GP unigram log-likelihood on that stream is **−4.075729**; the best original-family likelihood is exceeded by **20,015/30,000** matched shuffled-family maxima (upper tail **0.66718**). A separate fixed native-GP trigram diagnostic also failed: 907/3,000 shuffles beat the best original score (upper tail **0.30257**). The IoC spike is therefore **not supported as language/plaintext recovery**, and no independently selected subsequent transposition exists.

**Decision:** retire this exact GP-word-length/mod5 row-selector/direct-addition family. The interesting marginal concentration is a caution that high IoC alone can reward overproduction of rare GP runes. No keys, plaintext or original-cipher architecture have been recovered, and this test does not reject all possible roles of the five/43 geometry. [Deterministic full 30,000-trial reproducer](../sims/p27_2016_wordlength_row_gate_sft.cjs). The comparison uses a word-permutation conditional null and does not establish that the 5×43 regrouping is intentional.

**Direct additive checksum cross-check:** Independently of the Shamir interpolation, treating the same p27 five-rune columns as additive GP29 checksum shares for the **actual 43 p55 interior runes** also fails. Fix both source-defined layouts, GP ordinal versus GP prime weights, either all five columns or ornament rows 2/3/5, and a positive/negative field sum. Among these **16** exact direct-readout variants, at most **3 of 43** target runes match; no variant supplies the source value sequence or a p55 decoder. The same `p27_p55_shamir_gf43_source_sft.cjs` now asserts the full comparison. This is a finite check of literal sums, not a reason to tune residue weights.

## Direct five-bit comparison/Bacon extraction (bounded negative, Agent9)

The source already nominates 215 p27 black runes = 43 groups of five, the 43 p55 interiors, and an index-comparison rule in the p27 title's own fold. A literal 5-bit **Bacon-style letter** reading would compare each of five p27 runes against its corresponding p55 interior rune, assign 1 when the p27 GP index is smaller (or the complementary greater-than reading), then read five bits as an A–Z code 0–25. Because GP primes strictly increase with GP index, substituting GP prime weights for GP ordinal values does not change these comparisons.

Exactly the two conventional regroupings (five consecutive 43-rune rows versus 43 consecutive five-rune groups), the two strict comparison directions, and MSB-first versus LSB-first bit order were checked. All **eight source-bounded variants** have at least **nine forbidden five-bit codes 26–31 among 43 positions**; the natural row-major smaller-than/MSB-first readout has **ten** forbidden codes and text `*QYYIA***E*AOC*AQMPZ****WAXBHAJITUAQFPRTACZ`. No direct alphabetic message appears. The test does not fit a custom five-bit-to-GP mapping, insert an escape channel, or permute bit lanes until words appear.

**Decision:** a literal 5-bit A–Z Bacon route using the p27/p55 original index comparisons cannot decode all 43 positions without extra unsourced rules. Preserve the dimensional relationship, retire this exact direct readout. [Deterministic SFT](../sims/p27_p55_fivebit_comparator_gate_sft.cjs).

## Historically motivated three-share XOR transfer (bounded negative)

**Why this was worth one fixed test.** The recovered original 2014 LP1 route independently establishes a creator-era operation: XOR three equal-length source shares to reconstruct a signed message ([historical source map](../resources/historical/lp1-outguess-2014-source-map.md)). Here, p27 supplies a hypothetical 215-rune = 5×43 black body, p55 supplies 43 shed-circumference interiors, and the original p55 left ornament has filled positions **2,3,5** in its five-position mask **01101**. This motivates one concrete transfer: encode each GP rune by its 5-bit zero-based GP ordinal, XOR the three selected p27 shares, then XOR that 43-symbol pad with the p55 interior. The 5×43 regrouping is not printed on p27; both natural contiguous packings were frozen before the test.

**Exact test.** For each column, compute K = row₂ XOR row₃ XOR row₅ on the 5-bit GP indices, then P = p55_interior XOR K. The two layouts are (a) five consecutive 43-rune rows and (b) 43 consecutive five-rune tuples. No modulo-29 reduction, symbol remapping, bit reversal, row permutation, or phase search is allowed. A varied synthetic 43-column plant using only valid GP indices 0–28 recovers 43/43 secrets exactly.

| Packing | XOR-pad values valid in GP29 | Decrypted values valid in GP29 | Exact p55 interior matches | Output |
| --- | ---: | ---: | ---: | --- |
| Five consecutive 43-rune rows | 40/43 | 40/43 | 4/43 | DFDTH[30]J[29]AEXEIFOEJMXFAEEOEOTHIAT[30]EOOELDYDOEXSGCPFHXSEORP |
| 43 consecutive five-rune tuples | 39/43 | 41/43 | 3/43 | GPOEGCTHAXOJSXFPTF[31]TEORMGCWRIOEMDEOEF[29]IACNEOUEYOEBJ |

The bracketed values are 5-bit outputs 29–31, which are not members of the 29-symbol GP alphabet. Neither candidate yields a complete GP29 stream or coherent plaintext; direct share-XOR equality with the p55 interior also fails. The original source's bytewise 2014 operation makes this a historically motivated analogy, not an authenticated LP2 instruction.

**Decision:** retire the direct 5-bit GP-index three-share XOR transfer under both contiguous 5×43 packings. Do not rescue it by reducing 29–31 modulo29 or inventing an escape code. This does not exclude a different, independently specified byte encoding or share construction. Reproducer: [sims/p27_p55_three_share_xor_gate.cjs](../sims/p27_p55_three_share_xor_gate.cjs).

## Decision

The durable route is:

**FOLD → p55 → fragment18 → self-indexing p27 title → comparison mask50 = p50 → equality P/P = prime43 → 18-state table-pointer orbit → repeat76 = p55 length → cell82 → forward 43-cell interval.**

The title fold and pointer orbit now select the table, a source-oriented side of the 43-cell interval, and the p55-length state 76 without relying on the cross-unit 1,432/1,433 coincidence. They still do not determine the reversible operation consuming the table interval, p55 interiors, and signed-message words. The 1,432-word / 1,433-rune coincidence must stay separate from direction claims unless a source instruction bridges those units. The exact modulo-3 and modulo-5 prime-mask row selectors tested above also fail; the wider 43-unit relationship remains unresolved.

Do not expand arbitrary byte KDFs, permutations or phase searches. The orientation question is materially narrowed; a useful successor needs an independent source-visible rule for the **reversible operation**.

**Reproduce:** node sims/p27_title_headerfold_256_43_reverse_sft.cjs
