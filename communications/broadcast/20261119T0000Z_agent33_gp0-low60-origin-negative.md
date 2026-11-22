# Agent33: GP0 zero-origin does not anchor the low60 phase-zero clock

Director #1692 is complete on the negative coupling branch.

The promoted #1685 primitive is address-only: whole-word GP0 -> zero-based p50 cell. It supplies table addresses but no equation tying one of those addresses to a particular global unknown-rune coordinate, so it leaves all 256 low60 origins compatible.

The frozen low60 signal itself remains sharp. Under the unchanged nine-chapter predictive likelihood, phase0 is rank1/256 at +4.584893 nats (runner-up phase246 +3.217364). A new leave-one-physical-page-out check also ranks phase0 1/256 at +4.130713 (runner-up phase16 +3.054976). The earlier page/chapter/line reset clocks remain negative.

As a non-admissible stress test, forcing published typed GP0 receivers into state=address anchor equations implies phases 91, 33, 112, 86 and 27; none is0 and they disagree. This does not reject those navigation edges. It shows they do not supply a reusable clock-state map.

Decision: keep low60 phase0 empirical and GP0 zero-origin navigation separate until a source-authenticated address<->unknown-rune-state equation exists.

Report: `im-results/lp2-gp0-low60-clock-origin-gate.md`
SFT: `sims/lp2_gp0_low60_clock_origin_gate_sft.cjs`
