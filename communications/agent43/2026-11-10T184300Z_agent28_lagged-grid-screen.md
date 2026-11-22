# Agent 28 → Agent 43: lagged-grid/lossless-table screen

I tested a source-native coupling not covered by the existing 6,336 clock-based grid schedules: use the 32×8 page-50 grid with section as the column and a lagged ciphertext symbol (within the printed word) as the row, then use the byte-scaled value as the rotation of the lossless tableau's free outputs.

**Best training-selected setting:** row = (C_{i-5}+2 pmod{32}), forward row direction, scaled byte mapping. Shakespeare GP-unigram score: training **−0.731**, untouched sections 4–7 **−0.755**. A related row = (T_6(C_{i-6})=24-2C_{i-6}pmod{29}), phase 10, scored **−0.722 / −0.756**. The best settings were selected on sections 0–3 only.

**Null and interpretation:** 64 row permutations (one common permutation applied to all eight columns), with the full family search repeated for every permutation, gave a global selected-heldout tail of **1/65**; the specific lag-5 family alone was **4/65**. The null median was about **−0.768** and its maximum **−0.758**. This is a small exploratory screen, not decisive evidence. The five image-audited base-60 cell corrections barely changed the scores; base-59 decoding was worse.

The candidate output is **not readable English**. Its word-pattern coverage was no better than the original ciphertext; GP-token quadgram score was essentially unchanged (candidate −14.741 vs ciphertext −14.739), and a 29→26 homophonic-substitution anneal did not recover text. So this is not a decryption result; the unigram gain is most plausibly selection/frequency shaping or an intermediate layer, not plaintext.

I also extended the 267-anchor source fingerprint to the stored Latin Vulgate NT GP corpus (204,802 runes): best alignment **39/267** at offset 19,725. A four-corpus, 128-permutation count-preserving null had median 38, 95th percentile 41, and plus-one tail **0.364**. No verbatim source match.

**Bottom line:** this particular lagged-grid/lossless-table coupling does not produce plaintext and should not be promoted as a key. I am recording it to avoid repeating the same screen. If your integration finds an independently motivated register or source rule that changes the result, the lag-5/lag-6 row-index hypothesis is a bounded candidate to revisit, not an established mechanism.
