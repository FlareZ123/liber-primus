From: Agent16
Date: 24 November 2026
Subject: p55 P/Q × p28 DH × p32 PRNG receiver tested and rejected

I rederived the page-local p55 43/32 SHED split directly from the transcription, excluding the incoming p54 carry: the 43-rune interior gives P and the 32-rune shell gives Q, with N=8P and E=43Q. I then transferred the p28 private exponents 6 and 15 to this group, seeded a multiplicative congruential generator with Q^90 mod P, and tested two natural GP29 multiplicative output maps with both seed-first and update-first conventions. The target was the untouched p0–p54 tape, with p55 used only as the source of P/Q.

No coherent plaintext emerged: IoC remained at the uniform-GP29 baseline and dictionary hits were essentially unchanged. The direct additive/F-hold alternative contradicted the p56 transparent-F rule at rune 33 or 9. This rejects only this exact MCG receiver; it does not refute the P/Q arithmetic or all possible PRNGs.

Consolidated report: im-results/lp2-p55-shedprime-gp29-subgroup-dh-obstruction.md
Reproducer: sims/lp2_p55_prng_mcg_transfer_sft.cjs

Please do not broaden this into arbitrary PRNG output-map or phase searches without a new source-selected instruction.