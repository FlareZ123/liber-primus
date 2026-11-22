# P7 finite-field bridge to the 81² / 80² bookend: tested first consumer

**Agent49, 22 November 2026.** **Status: provisional mathematical solve-path hypothesis with exact original-input negative consumers.** This work identifies a previously untested finite-field connection among *already independently documented* source operands. **It recovers no unknown Liber Primus plaintext, no authentic key, and no confirmed intended decoding mechanism.** Its importance is the concrete possibility of a GF(81) address transformation, which must still be selected by first-party evidence and tested on unknown ciphertext.

## The source-visible chain

1. Physical LP2 **p7** ends with five fully red words, whose original GP29 zero-based rune-index products are **[11, 26, 8, 15, 2]**, with exact rune word lengths **[2, 4, 3, 2, 3]**. Their authentic 14-rune red span begins at page-local offset194. These operands and the *ascending-degree* polynomial convention already existed independently in [the original p7 fixed-point study](lp2-p7-p8-original-red-polynomial-fixedpoint.md) and [the seven-cycle / pair-rotation study](lp2-p7-red-polynomial-seven-cycle-original-gate.md). Their genuine GP29 polynomial is \(P(t)=11+26t+8t^2+15t^3+2t^4\pmod{29}\), which has separate p8-based fixed-point witnesses; those preexisting results should not be attributed to this note.
2. **New conditional read:** reduce those five exact coefficients modulo **3**, producing **[2,2,2,0,2]**. Normalizing the leading coefficient by 2 over GF(3) yields
   \[
   f(t)=t^4+t^2+t+1\quad\text{over GF}(3).
   \]
   **Exact fact:** this monic quartic has no root in GF(3) and no monic quadratic divisor. It is therefore irreducible and defines the field \(\mathrm{GF}(3^4)\), of size **81**. The element \(t+1\) has multiplicative order **80**, and its first six powers in the four-trit, little-endian coefficient numbering are **[1,4,16,28,45,17]**. The source does **not** explicitly instruct readers to switch from its genuine modulus29 to modulus3, choose a field generator, or treat p7 as a quartic for a later square.
3. **Stronger original p8 operand alignment.** Page 8 starts with exactly two visibly red whole words, **XIXM** (4 GP symbols) and **UXMCTHPOB** (8 GP symbols), with published GP29 products **[4,3]**. Its final red rune is original GP-index **17**; its black text has **255−12=243 =3⁵** original runes. In the p7-derived field's *four-digit base-3 polynomial basis*, literal **3 represents x**, and **4 represents x+1**, which is exactly the primitive multiplicative generator of order80 used above. The **fifth power** of this literal source-selected generator is
   \[
   (x+1)^5=2+2x+x^2,
   \]
   with canonical base-3 field-coordinate value **2+2·3+9=17**, identical to the final printed p8 red-rune GP29 index. This connection uses **both red whole-word products**, the **fifth step** from the five source p7 red words, **the terminal red GP rune**, and a **five-trit-sized black interval**; it sharpens the candidate choice of field basis and generator. However, 3 and4 are *also* exactly the preexisting GP29 fixed points of P, and17 is the same known GP29 derivative P'(4). These reuse the same original symbols and cannot be counted as independent probabilistic evidence.

**Exact uniqueness theorem, independent of GP29 polynomial coefficient fitting:** the p8 first word-product **4** specifies \(g=x+1\), the second **3** specifies the polynomial coordinate \(x\), and its last red index **17** is \(2+2x+x^2\) under little-endian base-3 field coordinates. The source has five immediately preceding red words, supplying exponent5. In the polynomial ring GF(3)[x], the **exact integer-free identity** is
\[
(x+1)^5-(2+2x+x^2)=(x-1)(x^4+x^2+x+1).
\]
The right-hand quartic is irreducible. Therefore, among **all 81 monic degree-four GF3 polynomials**, *including reducible ones*, the **only** polynomial modulus that makes \((x+1)^5=17\) in its quotient ring is exactly **\(f=x^4+x^2+x+1\)**. The source *independently printed* five p7 coefficients reduce and normalize to precisely that unique polynomial. There are **18 irreducible monic quartics**, so this is a sharper statement than saying the discovered quartic merely happened to be irreducible. The exact identity **does not establish** that the creator selected base-3 polynomial interpretation; it locks the arithmetic conditional on that physical reading, and changes the future task from guessing a field to finding its intended *ciphertext consumer*.

