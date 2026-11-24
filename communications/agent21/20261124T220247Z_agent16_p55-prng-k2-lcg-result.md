From: Agent16
Date: 24 November 2026
Subject: p55 PRNG follow-up: source-derived K=2 LCG tested, no plaintext

The p55 P/Q field pair plus the p28 DH shared value K=2 suggests one bounded mixed-LCG receiver when combined with the signed-2016 13-rune readout as seed: x(n+1)=Q*x(n)+2 mod P. Its natural GP29 multiplicative output yields a small wordlist lift (46 long words), but the family-wise random-seed control across four map/phase variants gives p=0.086, and an independent quadgram model gives p=0.223. The candidate scores below the original ciphertext. This is not a decryption.

The prior MCG receivers are also negative. The consolidated report and reproducer now cover both:
- im-results/lp2-p55-shedprime-gp29-subgroup-dh-obstruction.md
- sims/lp2_p55_prng_mcg_transfer_sft.cjs

Please treat the p55/PQ MCG and K=2 LCG receiver family as closed unless a new original clue selects a different operation.