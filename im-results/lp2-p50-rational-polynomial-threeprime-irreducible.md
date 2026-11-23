# Original 256-byte table polynomial is irreducible over the rationals

**Agent 6, 23 November 2026. Proven exact original-artifact result; bounded decision, not recovered plaintext.** This answers a previously open algebraic question: can the complete source table's remarkable factors over GF(29) be lifted to an ordinary integer polynomial factorization, thereby yielding an easy integer factorization or short standalone plaintext-bearing constituent? **No.** A three-prime modular-degree certificate proves the complete original integer coefficient polynomial is irreducible over Q.

## Original input and why this test matters

The original physical pp49–51 grid is 256 two-character base60 tokens decoded to bytes `b[0..255]` in source order. Its authoritative byte SHA-256 is `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`, and its first/last bytes are **203** and **80**. Define the *actual integer-coefficient polynomial*, without reducing its leading coefficient:

`P_Z(X)=203 X^255+231 X^254+...+189 X+80`.

The complete original coefficient gcd is **one**, so `P_Z` is primitive of degree **255**. Earlier work showed its **reduction modulo 29** drops degree because 203 is divisible by 29 and contains the remarkable (indeed independently source-selected) GF29 factors `(X-24)^2`, the signed-2013 BASE29 quadratic, and irreducibles of degrees 3, 9 and 238. This valid finite-field factorization does not imply a factorization over the integers.

An authentic integer factorization `P_Z=A·B` would give the literal whole-table integer `P_Z(256)=A(256)B(256)`, allowing prospective factor-based recovery of the unusual 2048-bit source. The distinct full-number small factors of `P_Z(256)`, including 179², are **integer-value** factors and need not be factors of the **polynomial** itself. This certificate distinguishes the two algebraic questions decisively.

## Three independent modular factorizations

For any prime `p` not dividing the leading coefficient203, the reduction of a hypothetical integer factor has the **same degree**. Gauss's lemma ensures a factorization of the primitive `P_Z` over Q would have an integer factor. Its reduced factor degree must be a **nonzero proper subset sum** of the complete multiset of irreducible GFp factor degrees, for *every* such prime.

The original full 256-term polynomial factors as follows, all factors independently reconstructed exactly in the accompanying SFT:

| Prime `p` | Complete irreducible-degree multiset of `P_Z mod p` | Possible factor degrees after intersecting all primes so far |
|---|---|---|
| **11** | `[1,1,10,14,229]` | `[0,1,2,10,11,12,14,15,16,24,25,26,229,230,231,239,240,241,243,244,245,253,254,255]` |
| **17** | `[1,3,3,17,24,207]` | `[0,1,24,25,230,231,254,255]` |
| **19** | `[2,2,7,11,19,26,188]` | **`[0,255]`** |

The `p=11,17,19` leading coefficients are `5,16,13`; none is zero. Each list sums to 255. The pairwise intersection of degree candidates still permits nontrivial degrees, but **all three** primes simultaneously permit only 0 or255. A nontrivial factor would require a degree between1 and254, contradicting this exact original-source certificate. Consequently **`P_Z(X)` is irreducible over Q**.

The verifier performs the complete finite-field factorization with SymPy, validates every reported degree and each factor's irreducibility, multiplies all modular factors and their multiplicities back to the **exact original source polynomial**, and intersects every subset-degree set. It also constructs a **positive reducible degree255 synthetic polynomial**, `(X+1)(X^254+2X+1)`, whose possible-degree intersection retains both proper factor sizes1 and254. The same discriminator therefore does not simply label every source polynomial irreducible.

## Cryptanalytic decision

This is an **all-integer-polynomial-factor exclusion**, stronger than a failed attempted quotient or guessed key. Neither GF29 H/G factor, the cubic, nonic, nor their products can be interpreted as genuine factors in `Z[X]` of the unmodified 256-source-byte polynomial. In particular, **factoring the original 2048-bit integer via evaluating two integer polynomial constituents is impossible** because the polynomial has none.

The GF29 factors remain genuine and may still encode a creator-selected *finite-field* constraint, checksum, algebraic state, or ciphertext relation. The complete integer `P_Z(256)` is separately composite with known small factors; polynomial irreducibility cannot establish integer primality or block numerical factoring by other algorithms. The table itself supplies no instruction to factor it over Q or decode its GF29 quotients. No original unknown-page plaintext, authentication key or next destination follows.

**Reproduce:** [read-only original-source Python SymPy 1.14 SFT](../sims/lp2_p50_rational_irreducible_threeprimes_sft.py) and [Windows Python workflow](../.github/workflows/agent6-p50-rational-poly-certificate.yml). The SFT fixes the original byte hash, primitive content, all complete modular degree lists, arithmetic factor replay, minimal three-prime intersection, and synthetic reducible control. No arbitrary factor or English fitness score is fitted.
