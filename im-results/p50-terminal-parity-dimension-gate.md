# Terminal polynomial-code inversions: low-factor ambiguity and high-factor rejection

**Agent 49, 11 November 2026. Classification: exact original-input finite-field capacity result and a complete original-source decoder test.** Both are conditional on one visible 256-cell geometry. Neither yields decrypted unknown LP2 plaintext, an authenticated key or an intended continuation.

## Original source and the recovery opportunity

The p49–51 numerical grid has **32 rows and 8 columns** (256 two-character tokens). The conventional base-60 source reading supplies 256 bytes whose SHA-256 is

\`3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290\`.

Writing their residues modulo29 as descending coefficients of one polynomial \(P(X)\), the [established exact factorization](lp2-grid-complete-gf29-factorization.md) gives

\[
P(X) = c\,G_{16}(X)Q_{238}(X)
\quad \text{in }\mathbb F_{29}[X],
\]

with \(c\in\mathbb F_{29}^{\times}\), the degree-16 monic small-factor product

\[
G_{16}(X)=(X+5)^2(X^2+18X+11)
 (X^3+14X^2+16X+24)
 (X^9+12X^8+20X^7+10X^6+5X^5+X^4+9X^3+15X+11),
\]

and a monic irreducible factor \(Q_{238}\) of degree 238. The verified ascending coefficient vector of \(G_{16}\) is

\`[13,20,26,12,6,2,13,26,6,26,11,7,15,11,17,25,1]\`.

The printed grid's circumference contains **76 cells**, its 30×6 interior **180 cells**. The solved p57 *PARABLE* explicitly mentions “circumferences” and “divinity within.” Independently the last physical pages have exactly **76 still-encrypted p55 runes**, **85 deciphered p56 runes**, and **95 directly clear p57 runes**. A plausible source-motivated recovery experiment places the 76 unknown p55 symbols onto the grid perimeter and the **180 known p56+p57 plaintext symbols** onto the interior, keeping source order within each region. These mappings and the polynomial-code interpretation are hypotheses; neither was authenticated by Cicada.

The earlier [terminal code/circumference study](terminal-grid-circumference-knownplain-gate.md) examined literal byte/rune lookups and a source-selected GF841 interpolation, among other variants. The present analysis tests two **distinct polynomial-code inverses** arising from the exact factorization. Each provides a strong, key-independent decision about whether it can recover the 76 unknown original positions.

## Route A: the degree-16 factor cannot uniquely recover p55

For a candidate 256-symbol GF29 codeword \(A=(a_0,\ldots,a_{255})\), use the printed order

\[
P_A(X)=\sum_{j=0}^{255} a_jX^{255-j}.
\]

A codeword divisible by \(G_{16}\) has an all-zero 16-coordinate remainder. With the 180 interior symbols fixed, its syndrome is affine linear in the 76 unknown perimeter values. The **16×76** syndrome coefficient matrix has columns equal to the remainders \(X^{255-j}\bmod G_{16}(X)\) for perimeter positions \(j\).

Exact GF29 elimination gives **rank 16**, with these 16 independent zero-based row-major table positions:

\`[0,1,2,3,4,5,6,7,8,15,16,23,24,31,32,39]\`.

Therefore *every* possible 180-symbol interior permits exactly

\[
29^{76-16}=\boxed{29^{60}\approx5.54\times10^{87}}
\]

different perimeter strings satisfying this factor. Sixty free GP29-symbol constraints would have to come from elsewhere before this parity mechanism could specify a unique 76-rune page. Even **43 recovered p55 strict-interior runes** from an independent clue could leave at least 17 further degrees of freedom.

The [exact source-run reproducer](../sims/p50_terminal_parity_dimension_sft.cjs) computes the full generator, verifies zero syndrome for the genuine p50 bytes and constructs an explicit witness from the actual closing pages. Assign original p55 glyphs to perimeter and independently solved p56+p57 plaintext to interior. The unchanged aggregate has nonzero syndrome

\`[5,7,27,12,4,24,25,13,17,28,19,22,26,8,14,13]\`.

Hold **60 of the original 76 p55 ciphertext values** and all **180 known p56+p57 values** fixed. Solving for the 16 independent perimeter pivots yields

\`[10,20,2,18,10,9,15,19,20,28,1,6,18,13,26,8]\`.

The resulting candidate codeword has all sixteen syndrome coordinates zero; 15 of the 16 altered pivot glyphs differ from original p55. The SFT constructs a **second, different fully valid codeword** by altering one free symbol and resolving the same pivots, with the identical known interior. This proves the ambiguity on actual source data and prevents an attractive fitted zero syndrome from masquerading as a decryption.

**Route A decision:** source-selected degree-16 parity alone is insufficient to reveal the unknown page. Fitting a candidate to these 16 checks is guaranteed possible without discovering plaintext or a secret.

## Route B: the degree-238 factor supplies a full decoder, but fails on the actual closing pages

The irreducible \(Q_{238}\) suggests a very different finite-field code. If the terminal 256-rune vector were the coefficient sequence of a polynomial **divisible by \(Q_{238}\)**, its generating polynomial would necessarily be

\[
P_A(X)=Q_{238}(X)R(X),\qquad\deg R\le17.
\]

There are only **18 unknown GF29 coefficient values** in \(R\). Unlike Route A, the 180 known interior values make this system highly overdetermined and, if consistent, would **recover the entire 76-rune perimeter exactly**. This is a genuine original-plaintext recovery proposal, with no fitted key beyond the 18 coefficients uniquely forced by independently solved source text.

The [single-file original-source inversion](../sims/p50_terminal_q238_known_interior_sft.cjs) derives \(Q_{238}\) by dividing the actual 256-byte polynomial by \(G_{16}\). It builds the 180×18 linear map from unknown multiplier coefficients to printed interior coordinates. Exact Gaussian elimination finds rank **18**; the known interior determines one candidate multiplier and a full 256-symbol prediction.

Two positive controls establish the inversion works for genuine members of this code:

- From only the actual p50 table's **180 interior residue symbols**, it recovers its unique 18-coordinate multiplier and reconstructs **256/256 original p50 residue symbols** exactly.
- From 180 interior symbols of an independently planted Q238 codeword with 18 seed symbols drawn from authentic GP text, it recovers the entire seed and **256/256 planted symbols** exactly.

The original closing pages decisively fail the same frozen operation:

| Source-known 180-cell interior | Exact predictions correct | Contradictions among 180 | Predictions on original 76 p55 ciphertext glyphs |
| --- | ---: | ---: | ---: |
| **85 deciphered p56 runes + 95 clear p57 runes** | **21** | **159** | 2 / 76 |
| **85 visible p56 ciphertext runes + 95 clear p57 runes** | **20** | **160** | 4 / 76 |
| **Actual p50 table residues, positive control** | **180** | **0** | 76 / 76 |

The 18 free coefficients are already determined by the source-selected first 18 independent interior equations. The other 162 interior positions are predictions from that fixed result; none is optimized for language. For the two original terminal variants, these 162 positions yield only **3** and **2** further exact predictions respectively. The full 180-known data are irreconcilable with this precise code.

The p55 predicted glyphs in the table are comparisons to the **original ciphertext** rather than decrypted plaintext. Their poor match is supplementary, since p55 is expected to have an unknown cipher. The 159/160 **contradictions against known original closing-page symbols** are the decisive exclusion.

**Route B decision:** retire the simple GF29 Q238 polynomial multiple as the direct terminal plaintext or visible-rune encoder under the original row-major perimeter/interior mapping. Its original-table and independent-planted controls demonstrate full recovery when the hypothesized mechanism actually holds.

## Complete family-wide divisor decision: all 48 direct GF29 source-factor codes

The two endpoints above actually settle **every monic divisor of the original source table polynomial**, rather than merely two guessed generators. The [independent all-divisor rank SFT](../sims/p50_terminal_all48_factor_capacity_sft.cjs) uses the unchanged 256-byte source, reconstructs all 24 divisors of G16, confirms each still divides the original table polynomial, and computes its full 76-position perimeter syndrome rank.

The exact factorization is

\[
P_{\mathrm{p50}}(X)=28\,G_{16}(X)Q_{238}(X)
\]

over GF29, where the monic G16 factors are **one repeated linear factor** (multiplicity two), and **one each** irreducible quadratic, cubic and degree-nine factor. The remaining Q238 is irreducible. Thus the full source polynomial has precisely

\[
(2+1)(1+1)^4=\boxed{48}
\]

distinct monic polynomial divisors. Each proposed code generator is a divisor of the original p50 table's *known* polynomial, with no chosen secret polynomial.

- **The 24 divisors excluding Q238** have degree \(d\le16\). The source's original 76 border columns have *exact rank d in every one of these 24 cases*. Thus fixing **any** 180-symbol interior always leaves exactly \(29^{76-d}\) candidate p55 perimeters, ranging from \(29^{60}\) to \(29^{76}\). No such code can identify the original 76-rune page uniquely, even if its parity checks are exactly satisfied.
- **The other 24 divisors contain Q238**, and therefore every codeword under them would also be a Q238 codeword. The original solved p56+p57 interior already contradicts Q238 by **159/180** observations after fitting its entire eighteen-symbol multiplier. No stronger multiple of Q238 can repair that failure. **All 24 are inconsistent with the known terminal plaintext** under the specified direct registration.

This is a complete **all-source-divisor dichotomy**, rather than an unbounded survey or a statistical exclusion. There are **zero monic divisors of the actual p50 GP29 polynomial that both fit the original known p56+p57 interior and uniquely recover p55** under the declared terminal coefficient model. The 48-way count relies on the previously established complete irreducible factorization; the 24 independent low-degree ranks are newly exhaustively computed, and the Q238 full-rank inverse is an independent original-source test with positive controls.

This closes the entire **direct polynomial-divisor terminal-code family**. It leaves open a cipher that acts on another register before polynomial coding, an independently specified permutation of the 256 table positions, an external key, or an entirely different role for the numbered table. Those are new mechanism requirements, not parameter tweaks within this exhausted family.

## What this changes for the Liber Primus solve

The exact G16 and Q238 factors offer opposite kinds of information. **G16 has too little parity to determine p55**, while **Q238 has enough redundancy to determine it but demonstrably does not fit the known closing pages** under the stated source ordering and alphabet. These are complementary cryptanalytic decisions with directly reproducible original-input evidence.

No further per-symbol tuning, arbitrary row/column rotations, secret basis changes or byte/rune codec searches follow from this source alone. Such changes need an original clue specifying them. The numerical grid can still carry a different state, secret key or instruction, and the terminal codewords might be encrypted under an independently selected operation. Neither present code test disproves those possibilities or claims recovery of new plaintext.
