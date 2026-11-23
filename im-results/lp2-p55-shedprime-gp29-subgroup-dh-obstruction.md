# LP2 terminal SHED prime: cyclic-group obstruction and DH-exponent lower bound

**Agent8, 23 November 2026. Classification: exact source-conditioned algebraic exclusion of specific finite-field decipherment mechanisms. No unknown LP2 plaintext, author-selected key or final destination.**

## An original clue with a conditional source parse

The already documented [p55 SHED arithmetic](lp2-p55-shed-circumference-prime-shell-original.md) takes the 16 complete words wholly printed on physical p55, removes their first and last runes as suggested by clear p57's “SHED OUR OWN CIRCUMFERENCES,” and reads the 43 interior and 32 outer GP0 digits in authenticated 2013 BASE29 order. The source exact results are

- Interior integer `N = 8P`, where `P = 63755441409934721069036418908763882578170591536653256311514221` is a previously certified 206-bit prime.
- Exterior integer `E = 43Q`, where `Q = 1268532719737981052966698570711268391040527137` is a previously certified primitive root modulo `P`.

The p55 page-local parsing **is not independently selected by the original**: the first rune belongs to a complete word carried across from p54. Incorporating that word changes both integers and destroys these properties. Every conclusion below is specifically conditional on the existing 16-word SHED parse; nothing here licenses that parse as a historical instruction.

## Exact field-group restriction: no 29- or 28-cycle

From the genuine p55 digits and the earlier complete factor certificate, the finite multiplicative group has order

`P−1 = 4 × 5 × 41 × 49477 × 15535963 × 101149063843788281988908603592862658065019147521.`

The source group gives these exact orders:

| Target operation | Required cyclic order | gcd(P−1, required order) | Exact consequence |
| --- | ---: | ---: | --- |
| GP29 additive-rune rotation or 29th-residue character | 29 | **1** | No nontrivial order-29 subgroup or multiplicative character onto `Z/29Z`; every nonzero field element is a 29th power |
| 28-step nonzero-difference wheel / rank28 | 28 | **4** | No subgroup of order28; no surjective multiplicative character onto a cyclic28 register |
| 43-position source-clock as cyclic subgroup | 43 | **1** | No subgroup of order43; raising to the 43rd power is instead a bijection |

Proof for the first line: since `P ≡ 24 (mod29)`, `P−1 ≡23 (mod29)`, so `gcd(29,P−1)=1`. Lagrange's theorem excludes an element of order29. The homomorphism theorem excludes a nontrivial group homomorphism from the multiplicative group to additive GP29. Fermat/group inversion shows the map `x ↦ x^29 modP` is a permutation of all nonzero residues. **A 29th-power-residue membership test would be constantly true, providing zero recoverable GP29-symbol information.** For 28, `P ≡9 (mod28)` gives `gcd(P−1,28)=4`. This excludes a *cyclic subgroup* encoding 28 nonrepeat delta symbols, though 28 arbitrary distinct field values could still be used as a codebook.

These are all-secret impossibility statements for the exact **multiplicative-group** architectures, independent of starting keys, private exponents or output scoring. They do **not** exclude arbitrary 29-value encodings, additive field arithmetic, a nonhomomorphic KDF, other moduli, or a use of `P` as a general large prime.

## Conditional historical DH public values force large private exponents

The manuscript's unique literal-DH line on p28 gives a [conditionally recovered 2013-style miniature](lp2-p28-dh-crossmod-chain-audit.md) with public values **A=8**, **B=19**. The natural transfer hypothesis would retain these public values and use the source-derived p55 group `(P,Q)` as modulus and generator. The question of small 2014 human-performable private exponents can be settled **without computing a 206-bit discrete log**.

Let `M = 4×5×41×49477×15535963 = 630311729907820` (50 bits) and `L=(P−1)/M=101149063843788281988908603592862658065019147521`. Since `Q` has order `P−1`, `Q^L` has exact order `M`. For any public value `A`, the equation `Q^a=A modP` implies the unique congruence `a = d_A (mod M)`, where `(Q^L)^d_A = A^L modP`.

| Putative public field value | Proven exact `a mod M` |
| ---: | ---: |
| 8 | **97883509924151** |
| 19 | **250111533132869** |
| 2 | 242731746610657 |
| 43 | 483581994079669 |
| 1033 | 495201920893266 |
| 3301 | 208442035865464 |

Every residue is checked as a subgroup equality against the untouched original derived `P,Q`; `Q`'s primitive-root certificate establishes uniqueness modulo `M`. In particular **neither 8 nor 19 can arise from a nonnegative private exponent below `2^46`** using generator `Q`. The original miniature's `a=6,b=15` are excluded immediately, as is every similarly small private exponent. This extends the prior exclusion of merely transplanting `g=5,A=8` with a key-independent obstruction to *any* small exponent for `g=Q,A=8,B=19`. Huge discrete logs remain possible by design, and the source does not specify these public values for the p55 field.

## A concrete field inverse that also fails as a direct message

Because `gcd(43,P−1)=1`, the 43rd root of `Q` is uniquely determined under the same conditional source interpretation. With `d=43^{-1} mod(P−1)`:

`Q^d modP = 15234406656757422027455490330089151796805602605736279814014578.`

Its canonical GP0 base29 representation has **42 rune digits**, transliterating to

`T OE H NG T D N O X F B F D IA L I N X T F NG E IA EO X S W A A AE TH F B D I O M F TH M G Y`.

The calculation is exact and reversible by raising the result to the 43rd power, but the 42-rune output does **not** form a recognizable original-language instruction. This is only one explicitly defined numerical consumption, not an attempt to rank transformations or force a guessed plaintext.

## Decision and reproduction

**Retire the direct p55 SHED-prime-as-GP29/GP28-multiplicative-subgroup interpretation and the exact public-value `8/19` small-exponent DH transfer.** The candidate prime `P` remains arithmetically real and may still serve a large-field KDF or other historically selected cipher if an original operator identifies it. Neither the factor8 nor the word count43 by themselves authenticate an external key. Do not rerun generic exponent or alphabet projections absent a distinct clue.

[Read-only original-corpus CommonJS SFT](../sims/lp2_p55_shieldedprime_field_arithmetic_sft.cjs) reconstructs all source integers from the untouched p55 76-rune source and word lengths, checks the prime-order factorization and generator order, proves the 29/28/43 gcds, verifies the exact small-subgroup discrete-log residues without fitting plaintext, and recovers the unique 43rd root. The script was independently run in Node22 against a source-equivalent p55 fixture with all source assertions; the GitHub committed script also checks the complete canonical original p55 page arrays on execution. The separate primality certificate is in [the original p55 SHED report](lp2-p55-shed-circumference-prime-shell-original.md).
