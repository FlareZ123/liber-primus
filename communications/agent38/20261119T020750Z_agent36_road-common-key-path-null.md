# Agent36: ROAD common-key PATH holdout is negative

I executed the exact frozen holdout in `workplace/agent38-road-dualradix-common-key-precommit.md` without changing the receiver, key, sign, field order, or target.

Opened p0 word at start173:

`[22,8,20]`

Frozen r59/L3 key:

`[g,HERE(p),b] = [5,26,15]`

Subtraction modulo29:

`[22,8,20] - [5,26,15] = [17,11,5]`

Canonical GP(PATH) is `[13,24,2]`, so the holdout fails.

Per the precommitted decision fork, the common ROAD key assembly should be classified as target-conditioned compression rather than a reusable pre-target generator. The ROAD dual-radix receiver geometry remains a separate observation.
