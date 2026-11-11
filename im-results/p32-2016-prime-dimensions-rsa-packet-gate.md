# Signed-2016 prime-dimension pair: new numeric-table RSA packet gate

**Classification:** one additional exact source-ciphertext representation exclusion for the original 256-byte table; the p32 four-rune gate below is a recheck of **established prior work**, not a novel discovery. No unknown LP2 plaintext, authentic cipher key, mechanism or continuation is recovered.

**Prior-art correction:** [The original signed-2016 tree-source study](lp2-tree121-signed2016-source-gate.md#source-prime-rsa-modulus-four-rune-original-cipher-capacity-gate) had already identified `563×569` as a candidate RSA modulus, rejected every direct four-GP-rune whole-book orientation, and independently checked a planted RSA positive. Its later redundant-quotient RSA 3→4 lift also failed original plaintext capacity. The p32-only subset documented below agrees with that earlier result. **The distinct contribution here is the new fixed three-byte/256-table ↔ 85-rune p56 length gate**, which uses different original bytes and a source-native positive control. Do not treat this report as reopening the closed GP29 3→4 RSA family.

## Independent source facts and reason to test

The authentic 2016 Cicada tree image has original pixel dimensions **563×569**. Both numbers are prime. The previously established 11×11 interpretation of LP2 **physical p32** has exactly **121 original GP29 runes**; the GP prime-weight sum across its first printed row is **563**, and the corresponding first-column sum is **569**. This independent matching of image dimensions to rune-grid axes is documented in [the 2016 original-image source gate](lp2-tree121-signed2016-source-gate.md).

Earlier investigators already recognized the two-prime RSA product, backed by Cicada's historical RSA usage and a 2012 dimension-product clue. The 2016 message itself still supplies no RSA exponent or packet grammar. The p32-only counts are included for consistency with the first source link; the substantive new decision concerns the table. This candidate has the particularly cheap prerequisite that a fixed-width encrypted-block representation must already be valid *before* any key search:

- Candidate modulus: `n = 563 × 569 = 320347`, with `φ(n) = 562 × 568 = 319216`.
- GP29 as literal radix29 digits: `29³ = 24389 < n < 29⁴ = 707281`. Thus a direct fixed-width ciphertext integer modulo `n` needs four GP29 digits per block.
- Source p32 length: `121 = 1 + 30 × 4`. One natural reading reserves its first rune as a header/initial value and interprets the remaining 120 as 30 complete four-rune ciphertext blocks.

That length equality motivates the packet test, but is not an authenticated instruction.

## Previously established p32 RSA packet obstruction, independently reconfirmed

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

## New cross-page test: 256 numeric-table bytes against 85 solved runes

The authentic p49–51 table contains exactly **256 printed two-digit base60 cells**, giving 256 interpreted bytes in source order. The separately solved physical p56 contains exactly **85 GP runes**, and **256 = 1 + 85×3**. Under the same speculative prime-pair modulus `320347`, three bytes suffice to represent any RSA residue. Thus a one-byte header plus 85 three-byte ciphertext integers is another exact length-matching, source-visible packet hypothesis. This does not require guessing an RSA exponent.

The original table bytes were read row-major and column-major, with three possible starting offsets (0, 1, 2) and both byte significances, totaling **12 fixed formats**. Each packed integer must be strictly less than `320347`.

| Table byte order | Offset | Packets | Invalid big-endian | Invalid little-endian |
|---|---:|---:|---:|---:|
| Printed row-major | 0 | 85 | 84 | 85 |
| Printed row-major | 1 | 85 | 83 | 84 |
| Printed row-major | 2 | 84 | 84 | 83 |
| Column-major | 0 | 85 | 84 | 84 |
| Column-major | 1 | 85 | 85 | 84 |
| Column-major | 2 | 84 | 82 | 84 |

Every candidate contains **82–85 invalid ciphertext integers**. The strongest length coincidence, the one-header/85-packet row-major reading, fails **83/85 or 84/85** required range checks. A direct RSA encryption or decryption of this byte stream with modulus `563×569` is therefore impossible under these fixed formats. The historical ambiguity between base60 and base59 remains separate; the table results here are conditional on the existing explicitly interpreted base60 bytes.

A separate positive control packs 85 known source integers into valid RSA ciphertext using `e=65537`, emits exactly `1+85×3=256` bytes and recovers all **85/85** after stripping the header. This confirms the positive-format gate is actually reachable.

## Executed independent control

The [CommonJS standalone reproducer](../sims/p32_2016_prime_dimensions_rsa_block_gate.cjs) asserts both original p32 axis sums and the exact original invalid-block tables for both original inputs. Its positive control constructs **30 valid RSA ciphertext packets** from distinct seeded messages using this same modulus, the conventional illustrative exponent `e=65537`, and its derived private exponent `d=160833`. The packet codec produces a 121-rune artifact with a single header rune; all **30/30** ciphertext packets meet the range condition and recover their exact source plaintext integers. The standalone algorithm and positive control were also independently executed in the connected JavaScript runtime on the remote canonical corpus. The exponent is a demonstration parameter and is not attributed to the 2016 signed message.

**Research disposition:** preserve the previously closed four-GP29-rune RSA exclusion, and now retire the distinct literal three-byte table RSA block reading. Reopen an RSA use of the dimensional prime pair only if an original source supplies the missing explicit packer/framing or ciphertext-output operation. Existing source-selected p32 grid relations continue to hold; the cipher itself remains unidentified.
