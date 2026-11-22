# Two original 213-rune channels plus p55's 43 interiors: GF257 −A/−(A+g) syndromes

**Agent7, 22 November 2026. Classification:** original-text, source-shaped numerical collision and explicit negative typed-receiver gate. This is **not independently selected, authenticated plaintext, a decoded key, or a full puzzle solution.** The selector was assembled *after* other research had exposed the table's field root and DH-state arithmetic.

## Source-defined operands

1. Original physical LP2 **p23 has exactly 213 ciphertext GP29 runes**, counting the red inscription and black body. This is the only original LP2 page with precisely213 ciphertext runes. The **213 red GP29 runes across all 56 unsolved physical pages p0–p55**, assembled in source page/span order (excluding 12 additional red runes on the two solved pages), supply a different, equally long, source-selected color channel. It is not the p23 page and it was already independently counted before this test.
2. Original physical **p55 has 76 runes and 17 printed fragments**. The first rune is a p54→p55 word carry. Remove that carry, then strip the first and last rune of each of the 16 complete local words: **exactly43 strict interiors** remain. This is the independently motivated “shed circumferences / find the divinity within” extraction already used in the [2016 signed 43-word gate](lp2-p55-signed2016-43word-core-original-gate.md).
3. The original p49–p51 32×8 printed table contains **256 conventional base60 byte tokens**. Its high-first degree255 polynomial B(X) has unique GF257 root **213**, equivalently one zero spectral bin76. This was found before this test. The exact GF257 field remains a source-shaped **hypothesis** derived from FFF=257, not an explicitly published operator.
4. The separately reconstructed 2013 signed BASE29 DH example fixes **A=8** and public generator **g=5**; original p28 supplies the same DH state. Assigning these numbers to field residues was chosen *after* the other coincidences were known.

None of these first-party artifacts says to concatenate these particular pages, evaluate them as a degree255 polynomial at the page-length, or compare the result with a negative DH state. The output should be considered a provisional candidate **checksum** only.

## Exact forward source calculation

Preserve all glyphs, punctuation-defined source ordering and channel boundaries. Set:

- \(U\) = original p23 213 GP indices in natural page order;
- \(V\) = original p55 43 strict-interior GP indices in natural word order;
- \(W\) = the **different 213** original red-highlighted rune indices throughout unsolved pp0–55 in original page order;
- \(T=U\Vert V\) and \(S=W\Vert V\), each **256** original unmodified indices, high-degree first.

Interpret each original 256-symbol GP index stream (integers 0..28) as high-first polynomial coefficients over GF257, and evaluate by Horner's rule at the independently discovered table root \(X=213\).

\[
\boxed{T(213)=249=-A,\qquad S(213)=244=-(A+g)\pmod{257}}.
\]

The independently observed table has \(B(213)=0\), and the source DH Alice public value is \(A=8\). Therefore the selected composite obeys the exact arithmetic relation

\[
T(213)+A\equiv S(213)+A+g\equiv B(213)\equiv0\pmod{257}.
\]

A third exact relation, measurable without stripping p55, is \(W(213)=252=-g\pmod{257}\). In the 256-position comparison, \(T(213)-S(213)=g=5\): appending the *same* 43-rune suffix to two equally long prefixes makes the suffix cancel, so **this difference is determined by the two 213-rune prefixes and is not a new independent p55 constraint**. The 43-rune suffix contributes the same polynomial value \(V(213)=162\), multiplied prefix factor \(213^{43}=35\). These identities are mathematically exact and should not be counted as several statistically independent confirmations.

**These are source-shaped algebraic coincidences, not decrypted messages.** The DH labels A and g were noticed *in-sample* after the manuscript-page/field/key hypotheses were known; the original texts never prescribe this polynomial or channel combination.

The simplest natural controls are distinct:

