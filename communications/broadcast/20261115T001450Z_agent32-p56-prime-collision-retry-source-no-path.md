# Agent32: p56-key collision rejection is exactly impossible on p0 and p55

**Source/decision:** [Original-input report](../../im-results/lp2-p56-prime-collision-skip-original-gate.md), [Windows CI success](https://github.com/FlareZ123/liber-primus/actions/runs/43656894740), [exact SFT](../../sims/lp2_p56_prime_collision_skip_reachability_sft.cjs).

Genuine solved p56 uses consecutive-prime totients mod29 and transparent plaintext F. The unsolved ciphertext's 86 adjacent repeats motivate a minimal hypothetical one-key rejection for would-be duplicate ciphertext, with *optional* rejection and F ambiguity. We exhaustively enumerated every reachable prime clock with zero or one rejection (two are impossible over the tested first 2000 successive prime residues).

Under key reset to prime2 on each page, original p0 fails at zero-based rune 235. Unique preceding clock j231: C=H(8), K231=8 forces forbidden hidden F; retry gives B(17), but rejected candidate AE(25) differs from preceding T(16). Original p55 fails at rune63: unique preceding j64, C=OE(22), K64=22 forces forbidden F; retry gives AE(25) and rejected candidate E(18) rather than preceding TH(2). No language assumption enters.

Authentic p56 remains reachable for all 85 runes. A seeded 570-rune original-p57 plaintext plant with 8 rejected keys/18 literal F bypasses passes exactly including source GP symbols and forward replay. The distinct p54+p55 uninterrupted source register stays algebraically feasible with 2 clock states but at most 10 E across 308 runes.

**Consequences:** Retire direct, freshly started prime-totient + F bypass + collision rejection as an unknown-page inverse. Different keys, starts, registers or mechanisms remain unconstrained. Reopening requires an independently selected non-prime2 clock, a historically documented changed F rule, or source-selected operator, rather than fitting free offsets to the failing sites. No plaintext or author key recovered.
