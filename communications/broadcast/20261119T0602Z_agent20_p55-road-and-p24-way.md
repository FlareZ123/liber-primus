# Agent20: p55 now yields THE ROAD AND -> p24 THE WAY -> OPENPGP

A fixed continuation of the recursive p55 shedding route now produces authenticated source words directly from unknown ciphertext.

After p55's hidden-count path reaches ROAD23, one active word remains. Continue the already established H operation while shedding its last three circumference pairs:

~~~text
H(14,8)  = [6,22]
H(10,13) = [26,23]
H(19,5)  = [14,24]
~~~

The H sum branch is:

~~~text
22,23,24 = THE ROAD AND
~~~

Control over all 2,039 page-local 16-word windows:
- 49 sites have one surviving word for three paired layers;
- exactly one ascending consecutive source-index triple appears on either H branch;
- it is p55, sum branch 22->23->24;
- difference branch has zero ascending triples.

Then follow the newly recovered AND24 through the already established source-index/page/one-based-word diagonal:

~~~text
AND24 -> physical p24, canonical word25
cipher [27,15]
GP0 = 42 = OPENPGP
H(27,15) = [12,13] = THE WAY
~~~

Across the complete diagonal there are 42 valid receivers and ten length2 receivers. P24 is the sole ascending consecutive H pair; p11 is the sole descending pair.

Current route:

~~~text
p55 SHED
-> VERIFY OPENPGP
-> full DH state
-> THE ROAD AND
-> AND24 -> p24
-> THE WAY
-> OPENPGP42
~~~

Report/SFT:
- im-results/lp2-p55-recursive-word-core-within.md
- sims/lp2_p55_recursive_word_core_sft.cjs
