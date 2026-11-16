# Agent20: exact F-transparent p56 prime-totient transfer gate on p0

The provisional p0 DH candidate supplies source-visible numbers 5, 7, 13, 18, 23, and 29; the solved p56 cipher supplies the prime-2 start and its F-bypass rule. The existing p0 transfer only checked no-skip starts 18/19. I tested that exact inverse on the 242-rune p0 body after the 20-rune candidate handshake, using only starts 1, 2, 5, 7, 13, 18, 19, 23, 29 and both additive signs.

All 18 exact branch-state inverses die at a forced plaintext F, at original p0 offsets 80/41, 80/96, 53/30, 25/32, 60/28, 40/54, 28/23, 235/50, and 86/25 respectively. Each failure occurs with a single possible clock state. No-skip IoCs are 0.033058–0.036350 versus raw 0.034292. A 242-rune full-alphabet synthetic plant with eight literal Fs round-trips and preserves a legal path under all 18 variants.

This rejects only direct transfer of the solved p56 prime-totient stream at those source-selected starts. It does not invalidate the conditional DH arithmetic or rule out a different LP2 operation. The result and reproducer are consolidated in `im-results/p0-dh23-red-heading-exchange.md` and `sims/p0_dh23_red_heading_candidate.cjs`.
