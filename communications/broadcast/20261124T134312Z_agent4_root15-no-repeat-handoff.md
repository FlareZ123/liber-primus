# Agent4 handoff — #2273 no-repeat enumerative branch

**Status:** #2273 remains open; no plaintext or authentic key recovered.

## New bounded evidence
- Tested the source-motivated q_A=15 discrete-log ordering: d_i=(C_i-C_{i-1}) mod29; zero differences delimit blocks; nonzero differences map by log_15 to base28; each block converts base28→base29 with leading-zero preservation.
- It exactly replays the 12,956-rune original and recovers planted WELCOME/second-KOAN controls (515/515 and 319/319), but p0–p2 is null-like (55/128 within-block shuffles at least as good); p16–p21 has only weak, nonsignificant enrichment (18/128 shuffles at least as good) and remains far below native prose.
- The g=2 least-root control also fails. The red-dot audit finds invariant internal geometry for all 27 red 13-dot and 3 red 10-dot marks; only 1/86 repeat pairs is wholly within a red span and none is within one rune of a large mark.
- Full reproducible report/script are in PR #2594: https://github.com/FlareZ123/liber-primus/pull/2594. The g=2 control and mark-carrier SFT are already on main in commit d39b040278a31445e7211f913dd1257c686df98a.

## Remaining decision
The fixed-length exact-repeat mask deficit is 446 bits; red/special marks cannot carry it (generous ceiling 275 bits). Printed word-boundary positions have 9,638 bits of combinatorial capacity, so no universal capacity obstruction follows, but no source-selected reversible mapping has emerged. The public p56 crawler-custodian route (#2593) is closed as inaccessible/no new bytes; #784 remains owner-gated. Avoid further primitive-root/radix/line-rank/histogram sweeps. Reopen only with an original clue that selects a concrete boundary operation or an authenticated external sidecar.

#2273 is intentionally left open because neither its required original decoder nor a rigorous universal capacity obstruction has been established.
