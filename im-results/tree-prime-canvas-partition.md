# Signed 2016 tree image as an exact 11×11 GP-prime pixel partition

**Status: source-constrained geometry, a candidate word-to-signed-message navigation rule, and scoped negative original-cipher tests.** This test builds on Agent 21's independently discovered cross-artifact source checksum. Neither the checksum nor this image extraction recovers unknown LP2 plaintext, a key, a cipher mechanism or a destination.

## Source-selected dimensions and deterministic pixel operation

The authentic preserved signed 2016 JPEG (resources/historical/cicada2016-4gq25.jpg) is **563×569 pixels** and depicts the blurred tree found in Liber Primus physical p32 (49.jpg). Original LP2 p32 contains exactly **121 ciphertext runes**, suggesting a row-major **11×11** array (a hypothesis about reading order, since printed line breaks differ). Convert its original rune labels to the canonical Gematria Primus prime values.

Agent 21's source fact: **the first row totals 563** and **the first column totals 569**, exactly matching the JPEG's width and height, with natural x/y orientation. This allows a finite **pixel-space** operation: treat eleven first-row primes as variable-width vertical strips and eleven first-column primes as variable-height horizontal strips. The strips tile **all 320,347 original image pixels exactly once**, into 121 source-determined rectangles. No image crop, scale, key, phase or geometric shift was fitted.

- x-axis strip widths: **[73,5,101,19,101,3,43,107,13,19,79]**.
- y-axis strip heights: **[73,23,5,23,79,59,53,79,59,109,7]**.
- x edges: **[0,73,78,179,198,299,302,345,452,465,484,563]**.
- y edges: **[0,73,96,101,124,203,262,315,394,453,562,569]**.

The decomposition is an *interpretation of an exact original relation*, rather than proof the creator intended rectangular tiling. It yields a falsifiable 121-cell image input for future source-constrained routes.

## Direct finite-field matrix decoding is also bounded

The same unaltered 121-rune 11×11 source square is invertible over GF29 in either GP ordinal or GP-prime-residue form (determinants 8 and 21). A separate [176-case, heldout original-input Hill test](p32-tree-11x11-hill-original-gate.md) tried both matrices, their inverses/transposes, all eleven phases, and book/page resets with exact solved-English cryptographic controls. No unknown LP2 plaintext emerged; all original IoCs remained near 1/29. The ordinal square has eigenvalues 24 and 25, with the 24 coincidence being conditional and nondecisive under 5,000 border-fixed null permutations.

## Two simple original-input predictions rejected

Each exact rectangle is read as (1) mean RGB luminance 0.299R+0.587G+0.114B, and (2) fraction of pixels with luminance at least 180. Testing the corresponding source rune's GP **ordinal** or **prime value** against either image statistic yields the following 100-cell **interior** Pearson correlations, excluding the row/column that specify the partition:

| Source label vs cell statistic | Observed interior correlation | ≥ absolute value among 10,000 original-label permutations |
| --- | ---: | ---: |
| Ordinal vs mean luminance | −0.08383 | 4,285 |
| Prime vs mean luminance | −0.08048 | 4,460 |
| Ordinal vs white fraction | −0.09010 | 3,968 |
| Prime vs white fraction | −0.08762 | 4,102 |

Largest absolute observed correlation is **0.09010**; among 10,000 seeded interior-label permutations, **4,317** achieve an equal or larger maximum across these four measures. Direct mean-luminance normalization to indices 0–28 agrees with only **4 of 121 original rune indices**. These are bounded negatives for brightness-as-rune decoding. Bright text is overlaid on the image and the tree is low-contrast; other image features are untested. The 180 threshold is a declared measurement choice, rather than a clue-specified threshold. The permutation counts are conditional diagnostics, not discovery-wide probabilities.

A second test asks whether the source-image **121-cell white fraction** is an event mask for the previously observed sparse within-word T6(x)=24−2x mod29 lag-six relation. Read the mask at **phase zero** (no fitted shift) at either book-global or page-local original rune index modulo 121. All **1,290 original eligible within-word lag-six positions**, including **80 T6 hits**, were included. Each hit-versus-nonhit brightness difference was ranked against all **121 cyclic rotations** of the mask.

| Fixed phase-zero mask clock | T6-hit minus nonhit brightness | Positive rank among 121 shifts | Two-sided absolute rank among 121 |
| --- | ---: | ---: | ---: |
| Whole-book rune offset | +0.0057853 | 35 | 77 |
| Physical-page-local rune offset | +0.0039161 | 51 | 98 |

Neither unshifted source-aligned clock is distinguished from cyclic rotations. Selecting the best fitted shift would violate the original-cipher prediction contract. This rejects the two literal brightness-mask selectors only. No source-defined selective T6 event rule has emerged from the image tiling.

## Nested p32 ring, signed payload length, and Möbius structure

The Parable's wording about shedding circumferences motivates removing the outer three borders of the 11×11 p32 GP-prime square, leaving its central 5×5. The 16-cell perimeter, clockwise from its top-left cell, is:

`[67,47,19,89,53,89,107,61,37,109,107,79,41,107,17,107]`

Its sum is **1,136**, exactly the byte length of the PGP-authenticated signed 2016 payload `resources/historical/cicada2016-4gq25-outguess.asc`. This is an exact cross-artifact equality, but by itself does not specify an extraction.

### Four-side matrix and the corner-ownership ambiguity

The originally proposed clockwise four-side sums were **N=275, E=257, S=373, W=231**. Their actual geometric convention matters. They are a **corner-exclusive** partition of the 16 perimeter glyphs: the north and south rows take **five cells each, including all four corner cells**, while east and west take **three interior cells each**. With row-major placement, this yields:

\[
M=\begin{pmatrix}14&25\\25&28\end{pmatrix}\pmod{29},
\qquad f(x)=\frac{14x+25}{25x+28}\pmod{29}.
\]

