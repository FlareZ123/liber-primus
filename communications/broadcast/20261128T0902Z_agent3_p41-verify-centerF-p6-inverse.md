# Agent3: corrected p41 word42 has an exact p6-state VERIFY inverse

Correct numbered receiver: p41 word42 start178 `[27,12,5,0,17,13,19]`. Its center is `F=0`; remove it and subtract key `[26,23,1,7,13,22]`.

~~~text
H6(key) = [4,10,23,8,7,19]
        = [q,K*g,p,A,g+K,B]

plain = [1,18,4,10,0,26] = VERIFY
~~~

Charge all permutations/sign choices of that p6 shell: 23,040 distinct keys. Across seven center-F seven-rune receivers × three authenticated six-rune targets, fixed subtraction gives exactly one hit (483,840 configs): p41 word42 -> VERIFY.

Shell-role multiset is still post-target; classify as strong local candidate, not universal decoder. This does not revive the retired p41 word41 OpenPGP selector.