4. **Conditional discriminating family:** the existing p8 GP29 fixed-point/derivative conditions P(3)=3, P(4)=4, P'(4)=17 leave exactly **841=29²** GP29 quartics. Enumerate that *already independently fixed* two-parameter family, reduce each candidate's five GP29 coefficients modulo3 and normalize its nonzero leading coefficient to monic. Exactly **114/841** yield an irreducible degree-four GF3 polynomial, and **54/841** of these give the printed-order 4=x+1 a primitive 80-element generator. Exactly **six** irreducible candidates further satisfy the *new p8 original-output relation* \((x+1)^5=17\), and all six are primitive. Their GP29 low-first source coefficient vectors are:

   [8,14,20,6,2], [23,20,5,6,14], [20,5,5,9,5], [11,5,11,12,26], **[11,26,8,15,2] (actual p7)**, [2,26,14,18,23].

   These are **exact conditional enumerations**, reproduced in the Windows Node22 source test; all six alternatives normalize modulo3 to the **same uniquely P8-predicted polynomial f**. They are not a predeclared significance estimate. Choosing the GF3 coefficient reduction, the base-3 polynomial-coordinate representation, and the fifth-power equation was exploratory, informed by source counts. The resulting relation **provides a finite cross-page mathematical selector for a candidate field** but still specifies neither the encryption clock nor a full recoverable plaintext codec.

5. Independently, the original unknown rune tape is **12,956** symbols. Its sole repeated consecutive *two-word* ciphertext type occurs once ending at **6,561 = 81²**, and again at the very end, positions12,950–12,955. This partitions the original tape into the first **6,561** runes and the last **6,395**. The five authentic red Arabic ordinal labels printed on p36–p38 insert five *nonrune* slots into the latter, giving precisely **6,400 = 80²** positions. The ordinal slot coordinates after insertion are **(28,4), (29,64), (30,76), (32,15), (33,32)** in an 80×80 row-major square. The square split and marker geometry were identified independently in [the source-aligned bookend study](bookend-81x81-80x80-ordinal-insertion.md).
6. This **81-element field → 80 nonzero field elements** distinction supplies a new, mathematically executable *candidate* reading of the 81×81 / 80×80 dimensions. The 81²−80² = **161** slots omitted by keeping only nonzero coordinate pairs are exactly the zero row and zero column of an 81×81 field-pair square. It requires no *additional* 81×81 dimensional coincidences. The original p8 red products 4 and3 now motivate the field generator and basis more sharply, but it still requires an unprinted instruction to use field element pairs as text coordinates.

**Hypothesis sensitivity.** Exactly **18 of the 81 monic quartic polynomials over GF(3)** are irreducible. Irreducibility alone therefore has a substantial coincidence rate among random reduced coefficient vectors. The bookend cut and five-source-label insertions also originated as a postnoticed structural pattern. These facts must not be multiplied into an unjustified author-intent probability.

## Explicit first consumer: field-coordinate source pad

Freeze the following source-data-only decoder **before** reading output:

- Use the genuine original **first 6,561** GP29 indices as an 81×81 matrix \(A\), row major. Index field elements by \(a_0+3a_1+9a_2+27a_3\), where \(a_i\in\{0,1,2\}\) are their polynomial-basis coefficients modulo the p7-derived quartic \(f\).
- Let \(g=t+1\), a proven order-80 field unit. The final original **6,395** ciphertext runes are put into an 80×80 row-major matrix \(C\), with the **five actual printed paragraph numerals** represented as empty cells, never fabricated runes.
- Define the prospective source pad
  \[
  K_{r,c}=A_{\operatorname{index}(g^r),\,\operatorname{index}(g^c)},\quad
  Q_{r,c}=C_{r,c}\pm K_{r,c}\pmod{29},
  \]
  for \(0\le r,c<80\) at original rune-bearing cells. Both signs are shown because the printed puzzle has not selected one. There is no hidden private or fitted parameter within either sign.
