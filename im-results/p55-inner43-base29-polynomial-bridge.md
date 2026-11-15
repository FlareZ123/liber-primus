# p55 inner43 BASE29 polynomial bridge

**Status: Two exact original-source polynomial evaluation observations, both conditional on an unselected ascending-coefficient and *physical-page-local* segmentation. The exterior 25/25 coincidence fails the correct full-word page-carry control and a frozen direct key consumer produces no plaintext. Neither is a decryption.**

## Claim

The 43 strict-interior runes of physical p55, conditionally interpreted as coefficients in ascending polynomial degree, an orientation used in earlier p39 GF29 analysis but **not established by Cicada's signed 2013 BASE29 example**, define a polynomial (P_{55}(X)\in GF(29)[X]) with two source-anchored evaluations:

\[
P_{55}(3301\bmod29)=P_{55}(24)=18=1033\bmod29
\]

\[
P_{55}(1033\bmod29)=P_{55}(18)=23.
\]

The output 23 numerically matches the 23 terminal red dots on p57 and the modulus 23 in the signed 2013 Diffie–Hellman worked example. The protocol itself does not fix that modulus. These are reproducible **retrospectively chosen arithmetic correspondences**. Nothing in the authenticated p56, p57 or signed 2013 source instructs the solver to evaluate this proposed p55 polynomial at the two magic-square residues; no unknown plaintext, cipher inverse, or key-use rule follows.

## Human-visible route

1. **Correction to a mistaken historical selector:** the authenticated p56 decryption actually begins “AN END WITHIN THE DEEP WEB” and discusses finding a page that hashes to a specified digest. The claimed sentence “The first nourishes the last” does **not** occur in p56 plaintext or in the other known p57 rune text. Therefore no first-to-last instruction authorizes connecting the first 2014 square to the last p57 dots. That assignment is an exploratory researcher interpretation.
2. The clear p57 parable says to shed circumferences and find what is within. Applying the literal first/last-rune removal to p55's printed words selects its strict interiors.
3. Physical p55 has 17 printed rune segments with lengths `[1,4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3]`. The first is a one-rune page carry; the remaining complete words contribute exactly 43 interior runes.
4. The signed 2013 source demonstrates **ordinary base-29 positional conversion** `3301 → 3QO`: `3×29²+26×29+24=3301`. It does **not** specify using the printed `[3,26,24]` digits as *ascending* polynomial coefficients `3+26X+24X²`. That polynomialization and its order are conditional analytical choices. The conventional descending polynomial `3X²+26X+24` fails the original table divisibility check, as already documented in the base29-grid factor report.
5. The original 2014 three-square source has magic sums 3301, 1033 and 1033. Reducing these constants modulo 29 gives 24 and 18.
6. The original p57 page has a terminal cluster of 23 red dots; the signed 2013 DH worked example uses modulus 23, while the protocol leaves parameters participant-selected.

## Exact polynomial and field check

The coefficient vector, in printed order and ascending degree, is:

`[19,10,12,6,23,2,27,24,17,5,28,0,14,10,19,1,5,13,8,21,20,15,23,27,13,8,12,18,10,6,14,6,15,12,2,2,18,28,10,19,5,11,18]`

Thus (P_{55}) has degree 42. Its orbit beginning at the 2014 first-square residue is:

`24 -> 18 -> 23 -> 4 -> 6 -> 19 -> 22 -> 22`.

There is a second check using the signed 2013 quadratic

\[
H(X)=3+26X+24X^2.
\]

Polynomial reduction gives

\[
P_{55}(X)\bmod H(X)=6+26X.
\]

Writing (u=X\bmod H), the normalized relation is (u^2=11u+18). Therefore the field element (\alpha=6+26u\in GF(29^2)) has:

- trace (Tr(\alpha)=8);
- norm (N(\alpha)=24), again (3301\bmod29);
- multiplicative order 210, while (u) has order 840.

The norm match is an independent algebraic invariant of the same source-selected polynomial, not a plaintext result.

## The complementary 33 source-visible outer runes (Agent7, 14 November 2026)

A physical-page-local p55 segmentation yields another exact but fragile arithmetic identity. Its **17 page-local printed segments** split into **43 strict-interior GP29 digits and 33 outer/boundary digits** when retaining both first and last rune of every segment, counting the initial one-rune page carry once. The 33-digit exterior is

`[21,25,7,15,17,14,19,15,25,0,1,7,4,17,12,19,0,17,5,12,18,28,15,18,15,2,22,5,14,23,1,17,10]`.

The full edge array is reconstructed from original ciphertext and source word lengths by the [reproducer](../sims/lp2_p55_outer33_square25_polynomial_gate_sft.cjs). Let `O(X)` treat these 33 printed indices as ascending GF29 polynomial coefficients, using the same **conditional, unselected** operation as the 43-rune inner polynomial `I(X)` above. The historical 2014 magic-square sums `3301` and `1033` reduce to `24` and `18`, respectively. On the exact original runes:

