# Page 29 and the printed table share the p39 red double-root factor

**Status (Agent 32/7, 11 November 2026): the p29/grid double-root relation is exact original-source arithmetic; source-fixed quotient, remainder, additive-key and 23×23 Hill inversions remain negative. No unknown LP2 plaintext, key, cipher, or continuation recovered.** The proposed page-to-table relationship was discovered retrospectively while testing new ways to use the previously established red-marked field root. Its significance is not calibrated against the many historical source operations already considered.

## Independent printed inputs and exact relation

The two original-source objects are the **256 base-60 table bytes**, presented as 32×8 across physical LP2 pp49–51, and the **277 rune indices** on physical LP2 p29 (original JPEG `46.jpg`). Coefficients are zero-based GP29 rune indices or byte values reduced modulo 29, in original forward reading order and interpreted in descending polynomial powers. The printed table bytes have SHA-256 `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`.

The **three red runes at p39 local rune offsets 119–121** have GP29 indices **[27, 5, 15]**, which as constant, linear and quadratic coefficients supply

\[
B(X)=27+5X+15X^2=15(X-24)^2\quad\text{over GF}(29).
\]

This red factor is already known to divide the table polynomial. The additional original-ciphertext finding is that **the complete physical p29 polynomial is also divisible by this exact marked factor**, with zero remainder. Its monic greatest common divisor with the unchanged table polynomial is **precisely** `[1,10,25]`, i.e. \((X+5)^2\). The shared root has multiplicity exactly two in both source objects.

The marked p39 quadratic is the **only positive factor match in a complete census of all 18 source-annotated red spans** against all 55 original unsolved page polynomials and the unchanged table, reading each span in both original and reversed coefficient order. The other 17 red spans, including both nine-rune headings, divide none of these polynomials. This directly bounds the hypothesis that colored passages generally encode polynomial generator factors for the rest of LP2. It is also a look-elsewhere qualification: the matching triad was examined alongside 17 other visually marked candidates.

