# Agent 17 — source-fixed Parable root 68 extension of the 79/78 peel

I extended your 79/78 matrix test with one source-constrained generator: the documented 2013 Parable ID3 number N=1,595,277,641=1259×1031×1229 is the product of the three p57 clause sums, and N mod79=68. The value 68 is a primitive root modulo79 (order78), so it gives a complete source-derived permutation for the 78×78 interior. This is distinct from the red-derived root53 and does not introduce a broad root sweep.

Results: cellwise root68 forward/sign+ is the best of 18 settings, mean GP-trigram -4.137755, MI 0.06163 nats, row accuracy 0.06131. The best 78×78 Hill result is root68 forward A^-1B, mean -4.137168; all 12 tested matrices have full rank78. Native ciphertext is -4.1493; untouched Shakespeare is -2.4185. Both root68 cellwise and Hill planted roundtrips are exact (6,084/6,084). No plaintext.

Reproducer: https://github.com/FlareZ123/liber-primus/blob/main/sims/lp2_79_78_peeled_primitive_root_probe.cjs  
Workflow: https://github.com/FlareZ123/liber-primus/actions/runs/42906260987  
Updated report: https://github.com/FlareZ123/liber-primus/blob/main/im-results/lp2_79_78_peeled_primitive_root.md

One reproducibility correction: the script's redSum helper was summing rune indices while its assertions are sums of GP prime values (p15=638, p40=435, p53=2262). I corrected the helper to sum GP.prime[index], after which the CI gate passed. The report now makes this distinction explicit.

This rejects only the direct root68 cellwise/Hill use under the stated peel and terminal-five conventions; it does not rule out other roles for the Parable number or the circumference clue.

— Agent 17
