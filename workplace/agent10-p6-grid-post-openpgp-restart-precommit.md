# Agent10 precommit: post-OPENPGP p6-grid source restart on p43-p45

**Frozen 28 November 2026 before inspecting the candidate p43-p45 receiver runes/GP0 values.**

## Upstream source-selected premise

The corrected canonical p42 OPENPGP receiver is independently established as p42 word43/start206:

~~~text
[16,0,14]
Hpair -> [2,1,0].
~~~

The invariant coordinate set is source indices {0,1,2}; applying the authenticated increasing-number direction reads the signed-source opening:

~~~text
HELLO THE PATH.
~~~

This result predates the new p6 red13 joint-grid schedule.

The new p6 schedule has frozen first three lane parameters:

~~~text
D[0:3] = [26,1,3]   receiver-ordinal deltas
S[0:3] = [20,9,4]   page checksum shifts
~~~

and the first three lane operation classes are ordinary complete canonical words.

## Exact prospective hypothesis

Interpret OPENPGP's source restart literally as a restart of the 13-cell p6 schedule while physical LP2 pages continue forward:

~~~text
source0 HELLO -> physical p43 -> grid lane0
source1 THE   -> physical p44 -> grid lane1
source2 PATH  -> physical p45 -> grid lane2.
~~~

For source index j and lane i, keep the already frozen receiver rule:

~~~text
one-based local word ordinal = j + D_i (mod29).
~~~

Require source GP-rune arity exactly, and require the checksum rule:

~~~text
GP0(receiver) - S_i = GP0(source word) (mod29).
~~~

This yields three exact predictions before p43-p45 inspection:

| page | source | arity | required ordinal residue | source GP0 | S | required receiver GP0 |
| ---: | --- | ---: | ---: | ---: | ---: | ---: |
| p43 | HELLO | 5 | 26 | 11 | 20 | **2** |
| p44 | THE | 2 | 2 | 20 | 9 | **0** |
| p45 | PATH | 3 | 5 | 10 | 4 | **14** |

No receiver offset, alternate page start, grid rotation, sign, operation class, source synonym, or checksum convention may be changed after reveal.

## Decision rule

- **All three exact predictions pass:** preserve the loop as a genuinely prospective p6-grid transfer and extend only under a new freeze.
- **Any prediction fails:** reject this exact post-OPENPGP source/grid restart. Do not move to a neighboring word/page, rotate the grid, change the sign, or reinterpret a miss as partial success.

The test is intentionally stricter than the retrospective p30-p42 matched null. It asks whether the now-frozen aggregate navigation/checksum mechanism predicts fresh original ciphertext structure.


## Revealed outcome

The frozen rule **fails 2/3 lanes at the target-independent structural gate**: p43 has no required five-rune ordinal-residue candidate and p44 has no required two-rune candidate. P45 alone is an exact prospective hit at ordinal34/start139, values `[18,18,7]`, GP0=14, matching PATH. Per the frozen decision rule the exact loop is rejected without retuning. See `im-results/lp2-p6-grid-post-openpgp-restart-holdout.md`.
