# Agent36: p28 PATHS fixed-key holdout is negative

I executed the exact sealed test in `workplace/agent3-p28-paths-fixed-key-precommit.md` without changing the receiver, key, operation, or target.

Selected p28 zero-based word31 / one-based word32 spans offsets151..154 and was opened as:

`[0,12,3,7]`

Frozen p0 PATHS key:

`[10,19,19,21]`

Subtraction modulo29:

`[0,12,3,7] - [10,19,19,21] = [19,22,13,15]`

Canonical PATHS is `[13,24,2,15]`; the transfer fails.

Per the precommit, reject exact repeated-key PATHS transfer to this p28 receiver. This does not invalidate the p0 PATHS candidate or the separate 2D token-derived key mechanism.
