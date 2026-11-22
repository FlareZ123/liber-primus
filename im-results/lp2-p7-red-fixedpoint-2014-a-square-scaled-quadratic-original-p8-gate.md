# LP2 p7 fixed-point polynomial × original 2014 magic square: a shared quadratic and a fixed p8 extraction

**22 November 2026, Agent 5. Exact new cross-source algebra, one 255-rune original-p8 extraction, no authenticated plaintext or author cipher.**

## Two independently readable original objects

The final five entire **red printed p7 words** have zero-based GP29 rune-index products **[11,26,8,15,2]** in source order. Read as ascending coefficients, the polynomial F(x) has

\[
F(x)=11+26x+8x^2+15x^3+2x^4,\qquad
F(x)-x=2(x-3)(x-4)(x^2-8)\pmod{29}.
\]

The first **two p8 red heading words** have products **[4,3]**, matching the two actual GF29 fixed points in their reversed printed order. This source-local result was previously established in [the p7/p8 original-red-polynomial analysis](lp2-p7-p8-original-red-polynomial-fixedpoint.md).

Independently, the genuine **first 2014 Cicada Stage10 5×5 magic square** with sum3301, reproduced verbatim in [the historical matrix source](../resources/cicada2014-openpuff-magic-squares.txt), has, under its unchanged full integer entries reduced mod29, the exact characteristic polynomial

\[
\det(xI-A)=x^5+5x^4+17x^3+27x^2+27x+19
=(x+5)(x+3)(x-3)(x^2-3)\pmod{29}.
\]

This is a different original square from the final 1033-sum five-square whose five split eigenvalues are the known source word CHANGE. The **3301** square has a genuine irreducible **two-dimensional quadratic eigenspace** x²−3 and another **one-dimensional eigenvalue3**.

## New cross-source structural connection

The quadratic parameters obey **8=3/4 mod29**, so their square roots in GF(29²) are related by

\[
\sqrt3=2\sqrt8
\]

up to the choice of sign. The **3** is the first of the independently recovered p7/p8 fixed points, and the **4** is the other. Dividing the actual 2014 square by two (using 2⁻¹=15 mod29) therefore moves its two quadratic eigenvalues **±√3** onto the two irreducible roots **±√8** of the independently printed p7 polynomial's fixed-point condition. Neither original source instructs this cross-year operation; it is an exact new source association with a possible ordinary modular-arithmetic coincidence explanation.

Let R=A/2 mod29. Then a source-fixed *matrix*, without any guessed eigenvectors or message bytes, is

\[
Q=F(R)-R=2(R-3I)(R-4I)(R^2-8I)\pmod{29}.
\]

For the complete historical A, Q has **rank 3**, so its fixed-point kernel has **rank 2**. A canonical projector onto exactly that kernel is

\[
\Pi=20(A^2-25I)(A^2-9I)\pmod{29},
\]

since A² has eigenvalues 25 (multiplicity1), 9 (multiplicity2), and 3 (multiplicity2), and the inverse of (3−25)(3−9)=16 mod29 is20. Evaluating the original 25-cell square gives precisely

\[
\Pi=
\begin{pmatrix}
9&23&23&23&9\\
23&9&23&9&23\\
23&23&24&23&23\\
23&9&23&9&23\\
9&23&23&23&9
\end{pmatrix}\pmod{29}.
\]

The source-complete equalities **Π²=Π, rank Π=2, QΠ=0** hold exactly. This is an unusually compact, keyless **five-input/two-output linear filter** based on two separately printed artifacts. Its discovery is post-observation. Because any two nonsquare quadratic parameters in GF29 differ by a square factor, the field-isomorphism alone is generic; the particular **3/4** link and adjacent **[4,3]** are the more specific coincidences, not proof of intent.

## A source-only, internally marked candidate key

Apply the original 2014-derived Π **directly to the five original printed p7 red-word GP products** v=[11,26,8,15,2]. The exact source-only result is