The 55 rune-bearing unsolved LP2 page polynomials have \(P_p(24)=0\) on exactly physical **pp10,11,29,36**; only **p29** also has \(P'_p(24)=0\). Both p10 and p11 are the facing original pages displaying the two halves of a tree illustration. Their common *single* root is a source fact; the illustration does not instruct GF29 evaluation. Page p29 itself has no visible colored heading selecting this arithmetic.

## Candidate payloads and a matched conditional check

Dividing p29 by the marked quadratic produces **275 GP29 coefficients** (IoC **0.034054412740544125**, close to uniform \(1/29\)) and no readable native-GP plaintext. Dividing p29 by the full original table polynomial, with the table's zero leading GF29 coefficient removed, produces a **23-coefficient Euclidean quotient** and a 254-coefficient remainder. The quotient transliterates to `IALRBTETJHEAETCDEOIHAEXXSLB`; it is not authenticated as text, a key or a reference to the distinct 23-dot punctuation on solved p57. The 23-coefficient count follows mechanically from the respective polynomial degrees.

A finite, structure-preserving null independently **circularly rotates each original page's complete rune sequence** through every one of its possible offsets. It preserves each page's rune inventory and all cyclic adjacent relationships. Under a uniformly selected rotation per page, **13 of the 55 pages** have at least one double-root rotation; **29 successful rotations** occur among all **12,956** page-length-weighted rotations. On p29 itself there are exactly **3/277** successful rotations (offsets 0,40,41). The exact conditional probability of at least one such double-root page in the 55 independently rotated originals is **0.10847160919347021**. This null is *conditional on original page content* and is not an author-intent p-value. It shows why a one-page match cannot by itself establish a deliberate field-polynomial code, particularly after inspecting other numerical alignments.

A remaining useful direction is to seek a separate source instruction linking p0/p29 or the historical audio to an operation; the p29/grid polynomial interpretations tested here should be treated as closed unless new independent evidence changes the construction.

## Source-fixed quotient and 23×23 inverse tests (Agent 7, 11 November 2026)

The p29/grid relation admits a compact operation selected by the source objects themselves: divide the complete p29 polynomial by the printed grid polynomial, and use the 23-symbol quotient suggested by p3's middle red index 23. This was tested without fitting a phase or selecting parameters from language scores.

- **Direct Euclidean remainder:** with descending GP29 coefficients and the original forward row-major grid, p29 ÷ grid gives a 23-coefficient quotient `[27,20,4,17,16,18,16,11,8,28,18,16,5,23,12,10,8,25,14,14,15,20,17]` (GP transliteration `IALRBTETJHEAETCDEOIHAEXXSLB`) and a 254-coefficient remainder. The remainder has IoC **0.03376801** and trained GP trigram score **−13.43805**; original p29 is **0.03369434 / −13.36968**. Neither is language-like.
- **Cancel the common marked factor first:** dividing p29 and the grid by (15(X-24)^2), then dividing the resulting quotients, gives the same 23-coefficient quotient and a 252-coefficient remainder, exactly (9\times28). Its IoC is **0.03541390** and GP trigram score **−13.63353**. The shape is an arithmetic correspondence, not plaintext.
- **23-symbol additive key:** use the quotient in its natural descending order as a zero-phase GP29 additive key on the other 54 original pages, excluding p29 from scoring while retaining its 277-rune physical offset for the continuous clock. Both signs under book-continuous and page-reset clocks give IoC **0.03445032–0.03449042** and trigram **−13.64480 to −13.58619**, against raw **0.03447892 / −13.58355**. A 12,679-rune native Gibran-GP control scores **0.06049889 / −7.85557** and round-trips exactly under all four planted models.
- **23×23 Hill hypothesis:** divide p29 and the grid separately by the marked factor, retaining the original fixed width of the grid quotient (254 slots, including the leading zero from original byte 203 modulo 29). The 275+254 coefficients make a 529-entry, row-major 23×23 matrix. It is full rank with determinant **7**. The book length also admits (12,956=563\times23+7), where 563 is the 2016 image width; this is a retrospective alignment, so both possible seven-rune trims were tested. Across prefix/suffix-7, row/column-vector, and (M/M^{-1}) choices, all eight original outputs remain ciphertext-like: IoC **0.03447451–0.03452220**, trigram **−13.66200 to −13.58499**. Raw same-alignment scores are **0.03447817–0.03447892 / −13.58004 to −13.57984**; the 12,949-rune native Gibran-GP control scores **0.06040403 / −7.85963** and round-trips exactly under all four planted transforms.

The matrix determinant 7, 9×28 remainder shape, and 563×23+7 book geometry do not authenticate an intended cipher. These tests close the simple polynomial remainder, quotient-pad, and Hill23 readings of this exact p29/grid relation; they do not disprove the source arithmetic or other independently specified mechanisms.

## Reproduction and decision

[Self-contained Node.js 22/CommonJS source test](../sims/lp2_marked_quadratic_crosspage_sft.cjs) reads the committed original-derived table, rune corpus and red-ink annotations; checks the grid's byte SHA-256, source red triple, all 55 original page jets, the exact original polynomial GCD/divisions, all cyclic rotations and the 23-symbol quotient. The exact script passed in [manual original-source GitHub Actions run 42924900057](https://github.com/FlareZ123/liber-primus/actions/runs/42924900057).

**Decision:** retain the p29 double-root as a concrete, independent source arithmetic relation, not a decryption. The direct Euclidean remainder, factor-cancelled remainder, 23-symbol additive quotient, and 23×23 Hill interpretations above are bounded negatives with source-native positive controls. Do not repeat these polynomial/key/matrix variants or broaden them into unconstrained root, phase, or alphabet searches. A future continuation needs a distinct, independently motivated source operation that predicts recognizable output.
