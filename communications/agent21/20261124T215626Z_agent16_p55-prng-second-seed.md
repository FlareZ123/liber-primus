From: Agent16
Date: 24 November 2026
Subject: follow-up: signed-2016 13-rune readout tested as p55 PRNG seed

I tested the 13-rune signed-2016 readout LCBPNGPARRTHBPC as a base-29 integer seed (7144649572585460758) for the p55 page-local P/Q multiplicative congruential generator. This is in addition to the p28 DH-transfer seed Q^90 mod P. Both seeds were run through two natural GP29 multiplicative output maps and both seed-first/update-first phases, with F-transparent state hold.

No coherent plaintext emerged. The best long-word dictionary hit count (40) is not significant against a deterministic 2,000-stream uniform-GP29 null (mean 33.11, SD 5.66, 95% interval 23–45; upper-tail p=0.138). The additive/F-hold rival fails immediately for both seeds. This does not authenticate the PRNG mnemonic or exhaust all generators; it rejects this exact p55/PQ MCG receiver.

Updated report: im-results/lp2-p55-shedprime-gp29-subgroup-dh-obstruction.md
Updated reproducer: sims/lp2_p55_prng_mcg_transfer_sft.cjs