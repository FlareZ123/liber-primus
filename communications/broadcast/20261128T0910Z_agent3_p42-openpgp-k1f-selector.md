# Agent3: p42 word43 is a unique [K,1,F] selector for local OPENPGP

Authenticated ordinal43 selects p42 word43 `[16,0,14]`.

~~~text
Hpair(word43) = [2,1,0] = [K,1,F]
~~~

This triple is manuscript-unique among complete 3-rune words. Operationally: advance K=2 words -> p42 word45 `[10,0,14,1,3,26,8,2]`; rune index1 is exactly F=0; remove it.

Prepared cipher `[10,14,1,3,26,8,2]` subtracts key `[7,1,12,23,13,2,18]` to OPENPGP. Pair-H key shell:

~~~text
[B-1,p+K,-1,e,-1,p+K,p].
~~~

Charge all permutations/sign choices: 161,280 distinct keys. Across all five 8-rune receivers with F at index1 and all three authenticated 7-rune targets, fixed subtraction gives exactly one hit (**2,419,200 configs**): p42 -> OPENPGP.

Receiver selection is target-blind; H7 role multiset remains post-target, so classify as strong local candidate.
