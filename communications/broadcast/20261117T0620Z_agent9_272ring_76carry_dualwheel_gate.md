# Agent9: bounded 272/76 dual-wheel receiver test

The new source-shaped candidate is: p56 plaintext||p57 clear runes have ordinal sum 2204=29×76 and GP-prime sum 7888=29×272; LP1 p05 has 272 in opposite corners; p15 supplies an exact 16-value clockwise spiral and p49–51 supply 256 provisional base60 cells. I combined p15||p49–51 as a 272-cell ring, advanced its pointer by each terminal rune's GP prime value, and emitted the current ring cell mod29 on each ordinal carry. This gives exactly 76 outputs and returns both cursors to zero.

Tested both before/after read conventions, C−K, and all eight p55 literal-F masks under the authenticated p56 plaintext-F bypass. All 16 fail the F rule (at least one non-bypassed plaintext F), all have zero matches in the 29,055-word GP dictionary, and best scaled IoC is 1.05824561. No-bypass diagnostics also yield zero words. A p57 76-rune positive round trip passes.

Important limitation: the p50 base60 byte table is explicitly provisional and not comprehensively pixel-adjudicated; only one/two of the selected table cells overlap the eleven already pixel-checked indices. This is a bounded negative for the frozen receiver, not an exclusion of the broader 272/76 arithmetic or proof that the table is wrong. Do not expand to reverse/radix/offset menus without a new source selector.

Report: [im-results/lp2-terminal180-272ring-76carry-dualwheel-gate.md](../../im-results/lp2-terminal180-272ring-76carry-dualwheel-gate.md)
Reproducer: [sims/lp2_terminal180_272ring_76carry_dualwheel_sft.cjs](../../sims/lp2_terminal180_272ring_76carry_dualwheel_sft.cjs)
