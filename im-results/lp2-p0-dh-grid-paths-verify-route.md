# P0 DH coordinate selects NUMBERS, a local PATHS inverse, and VERIFY

**Agent3, 19 November 2026. Classification: source-selected navigation with one newly charged local PATHS key mechanism. The upstream receiver and DH state are fixed independently. The exact two-token PATHS serializer was recognized after the PATHS key was known, so its finite-family uniqueness is supporting evidence rather than a blind discovery. A locked continuation fails, which bounds this as a local mechanism instead of a warning-packet scheduler.**

## 1. Frozen upstream object

The independently sealed ROAD/NUMBERS receiver on p0 is words42/43:

~~~text
word42 offsets189..191 length3 values [0,6,9]
word43 offsets192..195 length4 values [19,12,20,9]
~~~

Their raw coordinate sums are:

~~~text
15
60 = 2 mod29
~~~

so the receiver emits:

~~~text
[15,2] = [b,K].
~~~

This is exactly the first outer-H state on physical p28 line6:

~~~text
DH = [23,8]
H(D,H) = [15,2]
H^-1([15,2]) = [23,8] = DH.
~~~

The Critic's expanded 69,120-case audit of the authenticated 2016 sentence independently reconstructs the same roles from zero-based signed-word positions:

~~~text
b = WORDS = 15
K = PATH  = 2
~~~

That source-role result is useful provenance for the numbers. The present mechanism does not rely on interpreting the signed aphorism's pronoun "Its" as referring to the signed message; earlier Director work correctly records that it refers to Liber Primus.

## 2. The state is a native 32x8 table coordinate

The p50 numerical object is visibly 32 rows by 8 columns. Treat the frozen ordered H state as zero-based [row,column]:

~~~text
[b,K] = [15,2]
address = 15*8+2 = 122
p50[122] = 1Q.
~~~

The complete p28 line6 outer-H sequence is:

~~~text
[15,2], [14,4], [12,12], [23,12], [8,19].
~~~

Only the first two fit the table width. Reversing the pair is invalid for both because columns15/14 exceed7. The selected first pair is fixed by p0 before this coordinate interpretation.

The already supported native-base60 low-digit transition gives:

~~~text
p50[122] = 1Q
low60(Q) = 26.
~~~

Authenticated signed word26 is literally:

~~~text
NUMBERS.
~~~

This is a semantic check, not a new operator selector: the low-digit operation was already selected independently.

## 3. NUMBERS immediately reselects the warning-packet PATHS receiver

At the emitted state26:

~~~text
p50[26] = 2r.
~~~

Its conventional base60 value is:

~~~text
2*60 + 53 = 173.
~~~

Offset173 is exactly the independently fixed start of the logical four-rune PATHS segment inside the source-selected p0 warning packet:

~~~text
p0[173..176] = [22,8,20,28].
~~~

This is a local cross-object receiver coincidence. The broad rule "p50 full value is an LP2 offset" remains rejected globally; the relevance here comes from an upstream-selected coordinate landing on a receiver already fixed by independent packet geometry.

The only rival geometrically valid p28 H coordinate behaves differently:

~~~text
[14,4] -> address116 -> p50[116]=0s
low60(s)=54
p50[54]=2a
base60(2a)=156.
~~~

Offset156 is not a p0 complete-word start and is not a warning-packet boundary.

## 4. The two selected table tokens generate the published PATHS key shell

Represent each selected p50 token by:

~~~text
(high digit, low base60 digit mod29)
~~~

and orient the pair as (low,high), because low is the already selected transition component.

For the two source-selected tokens:

~~~text
1Q -> (high,low mod29) = (1,26)
2r -> (high,low mod29) = (2,24).
~~~

Use the frozen H first coordinate, equivalently the directed difference low-high, on each token:

~~~text
26-1 = 25
24-2 = 22.
~~~

Then retain the second token's oriented numeric pair:

~~~text
[24,2].
~~~

The resulting four-state shell is:

~~~text
[25,22,24,2].
~~~

This is exactly the independently published outside-in H shell of the PATHS key. Inverting H pairwise gives:

~~~text
H^-1_shell([25,22,24,2])
= [9,13,18,13].
~~~

Apply that key only after the receiver and shell have been obtained:

~~~text
cipher p0[173..176] = [22,8,20,28]
key                  = [ 9,13,18,13]
subtract mod29       = [13,24, 2,15]
                      = PATHS.
~~~

Forward replay is exact.

A source-word-position curiosity is that the recovered key values index the authenticated words:

~~~text
9  -> LIBER
13 -> WAY
18 -> MAP
13 -> WAY.
~~~

This reading is retained only as corroborative structure. It was not used to choose the serializer.

## 5. Retrospective serializer-family charge

The exact serializer above was recognized after PATHS and its key were already known. Charge the nearest finite family instead of treating that formula as self-authenticating.

For each of the two selected tokens:

- scalar choices: high, low, low-high, low+high;
- token order: forward or reversed;
- final pair source: first or second token;
- final pair form: high/low, low/high, H(high,low), or H(low,high);
- both additive signs;
- all nine distinct authenticated four-rune signed-word targets.

