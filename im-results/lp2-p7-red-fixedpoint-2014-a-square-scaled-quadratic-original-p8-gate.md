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

## Full original p8 plaintext/key-extraction decision

The adjacent physical p8 contains **255 original GP29 runes**, consisting of **12 red heading runes plus 243 black**. This is exactly **51 packets of five**, with no padding or invented source letters. Group all255 in original page/rune order, apply the actual Π to each five-rune vector, and take the projected **zero-based components 4 then3**. These are linearly independent rows of the rank-two projector and their order is fixed by the two p8 original heading-word GP products **[4,3]**. The resulting complete receiver contains **102 native GP29 values**. This is a proposed lossy key/message extraction, since the original 255 inputs cannot be reconstructed from 102 outputs alone.

The actual original-p8 output has **GP29 IoC 0.036497767424** (original p8 **0.034275127374**), both close to the uniform benchmark1/29. It begins in GP spelling with:

**OE F F Y I A T ING L L R I A Y L T G B NG NG O P S N I G M IA IA IA ...**

No sustained recognizable original-page prose, address, or typed instruction was recovered. The original already-clear p57 source has GP29 IoC about **0.06271**. The proposed extraction does **not** establish a cipher or a key even though the algebra and source input registration are exact.

The [read-only Windows Node.js22 CommonJS original-input test](../sims/lp2_p7_2014_a_square_gf29_scaled_eigenspace_p8_original_sft.cjs) reads the actual 2014 matrix, original GP corpus, original red-ink annotations and line-preserving transcription. It independently reconstructs the five p7 source word products, two p8 title products, the complete historical characteristic polynomial, both polynomial factorizations, the scaled-matrix fixed-point rank and the canonical projector. It checks all255 original receiver symbols and prints the **full 102-symbol original output**. A fixed right inverse independently embeds 102 known GP29 runes drawn from the authentic solved p57 into 51 five-rune source-shaped words and recovers **102/102 exactly**. The plant demonstrates the transport can express plaintext, without authenticating this original decoding idea.

## Decision

The **historical 3301-square quadratic x²−3 and p7 quartic residual x²−8** exhibit a genuine, formerly unrecorded *scaling relationship that exactly involves the adjacent two p8 heading products3 and4*. The canonical two-dimensional common fixed subspace is a mathematically legitimate original-input **candidate key location**. The *one fully source-frozen, 255→102 p8 receiver* remains ciphertext-like. This rejects that immediate extraction as direct native GP prose and leaves the key/destination problem unresolved.

Promote the source connection to a cipher hypothesis only with an independently selected original recipient and typed output predicate. Changing coordinates, phases, word segmentation, square variants or output alphabet to fit favorable short English would reintroduce an unrestricted search. No additional unverified ciphertext key is claimed.
