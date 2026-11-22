# 179² terminal polynomial: impossible residue-ring code and failed extension-field recovery

**Agent4, 17 November 2026. Two original-known-plaintext 179² polynomial decisions: an all-degree residue-ring obstruction and a fully specified extension-field inverse.** No LP2 unknown plaintext, authentic key, cipher, or Cicada destination has been recovered. These tests reject two fixed, source-motivated direct coding families. They do not exclude polynomial cryptography under an independently selected cipher format.

## Causal source input

The original physical p49–51 table contains **32×8 = 256** two-character numerals. Its independently fixed base60 row-major byte reading is the complete 256-byte reference with SHA-256 \`3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290\`. Viewed as one big-endian 2,048-bit integer, that number is **exactly divisible by 179²**; the original physical p53 has exactly **179 GP29 runes**. These independent artifacts motivated earlier table-factor and terminal-arithmetic proposals ([source-number synthesis](grid-bigint-factor-page53.md), [terminal-256 GCD report](lp2-terminal256-solved56-table-gcd-bridge.md)).

The last three text pages supply exactly **p55 ciphertext 76 + authentically solved p56 85 + originally clear p57 95 = 256** GP runes. The table's outer ring contains 76 cells and its remaining interior 180, motivating a candidate decoder which predicts the first 76 symbols from a polynomial determined by the latter **180 known** symbols.

The **unsupported bridge** is explicit: neither the table nor the signed puzzle instructs a user to form an integer-coefficient polynomial over \`Z/(179²)\`, use table bytes as evaluation arguments, or interpret every terminal GP glyph as the corresponding 0–28 residue. The 179² factor does not by itself determine a ring or extension-field operation, so these are bounded, competing hypotheses rather than evidence that the author chose one.

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

The original-source [read-only Node.js22 SFT](../sims/lp2_terminal179square_known180_polynomial_gate_sft.cjs) verifies the complete base60 byte digest; asserts all page lengths and the exact solved p56 A/N/E/N/D prefix; computes source corners, all 256 spiral positions, residue collisions, and original contradiction counts. The original-source SFT **passed Windows Node.js 22** in [manual CI run 44151262670](https://github.com/FlareZ123/liber-primus/actions/runs/44151262670). A nonconstant quadratic polynomial with actual coefficients is planted on the same source coordinates and passes **every** required congruence pair, confirming that the diagnostic is a valid necessary condition for a correctly constructed polynomial code.

## Alternative GF(179²): a complete 180-known-to-76-unknown prediction

The residue ring \`Z/(179²)\` above is **not** the finite field **GF(179²)**. A different natural reading treats the independently known **180** terminal runes as evaluations of a unique **degree-at-most-179** polynomial in a quadratic extension field; that polynomial would directly predict all **76 withheld p55 symbols**. This version permits a much richer output than the residue-ring model, and its ciphertext prediction can be tested without accessing any unknown p55 plaintext.

Freeze the standard minimal extension \`GF(179²)=GF(179)[α]/(α²−2)\`. The scalar **2 is a quadratic nonresidue** modulo179, verified by \`2^89≡−1 (mod179)\`. Embed each of the original 256 terminal positions \`i=0…255\` as \`x_i=(i mod179)+floor(i/179)·α\`. These are **256 distinct field elements**, preserving the source's printed chronological order and the p55/p56/p57 76/85/95 split. Map each authentically solved p56/p57 GP rune to its **canonical ordinal 0…28** inside the base field, retaining the known p56 F non-consuming exception.

Compute the **unique field polynomial of degree at most 179** interpolating all 180 known points \`(x_76,…,x_255)\`. Exact barycentric field arithmetic, with no fitted degree, key, phase, reset, alphabet, or unknown p55 rune, predicts each \`f(x_0)…f(x_75)\`.

| Exact independent receiver result | Outcome |
| --- | ---: |
| Known solved source GP29 values | **180/180**, the complete actual p56+p57 |
| Predicted p55 outputs belonging to base field \`GF(179)\` | **0/76** |
| Predicted p55 outputs in valid native GP29 range \`0…28\` | **0/76** |
| Predicted p55 first field element | **6+18α** (numeric representation 3,228), invalid GP |
| First ten output integers in fixed base179 encoding | \`3228,21418,3984,16546,25509,10563,1369,15112,21120,24764\` |

The model deterministically produces **76/76 invalid direct GP rune values** from established known plaintext. Because the 180 known evaluations always define one such degree≤179 polynomial, this test does not falsely claim that interpolation of the known 180 is an independently verified cipher. The decisive observation is its **failed original p55 emission**. A separate degree-at-most-178 holdout fits only the first **179** truly known GP runes and predicts the final clear p57 rune as **140+112α**, while the original final rune is **E=GP18**. It therefore independently contradicts that lower-degree original-code variant without using the last known value as a fit.

The [standalone exact GF(179²) CJS SFT](../sims/lp2_terminal179square_extensionfield_interpolation_sft.cjs) checks the irreducible quadratic, enumerates all 256 original coordinate embeddings, verifies the known 180-rune p56/F/p57 registers, and computes the 76 predictions. It separately plants an actual **nonconstant degree-nine field polynomial** in all 180 known positions and recovers the withheld 76/76 field outputs, plus a **native-GP-valued constant polynomial** whose entire withheld 76-rune output is also recovered exactly. The full original and both positive controls **passed Windows Node.js22** in [manual run 44151963599](https://github.com/FlareZ123/liber-primus/actions/runs/44151963599).

This excludes **the exactly stated field, coordinate embedding, degree≤179 and native-GP direct output**. It cannot exclude a different extension polynomial, another injective coordinate map, an unspecified higher-degree polynomial with extra free data, or a separately authorized reduction of field elements to 29 runes. Such changes need first-party selection rather than post-hoc rescue.

## Decision

**Retire these two specific 179² original-terminal-code mechanisms**:

- Every native-GP29 polynomial over **Z/(179²)** under the four source-readable coordinate layouts is impossible at **all coefficient choices and degrees**, contradicted solely by genuinely known p56/p57 symbols.
- The uniquely interpolated **degree≤179 GF(179²) polynomial** with the source-position base179 coordinate embedding recovers **0/76** valid original GP29 symbols, and its smaller degree≤178 variant fails the independently withheld final clear p57 E.

The two failures rule out those precise, natural 179² decoders without guessing a single unknown rune. They leave nonlinear table-to-symbol mappings, separately selected key material, original-source permutations, other GP symbol embeddings, and unrelated mathematical fields untested. The p50 numeric factor and terminal 76/180 geometry remain genuine source facts without an authenticated map to plaintext. Do not attempt degree or coefficient rescue searches within these contradicted registers. No update to the authoritative solved-page synthesis is justified.
