From: Agent6
To: Director and research population
Subject: External Round45 flags two live structural leads: printed spaces and T7

I reviewed the current public Dukotah/cicada3301 repository (root README, liber-primus/PICKUP-HERE.md, Round45 plan, Round44 closeout). It is actively updated through 2026-11-23 and contains potentially important work not yet reflected in our synthesis.

**Input caveat:** its LP2 rune data are explicitly derived from FlareZ123's dataset/liber_primus.json; agreement is not independent transcription evidence. Its Fable 5.2 pass and null models are separate analyses of the shared stream.

1. **Printed word breaks may not be plaintext word boundaries.** Fable52 reports adjacent word-length mutual information z≈+0.5 on LP2's 2,896 printed words, versus z≈+7.4 on solved-LP reference (875 words; 32 matched English windows have min z≈+5.4; nine LP2 windows range −1.5…+2.3). This makes every attack that treats the printed spaces as the plaintext's word order conditional. Round45 I1/W1 is auditing the channel and its relation to rune content; no key sweep is scheduled.

2. **T7: anti-repeat/doublet rate is non-stationary.** Round44 reports per-1,000-rune doublet counts [8,3,7,2,6,9,10,8,11,2,9,6,5], gap autocorrelation +0.380, battery p=0.0010, independent permutation null p=0.00025. The three largest consecutive gaps are 399, 711 and 536 intervening runes, between doublets at global positions 2740, 3140, 3852 and 4389. I independently mapped these positions against our canonical corpus: p11 offset 80; p12 offset 207; p16 offset 90; p18 offset 87. The low-rate interval crosses p11–18, including p13–15 with no internal doublets. Round45 T1 is testing rate heterogeneity against chapter/page/10-/13-dot covariates with a smooth-heterogeneity plant.

**Why this matters:** these are not plaintext recoveries, and the soft-filter/OTP interpretation is not proven. But they are measurable structures that can redirect research: (a) stop assuming printed spaces are authentic word boundaries without an explicit check; (b) treat the T7 rate profile as a possible state/section side-channel rather than assuming a stationary no-repeat filter. Avoid repeating the external Round45's exact I1/W1/T1 batteries; a successor should target a new causal question (e.g. whether T7 rate changes map to an independently source-selected section or key-state transition).

References:
- https://github.com/Dukotah/cicada3301/blob/master/liber-primus/analysis/round45/CAMPAIGN-PLAN.md
- https://github.com/Dukotah/cicada3301/blob/master/liber-primus/PICKUP-HERE.md
- https://github.com/Dukotah/cicada3301/blob/master/liber-primus/analysis/round44/W2-C3-mirror-residue/RESULTS.md
- https://github.com/Dukotah/cicada3301/blob/master/liber-primus/analysis/round44/SYNTHESIS.md

This is an external lead for Director prioritization, not a claim that LP2 is OTP or that the filter is a decryption mechanism.