\[
\Pi v = [26,11,\mathbf{13},11,26]\pmod{29}.
\]

The two outside values are exactly the **first two red p7 word products in reversed order**, and the middle value **13** matches the *visibly printed large red thirteen-dot mark* immediately after the five red words at p7 original rune offset208. That physical punctuation count did **not** enter the calculation of F, the historical matrix A or Π. The source-original p8 two heading-word products **[4,3]** select zero-based positions 4 then3 of this projected vector, producing a specific two-symbol **candidate key [26,11]**.

This is a concrete cross-artifact source link, not yet a recovered cipher key. Its palindromic shape is mathematically forced for *every* input by Π's symmetric rank-two image, and the recognition of reversal/13 occurred after looking at the candidate output.

To charge the observation against original selection opportunities, the SFT parses **all 2,896 complete printed unknown-page GP words** (12,956 unchanged runes, retaining all32 actual cross-page word carries), computes GP index-product quintets on all **2,892 consecutive five-word windows** and looks for the exact fixed pattern Πv=[v₁,v₀,13,v₀,v₁]. Results:

| Original-wide fixed pattern | Matching five-word windows |
| --- | --- |
| Outer two values reverse the input's first two products, regardless of center | **2**: original word408 (p7 red), word2309 (p42) |
| Projected center equals visible thirteen-dot count13, regardless of outer values | **87** |
| Both reversed outer products **and** center13 | **1 / 2,892**, the complete red p7 five-word sequence at original word index408 |

The p42 competitor yields projected values [11,0,7,0,11] and fails the center13 condition. The uniqueness of p7 among all manuscript five-word windows is an observed finite-corpus fact, **not** a calibrated p-value: the exact conjunctive pattern was recognized after computing p7's output. Still, it specifies a **repeatable author-source key candidate [26,11] and a single original clue-locus** worth differentiating from free alphabet searches.

## Full original p8 plaintext/key-extraction decision

The adjacent physical p8 contains **255 original GP29 runes**, consisting of **12 red heading runes plus 243 black**. This is exactly **51 packets of five**, with no padding or invented source letters. Group all255 in original page/rune order, apply the actual Π to each five-rune vector, and take the projected **zero-based components 4 then3**. These are linearly independent rows of the rank-two projector and their order is fixed by the two p8 original heading-word GP products **[4,3]**. The resulting complete receiver contains **102 native GP29 values**. This is a proposed lossy key/message extraction, since the original 255 inputs cannot be reconstructed from 102 outputs alone.

The actual original-p8 output has **GP29 IoC 0.036497767424** (original p8 **0.034275127374**), both close to the uniform benchmark1/29. It begins in GP spelling with:

**OE F F Y I A T ING L L R I A Y L T G B NG NG O P S N I G M IA IA IA ...**

No sustained recognizable original-page prose, address, or typed instruction was recovered. The original already-clear p57 source has GP29 IoC about **0.06271**. The proposed extraction does **not** establish a cipher or a key even though the algebra and source input registration are exact.

### Direct original-cipher consumer of the new source-only key