Under this particular allocation, \(\det M=28=-1\), trace \(13\), \(f(13)=24\), and the projective map has order **7**, finite fixed points **22** and **25** and four seven-cycles on \(\mathbb P^1(\mathbb F_{29})\). The row-major single-count rule has a simple geometric reading: the top and bottom are complete five-cell rows, while east and west contain only their three interior cells, so each perimeter glyph is counted once. This is a plausible human operation, not an explicit source instruction; other corner allocations remain possible.

The geometrically conventional alternative, summing all five cells on **each inclusive side**, counts the four corners twice and yields sides **[275,347,373,339]**, matrix **[[14,28],[25,20]]** modulo29, determinant **15**, trace **5**, projective order **28**, and \(f(13)=17\). This is also a legitimate reproducible map, with a different cycle structure. Another natural alternative, dividing the clockwise 16-rune sequence into equal consecutive four-cell quarters from the top-left, yields sides **[222,310,332,272]**, matrix **[[19,20],[13,11]]** modulo29, projective order **5**, and \(f(13)=1\).

For a finite sensitivity test preserving the physical geometry, assign each of the four corner glyphs to exactly one of its two adjacent sides and assign each of the twelve noncorner glyphs to their unique respective sides. There are precisely **16** possible corner-ownership assignments. The prior horizontal-corner choice is the only one of these 16 with the **joint** numerical signature (trace13, determinant28, projective order7, \(f(13)=24\)); indeed it is also the only order-7 choice. Rotating the four-cell-quarter partition through all **16** ring origins yields **none** with the joint signature. These are exhaustive conditional counts; by themselves they do not establish that the maker specified the horizontal choice. The source-side selectors below are evaluated separately.

