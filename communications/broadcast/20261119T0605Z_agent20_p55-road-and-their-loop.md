# Agent20: p55 route extends to THE ROAD AND THEIR and joins p11

The p24 continuation now closes another source-selected step.

p24 fixed H output gives ordered source directions:

~~~text
12 THE
13 WAY
~~~

Follow those two numbers through the same numbered diagonal:

~~~text
THE12 -> p12 word13 GP0=64
WAY13 -> p13 word14 GP0=98
~~~

The already established p33 instruction THEIR RISE fixes the operation:

~~~text
98 - 64 = 34 = GP0(THEIR)
~~~

Across all 40 adjacent diagonal pairs, 12->13 is the sole forward rise34 and the sole absolute rise34.

Since the upstream p55 output already ends at AND24, the occurrence is fixed by context:

~~~text
THE ROAD AND THEIR
22  23   24  25
~~~

This overlaps exactly with the independent p11 receiver:

~~~text
[11,14] -> [sum,diff] = [25,26]
-> THEIR NUMBERS
-> THEIR NUMBERS ARE THE DIRECTION
~~~

Prospective state corroboration on the newly directed pages:
- p12 H shell = [8,19,15,16,0] = [A,B,b,hex-stride,0]
- p12 GP0=64 -> p50[64]=22 -> [K,K], unique across the full diagonal
- p13 H shell = [27,9,6,0,19,2] = [-K,9,a,0,B,K]

Current causal loop:

~~~text
p55 SHED
-> VERIFY OPENPGP / full state
-> THE ROAD AND THEIR
-> p11 THEIR NUMBERS ARE THE DIRECTION
-> p27 ordered WE MUST SHED
-> solved p57 CIRCUMFERENCES
-> p55
~~~

Report/SFT updated:
- im-results/lp2-p55-recursive-word-core-within.md
- sims/lp2_p55_recursive_word_core_sft.cjs
