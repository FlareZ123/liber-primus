# A three-prime RSA interpretation of the 2013 PARABLE product fails original rune packet bounds

**Agent14, 22 November 2026. Classification: bounded original-cipher architecture rejection; no new unknown plaintext, key or final destination.** [Windows/Node22 read-only SFT](../sims/lp2_parable1595277641_rsa7_original_gate_sft.cjs). The source independently supplies an RSA-compatible modulus, but supplies **no instruction to use RSA** or which unknown chapter is its receiver. This report tests the narrow, conventional raw-RSA proposal rather than promoting the hypothesis.

## Source-derived parameters and the attractive packet sizes

A 2013 original `761.MP3` tag has the exact value **`Parable 1,595,277,641`**, which independently anticipates the solved 2014 LP2 p57 PARABLE's three body-sentence GP29-prime sums. Reading the original `lp2-transcription.txt` with the exact 29 GP-prime weights gives sentence lengths **30,30,28** GP runes and sums **1259,1031,1229**, all prime, with

```text
1259 × 1031 × 1229 = 1,595,277,641 = N
φ(N) = 1,591,168,720
29^6 = 594,823,321 < N < 29^7 = 17,249,876,309
```

This is a genuine prepublication numerical link. As an **RSA hypothesis only**, the modulus N would be a 31-bit three-prime RSA modulus. Standard public exponents **3** and **65,537** are both invertible modulo its known φ, with private exponents **1,060,779,147** and **401,379,393** respectively.

The original illustration/13-dot chapter segmentation independently supplies three **whole rune chapters divisible by seven**, precisely **p8–14 = 1729 = 247×7**, **p33–39 = 1680 = 240×7**, and **p54–55 = 308 = 44×7**. Since GP rune symbols are conventionally numbered 0–28, a fixed seven-rune base29 chunk can encode any RSA residue below N (unlike six runes). This suggests an inexpensive first validation of a putative human-supplied RSA operation before searching any exponent, key, or ciphertext score.

## Decisive necessary-condition failures on untouched ciphertext

A canonical RSA ciphertext residue `c = m^e mod N` must always satisfy `0 ≤ c < N`. Reading each original complete chapter as consecutive seven-digit GP29 base29 integers gives:

| Exact original illustrated chapter | Number of seven-rune packets | Printed leading rune is most significant: packets at least N | Opposite within-packet order: packets at least N |
| --- | ---: | ---: | ---: |
| p8–14 trees | 247 | **217** | **221** |
| p33–39 numbered and cuneiform | 240 | **220** | **217** |
| p54–55 terminal floral | 44 | **40** | **40** |

The first seven-rune packet of p8–14 alone is **8,543,004,575**, which exceeds N. By pure range arithmetic, these strings cannot be canonical contiguous raw-RSA ciphertext packets under N, regardless of exponent, private key, or plaintext language. The failures do not depend on any English scoring.

One possible alternative is **six-rune ciphertext and six-rune plaintext**, which avoids the ciphertext bound because all six-rune integers are below N. The complete p33–39 chapter has 280 such original packets without skipping or changing any rune. With the two conventional exponents, exact CRT-compatible RSA decryption yields:

| RSA public exponent | Private exponent derived from the three known primes | Original six-rune p33–39 decryptions outside the six-rune alphabet capacity |
| ---: | ---: | ---: |
| 3 | 1,060,779,147 | **172/280** |
| 65,537 | 401,379,393 | **182/280** |

The decrypted values at these positions are **at least 29^6**, so cannot be represented as exactly six original GP29 rune symbols. This excludes a length-preserving, fixed six-to-six native-GP RSA plaintext for each exponent. Reversing word boundaries, appending sidecar bits, discarding leading/overflow data or reducing a seven-digit ciphertext modulo N could define other schemes, but they require independently sourced serialization instructions. A forced modulo reduction on the seven-rune ciphertext is many-to-one and cannot become a genuine inverse without side information.

The reproducer independently reads the complete original rune corpus and solved p57 source, checks the three prime factors and all packet counts, computes actual RSA inverses, and **plants and exactly recovers 200 five-GP-rune native plaintext blocks**, encrypted as valid seven-digit RSA ciphertext. It verifies the proposed construction would be able to transport true GP-native plaintext under its own stated serialization, providing a positive control separate from the original negative.

## Research decision

The genuine 2013 PARABLE numeric tag can motivate investigating algebraic encipherment of a seven-rune-aligned chapter. Its three prime factors make a readily invertible demonstration RSA modulus. **The unmodified unknown original manuscript violates the necessary fixed-packet range**, and the complete six-rune alternative with the standard e=3/e=65,537 exponents violates plaintext fixed-width capacity. These are exhaustive negatives only for those exact encodings and exponents, with both direct seven-rune digit directions covered.

The next useful evidence would be **a period-authenticated instruction selecting RSA and an explicit reversible variable-width or sidecar grammar**, or a completely different source-defined consumer of the PARABLE product. There is no basis for an exponent sweep, invented padding rule, or laundering overflow into apparent plaintext. The original 2013/p57 product relation remains established independently of this failed RSA interpretation. Cite the [source-audited PARABLE/2014 study](onion7-magic-center-source-prime-gate.md) for the historical relationship.
