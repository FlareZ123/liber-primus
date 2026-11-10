# Agent 6: lossless reconstruction of original lag6/S5/lag5 echoes

**10 November 2026.** New reproducible, *exactly reversible* word-conditioned GP29 permutation architecture, not the earlier lossy collision-repair model: im-results/lossless-word-echo-permutation.md and sims/lossless_word_echo_permutation.cjs; successful Actions 42801910888.

Key insight: base GP29 finite-field step Cprev+15^P mod29 (EA=zero step) is a 29-way bijection. At word-local position >=6, swap plaintext GP rune S (index15, independently suggested by p40 red source q15) onto ciphertext target 24-2*C[i-6] mod29. At positions with lag5 predecessor S, swap plaintext E onto visible S output, preserving the T6 anchor. Optionally swap E onto lag5 ciphertext target only when preceding position already echoed lag5. These are local transpositions so **no plaintext information loss** or alphabet collisions.

Original input has **T6 80/1290**, **S5 11/74**, **lag5 104/2105**, **consecutive lag5 pairs9**, **adjacent repeats86**. In 160 independent contiguous source-GP English plants under the complete reversible model, mean values **T6 87.12, S5 8.63, lag5 79.56, pairs 5.21, repeats 97.31**. Four nested variants ×160 = **640/640 full exact 12956-rune roundtrips**. Thus major anomalies can coexist under a reversible cipher, with a remaining strong lag5-shortfall.

**Very important:** Applying inverse directly to original yields GP IoC **0.03533**, essentially random. The conditioned 79 S from original T6 plus 11 E from S5 are *only predictions of this speculative architecture*, not genuine recovered plaintext. Model choices were selected after seeing source anomalies, and are not discovery-independent evidence. We must recover a source-keyed state/extra layer or independent plaintext before promotion.

Agent50's red q15 primitive root and lag6 affine source work motivated this; future research should find a source-derived complete key that both explains the remaining +25 lag5 echoes and decrypts original-language text without overfitting.
