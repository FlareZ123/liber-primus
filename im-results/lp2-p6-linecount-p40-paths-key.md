# P6 visual balance and marked-title circumference reconstruct the p40 PATHS key

**Agent3, 28 November 2026; tightened independently by Agent22, 28 November; original-image/color correction and circumference charge by Agent3. Classification: source-visible exact-key reconstruction for the route-selected p40 PATHS candidate; extraction grammar remains post-discovery, so this is not yet an authenticated reusable key.**

## Why the key question is now isolated

The p28 D4 charge fixes the signed-source/project-page origin upstream. The p28 -> p29 -> p23 -> p25 route therefore selects authenticated source index40 `PATHS`, physical p40, and its unique complete length4/GP0=54 receiver at offsets71..74 before any local key is considered.

P6 is independently selected by `SEEKS=6` and `a=6`. Its red-title packet was already globally charged and is unique in printed order. The original scan (archive 23.jpg), canonical physical line breaks, and ink annotations therefore give a fixed first-party object from which to ask for the p40 key.

## Color-separated line balance

The red title occupies p6 rune offsets71..81 and is bounded by red 13-dot marks at offsets71 and82. The opening mark terminates the upper black block. The closing mark is on the **same physical line** as the title, immediately after the last red rune; seven black runes continue after it on that line.

Counting **black** runes per physical line on the two sides gives:

~~~text
before title: [20,24,24,3]
after title:  [7,19,20,24,22,22]
~~~

This corrects the earlier interim lower sequence `[18,19,20,24,22,22]`, which counted the 11 red title runes together with the 7 black continuation runes on the shared line.

Exactly one line count occurs **once on each side**:

~~~text
20.
~~~

So the physical page selects a balanced pair `[20,20]`. The other repeated counts do not satisfy the same relation: 24 occurs twice above and once below; 22 occurs only below.

## Marked title circumference

The four red words are:

~~~text
W1 [24,16,14,17]  length4
W2 [19]           length1
W3 [6,27,15,17]   length4
W4 [14,12]        length2
~~~

Their lengths are the established state packet:

~~~text
[4,1,4,2] = [q,1,q,K].
~~~

Among all adjacent title pairs, **W3/W4 is uniquely [q,K]**. Its outside circumference is therefore the two literal endpoints:

~~~text
printed: [W3.first,W4.last] = [6,12] = [a,aK].
~~~

The closing red13 marker sits immediately to the right of W4 on the same physical line. Reading this circumference from the marked edge inward yields:

~~~text
[12,6] = [aK,a].
~~~

This is the same numeric tail independently identified by Agent22's terminal/post-singleton anchors, but the `[q,K]` adjacency and circumference give a second source-structural reason for selecting exactly W3/W4.

Combining the balanced body counts and marked circumference gives the complete four-rune key:

~~~text
[20,20] || [12,6]
= [20,20,12,6].
~~~

No p40 rune value is used in this extraction.

## Finite charges

The original broad charge remains a discovery-order control. Choose any repeated p6 line count `r in {20,22,24}`, any ordered title atoms `x,y`, form `[r,r,x,y]`, test both signs: **243 distinct keys**. Grant every coordinate permutation: **1,389 distinct keys**, 52 with zero GP sum. Across the established **62** authenticated four-rune source/page pairs having exactly one complete same-GP0 receiver, both families have one hit:

~~~text
p40 PATHS
receiver [4,15,14,21]
subtract [20,20,12,6]
-> [13,24,2,15] = PATHS.
~~~

A tighter source-shape charge freezes balanced20 and tries every adjacent red-title pair in both circumference orientations:

~~~text
[20,20,24,19]  [20,20,19,24]
[20,20,19,17]  [20,20,17,19]
[20,20, 6,12]  [20,20,12, 6]
~~~

Across the same 62 pairs and both signs, the sole hit is again p40 PATHS, using the **closing-edge orientation of the unique [q,K] pair**.

A deliberately broad arithmetic null that lets each key coordinate independently draw from direct `K/e/g/a` values or those values multiplied by a visible title length gives 10,000 keys and three hits. Arbitrary p6 arithmetic is not identifying; the physical balance and marked-title geometry are the discriminating constraints.

## Exact inverse

~~~text
cipher [4,15,14,21]
key    [20,20,12,6]

cipher - key mod29
= [13,24,2,15]
= P A TH S
= PATHS.
~~~

Forward replay is exact. The historical H-shell relation still holds:

~~~text
H([20,20,12,6])
= [14,8,3,26]
= [-b,A,e,-e].
~~~

The shell is now a cross-check rather than the only route to the key coordinates.

## Evidence boundary

The causal route is materially tighter:

1. p28 selects the route-local signed register;
2. p25 selects PATHS40 and the unique p40 receiver;
3. p6 physical balance selects `[20,20]`;
4. the state-typed, closing-marked title circumference selects `[12,6]`;
5. exact subtraction returns PATHS.

The remaining objection is chronology. The balance/anchor/circumference grammar was recognized after the PATHS inverse was known. It is strongly source-constrained and removes the earlier free numeric H-role choice, but it is still post-discovery structural compression. Promotion to established plaintext/key requires a pre-existing authored instruction that explicitly selects this grammar or a fresh ciphertext receiver predicted under the frozen rule before opening it.

The prospectively frozen p41 VERIFY same-state transfer and the older sealed p42 OPENPGP same-state holdout are both negative; those failed receiver classes cannot be used as prospective confirmation.

## Reproduction

`node sims/lp2_p28_origin_selected_p29_p40_route_sft.cjs`
