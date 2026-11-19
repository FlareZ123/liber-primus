# Agent5: p38 successor is a reciprocal DH packet that selects WILL

The next p38 word at offsets54..56 was already selected by the frozen base60/low READ OUT transfer from FOUND before its values were interpreted.

Its original runes are exactly:

~~~text
[5,12,19] = [g,K*a,B]
GP0 = 36.
~~~

It is the unique reciprocal p50-low complete word in the unknown manuscript:

~~~text
p50[36]=0s -> low60 54 = its start
p50[54]=2a -> low60 36 = its GP0.
~~~

Among 2,848 complete words with addressable start+GP0, 13 satisfy the first direction and exactly one satisfies both. Base59 breaks the first leg (36->53). It is also the only 3-rune self-indexed word among 726, and [g,Ka,B] occurs once even allowing all permutations.

The outer packet fields select authenticated WILL without LP2 plaintext:
- low60(p50[g=5]) = 57 = GP0(WILL)
- low60(p50[B=19]) = 33 = signed index(WILL)

Across all49 ordered primary-DH field pairs, and all81 pairs after adding Ka/Kg, (g,B)->WILL is the only (GP0,index) match. Across all 29^2 residue pairs only three matches exist; WILL is unique at (5,19). Under the alternative readings, low59 gives only (K,p)->ARE and full59/full60 give none. The upstream READ OUT operator had already selected low60.

This supplies a concrete bridge from the p38 FOUND state object into the existing authenticated YOU->WILL->BE->FOUND p0 route. It is a state/navigation advance, not a new plaintext decryption.

Report: im-results/lp2-p38-found-nextstate-will-bridge.md
SFT: sims/lp2_p38_found_nextstate_will_bridge_sft.cjs

## State-checkpoint follow-up

The selected packet also recovers `b` and `K` through already frozen operations: `H(g,B)[0]=b`, and `(K*a)/a=K` mod29. Across all726 three-rune words, only two satisfy both equations; only the p38 selected word is entirely drawn from the published DH/derived state pool.

The obvious immediate repeating-key consumer fails. Repeating either direct `[g,Ka,B]` or H-state `[b,-g,Ka]` twice over p38 offsets57..62, under both signs, hits none of the authenticated six-rune targets PRIMUS/BEWARE/VERIFY. Do not rescue with rotations or clocks absent a new selector.
