# Signed-2016 prime-dimension pair: direct p32 RSA-packet feasibility

**Classification:** a new source-motivated but conjectural cross-stage RSA interpretation, rejected at an exponent-independent packet-validity gate on original ciphertext. **No unknown Liber Primus plaintext, authentic encryption key, mechanism or continuation is recovered.**

## Independent source facts and reason to test

The authentic 2016 Cicada tree image has original pixel dimensions **563×569**. Both numbers are prime. The previously established 11×11 interpretation of LP2 **physical p32** has exactly **121 original GP29 runes**; the GP prime-weight sum across its first printed row is **563**, and the corresponding first-column sum is **569**. This independent matching of image dimensions to rune-grid axes is documented in [the 2016 original-image source gate](lp2-tree121-signed2016-source-gate.md).

A possible human solver might recognize two primes and test their **RSA product**. Cicada used RSA during earlier rounds, although the signed 2016 clue itself does **not** prescribe RSA, multiplication of the dimensions, an exponent, or a p32 ciphertext-packet format. This candidate has the particularly cheap prerequisite that a fixed-width encrypted-block representation must already be valid *before* any key search:

- Candidate modulus: `n = 563 × 569 = 320347`, with `φ(n) = 562 × 568 = 319216`.
- GP29 as literal radix29 digits: `29³ = 24389 < n < 29⁴ = 707281`. Thus a direct fixed-width ciphertext integer modulo `n` needs four GP29 digits per block.
- Source p32 length: `121 = 1 + 30 × 4`. One natural reading reserves its first rune as a header/initial value and interprets the remaining 120 as 30 complete four-rune ciphertext blocks.

That length equality motivates the packet test, but is not an authenticated instruction.

## Original-ciphertext decision

Read the canonical p32 GP29 **ordinal indices** in their original printed order, preserving all 121 runes. Decode each consecutive four-rune group as an ordinary base29 integer, both most-significant-first and least-significant-first. Check all leading offsets **0, 1, 2, 3, 4**; some have 30 complete blocks and others have 29. A valid direct RSA ciphertext packet must satisfy `0 ≤ block < 320347`, independently of which exponent, private key or padding is subsequently used.

| Leading rune offset | Number of complete blocks | Invalid blocks, forward | Invalid blocks, reversed |
|---:|---:|---:|---:|
| 0 | 30 | 16 | 17 |
| 1 (one header rune) | 30 | **23** | **15** |
| 2 | 29 | 11 | 23 |
| 3 | 29 | 16 | 10 |
| 4 | 29 | 15 | 17 |

**Every declared original format fails the indispensable range condition**, with **at least 10 invalid blocks**. The naturally suggested one-header layout has 23 invalid blocks forward and 15 reversed. There is no need to brute-force exponents, decrypt gibberish, or score English: this direct p32 RSA packet architecture cannot represent the original rune stream without an unspecified extra transformation or new framing.

The range condition itself is an exact exclusion for the stated representation. The historical premise that the image dimensions should be multiplied into an RSA modulus remains a conjecture; the failure does not exclude arbitrary cryptographic uses of the prime pair, variable-width encodings, byte-packed intermediate messages, or other pages.

## Executed independent control

The [CommonJS standalone reproducer](../sims/p32_2016_prime_dimensions_rsa_block_gate.cjs) asserts both original p32 axis sums and the exact original invalid-block table above. Its positive control constructs **30 valid RSA ciphertext packets** from distinct seeded messages using this same modulus, the conventional illustrative exponent `e=65537`, and its derived private exponent `d=160833`. The packet codec produces a 121-rune artifact with a single header rune; all **30/30** ciphertext packets meet the range condition and recover their exact source plaintext integers. The standalone algorithm and positive control were also independently executed in the connected JavaScript runtime on the remote canonical corpus. The exponent is a demonstration parameter and is not attributed to the 2016 signed message.

**Research disposition:** retire only the literal four-GP29-rune RSA block reading. Reopen an RSA use of the dimensional prime pair only if an original source supplies the missing explicit packer/framing or ciphertext-output operation. Existing source-selected p32 grid relations continue to hold; the cipher itself remains unidentified.
