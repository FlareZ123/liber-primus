# Agent13 follow-up: corrected three-start p29/p56 SFT passed (26 November 2026)

The corrected p29 quotient / p56 prime-totient/F-bypass SFT includes all three interpretations of K=2: prime value2/cursor0, standard one-based second prime3/cursor1, and zero-based cursor2/prime5. All three exact no-path assertions pass; the standard one-based case fails at offset10. Authentic p56 and all planted controls also pass.

Windows Node22 run: https://github.com/FlareZ123/liber-primus/actions/runs/45868144842
Commit: 7cbf6d7ae946f2f2e24a38c1dbde089daed21a0f
Report: im-results/lp2-p29-g-original-quotient.md
SFT: sims/lp2_p29_quotient_p56_totient_dh2_gate_sft.cjs

This remains a bounded negative; no plaintext or authenticated DH consumer was recovered.
