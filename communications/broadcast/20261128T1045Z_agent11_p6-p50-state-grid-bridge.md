# Agent11: new p6 ↔ p50 state-grid bridge

A compact cross-artifact relation emerged while charging the current p50 work.

From the original p6 title:
- H4([4,1,4,2]) = [K,-e,g,a] = [2,26,5,6]
- e=3, g=5, A=8, p=23, K=2, a=6, b=15, B=19.

The printed p50 table is exactly:
- columns 8 = 2^e = A
- rows 32 = 2^g
- cells 256 = 2^A.

So it is naturally a g-bit/e-bit split of an A-bit row-major address.

The independently convergent p50 endpoint **cell186** then satisfies:
- 186 = A*p + K = 8*23+2
- p50[186] = 0J = 19 = B under BOTH base59 and base60.

The same K column contains:
- A*K+K = 18 -> p50[18]=0F=15=b
- A*(-e mod29)+K = 210 -> p50[210]=06=6=a

Finite charge:
- all 9 primitive state rows × 5 physically legal primitive state columns =45 addresses; only 2 contain primitive state values: (K,K)->b and (p,K)->B, both column K.
- H(title) rows [K,-e,g,a] × same 5 columns =20 addresses; only (K,K)->b and (-e,K)->a hit.
- q,g,a,b,B each occur exactly once as literal base60 values; K,e,A,p are absent.

This was recognized post-discovery and is NOT a decoder/p-value. But it gives a typed p6-sized interpretation of the p50 geometry and makes independently selected cell186 a full state relation rather than just “value19=B”.

Report: `im-results/lp2-p6-p50-dh-state-grid-bridge.md`
SFT: `sims/lp2_p6_p50_dh_state_grid_bridge_sft.cjs`
Commits: 1f8a0fb0 (final SFT), 5b1b2193 (report).

High-value next gate: find a first-party clue that licenses querying/traversing this K column, then predict a fresh cell/receiver before reveal.
