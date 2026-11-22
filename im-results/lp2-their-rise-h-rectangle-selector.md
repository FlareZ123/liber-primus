# THEIR RISE H-rectangles recover [a,b] and [e,-K]

**Agent1, 19 November 2026. Classification: source-only operation-selector candidate and independent parameter reconstruction. No unknown LP2 plaintext is promoted here.** The independently decoded p33 instruction `THEIR RISE` fixes a signed-message rise of six. Applying that one rise to canonical GP0 values produces exactly two seven-pair H-rectangle windows in the authenticated 2016 carrier. One reconstructs the ordinary DH private pair `[a,b]=[6,15]`; under the same H orientation the other reconstructs `[e,-K]=[3,27]`, the exact ordered parameter pair used by the existing p28 READ OUT candidate. The rectangle interpretation was recognized after the DH state and p28 transform were already known, so this is mechanism selection and cross-source corroboration rather than blind plaintext discovery.

## Upstream source instruction

P33 independently serializes to:

```text
THEIR RISE
```

The authenticated 2016 carrier contains exactly two `THEIR` tokens:

```text
index19 THEIR
index25 THEIR
```

so the literal rise is:

```text
25 - 19 = 6 = a.
```

The result below uses the rise value obtained from those source positions. It does not choose six by scanning GP0 differences.

For every source position `i`, define the rise residue:

```text
R_i = GP0(word[i+6]) - GP0(word[i]) mod29.
```

For a seven-pair window `R_0..R_6`, take the three outside-in pairs and apply the already fixed map:

```text
H(x,y) = (x-y, x+y) mod29.
```

Both operand orientations are charged. Three H outputs form a rectangle when they occupy exactly three cells of a 2x2 Cartesian product. The fourth cell is then forced without language scoring.

## First rectangle calibrates the reverse operand orientation

The first source-selected rectangle window begins at index5:

```text
5  EPIPHANY -> 11 IS
6  SEEKS    -> 12 THE
7  THE      -> 13 WAY
8  DEVOTED  -> 14 ITS
9  LIBER    -> 15 WORDS
10 PRIMUS   -> 16 ARE
11 IS       -> 17 THE
```

Its GP0 rise residues are:

```text
[20,7,8,26,12,13,24]
= [p-e, g+K, A, -e, K*a, A+g, -g].
```

Apply H to each outside pair in right-to-left operand order:

```text
H(-g, p-e)   = [q, b]
H(A+g, g+K)  = [a, p-e]
H(K*a, A)    = [q, p-e]
```

These are three corners of:

```text
{q,a} x {b,p-e}.
```

The missing fourth corner is therefore forced:

```text
[a,b] = [6,15].
```

That is the standard Alice/Bob private-exponent pair of the independently reconstructed DH23 state.

The opposite H operand orientation also forms a rectangle, but its missing corner is `[p,b]`. Thus the matched private-role pair selects the right-to-left H orientation within the two charged operand orders.

## The unchanged orientation predicts [e,-K] in the final source window

The final seven rise pairs begin immediately after authenticated word29 `DIRECTION`:

```text
30 SEEK   -> 36 GOOD
31 AND    -> 37 LUCK
32 YOU    -> 38 BEWARE
33 WILL   -> 39 FALSE
34 BE     -> 40 PATHS
35 FOUND  -> 41 VERIFY
36 GOOD   -> 42 OPENPGP
```

Their residues are:

```text
[8,4,0,20,19,23,11]
= [A, q, 0, p-e, B, p, a+g].
```

Reuse the orientation fixed by the first rectangle:

```text
H(a+g, A) = [e, B]
H(p, q)   = [B, -K]
H(B, 0)   = [B, B]
```

These are exactly three corners of:

```text
{e,B} x {-K,B}.
```

The missing corner is forced:

```text
[e,-K] = [3,27].
```

No unknown-page rune value participates in this construction.

## Complete source-family census

A finite charge makes the selectivity explicit.

First freeze the authored rise `a=6`, charge every possible seven-pair source window and both H operand orientations:

```text
31 starts x 2 orientations = 62 configurations.
```

Exactly four labeled rectangle configurations occur:

```text
start5  forward -> missing [p,b]   = [23,15]
start5  reverse -> missing [a,b]   = [ 6,15]

start30 forward -> missing [-e,-K] = [26,27]
start30 reverse -> missing [ e,-K] = [ 3,27]
```

Thus the one orientation that converts the first rectangle into the canonical DH private pair also converts the final rectangle into the exact `[e,-K]` transform pair.

As a broader control, charge every positive source rise that still permits seven pairs, every legal start, and both H orientations:

```text
1,332 configurations.
```

There are eight labeled rectangle events total:

```text
rise2  start10 forward -> [16,0]
rise2  start10 reverse -> [13,0]

rise6  start5  forward -> [23,15]
rise6  start5  reverse -> [ 6,15]
rise6  start30 forward -> [26,27]
rise6  start30 reverse -> [ 3,27]

rise10 start12 forward -> [0,22]
rise10 start12 reverse -> [0,22]
```

The authored rise6 is the only rise with two rectangle windows. Across the entire 1,332-case family, `[e,-K]=[3,27]` occurs once.

This is a finite post-discovery family charge. It is not an authorship probability.

## Exact p28 consequence

P28 already has an independently source-selected two-part object:

```text
center singleton = [9]
word28            = [28,24,10,1,20]
```

The source rectangle supplies the ordered pair:

```text
[e,-K] = [3,27].
```

Assign it in order to those two source parts:

```text
9^3 mod29 = 4

[28,24,10,1,20]^27 mod29
= [28,23,3,1,16]
```

Together:

```text
[4,28,23,3,1,16] = READ OUT.
```

This is the exact existing p28 transform, now reconstructed from an independent authenticated-source geometry. P53 separately exposes the same `[e,-K]` pair through circumference shedding, so two source routes converge on the parameters.

The result also removes the need to infer exponent27 from the disputed p57 layer-count convention. It does not by itself prove that an ordered pair recovered from the source must be applied as exponents to the p28 center/word object. The GP29 cube class and the p28 input geometry remain separate upstream premises.

## Scientific boundary

Preserve the following as the useful advance:

```text
p33 THEIR RISE
 -> signed rise6
 -> GP0 rise tape
 -> first H rectangle -> [a,b]
 -> fixed H orientation
 -> final H rectangle -> [e,-K]
 -> exact p28 READ OUT parameter pair
```

This reconstructs a previously important parameter pair without using p28 ciphertext values and supplies a compact human-solvable operation: rise, take outside pairs, apply H, complete the missing rectangle.

Do not treat the rectangle as a general decoder for arbitrary source windows. Do not use its missing corners as unrestricted page pointers. The p28 output `READ OUT` remains candidate-level because the rectangle rule was recognized retrospectively and the final application still consumes the pre-existing p28 two-part cube hypothesis.

A high-value next gate is a prospective consumer of the same rectangle operation or the exact ordered pair `[e,-K]` on an independently selected untouched object.

## Reproduction

Run:

```text
node sims/lp2_their_rise_h_rectangle_selector_sft.cjs
```

The SFT parses the authenticated 2016 source, reconstructs the source-role state values, derives rise6 from the two THEIR positions, exhausts the fixed-rise and all-rise rectangle families, and reproduces p28 READ OUT from the recovered ordered pair. Initial rectangle-only Windows Node22 workflow **44458710411** passes. The later integrated SFT, including the held-out p28/p34 two-rune consequences, passes Windows Node22 run **44461032220**.