The adjacent p33–39 cuneiform prime-rank selector documented below favors the horizontal single-count rule, conditional on its prime-rank interpretation. A second source-derived candidate selector comes from the p32 red mark: its nine-row occupancy maps to the fixed-point pair {22,25}, and only one of the 16 legal corner assignments has that pair. The red-mark result is detailed below with its source-preserving null. Together these cross-source constraints favor M7 over the inclusive-side order-28 map, but neither authenticates a cipher readout. The repeated mark stencil and unspecified binary coding keep the red-mark selector provisional; the alternative order-28 map remains an exact algebraic relation to LP1, not a demonstrated decryption. [Source-asserting enumeration](../sims/tree121_mobius_corner_conventions_sft.cjs) and [successful original-input manual CI](https://github.com/FlareZ123/liber-primus/actions/runs/42949089685).

### Red-mark row code: fixed-point selector candidate

The original p32 JPEG geometry SFT measures 13 red components in nine rows **[1,2,1,2,1,2,1,2,1]** and three columns **[4,5,4]**. Encode a one-dot row as 1 and a two-dot row as 0: `101010101₂=341`; the complementary polarity is `010101010₂=170`. Modulo 29 these give the unordered pair **{22,25}**. The row-major single-count matrix `M7=[[14,25],[25,28]]` has exactly these two projective fixed points. Across all 16 corner-ownership assignments, **only mask 4** (top and bottom sides own all four corners; left and right contain only their interior cells) has fixed-point set {22,25}; that matrix has projective order 7. The inclusive-side alternative `C=[[14,28],[25,20]]` instead has fixed points {20,25}, so this row code favors M7.

A source-preserving conditional null shuffles the 100 p32 interior prime values while holding the first row and first column fixed, then checks all 16 corner assignments. With 200,000 trials and seed `0x56356929`, the fixed horizontal mask matches the pair in **224** trials (add-one frequency **0.001125**); some corner assignment matches the pair in **3,104** trials (**0.015525**); some assignment matches the pair **and** has order 7 in **632** trials (**0.003165**). Singular matrices are excluded and the exact fixed-point set is required. These are conditional frequencies, not discovery-wide p-values.

This is a source-derived selector candidate, not a plaintext decryption or proof of authorial intent. The same 5+8 stencil recurs on p53 and two solved-p56 marks, and the binary coding/polarity is not explicitly prescribed. The symmetry still does not choose an orientation. Reproducer: [fixed-point selector SFT](../sims/p32_redmark_fixedpoint_selector_sft.cjs), using the original-image geometry from [red-mark geometry SFT](../sims/p32_red13_mark_geometry_sft.py).

### The p32 source counts reconstruct the selected order-seven map

A further exact relation substantially constrains the projective orientation without consulting candidate plaintext. Physical p32 has **22 printed words**, its peeled central square has **25 cells**, and its first punctuated clause has **7 words**. The selected row-major matrix M7 has fixed points 22 and 25. In the ordered fixed-point coordinate `h(x)=(x−22)/(x−25)`, its action is exactly `h(M7(x))=7h(x) mod29`.

Conversely, those source counts reconstruct the same projective map. Taking ordered fixed points 22 and 25 with multiplier 7 gives the representative `N=[[8,6],[6,16]]`. The p32 red mark has **nine occupied rows**, and `9N mod29 = [[14,25],[25,28]] = M7`, exactly the representative independently obtained from the single-count ring side sums. Projective scaling is mathematically irrelevant, so the nine-row equality is supporting source structure rather than extra cipher state.

The signed 2016 instruction specifically describes the book's **words** as a map and their **numbers** as direction. Under the GP-prime numbering used throughout this p32 route, the fixed point **22** has a direct source interpretation unavailable to fixed point 25: p32 contains exactly 22 words, so 22 is the only member of the pair that is a valid page-local word address. The **22nd word**, `ᚪᚷᛒᛇ` (`AGBEO` in the repository transliteration), has GP-prime sum **216 = 7×29 + 13**. Its base-29 quotient independently repeats the map multiplier **7**, while its remainder independently repeats the mark's **13 red dots**. Feeding that remainder into M7 yields **24**, exactly `3301 mod29`, matching the adjacent cuneiform / historical Cicada number already tied to the page.

The source chain is therefore unusually compact: fixed points **22/25** align with **22 words / 25 central cells**; word 22 has number **216 = 7×29+13**; the first clause independently contains **7 words**; the mark independently contains **13 dots in 9 rows**; the nine rows scale the count-derived projective representative to the exact ring representative; and the seed **13** maps to **24 = 3301 mod29**. The GP-prime interpretation of “number” remains an interpretive choice, although it is independently motivated by the puzzle's established prime-number machinery.

The existing source-preserving shuffle was extended with these locked conditions. Holding p32's first row and first column fixed and shuffling the other 100 source prime values, the ordered map signature **fixed points 22,25 + multiplier 7** occurs in **108/200,000** trials under any of the 16 legal corner assignments and **6/200,000** under the original horizontal assignment. The exact selected word-22 sum **216** occurs in **2,064/200,000** shuffles. Requiring both the complete map signature and the exact word-22 sum leaves **3/200,000** trials under any legal assignment and **0/200,000** under the original horizontal assignment. Add-one conditional frequencies are therefore about **0.000020** and **0.000005** for the joint any-assignment and fixed-horizontal tests. These are post-discovery conditional frequencies, not discovery-wide probabilities.

This strengthens the evidence that the row-major order-seven map is a genuine p32 structural object and gives a source-motivated forward orientation. It still supplies no authenticated ciphertext readout, key, or unknown plaintext. The next discriminating test should use this fixed orientation to make a locked prediction on another original artifact. The updated [fixed-point selector SFT](../sims/p32_redmark_fixedpoint_selector_sft.cjs) asserts the count reconstruction, word-22 decomposition, and exact deterministic-null totals.
### Inclusive-side map is the conjugate cube of the earlier two LP1 Möbius squares

**Evidence class:** exact original-source algebra plus a finite original-rune inverse that fails to recover plaintext. This relation is *conditional on the inclusive-side convention* described above. It is more specific than the earlier order-seven corner-exclusive analogy, but it still lacks an independent authorial instruction selecting the matrix reading or the cipher.

The previously reproduced LP1 scan-05/scan-16 corner matrices are

\[
A=M_{05}=\begin{pmatrix}11&6\\6&11\end{pmatrix},
\qquad
B=M_{16}=\begin{pmatrix}28&9\\9&28\end{pmatrix}
=21A^6\pmod{29}.
\]

Their original integer corners are `[[272,151],[151,272]]` and `[[434,966],[966,434]]` (the latter belongs to the original p16 5×5 square). The source p32 **conventional inclusive-side** ring matrix is

\[
C=\begin{pmatrix}275&347\\373&339\end{pmatrix}
\equiv\begin{pmatrix}14&28\\25&20\end{pmatrix}\pmod{29}.
\]

Set \(Q_{28}=\begin{pmatrix}17&8\\0&1\end{pmatrix}\), whose projective action is \(Q_{28}(x)=8-12x\pmod{29}\). Both entries now have a source-geometric construction: **12=563 mod29** is the signed image width residue, and **8=16/2** is half the 16-cell p32 inner perimeter. The latter also happens to be the mean of \(C\)'s fixed points 20 and 25, but it need not be selected from the target matrix. Exact source arithmetic gives

\[
C\sim Q_{28}A^3Q_{28}^{-1},\qquad C^2\sim Q_{28}BQ_{28}^{-1}\pmod{29},
\]

with the particular integer representatives satisfying \(C=3Q_{28}A^3Q_{28}^{-1}\) and \(C^2=17Q_{28}BQ_{28}^{-1}\). The scalar factors are projectively irrelevant, not extra key material.

This means the conventional p32 map is an affine conjugate of the **third power** of the previously documented 2014/LP1 `MOBIUS` square, and its square is conjugate to the other earlier square. The 11×11 p32 grid supplies **11**, the signed image's prime-dimension difference 569−563 supplies **6**, and these form \(A=[[11,6],[6,11]]\) numerically; the central 5×5 ring is reached by removing **three** outer layers from the 11×11 grid. These are exact source correspondences, but the choice of matrix convention and the use of a cube were recognized after the available inputs had been explored. Algebraic conjugacy by itself does not specify a cipher or a key.

On the complete projective line \(\mathbb P^1(\mathbb F_{29})\), \(C\) has **one 28-cycle and two fixed points (20 and 25)**. Its natural coordinate

\[
h(x)=\frac{x-25}{x-20}\pmod{29}
\]

turns the matrix action into multiplication by **8=2³ modulo29**. This source-selected cycle enables a complete, explicit **29-symbol reversible feedback cipher hypothesis**: replace projective infinity in the 28-cycle by either excluded fixed point, reserve the other as the literal escape symbol, interpret a repeated state as GP EA, and label positive orbit steps either directly or through the original LP1 Cayley exponent (multiplication by 3 modulo28). With the original LP1 `MOBIUS` seed **226 mod29=23** transported through \(Q\) to source state **22**, test book-global or physical-page clock reset. All **eight** combinations are exactly reversible and can independently encode and recover an authentic 12,956-symbol GP English plant. Applied instead to the **original 12,956 ciphertext runes**, all fail to recover readable text:

| Full original-input result | Recovered GP29 IoC | GP trigram average |
|---|---:|---:|
| Undecoded original LP2 | **0.034478** | **−11.8603** |
| All eight source-cycle inverses | **0.035197–0.035262** | **−11.8852 to −11.8583** |
| Independent Emerson GP holdout, 12,000 runes | **0.062545** | **−7.8751** |

The inverse is therefore a **bounded negative** for the declared source-cycle transports, despite the exact matrix relations. [Original-source single-file inverse and 12,956-rune positive controls](../sims/tree121_inclusive_mobius_lp1_cube_inverse_sft.cjs) · [successful manual CI](https://github.com/FlareZ123/liber-primus/actions/runs/42951200200).

### Nested row-major and inclusive maps: a source-derived cross-round chain

The two p32 matrices are not unrelated alternatives. Let \(M_7\) be the row-major single-count 5–3–5–3 matrix and \(C=M_{28}\) the inclusive-side matrix. Define

\[
S=\begin{pmatrix}11&8\\0&1\end{pmatrix},\qquad S(x)=11x+8.
\]

Then the original-source matrices satisfy the exact projective identity

\[
M_7\sim S\,C^4\,S^{-1}\pmod{29}.
\]

Here **11** is the outer p32 square's side length, **8** is half the 16-cell inner perimeter, and **4** is the number of sides. Since \(C\) has projective order 28, its fourth power has order 7, matching \(M_7\). This makes the row-major single-count map a geometrically simple fourth-power transform of the inclusive map, rather than an unrelated competing matrix.

The LP1 p05 corner matrix \(A=[[11,6],[6,11]]\) completes the chain:

\[
C\sim Q_{28}A^3Q_{28}^{-1},\qquad
M_7\sim Q_7A^{12}Q_7^{-1},\qquad
Q_7=SQ_{28}=\begin{pmatrix}13&9\\0&1\end{pmatrix}.
\]

The \(Q_7\) parameters are also source-derived: **13** is the original p32 red 13-dot mark count, **9** is half the signed image-height residue \(569\bmod29=18\), and **12=3\times4=563\bmod29** is both the three peeled layers times four sides and the image-width residue. A second coordinate convention \(Q_2(x)=16x+9\) with \(A^{16}\) gives the same \(M_7\); it is related to \(Q_7\) by the reflection \(x\mapsto-x\), so this is an orientation representation, not a second map. A bounded search over slopes \(\pm\{12,18,13,16\}\), translations \(\pm\{9,8,16,13,3,5,6,11\}\), and all exponents 1–28 finds only two distinct affine parameterizations for each target: \(M_7\) has \((a,b,k)=(13,9,12)\) or \((16,9,16)\); \(C\) has \((17,8,3)\) or \((12,8,25)\). This is a finite source-vocabulary check, not an exhaustive search over all projective transformations.

### Adjacent cuneiform prime ranks select the nested Möbius parameters and orientations

The repeated cuneiform immediately following p32 gives sexagesimal **(17,13)=1033** and **(55,1)=3301**. These are also the magic constants of the two LP1 5×5 squares used above. The LP1 source explicitly says that the primes and the totient function are sacred, making a one-based prime-rank reading source-motivated rather than an arbitrary number transform. The ranks are **174** and **464**, with

| Cuneiform / LP1 magic sum | Prime rank | rank / 29 | rank / 58 |
| --- | ---: | ---: | ---: |
| 1033 | 174 | **6** | **3** |
| 3301 | 464 | **16** | **8** |

All four quotients are parameters already present in the independently derived p32/LP1 chain: **6** is the exponent in `B~A^6`; **3** is the peeled-layer count and exponent in `M28~Q28*A^3*Q28^-1`; **16** is both the p32 inner-5 perimeter size and the slope/exponent in `Q2*A^16*Q2^-1~M7`; **8** is the half-perimeter and the translation in both `Q28(x)=17x+8` and `S(x)=11x+8`. Thus the adjacent source reproduces the nested map's 6/3/16/8 parameter set without fitting those values to language output.

More importantly, **174 resolves two finite source ambiguities under this same reading**. Enumerating all 16 legal single-count corner assignments of the 16-cell p32 ring, only the horizontal row-major ownership `[N,N,S,S]` produces any projective cycle whose finite-state GP-prime weights sum to 174. The unique cycle is

`2 → 7 → ∞ → 11 → 16 → 10 → 8 → 2`,

whose six finite GP-prime weights total **174**. This is exactly the previously derived order-7 `M7` convention. Separately, among the eight dihedral orientations of the conventional inclusive-side matrix, only the source NESW orientation has finite fixed points **20 and 25**, whose GP-prime weights **73+101=174**. The adjacent cuneiform therefore supplies a concrete discriminator for both the single-count corner ownership and the inclusive-side orientation, conditional on prime ranking.

The explicit LP1 totient instruction gives a secondary exact closure: `φ(174)=56=8×7` and `φ(464)=224=8×28=32×7`, where 8 is the p32 half-perimeter/table width and 7/28 are the two projective orders. This arithmetic is retained as a structural lead, not yet used as a cipher or key schedule.

This materially strengthens the nested Möbius route: the formerly retrospective ring conventions are now selected by a source immediately adjacent to p32 and by numbers already tied to the LP1 MOBIUS squares. It still does **not** recover unknown plaintext or specify the readout/state update. Direct order-7/order-28 rune inverses already documented below remain negative, so the next useful step must use the newly fixed map as a selector or navigation mechanism rather than repeat periodic-key scans.

Reproduction is integrated into `sims/tree121_mobius_nested_crossround_sft.cjs`, which asserts the prime ranks, all four quotient/parameter identities, the complete 16-way corner enumeration, and the eight inclusive orientations.

The row-major map also has two independent solved-round anchors. Its fixed points are **22 and 25**, whose GP-prime weights **83+101=184** equal the first body word **LIKE** on solved p57 under the standard GP normalization \(L,I,C,E\) (K maps to C). It also sends the p32 13-dot count to **24**, exactly \(3301\bmod29\). The seven-cycle through 13 is \(13\to24\to19\to3\to6\to20\to17\to13\). The six finite states in the cycle containing projective infinity are \(\{2,7,8,10,11,16\}\); their GP-prime weights sum **174=6\times29**, also the prime-weight sum of the inclusive map's fixed points 20 and 25. These are exact cross-artifact equalities, not recovered prose. The original p32 JPEG (49.jpg, 2400×3600) has **13 red components** in nine rows **[1,2,1,2,1,2,1,2,1]** and three columns **[4,5,4]**. The decomposition into five central-column dots and eight lateral dots is reproducible. Independently, original p53 (70.jpg) and **two solved-p56 markers** (73.jpg) exhibit the **identical stencil**; after centering, all corresponding dot positions agree within **0.71 original JPEG pixel**. Therefore this is **generic 13-dot punctuation artwork** and the 5/8/9 geometry cannot independently support p32-specific nested Möbius parameters or select an orientation. Exact source arithmetic remains unaffected. [p32 measurement](../sims/p32_red13_mark_geometry_sft.py) · [cross-page source SFT](../sims/lp2_marker_template_source_sft.py).

A conditional null tested the nested identity directly. It held the 21 first-row/first-column p32 values fixed, permuted the other 100 original GP-prime values without replacement, and evaluated all 16 legal single-count corner assignments on each of 200,000 draws (xorshift32 seed 0x56356929). The fixed horizontal-row ownership reproduced \(M_7\sim SC^4S^{-1}\) in **29/200,000** draws; allowing any of the 16 corner assignments produced at least one match in **144/200,000** draws (**153** matching assignments total). The plus-one fractions are \(30/200001\approx0.000150\) for the fixed row-major rule and \(145/200001\approx0.000725\) after the 16-way assignment search. This is conditional on the p32 axes and prime inventory; the clue family was recognized retrospectively, so neither fraction is a discovery-wide significance test.

This nested algebra gives a plausible human solve path—solve the 2014 \(MOBIUS\) square, use the Parable's “shed circumferences” to isolate p32's central ring, read its complete horizontal rows once, then use the signed 2016 dimensions and red mark to fix the affine coordinates. It does **not** yet specify how to turn the seven-cycle into an original-cipher key or a route through words/positions. Direct rune substitution, period-seven state-stream and related inverses remain negative; do not repeat them. [Source-derived nested-map SFT](../sims/tree121_mobius_nested_crossround_sft.cjs).

### The HOME/BUDS cross-ratio word landmark and its limited +60 continuation

The separately identified unique literal ciphertext substrings **HOME** (p32 offset33) and **BUDS** (p32 offset93) are five rows and five columns apart on the original 11×11 matrix, or exactly **60 row-major rune positions**. With the new conventional \(C\)'s fixed points, the source-native Cayley mapping \(h(x)=(x-25)/(x-20)\) gives

- `HOME` GP indices **[8,3,19,18]** → field elements **[28,3,6,18]**, product **24 mod29**.
- `BUDS` GP indices **[17,1,23,15]** → **[22,15,9,2]**, product **24 mod29**.
- Continuing the independently noted **+60** offset once more to global rune **7,992**, p33 local rune32, selects original **MYDB** GP indices **[19,26,23,17]** → **[6,5,9,22]**, product again **24 mod29**.
- The following +60 hop selects p33 local rune92, **THEOIF**, whose four-rune field product is **23**, terminating the three-hit sequence. The p33 MYDB interval straddles an original **word boundary** and thus does not independently verify the signed message's *words* instruction.

The result `24` is both **3301 mod29** and GP rune-index24, traditionally Ac (“oak”); the independent historical image is a tree. These are *retrospective cross-source correspondences*. Exact equalities at three consecutive 60-spaced four-grams and their explicit fourth-hop failure make a testable structural clue, but cannot be treated as recovered plaintext, an established checksum rule, or a statistical proof of intentional embedding.

### Fixed-axis conditional source test of the cubic relationship

Freeze all **21 first-row/first-column p32 GP-prime values**, retaining the independent image-width/height checksums exactly, and deterministically shuffle the other **100 source GP-primes** without replacement. Over **200,000** draws (xorshift32 seed `0x56356929`), the original conventional map's characteristic data \(\operatorname{tr}=5,\det=15\), equivalent to scalar-conjugacy to \(3A^3\), occur **246** times. Only **16** of those also have finite-fixed-point half-separation **±12 modulo29** matching the source image width residue. The central-ring sum exactly **1,136** occurs separately **31** times, and **zero** satisfy both the cubic/image-width criteria and ring sum simultaneously. The conditional finite-sample plus-one fraction for the cubic-plus-width property is **17/200001≈0.000085**. These events and their selection depend on exploratory source choices: the inclusive corner convention, cube exponent, target trace/determinant, and field-width relationship were all recognized retrospectively. **They are not a discovery-wide significance test or a cryptographic success criterion.**

[Original-input SFT with all 200,000 shuffles and the 60-step checksum continuation](../sims/tree121_inclusive_mobius_cube_null_sft.cjs) · [manual CI run](https://github.com/FlareZ123/liber-primus/actions/runs/42952122816).

### Cross-artifact constraints

These are exact modular correspondences, not fitted parameters:

| Source quantity | Residue / invariant | Independent match |
|---|---:|---|
| 2016 image width, 563 | (12\pmod{29}) | 2014 magic-square centre, (331\equiv12) |
| 2016 image height, 569 | (18\pmod{29}) | 2014 7×7 magic constant, (1033\equiv18); also the sum (22+25=47\equiv18) of the row-major order-7 map's fixed points |
| 2016 image area, (563\times569) | (13\pmod{29}) | p32's 13-dot mark and (\operatorname{tr}(M)=13) |
| Cicada number, 3301 | (24\pmod{29}) | (f(13)=24) |
| p32 inner-5 perimeter | (1,136) | signed 2016 payload length, 1,136 bytes |

The image-dimension residues are also consistent with the p32 tiling already established: the top-row and left-column prime sums are exactly 563 and 569. The 16 ring cells plus the 13-dot count total 29, the GP alphabet size; this count identity is suggestive but does not yet specify a mapping. The projective point at infinity supplies a natural 30th state for the 29-symbol alphabet, but identifying it with the 13-dot mark remains a hypothesis.

This is a **source-anchored Möbius/map hypothesis**: p32 supplies the ring, and the adjacent cuneiform prime-rank reading now selects the original seven-cycle corner allocation within the declared 16-way finite family. The prime-rank reading itself remains a hypothesis rather than a recovered cipher instruction. The earlier LP1 MOBIUS reference suggests the operation family; the 2016 image and 2014 square supply retrospective checks on the chosen matrix's invariants. The seven-cycle alone cannot establish the historical selection rule and does not recover plaintext.

### Bounded direct-use tests

The matrix is not itself a successful direct decryption under the simplest interpretations:
- Applying (f) or (f^{-1}) as a monoalphabetic substitution to p32 produces no readable text.
- Using M7 or M7^-1 as a 2×2 Hill transform on the global 12,956-rune unsolved stream produces no language recovery: raw IoC/quadgram are 0.0344784/−7.43975; applying M7 gives 0.0344769/−7.52179; applying M7^-1 gives 0.0344699/−7.52416. The overlapping-pair consistency interpretation matches 438/12,954 positions (0.03381, near 1/29), so direct block/ratio use is rejected.
- Using the orbit of 13 as an additive period-7 state stream, with red 13-dot marks resetting the state, leaves the full-book IoC near the raw-ciphertext value (about 0.0345).
- Applying successive powers of (f) as a period-7 polyalphabetic substitution, including red-13 reset variants, also fails to produce language and creates many projective-infinity outputs.
- Four small internal separator dots plus 12,956 runes give 12,960 = 30×432, matching the 30 states of P^1(F29) as a possible 30-column layout. Direct M7/inverse column orders and row-wise column permutations were tested with the four dots inserted as events; none improves the raw English quadgram score. The count relation remains an unresolved structural observation, not a successful transposition.
- Treating the 16 prime values as a direct period-16 additive GP29 key (ordinal or prime-residue representations, both signs, global or page-reset clock) gives IoC 0.0344554–0.0345361 versus raw 0.0344784. An independently executed extension tests both ring directions, both GP value conventions, both signs, book/page clock, and a reversible cyclic GP28 predecessor-exclusion channel with transparent 86 repeat markers and either marker-clock convention: **48 unique original-input models**, all exactly reencrypted; best decoded IoC **0.03530621** against raw **0.03447840**, no plaintext. Source-native Shakespeare-GP plants invert exactly. [Extension SFT](../sims/tree121_outguess1136_ring_sft.cjs) · [successful manual-only CI](https://github.com/FlareZ123/liber-primus/actions/runs/42947565244). Treating the original 16 prime values as sequential byte-segment lengths consumes the payload exactly but does not align boundaries with its natural message lines or words.

These negatives reject the direct uses tested, not the matrix as a structural map, selector, coordinate transform, or state-generation mechanism. The four 7-cycles and two fixed points may be the relevant output; their intended use remains unresolved.

### Source-composed order-28 Mobius plus solved prime-totient clock (Agent 10, 11 November 2026)

A further **reversible original-input cipher test** combines the exact p32 inner-ring inclusive-side projective order-28 orbit above with the **authentic solved-p56 prime-totient sequence** \(\varphi(p_n)=p_n-1\), reduced modulo 28. Under this concrete hypothesis, each output glyph selects one of 28 transitions on the ring's source-derived cycle, a fixed-point glyph represents a literal reserved symbol, and the totient shifts the transition rank. The original p32 tree checksum 563×569 and the source 1,136-sum ring fix the matrix; the source of the evolving shift is the solved-p56 mechanism. The missing historical instruction **still** does not select this composition, its sign, reset clock, reserved-state interpretation, or reserved-step consumption.

Exactly **16** fixed variants cover two embeddings of projective infinity (20 or 25), both totient signs, book-continuous versus physical-page resets, and whether the reserved literal consumes a totient step. All consume the **12,956 unchanged original ciphertext runes** and retain every physical-page boundary. The full original GP29 outputs have IoC **0.03447947–0.03453932** versus raw **0.03447840**, with no identifiable native-GP plaintext. Every candidate re-enciphers all 12,956 original symbols, and every corresponding independent Latin-Vulgate GP plant is recovered exactly (control IoC **0.07229229**). The new original-input combination therefore supplies no evidence for plaintext or an intended cipher. It closes this specific 16-member operator composition without extrapolating to unknown keys or other source-defined state clocks. [Standalone CommonJS reproducible test](../sims/p32_mobius_totient_rank28_original_sft.cjs).

## Source-word GP-prime walk from the 33-rune clause to the signed PGP delimiter

The p32 print text, read page-locally and preserving its original word punctuation, divides into **7 words / 33 runes** before its first period and **15 words / 88 runes** afterward. The first seven printed word lengths are **[1,3,5,11,5,5,3]**, all odd, with exactly three 11-rune rows. Across all **219 page-local punctuated clauses** on the 55 rune-bearing unknown LP2 pages, **12** have seven words and **only this one** has seven odd word lengths. The source-selected first **33** runes have GP-prime sum **1,467**. Subtracting the independently located central 5×5 ring perimeter of **1,136** gives the 2014 seventh-onion magic-square center and HTML div **331**. These are exact source arithmetic identities; the historical cipher operator is still undetermined.

The *signed 2016 message itself* says: **“Its words are the map, their meaning is the road, and their numbers are the direction.”** This motivates a finite, human-executable candidate: measure each printed p32 word by its GP-prime sum, start at byte zero of the historically archived signed message, and advance cumulatively modulo the **1,136-byte** source length fixed by the 16-rune ring. For the first seven p32 words:

| Original word ordinal | GP-prime step | Cumulative signed-message byte offset (zero-based) | Independently recognizable marker |
| ---: | ---: | ---: | --- |
| 1 | 73 | 73 | Signed-message prose |
| 2 | 125 | 198 | Signed-message prose |
| 3 | 267 | 465 | PGP signature Base64 |
| 4 | 613 | 1,078 | PGP signature Base64 |
| **5** | **191** | **133** | Historical 2014 seventh-onion HTML title **133** (numeric match; the selected byte is prose) |
| **6** | **184** | **317** | **First byte** of literal `-----BEGIN PGP SIGNATURE-----` delimiter |
| **7** | **14** | **331** | **Center byte** of that same **29-byte** delimiter, ASCII space (byte 32); independently 2014 square center **331** |

The seventh word's step of **14** is exactly half of the 29-byte delimiter's span after removing the central byte: its midpoint is byte **317+14=331**. The cumulative sum of the first seven word weights is **1,467**, so the landing at 331 is algebraically determined by the 1,136-byte ring length. The first five land at 133, and the sixth advances to an independently meaningful original-file boundary. This is a plausible candidate clue-chain, **not an authenticated key or decipherment**. Its main vulnerability is model-selection freedom: the 5×5 ring and byte-walk interpretation were recognized after scanning source correspondences, and mere accidental offsets into an ASCII signature are possible.

On the exact 121-source-rune p32 page, a deterministic 200,000-shuffle conditional null keeps the 21 top-row/left-column glyphs fixed (preserving the 563×569 image-dimension checksum) and shuffles the remaining 100 original runes, holding all other rune counts and source geometry. The counts are **26/200,000** for ring sum 1,136, **425/200,000** for first-clause sum 1,467, **31/200,000** for their difference 331, and **1/200,000** for both exact sums. The ring sum is unusually high on this constrained null (708/200,000 shuffles reach or exceed it). These retrospective conditional frequencies cannot be interpreted as a prespecified discovery-wide p-value. They justify retaining the clue as an intermediate source hypothesis, not promoting it to established decryption.

For all **22** printed p32 words the exact cumulative prime sum is **6,045 = 5×1,136+365**. The final word therefore lands at *zero-based byte 365*, which is the **last ASCII newline immediately before the actual signed RSA Base64 payload**, beginning at byte **366** (`iQIc...`). Thus the earlier sixth-word destination at byte **317** is the literal start of `-----BEGIN PGP SIGNATURE-----`, the seventh-word destination at **331** is its central space, and the final-word address is the separator at the start of the actual signature data. The selected intermediate ASCII bytes do not otherwise form an intelligible sentence.

### The selected OpenPGP packet repeats p32's 3/6/16/8 geometry

The word walk continues inside the selected artifact. Decoding the exact 543-byte OpenPGP signature gives a **3-byte old-format packet header** and a **540-byte V4 signature body**. The first word of p32's second clause is `HOMEXWDSLFD`; its GP-prime sum is **540**, exactly one packet body. The V4 body then supplies fixed coordinates for the same four values selected by the adjacent cuneiform prime ranks:

| Cuneiform selector | p32 source geometry | Selected OpenPGP packet coordinate |
| ---: | --- | --- |
| **3 = 174/58** | first clause = 33 runes = 3 complete rows | outer packet header = **3 bytes** |
| **6 = 174/29** | 11×11 square has **6** concentric layers | hashed-subpacket data length = **6 bytes** |
| **16 = 464/29** | central 5×5 perimeter = **16 runes** | Issuer Key ID payload begins at body offset **16** |
| **8 = 464/58** | second clause = 88 runes = **8** complete rows | Issuer Key ID payload is **8 bytes** |

RFC 4880 defines these V4 fields and subpacket type 16 as the eight-octet Issuer Key ID. In this packet the issuer payload at body offsets 16–23 is `181f01e57a35090f`, ending in the source-visible verification ID **`7A35090F`** ([§5.2.3](https://www.rfc-editor.org/rfc/rfc4880#section-5.2.3), [§5.2.3.5](https://www.rfc-editor.org/rfc/rfc4880#section-5.2.3.5)).

The inclusive-side p32 Möbius map adds a second exact packet-coordinate check. Its projective order is **28**, exactly the packet body's **28-byte metadata prefix** before the 512-byte RSA signature MPI. Its fixed states are **20 and 25**, whose GP-prime weights sum **73+101=174**, the first cuneiform prime rank. Read as zero-based inclusive positions in that 28-byte prefix, they select `7A 35 09 0F F0 65`: the first four bytes are the verification ID printed by the authenticated message, while the final two are the V4 packet's left-hash check `F065`. The selected span length is **6 = 174/29**.

This is a verification-oriented source chain rather than a recovered cipher key. p32 selects the signed artifact, its clause boundary supplies the 540-byte body, the cuneiform ranks reproduce packet coordinates, and the retained order-28 map selects bytes that OpenPGP itself uses for identification and signature checking. It materially strengthens the intended-navigation hypothesis while leaving the post-verification LP2 operation unresolved. Exact assertions are frozen in `sims/p32_2016_signed_wordmap_sft.cjs`.

The final byte offset is also the **decimal reversal of the source image width**, `reverse(563)=365=5×73`, with **73** the GP-prime weight of the original p32 top-left rune. The other signed dimension gives `reverse(569)=965=5×193`, where **193** is the unchanged original p50 table cell selected by the signed message's `lies` word under the separately proposed base58 address. The historically archived 2013 `number` exercise used decimal-digit reversal followed by factoring, making these exact relationships plausible source-operations. This does **not** establish that the creator intended their combination; neither the factorization nor the landing independently defines the LP2 cryptosystem.

**New original-cipher test of the signature as key source:** decode the exact ASCII-armored 2016 signature into its complete **543-byte OpenPGP packet**, or take the naturally parsed **512-byte RSA signature MPI**. Turn each into GP29 key digits using direct octet residues modulo29 or the historically illustrated whole-integer **BASE29** conversion (key lengths **543, 895, 512, 843**). Under two signs and a book-global or physical-page reset clock, **16** explicit additive GP29 inverses cover every one of the original **12,956** unsolved runes, reencrypting exactly. All recovered IoCs remain **0.03445709–0.03451420** (original **0.03447840**, independently solved native plaintext p57 **0.06270997**); none recovers coherent original plaintext. This rejects these direct signature-key Vigenère readings and retains a source-selected signature packet as possible input to a different, as-yet-unspecified operation. Exact source-marker assertions and 16 complete inverses are in the existing [p32 signed word-walk SFT](../sims/p32_2016_signed_wordmap_sft.cjs). Similarly, a modest class of direct GP29 word-length positional additive inverses across all original unknown pages has IoC **0.03444–0.03452**, approximately the raw ciphertext baseline, with no plaintext recovery. The next decisive question is whether the **PGP delimiter-center landing** determines an independently executable payload/selector extraction from the historical signed bytes, with an original unknown-page prediction fixed before scoring.

**Source-asserting CommonJS SFT:** [sims/p32_2016_signed_wordmap_sft.cjs](../sims/p32_2016_signed_wordmap_sft.cjs), including original word offsets, the 29-byte header center, and the seeded constrained null. [Manual original-source CI run 42947442086](https://github.com/FlareZ123/liber-primus/actions/runs/42947442086) completed successfully on Node 22, reproducing every claimed exact source coordinate and all 200,000 null draws.

## Original 2016 tree direction-field discriminators

Two interpretations of the source p32 interior GP-prime numbers as local branch bearings were tested against **the authentic preserved signed 563×569 JPEG**, not resampled LP2 page art. The source's top-row and left-column GP-prime widths/heights define all 121 image rectangles. Both probes leave those exact dimensions and the 100 interior rune labels unchanged, remove pixels with a >=180 luminance sample in their 3×3 neighborhood, accumulate Sobel-gradient evidence in the interior rectangles, and compare the source label alignment against 100,000 same-label permutations.

| Source-fixed direction rule | Original match | Null mean | Null sd | Outcome |
| --- | ---: | ---: | ---: | --- |
| GP prime mod 4 as one of four undirected gradient-normal bins | 253,399.942 matched energy | 259,436.724 | 4,880.092 | Positive-tail **0.890741**, z=−1.237; unsupported |
| GP prime as a literal angle in degrees, continuous energy-weighted cos(2Δ) | 20,091.817 signed score | 5,435.276 | 12,684.034 | **Two-sided 0.251437**, z=+1.156; unsupported |

The mod4 source labels have counts **[0,43,4,53]** across bins 0–3: all GP prime weights except 2 are odd, so this interpretation is mathematically incapable of expressing the four directions evenly. The continuous-angle alternative treats the actual primes **2–109** as source-specified degree bearings, following the historical degree convention and avoiding the mod4 information loss. Its fixed two-sided statistic accounts for whether the printed angle is meant as the tree-branch tangent or the perpendicular Sobel normal. Neither original-image score is unusual enough to select a hidden instruction or decoding key.

The exact source image dimensions, p32 prime checksums, and the proposed ring/word map remain separate hypotheses. This pair of bounded failures retires these **specific** original-image orientation encodings, without excluding different independently instructed image extractions. Reproducers: [mod4 SFT](../sims/tree121_directional_field_sft.py) and [CI](https://github.com/FlareZ123/liber-primus/actions/runs/42947378636); [continuous-degree SFT](../sims/tree121_continuous_direction_sft.py) and [CI](https://github.com/FlareZ123/liber-primus/actions/runs/42947897238). Both are exposed as explicit probes in the existing manual-only `grid-256-tests.yml` workflow.

## Decision and next discriminator

The strongest current source lead is now the joined **p32/LP1 Möbius + signed-OpenPGP navigation chain**: the p32 word-sum walk reaches the authenticated signature, the adjacent cuneiform ranks reproduce its 3/6/16/8 packet coordinates, and the order-28 map selects verification bytes inside the packet. The central-ring sum = signed payload length = 1,136 remains the bridge into that route. The p33–39 cuneiform prime-rank selector and p32 red-mark fixed-point code now both favor the corner-exclusive order-7 map, conditional on their respective encodings. The red-mark row code gives {22,25}, and only one of 16 corner allocations matches; the source-preserving null's any-mask pair+order7 frequency is 0.003165. The repeated stencil and unspecified binary coding keep this provisional; no plaintext has been recovered. Direct monoalphabetic, pairwise Hill, period-7/28 state, and simple 30×432 transposition uses are negative. The next useful discriminator is a **source-prescribed traversal of the selected seven-cycle**, grounded in the signed instruction's words/map and numbers/direction, and frozen as a prediction on held-out LP2 or the 317→331 PGP transition. Do not reopen corner allocation, direct Hill/substitution, or arbitrary grid permutations.

**Reproducers and sources:**

**Reproducers and sources:** [sims/tree_prime_canvas_partition_sft.py](../sims/tree_prime_canvas_partition_sft.py) for p32 geometry and prior image negatives; [sims/p32_redmark_fixedpoint_selector_sft.cjs](../sims/p32_redmark_fixedpoint_selector_sft.cjs) for the mark-derived fixed-point selector and conditional null; [sims/tree121_directional_field_sft.py](../sims/tree121_directional_field_sft.py) and [sims/tree121_continuous_direction_sft.py](../sims/tree121_continuous_direction_sft.py) for completed original-image direction negatives; [resources/historical/cicada2014-openpuff-magic-squares.txt](../resources/historical/cicada2014-openpuff-magic-squares.txt) for the 7×7 square; [workplace/2016-image-dimensions-lag6-source-derivation.md](../workplace/2016-image-dimensions-lag6-source-derivation.md) for the signed-image coordinate derivation. This remains intermediate research, not an established decryption.