This gives 256 labeled shell serializers before sign/target scoring, 248 distinct shells.

Exactly one configuration decrypts the selected receiver to any authenticated target:

~~~text
token order     forward
scalar0         low-high
scalar1         low-high
final pair      second token, low/high
shell           [25,22,24,2]
H^-1 key        [9,13,18,13]
sign            subtraction
target          PATHS.
~~~

Across all 256 possible table start addresses, the exact serializer has three authenticated-target hits. They are not independent mechanisms: cells52,122,130 all contain the duplicate token 1Q, all transition to state26, all consume the same 2r token, and all therefore produce the same receiver/key/PATHS inverse. The upstream DH coordinate selects address122 before this duplication is inspected.

## 6. Locked transfer: the serializer is local, not a packet scheduler

After finding the PATHS rule, freeze it unchanged and advance along the same low-digit walk.

The consecutive pairs are:

~~~text
122: 1Q -> 26: 2r   -> receiver173 -> PATHS
26:  2r -> 53: 2p   -> receiver171 -> no authenticated four-rune target
53:  2p -> 51: 0x   -> receiver59  -> no authenticated four-rune target
51:  0x -> 59: 19   -> receiver69  -> no authenticated four-rune target
59:  19 -> 9:  49   -> receiver249 -> no authenticated four-rune target
~~~

Therefore this rule does not solve the OPENPGP/VERIFY/BEWARE keys and does not satisfy the previously failed common-scheduler gate. Do not retune it pair by pair.

## 7. Continued low-digit navigation separates VERIFY from the false-path trap

Although the PATHS serializer stops, the independently selected low-digit navigation itself continues:

~~~text
selected [15,2]:
122 -> 26 -> 53 -> 51 -> 59 -> 9 -> 9
~~~

The first authenticated source GP0 state reached after the intermediate unlabeled states is:

~~~text
59 = GP0(VERIFY).
~~~

The rival valid coordinate is:

~~~text
[14,4]:
116 -> 54 -> 36 -> 54
~~~

where:

~~~text
54 = GP0(ROAD) = GP0(PATHS)
36 = GP0(FOUND).
~~~

Thus the only rival table-compatible p28 H pair immediately enters the already established ROAD/PATHS <-> FOUND false-path cycle.

Charge the 16 nearby table-transition modes:

- radix base60/base59;
- low/high token component;
- zero/one address origin;
- zero/one digit origin.

Require both:

1. the selected branch's first authenticated-vocabulary hit is VERIFY;
2. the rival branch is exactly 54 -> 36 -> 54.

Exactly one of 16 survives:

~~~text
base60 / low component / zero address / zero digit.
~~~

VERIFY is not globally rare in the table graph: 190/256 starts eventually reach59 and 79/256 have VERIFY as their first authenticated-vocabulary hit. The evidence is the source-selected two-branch discrimination, not a small random probability for VERIFY.

## 8. VERIFY recovers B and rejoins the source-only WILL route

A separately established invariant at VERIFY is:

~~~text
GP0(VERIFY)=59
p50[59]=19
literal 19 = DH field B.
~~~

Horizontal reflection to cell60 preserves B only under the native base60 reading; among authenticated source-word addresses this VERIFY/B invariant is unique.

The source-derived DH state already gives g=5. Under the fixed low-digit operation:

~~~text
p50[g=5]  = 3v -> 57 = GP0(WILL)
p50[B=19] = 0X -> 33 = signed index(WILL).
~~~

Across all ordered primary-DH field pairs, (g,B) is the only pair selecting one authenticated word simultaneously by GP0 and signed index.

This gives a new upstream path into the existing p0 WILL candidate that does not require the p38 unknown-page reciprocal packet. The WILL inverse and its key grammar remain classified exactly as in the established report: strong source-constrained candidate, not promoted plaintext.

## 9. Decision

Preserve the bounded route:

~~~text
sealed p0 [3,4] receiver
 -> raw sums [15,2] = [b,K] = H(DH)
 -> original 32x8 coordinate [15,2]
 -> cell122 = 1Q
 -> low digit 26 = signed NUMBERS
 -> cell26 = 2r
      | full base60 173 + charged two-token shell -> local PATHS inverse
      | continued low-digit walk -> VERIFY
 -> VERIFY/B invariant -> B
 -> (g,B) -> WILL selector
~~~

What changed:

- PATHS now has a compact source-connected receiver+key route from a p0 object whose geometry was sealed upstream.
- The route also explains why the selected coordinate belongs on the VERIFY side of the established false-path split.
- A source-only path now reaches the existing WILL selector without the p38 packet.

What remains open:

- the exact PATHS serializer is retrospective in discovery chronology;
- its unchanged continuation fails immediately, so it is not a reusable packet scheduler;
- full-base60-to-p0 addressing remains local, not globally licensed;
- no new OPENPGP/VERIFY/BEWARE plaintext is recovered;
- WILL remains candidate plaintext under its existing familywise caveats.

## Reproduction

~~~text
node sims/lp2_p0_dh_grid_paths_verify_route_sft.cjs
~~~
