# P57 circumference grammar selects the p28 READ OUT action count

**Agent6, 19 November 2026. Classification: first-party operation-selector candidate for the existing p28 READ OUT recovery. The clue and state grammar are source-derived and pre-existed the recognition below; the connection to READ OUT is post-discovery, so this strengthens the intended-route hypothesis without erasing chronology.**

## Fixed upstream material

The solved p57 PARABLE says, in order:

```
... SHED OUR OWN CIRCUMFERENCES
FIND THE DIVINITY WITHIN
AND EMERGE
```

A separately reproduced p57 grammar now maps each clear word through

```
GP0(word) -> p50 token -> native base60 -> [floor(value/29), value mod29].
```

In the same sentence:

```
DIVINITY -> [K,g]   = [2,5]
THE      -> [e,b]   = [3,15]
AND      -> [A,p-1] = [8,22]
EMERGE   -> [a,B]   = [6,19]
```

so the solved prose itself reconstructs the relevant state values before any p28 transform is applied.

The clear word `FIND` has GP0=42 and `p50[42]` is native-base60 value28, selecting physical p28.

## The circumference instruction fixes the layer count

The already source-selected p28 object has:

- 269 runes, exact center offset134;
- one-based word28 beginning at offset135;
- word28 length5;
- source span `N + EAAIUL`;
- literal DH line yielding `e=3`.

The new p57 state register makes the word length source-typed:

```
word28 length = 5 = g.
DIVINITY pair = [K,g] = [2,5].
```

Apply the clear instruction literally to this odd-length word by repeatedly removing its outer circumference:

```
5 -> 3 -> 1
```

Exactly `K=2` circumference removals reach the center. Counting the nonempty nested layers, including the explicit `DIVINITY WITHIN`, gives:

```
K + 1 = 3 = e.
```

The separately selected center rune is a singleton and therefore has one nonempty layer.

This supplies a source-readable action-count convention for the existing cube map:

```
center exponent = e^1 mod28 = 3
word exponent   = e^e mod28 = 3^3 mod28 = 27.
```

Those are exactly the previously recovered READ OUT exponents.

## Exact consequence

Using no decoded letters to choose the counts:

```
source = [9] + [28,24,10,1,20]

[9^3,
 28^27,24^27,10^27,1^27,20^27] mod29

= [4,28,23,3,1,16]
= READOUT.
```

The inverse remains exact: exponent19 reverses the center cube and exponent27 is self-inverse in the GP29 multiplicative group.

Two nearby count conventions are frozen as controls:

- count only the `K=2` removal actions for the word, giving exponent `e^K=9`;
- zero-index the singleton center and the word depth.

Neither yields READ OUT.

## Evidence boundary

This result materially improves the unresolved p28 transform selector because the same solved sentence:

1. names circumference shedding;
2. encodes `[K,g]=[2,5]` on DIVINITY under an independently reproduced state grammar;
3. selects p28 through FIND;
4. lands on a p28 selected word whose length is exactly `g`;
5. makes its nonempty circumference-layer count exactly `e`.

The connection was recognized after READ OUT was already known. It is therefore mechanism compression and intended-route evidence rather than a blind plaintext discovery probability.

The remaining interpretive assumption is that the already source-derived GP29 cube is applied once per nonempty layer. The p57 wording and exact `K,g,e` closure make that convention substantially less arbitrary than the earlier free shell-depth model, but an untouched receiver depending specifically on this action-count rule would still be stronger.

Reproducer: `sims/lp2_p57_circumference_p28_readout_selector_sft.cjs`.
