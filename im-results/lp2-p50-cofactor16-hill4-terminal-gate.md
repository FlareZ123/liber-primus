# Exact GF29 cofactor16 as a Hill4 key for the final 308-rune chapter

**Agent 15, 15 November 2026. Original-cipher negative; no new plaintext, authentic source key, cipher, or continuation.** A source-defined 16-coefficient candidate from the independently factored 256-cell table produces a genuine invertible GF29 4×4 matrix. Applying it to the exact terminal p54–55 runic chapter fails to reveal English under the natural four-symbol clock.

## Independent visible operands and proposed human route

The numerical table on physical pp49–51 has exactly 256 positional cells, already transcribed as 256 unsigned bytes in `resources/liber-primus/lp2-grid-256.json`, original byte SHA256 `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`. Its exact GF29 factorization has one irreducible degree-238 factor and a complementary **monic degree-16** factor. Original p15 independently depicts **one 4×4 number square**, so reshaping the 16 *non-leading* coefficients of this distinguished cofactor as a 4×4 matrix is one finite, reproducible hypothetical operation. Its published 17 high-to-low coefficients are:

```text
R16 = [1,25,17,11,15,7,11,26,6,26,13,2,6,12,26,20,13]
```

The source-defined last red chapter consists of original physical p54 (`71.jpg`), **232 runes**, and p55 (`72.jpg`), **76 runes**. Their sum **308 = 77 × 4**. Both page lengths are multiples of four, so a direct four-rune block clock needs no padding or guessed split. The chapter retains p54's initial nine red runes, all punctuation-preserving source rune indices, and the cross-page word continuation. A natural candidate thus consumes every original terminal rune as 77 printed-order blocks, independently of any proposed plaintext.

**Key weakness:** neither the table nor p15 explicitly instructs discarding the degree-238 factor, dropping the cofactor's monic leading coefficient, or encrypting pp54–55 with Hill4. These operations were selected from visible shapes; mathematical fit is not an authenticated author key or demonstration of intent. The previously tested *17 cofactor coefficients as per-word GP shifts* are a distinct hypothesis, as is the separately tested quotient-evaluation Hill4 matrix.

## Fixed full original inverse

Read the cofactor's remaining sixteen coefficients in printed descending order, ordinary row-major:

```text
K =  25 17 11 15
      7 11 26  6
     26 13  2  6
     12 26 20 13

K⁻¹ = 15  1 22 10
      28 17  5 20
      13 24 19 12
      15  4 23  6
```

The key has determinant **13 modulo 29**, so the inverse exists. For every source-aligned four-rune ciphertext column `C`, calculate `P=K⁻¹C (mod29)` and verify `C=KP (mod29)`. There are no fitted phases, trial passwords, red-rune exemptions, ciphertext deletions, dictionary hypotheses, or crib-forced word outputs.

| Original source scope | Runes | Cipher GP29 IoC | Decoded GP29 IoC |
| --- | ---: | ---: | ---: |
| P54 full chapter-opening page | **232** | **0.03313927** | **0.03422153** |
| P55 full last unknown page | **76** | **0.03789474** | **0.02912281** |

P55's source-fixed inverse begins `B-O-L-P-AE-R-X-TH-S-I-H-M-IA-L-I-F-EO-S-C-D-M-X-Y-C-T-I-AE-M-R-OE-F-E-C`, with no coherent GP-native prose. The inverse reproduces **308/308 original runes** on exact forward re-encryption. A separate positive control takes the independently clear **95 source p57 GP runes**, cycles them to a full 308-rune native-language register, encrypts with the unchanged source key and recovers **308/308** GP symbols. This proves the key and arithmetic are invertible, while leaving the hypothesized historical cipher entirely unproved.

## Decision

Retire the **single, natural cofactor16 → row-major GF29 Hill4 → continuous terminal pp54–55 inverse**. Its fully reproducible outputs are near-uniform and not plaintext. Do not extend to secret phase, orientation or polynomial subsets unless new source clues select them. The exact table factorization, visible p15 square and 308-rune terminal segmentation remain separate authentic source properties; they do not supply an executable decryption merely by matching dimensions.

**Reproducer:** [read-only CommonJS Node22 SFT](../sims/lp2_p50_cofactor16_hill4_terminal_sft.cjs), with checked-in original corpus and table hash assertions, exact full-factor division, algebraic inverse, all 308 unchanged original runes and the native positive plant. [Passing manual Windows GitHub Actions run 43702573481](https://github.com/FlareZ123/liber-primus/actions/runs/43702573481).
