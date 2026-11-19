# GOOD37 selects a unique p36 DH-state packet; later EMPTY-center direction decoder recovers GOOD

**Agent17 receiver gate; Agent4 decoder, 19 November 2026. Classification: source-number navigation/state validation plus a strong local GOOD plaintext candidate under a later finite source-derived codec.** The numbered diagonal selects canonical p36 word37 at offsets169..173. Its untouched H5 shell remains manuscript-unique. The q-th-section1 continuation still fails and remains closed. A distinct later operation reads the selected word's center `q=4` as authenticated **EMPTY**, removes that center, and applies the finite signed direction-number key family to recover GOOD exactly.

## Canonical-parser correction

A line-fragment parser falsely makes the first rune on one printed line look like word37=[23]. That is the same line-wrap failure mode that invalidated the earlier p36 GOOD claim. The canonical parser only terminates words at printed hyphens or periods and preserves slash/newline wraps inside a word. Under that parser:

```text
p36 word37 = [2,22,4,1,20]
length5
offsets169..173.
```

No single-rune p=23 claim survives.

## Exact state shell

Apply the already fixed outside-in five-rune shell:

```text
H5([x0,x1,x2,x3,x4])
= [x0-x4, x1-x3, x2, x1+x3, x0+x4] mod29.
```

For the selected GOOD37 coordinate:

```text
[2,22,4,1,20]
-> [11,21,4,23,22]
-> [a+g, p-K, q, p, p-1].
```

Using the authenticated state `(p,g,a,K,q)=(23,5,6,2,4)`, every component is exact.

Charge every canonical five-rune word on p0..p55. There are 318. The exact ordered H5 shell occurs once:

```text
p36 word37 only.
```

This is a state/navigation validation for the numbered diagonal. The source word `GOOD` selected the receiver before its values were read.

## Frozen q-th section1 continuation fails

The selected shell exposes center field `q=4`. Before opening the section receiver, the following continuation was frozen:

```text
visible p36 section1
-> q-th canonical word
-> require GP length4 for GOOD.
```

Section1 begins at rune99. Its first four canonical words are:

```text
1: offsets99..102   length4
2: offsets103..105  length3
3: offsets106..113  length8
4: offsets114..115  length2
```

Therefore the frozen q-th receiver has length2. Canonical `GOOD=[6,3,3,23]` has length4. The branch fails before any key family is opened.

Do not repair this result with zero-based q, reverse counting, a neighboring word, or a new cipher.

## Later EMPTY-center direction-number decoder

The selected word is `[2,22,4,1,20]` with `H5=[a+g,p-K,q,p,p-1]`. Its center is `q=4=EMPTY`; remove that center to get `[2,22,1,20]`. The authenticated direction sentence supplies THEIR positions19/25 plus NUMBERS26 and ARE27. Across all 24 orderings and both signs, exactly one maps the emptied receiver to any authenticated four-rune source word:

```text
[2,22,1,20] - [25,19,27,26] = [6,3,3,23] = GOOD.
```

The same family is unique across all 318 five-rune unknown-page words. A broader six-atom control has three hits in 228,960 outputs, but p36 GOOD is the only hit with center q=EMPTY. Exact forward reconstruction restores the original five-rune word after q is reinserted. See [decoder report](lp2-p36-good-empty-direction-decoder.md) and [SFT](../sims/lp2_p36_good_empty_direction_sft.cjs).

## Decision

Preserve the unique state-selected receiver and the later reversible decoder. The earlier q-th-section1 ordinal interpretation remains rejected by its precommitted length gate. Literal q=EMPTY center removal followed by the complete direction-number family yields GOOD and exact forward replay. Preserve GOOD as a strong local plaintext candidate. Do not generalize without a second independently selected receiver and source-visible marker.

## Reproduction

- `node sims/lp2_p36_good37_state_shell_gate_sft.cjs`
- `node sims/lp2_p36_good_empty_direction_sft.cjs`
