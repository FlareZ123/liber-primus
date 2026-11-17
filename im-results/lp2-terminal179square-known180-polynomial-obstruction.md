# Direct 179² residue-ring polynomial cannot encode the terminal 180 solved runes

**Agent4, 17 November 2026. Original-known-plaintext algebraic obstruction, across every polynomial degree.** No LP2 unknown plaintext, authentic key, cipher, or Cicada destination has been recovered. This rules out a motivated *specific direct coding family*, not polynomial cryptography generally.

## Causal source input

The original physical p49–51 table contains **32×8 = 256** two-character numerals. Its independently fixed base60 row-major byte reading is the complete 256-byte reference with SHA-256 \`3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290\`. Viewed as one big-endian 2,048-bit integer, that number is **exactly divisible by 179²**; the original physical p53 has exactly **179 GP29 runes**. These independent artifacts motivated earlier table-factor and terminal-arithmetic proposals ([source-number synthesis](grid-bigint-factor-page53.md), [terminal-256 GCD report](lp2-terminal256-solved56-table-gcd-bridge.md)).

The last three text pages supply exactly **p55 ciphertext 76 + authentically solved p56 85 + originally clear p57 95 = 256** GP runes. The table's outer ring contains 76 cells and its remaining interior 180, motivating a candidate decoder which predicts the first 76 symbols from a polynomial determined by the latter **180 known** symbols.

The **unsupported bridge** is explicit: neither the table nor the signed puzzle instructs a user to form an integer-coefficient polynomial over \`Z/(179²)\`, use table bytes as evaluation arguments, or interpret every terminal GP glyph as the corresponding 0–28 residue. The 179² factor does not by itself determine such an operation, so this is a bounded hypothesis gate rather than proof of authorial method.

## Algebraically complete discriminant

For **every** integer-coefficient polynomial \`f\`, at **every degree and with every possible secret coefficient**, the congruence

\`x ≡ y (mod 179)  =>  f(x) ≡ f(y) (mod 179)\`

holds. Because the canonical Gematria Primus indices **0–28** are distinct modulo179, a direct decoded GP rune at any two source coordinates congruent modulo179 must be **identical**. The same obstruction applies to the other canonical source-native map of the GP29 runes to their distinct prime weights **2–109**, also all below179. It is invariant to a global invertible affine permutation of the input coordinates modulo179² and does not require guessing polynomial degree or fitting coefficients.

There is a particularly short original-source certificate under the **simple terminal chronological register**: the first **76** terminals are unknown p55; the remaining chronological positions are **76…255** and constitute complete authentic p56 plaintext and p57 cleartext. Positions \`76\` and \`255\` differ by **179**. Yet the genuine decoded first p56 rune is **A = GP24**, whereas the final clear p57 rune is **E = GP18**. Therefore **no integer polynomial of any degree** over \`Z/(179²)\`, evaluated at these chronological positions and read as native GP29 indices/primes, can generate those **180 established terminal symbols**, before attempting any p55 plaintext.

The p56 plaintext is recovered from the unchanged actual 85-runic ciphertext by consecutive-prime-totient subtraction starting at prime2, with **only the literal F at p56 local offset56** bypassing the key and not advancing the clock. The result begins \`ANEND\`. The final p57 E is directly printed, not hypothesized. These 180 values form a genuine, independent known-plaintext holdout.

## Additional table-coordinate receivers on the same known symbols

A polynomial evaluated at original source *byte values* has a stronger necessary condition: any two table cells whose bytes share the **same residue modulo179** must yield the same GP29 rune. Unlike consecutive index positions, the byte inputs have many repeated residues. Four explicitly fixed, source-natural readings of the known 180 runes yield:

| Candidate polynomial input coordinate \`x\` | Known coordinate residues reused | Source disagreements |
| --- | ---: | ---: |
| Consecutive terminal position \`x=76…255\` | 1 | **1** (A at 76 versus E at 255) |
| Byte values of printed table positions76…255 | 75 | **72** |
| Byte values of **180 inner cells** in printed row-major order, excluding the original 76-cell perimeter | 77 | **70** |
| Same 180 inner bytes in fixed upper-left clockwise **concentric-shell order** | 77 | **74** |

“Residues reused” counts every known sample after the first with a previous coordinate value modulo179. “Disagreements” counts those samples for which its GP rune differs from the first known GP rune of that residue class. A single disagreement is a decisive contradiction for the stated polynomial model, regardless of its degree or coefficients. Example under the table's ring-interior row-major reading: two consecutive known symbols **D (GP23) and W (GP7)** at inner-register offsets **4,5** correspond to source byte arguments **4 and 183 = 4+179**. They cannot both be \`f(x)\` under the ring-polynomial hypothesis.

The original-source [read-only Node.js22 SFT](../sims/lp2_terminal179square_known180_polynomial_gate_sft.cjs) verifies the complete base60 byte digest; asserts all page lengths and the exact solved p56 A/N/E/N/D prefix; computes source corners, all 256 spiral positions, residue collisions, and original contradiction counts. A nonconstant quadratic polynomial with actual coefficients is planted on the same source coordinates and passes **every** required congruence pair, confirming that the diagnostic is a valid necessary condition for a correctly constructed polynomial code.

## Decision

**Reject a direct native-GP29 terminal-code polynomial over the actual residue ring modulo179²**, under all four above source-readable register conventions. The rejection is **all secret coefficients and all polynomial degrees**, and relies solely on genuinely known p56/p57 runes; none of p55's 76 missing plaintext values are guessed or fitted.

The result says nothing about an **extension field GF(179²)** (not the same mathematical object), nonlinear table-to-symbol mapping, unknown GP symbol embedding that deliberately collapses different letters modulo179, encryption of an intermediate non-GP message, or a separately chosen positional permutation. The four-prime 2013 PARABLE sum, original table and terminal geometry remain meaningful possible key sources, but their next use needs a *first-party selected operation*. Avoid repeating polynomial-degree or coefficient searches under this now-impossible direct ring register. No update to the authoritative list of solved LP2 pages is justified.
