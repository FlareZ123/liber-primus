# LP1 moth / p55 3×25 square: D4 transposition with prime-totient pad

**Agent 8, 13 November 2026. Bounded original-cipher negative.** All 32 complete, source-defined variants of a 5×5 board transposition combined with the exact solved-LP1 p5 prime-totient key fail the specific independent **30-rune seven-word terminal crib** on original LP2 p55. This recovers no unknown-page plaintext, key, or intended operation.

## Original clue and exact premise

The authentic original LP1 physical p5 moth appears again on LP2 physical p53 and p55. The solved LP1 p5 text explicitly states that primes and Euler's totient are sacred, and prints a **5×5** number square. The genuine p55 image has one incoming p54 word-completion rune followed by **75 runes in 16 complete words**. Consequently the whole actual p55 body is exactly **three complete 25-rune boards**, without cropping, wraparound, nulls or guessed lengths. The source moth page also supplies a seven-word sequence **THE TOTIENT FUNCTION IS SACRED ALL THINGS**, exactly matching p55's final seven printed word lengths [2,7,7,2,6,3,3] under original LP1 rune spelling (IO, ING are single symbols). That 30-rune source crib remains hypothetical. Neither original page explicitly instructs a board transposition or names a cipher layering order.

The source p5 square, in its published row-major order, gives the already established GP29 **totient** key:

    K = [12,15,10,14,5,4,24,19,12,6,25,23,14,23,25,6,12,19,24,4,5,14,10,15,12]

Earlier p55 tests evaluated the direct period25 pad, the fixed Hill5 matrix and even every possible single stationary Hill5 key against the same proposed crib; those are different operators. This experiment adds an elementary square-board **transposition combined with the pre-existing pad**, one source-motivated operation requiring no secret alphabet or cipher coefficients.

## Frozen reversible source inverse

Read original p55 positions 1–75 into **three 5×5 square boards in printed row-major order**, preserving the p54→p55 carried rune as external context. Each board uses the same D4 geometric read order, namely four quarter-turns optionally followed by a horizontal mirror; this contains ordinary row/column readings and all source-visible rigid rotations/reflections. Apply inverse prime-totient GP29 additive key either before or after undoing the board rearrangement. Admit the two algebraic signs. This defines exactly **8 × 2 × 2 = 32** candidate reversible mechanisms. All keys start at phase0 of the independently printed p55 **body**, and their 25-slot period restarts at each board. No guessed rotations per board, key phase search, random permutations, IV, F skips, word resegmentation or editing of source runes is allowed.

The decisive test is a **literal 30/30 GP-rune equality** with the independently spelled LP1 crib on the final seven p55 words. Merely improved English-looking statistics or exact re-encryption is insufficient. Each of the 32 actual original outputs was also inverted back to its exact 75 original ciphertext glyphs. Separately a 75-rune positive planted native plaintext consists of 45 already-solved GP runes from p57 followed by the exact 30-rune source crib, and every one of the 32 encryption/decryption variants recovers all **75/75** planted plaintext positions.

## Original decision

Of all **32** source-shaped variants, the **maximum original terminal-crib equality is 3 of 30 symbols**, reached twice. The direct unrotated subtract-key configuration matches **1 of 30**, consistent with the earlier pad failure. Under the 32 candidates, the decoded whole-body GP29 IoCs range **0.03243–0.04108**, and none produces the LP1 phrase or another independently authenticated unknown text. The maximum three matches is unremarkable among 32 fixed wrong-key candidates and falls 27 symbols short of the literal source crib.

This excludes the exact three-board 5×5 source-totient-plus-D4 family **as an encoder of the proposed seven-word phrase**. It does not disprove the phrase under a nonlinear or evolving key, or a board cipher with independently specified different operators, and it cannot exclude another plaintext under this family. There is no original author instruction that supplies such a replacement. The image duplication selects a useful source page, while its intended decoder remains unknown.

**Reproduce:** [Single runnable Node22 CommonJS test](../sims/lp2_p55_moth_square_d4_transposition_pad_sft.cjs) directly reads the canonical original p55 corpus, original rune spellings, source totient key and all 32 frozen inverses; asserts page/body/crib sizes, full reversible original/source-native controls, exact maximum matches and complete candidate metadata. Related original-source studies: [moth illustration source](lp1-lp2-illustration-reuse-and-cipher-transfer-gate.md), [LP1 seven-word terminal crib](lp2-p55-moth-p5-terminal-sevenword-crib.md), [all-secret stationary Hill5 obstruction](lp2-p55-moth-any-hill5-allkey-holdout.md).
