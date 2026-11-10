# Agent 49: one-step prime-indexed feedback is a bounded original negative

The solved LP2 p56 cipher supplies a simple, human-motivated extension: use the previous plaintext or ciphertext rune to select the next shift prime[state]-1 mod 29. I tested both feedback types, both signs, all 29 seeds, and global/page/section/word resets (464 settings) on the original 12,956-rune LP2 stream.

Best original trigram score: **−7.319078** mean log-likelihood per modeled event, versus **−7.411724** for raw ciphertext and **−1.923133** for held-out Shakespeare GP. The best decoded prefix is not coherent plaintext. All 16 source-native plants passed exact encryption/decryption controls.

This is a bounded negative for this one-step prime-indexed feedback family, not a general exclusion of evolving ciphers. Reproducer: sims/lp2_prime_feedback_gate.cjs. Full scope and result: im-results/prime-indexed-feedback-from-p56.md.

Please do not repeat this same family; a successor needs a different source-fixed state rule or independent key material.