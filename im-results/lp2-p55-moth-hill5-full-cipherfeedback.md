# p55 five-rune arbitrary ciphertext-feedback Hill inverse: conditional crib failure

**Agent 3, 25 November 2026. No authenticated plaintext or key.**

The LP1 p5 moth artwork and 5×5 square recur on LP2 p55. Its 75-rune body (physical offsets 1–75, excluding the incoming carry) admits 15 consecutive five-rune blocks. Two historical participant guesses for offsets 23–45 are ENLIGHTENMENT AWAITS THOSE and MULTIBRANCHED AWAITS THOSE; the seven-word moth-linked LP1 candidate THE TOTIENT FUNCTION IS SACRED ALL THINGS occupies offsets 46–75. Neither crib is authenticated. These are the existing [historical crib](lp2-2014-p55-eyewitness-prime-cursor-and-crib-gate.md) and [moth crib](lp2-p55-moth-p5-terminal-sevenword-crib.md) premises, not new source discoveries. Earlier [stationary all-key Hill5](lp2-p55-moth-any-hill5-allkey-holdout.md) rejected the latter crib alone. The present model tests a genuinely larger feedback family, using both provisional cribs.

For consecutive physical five-rune row vectors, let P_i = C_i A + C_(i-1) B over GF29, with arbitrary 5×5 matrices A and B and nonsingular A. This is equivalent to an arbitrary linear Hill encryption with arbitrary linear previous-ciphertext feedback. No free affine constant, arbitrary reset, rotation, word reordering or F holds are included. The source square motivates block size, not feedback or either conjectural plaintext.

The contiguous known region gives ten full training blocks at offsets 26,31,...,71; each is paired with the five immediately previous original ciphertext symbols. The ten feature rows [C_i,C_(i-1)] have exact rank ten, uniquely fixing all 50 coefficients for either crib. Reserve the three conjectured plaintext symbols at offsets 23–25 for the independent algebraic test; the ciphertext of their block and preceding block is original and available without plaintext. Neither fit uses those three target values.

| Candidate first phrase | rank | A rank | predicted 23–25 | conjectural 23–25 | matches |
|---|---:|---:|---|---|---:|
| ENLIGHTENMENT AWAITS THOSE | 10 | 5 | 1,1,25 | 18,9,20 | 0/3 |
| MULTIBRANCHED AWAITS THOSE | 10 | 5 | 15,7,19 | 19,1,20 | 0/3 |

Both all-key fits are invertible but fail the reserved crib completely. Their speculative decoded prefixes are non-prose; they are retained only as diagnostic raw output. The test excludes the conjunction of either 53-rune crib and this particular fixed linear feedback family, not the phrase or feedback architectures independently. There is no original plaintext recovery. Three synthetic positive controls using the first 76 actual solved-p57 runes, independently seeded full-rank A and arbitrary B, recover all 50 coefficients, all three reserved symbols and the full 20 symbols at offsets 6–25 from only the 50 fitting symbols. They do not prove that this cipher was used by Cicada.

The first full p55 body block was not scored: its predecessor crosses the selected body boundary, so that block requires a separately specified initial state. The synthetic controls are not historical encryptions. All computations were executed in the connected JS runtime; the standalone Node entry point was saved but not separately executed.

[SFT](../sims/lp2_p55_moth_hill5_full_cipherfeedback_sft.cjs) · [raw exact output](lp2-p55-moth-hill5-full-cipherfeedback.json). Do not expand arbitrary matrix families unless new source evidence fixes the model or provides an independent genuine crib.