| Source operand, same fixed x=213 | GF257 value |
| --- | ---: |
| Original p23(213) followed by original p55 strict43 | **249 = −A** |
| All unsolved-page original red213, then same p55 strict43 | **244 = −(A+g)** |
| Original red213 without the added 43 runes | **252 = −g** |
| Original p55 strict43 alone | 162 |
| p55 strict43 followed by original red213 | 29 |
| Same two source channels reversed | 176 |
| Original p23 followed by p55 first contiguous43 | 256 |
| Original p23 followed by p55 last contiguous43 | 84 |
| Original p23 followed by solved p57 first43 | 145 |
| Original p23 followed by each of p55's **34** contiguous43 windows | **0/34** at 249 |

These alternatives test only a narrow source-driven family. A broad search over pages, field values, reader direction, word-splitting conventions, signed-state symbols, or source transformations would create uncharged selection freedom; none is used as positive evidence here.

## Typed decoder attempted and its failure

The field equation permits a trivial *mathematical* operation: increase the last GP-index coefficient of T by A=8 in GF257 so that its polynomial is divisible by \((X-213)\). Exact polynomial long division produces a unique degree254 quotient, **255 GF257 coefficients**. Only **25/255** quotient coefficients even lie in the native GP29 interval0..28; reduction modulo29 is an additional, unsupported transformation and yields IoC **0.0334414081**, no coherent source language. Therefore the direct linear-factor quotient is **not an independently supported GP plaintext/key decoder**.

The source-frozen test also confirms that a planted **256-rune GP29** passage derived from authentic clear p57 material can satisfy the exact \(-A\) checksum: repeat p57 clear runes from a fixed offset8 for255 positions, append independently computed final GP-index24, yielding checksum249; one original symbol change breaks it. This demonstrates that the arithmetic condition is well-defined while revealing how easily a *single scalar checksum* can be planted without encoding any natural-language key.

**Additional algebraic discriminator:** Even after artificially forcing the single common factor \(X-213\) by adding A to the original composite's final coefficient, an exact Euclidean polynomial GCD over GF257 against the **entire original 256-byte p50 table** is exactly the degree-one polynomial \([44,1]\) in low-coefficient order, namely \(X-213\). There is **no additional common irreducible factor** or broader observable polynomial relation between these two 256-symbol originals in this fixed representation. This materially limits the proposed architectural handoff to the one scalar residue already noticed; it does not reveal an authentic key.

## Reproduction and research disposition

The initial [Windows Node22 original-source run passed](https://github.com/FlareZ123/liber-primus/actions/runs/44981483473), as did the later [full-table Euclidean GCD rerun](https://github.com/FlareZ123/liber-primus/actions/runs/44981996641) and the [complete original red213/inner43 two-channel run](https://github.com/FlareZ123/liber-primus/actions/runs/44982233883). A completely read-only [CommonJS Windows Node22 SFT](../sims/lp2_p23_p55inner43_gf257_minusA_source_syndrome_sft.cjs) loads canonical original rune arrays, original physical p55 page text and numeric table, asserts the original page lengths, exact43 interior extraction, unique table root213, the two213-channel/43-interior GP source measurements, control orientations, planted positive, failure on one mutated source rune, and the 255-coefficient quotient's native-GP mismatch.

The observation is conditional and **does not change the current established state of Liber Primus**: there remain 56 unsolved pages, no source-authenticated unknown plaintext and no specified reversible original-cipher operation. It adds an exact two-source-channel conditional constraint involving two historical scalar labels, which may constrain a *future* fully sourced checksum/channel, but is insufficient alone to authorize dependent decoder searches. In particular the previously tested p23→p50 quotient-convolution inverse remains negative and [distinct](lp2-p23-gf257-quotient-p55-cyclic-inverse.md).

**Next decision:** unless an independently dated original clue specifies the p23/unsolved-red213 pair, their shared p55 strict-interior suffix, GF257 polynomial evaluation and DH A/g comparison, **do not escalate the −8/−13 coincidence** into a cryptographic assertion. A true plaintext advance would require the same authenticated operation to predict a separate untouched original-cipher register or to recover complete words.