\[
O(24)=25,\quad O(18)=25,\qquad I(24)=18,\quad I(18)=23.
\]

The exterior equalities give the exact polynomial identity `O(X)−25 = (X²+16X+26) Q(X)` over GF29 with a 31-coefficient quotient `Q` and zero remainder. **This factorization is simply the algebraic consequence of those two evaluations, not independent corroboration.** The two preserved 2014 five-by-five magic squares each have 25 cells, providing an independently player-available possible meaning for the output 25. Both 2014 sums, the p57 circumference instruction, and the 25-cell object are authentic source objects; the *choice to evaluate p55 word-edge coefficients as a finite-field polynomial and choose these two inputs* is retrospective. No original signer specifies that operation or identifies its output as a square-key selector.

**Whole-word source-layout objection and exact control.** The single opening p55 rune is `NG`, the **last rune of an eleven-rune word whose first ten runes are on p54**. The complete original word is `G O T TH X E EA R G Y NG` in GP transliteration. If the p57 instruction “shed circumferences” instead applies to *actual complete words* across the visible page turn, the first `G` on p54 must accompany the final `NG` in the outer register. That gives **34** whole-word exterior digits and **52** whole-word interior digits. Their source-fixed evaluations at the two historical square residues are:

| P55 source segmentation convention | Exterior length | Exterior `(24,18)` | Interior length | Interior `(24,18)` |
| --- | ---: | --- | ---: | --- |
| Physical p55 fragments, carrying standalone `NG` as edge (initial retrospective construction) | 33 | **(25,25)** | 43 | **(18,23)** |
| All 17 *complete* words, including p54's ten earlier runes | 34 | **(26,21)** | 52 | **(24,10)** |
| Only the 16 complete words wholly inside p55, excluding the carry fragment | 32 | **(5,26)** | 43 | **(18,23)** |

The equal-25 claim therefore depends on treating the page turn as a mathematical *coefficient boundary*, even though the manuscript prints an uninterrupted word across it. This is an independently visible objection to promoting it as a word-circumference cipher selector. A genuine page-local reset might still exist, but no authorial instruction establishes one.

**Frozen direct decryption attempt:** To determine whether the 33 original page-local edge coefficients are a useful `43`-symbol key, evaluate their polynomial at the 43 successive zero-based interior positions `i=0..42`; subtract `O(i) mod29` from the 43 original interior rune indices. The result begins `IA C S S EA TH T O B G` and has native rune IoC **0.03322259**, without a coherent English passage. The source-native 43-rune solved-p57 synthetic encryption is recovered **43/43**, so failure is in the proposed cipher role, not modular inversion. Because the polynomial is evaluated in GF29, the putative key repeats at position29 and the source does not authorize an exception or extra phase. This closes the **specified page-local direct GP29 additive consumer** and provides no justification for tuning polynomial evaluations to the desired plaintext.

A third source-visible field input provides an immediate limitation: `O(23)=1`, **not** 25, when 23 is selected from the original signed 2013 DH modulus or the p57 red-dot count. Across all 29 possible GP field inputs, exactly `X=18` and `X=24` yield 25; the exterior polynomial has 17 colliding input pairs overall, versus 14 expected under independent uniform outputs, so finding *some* equal-output pair is ordinary. Neither the quadratic quotient nor the inner/outer pair yields source-fixed plaintext, an independently authored key operation, or a new key clock; the direct key consumer above is negative. Do **not** multiply this conditional numerical correspondence into new GP29 cipher parameter sweeps without an independent authored key-use rule.

## Candidate BASE29/DH register closure (Agent17, 15 November 2026; hypothesis, not a decoder)

A new, exact arithmetic closure is worth testing against the page's source instructions. It is **conditional on treating the physical p55 page fragment as its own word-boundary register** and interpreting GP29 indices as base-29 digits.

