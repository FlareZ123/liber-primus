# P39 outer circumference numerically selects the p28 READ OUT raw output

**Agent45, 19 November 2026. Classification: post-discovery cross-object corroboration with a language-free selector. The p39 source object is independently selected by the solved circumference route. The statistic was recognized after READ OUT was known, so it is not a blind plaintext probability.**

## Upstream source selection

The independently reproduced route is:

```text
solved p57 “WE MUST SHED OUR OWN CIRCUMFERENCES”
  -> shed p57 body -> p50
  -> authenticated B=19 -> p33
  -> p33 source H/state register
  -> shed p33 first black body -> p39
```

P39 is therefore selected before this report's outer-shell statistic is read. Its lower black body is the source object immediately after the red `[-K,g,b]` title and contains 28 printed words / 118 runes.

The frozen shell operation is already established:

```text
H(x,y) = (x-y,x+y) mod29.
```

For each p39 body word, take its outer circumference pair `(first,last)` and apply forward H. A one-rune word would remain its own center; p39's body has exactly one one-rune word, so the complete transformed circumference contains **55 runes**.

The complete transformed outer stream has:

```text
length          = 55
raw GP0 sum     = 774
GP0 sum mod29   = 20
```

Thus p39 supplies the numeric ordered pair:

```text
[55,20].
```

Only after deriving the pair do these values match:

```text
GP0(READ) = 55
GP0(OUT)  = 20.
```

## Red-body control

Charge the same statistic against every nonempty red-started body in the canonical LP2 transcription:

1. keep its printed word boundaries;
2. apply the same forward H to each outer pair;
3. preserve a one-rune center;
4. record transformed circumference length and whole-stream GP0 modulo29.

There are 15 eligible bodies.

Exactly one has

```text
(length, GP0 mod29) = (55,20):
p39 local119.
```

This does not create a calibrated authorship probability because the `[55,20]` interpretation was noticed after the p28 READ OUT candidate existed. It establishes a reproducible cross-object identity and rules out a generic property of red-started bodies.

## The earlier selected p33/p3 bodies independently encode FIND on the circumference

The two route-selected 21-word bodies preceding p39 and p53 have the same literal circumference count:

```text
p33 first body:
  81 total runes
  39 interior runes after one shed
  42 outer runes removed

p3 matched body:
  95 total runes
  53 interior runes after one shed
  42 outer runes removed
```

Canonical GP gives:

```text
GP0(FIND) = 42.
```

Across all 15 red-started bodies, those are the only two whose one-layer outer circumference has 42 runes. Both are independently selected by the route before their interior counts are consumed as page pointers.

This gives the same solved sentence a mechanical reading on two separate route steps:

```text
FIND THE DIVINITY WITHIN
  outer count = FIND = 42
  inner count = next page pointer
```

The evidence is strongest for the count grammar. No claim is made that the removed runes themselves transliterate to FIND.

## Language-free p28 family selector

Use p39's source-derived numeric pair `[55,20]` as a selector on the already source-fixed p28 center-plus-word object:

```text
p28 center rune + one-based word28
[9] + [28,24,10,1,20].
```

Charge every reversible uniform GP29 power map on the two source parts:

- boundary exponent: every unit modulo28, 12 choices;
- five-rune word exponent: every unit modulo28, 12 choices;
- forward/reverse orientation: 2 choices;
- all five internal output cuts.

Total:

```text
12 * 12 * 2 * 5 = 1,440 configurations.
```

No dictionary, word list, p50 low-digit transition or plaintext parse participates in the selector. Retain a configuration only when

```text
raw GP0(left)  = 55
raw GP0(right) = 20.
```

Exactly two parameter tuples survive:

```text
center exponent3,  word exponent27, forward, cut3
center exponent17, word exponent27, forward, cut3
```

Both produce the **same raw six-rune output**:

```text
[4,28,23] | [3,1,16].
```

The center alias is already understood: source rune9 satisfies

```text
9^3 mod29 = 9^17 mod29 = 4.
```

The authenticated DH/source value `e=3` resolves that alias, leaving the intended parameter tuple:

```text
(3,27), forward, cut3.
```

Only after the numeric selection is complete does the raw output transliterate as:

```text
READ | OUT.
```

The previously known local English rival LUNG / DEAR does not have numeric coordinates `[55,20]`; its GP0 pair is different.

## Relation to the wider p28 evidence

This selector is independent of the recently failed attempt to promote the p50 low-digit transition into a general authenticated navigation opcode. It does not apply that transition at all.

The current p28 mechanism now has several distinct supports:

1. authenticated 2016 word positions select modulus29 and the GP29 cube opcode;
2. the p53 circumference route independently exposes the ordered parameter pair `[e,-K]=[3,27]`;
3. the separately selected p39 outer circumference independently supplies the raw output coordinates `[55,20]`;
4. charging those coordinates across the full 1,440 reversible p28 power/orientation/cut family selects one raw six-rune output, with only the known center-exponent value alias;
5. transliteration of that selected output is READ OUT.

The chronology still matters. The p39 statistic was recognized after READ OUT, so it should be treated as strong mechanism compression and cross-object corroboration. The remaining p28-specific premise is why the source-selected power pair acts on the exact center singleton and adjacent one-based five-rune word as two separate operands. P28's unique center-plus-word geometry and literal DH line remain the strongest local evidence for that split.

## Reproduction

- SFT: `sims/lp2_p39_outer_readout_selector_sft.cjs`
- Windows workflow retained for historical run provenance: `.github/workflows/agent45-p39-outer-readout-selector.yml`
- Windows PASS after FIND-control extension: https://github.com/FlareZ123/liber-primus/actions/runs/44455229537
- Subsequent ordinary Node22 runs should use the repository's generic manual runner, per the Critic's workflow-reuse audit.
