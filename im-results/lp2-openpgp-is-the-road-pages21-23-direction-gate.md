# `IS THE ROAD` numbers select a p21–p23 DH-state corridor; p22 prospectively yields Bob's `(b,B)`

**Agent22, 19 November 2026. Classification: source-selected navigation/state advance plus a strong local `THEIR` plaintext candidate on the prospectively selected p22 receiver. The receiver selection is prospective; the compact key-shell grammar is retrospective and exhaustively charged. This does not establish a global LP2 cipher.**

## Upstream selector

The authenticated OPENPGP modulus-ladder route fixes

```text
p=23, q=4, g=5, a=6, b=15, A=8, B=19, K=2, e=3.
```

The fixed `GP0 -> p50/base60 -> mod29 -> signed-source index` operator sends

```text
WORDS / THEIR / ROAD
 -> THE / ROAD / IS
```

and the already recovered shared secret `K=2` rotates that packet to the exact authenticated trigram

```text
IS THE ROAD
```

at zero-based source indices

```text
21,22,23 = p-K, p-1, p.
```

The signed source itself says that the words' numbers are the direction.

Before inspecting LP2 pages 21–23 in this invocation, the literal page interpretation was frozen in
`workplace/agent22-openpgp-is-the-road-pages21-23-precommit.md`.
The precommit allowed only already established source operations and required the branch to be rejected or downgraded if it needed target-specific tuning.

## Prospective p22 holdout: THE selects a complete Bob-state receiver

The middle directed page is p22 because authenticated source word22 is `THE`.

Its canonical Gematria value is source-fixed:

```text
GP0(THE) = 20.
```

The already fixed p50 table gives

```text
p50[20] = 1g.
```

Charge both documented numeric alphabets and both zero/one-based pointer origins:

```text
base59(1g) = 100
base60(1g) = 102

candidate rune offsets:
  base59 one-based  ->  99
  base59 zero-based -> 100
  base60 one-based  -> 101
  base60 zero-based -> 102
```

On physical p22, those four charged offsets are **exactly the four positions of one complete canonical printed word**:

```text
word index 19
offsets    99..102
cipher     [22,28,28,24]
```

The ambiguity envelope is therefore the receiver itself. No pointer branch chooses a different word or rune.

Two independent state readouts are then source-visible:

```text
printed-word index = 19 = B = signed THEIR
raw rune sum        = 102
102 mod29           = 15 = b = signed WORDS
```

The raw sum also equals the native base60 pointer value exactly:

```text
sum([22,28,28,24]) = 102 = base60(1g).
```

Thus the p22 receiver is a compact Bob packet:

```text
ordinal -> B=19
GP0     -> b=15
```

with its raw GP0 self-addressing the receiver through the native p50/base60 pointer.

### Complete source-index family charge

Apply the same rule to every authenticated source index `i=0..42`:

1. source word `i` selects physical page `i`;
2. `GP0(source word i)` addresses p50;
3. charge base59/base60 and zero/one origin;
4. retain a page only when all four charged offsets fall in one canonical printed word.

There are **18** same-word collapses.

Require the four charged offsets to equal the complete receiver word, with no extra rune. Exactly one page survives:

```text
p22.
```

Independently require the receiver's raw rune sum to equal either charged numeric pointer value. Exactly one page survives:

```text
p22 under native base60.
```

So both p22 properties are familywise singletons in the complete authenticated source-index page family.


## Local p22 inverse: the road corridor recovers THEIR

The receiver was selected prospectively before any plaintext target or key was applied:

```text
p22 word19
C = [22,28,28,24].
```

Its untouched outside-in shell is

```text
H4(C) = [27,0,27,17].
```

Across all **509** canonical complete four-rune words on unknown LP2, this exact raw shell occurs once: p22 word19.

The selected corridor itself supplies a compact finite key family. The middle page is `THE`; the flanking authenticated words are `IS` and `ROAD`. Their canonical sums are equal modulo29:

```text
GP0(IS)   = 25
GP0(ROAD) = 54 = 25 mod29

H(25,25) = [0,21] = [0,p-K].
```

The endpoint p23 independently exposes the ordered state line

```text
[K,a,e,g,q] = [2,6,3,5,4].
```

Keep the flanking-word pair fixed. Charge **every ordered pair including repeats** from those five visible p23 fields for the remaining two H coordinates. For each of the `5*5=25` pairs, invert the four-coordinate shell, apply both additive signs to the fixed p22 receiver, and compare against all nine distinct authenticated four-rune source targets.

The complete family is

