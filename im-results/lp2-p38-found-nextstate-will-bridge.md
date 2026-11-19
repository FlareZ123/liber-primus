# P38 FOUND successor: a reciprocal DH state packet selecting WILL

**Agent5, 19 November 2026. Classification: post-selection state/navigation advance.** The p38 FOUND route already selected the next complete word at offsets54..56 with a frozen base60 low-digit READ OUT operator before that word's values were used. The selected word is a compact DH-state packet, is the only reciprocal p50-low self-indexed complete word in the unknown manuscript, and its outer state fields uniquely select authenticated **WILL** by signed-message index and GP0. This supplies a concrete bridge from the p38 FOUND object into the independently source-constrained p0 YOU→WILL→BE→FOUND route. It does not itself decrypt a new LP2 receiver.

## Upstream selection is fixed

The existing p38 chain gives

~~~text
p38 FOUND receiver offsets49..53
GP0(cipher)=95
p50[95]=0Z
base60 low digit=35 -> authenticated word35 FOUND

GP0(FOUND)=36
p50[36]=0s
base60 low digit=54
-> next p38 complete word starts at54.
~~~

That next word was selected by the frozen READ OUT transfer before its rune values were interpreted.

Original p38 offsets54..56 are

~~~text
[5,12,19]
= [g, K*a, B].
~~~

Their GP0 sum is36.

## A unique reciprocal p50-low object

Let

~~~text
f(i) = base60 low digit of original p50[i].
~~~

The selected word satisfies both directions:

~~~text
f(GP0)=f(36)=54=start
f(start)=f(54)=36=GP0.
~~~

The cells are

~~~text
p50[36] = 0s -> low60 54
p50[54] = 2a -> low60 36.
~~~

Charge every complete unknown-page word whose GP0 and local start are both valid p50 addresses. There are 2,848 such words out of 2,928 complete words. Thirteen satisfy the first direction `f(GP0)=start`. Exactly **one** also satisfies the reverse direction: p38 offsets54..56.

The radix control is discriminating:

~~~text
base60: f(36)=54 and f(54)=36
base59: f(36)=53 and f(54)=36.
~~~

Thus the reciprocal closure holds only under the independently selected base60 low-digit convention.

It is also the only three-rune self-indexed word: among 726 complete three-rune words, only p38 offsets54..56 satisfies `f(GP0)=start`. The exact rune triple [5,12,19] occurs once in the manuscript even if all six permutations are accepted. Eleven of the 726 triples are composed entirely from the extended state pool `{p,g,a,b,A,B,K,K*a}`.

## The packet is a reversible H-state object

Under the frozen outside-in H map,

~~~text
H(g,B) || [K*a]
= H(5,19) || [12]
= [15,24,12]
= [b,-g,K*a].
~~~

So both direct and H coordinates are compact expressions in the independently reconstructed p28 state.

## Packet endpoints select WILL without LP2 plaintext

Use the same already selected base60 low-digit p50 operator on the packet's two outer state values:

~~~text
f(g=5)  = 57
f(B=19) = 33.
~~~

In the authenticated 2016 signed message:

~~~text
word index33 = WILL
GP0(WILL)    = 57.
~~~

Therefore the ordered pair `(g,B)` identifies WILL simultaneously by its GP0 and its signed-message index.

This is selective under a complete state-field charge. Across all 7×7=49 ordered pairs of the primary fields `{p,g,a,b,A,B,K}`, exactly one pair has the property

~~~text
f(first field) = GP0(signed word at index f(second field)).
~~~

It is `(g,B) -> WILL`. Adding the derived fields `K*a` and `K*g` gives 9×9=81 pairs and still exactly one hit.

The wider calibration over every ordered residue pair in GP29 has only three matches among 29²=841 possibilities:

~~~text
(g=5, B=19) -> WILL, GP0 57, index33
(28, A=8)   -> YOU,  GP0 30, index32
(28, b=15)  -> YOU,  GP0 30, index32.
~~~

Thus WILL is the only signed word selected by a unique residue pair, and its pair is exactly the packet's endpoints.

## Convention control

Repeat the 9×9 state-field charge under four ordinary p50 readings:

~~~text
base60 low digit: one hit, (g,B) -> WILL
base59 low digit: one hit, (K,p) -> ARE
base60 full value: zero hits
base59 full value: zero hits.
~~~

The p38 READ OUT route had already selected base60/low before this packet was opened. Under that frozen convention, the packet endpoints select WILL rather than the base59 rival.

## Connection to the existing p0 route

The signed source around the selected index is

~~~text
index32 YOU
index33 WILL
index34 BE
index35 FOUND.
~~~

The repository already has an independent source-constrained local route from authenticated YOU to the p0 WILL receiver at offsets141..144:

~~~text
YOU -> GP0 30 -> p50[30]=2L
-> base60/zero offset141
-> p0 WILL under a p28 DH key.
~~~

It also has a downstream WILL→BE navigation check, followed by the separately source-constrained WILL→BE→FOUND p0 receiver route.

The new packet therefore supplies a source-state bridge

~~~text
p38 FOUND
 -> frozen READ OUT
 -> p38 state word [g,K*a,B] at54
 -> endpoints (g,B)
 -> p50-low pair (57,33)
 -> authenticated WILL
 -> existing YOU→WILL p0 route
 -> p0 WILL / BE / FOUND chain.
~~~

No new p0 offset rule is introduced here. The bridge consumes the previously established local YOU→WILL mechanism exactly as documented.

## Additional low-digit dynamics

Two state residues enter the selected 54↔36 cycle:

~~~text
K*g=10 -> 36 -> 54 -> 36 ...
B=19   -> 33 -> 54 -> 36 -> 54 ...
~~~

Among all starting residues0..28, only 10 and19 ever enter that two-cycle. The B branch is the one that passes through signed index33 WILL before entering it. This is a compact description of the local automaton, not an instruction to iterate arbitrary p50 states.

## Decision

Promote offsets54..56 from a merely selected next word to a **source-connected DH state packet**. Its reciprocal p50-low closure and its endpoint selection of WILL are both exact, finite, and use conventions fixed upstream.

Keep the claim at the navigation/state level. The endpoint interpretation was discovered after opening the selected word, and this result does not produce a new ciphertext plaintext pair. The next useful test is whether the packet's middle field `K*a` or its H-state `[b,-g,K*a]` has an independently selected consumer, rather than inventing one from the table.

## Reproduction

~~~text
node sims/lp2_p38_found_nextstate_will_bridge_sft.cjs
~~~
