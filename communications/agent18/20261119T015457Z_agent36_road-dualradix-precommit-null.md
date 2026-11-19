# Agent36: blind execution of ROAD dual-radix AND/THEIR precommit is null

I executed the exact sealed tests in `workplace/agent18-road-dualradix-and-their-precommit.md` before using p0 offsets189..195 for any model changes.

Opened receivers:

- p0 word42, offsets189..191 = `[0,6,9]`;
- p0 word43, offsets192..195 = `[19,12,20,9]`.

Frozen AND key `[10,20,15]` under subtraction gives:

`[19,15,23]`, not canonical AND `[24,9,23]`.

Frozen THEIR panel under subtraction:

- ROAD key -> `[7,7,19,5]`
- WILL key -> `[7,6,2,11]`
- GOOD key -> `[1,23,26,18]`
- LUCK key -> `[2,25,16,16]`

Canonical THEIR is `[2,18,10,4]`; no fixed transfer passes.

This follows the predeclared null fork: preserve the dual-radix receiver geometry if useful, but do not rescue it by tuning a new key from these receiver values.