```text
25 state pairs * 2 signs * 9 targets = 450 configurations.
```

It has exactly one hit:

```text
ordered p23 pair = (g,a) = (5,6)
H(g,a)           = [28,11]

H4(key) = [0,21,28,11]
key     = H4^-1(...) = [20,10,18,20]

[22,28,28,24]
-
[20,10,18,20]
=
[2,18,10,4]
=
THEIR.
```

The role labels are therefore compactly

```text
H4(key)
=
H(GP0(IS),GP0(ROAD)) || H(g,a)
=
[0,p-K,g-a,g+a].
```

This shell template was recognized after the receiver and source label were available, so it remains a retrospective key grammar rather than a blinded universal cipher rule. Its charged family is finite and target-complete.

### Tighter key grammar from the two flanking pages

The 450-case family above deliberately charges every ordered p23 state pair. The actual three-page corridor supplies a narrower geometric family from structures that existed before the p22 inverse.

P21's independently established two-dimensional H packet is

```text
[[e, 0],
 [20,p-K]]
=
[[3, 0],
 [20,21]].
```

Charge either visible column:

```text
left  = [e,20]
right = [0,p-K].
```

P23's five-dot-selected state line is

```text
[K,a,e,g,q].
```

The two states immediately flanking the center `e` are `a` and `g`. Charge both orientations, `(a,g)` and `(g,a)`. For each column/orientation, append the H pair, invert the resulting H4 shell, charge both signs, and test all nine authenticated four-rune targets:

```text
2 columns * 2 orientations * 2 signs * 9 targets
= 72 configurations.
```

Exactly one survives:

```text
p21 right column = [0,p-K] = [0,21]
p23 reverse flank H(g,a)   = [28,11]

shell = [0,21,28,11]
key   = [20,10,18,20]
subtract -> THEIR.
```

This geometry is more constrained than choosing an arbitrary ordered pair from the p23 state. The original 72-case audit selected `g,a` from the target family. The later independent p11 instruction `THEIR NUMBERS ARE THE DIRECTION` now resolves that orientation by its already validated increasing-number rule: `{a,g}={6,5}` orders as `g,a`. The local key is therefore source-selected up to the additive sign convention; preserve the original audit as discovery history.

### THEIR NUMBERS ARE THE DIRECTION resolves the p22 key orientation

The original 72-case corridor family still charged the orientation of p23's inner flank pair `{a,g}`. The independently recovered p11 instruction now supplies that missing choice.

P11 says:

```text
THEIR NUMBERS ARE THE DIRECTION
```

and its validated p27 consumer interprets that direction as **increasing numerical order**.

P23's five-dot-selected state line is

```text
[K,a,e,g,q].
```

The two fields flanking its center `e` are the values

```text
{a,g} = {6,5}.
```

Apply the independently established increasing-number direction:

```text
5,6 = g,a.
```

The first shell half was already fixed without the target by the source-selected corridor endpoints:

```text
H(GP0(IS),GP0(ROAD))
= H(25,25)
= [0,21]
= [0,p-K].
```

The p11 ordering rule now fixes the second half:

```text
H(g,a)
= H(5,6)
= [28,11].
```

Therefore the complete key shell is source-ordered before plaintext comparison:

```text
[0,21,28,11]
= [0,p-K,g-a,g+a].
```

Its unique H4 inverse is

```text
key = [20,10,18,20].
```

Apply both additive signs to the prospectively selected receiver:

```text
[22,28,28,24] - [20,10,18,20]
= [2,18,10,4]
= THEIR

[22,28,28,24] + [20,10,18,20]
= [13,9,17,15]
```

The addition output is not any authenticated four-rune source word. The key itself no longer depends on choosing `THEIR` from the 72-case target family; only the additive inverse sign remains an operation convention. This materially upgrades the local plaintext candidate while preserving the distinction between a source-selected key and a globally established cipher.

### The same receiver selects both THEIR occurrences

The selected ciphertext has a direct authenticated-source readout before any decryption:

```text
[22,28,28,24]
 -> source[22],source[28],source[28],source[24]
 -> THE THE THE AND.
```

Across all 509 canonical four-rune manuscript words, this exact lexical readout occurs once, again at p22 word19. This is an interpretation of the same raw receiver, so it is supporting route structure rather than an independent probability factor.

The final raw rune supplies the source separator:

```text
24 -> AND.
```

The local inverse supplies the immediately following authenticated token:

```text
source[24] = AND
source[25] = THEIR
plaintext  = THEIR.
```

At the same time, the receiver's own canonical word ordinal is

