# Independent audit of the 193 → D-within → 59 → 95 navigation chain

## Decision

The p55 interior geometry is exact and unusually structured, but the proposed chain does **not** provide a source-selected navigation rule. Three independent ambiguities remain decisive:

1. the printed p50 token `3D` is 193 only under the still-provisional base60 reading; the source-compatible radix59 fork gives 190;
2. NUMBER's factor 23 must be reinterpreted as a zero-based GP ordinal to obtain D, while the same chain elsewhere treats 17/23 as GP prime values for the factor-index reduction;
3. the strengthened 59 derivation is arithmetically circular: construct 95 as 5×19, reverse to 59, then NUMBER(59) returns 5×19.

No start, direction, stop, next address, key, or unknown plaintext is fixed.

## Frozen source facts

The provisional signed-2016 word-address rule maps `lies` to physical p50, local table token 3. The literal printed token is `3D`.

- conventional unsuppressed alphanumeric radix60: `3D = 193`
- source-compatible lowercase-f-skipping radix59: `3D = 190`

The source does not explicitly settle that fork.

Under the historically documented NUMBER semantics used by the project:

- 193 is prime, so its decimal digits reverse to 391; `391 = 17×23`;
- 190 is composite, so it is factored directly; `190 = 2×5×19`;
- 59 is prime, so it reverses to 95; `95 = 5×19`.

The last line is an operation identity, not independent evidence for choosing 59.

## Source-correct p55 segmentation

Physical p55 contributes 76 runes in **17 page-local segments**. The first segment is one rune long because it is the final boundary rune of an 11-rune word beginning on the preceding page. Only 16 complete words start on p55.

Removing the visible word circumferences while respecting that cross-page continuation leaves **43 strict-interior runes**. In source order they are:

```
M I EO G D TH IA A B C EA F X I M U C P H NG L
S D IA P H EO E I G X G S EO TH TH E EA I M C J E
```

## D is a real conditional discriminator

Using zero-based GP ordinal 23, D occurs in the strict interior at positions **5 and23**.

At the page-local segment level, D occurs strictly inside exactly segments **5 and9**. Among all 29 GP runes, D alone has that exact segment pair. Nine runes occur in exactly two strict-interior segments, so “two segments” alone is not selective.

In the concatenated 43-rune interior:

- D positions: **5, 23**
- runes strictly between: **17**
- position difference: **18**
- inclusive span length: **19**
- D is the **only** GP rune with an occurrence at the position equal to its own ordinal: ordinal23 at position23.

These are reproducible original-cipher facts.

## The 17/19/fold geometry is not unique to D

GP14 X occurs at interior positions **13 and31**. Therefore X also has:

- 17 runes strictly between its two occurrences;
- position difference 18;
- inclusive span length 19.

Both the D[5..23] span and X[13..31] span fold outer-to-inner to the same equality mask:

```
100000000₂ = 256
```

The D span center is I, whose GP prime is 31. The X span center is S, whose GP prime is 53. The center-I fact remains specific to D; the 17-between / 19-inclusive / fold-256 structure does not.

## Representation ambiguity inside NUMBER(193)

NUMBER returns factors **17 and23**. The route needs several incompatible interpretations:

| factor use | 17 | 23 | result |
|---|---|---|---|
| as GP prime weights | G (index6) | H (index8) | G/H |
| as zero-based GP ordinals | B (index17) | D (index23) | B/D |
| factor-index reduction | index6 + index8 |  | GP14 = X |

The historical NUMBER service does not state that a returned prime factor should suddenly be read as a zero-based Gematria alphabet ordinal. D is obtained only under that additional convention.

The chain then uses the factor-index interpretation to obtain X/DIVINITY and the ordinal interpretation to obtain D inside p55. That switch is not source-selected.

## Radix59 is a direct matched control

The same physical `3D` token under the documented radix59 fork is **190**. Historical NUMBER(190) yields the distinct prime factors:

```
2, 5, 19
```

Thus the two numbers later used to motivate the 19-node / 5-cycle p57 graph already appear under the competing numeric codec. The 5/19 observation cannot authenticate base60 or 193.

## Why 59 is not independently recovered

The original weak route concatenated the source-order segment labels 5 and9 into decimal **59**. No source tells the solver to concatenate segment labels as decimal digits.

The stronger route avoids that concatenation but creates a closed arithmetic loop:

```
first D position = 5
inclusive D...D span = 19
5 × 19 = 95
reverse(95) = 59
NUMBER(59) -> factor(95) = 5 × 19
```

The output is the input pair used to build 95. This cannot serve as an independent selector for 59.

## P57 graph consequence

The 19-body-word graph remains a candidate architecture. It uses GP-prime word sums modulo19 and two signs. A competing all-20-word model, including the PARABLE heading, also has nontrivial structure. Existing graph work explicitly records that:

- modulus19 is not independently prescribed;
- GP-prime word sums are not independently prescribed as the direction values;
- the H/+ to minus/plus sign convention remains unselected;
- the paired five-cycle diagnostic was recognized after the model was built.

The conditional 5×19 route does not repair any of those missing selectors. No predeclared next address follows from 95 or59 without adding a new convention.

## Completion rule

Retain the exact p55 D geometry as a potentially useful clue. Retire the stronger claim that it **independently selects 59** or validates the 19-word graph.

A successor needs an original instruction that fixes, before reading the outcome:

- radix60 rather than the source-compatible radix59 fork;
- the representation of NUMBER factors (prime weight, GP ordinal, factor-index reduction, or another declared map);
- the numerical operation applied to the selected p55 positions/span;
- the p57 node set, direction number, and sign/start/stop rule.

Without such a selector, extending this chain would multiply post-selected arithmetic instead of moving toward plaintext.

**Reproducer:** `sims/p55_number193_dwithin_control_sft.cjs`.
