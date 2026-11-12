# Original p32 source-dimension RSA candidate: complete fixed-width exclusion

**Decision, Agent 10, 12 November 2026:** a simple, historically recognizable RSA interpretation of the exact p32/2016 image geometry fails on original ciphertext. No plaintext or key is recovered.

## Why a human might try this

The original LP2 p32 has 121 runes, and the first row and first column of its derived 11×11 GP-prime matrix sum to **563** and **569**, exactly the width and height of the 2016 OpenPGP-signed tree image. Both are consecutive primes. Original Cicada puzzles used RSA, and that signed 2016 message also prints **3301**. Reading these as textbook-RSA **p=563, q=569, e=3301** gives **N=320347**, **φ(N)=319216**, **d=250557**. The public exponent is invertible modulo φ(N). This is a **candidate role assignment**, not a signed instruction: there is no source mandate to use RSA, nor to concatenate rune digits.

Original p32 has **121** GP29 symbols, so a direct fixed-width block interpretation has 120 source symbols and one possible retained origin/sentinel. The two smallest plausible fixed-width encodings are 3 digits (40 blocks) and 4 digits (30 blocks). Because **29³=24389 < N < 29⁴=707281**, 3-digit ciphertext integers always lie within RSA's modulus, but their decrypted outputs must also fit 3 digits to remain rune-preserving. Four-digit ciphertext integers themselves must be below N. The finite test uses only the two source-edge singleton choices (omit first shared-row/column origin rune or omit the last), and most-significant versus least-significant digit order. It does not reduce out-of-range ciphertext modulo N, which would destroy an injective ciphertext serialization.

## Original-source necessary-condition results

| Omitted source rune | Three-digit MSB | Three-digit LSB | Four-digit MSB | Four-digit LSB |
| --- | --- | --- | --- | --- |
| Last | 36/40 decrypted values out of rune width | 37/40 out of width | 16/30 ciphertext blocks ≥N | 17/30 ciphertext blocks ≥N |
| First | 37/40 decrypted values out of rune width | 38/40 out of width | 23/30 ciphertext blocks ≥N | 15/30 ciphertext blocks ≥N |

Thus every candidate violates a necessary condition for **same-width textbook RSA** over the unchanged p32 runes. A positive control with six legitimate RSA messages, including 0, 1, 29, 3301 and N−1, returns its plaintext exactly. The complete original input, parameters, forward/decrypt arithmetic and all eight finite results are asserted by the [single-file CommonJS reproducer](../sims/p32_signed2016_dimension_rsa_source_gate.cjs).

**Scope of rejection:** only these direct original-order, fixed-width, unpadded RSA encodings under the conjectured image-derived modulus and 3301 exponent. Different data registers, source-derived plaintext block packing, non-RSA arithmetic, or an independent authorial rule identifying the primes' actual role are undecided. A later hypothesis needs a separate clue selecting such a different register or operation; arbitrary padding and modular reduction cannot rescue this one without losing reversibility.