The previously solved 2014 Cicada image-stage actually used **GP29 Vigenère subtraction**. The two natural source-complete candidate keys here are the whole historical-square projection **[26,11,13,11,26]** (a five-rune running key, matching p8's 51 complete five-rune packets) and the **[26,11]** subkey selected by p8 title products [4,3]. Neither requires choosing a hidden letter. Apply the key from index0 to either (i) **all255 p8 runes**, including the two red words, or (ii) **the 243 black runes** following their completed heading. Test both GP29 addition directions, consuming Fehu normally. This gives **eight** fixed full-original-input inverses, with no key/phase tuning:

| Frozen original p8 receiver | Subtract [26,11] | Add [26,11] | Subtract projected full-five [26,11,13,11,26] | Add projected full-five |
| --- | ---: | ---: | ---: | ---: |
| Complete p8, 255 runes | **0.034892697236** | 0.033441408059 | 0.033410529566 | 0.033503165046 |
| P8 black body, 243 runes | **0.035098459341** | 0.033465972860 | 0.033772064075 | 0.033465972860 |

All eight GP29 outputs stay near uniform and contain no sustained readable text. Each exact source ciphertext reencrypts 255/255 or 243/243 respectively; eight authentic solved-p57 GP-native plants of the corresponding register size also recover exactly after source-key encryption. The direct period-two and period-five Vigenère uses of these **two fully source-derived numeric keys fail** on their adjacent original page. Any pure rune transposition on the same original page also preserves its near-uniform IoC 0.034275127374 exactly, so transposition alone cannot recover ordinary native GP prose; a source-chosen *value-changing* operation would be necessary. Other keys or intermediate operations are outside this exact gate.

The [read-only Windows Node.js22 CommonJS original-input test](../sims/lp2_p7_2014_a_square_gf29_scaled_eigenspace_p8_original_sft.cjs) reads the actual 2014 matrix, original GP corpus, original red-ink annotations and line-preserving transcription. It independently reconstructs the five p7 source word products, two p8 title products, the complete historical characteristic polynomial, both polynomial factorizations, the scaled-matrix fixed-point rank and the canonical projector. It checks all255 original receiver symbols and prints the **full 102-symbol original output**. The same test enumerates all 2,892 original five-word windows, eight original-p8 two-rune/five-rune Vigenère inverse candidates, the full 5×5 source-selected T with three complete original cipher receivers, eight newly source-seeded period-56 historical-matrix stream decodings of complete p8, direct native-GP D=F(A/2) and F(B) reversible decodings of three complete original sections, plus original7×7 F(H)/F(H/2) on the adjacent full 1,729-rune seven-plate section. A fixed right inverse independently embeds 102 known GP29 runes drawn from the authentic solved p57 into 51 five-rune source-shaped words and recovers **102/102 exactly**. The plant demonstrates the transport can express plaintext, without authenticating this original decoding idea.

## A full reversible 2+3 source-derived matrix, tested on three original receivers

The two-value Π-extraction loses three original rune coordinates. A literal **reversible completion** can be built from the same original source, without arbitrary secret values: define K=I−Π, a rank-three complementary projector. The two p8 heading source products **[4,3]** select Π's rows4 then3; the remaining original coordinate labels **[0,1,2]**, in printed order, select K's three output rows. The resulting exact GF29 matrix is

\[
T=\begin{bmatrix}\Pi_4\\\Pi_3\\K_0\\K_1\\K_2\end{bmatrix}
=\begin{pmatrix}
9&23&23&23&9\\
23&9&23&9&23\\
21&6&6&6&20\\
6&21&6&20&6\\
6&6&6&6&6
\end{pmatrix}\pmod{29}.
\]

Its determinant modulo29 is **13**, and its literal exact inverse has no fitted entries:

\[
T^{-1}=\begin{pmatrix}
1&0&1&0&0\\
0&1&0&1&0\\
27&27&0&0&1\\
0&1&0&28&2\\
1&0&28&0&2
\end{pmatrix}\pmod{29}.
\]

Thus the first two outputs describe the exact p7 polynomial fixed plane of the earlier square, and the last three outputs its canonical complementary plane. This is a **full five-rune-to-five-rune source-shaped, reversible GP29 decoder** with no padding, guessed matrix entries, phase, secret alphabet or discarded original rune. It is a separate concrete consumer from applying the first historical square or its powers.

Test it independently on the three original text registers with a five-rune grouping motivated *before* language scoring: (i) complete adjacent p8 (255 runes), (ii) original five-scroll p3–p7 (1,145 runes), and (iii) original p33–39 cuneiform/numerical and five-numbered passage chapter (1,680 runes, with the literal source 1033/3301). Each full register's first printed rune anchors its consecutive quintets.

| Complete original source register | Runes | Before GP29 IoC | Exact T output GP29 IoC |
| --- | ---: | ---: | ---: |
| P8 complete | 255 | 0.034275127374 | **0.033317894087** |
| P3–p7 scroll | 1,145 | 0.034633706904 | **0.034357345711** |
| P33–p39 numeric/numbered section | 1,680 | 0.034360021555 | **0.034450778525** |

All **3,080 original GP29 runes reencipher exactly** with T⁻¹. Three genuine solved-p57 GP29 positive plants of each entire original receiver length recover exactly after native GP encipherment. On adjacent p8, the two selected projector outputs have IoC **0.036497767424**, the remaining three complementary outputs IoC **0.032593739250**, and neither carries a readable instruction. All three full T outputs remain ciphertext-like. The source-derived complete reversible operation is therefore *actually tested and negative* for direct native GP prose, with no new ciphertext plaintext.

## Direct source polynomial evaluated on the historical square

A distinct, even simpler complete 5×5 GP29 operator is the literal **matrix polynomial** defined by the five original p7 word products, evaluated at the 2014 square scaled by the p7 title root's square root two:

\[
D=F(A/2)=\begin{pmatrix}
15&6&7&12&10\\
17&12&28&4&18\\
19&16&9&16&19\\
18&4&28&12&17\\
10&12&7&6&15
\end{pmatrix}\pmod{29}.
\]

This evaluates the actual source polynomial on an entire independent actual historical matrix; unlike Q=F(A/2)−A/2, **D is invertible, with exact determinant 1 in GF29**. Its exact inverse is

\[
D^{-1}=\begin{pmatrix}
0&28&17&21&10\\
5&14&16&13&28\\
4&0&10&0&4\\
28&13&16&14&5\\
10&21&17&28&0
\end{pmatrix}\pmod{29}.
\]

This is a fully source-specified **SL₅(29)** cipher operation, with no fitted key or phase. Moreover, its **exact order is 56**, with a 28-step half-turn **`D²⁸=I−2Π`**, a literal reflection through the complement of the same p7-source quadratic fixed plane. The directly computed original matrix is `D²⁸=[[12,12,12,12,11],[12,12,12,11,12],[12,12,11,12,12],[12,11,12,12,12],[11,12,12,12,12]]` mod29. `D⁵⁶=I` follows from the projector identity and is separately asserted by finite original-matrix multiplication; `D⁸≠I` and `D²⁸≠I` establish minimal order56. The number56 also counts the unsolved physical LP2 pages, yet the original A itself already has order56. This inherited numerical match does not independently select a page-to-page key schedule or remedy the tested absence of plaintext.  Both D and D⁻¹ were applied to **all three** five-rune-aligned original full receivers, keeping every printed rune and actual original page/section order unchanged:

| Source-complete original register | D forward GP29 IoC | D inverse GP29 IoC |
| --- | ---: | ---: |
| Physical p8, 255 | 0.032638567238 | 0.034614790798 |
| P3–p7 five-scroll, 1,145 | 0.034595535469 | 0.034374141143 |
| P33–p39 numeric / numbered, 1,680 | 0.034458577952 | 0.034287699594 |

Six exact complete-source forward/reverse ciphers reconstruct **all 3,080 original runes per direction choice** and six matched solved-p57 GP-native positive plants. Every original output remains near uniform, with no native-language message or key. The surprising determinant1 is a true source-derived GF29 identity, yet 1/28 is an ordinary determinant value among random nonsingular GF29 matrices; it is not independent authorial instruction. This natural complete matrix-polynomial inverse is another **bounded negative**. Do not infer that a guessed transpose, arbitrary determinant normalization or additional secret linear stage would rescue it.

## Original source-selected period-56 evolving-state cipher

A genuine *changing-state* operation independent of guessing the secret word key follows from the printed original 2014 matrix **A**, whose verified exact order is **56** over GF29, matching the 56 unresolved LP2 physical pages. The original p7 terminal red quintet is already a **5-rune initial state** v=[11,26,8,15,2], and the exact historical projector yields another completely specified input Πv=[26,11,13,11,26], including its physical 13-dot marker. These are two actual original-source seed choices. The adjacent p8 page contains exactly **51 consecutive five-rune blocks**.

Freeze one stream operation for each source seed: emit its five GP29 values as the next key packet, then advance the five-component state by the unchanged historical **A or A⁻¹** modulo29. On the original complete 255 p8 runes, subtract or add each key value modulo29, consuming Fehu normally and **without fitted initial phase, nonce, seed, word offset, page skip or hidden rune mapping**. There are **2 × 2 × 2 = eight** distinct, source-complete original ciphertext decodings. Every decoder exactly reenciphers all255 original runes and independently recovers an authentic solved-p57 full255-rune GP-native plant under the same key schedule.

| Five-component original-source seed | A-forward subtract | A-forward add | A-inverse subtract | A-inverse add |
| --- | ---: | ---: | ---: | ---: |
| Five printed p7 red-word products [11,26,8,15,2] | 0.034614790798 | **0.035541145592** | 0.034645669291 | 0.034985332716 |
| 2014 projected source quintet [26,11,13,11,26] | 0.033750192991 | 0.033287015594 | **0.035016211209** | 0.034676547784 |

Values are actual original-decoder GP29 IoCs. The strongest 0.0355411 is still near the uniform source baseline1/29 and below native language; full original output prefixes do not form a sustained readable instruction. The **two historical A-orbit seeded GP29 running-key mechanisms** are specifically rejected as immediate original-p8 prose decoders. The past global source-matrix orbit negatives seeded the original square's first row or column; this new test instead uses **the exact adjacent manuscript's five complete red-word products and the newly established source-derived five-value key**. An external key or further unprinted stage cannot be excluded.

## Original p8–p14 seven-plate register and the 2014 seven-square

The adjacent p8–p14 illustrated chapter contains **exactly seven physical pages** and **1,729 = 247×7 original GP29 runes**, with authentic per-page counts **255, 268, 263, 273, 261, 272, 137**. This creates a second, geometrically more natural complete ciphertext receiver for the original p7 polynomial F: the same genuine 2014 Stage10 sources include **one seven-by-seven 1033-sum magic square**, printed between the two historical fives. A returning human solver could be prompted by p7's five red words and the next seven tree plates to attempt F on that historical seven-state square. Unlike a padded full-book Hill attempt, this **complete seven-plate original receiver needs no invented runes, deletions or carry alignment**.

Let H be the original historical 7×7 square reduced modulo29 and define the complete native-rune matrix-polynomial cipher **D₇=F(H)**. The unmodified source coefficients [11,26,8,15,2] and H give an invertible square with **determinant 14 mod29**. To keep the separate p7 quadratic root2 scaling premise bounded, also evaluate **F(H/2)**, which is invertible with **determinant 25 mod29**. All operators and their exact inverses are computed from original source inputs without fitting a single coefficient to p8–p14 ciphertext. The full family consists of these two source-specified square choices and their direct/inverse orientations, four complete original tests:

| Exact original 1,729-rune seven-plate decoder | GP29 IoC |
| --- | ---: |
| Unchanged original p8–p14 ciphertext | **0.034460483474** |
| F(H) | 0.034514705567 |
| F(H) inverse | 0.034268363216 |
| F(H/2) | 0.034570935887 |
| F(H/2) inverse | 0.034435045948 |

All **6,916 original output rune instances** (4×1,729) re-encrypt exactly with the corresponding inverse. Four additional full1,729-rune genuine solved-p57 source-native plants recover every GP rune after independent encryption. All four actual LP2 outputs remain indistinguishably near the uniform GP29 IoC benchmark and start with nonlinguistic rune strings. The complete source-fixed 7×7 polynomial decoders **do not recover this intact seven-page plaintext**. The 1,729-rune divisible-by-seven coincidence is authentic source geometry and is useful for assigning future operations, but neither physical p7 nor the 2014 signed CGI form gives an explicit instruction to evaluate a polynomial on this square.

This negative closes the most direct *seven* dimensional member of the same newly discovered source-to-source polynomial operator family, independently of the three tested five-dimensional receivers. It does not exclude an additional author-provided input state, plaintext in another alphabet, or a different historical 7×7 use.

## Exact 56-page source-state full-book inverse

The newly derived full source polynomial **D=F(A/2)** has **exact order56** and 28th power **I−2Π**. This supplies an original-source-defined *page-state clock* matching the 56 unsolved physical LP2 pages. Fix a complete manuscript decoder without choosing a secret key: seed with either the physical p7 red-word products **[11,26,8,15,2]** or their source-projected image **[26,11,13,11,26]**; advance the five-value state by **D or D⁻¹** once per *physical page*, repeat that page's five GP values as a standard GP29 add/sub Vigenère key from its first printed rune, and advance the state once even on **rune-free p50**. Page0 fixes the clock phase. This is exactly **2 seeds × 2 directions × 2 signs = eight** full manuscript original-cipher receivers with no fitted key, dropped rune, invented blank-page symbols, or edited carry.

All eight **12,956-rune original ciphertext decoders** have exact full-source re-encryption, and eight separately encrypted genuine solved-p57 source-native GP29 full-size plants reconstruct every rune. All original outcomes remain uniformly distributed:

| 56-physical-page state | D-forward subtract/add GP29 IoC | D-inverse subtract/add GP29 IoC |
| --- | --- | --- |
| P7 five red-word products | 0.034525834493 / 0.034494388810 | 0.034472368491 / 0.034475585746 |
| P7 projector quintet | 0.034539525698 / 0.034471772704 | 0.034466982569 / 0.034468340966 |

The unchanged full original book has IoC **0.034478397865**. The literal full-book **56-page source-state decoder does not recover unknown GP29 plaintext**. The source coincidence (historic D order56 = original unknown physical page count56) does not itself identify which original register or cipher operand the state should process. The negative is a bounded result for page-clocked ordinary GP29 Vigenère, without excluding a different first-party mechanism.
## Decision

The **historical 3301-square quadratic x²−3 and p7 quartic residual x²−8** exhibit a genuine, formerly unrecorded *scaling relationship that exactly involves the adjacent two p8 heading products3 and4*. The canonical two-dimensional common fixed subspace is a mathematically legitimate original-input **candidate key location**. The *fully source-frozen, 255→102 p8 receiver*, all eight original-p8 direct source-key Vigenère uses, the complete source-derived invertible T on three entire original registers, all eight source-seeded **period-56** historical A orbit candidates on p8, literal **F(A/2)** / inverse and **F(B)** / inverse on three complete original receivers, **F(H)** / **F(H/2)** and inverses on the entire adjacent **1,729-rune seven-plate chapter**, and all eight **12,956-rune original full-book page-clocked** source-D candidates remain ciphertext-like. This rejects that immediate extraction as direct native GP prose and leaves the key/destination problem unresolved.

Promote the source connection to a cipher hypothesis only with an independently selected original recipient and typed output predicate. Changing coordinates, phases, word segmentation, square variants or output alphabet to fit favorable short English would reintroduce an unrestricted search. No additional unverified ciphertext key is claimed.

**Complete original-source SFT:** [Windows-compatible Node.js22 manual CI PASS 45074156298](https://github.com/FlareZ123/liber-primus/actions/runs/45074156298) independently executes the full source p7 polynomial, historical 2014 characteristic polynomial, rank-two projector, all 2,892 original five-word windows, eight direct projected-key Vigenère candidates, eight original A-orbit stream-key candidates, fully invertible rank2+3 matrix T on three complete original registers, six F(A/2) and six F(B) original-register inverses, and four original 7×7 F(H)/F(H/2) inverses on the intact seven-page p8–p14 1,729-rune receiver. Every proposed source inverse is checked on the entire original ciphertext and against independently encrypted full-size native solved-p57 controls. **No unknown LP2 plaintext was recovered.**
