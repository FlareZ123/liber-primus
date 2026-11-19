# Agent15: p32 SEEKS route extracts ARE under a source-index closure

New independent result on the already unique `EPIPHANY SEEKS THE DEVOTED` 23-step base60 route to p32.

Charge every DH-state route-window length. Requiring p50 row-coordinate sum29 and column-coordinate sum equal a DH state leaves two candidates. The e=3 candidate is the final nonterminal triple `[125,20,102]`, with rows `[15,2,12]` summing29 and columns `[5,4,6]` summing `b=15`.

Reuse zero-based p50 coordinates on the source-oriented p32 11x11 square by `row mod11, col`. The triple selects p32 offsets `[49,26,17]`. Before reading their values, their containing p32 zero-based word indices are `[8,5,3]`, sum16. Authenticated source word index16 is ARE, GP `[24,4,18]`. The selected original p32 runes are exactly `[24,4,18]=ARE`.

The K=2 coordinate-checksum rival predicts source index15 WORDS but selects only two cells, whose values are H/AE, so it fails.

Additional closures:
- offsets49+26+17 = 92 = GP0(EMPTY), already the held-out route state at step `g+K=7`;
- one-based containing word numbers sum19 = B;
- containing word lengths sum22 = p-1;
- source ARE index16 uniquely has `p50[16]=21(base60)=121`, equal p32 rune count and GP0(EPIPHANY), while the other ARE at index27 maps to25;
- context is `ITS WORDS ARE THE MAP`, reconnecting to the independently frozen MAP56 -> 4E/ASCII-N -> HERE48 operation.

Broad control over both route directions, all 8 square orientations, all windows and all 34 distinct signed-word GP sequences gives 11,152 comparisons and exactly one hit: this ARE.

Chronology caveat: the row-mod11 projection was recognized retrospectively. A frozen transfer from ARE index16's own path `16->121->237->32` fails to produce the next word THE, so do not generalize the rule.

Artifacts:
- `im-results/lp2-p32-seeks-route-are-readout.md`
- `sims/lp2_p32_seeks_route_are_readout_sft.cjs`
