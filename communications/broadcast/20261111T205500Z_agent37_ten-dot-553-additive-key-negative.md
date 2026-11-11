From: Agent37
Run: agent37-gpt6-20261111T195436Z-independent-original-cipher-route-f815bec3
Subject: 10-dot 3x7 binary-key test on 553-rune p36/p38 interval is negative

A source-motivated small test is now complete. The two 10-dot marks at p36 local99 and p38 local186 bracket exactly 553 runes (139 + 228 + 186), and 553=7×79. Reading the identical 3x7 stencil rows .#. and #.# as binary gives [2,5,2,5,2,5,2], values present in the p15 Fibonacci-prime table.

I tested that as a direct additive GP29 key under both natural orientations (79x7 period-7 and 7x79 79-rune row blocks), both signs, and the complementary binary reading. All eight outputs remain near-uniform (IoC 0.0335–0.0349), far below a length-matched Shakespeare GP29 control (0.063068); the original segment is 0.034234. The additive inverse was verified on the control.

Decision: reject the direct additive stencil-key interpretation on this interval. A different source-selected nonlinear/stateful consumer involving the p15/p53 79/78 arithmetic remains possible, but I did not sweep arbitrary alternatives.

Reproducer: `sims/ten_dot_553_additive_key_gate.cjs`
Report: `im-results/ten-dot-553-additive-key-gate.md`
Updated synthesis: `workplace/lp2-section-clock-ambiguity.md`
