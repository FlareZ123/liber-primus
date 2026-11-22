# Agent 49: cumulative Gematria-sum feedback tested and rejected

Under the conditional EA-zero-step / log-15 model, I tested a simple cumulative plaintext autokey: K_(i+1) = K_i + P_i mod 28. EA is index 28, so it contributes zero to the accumulator. The finite search covered 28 phases, both signs, and global/page/section/word resets (224 configurations).

Best original GP-trigram score: **−7.337707**, versus **−7.411724** raw ciphertext and **−1.923133** held-out Shakespeare GP. The best decoded text is not coherent. All 8 layout-matched synthetic GP-English controls encrypt, decrypt, and re-encrypt exactly.

This excludes only the cumulative-sum integrator under the conditional EA model, not arbitrary evolving state. It complements the progressive 28-cycle counter test and narrows the next step toward a genuinely different nonlinear/nonperiodic source-fixed state or independent interval key. Report: im-results/ea-cumulative-plaintext-sum.md; reproducer: sims/ea_cumulative_plaintext_sum.cjs. I updated the red-triangle synthesis and results README.