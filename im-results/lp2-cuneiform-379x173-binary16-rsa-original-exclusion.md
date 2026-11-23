# Original cuneiform: 173-word binary RSA framing rejected by GP29 alphabet validity

**Agent 21, 23 November 2026.** Original-input, finite-format negative with a nontrivial source-native synthetic positive. The 56 unknown LP2 pages remain encrypted. This recovers no plaintext, author-prescribed RSA opcode, authentic key or destination. It is distinct from previous fixed-width radix29 three-/four-rune RSA tests.

## Specific possible human solve path

The red ten-rune heading of LP2 p33 has GP-prime sum **379**, and the terminal red triplet on p39 sums to **173**. Both are primes.

- **379 × 173 = 65,567 = 2¹⁶ + 31**. Every unsigned sixteen-bit integer is below the resulting RSA modulus.
- The five numbered cuneiform units contain **139 + 91 + 98 + 96 + 129 = 553** original GP29 runes.
- Encoding each rune index in **five bits** gives **2,765** bits. Three zero padding bits give **exactly 173** sixteen-bit words, matching the red-triplet sum.
- The separate original identity **379 + 173 + 1 = 553**, with numbered rune #379 literal F, has already been documented by Agent36. This receiver retains the F and concatenates all five units.

Those arithmetic equalities hold on the untouched source. Their connection to RSA is retrospective. The manuscript does not explicitly select RSA, bit packing, unit concatenation, or an endian convention. The point of this experiment is to test the *ordinary direct sixteen-bit RSA* receiver suggested by a modulus just beyond 2¹⁶ without inventing cycle-walking.

The original 553 GP indices have SHA256 **f432558b32ef4120d80f330d068d4f211005f4a6dac7780e3eec2d1e7a0f191a**.

## Exact full-exponent result

Set n=379×173=65567 and Carmichael period λ(n)=lcm(378,172)=**32508**. Enumerate all **9,072** exponents e in 1..32507 coprime to 32508. For each, modularly exponentiate the **173 original source blocks**, then demand all three conditions: every result fits into sixteen bits, all **553** reconstructed five-bit tokens are legal original GP29 values **0–28**, and all three trailing pad bits remain zero.

Four frozen, natural serialization conventions were assessed: each GP index's five bits MSB-first or LSB-first, combined with either big-endian or little-endian two-byte order inside each sixteen-bit word. No ciphertext-derived key, offset, permutation, missing rune, or changed clock was fitted.

| Rune bits / word bytes | Exponents with all words fitting 16 bits | Exponents yielding complete legal 553-rune GP29 output and zero padding | Invalid GP tokens with RSA e=65537 |
| --- | ---: | ---: | ---: |
| MSB / big | 8,472 / 9,072 | **1** | 53 |
| MSB / little | 8,428 / 9,072 | **1** | 42 |
| LSB / big | 8,295 / 9,072 | **1** | 42 |
| LSB / little | 8,317 / 9,072 | **1** | 57 |

In **every convention, the only fully legal exponent is e=1**, the unchanged ciphertext identity. Every nonidentity reversible textbook-RSA exponent fails a strict original-format condition, before linguistic plausibility is considered. Standard e=65537 is excluded; in MSB/big-endian, its first illegal rune occurs at index21 and it yields 53 illegal rune tokens.

The source's first three big-endian sixteen-bit blocks are 41113, 27751, 37746. The source-original rune stream remains unchanged and its SHA256 is asserted before computation.

### Independent implementation positive

A synthetic 553-rune GP29 source-shaped register is formed from 173 sixteen-bit words, all zero except word20 equal to **2**. Actual RSA e=65537 transforms that word to **38092**; both full 553-rune five-bit encodings are legal GP29 texts with the required padding. Decryption with RSA inverse d=29825 modulo λ(n) recovers every planted rune, and forward re-encryption reproduces all 173 ciphertext words. This is a nonidentity source-native plant, demonstrating that the exact decoder can succeed when its model holds.

## Decision and scope

The entire bounded **raw binary-five-bit/16-bit RSA** family using the visible red-prime operands is eliminated for the original 553-rune ciphertext. This establishes no author-selected key and does not rule out an independently specified cycle-walking format-preserving code, a different serialization, genuinely independent numbered messages, or another cryptographic algorithm. Without an original instruction specifying one of those alternatives, arbitrary receiver variants have no demonstrated causal path to plaintext.

[Reproducible Windows Node22 original-source CommonJS SFT](../sims/lp2_cuneiform_379x173_rsa16_packed_gp29_original_sft.cjs). **Original Windows run PASS:** [GitHub Actions 45130110111](https://github.com/FlareZ123/liber-primus/actions/runs/45130110111). Context and prior distinct RSA tests: [Agent36's cuneiform red379/F173 report](lp2-cuneiform-red379-F173-prime174-sourcegate.md).
