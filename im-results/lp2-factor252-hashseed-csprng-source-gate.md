# Factor-selected p50 quotient as a direct AES/ChaCha key seed

**Agent37, 14 November 2026. Status: completed source-derived-key decryption attempt, conditional negative.** This test has an actual complete inverse on two untouched original LP2 pages. It did **not** recover a previously unknown plaintext passage, authentic seed, cipher rule or destination.

## Why this key exists without fitting to plaintext

The authentic 256-cell numerical table printed across original physical LP2 pp49–51 has a conditional conventional base60 byte interpretation, with byte SHA-256 \`3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290\`. Its original forward row-major byte polynomial reduced modulo29 is exactly divisible by the two independently identified source quadratics:

- \`H(x) = 3 + 26x + 24x²\`, the canonical coefficients of genuine 2013 \`BASE29 3301 = 3QO\`;
- \`G(x) = 27 + 5x + 15x²\`, the unique red triple printed at physical p39 offset119.

The product is \`H(x)G(x) = 23 + 21x + 11x² + 17x³ + 12x⁴\`. Divide the complete table polynomial by it **exactly over GF29**, retaining the leading zero quotient coordinate. The result contains **252 high-to-low quotient coefficients** with first eight \`[0,12,9,28,2,25,23,21]\`. These values follow from original artifacts and standard field division without searching a key.

The proposed missing consumer is a **hypothesis**: serialize those 252 original-field coefficients as literal bytes \`0..28\`, compute SHA-256 to obtain an AES/ChaCha 256-bit key, then use the standard cipher's zero-counter/zero-nonce stream. The raw digest is **\`dd70d1b1a82c9c52ed32d727ef986548e7cad808844452bc8c18648bec0e4535\`**. An original Cicada instruction identifies neither SHA-256-on-quotient nor AES/ChaCha, a zero IV, GP29 subtraction, or the receiving pages. The novel finite test is meaningful because these are complete and low-complexity consumers of a source-derived quotient, rather than another fitted secret.

## Frozen original-cipher inverses

Use the unmodified **76 GP29 original p55 runes** at their exact page-local offsets and independently the unmodified **262 original p0 runes**. Derive the keystream through either \`AES-256-CTR(key, IV=0^128)\` or \`ChaCha20(key, counter=0, nonce=0)\`. Clock one keystream byte per original rune from page offset zero, without a word reset or F/zero-step skip, project \`K_i = byte_i mod29\`, and decode \`P_i=(C_i ± K_i) mod29\`.

| Standard source-quotient consumer | Sign | Original p55 IoC (76 runes) | Original p0 IoC (262 runes) |
| --- | ---: | ---: | ---: |
| AES-256-CTR | subtract | **0.03543860** | **0.03538943** |
| AES-256-CTR | add | **0.03543860** | **0.03310813** |
| ChaCha20 | subtract | **0.03543860** | **0.03348834** |
| ChaCha20 | add | **0.04175439** | **0.03392706** |

The coincidence index baseline of uniform GP29 is \`1/29≈0.034483\`; for 76 runes finite fluctuation is wide. No eight candidate outputs contains a complete natural-language passage or independently recognizable continuation. The p55 AES-subtract output begins \`AECAENGHHFFHAETWAEBEIEAUOAEOYSYEAULXEAAERPATH...\`. The apparently higher 0.04175 short-p55 case yields incoherent \`IHSCASTHYEAYINGRSBHNGEARAENCEONGDDALGES...\`. Every candidate remains an unverified mathematical inverse, **not recovered plaintext**.

All 8 original decryption outputs are re-encrypted to exactly their original ciphertext. For each of four cipher/sign combinations, the **95 genuine solved p57 GP29 plaintext runes** are encrypted with the same literal source key and then recovered 95/95, establishing the complete mechanism and byte clock without inventing a prose plant. These checks validate the implementation and its ability to recover text under the assumed cipher; they do not authenticate the assumed source key.

## Decision and continuation

The original H/G factors and 252-symbol quotient remain mathematically exact. **This single fixed SHA256(raw quotient) → zero-IV AES/ChaCha → GP29 additive family fails to decrypt either original p55 or p0.** It does not exclude an authored quotient-to-key conversion, a physically selected 252-cell framing, nonadditive encipherment, byte-based binary payloads or source-chosen state. The objective still requires a historically supported operation that produces a complete readable unknown passage, with consistent original ciphertext re-encryption.

**Execution:** [Windows Node.js 22 single-file reproducer](../sims/lp2_factor252_hashseed_csprng_original_sft.cjs); [successful original-source run 43579092247](https://github.com/FlareZ123/liber-primus/actions/runs/43579092247). The SFT asserts exact source-grid SHA256 and polynomial division, the derived quotient digest, eight original-cipher IoCs, and eight original/95-rune positive round trips. It uses built-in \`node:crypto\` only.
