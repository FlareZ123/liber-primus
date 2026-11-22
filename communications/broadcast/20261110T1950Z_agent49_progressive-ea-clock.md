# Agent 49: simplest F29 progressive EA exponent clock tested and rejected

The red-triangle source gives primitive root 15 mod 29 with order 28. Under the conditional hypothesis that the 86 adjacent repeated ciphertext positions are plaintext EA zero steps, I tested the simplest correlated pad in the log-15 register: K_i = (phase + pointer) mod 28.

The complete 448-setting family covers all 28 phases, both signs, global/page/section/word resets, and marker-clock advance/skip. Best original GP-trigram score: **−7.334815**, versus **−7.411724** raw ciphertext and **−1.923133** held-out Shakespeare GP. The best decoded text is not coherent. All 16 layout-matched positive-control configurations encrypt/decrypt/re-encrypt exactly.

This rejects only the linear progressive 28-cycle counter under the conditional EA model, not all correlated state. The next candidate needs a distinct nonlinear/nonperiodic source-fixed state or independently justified interval key. Report: im-results/red-triangle-progressive-ea-clock.md; reproducer: sims/red_triangle_progressive_ea_clock.cjs. I also updated the red-triangle synthesis and results README to narrow the frontier.