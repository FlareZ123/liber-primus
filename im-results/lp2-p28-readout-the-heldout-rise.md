# Frozen THEIR RISE predictor unexpectedly extends p28 READ OUT to READ OUT THE

**Agent1, 19 November 2026. Classification: held-out local plaintext recovery candidate with a source-derived exact key and manuscript-unique ciphertext packet.** A p34 BE family test was frozen in code with a hard assertion that signed/page index28 THE would have no exact receiver. Windows CI run **44459406789** failed that assertion: the unchanged predictor hit p28 word29 at offset140. That word begins immediately after the already source-selected p28 READ OUT object ends at offset139. The exact recovery is therefore:

```text
READ OUT + THE
= READ OUT THE
```

The p28 output was not selected after inspecting p28 word29. It was exposed by a failed holdout assertion under a rule fixed to resolve p34 BE.

## Frozen source rule

P33 independently yields:

```text
THEIR RISE
```

Authenticated THEIR positions19 and25 fix the literal rise:

```text
rise = 25 - 19 = 6 = a.
```

For an authenticated two-GP-rune source word `W_i=[u,v]` whose `i+6` partner exists, define:

```text
r_i = GP0(W_{i+6}) - GP0(W_i) mod29.
```

A same-state two-rune additive key has H-sum zero, so the frozen p34 rule was:

```text
H(key) = [r_i,0]
key    = H^-1([r_i,0])
cipher = W_i + key mod29.
```

The H orientation and +6 direction were already fixed before p28 was opened by this test.

## The p28 prediction

Authenticated source index28 is:

```text
28 THE = [2,18]
```

and its fixed +6 partner is:

```text
34 BE = [17,18].
```

Their raw GP0 rise is:

```text
GP0(BE) - GP0(THE)
= 35 - 20
= 15
= b.
```

Therefore the frozen rule predicts:

```text
H(key) = [b,0] = [15,0].
```

Since `2^-1=15 mod29`:

```text
key = H^-1([15,0])
    = [22,7]
    = [p-1,g+K].
```

Apply that key to source THE:

```text
THE       [ 2,18]
key       [22, 7]
----------------
predicted [24,25] mod29.
```

The original p28 canonical word list contains exactly:

```text
word27 offsets131..134 [3,19,15,9]
word28 offsets135..139 [28,24,10,1,20]
word29 offsets140..141 [24,25]
word30 offsets142..145 [11,14,27,0]
word31 offsets146..150 [10,18,13,28,8]
```

Thus the prediction lands exactly on p28 **word29**, starting at offset140.

Subtract:

```text
[24,25] - [22,7] mod29
= [2,18]
= THE.
```

Forward reconstruction is exact.

## It is immediately adjacent to the existing READ OUT object

The current p28 READ OUT source object is:

```text
exact center offset134 = [9]
one-based word28 offsets135..139 = [28,24,10,1,20].
```

The independently sourced exponents `[e,-K]=[3,27]` give:

```text
offset134..139
[9,28,24,10,1,20]
 -> [4,28,23,3,1,16]
 -> READOUT.
```

The newly predicted THE receiver begins at the **next rune offset, 140**. The local chain is therefore physically contiguous:

```text
offsets134..139 -> READ OUT
offsets140..141 -> THE
```

or:

```text
READ OUT THE
```

The two pieces use independently source-derived reversible operations. No search for an English continuation is involved in the second step.

## Complete two-rune THEIR RISE family

The authenticated source has nine two-GP-rune words whose +6 partner exists:

```text
1  THE -> 7  THE      rise  0
7  THE -> 13 WAY      rise  A=8
11 IS  -> 17 THE      rise 24=p+1
12 THE -> 18 MAP      rise  7=g+K
17 THE -> 23 ROAD     rise  g=5
21 IS  -> 27 ARE      rise 21
22 THE -> 28 THE      rise  0
28 THE -> 34 BE       rise  b=15
34 BE  -> 40 PATHS    rise  B=19
```

For every row, freeze the exact same computation:

```text
key = H^-1([rise,0])
predicted cipher = source + key mod29
search only physical page = source index.
```

Exactly two forward-rise predictions hit:

```text
p28 THE -> word29 start140
p34 BE  -> word3  start4
```

The seven other source rows miss.

Charge the opposite rise sign as well. All nine reverse-sign predictions miss. The literal forward RISE direction therefore contains both hits and the opposite sign contains none.

The two successful rise coordinates are exactly Bob's authenticated DH private/public pair:

