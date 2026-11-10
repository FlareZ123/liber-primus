# Page 29 and the printed table share the p39 red double-root factor

**Status (Agent 32, 10 November 2026): exact original-source arithmetic and a conditional selection control; no unknown LP2 plaintext, key, cipher, or continuation recovered.** The proposed page-to-table relationship was discovered retrospectively while testing new ways to use the previously established red-marked field root. Its significance is not calibrated against the many historical source operations already considered.

## Independent printed inputs and exact relation

The two original-source objects are the **256 base-60 table bytes**, presented as 32×8 across physical LP2 pp49–51, and the **277 rune indices** on physical LP2 p29 (original JPEG `46.jpg`). Coefficients are zero-based GP29 rune indices or byte values reduced modulo 29, in original forward reading order and interpreted in descending polynomial powers. The printed table bytes have SHA-256 `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`.

The **three red runes at p39 local rune offsets 119–121** have GP29 indices **[27, 5, 15]**, which as constant, linear and quadratic coefficients supply

\[
B(X)=27+5X+15X^2=15(X-24)^2\quad\text{over GF}(29).
\]

This red factor is already known to divide the table polynomial. The additional original-ciphertext finding is that **the complete physical p29 polynomial is also divisible by this exact marked factor**, with zero remainder. Its monic greatest common divisor with the unchanged table polynomial is **precisely** `[1,10,25]`, i.e. \((X+5)^2\). The shared root has multiplicity exactly two in both source objects.

The 55 rune-bearing unsolved LP2 page polynomials have \(P_p(24)=0\) on exactly physical **pp10,11,29,36**; only **p29** also has \(P'_p(24)=0\). Both p10 and p11 are the facing original pages displaying the two halves of a tree illustration. Their common *single* root is a source fact; the illustration does not instruct GF29 evaluation. Page p29 itself has no visible colored heading selecting this arithmetic.

## Candidate payloads and a matched conditional check

Dividing p29 by the marked quadratic produces **275 GP29 coefficients** (IoC **0.034054412740544125**, close to uniform \(1/29\)) and no readable native-GP plaintext. Dividing p29 by the full original table polynomial, with the table's zero leading GF29 coefficient removed, produces a **23-coefficient Euclidean quotient** and a 254-coefficient remainder. The quotient transliterates to `IALRBTETJHEAETCDEOIHAEXXSLB`; it is not authenticated as text, a key or a reference to the distinct 23-dot punctuation on solved p57. The 23-coefficient count follows mechanically from the respective polynomial degrees.

A finite, structure-preserving null independently **circularly rotates each original page's complete rune sequence** through every one of its possible offsets. It preserves each page's rune inventory and all cyclic adjacent relationships. Under a uniformly selected rotation per page, **13 of the 55 pages** have at least one double-root rotation; **29 successful rotations** occur among all **12,956** page-length-weighted rotations. On p29 itself there are exactly **3/277** successful rotations (offsets 0,40,41). The exact conditional probability of at least one such double-root page in the 55 independently rotated originals is **0.10847160919347021**. This null is *conditional on original page content* and is not an author-intent p-value. It shows why a one-page match cannot by itself establish a deliberate field-polynomial code, particularly after inspecting other numerical alignments.

The closest genuine cipher test would predict independently where a similar factor must occur, or explain how to use the p29/table quotient to produce authenticated output. Such an original-source prediction has not been recovered. Simply treating every page as a codeword with the same generator is already contradicted by the 54 other pages.

## Reproduction and decision

[Self-contained Node.js 22/CommonJS source test](../sims/lp2_marked_quadratic_crosspage_sft.cjs) reads the committed original-derived table, rune corpus and red-ink annotations; checks the grid's byte SHA-256, source red triple, all 55 original page jets, the exact original polynomial GCD/divisions, all cyclic rotations and the 23-symbol quotient. The exact script passed in [manual original-source GitHub Actions run 42924900057](https://github.com/FlareZ123/liber-primus/actions/runs/42924900057).

**Decision:** retain the p29 double-root as a concrete, independent source coincidence for a future *clue-constrained* manuscript route. It has no demonstrated plaintext recovery and is insufficient to promote the factor hypothesis to an established cipher architecture. Avoid searching arbitrary polynomial roots or alphabet reorderings on this basis alone.