```text
19 -> first authenticated THEIR.
```

So one p22 object selects both occurrences used by the downstream instruction:

```text
19 THEIR
24 AND
25 THEIR

24 - 19 = 5 = g
25 - 19 = 6 = a.
```

The already established p33 instruction is `THEIR RISE`, and its authenticated source action is precisely the rise from THEIR19 to THEIR25 by `a=6`. The p22 receiver therefore supplies a source-visible occurrence selector for that later operation instead of leaving the duplicate word THEIR ambiguous.

### Their numbers point back by q to MEANING IS

The same p22 object fixes the adjacent authenticated pair

```text
AND24 THEIR25.
```

The carrier instruction says that the words' **numbers are the direction**. Consume those already selected source numbers directly as p50 addresses and use the two documented numeric alphabets.

Under drop-f base59:

```text
p50[24] = 1n
base59(1n) = 107
107 mod29 = 20 = MEANING

p50[25] = 3I
base59(3I) = 195
195 mod29 = 21 = IS
```

Both outputs move by the independently reconstructed state value

```text
20 - 24 = -4 = -q
21 - 25 = -4 = -q.
```

So the fixed adjacent suffix

```text
AND THEIR
```

points uniformly backward by `q` to

```text
MEANING IS.
```

This was found after `AND24/THEIR25` had already been fixed by the p22 object, so the input pair was not selected from the table output.

#### Complete adjacent-pair/radix charge

Apply the same map to every authenticated adjacent source pair `i,i+1`:

```text
i
 -> p50[i]
 -> decode in one fixed radix
 -> mod29 source index
```

Retain only pairs whose two outputs preserve adjacency by one common index shift.

Across all 42 adjacent inputs:

- **base59:** exactly one uniform-shift pair, `AND24/THEIR25 -> MEANING20/IS21`, shift `-q=-4`;
- **base60:** zero uniform-shift pairs.

This makes the base59 result a finite source-register event rather than a general readability scan.

The p22 object and the earlier q-spaced closure now reconstruct the complete contiguous authenticated clause segment:

```text
receiver word ordinal19 -> THEIR
numbers24,25 / base59   -> MEANING IS
q-spaced closure         -> IS THE ROAD
raw final + local inverse-> AND THEIR

union of source indices19..25:
THEIR MEANING IS THE ROAD AND THEIR
```

The overlap at `IS21` is exact. The next authenticated token is `NUMBERS26`, which is independently a strong p26 routing/meta-instruction junction elsewhere in the repository.

This is structural solve-path evidence. It does not mean p50/base59 maps every signed word number to prose; the full adjacent-pair census shows the uniform-shift event is isolated.

### P11 overlaps on THEIR25 and closes the full 19–29 clause

A concurrent independent p11 result supplies the next two authenticated indices without reusing the p22 number map.

The already selected p11 two-rune receiver is

```text
[11,14].
```

Read its fixed sum/difference coordinates:

```text
11 + 14 = 25
11 - 14 = -3 = 26 mod29

=> source25/source26
=> THEIR NUMBERS.
```

That packet is manuscript-unique under its published family control in
`im-results/lp2-p11-p27-numbers-direction-order.md`.

The overlap with the p22 result is exact:

```text
p22 clause closure ends at THEIR25
p11 raw packet begins     THEIR25 NUMBERS26.
```

The authenticated continuation is

```text
27 ARE
28 THE
29 DIRECTION.
```

Therefore the two independent manuscript objects jointly reconstruct the entire contiguous signed segment

```text
19 THEIR
20 MEANING
21 IS
22 THE
23 ROAD
24 AND
25 THEIR
26 NUMBERS
27 ARE
28 THE
29 DIRECTION.
```

This is also the same pair of five-word clauses linked independently by p33's established `THEIR RISE` operation:

```text
19..23  THEIR MEANING IS THE ROAD
  +a=6
25..29  THEIR NUMBERS ARE THE DIRECTION.
```

The three routes have different inputs:

- p22 receiver ordinal/raw/plaintext plus the base59 number-direction map;
- p11 untouched two-rune sum/difference packet;
- p33 recovered `THEIR RISE` state translation.

Their overlap turns the authenticated prose into a connected solve-path scaffold rather than a set of isolated semantic labels.

### Fixed-key manuscript control

Hold the exact numeric key `[20,10,18,20]` fixed across all 509 unknown four-rune words, all nine authenticated four-rune targets, and both signs:

```text
509 * 9 * 2 = 9,162 configurations.
```

Exactly one hit remains:

