# GP-prime ciphertext-weighted periodic clock: blind original-input recovery

Exploratory independent model; no first-party rule chooses the clock. Unlike a linear tick or the plaintext-weighted Director #2544 model, the phase is public after observing each ciphertext rune. The GP29 prime chart supplies weights, and historical additive ciphers motivate the fixed key. Test only periods 8, 13, 29 (historical key lengths and chart size), with no transparent F, continuous clock from first rune of the chosen span, and no reset between physical pages. This is a distinct direct native-register hypothesis, not the earlier predecessor-excluded rank28 clock.

`C_i = (P_i + K[q_i]) mod 29; q_(i+1)=(q_i+prime[C_i]) mod L; q_0=0.` The inverse follows the observed phase tape. Fit the key only on a prefix using exact phase-local unigram starting ranks and 8 deterministic multi-start coordinate ascent runs on a smoothed GP29 trigram objective. Each coordinate update scores every possible shift; the full search is heuristic. The prefix is the first 67% of each withheld native LP1 plant, or p0–1 / p40–45 for original targets. Every language model excludes LP2 p56/p57; each plant additionally excludes its target section. No crib or original suffix is used to fit the key. No original plaintext is known. Full forward replay is an invariant, not evidence of historical validity.

## Blind native positive controls

| Native section | Period | Key matches | Exact suffix runes | Fitted suffix nats/rune | True suffix nats/rune |
|---|---:|---:|---:|---:|---:|
| 0_welcome | 8 | 8/8 | 170/170 | -2.5129 | -2.5129 |
| 0_welcome | 13 | 13/13 | 170/170 | -2.5129 | -2.5129 |
| 0_welcome | 29 | 28/29 | 165/170 | -2.6555 | -2.5129 |
| 0_koan_1 | 8 | 8/8 | 258/258 | -2.6828 | -2.6828 |
| 0_koan_1 | 13 | 13/13 | 258/258 | -2.6828 | -2.6828 |
| 0_koan_1 | 29 | 29/29 | 258/258 | -2.6828 | -2.6828 |
| 0_loss_of_divinity | 8 | 8/8 | 250/250 | -2.7003 | -2.7003 |
| 0_loss_of_divinity | 13 | 13/13 | 250/250 | -2.7003 | -2.7003 |
| 0_loss_of_divinity | 29 | 29/29 | 250/250 | -2.7003 | -2.7003 |

## Unchanged-key original predictions

| Source scope | Period | Fitted/total runes | Prefix nats/rune | Suffix nats/rune | Best of 64 random-key suffixes |
|---|---:|---:|---:|---:|---:|
| p0-2 | 8 | 528/729 | -4.6476 | -5.4723 | -4.8228 |
| p0-2 | 13 | 528/729 | -4.4377 | -5.5024 | -4.6887 |
| p0-2 | 29 | 528/729 | -4.0927 | -5.4138 | -4.9185 |
| p40-53 | 8 | 1593/3008 | -4.9301 | -5.2849 | -5.1432 |
| p40-53 | 13 | 1593/3008 | -4.8371 | -5.2399 | -5.1477 |
| p40-53 | 29 | 1593/3008 | -4.5735 | -5.2378 | -5.1357 |

Original candidate prefixes and suffixes, complete keys, rival-key margins, and random baselines appear in the [machine output](lp2-cipherprime-periodic-blind-output.json). The unknown LP2 outputs do not exhibit sustained connected native language; no genuine unknown key or plaintext is established. This test only assesses the exact clock, no-hold register, periods and fitting protocol above; if a plant fails, that is a search limitation. Do not tune weights or clocks on this holdout. Native source hashes: `054f2a0f780b7d46901acbe3d9bf4f0ac1801165` and `1b064ef6d85819b7d96adaff31a82d1ec551598f`.

Reproduce from repository root with `node sims/lp2_cipherprime_periodic_blind_sft.cjs`. Executed on the original repository inputs in isolated JavaScript; no CI run is claimed.
