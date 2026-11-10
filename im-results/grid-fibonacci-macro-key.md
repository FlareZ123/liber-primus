# Fibonacci-spiral traversal of LP2's 256-byte grid: source-fixed key inversion

**Evidence:** bounded original-cipher negative with synthetic source-key recovery. Agent 50, 10 November 2026. **No unknown LP2 plaintext, key, cipher mechanism, or continuation was recovered.**

## Source-derived construction

The original LP2 page-15 4×4 Fibonacci-prime square has a fixed outward spiral, flattened row-major:

`[5,6,10,9,8,4,0,1,2,3,7,11,15,14,13,12]`.

The page-49–51 number table has exactly 256 base-60-decoded bytes, kept unchanged. Treat the 32×8 original bytes as a 16×16 matrix by row-major or column-major reshape, divide it into sixteen 4×4 macroblocks, visit those macroblocks in the independently reconstructed page-15 spiral (forward or reversed), and visit each macroblock internally in 4×4 row-major or spiral order. This fixes **eight exact 256-byte traversals** without choosing plaintext or fitting to original ciphertext.

For each traversal, construct 32-byte AES-256/ChaCha20/RC4 keys in three explicit ways: SHA-256 of all 256 traversed bytes, first 32 bytes, and last 32 bytes. That yields **24 source-defined candidate keys**. Test the existing repository stream-cipher inversion `scan()` against LP2 pages 16–22 and, separately, 23–29, under its AES/ChaCha/RC4, page-IV, skip, sign and byte-reduction alternatives (**1,824 configurations** in each page range). In a distinct bounded direct-GP pad test, each of the eight full 256-byte traversals is used as a 256-periodic GP29 pad, with continuous or page reset, two reductions and two signs (**64 configurations**).

This new cross-artifact construction is an exploratory hypothesis. The source does not explicitly instruct reshaping the table or using SHA-256.

## Executed original-source outcomes

Successful manual GitHub Actions [run 42830844074](https://github.com/FlareZ123/liber-primus/actions/runs/42830844074) executed [the complete CommonJS reproducer](../sims/grid_fibonacci_macro_key.cjs) with the canonical original ciphertext and original byte table. The real ciphertext IoC, before decoding, is 0.034509598 on pages 16–22 and 0.034353754 on pages 23–29.

| Frozen evaluation scope | Best over that scope | Best GP rune IoC |
| --- | --- | ---: |
| AES-256-CTR/ChaCha20/RC4 on pages 16–22 (model selection range) | last32:row-spiral-forward, AES-256-CTR, zero IV, byte skip256, scale, sign− | **0.035089243** |
| Same model family evaluated independently on pages 23–29 | sha256:row-row-forward, ChaCha20, last-be IV, skip256, scale, sign+ | **0.035198347** |
| Full-grid direct GP periodic pad, pages 16–22 | row-spiral-reverse, continuous, byte mod29, sign− | **0.034928706** |
| Full-grid direct GP periodic pad, pages 23–29 | column-row-forward, continuous, scale, sign+ | **0.034976865** |
| Full-grid direct GP periodic pad, all 12,956 unresolved runes | column-row-reverse, continuous, mod29, sign+ | **0.034558019** |

The independently selected winners differ between the two physical page windows, so these maxima are **not** heldout scores for one selected key. No candidate produces source-native GP-English frequency concentration or readable plaintext. The best full-book direct periodic score stays close to the uniform GP29 baseline 1/29 ≈ 0.034483. These conclusions are specific to the stated source traversal, direct codecs, clocks and arithmetic reductions.

The exact-key positive plant encrypts source-like GP-language runes under the derived `sha256:row-row-forward` AES-256-CTR key and adds the same synthetic 81%-chance immediate-doublet correction used by the imported `plant()` routine. The full 24-key/1,824-setting scan retrieves **the actual key and AES/zero-IV/no-skip/mod29/inverse-sign at rank one**, with recovered IoC **0.065238579**. The correction makes this a key-recovery diagnostic, rather than a proof of fully lossless decoding of a corrected plant.

## Decision

The page-15 Fibonacci-prime square provides an authentic 4×4 traversal and the page-49–51 grid supplies 256 original bytes. Their **particular direct combined key construction fails the initial original-input language gate**, although the implemented search recovers its own planted source-derived key. Further work should require a source-recoverable nontrivial state, a different transform fixed before testing, or an independently established intermediate plaintext register. Do not repeat this finite 24-key direct stream family absent new source evidence.
