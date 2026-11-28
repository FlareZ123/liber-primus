# Post-OPENPGP p6-grid restart holdout: exact three-lane loop rejected

**Agent10, 28 November 2026. Classification: genuinely prospective original-cipher negative with one isolated exact lane hit. The hypothesis was committed before p43-p45 receiver runes/GP0 values were inspected.**

## Precommit

Commit `0b38c387aa11deeabacfaa6ebbba961154467695` froze the exact continuation.

Upstream, the independently established p42 OPENPGP object has:

~~~text
p42 word43 [16,0,14]
Hpair -> [2,1,0].
~~~

The invariant source-index set is {0,1,2}; increasing number direction reads `HELLO THE PATH`.

The new p6 joint grid has frozen first-three lanes:

~~~text
D = [26,1,3]
S = [20,9,4].
~~~

The precommit required the source restart to continue on physical p43-p45 while the p6 grid restarts at lane0:

| page | source | arity | ordinal residue | required receiver GP0 |
| ---: | --- | ---: | ---: | ---: |
| p43 | HELLO | 5 | 26 | 2 |
| p44 | THE | 2 | 2 | 0 |
| p45 | PATH | 3 | 5 | 14 |

All three had to pass. Any miss rejected the exact loop; neighboring words/pages, phase rotations, sign changes and operation changes were forbidden after reveal.

## Reveal

### P43 / HELLO

There is **no** complete five-rune p43 word whose one-based local ordinal is 26 mod29. The hypothesis fails before any GP0 comparison.

### P44 / THE

There is **no** complete two-rune p44 word whose one-based local ordinal is 2 mod29. Again the hypothesis fails before GP0 comparison.

### P45 / PATH

There is exactly one structural candidate:

~~~text
p45 ordinal34
34 mod29 = 5
start139
cipher [18,18,7]
GP0 = 14.
~~~

This is an exact match to the frozen PATH lane, including arity, ordinal residue and GP0.

## Decision

~~~text
required exact lanes: 3 / 3
observed exact lanes: 1 / 3
decision: REJECT
~~~

The literal rule `OPENPGP restart -> source0/page43 + grid-lane0 restart` is false.

The p45 PATH event is a real prospective hit and should remain recorded, but the precommit explicitly forbids turning a one-lane success into a new phase rule after two earlier structural failures. Do not skip HELLO/THE, move the page start to45, or rotate the grid to rescue it.

## Consequence for the checksum/navigation model

The p30-p42 matched-null positive remains unchanged. This holdout adds an important boundary: **the aggregate p6 navigation/checksum schedule does not simply cycle after OPENPGP, even though OPENPGP independently points to the authenticated source opening.**

Any continuation now needs a distinct first-party transition rule. The terminal source restart and the p6 13-cell state machine are separate facts until an original clue specifies how to connect them.

## Reproduction

~~~text
node sims/lp2_p6_grid_post_openpgp_restart_holdout_sft.cjs
~~~
