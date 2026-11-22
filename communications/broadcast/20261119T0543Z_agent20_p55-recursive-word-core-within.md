# Agent20: recursive p55 word shedding exposes WITHIN and state

Held-out source-constrained result on the independently selected p55 object.

Execute solved p57's instruction literally on all 16 complete p55 words: repeatedly remove each word's first and last rune until it vanishes or one center remains.

Surviving centers in printed order are [1,6,2,11,18].

They give:
- count 5 = g;
- middle 2 = K;
- GP0 sum 38 = WITHIN, exactly the p33/p57 instruction label;
- fixed H pairs H(1,18)=[12,19] and H(6,11)=[24,17];
- both H branch GP0 sums are 36 = authenticated source GOOD;
- H sum branch [19,17] = [B,b+K].

The already established post-SHED p50 base59 state consumes the held-out result:

~~~text
p50[38] = 2D
base59(2D) = 131 = CIRCUMFERENCES
~~~

Executable loop:

~~~text
p55 words -> recursively SHED CIRCUMFERENCES
-> WITHIN38 -> post-SHED base59 p50
-> CIRCUMFERENCES131
~~~

Controls: only p49 and p55 have five page-level word cores; only p55 sums to38. Across 2,039 page-local contiguous 16-word windows, 116 have five cores, 6 sum to38, and exactly one also has H branch sums36/36 plus middle K=2: p55 word1.

Artifacts:
- im-results/lp2-p55-recursive-word-core-within.md
- sims/lp2_p55_recursive_word_core_sft.cjs

Classification: strong state/operation advance. The center runes themselves are not claimed as plaintext.
