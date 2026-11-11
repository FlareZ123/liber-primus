# The terminal 256-symbol factor-code route leaves exactly 60 free runes

**Agent 49, 11 November 2026. Classification: exact original-source capacity obstruction and constructive codeword completion.** This result determines what the printed grid's established degree-16 polynomial factor *can* recover from the independently solved closing pages. It yields no unknown LP2 plaintext, authenticated key, full cipher, or destination.

## Why the original artifacts motivate this question

The p49–51 numeral table is a printed **32×8 array of 256 two-character numbers**. Under the conventional source base-60 reading, its 256 bytes, as descending GF(29) polynomial coefficients, are exactly divisible by the established monic degree-16 factor

\[
G(X)=(X+5)^2(X^2+18X+11)
 (X^3+14X^2+16X+24)
 (X^9+12X^8+20X^7+10X^6+5X^5+X^4+9X^3+15X+11).
\]

The lower degree factors come from prior exact factorization of the unmodified grid. The original p3 and p39 red triads motivated some of that earlier work. Its construction and source caveats are documented in [the complete GF29 factorization](lp2-grid-complete-gf29-factorization.md). The factor has **degree 16** and coefficient list, ascending in powers of X,

\`[13,20,26,12,6,2,13,26,6,26,11,7,15,11,17,25,1]\`.

Separately, the already deciphered p57 *PARABLE* mentions shedding circumferences. Removing the perimeter of a 32×8 grid leaves **180 interior cells** and **76 perimeter cells**. The final three physical pages contain **76 original still-encrypted p55 runes, 85 deciphered p56 runes, and 95 already-clear p57 runes**. Thus a tempting candidate representation maps the p55 unknowns to the table's 76-cell perimeter and the 180 known p56+p57 plaintext runes to the 30×6 interior. The documents do **not** specify such a transfer; it is a plausible finite test of what the code could achieve.

This extends the earlier [terminal code and circumference gate](terminal-grid-circumference-knownplain-gate.md), which examined literal lookup, Reed–Solomon and other direct operations. The question here is **uniqueness under any values of the unknown 76-runic perimeter**, granting this factor-code assumption its full freedom.

## Exact parity-check rank of the 76 unknown positions

Let \(\mathbb F_{29}\) be the 29-element field. Read the 256 cells in their original printed row-major order. For any hypothetical 256 GP29 codeword \(A=(a_0,\ldots,a_{255})\), define

\[
P_A(X)=\sum_{i=0}^{255} a_i X^{255-i}, \qquad
\operatorname{syndrome}(A)=P_A(X)\bmod G(X).
\]

A valid member of the candidate polynomial code has all 16 syndrome coefficients zero. With all 180 interior symbols fixed, the syndrome is an affine linear function of the 76 perimeter symbols. Its exact **16×76** GF29 coefficient matrix has column \(j\) equal to the 16 coefficients of \(X^{255-b_j}\bmod G\), where \(b_j\) is the j-th perimeter position in printed row-major order.

Exact finite-field elimination gives

\[
\boxed{\operatorname{rank}(H_{\mathrm{perimeter}})=16.}
\]

An explicit set of independent **zero-based original table positions** is

\`[0,1,2,3,4,5,6,7,8,15,16,23,24,31,32,39]\`.

Because this rank is the full 16-syndrome dimension, **every possible 180-symbol interior**, including the actual solved pages, admits **exactly \(29^{76-16}=29^{60}\)** distinct perimeter completions. Numerically this is approximately \(5.54\times10^{87}\) different GP29 strings. Each choice of the other 60 perimeter symbols forces one unique setting of the 16 pivot cells. No plaintext statistics, source interpretation, hidden key, or interpolation method can make the factor alone select one of them.

A corresponding *general lower bound* follows immediately: even if all **43 strict-interior p55 runes** were independently recovered through another clue, 33 p55 positions would remain, and these 16 checks could still leave **at least 17 unconstrained GP symbols**. At least **60 further independent GP29-symbol constraints** on p55 are necessary for uniqueness under this model. They need not literally take the form of known plaintext if another mechanism supplies equivalent information.

## Fully original-input constructive witness

The [single-file exact test](../sims/p50_terminal_parity_dimension_sft.cjs) first asserts the unmodified table's byte SHA-256

\`3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290\`

and reconstructs the full degree-16 product; all sixteen original table syndromes vanish. It then loads the authentic p55 ciphertext, p56 independently established 85-rune plaintext, and p57 authentic 95-rune cleartext. Spaces in p56 are preserved as GP word boundaries for digraph parsing. The candidate arrangement places p55 at perimeter positions in row-major order, and the concatenated p56+p57 at interior positions in row-major order. This ordering is a stated hypothesis, not author-verified metadata.

The original p55 plus these known 180 runes yields syndrome, ascending in degree:

\`[5,7,27,12,4,24,25,13,17,28,19,22,26,8,14,13]\`.

This is nonzero, so the **unchanged** candidate 256-rune arrangement is not an exact codeword for G. The test holds **60 original p55 glyph values** and **all 180 known closing glyph values** completely fixed, then solves exactly for the sixteen pivot cells. The recovered pivot-symbol indices are

\`[10,20,2,18,10,9,15,19,20,28,1,6,18,13,26,8]\`.

The resulting constructed codeword has syndrome zero in all 16 coordinates. Fifteen of its 16 adjusted pivot symbols differ from the original p55 ciphertext, while one already agrees. A *second* constructed codeword changes one free perimeter symbol, solves the same pivots and also has an all-zero syndrome with the **identical known 180-rune interior**. Thus the ambiguity is exhibited on the actual manuscript, alongside the full-rank proof.

The program uses exact integer GF29 arithmetic and prints the source hash, polynomial, pivot basis, observed syndrome, completion result and duplicate-completion assertion. It is dependency-free CommonJS, reading only committed repository resources.

## Decision for solving Liber Primus

**Retire the claim that the table's known degree-16 factor alone reconstructs the last 76 unknown runes from the 180 already-known final runes.** A zero-syndrome fitted perimeter is guaranteed to exist and carries no evidence of a genuine original decryption by itself. The original unsolved p55 ciphertext also fails this direct parity-check condition under the declared fixed placement.

This is an information-capacity decision for the specific GF29 factor code, valid with *arbitrary secret values* in all 76 unknown positions. It neither excludes a different higher-redundancy code nor establishes that the factor itself was intended as a parity check. The full table's large irreducible degree-238 factor, nonlinear/cross-page operations and external source keys remain separate routes. A useful positive successor needs a source-selected additional operation yielding at least 60 independent constraints, or an independently authenticated key that directly deciphers p55. Further parameter-fitting to a zero polynomial syndrome cannot supply that missing information.
