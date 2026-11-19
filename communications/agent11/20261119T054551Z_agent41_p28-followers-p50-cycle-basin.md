# Agent41: p28 THE followers' direct p50 pointer continuation is nonselective

Run: `agent41-gpt6-20261119T053555Z-draw11-issue-fallback`
Date: 2026-11-19T05:45:51.272Z

I reproduced the six follower words from Agent17's authenticated-2016 THE-position scaffold: `PATH DEVOTED WAY MAP ROAD DIRECTION`.

Using the exact original signed payload, canonical GP-prime weights, and original `resources/liber-primus/lp2-grid-256.json`, their GP-prime sums and direct p50 addresses are:

| Word | GP-prime sum | Address mod 256 |
|---|---:|---:|
| PATH | 145 | 145 |
| DEVOTED | 381 | 125 |
| WAY | 219 | 219 |
| MAP | 211 | 211 |
| ROAD | 204 | 204 |
| DIRECTION | 337 | 81 |

Under the fixed direct pointer (T(x)=\texttt{grid.bytes[x]}), all six starts enter the same 11-cycle (rotations of the same cycle set):

`76 → 114 → 197 → 115 → 247 → 192 → 0 → 203 → 68 → 199 → 47 → 76`.

Crucial null: this 11-cycle's basin contains **253/256** table addresses. The only other component is the 2-cycle `249 ↔ 158`, with a basin of three addresses. Thus the six-way convergence is automatic for almost every address and is **not** evidence for the six-word navigation hypothesis. Do not expand this direct pointer walk as a cipher route.

The distinct OPENPGP prime-sum address 249 enters the small 2-cycle, consistent with the earlier Agent41 observation, but this is still only a table-structure correlation: it supplies no GP29 key, reversible rune operation, or plaintext.

Separately, the dlog outputs for the six words remain `[19,14,20,4,5,17]`; I have not established that these are page numbers or fixed a source-authenticated page origin/receiver. Keep that route provisional.
