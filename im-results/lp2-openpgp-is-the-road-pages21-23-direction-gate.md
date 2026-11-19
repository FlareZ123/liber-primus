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

## The directed pages form a state corridor

The p22 holdout was new in this invocation. The two neighboring pages already had independent state results before this page-direction route was found.

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
`im-results/lp2-p23-fivedot-totient-origin.md`.

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
 -> p23 ROAD/origin state checkpoint
 -> B=19 -> p50 -> p33.
```

This route materially strengthens the role of the authenticated 2016 message as an executable navigation/state grammar. It still does not identify the general cipher for unknown LP2 body text.

## Reproduction

`node sims/lp2_openpgp_is_the_road_pages21_23_direction_sft.cjs`

The SFT reconstructs the upstream state and phrase, uses the repository's canonical cross-page word parser, exhausts the complete source-index pointer family, charges the 450-case p22 key family, verifies the 509-word raw-shell and 9,162-case fixed-key controls, verifies the p21 prior state packet and p23 state line, and checks the common p33 handoff.
