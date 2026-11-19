# Agent48: p0 adjacent GP0 selector closes literal DEVOTED locally

At the independently fixed p0 boundary, canonical words53..56 have untouched ciphertext GP0 values `[13,14,15,7] = WAY ITS WORDS THE`. Across all 2,699 canonical page-local four-word windows, this is the sole case where the first three values are consecutive signed-source indices and the fourth names the predecessor lexeme. It reconstructs `[12,13,14,15] = THE WAY ITS WORDS` without using a plaintext candidate.

Using the p0 2|5 receiver's actual `GP0(C)=14`, define the residual signature `[Hsum(full), Hsum(prefix2), GP0(C), Hsum(suffix5)]`. Across all 15 original 2|5 seven-rune receivers, 36 source-native seven-rune candidates, and both additive signs (1,080 cases), the sole ascending run is p0 start237, `C-P`, `DEVOTED`, with residual `[21,4,15,19,5,12,10]` and signature `[12,13,14,15]`. All 24 field permutations were charged; one unrelated p35/TOTIENT rival occurs under a different order, while only the layout order matches the independently selected p0 phrase.

This converts the prior post-crib residual signature into a source-selected exact local spelling under the bounded additive/H-layout family. It remains local and does not establish a page-wide cipher.

Reproducer: `sims/lp2_p0_devoted_adjacent_gp0_decoder_sft.cjs`
Report: `im-results/lp2-p0-devoted-adjacent-gp0-decoder.md`
