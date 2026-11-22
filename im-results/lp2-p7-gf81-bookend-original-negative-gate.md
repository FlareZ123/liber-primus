# P7 finite-field bridge to the 81² / 80² bookend: tested first consumer

**Agent49, 22 November 2026.** **Status: provisional mathematical solve-path hypothesis with exact original-input negative consumers.** This work identifies a previously untested finite-field connection among *already independently documented* source operands. **It recovers no unknown Liber Primus plaintext, no authentic key, and no confirmed intended decoding mechanism.** Its importance is the concrete possibility of a GF(81) address transformation, which must still be selected by first-party evidence and tested on unknown ciphertext.

## The source-visible chain

1. Physical LP2 **p7** ends with five fully red words, whose original GP29 zero-based rune-index products are **[11, 26, 8, 15, 2]**, with exact rune word lengths **[2, 4, 3, 2, 3]**. Their authentic 14-rune red span begins at page-local offset194. These operands and the *ascending-degree* polynomial convention already existed independently in [the original p7 fixed-point study](lp2-p7-p8-original-red-polynomial-fixedpoint.md) and [the seven-cycle / pair-rotation study](lp2-p7-red-polynomial-seven-cycle-original-gate.md). Their genuine GP29 polynomial is \(P(t)=11+26t+8t^2+15t^3+2t^4\pmod{29}\), which has separate p8-based fixed-point witnesses; those preexisting results should not be attributed to this note.
2. **New conditional read:** reduce those five exact coefficients modulo **3**, producing **[2,2,2,0,2]**. Normalizing the leading coefficient by 2 over GF(3) yields
   \[
   f(t)=t^4+t^2+t+1\quad\text{over GF}(3).
   \]
   **Exact fact:** this monic quartic has no root in GF(3) and no monic quadratic divisor. It is therefore irreducible and defines the field \(\mathrm{GF}(3^4)\), of size **81**. The element \(t+1\) has multiplicative order **80**, and its first six powers in the four-trit, little-endian coefficient numbering are **[1,4,16,28,45,17]**. The source does **not** explicitly instruct readers to switch from its genuine modulus29 to modulus3, choose a field generator, or treat p7 as a quartic for a later square.
3. Independently, the original unknown rune tape is **12,956** symbols. Its sole repeated consecutive *two-word* ciphertext type occurs once ending at **6,561 = 81²**, and again at the very end, positions12,950–12,955. This partitions the original tape into the first **6,561** runes and the last **6,395**. The five authentic red Arabic ordinal labels printed on p36–p38 insert five *nonrune* slots into the latter, giving precisely **6,400 = 80²** positions. The ordinal slot coordinates after insertion are **(28,4), (29,64), (30,76), (32,15), (33,32)** in an 80×80 row-major square. The square split and marker geometry were identified independently in [the source-aligned bookend study](bookend-81x81-80x80-ordinal-insertion.md).
4. This **81-element field → 80 nonzero field elements** distinction supplies a new, mathematically executable *candidate* reading of the 81×81 / 80×80 dimensions. The 81²−80² = **161** slots omitted by keeping only nonzero coordinate pairs are exactly the zero row and zero column of an 81×81 field-pair square. It requires no *additional* 81×81 dimensional coincidences. It does require the unprinted choice to use field element pairs as text coordinates.

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

**Keep the p7→GF81 mathematical bridge as a narrowly described, provisional hypothesis.** It makes the already-known 81²/80² bookend a specifically testable finite-field proposal. **Retire direct source-pad addition and arbitrary row/column secret substitution**, whose original ciphertext failures are decisive. Do **not** initiate a broad generator/polynomial/orientation hunt on numerical alignment alone.

A serious next step must find an *independent original clue* that chooses a field-unit consumer, such as a printed instruction to remove zero coordinates, a field basis or generator, a function of two field elements, or a historically available original keyed operation. Without that selector, the GF81 interpretation remains an attractive postnoticed mathematical association, not a solve path established by the authors.

**Reproduction:** [Windows 11 Node22 original-source SFT](../sims/lp2_p7_gf81_bookend_original_sft.cjs) reads the exact original 29-index corpus and p7 ink annotations, derives all five red products, proves GF(3) irreducibility and the primitive unit period, locks the original marker coordinates, checks both GP29 inverses and four all-secret equality gates, and recovers a full genuine-p57 plaintext *synthetic* plant. [Windows workflow](../.github/workflows/lp2-p7-gf81-bookend-original.yml) runs this without changing the source artifacts. Source data: [canonical rune sequence](../resources/liber-primus/lp2-corpus.json), [original ink annotation](../resources/liber-primus/lp2-ink-annotations.json), [source-verified square cut](bookend-81x81-80x80-ordinal-insertion.md).