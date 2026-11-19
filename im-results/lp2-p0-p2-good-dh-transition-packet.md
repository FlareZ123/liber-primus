# P0→P2 GOOD: a local DH key-transition packet with a failed p4 recurrence

**Agent5, 19 November 2026. Classification: retrospective cross-receiver mechanism compression with one prospectively failed recurrence.** Two independently selected GOOD candidates on p0 and p2 have exact local inverse keys from different upstream constructions. Their original ciphertexts and keys are related by one compact p28 DH-state packet. The packet is uniquely realized by an ordered four-rune manuscript pair, while the first frozen attempt to iterate it to p4 fails completely. Preserve the p0↔p2 relation locally; do not promote a page-to-page cipher recurrence.

## Frozen objects

The reconstructed p28 state is

~~~text
p=23, g=5, a=6, b=15, A=8, B=19, K=2
H(x,y)=(x-y,x+y) mod29.
~~~

The two candidate GOOD inverses were developed independently:

~~~text
p0 offsets49..52:
C0 = [24,21,26,14]
K0 = [18,18,23,20]
C0 - K0 = [6,3,3,23] = GOOD

p2 offsets36..39:
C2 = [1,2,8,26]
K2 = [24,28,5,3]
C2 - K2 = [6,3,3,23] = GOOD.
~~~

Here K0 and K2 are the additive encryption keys, so equal candidate plaintext implies C2-C0 = K2-K0 without consuming the plaintext values again.

## Direct original-cipher state packet

The exact difference is

~~~text
C2 - C0
= K2 - K0
= [6,10,11,12]
= [a, K*g, B-A, K*a] mod29.
~~~

Under the frozen outside-in H map the same packet is

~~~text
H_shell([6,10,11,12])
= [23,18,28,21]
= [p, A-B, g-a, p-K].
~~~

Thus both direct and H coordinates reduce to four previously reconstructed p28 state quantities.

Apply the fixed direct delta [6,10,11,12] to every complete page-local four-rune fragment and ask whether the predicted four-rune sequence occurs anywhere else in the unknown manuscript. There are 514 fragments, hence 264,196 ordered pairs. Exactly one pair matches:

~~~text
p0 offsets49..52 -> p2 offsets36..39
[24,21,26,14]   -> [1,2,8,26].
~~~

This control uses original ciphertext only after the state packet is frozen.

## Signed-permutation calibration

The order and signs were recognized after both candidate keys were known. Charge every permutation of the four source values {a, K*g, B-A, K*a} and every independent sign choice. The 384 distinct numeric vectors have manuscript-wide pair-hit counts:

~~~text
0 pair hits: 248 vectors
1 pair hit : 118 vectors
2 pair hits: 18 vectors.
~~~

The selected p0→p2 receiver pair is reached by exactly one member of this family:

~~~text
+[a, K*g, B-A, K*a]
= [6,10,11,12],
~~~

and that vector has one manuscript pair hit total.

The family calibration matters: a one-pair delta is not rare inside this post-discovery family. The useful statement is the source compression and exact selected-pair identity, not a stand-alone probability claim.

## Three-key transition chain

A previous independent local result linked center-dropped FOUND to p0 GOOD. Using the established keys,

~~~text
drop_center(K_FOUND) = [12,28,1,8]

T0 = [a, B, HERE[B], K*a]
   = [6,19,22,12]

drop_center(K_FOUND) + T0
= [18,18,23,20]
= K0.
~~~

The new p0→p2 GOOD packet is

~~~text
T1 = [a, K*g, B-A, K*a]
   = [6,10,11,12]

K0 + T1
= [24,28,5,3]
= K2.
~~~

The transition packets themselves differ only in their two middle coordinates:

~~~text
T1 - T0
= [0,20,18,0]
= [0, DH-line[p], A-B, 0].
~~~

The source values are original p28 data: one-based HERE-line[B]=22 and literal-DH-line[p]=20. This compresses three exact candidate inverse keys into one short local state sequence.

Two numerical closures are descriptive and were recognized after the keys:

~~~text
sum(T0) = 59
sum(T1) = 39.
~~~

The first equals the independently selected post-MUST radix; the second equals the p2 GOOD receiver endpoint and the conventional value of p50[GP0(GOOD)=35]=0d.

## Prospective recurrence gate: FAIL

Before inspecting p4 for a continuation, freeze the simplest recurrence suggested by the two observed transition packets:

1. advance the physical page by K=2, p2 -> p4;
2. update the transition again by [0,DH[p],A-B,0];
3. apply the resulting packet to K2;
4. predict another GOOD ciphertext from the unchanged canonical GOOD plaintext.

This gives

~~~text
T2 = T1 + [0,20,18,0]
   = [6,1,0,12]

K4(predicted) = K2 + T2
              = [1,0,5,15]

C4(GOOD predicted)
= GOOD + K4
= [7,3,8,9].
~~~

Physical p4 contains 13 complete four-rune fragments. None equals [7,3,8,9]. The predicted sequence occurs **zero times among all 514** complete unknown-page four-rune fragments.

The same frozen p0→p2 delta also sends the p0 LUCK and PATHS receivers to sequences absent from p2. This is a decisive rejection of the naive reusable +K-page recurrence.

## Decision

Preserve the p0↔p2 GOOD relation as a compact local cross-receiver state bridge. It has three useful properties: the plaintext cancels from the original-cipher equality, the fixed packet has one ordered-pair hit manuscript-wide, and it advances the independently proposed exact keys exactly.

Keep the mechanism local. The p4 holdout rejects iteration of the middle-state update as a reusable page+K cipher. A future upgrade requires an independently sourced instruction that specifies the transition packet or selects another receiver before its ciphertext is opened.

## Reproduction

~~~text
node sims/lp2_p0_p2_good_dh_transition_packet_sft.cjs
~~~
