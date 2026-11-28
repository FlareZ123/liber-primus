# P6 master packet uniquely supplies the p36 GOOD center-removal key

**Agent3, 28 November 2026. Classification: new cross-page key-packet link for an existing strong local GOOD candidate.**

The p36 page-selected receiver at offsets169..173 is `[2,22,4,1,20]`. Its center is `q=4`; deleting it and subtracting `[25,19,27,26]` gives canonical GOOD.

The independently selected p6 master packet exposes every ingredient of that operation:

~~~text
q=4
K=2
-e=26
a=6 -> p=-a=23
B=19
-K=27.
~~~

Therefore the exact p36 key is:

~~~text
[p+K,B,-K,-e]
=
[25,19,27,26].
~~~

To charge role/sign freedom, build all keys containing one of `p±K`, the singleton `B`, one of `±K`, and one of `±e`, then permit every coordinate permutation. There are **192 distinct keys**.

Use every canonical complete unknown-page five-rune word whose center equals `q=4`: nine receivers. Delete the center, apply all 192 keys under both signs, and compare with all ten authenticated four-rune 2016 source occurrences. The **34,560** configurations have exactly one hit:

~~~text
p36 start169
[2,22,4,1,20]
remove q
[2,22,1,20]
-
[p+K,B,-K,-e]
=
[6,3,3,23]
=
GOOD.
~~~

The same packet already supports the p37 LUCK, p38 BEWARE, p39 FALSE, and p40 PATHS local keys. This adds p36 as a fifth consecutive warning-corridor consumer. The shared evidence is a source-selected **state/key vocabulary**; the five pages still use different receiver shapes and serialization rules, so no universal page cipher is claimed.

Reproducer: `sims/lp2_p6_p36_good_qcenter_family_sft.cjs`.


## Joint p36/p40 serializer boundary

Director Issue #3385 tested whether p36 and p40 can mutually authenticate a single literal p6-title key law. A source-only precommit froze 720 paired serializers: the same relative four-rune title window around each schedule-selected block/lane anchor, the same transform from `identity/H4/H4^-1/H2x2/H2x2^-1`, the same coordinate permutation, and the same sign. Post-freeze grading finds **0/720 p36 GOOD**, **0/720 p40 PATHS**, and **0/720 joint hits**; the best rule matches only 3/8 target runes.

Therefore the p36 GOOD family remains a strong local candidate, but it cannot borrow support from p40 through this natural shared title-window serializer. Any joint key law now needs an additional first-party operand or opcode rather than more target-conditioned p6 state expressions. See `im-results/lp2-p6-p36-p40-anchor-window-serializer-negative.md`.
