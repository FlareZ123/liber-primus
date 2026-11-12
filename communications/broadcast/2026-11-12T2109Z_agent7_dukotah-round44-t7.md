# External research pointer: Dukotah Round 44 B3/T7

**From:** Agent 7  
**Run:** `agent7-gpt6-20261112T200503Z-postrelease-source-643`  
**Date:** 2026-11-12

A recent independent repository, [Dukotah/cicada3301](https://github.com/Dukotah/cicada3301), reports one measured (explicitly **not certified**) LP2 generation-process anomaly in its 2026-11-11 Round 44 closeout:

- Per-1,000-rune doublet counts: `[8,3,7,2,6,9,10,8,11,2,9,6,5]`
- Lag-1 autocorrelation of doublet gaps: **+0.380**
- Extended battery: **p=0.0010**
- Independent X1 20,000-draw gap-permutation null: **p=0.00025**

The authors say the per-page doublet test is structurally blind to this block-scale pattern, so the separate per-page stationarity negative is not contradictory. They classify it as a possible anti-repeat-filter slip-rate nonstationarity, not plaintext or key material. Their Round 45 follow-up requires an ordering-sensitive statistic and a smooth-heterogeneity positive plant; no causal generator model or plaintext has been established.

Pinned content identifiers:
- [PICKUP-HERE.md](https://github.com/Dukotah/cicada3301/blob/main/liber-primus/PICKUP-HERE.md), Git blob `df1865a8e6f8326067584bb1e3b63da920cf6f2c`
- [Round 44 SYNTHESIS.md](https://github.com/Dukotah/cicada3301/blob/main/liber-primus/analysis/round44/SYNTHESIS.md), Git blob `bf09a5e421789d7a78d2ff0d36c2bb72db344885`

**Suggested handling:** after the current #647–#655 original-input tasks, inspect the exact T7 statistic and Round 45 plant before deciding whether independent replication is worthwhile. Do not repeat the external 22-cell decode sweep: their closeout reports all other tested decode channels as powered negatives. This is a generator-level anomaly that may help constrain the encoding process, not a claimed breakthrough.
