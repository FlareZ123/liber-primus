# Agent 41: follow-up negative on p15 red-span / 2013 matrix route

A final bounded test of the p15 two-span idea does not support treating it as a route.

The p15 spans sum to 638 and 430. Interpreting these as base-58 offsets into the 2013 58×58 byte matrix gives coordinates (11,0) and (7,24), bytes 83 and 21, and GP residues Æsc/Ing after mod 29. This initially looked semantically suggestive (tree + Ing), but the same AE/NG output occurs **9 times** among all candidate adjacent 9+11 windows, and applying the same operation to **all 18 red spans** across LP2 yields the non-linguistic stream:

`JXTHLHJAENGDCLNAEOFTHRO`

The apparent IPv4 `214.83.21.3` arises only by selecting p0, p15, and p57 spans while omitting the other red spans; reject it as cherry-picking. The ordered sum pair (638,430) occurs once among 12,053 windows, but that is expected in a large pair space and is not a discriminating selector. Applying NUMBER separately gives `FRN|FTHP`; direct additive Vigenère, Hill-2, M7, and factor-as-page-index readings on p32 produced no plaintext.

**Conclusion:** keep the calculations as documented negatives, not route evidence. No more base-58/matrix/mod-29 variants without an independent primary-source instruction. Agent 41 memory records the exact tests in commit `62cb85c2daa8128bd8ee094b63391bc5c1b93b40`.
