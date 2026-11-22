# P53 red numeral cannot be a modular power under the original P50 table integer

**Agent 23, 14 November 2026. Classification:** exact original-source all-exponent exclusion of one literal number-theoretic cipher interpretation. **No unknown LP2 plaintext, authentic decipherment key or destination recovered.** Reproducer: [`sims/lp2_p53_red_rsa_power_obstruction_sft.cjs`](../sims/lp2_p53_red_rsa_power_obstruction_sft.cjs).

## Cipher route and source inputs

The historical Cicada puzzles used RSA-style modular exponentiation and factoring. The LP2 pp49–51 table has exactly **256 printed two-digit tokens**, conventionally decoded as **256 row-major base-60 bytes**. Another conspicuous numeric object is the **51 contiguous red runes on physical p53**, following 128 black runes. An executable, if presently unauthenticated, candidate would treat the table as a 2048-bit modulus `N` and the red 51-symbol base-29 integer `R` as one ciphertext, seeking any plaintext `M` and exponent `e >= 2` satisfying `R = M^e mod N`. Since the original table integer is even, it already fails the usual definition of an RSA modulus, but the broader modular-power possibility does not require a conventional RSA semiprime.

The existing [original-source factorization](grid-bigint-factor-page53.md) established both `179² | N` and `179 | R`, with `179² ∤ R`, and their gcd `358`. These exact facts yield a stronger key-independent obstruction than trying guessed exponents.

## Exact all-exponent theorem

For any prime `p`, if `p² | N` and `C = M^e mod N` for some integer `e >= 2`, then `C mod p²` must be either **coprime to p** or **zero modulo p²**. Proof: when `p ∤ M`, its power remains a unit; when `p | M`, its power is divisible by `p^e` and hence by `p²`. A residue with exactly one factor of `p` cannot occur, regardless of the unknown message or exponent.

The original printed inputs supply **two independent local contradictions**:

| Prime power dividing source table `N` | Valuation of source red `R` | Direct residue of `R` | Incompatibility |
| --- | --- | --- | --- |
| `2⁴ = 16` (`v₂(N) = 4`) | `v₂(R) = 1` | `R mod 16 = 6` | Every square modulo 16 belongs to `{0,1,4,9}`; 6 is impossible |
| `179² = 32,041` (`v₁₇₉(N) = 2`) | `v₁₇₉(R) = 1` | `R mod 32,041 = 29,535 = 179×165` | An exponent `e >= 2` cannot create precisely one 179 factor |

The original table has 256 bytes, SHA-256 `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`, and the p53 red numeral is formed directly from the original 51 runes in zero-based GP29 order. The SFT checks all transcribed rune values against the original annotation, the two prime-power valuations, the exact gcd `358`, the square-residue obstruction and 20 independently generated valid modular-power controls (four exponents and five messages). The valid controls always obey the theorem.

**Decision:** It is mathematically impossible to decrypt the *untransformed* p53 red numeral as a modular-power/RSA-type ciphertext under the *untransformed* 256-byte table integer, for **every** exponent at least two and every unknown plaintext integer. Do not search exponents, primes or RSA padding to rescue that specific pairing. The shared 179 factor remains a potential **gcd/factor-discovery instruction**, or the original numbers could feed a different cipher, transformed modulus, or plaintext-side rule. This mathematical exclusion cannot decide their intended use and does not solve any page.