```text
p22 word19 offsets99..102
subtract key
-> THEIR.
```

The local plaintext is especially coherent with the receiver's independently selected state metadata:

```text
receiver word ordinal = 19 = B = authenticated THEIR
receiver raw sum mod29 = 15 = b = authenticated WORDS.
```

Thus p22 now supplies both a prospectively selected Bob-state packet and a reversible local `THEIR` candidate under a source-constrained, exhaustively charged key family.

## Prospective THEIR25 transfer: the p22 envelope does not generalize to p25

The p22 object itself selects `AND24 -> THEIR25`. Before reading physical p25, the exact p22 pointer-envelope mechanism was frozen in
`workplace/agent22-their25-p25-pointer-envelope-precommit.md`.

For authenticated `THEIR25`:

```text
GP0(THEIR)=34
p50[34]=3H
base59=194
base60=197
charged offsets = 193,194,196,197.
```

On canonical p25 those positions land in three different words:

```text
193 -> word38
194 -> word39
196 -> word40
197 -> word40.
```

The prospective transfer therefore fails cleanly. The exact four-branch envelope and raw-sum self-address remain a special p22 construction; do not generalize that receiver selector to the second THEIR occurrence.

## The directed pages form a state corridor

The p22 holdout was new in this invocation. The two neighboring pages already had independent state results before this page-direction route was found. A concurrent independent result now also recovers the p21 receiver as a strong local `IS` candidate through its receiver-ordinal source key (`im-results/lp2-p21-is-wordordinal-sourcekey.md`).

### p21 = IS

The repeated authenticated word `IS` at indices11 and21 uniquely selects two length2/GP0=25 receivers:

```text
p11 offsets49..50  [11,14]
p21 offsets170..171 [24,1]
```

The established two-dimensional H transform gives

```text
[[e,0],
 [20,p-K]]
=
[[3,0],
 [20,21]].
```

The exact p21 inverse is separately documented in
`im-results/lp2-p11-p21-is-paired-h2d-state-gate.md`.

### p22 = THE

The prospective result above yields

```text
(b,B) = (15,19)
```

from one exact self-addressed receiver.

### p23 = ROAD

The five-dot-selected first p23 line has visible word lengths

```text
[2,6,3,5,4] = [K,a,e,g,q].
```

Physical page number23 supplies `p=23`. Ordinary DH reconstructs `A=8,b=15,B=19`.
That route existed independently before this new page selector and is documented in
`im-results/lp2-p23-fivedot-totient-origin.md`. A later sealed p23 ROAD-state body test found zero complete length4/GP0=54 receivers, so the simplest attempt to reinterpret ROAD as a p23 body plaintext label is rejected; preserve ROAD here as navigation/state semantics.

Both p22 and p23 therefore fix the same Bob public value

```text
B=19.
```

The already established native p50 handoff is

```text
p50[B=19] = 0X
base60(0X) = 33
=> physical p33.
```

So the newly selected p22 packet and the independent p23 state route converge on the same p33 destination.

## Decision against the frozen gate

The strict precommit criterion asked for one uniform operation across all three pages. That criterion **does not pass**: p21, p22 and p23 expose their state through different source-visible structures.

The useful-partial criterion **does pass**, and substantially so. The upstream phrase selects the ordered corridor before p22 is inspected, p22 then yields a familywise-unique Bob packet under an already licensed operator, and the endpoint p23 independently supplies a compatible full-state route to the same p33 handoff.

Preserve the human solve-path hypothesis as:

```text
authenticated OPENPGP key ID
 -> source-visible DH23 state
 -> q-spaced source phrase IS THE ROAD
 -> numbers 21,22,23 are the direction
 -> p21 IS state object
 -> p22 self-addressed (b,B) Bob packet -> local THEIR inverse
 -> same p22 object selects THEIR19 and AND24→THEIR25, rise a=6
 -> p23 ROAD/origin state checkpoint
 -> B=19 -> p50 -> p33.
```

This route materially strengthens the role of the authenticated 2016 message as an executable navigation/state grammar. It still does not identify the general cipher for unknown LP2 body text.

## Reproduction

`node sims/lp2_openpgp_is_the_road_pages21_23_direction_sft.cjs`

The SFT reconstructs the upstream state and phrase, uses the repository's canonical cross-page word parser, exhausts the complete source-index pointer family, charges the 450-case and 72-case p22 key families, verifies the 509-word raw-shell and 9,162-case fixed-key controls, exhausts the base59/base60 adjacent source-number map, verifies the p21 prior state packet and p23 state line, and checks the common p33 handoff.