The visible inputs are independently present on the original pages: p55 ends with 13 red marks; p57 has a five-column terminal red-dot grid containing 23 dots, a 13-dot opening marker, and a tree ornament with eight filled and two hollow circles (the circle count/centres are recorded in [Agent50's original-image note](../communications/agent21/20261111T225600Z_agent50_p57-dot-centroids.md)). The p57 parable's instruction to shed circumferences motivates the same page-local p55 split used above: 33 first/last boundary runes and 43 strict-interior runes.

Interpreting each GP29 index as a base-29 digit gives these original-ciphertext residues:

- page-local outer33 integer modulo 23 = **21**;
- page-local inner43 integer modulo 22 = **6**;
- whole p55-76 integer modulo 23 = **18**.

With the visually suggested Diffie–Hellman parameters (g=5, p=23, a=13), and the eight filled circles as the other public share, the exchange closes exactly. Important caveat: Agent50's direct-image review identifies these as terminal ornaments integrated into the tree illustration, not established data symbols; interpreting their filled count as a public share is an inferred assignment, not a transcription fact:

[
A=5^{13}\bmod23=21,\qquad B=5^6\bmod23=8,
]
[
K=A^6\bmod23=B^{13}\bmod23=18.
]

Thus the three p55 registers give (A=21), the other exponent (b=6), and the shared value (K=18); the p57 image supplies (g,p,a,B). The two hollow circles also equal (23-A=2), a secondary visual consistency check. There is a further possible reading of “divinity within”: φ(18)=6, exactly the inner43 residue. This connects the candidate shared value to the totient operation already relevant elsewhere in LP2, but remains an interpretation rather than independent proof. Reproduction: [BASE29/DH register-closure gate](../sims/p55_base29_dh_register_closure_sft.cjs).

**Critical control / strongest objection:** the first p55 rune is the final rune of an 11-rune word begun on p54. If the circumference operation is applied to complete words across the page turn instead of physical p55 fragments, the registers become outer34 modulo 23 = **4** and inner52 modulo 22 = **9**; the DH closure disappears. The page-local split is therefore a necessary, unproved selector, not a harmless formatting choice. This is a genuine competing geometric correspondence, not a null result: the combined p57 9×8 red mask has four marks per row and nine rows, while the whole p55 residue 18 equals 9×2 (the row count times the two hollow circles). That alternative has no complete reversible decoder yet, but it means the page-local DH reading is not uniquely selected. The signed 2013 source authenticates BASE29 and DH as available operations, but its worked base5/mod23 values are participant-selected examples, not fixed LP2 parameters. The p57 visual geometry independently suggests 5 and 23, but does not explicitly label them as (g,p).

This is **not recovered plaintext or a validated LP2 key**. Simple consumers tested for the candidate shared value 18—constant GP29 shift, the p56 prime-totient stream at prime starts 18/19, and the DH-derived (18\cdot5^i\bmod23) additive stream—do not yield coherent text. Do not launch unconstrained cipher sweeps. The decisive next question is whether the manuscript actually selects the page-local carry treatment and how an authentic DH shared value is consumed.

## Controls and interpretation

- Reversing the 43 coefficients gives (P(24)=4) and (P(18)=19), so the ascending order matters.
- Using all 76 p55 runes instead of the strict interior gives (P(24)=24) and (P(18)=26); the literal interior extraction matters.
- The 2013 signed source, 2014 square constants, p57 dot count and p55 word interiors are independent artifacts, but both the inner and outer polynomial constructions and the chosen evaluation points were proposed after inspecting them. The resulting arithmetic checks are not statistically independent and no historical operation selects the evaluation route. No p-value is claimed.
- A first source-selected consumer was tested on the 1,680-rune p33–39 chapter: the powers of alpha have period 210, and the chapter is 8×210. The six phase-zero additive GP29 readouts using the two coordinates and trace, under both signs, all remain uniform (IoCs 0.03429–0.03466); no plaintext. See [the p33–39 report](lp2-p33-39-gf841-period840-original-gate.md). This rejects the direct scalar-additive consumer, not every possible use of the polynomial.
- **DH provenance caution:** the signed 2013 source's worked exchange also prints base 5, server public share 8, client public share 19 and shared key 2, but explicitly says the server base and secret are participant-selected for each request. Do not treat those example values (or matches to the polynomial's trace 8 / orbit value 19) as organizer-fixed clues or key material. The candidate DH register closure above uses p57's 5-column/23-dot geometry as an independent but inferred selector; it remains conditional on that visual assignment and the page-local p55 split.
- This finding does not identify how (P_{55}), (\alpha), its norm, trace or order should be consumed by a cipher. The exterior equal-25 relation has the additional decisive full-word page-carry failure documented above. No arbitrary keystream, phase, stream-cipher or page-decoder search was performed. Waiting decoder challenge [#41](https://github.com/FlareZ123/liber-primus/issues/41) remains waiting; this report is a structural lead, not an attempt to bypass its acceptance gate.

## Reproduction

Run:

`node sims/p55_inner43_base29_polynomial_bridge.cjs`

The script checks the original p55 transcription against the canonical corpus, verifies the three 2014 square sums, evaluates the polynomial, reduces it modulo (H), and independently computes the field trace, norm and multiplicative order.

**Source anchors:** solved p56 plaintext summarized in [the authoritative synthesis](../results/README.md) · [original LP2 transcription](../resources/liber-primus/lp2-transcription.txt) · [canonical rune corpus](../resources/liber-primus/lp2-corpus.json) · [original 2014 squares](../resources/cicada2014-openpuff-magic-squares.txt) · [signed 2013 TCP/BASE29/DH source](../resources/external/2013-tcp-server-signed-source.md) · original p57 image `resources/liber-primus/74.jpg`.
