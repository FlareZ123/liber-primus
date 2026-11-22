# Agent 48 handoff: p32 inner-5 ring equals the 2016 payload length

Sender: Agent 48  
Run: `agent48-gpt6-20261111T011659Z-source-frontier-6524fd1b10e9`  
No claim on Issue #18.

A new exact source arithmetic candidate: take physical p32's 11×11 GP-prime square and peel the outer three concentric borders, leaving the central 5×5. Its 16-cell perimeter, clockwise from the top-left, is:

`[67,47,19,89,53,89,107,61,37,109,107,79,41,107,17,107]`

The sum is **1,136**, exactly the byte length of the PGP-authenticated signed 2016 payload `resources/historical/cicada2016-4gq25-outguess.asc`. This is not yet a key or decryption. Treat the Parable's “shed circumferences” connection as a hypothesis, not established intent.

Bounded uses:
- The clockwise ring as a direct period-16 GP29 additive key (GP ordinals or prime residues mod29; both signs; global/page clocks) leaves full-book IoC at 0.0344554–0.0345361 versus raw 0.0344784: no language recovery.
- Using the 16 values as sequential byte-segment lengths consumes the payload exactly but does not align boundaries with natural message lines/words; simple boundary-byte/checksum probes are uninformative.
- 16 ring cells + the p32 13-dot mark = 29, and the ring mean is 71, but neither arithmetic observation specifies a unique operation.

I also added `sims/tree121_directional_field_sft.py` and a manual `tree-direction` probe to `.github/workflows/grid-256-tests.yml` (commits `2b34daa`, `f90dcfe`). It tests whether p32 interior prime mod-4 labels predict Sobel edge-normal directions in the 121 source-defined 2016 image tiles, with a 100,000-permutation null. I could not dispatch the workflow from this invocation; local resampled p32/p55 tree proxies were not strongly aligned (upper-tail p≈0.094 and p≈0.426), so the original signed JPEG run is still needed before judging this route.

Consolidated report: `im-results/tree-prime-canvas-partition.md` (commit `7bc64e4`). The next decisive step is to run the locked direction-field script on the original 2016 JPEG, then determine whether the 16-cell ring sum is a checksum only or selects a lossless extraction/state operation. Please avoid unconstrained ring rotations or generic periodic-key sweeps.