- Require long, recognizable direct GP29 plaintext with native linguistic frequency, and exact reencryptability. A synthetic **6,395-rune authentic p57 plaintext plant** under the same source pad and five marker holes recovers every intended rune exactly.

**Original results:** Both inverse directions remain uniform/ciphertext-like, independent of their perfect mathematical reversibility.

| Original fixed decoder | IoC over 6,395 recovered symbols | Largest 12 GP bins | Result |
| --- | ---: | ---: | --- |
| \(C-K\) | **0.03441043609** | **2,762 / 6,395** | No visible native GP29 prose |
| \(C+K\) | **0.03444599523** | **2,789 / 6,395** | No visible native GP29 prose |
| Source solved p57 plaintext, comparison | **0.06270996641** | Native-language reference | Genuine plaintext control |

These tests reject **this direct field-indexed additive source pad**, not every possible GF81-based transform. An unprinted key, different pad derivation, row walk, compound arithmetic or additional plaintext layer cannot be inferred from the negative result.

### Stronger all-secret field-coordinate check

Even permitting an *arbitrary secret 29-symbol substitution codebook separately for each of the 80 output rows or columns*, the direct field pairing \(A_{g^r,g^c}\mapsto C_{r,c}\) is incompatible with authentic source equality constraints: when a mapped source glyph repeats within a codebook's domain, the destination glyph must repeat identically. Exact original contradictions:

| Address operation | Hidden glyph-map domain | Reused original source glyphs | Contradicting target values |
| --- | --- | ---: | ---: |
| \((g^r,g^c)\) | One arbitrary map per output row | 4,192 | **4,052** |
| \((g^r,g^c)\) | One arbitrary map per output column | 4,215 | **4,059** |
| \((g^c,g^r)\) | One arbitrary map per output row | 4,215 | **4,068** |
| \((g^c,g^r)\) | One arbitrary map per output column | 4,193 | **4,043** |

This is a **key-independent hard exclusion of direct fixed per-row or per-column glyph relabeling at the exact field addresses**. It does not exclude position-changing codebooks, nonlinear mixing between source cells or a true second encrypted layer. The original p7 quartic is still a valid field definition irrespective of the receiver failures.

## Decision and next real discriminant

**Keep the p7→p8 GF81 mathematical bridge as a narrowly described, provisional hypothesis.** The literal p8 red 4/3 operands, exponent5 from the five preceding red words, and exactly matched terminal red 17 make its field basis and uniquely determined quartic unusually specific; the already-known 81²/80² bookend is a candidate recipient. **Retire direct source-pad addition and arbitrary row/column secret substitution**, whose original ciphertext failures are decisive. Do **not** initiate a broad generator/polynomial/orientation hunt on numerical alignment alone.

A serious next step must find an *independent original clue* that chooses a field-unit consumer, such as a printed instruction to remove zero coordinates, a field basis or generator, a function of two field elements, or a historically available original keyed operation. Without that selector, the GF81 interpretation remains an attractive postnoticed mathematical association, not a solve path established by the authors.

**Reproduction:** [Windows 11 Node22 original-source SFT](../sims/lp2_p7_gf81_bookend_original_sft.cjs) reads the exact original 29-index corpus and p7 ink annotations, derives all five red products, proves GF(3) irreducibility and the primitive unit period, locks the original marker coordinates, checks both GP29 inverses and four all-secret equality gates, and recovers a full genuine-p57 plaintext *synthetic* plant. [Windows workflow](../.github/workflows/lp2-p7-gf81-bookend-original.yml) executed successfully as [expanded Node22 Windows Actions run 45055004028](https://github.com/FlareZ123/liber-primus/actions/runs/45055004028) (the unique-81-quartic assertion was added to the SFT in the subsequent commit) without changing the source artifacts. Source data: [canonical rune sequence](../resources/liber-primus/lp2-corpus.json), [original ink annotation](../resources/liber-primus/lp2-ink-annotations.json), [source-verified square cut](bookend-81x81-80x80-ordinal-insertion.md).