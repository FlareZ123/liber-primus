# Original LP2 p36: exact 285-subfield exponent and fully reversible 285th-root gate

**Evidence status (Agent37, 13 November 2026): exact original-input field computation, complete inversion of a conditional exponent model, no plaintext.** [Single-file CommonJS SFT](../sims/lp2_p36_redtriad_285th_root_sft.cjs) ran successfully on the original repository sources in [Actions run 43389656571](https://github.com/FlareZ123/liber-primus/actions/runs/43389656571). The positive plant recovered all 238 original-format GP digits. No unauthenticated substitution or language-fitting parameter was introduced.

## What this adds to the established 2013 / LP2 bridge

The original base60-interpreted physical pp49–51 numeric grid defines a degree-238 irreducible polynomial `Q238` over `GF(29)` after removal of the five already established factors. Let `F=GF(29)[X]/Q238`, `N=29^238−1`. The earlier source-verified result constructed the element `u=(X+1)^(N/840)` of exact multiplicative order 840. It obeys the original red p3 quadratic `u²−3u−8=0`. Therefore a discrete logarithm with respect to `u` is a **finite test of 840 source-defined values**, without a 238-dimensional search.

Let `C` denote the original 238 GP ordinal values on physical page 36 in original rune order, as the coefficients of a field element. Let `B` be the previously proposed 238-digit block formed by reversing the concatenation of p39's first 119 runes and p3's first 119 runes. The exact original subfield projections are:

```
C^(N/840) = u^285
B^(N/840) = u^204
```

The first projected exponent **285=15×19**, numerically the 2013 signed DH23 example's client exponent 15 multiplied by its client public value19. This product is **retrospectively identified**, with a highly important conditioning constraint: prior independent field calculations already established `Norm(C)=2` and that `C` is a fifteenth power. For any value from this source, its projection exponent `k` must satisfy `k=5 (mod28)` and `k=0 (mod15)`. Of the 840 possible exponents, these two constraints leave **exactly k=285 or k=705**. Thus observing 285 has only a **one-of-two** source-conditioned coincidence space, and does **not** authenticate a DH-based encryption algorithm. The independently derived companion projection 204 fails the expected common-base relation: `6×285 − 15×204 = 330 (mod840)`, nonzero.

## A unique full-field candidate inverse, tested on untouched original ciphertext

The exact projection motivates a sharply defined, conditional 285th-power decoder:

```
Find P in F such that:
     P^285 = C
     P^(N/840) = u
```

Because `gcd(285,N)=15` while `gcd(19,N)=1`, precisely fifteen roots of the first equation exist. The nineteenth-power map is a bijection on F×, so the exponent 285=15×19 is a **reparameterization of the previously studied fifteen-root equation**: applying the nineteenth power to each candidate 285th root gives a candidate 15th root. The new computation fixes the independently source-selected subfield projector and checks one following-page consumer; it does not establish a distinct cipher family. The second equation singles out exactly **one** of them. Let `m=N/15`, `d=285^(-1) mod m`, `z=u^56`. Then the selected root is

```
P = C^d z^4
```

because `285d ≡225 (mod840)`, and `225 + 4×56 ≡1 (mod840)`. This operation is exact, reproducible and requires no fitted ciphertext-dependent exponent. It recovers **238/238 GP ordinal coefficients under its conditional forward rule**, and a source-native positive plant `P=(X+1)^841` also recovers exactly after encryption `C=P^285`.

**Original result:** `P` has GP29 IoC **0.03428713257454881** compared with p36 original **0.03598907917597419**. Its first ninety GP transliterated symbols read:

```
YEAGXWILACNNHTHENGTHPHGOEJFAEBBHSIABEASCMIAMTHFNXNEODDEEOYXEAHXMNNGFTXWTAEIJHGEACCYROBTHPEDFHIAEOUAXMBAEOETHMSSL
```

The exact 238-digit base29 coefficient serialization is printed in the successful Actions log and by the SFT; it is reproducible from original inputs rather than an invented plaintext. A fixed direct repeating use of those 238 GP coefficients as additive key material on the next **696 original page-37–39 runes** also fails: original IoC **0.034466220127346396**, C−K **0.03446208550401059**, C+K **0.03422227735053337**. Both readouts are nonlinguistic. This is one unshifted manuscript-order consumer with no fitted phase or secret state.

## Research decision

The unique 285th-root inverse is mathematically real and fully round-trips original GP ciphertext, but its output has no recognizable native GP plaintext. **Retire the literal source-field 285th-power p36 decryptor and its direct periodic following-page key.** The creator never selected this exponent, field embedding, root convention or consumer in authenticated instructions. The exact projected exponent is a useful bounded structural property, while its superficial historical `15×19` match should not be promoted beyond the one-of-two conditional fact.

This report extends the established [p36/p3/table exact-field result](../im-results/p36-grid238-dh11-field-multiplication-gate.md) and independent [p36 15th-power classification](../sims/p36_signed_dh15_power_membership_sft.cjs) without altering any recovered plaintext status in the authoritative [research synthesis](../results/README.md).
