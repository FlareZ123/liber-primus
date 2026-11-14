# Source-derived 4×4 quotient operator from p39, p50 and p15: complete terminal-page inverse

**Agent9, 14 November 2026. Evidence class:** exact original-source matrix arithmetic and a bounded, fully reversible original-cipher negative. **No unknown LP2 plaintext, authentic key or final destination recovered.**

## Distinct source-to-operator construction

A previous exact three-artifact relation used the original **p15 signed** Fibonacci-prime 4×4 matrix `M`, the **p39 red** factor `G(X)=(X−24)²` over GF29 and the unchanged 256-byte **pp49–51 printed table** polynomial `P(X)`. That work calculated `P(M)=G(M)(12M+15I)` and found `P(M)` **rank two**, so it cannot be a direct reversible four-rune Hill cipher. The crucial ambiguity is that `G(M)` is singular. The equality does **not** imply that the independently defined full polynomial quotient `R(X)=P(X)/G(X)` satisfies `R(M)=12M+15I`.

The original table is *exactly divisible* by `G`, without a remainder. An explicit new candidate avoids the singular projection: **divide the complete 256 original printed table bytes by the source p39 factor, retaining all 254 high-first quotient coefficient slots, then evaluate that quotient at the signed p15 matrix**.

Exactly as identified in the earlier Fibonacci rule, the signed matrix (with two inferred negative Fibonacci differences at printed cells 12 and 13) is

```text
M = 10  3 20 22
     1 22 21 25
    11 17 19  7
     8 12 12 22
```

The leading table coefficient is 203≡0 (mod29), so `P` has formal length256 and actual degree254; the monic factor `G=[1,10,25]` yields a **254-slot quotient with a leading zero**, and a zero remainder. Evaluating all original quotient coefficients with Horner arithmetic over GF29 gives a **full-rank**, source-only operator:

```text
R(M)             R(M)^(-1)
21 27 22  0      10 15 11 26
28 10 13 22      28 16 11  9
12  0  9 13      26 28  5  5
12 24  7  3       4 27 11  6
```

Both products `R(M)·R(M)^(-1)` and `R(M)^(-1)·R(M)` are exactly `I4`. The full original polynomial identity `P(M)=G(M)R(M)` is exact. As an important contrast to previous work, **`R(M)` differs from `12M+15I`**. Prior rank-two analysis of `P(M)` alone cannot identify this full-rank quotient map.

## A concrete original p55 19-block test

The original **physical p55 contains exactly 76 GP29 runes**, equivalent to 19 complete 4-rune blocks. This makes p55 one possible literal consumer of the independent 4×4 operator, especially because it lies after the numeric table. The hypothesis is still **not source-authenticated**: the manuscript does not instruct the reader to divide the table polynomial, evaluate it on p15's restored-sign matrix, or apply a Hill cipher to p55. A separate distinct terminal control is physical **p54's 232 runes**, likewise divisible into 58 complete blocks. No phase, padding, alternate rune alphabet, key, offset or page reorder was fitted.

At each original four-rune block in printed order, apply either `R(M)` or its inverse as the proposed decipherment map, and reapply the inverse to reconstruct the entire unchanged original ciphertext.

| Original original-cipher page | Runes/blocks | Original GP IoC | Apply R(M): GP IoC | Apply inverse: GP IoC |
| --- | --- | --- | --- | --- |
| p54, including its 9-red heading | 232/58 | **0.0331392745** | **0.0354903717** | **0.0349305867** |
| p55 | 76/19 | **0.0378947368** | **0.0308771930** | **0.0347368421** |

P55's complete candidate inverse transliterated into original GP letter names is:

`IJEAPCAOHWUEJPDAESMNCTNGEHLIAPWWEAOREAEEANGWNGRYOXEAYEOXOEBREWMOEOUIAIAXNGEOPWOEOEUEASXTLAENGIAHRAE`

This is not readable GP-language prose. The matrix direction gives an equally nonlinguistic output, and the separate p54 controls are similarly near uniform. (The listed transliteration is a symbol-for-symbol concatenation; digraphs such as IA, EA and NG can increase its Latin-character length beyond the original 76 runes.)

Every output is **exactly inverted and re-encrypted back to the entire source page** in both directions. An independent **source-native planted text** made of the solved p57 GP runes, repeated to each page's exact length, was encrypted and decoded with the unchanged `R(M)`, recovering **76/76 and 232/232** original planted GP runes; each plant also round-trips by re-encryption. A wrong-sign *unsigned* p15 original matrix produces a different operator. These are legitimate implementation and source-selection controls, not evidence that the actual unknown is a Hill cipher.

**Passing reproducible [single-file Node22 SFT](../sims/lp2_p50_p39_signedp15_quotient_matrix_p55_sft.cjs)** and [GitHub Actions 43565067944](https://github.com/FlareZ123/liber-primus/actions/runs/43565067944), dispatched through the [manual-only Agent9 test workflow](../.github/workflows/agent9-two-plain-feedback-manual.yml). All table input bytes are hash-checked against SHA-256 `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`; long division, source quotient, both matrix identities, full original input and planted recovery are asserted.

## Decision

**Source-derived full-rank `R(M)` is a new algebraic object; its direct Hill4 plaintext interpretation fails on both complete original terminal pages.** Preserve the full-quotient/singular-matrix distinction. Do not turn the negative into a permission to search all matrix powers, block phases or new alphabets. This hypothesis could only be revived by a new original creator-visible instruction selecting another output register, feedback clock or consumer; present evidence specifies none.
