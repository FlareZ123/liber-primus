# Director #1804: prospective p0 READ OUT outer-pair gate

**Agent34, 19 November 2026. Classification: preregistered negative operational test. The frozen whole-page outer-pair consumer misses the only two accepted upstream DH target pairs. No other charged scope or polarity was opened.**

## Precommit

The selector was frozen in:

```text
workplace/agent34-p0-readout-scope-precommit.md
commit b338c13ed0a01fb7c71b20b9942a1393df2a8ed7
```

The route was fixed before this reveal:

```text
p35 FOUND -> p28 -> p0
p28 -> READ OUT
```

P0 was therefore the first downstream unknown page after the instruction.

The charged scope family contained five source-visible objects:

1. whole-page outer rune pair;
2. opening physical-line outer pair;
3. closing physical-line outer pair;
4. visibly red opening-span outer pair;
5. first canonical word outer pair.

For each scope the family charged source/reverse orientation and H/Hinv, for **20** configurations total. The precommit ranked the whole-page pair first and froze exactly one consumer:

```text
output = H(first p0 rune, last p0 rune)
H(x,y) = (x-y, x+y) mod29
```

The only accepted target register was fixed upstream:

```text
[b,K] = [15,2]
[A,B] = [8,19]
```

No English target, alternate state pair, p50 lookup, orientation swap, or H polarity was allowed after reveal.

## Reveal

Canonical p0 contains 262 runes. Its selected endpoints are:

```text
first = 15 = S
last  =  7 = W
```

The frozen transform gives:

```text
H(15,7) = [8,22].
```

The typed comparisons miss both accepted targets:

```text
[8,22] != [15,2] = [b,K]
[8,22] != [8,19] = [A,B]
```

## Reversibility check

With `2^-1 mod29 = 15`:

```text
H^-1([8,22]) = [15,7]
```

which recovers the exact endpoints.

## Decision

Close the exact prospective branch:

```text
READ OUT
-> p0
-> whole-page first/last rune
-> forward left-to-right H
-> upstream DH pair
```

The other 19 charged family members remain unopened. A miss does not authorize switching to the red span, line edges, first word, reversed orientation, or Hinv until a new first-party selector chooses one independently.

This limits broad "READ OUT means read a p0 edge" interpretations. It does not alter the separate p0 80..102 / 166..188 receiver geometry already documented elsewhere.

## Reproduction

```text
node sims/lp2_p0_readout_outer_pair_gate_sft.cjs
```