```text
p28 rise = b = 15
p34 rise = B = 19.
```

Their H-inverse keys are the compact paired state forms:

```text
H^-1([b,0]) = [22,7] = [p-1,g+K]
H^-1([B,0]) = [24,5] = [p+1,g].
```

This is a finite family observation. It is not an authorship probability.

## Manuscript-wide exact-packet control

The p28 rule predicts exact ciphertext packet:

```text
[24,25].
```

Across all unknown physical pages p0..p55 there are **473 complete canonical two-rune words**.

The exact ordered packet `[24,25]` occurs once:

```text
p28 word29, start140.
```

Thus the held-out prediction is manuscript-wide unique under the complete two-rune-word census.

## Page / word / source self-location and the +a three-page chain

The held-out receiver has an additional source-visible alignment that was not part of the prediction:

```text
physical LP2 page number = 29   (project p28)
canonical p28 word number = 29
authenticated source word number = 29 = THE
```

This is a three-way 29 self-location. The recovered word is not merely somewhere on p28: it is **word29**, exactly the one-based signed position of THE.

The next authenticated source word is one-based word30 = DIRECTION.

The same THEIR RISE step also generates the complete same-index stride:

```text
source/project index28 THE
             +6
source/project index34 BE
             +6
source/project index40 PATHS.
```

The first two members are the exact additive recoveries documented here and in the p34 report. The third member, p40 PATHS at start71, was independently recovered before this chain was noticed. Thus the authored rise `a=6` lands on three matching source/page plaintext candidates in succession:

```text
p28 THE
p34 BE
p40 PATHS.
```

The two direct rise-derived keys occur on the first two steps, whose GP0 rises are exactly Bob's DH pair `b -> B`. The p40 plaintext uses its independently established local shell rather than a repaired extension of the two-rune rule.

This three-page stride is cross-route corroboration. Do not force the two-rune key formula onto p40's four-rune target.

## Relationship to the authenticated DIRECTION route

The recovered local token is source word28 THE. In the authenticated signed message its immediate follower is:

```text
29 DIRECTION.
```

A separate p32/p33 source route already maps the clause:

```text
THE22 -> THE28
ROAD23 -> DIRECTION29
```

under the same +6 THEIR RISE operation.

The new physical p28 recovery therefore supplies a much more literal local instruction path:

```text
p28 READ OUT
 -> immediately adjacent THE
 -> authenticated THE28
 -> immediate source follower DIRECTION29
 -> p29.
```

Semantically this reads:

```text
READ OUT THE DIRECTION
```

The word DIRECTION is source-authenticated rather than claimed as local p28 plaintext.

This convergence strengthens the existing p29 selector without requiring the more distant p28 word31 THE receiver as the sole local bridge.

## Holdout chronology

This result has unusually clean discovery chronology.

The p34 BE selector was implemented with a family assertion expecting:

```text
p28 THE -> no hit
p34 BE  -> start4 hit.
```

Windows Node22 run **44459406789** failed because actual p28 output was:

```text
p28 THE -> start140 hit.
```

Only after that failure was p28 word29 inspected as a continuation of READ OUT.

The CI failure therefore preserves the pre-result expectation inside the repository history. This does not prove authorship, while it substantially reduces the usual retrospective-language-fit objection.

## Evidence boundary

Preserve the following as a **strong held-out local plaintext recovery candidate**:

```text
THEIR RISE
 -> +6 source operation
 -> THE28 -> BE34 gives rise b
 -> H^-1([b,0]) = [p-1,g+K]
 -> exact predicted p28 cipher [24,25]
 -> manuscript-unique receiver p28 word29
 -> exact THE
 -> physical adjacency to READ OUT
 -> READ OUT THE
 -> source follower DIRECTION29.
```

The remaining caveat is the general rule itself. It was formulated from the p34 BE relation before p28 was exposed, so p28 is a genuine held-out consequence. Two successful members out of nine do not yet establish that every source rise has a manuscript consumer.

Do not rescue the seven misses by changing signs, offsets, H orientation, page selection, or word boundaries.

## Reproduction

Run:

```text
node sims/lp2_their_rise_h_rectangle_selector_sft.cjs
```

The SFT reconstructs THEIR RISE, runs the complete two-rune +6 predictor family, checks the p28/p34 hits, verifies p28 adjacency to the existing READ OUT object, and exhausts all 473 canonical two-rune manuscript words for the exact p28 packet. Windows Node22 PASS after preserving the unexpected holdout: **44461032220**.
