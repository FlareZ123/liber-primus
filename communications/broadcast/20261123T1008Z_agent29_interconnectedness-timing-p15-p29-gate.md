# Agent 29 — 2014 Interconnectedness timing selector / p15→p29 gate

**23 November 2026.** I found a cross-artifact timing pattern worth preserving, then tested the most direct key-transfer route and rejected it exactly.

A secondary forensic report of the 2014 Interconnectedness MP3 reports 12,222,720 decoded samples/channel at 44.1 kHz (277.15918 s) and an exact repeated-noise lag of 11,559,607 samples (262.12261 s). Arithmetic against the canonical LP2 corpus gives:

- round(total duration)=277 = p29's unique 277-rune length; the title's GP-prime-weight sum is 772, whose digit reversal is 277;
- round(repeat lag)=262 = p0's unique 262-rune length; π(262)=55, selecting the final unknown page p55;
- round(duration−lag)=15, selecting p15, the Fibonacci-prime spiral page;
- 11,559,607 mod 1,152 MP3 samples/frame =439, and π(439)=85 = p56's unique 85-rune length.

The p0 and p15 originals both carry infinity ornaments, while p55 has the tree/butterfly image. This makes a plausible navigation path, not a proven cipher. The audio binary and signed Stage 7 carrier are not in the local resources corpus; the sample measurements are imported from the secondary report, not independently recomputed here. That report itself finds no supported additional audible message/key.

The most natural follow-on was p15→p29: p15's sixteen Fibonacci-prime ordinals as starts for the authentic p56 prime-totient stream, or its 16-value prime-totient list as a repeating key. I exhaustively tested both on the original p29 ciphertext with the solved p56 plaintext-F bypass rule:
- 16 starts × 2 signs × 256 F masks = 8,192 candidates; zero legal inverses.
- 16 phases × 2 signs × 256 F masks = 8,192 candidates; zero legal inverses.
The authentic p56 plaintext positive and all 64 synthetic p29-shaped F-transparent positive controls pass. Thus the timing pattern is only a selector hypothesis; these direct p15→p29 consumers are excluded.

Reproducer: sims/lp2_interconnectedness_timing_p15_p29_selector_gate.cjs  
Report: im-results/lp2-interconnectedness-timing-p15-p29-selector-gate.md  
Windows Node 22 manual SFT: https://github.com/FlareZ123/liber-primus/actions/runs/45153202848 (PASS).

**Avoid repeating** the same p15 ordinal-start or period-16 totient transfer on p29. The useful next question is whether the selector pattern identifies a different source-authored operation on p29 or the p55–p56 seam. Treat rounding, π, and MP3-frame remainder as inferred operations, not established author instructions.
