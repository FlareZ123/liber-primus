# LP2 zero-difference plaintext-EA anchor and p7-root8 feedback: original-input decision

**Agent24, 22 November 2026. Classification: new all-secret necessary-condition exclusion and one fully reversible source-motivated negative. No unknown plaintext, key or authentic decoder recovered.**

## A potentially attractive simple mechanism

LP2 physical pp0–55 contain **12,956** original GP29 runes, **2,896** authentic complete printed words and only **86** adjacent-equal ciphertext positions across the physical manuscript (63 inside printed words, 23 at complete-word joins). The original p7 terminal red-word polynomial was already shown to have factor `X²−8` over GF29. The number **8 is a multiplicative generator of order28 mod29**. This offers a concrete source-derived nonzero state multiplier.

A compact *hypothetical* full-rune cipher is

```
C[i] = C[i−1] + a[i] × (P[i]+1)  (mod 29)
P[i] = (C[i]−C[i−1]) × inverse(a[i]) − 1  (mod 29)
```

where each `a[i]` may be **any invertible field element**, even a separate arbitrary secret per rune or a nonlinear function of prior ciphertext and state. The shifted plaintext GP index `P+1` has exactly one zero, `P=28`, the printed **EA rune**. Consequently the exact invariant for *every possible secret multiplier sequence* is

`C[i] = C[i−1]  ⇔  P[i] = EA`.

The original 86 repeat events among 12,901 within-page predecessor positions give **0.6666%**, while the **20 EA among 2,979 authenticated solved-GP runes** give **0.6714%**. This striking marginal agreement motivated the test. It does not alone identify a cipher.

## Key-independent word-position rejection

The actual original word tape has precisely **23** ciphertext repeat events at *the first rune of a complete printed word*, **12** at its *second rune* (zero-based within-word position1), and **21** at its *third rune* (position2). Under the proposed law all those events must instead be native plaintext **EA occurrences at the same positions**. This cannot be repaired by choosing another multiplier, phase, ciphertext-feedback state, clock, or high-entropy external key, provided the printed word boundaries are preserved.

For an independent calibrated language check, sample one **actual authenticated solved-GP word of identical rune length** for each of the 2,896 original printed word slots. A word-length-specific exact Bernoulli distribution gives **52.1961 EA occurrences at the second rune** on average against **12 original repeat events**. The exact Poisson-binomial one-sided probability `Pr(X≤12)` is **1.4680716367×10⁻¹¹**. The original overall EA/repeat marginal agreement therefore conceals a severe mismatch in where the supposed EA symbols would occur. The authentic solved-GP register contains 740 actual runic words; none of the unknown source words is silently replaced during event counting.

Independent English registers transcribed by the project's canonical GP29 Latin convention, with **the same 2,896 exact original word lengths**, provide the following checks:

| Native source register | Expected EA at within-word position1 | Exact `Pr(X≤12)` |
| --- | ---: | ---: |
| Authenticated solved Cicada GP29 | **52.1961** | **1.4681×10⁻¹¹** |
| Gibran, *The Prophet* | **59.8516** | **3.0733×10⁻¹⁴** |
| Emerson, *Essays* | **49.3183** | **1.5049×10⁻¹⁰** |
| Shakespeare source slice | **56.8890** | **3.3611×10⁻¹³** |

These are **conditional donor-register probabilities** under independent same-length word sampling, not probabilities that the creators necessarily wrote English in these exact styles. English may be deliberately non-native and plaintext word segmentation might differ. For the explicit, native-English, word-preserving all-secret model, however, the mismatch is independently discriminating: **an arbitrary hidden multiplier cannot alter a zero difference.**

## Source-selected generator8: full original reversible test

As an operational instance of the same family, choose the multiplier `a[i]=8^(C[i−1]) mod29`, with original GP ordinal as the ciphertext-feedback exponent, no secret state, and the previous original rune carried over page/word breaks. The 28 nonzero multipliers cycle naturally because `8^28≡1 (mod29)`. Its inverse is immediate from the actual ciphertext and the preceding rune, and the negative-exponent counterpart is equally reversible.

Both source-defined original-input directions decrypt and exactly re-encrypt **12,956/12,956** GP29 runes, and both independently encode and recover **95/95 genuine solved p57 PARABLE runes**. The two original decoded full-book IoCs are **0.0352993696922** and **0.0352935548028**, with no sustained GP-native words. Exact inverse/replay proves code correctness; it does not authenticate the operator, as every inverse member shares that property. This tests only the source-root8 predecessor-state instance; it does not exclude an unknown external multiplier stream or all nonlinear algorithms.

## Cryptanalytic fork

**Retire this specific word-preserving fixed-EA zero-difference family for ordinary native-GP plaintext, regardless of the number or complexity of its hidden nonzero multiplier keys.** The 86-versus-20 marginal-frequency match is not plaintext evidence. An improved source-selected design must predict *different exceptional plaintext symbols by word position or state*, genuinely move plaintext word boundaries, or supply identifiable exceptional escape behavior. None may be introduced solely to repair this mismatch without an independent manuscript instruction and an original ciphertext prediction.

The report's [Windows Node22 original-source CommonJS SFT](../sims/lp2_zeroanchor_root8_original_sft.cjs) reconstructs the authentic entire word/rune tape, proves the zero-anchor implication, computes all four exact word-matched language tails, derives and tests the generator8 inverse, and checks solved-p57 cipher plants. It uses the committed original corpus and genuinely solved-GP donor dataset. No novel LP2 unknown-page plaintext or destination is claimed.
