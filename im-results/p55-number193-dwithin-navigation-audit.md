# Independent audit of the 193 → D-within → 59 → 95 navigation chain

## Decision

The p55 D interval has a plausible source-directed selector that does **not** require the p50 numeric chain. The 2013 Cicada audio's ID3 metadata publishes the exact Parable later printed on p57. Its instruction — “We must shed our own circumferences; Find the divinity within and emerge” — can reasonably lead a solver to remove the first and last rune of each p55 printed word, then search the strict interiors for **D**, the initial of *divinity*. The source-correct extraction gives D at positions **5 and23**.

This is a simpler human solve-path hypothesis than deriving D from NUMBER(193), and it bypasses the radix and factor-representation ambiguities in that numeric route. It remains an interpretation: “circumferences” does not uniquely specify word-edge stripping, and “divinity” does not explicitly say to take its initial. The text plausibly nominates the D markers; it does not specify the subsequent recursive left-minus-right fold, its sign, or the mapping TWO P → 86 → WE.

The separate 193 → 391 = 17×23 corroboration remains conditional for three reasons:

1. the printed p50 token `3D` is 193 only under the still-provisional base60 reading; the source-compatible radix59 fork gives 190;
2. a new span-geometry reading avoids changing factor 23 into a GP ordinal: base60 factors 17/23 can mean the D span's 17 strict-interior runes and endpoint23. But the competing base59 factors 2/5/19 can equally mean two D markers, start position5, and inclusive width19. Both maps distinguish D from the X control, but they map different span attributes and no source selects the mapping;
3. the strengthened 59 derivation is arithmetically circular: construct 95 as 5×19, reverse to 59, then NUMBER(59) returns 5×19.

The factorization therefore does not resolve the radix fork or independently authenticate the NUMBER-to-span mapping; the operation itself is only retrospectively attested, not a contemporaneous 2013 instruction. No complete start, direction, stop, next address, key, or unknown plaintext is fixed.

## Provenance of the NUMBER rule

The `NUMBER` semantics used in this audit are **secondary and retrospective**, not an authenticated contemporaneous 2013 instruction. The preserved contemporaneous 16-Feb-2013 Twisted-Python witness and 3-Mar-2013 participant log document `BASE29`, `DH` and `NEXT`; they do **not** document the first-onion `NUMBER`, `PRIMES` or count-command grammar. The surviving NUMBER/PRIMES transcripts are later participant/server copies (public copies from 2022/2025), and the archived `server.py` is reconstructed rather than an original 2013 implementation. See [the scoped source inventory](../resources/external/2013-tcp-live-test-vectors.json).

The 2013 `0_wisdom` prime-sum mapping to the 2014 5×5 square is a separate, source-backed cross-stage operation. It does not authenticate the first-onion NUMBER command. Accordingly, p50's literal word `NUMBER` is an LP2 source fact, but the reversal/factorization semantics below remain a retrospective hypothesis.

## Frozen source facts

The provisional signed-2016 word-address rule maps `lies` to physical p50, local table token 3. The literal printed token is `3D`.

- conventional unsuppressed alphanumeric radix60: `3D = 193`
- source-compatible lowercase-f-skipping radix59: `3D = 190`

The source does not explicitly settle that fork.

Under the retrospective NUMBER semantics used by the project (not authenticated by the contemporaneous 2013 witness):

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

## D is a plausible text-selected marker

The source-text route above nominates D as the initial of *divinity*, independently of NUMBER's factor 23. Applying the plausible word-edge reading of “shed our own circumferences” and then “find the divinity within” gives the following reproducible source facts.

At the page-local segment level, D occurs strictly inside exactly segments **5 and9**. Among all 29 GP runes, D alone has that exact segment pair. Nine runes occur in exactly two strict-interior segments, so “two segments” alone is not selective.

In the concatenated 43-rune interior:

- D positions: **5, 23**
- runes strictly between: **17**
- position difference: **18**
- inclusive D…D span length: **19**
- D is the **only** GP rune with an occurrence at the position equal to its own ordinal: ordinal23 at position23.

The last fact is an additional exact coincidence, not the reason to choose D under the textual reading. The extraction still assumes that “divinity” selects its initial rather than the full word or a different semantic representation. These are reproducible original-cipher facts under the stated word-edge parse.

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
| as p55 D-span geometry | 17 strict-interior runes | endpoint position23 | D[5..23] |

The retrospective NUMBER transcripts do not state that a returned prime factor should suddenly be read as a zero-based Gematria alphabet ordinal. The numeric route therefore changes representation without a source selector.

That ambiguity weakens the 193 → D numeric corroboration, but it does not negate the separate text-directed D hypothesis above. The factor-index interpretation yields X/DIVINITY; the poem's initial-letter reading yields D in the p55 word interiors. These are distinct routes and should not be presented as one consistent NUMBER operation.

## Radix59 is a direct matched control

The same physical `3D` token under the documented radix59 fork is **190**. Historical NUMBER(190) yields the distinct prime factors:

```
2, 5, 19
```

Thus the two numbers later used to motivate the 19-node / 5-cycle p57 graph already appear under the competing numeric codec. There is also an exact D-span reading: the base59 factors `2,5,19` can denote the **two D markers**, their **first position 5**, and the **inclusive 19-rune width**. The competing X[13..31] span has two markers and width19 but starts at13, so factor5 distinguishes D. This is a different exact feature mapping from base60's `17,23` → interior-count17/endpoint23 mapping. Neither mapping is explicitly selected; the 5/19 observation cannot authenticate base60 or base59.

## Matched factor-to-span control

The source-correct D span has features **{marker count 2, start 5, end 23, strict interior 17, inclusive width 19}**. The X control has **{2, 13, 31, 17, 19}**. The two radix readings can each select D over X, but by different exact mappings:

| p50 reading | NUMBER factors | Matching D features | Why X fails |
|---|---|---|---|
| base60 `3D=193` | `17,23` | strict-interior count17; endpoint23 | X ends31 |
| base59 `3D=190` | `2,5,19` | two markers; start5; inclusive width19 | X starts13 |

This is a useful matched-control result, not a radix decision. It shows why the factorization can be made to corroborate the text-selected D span under either codec. The missing selector is not the arithmetic; it is the rule that says which span attributes the returned factors should represent. The reproducible assertions are in `sims/p55_number193_dwithin_control_sft.cjs`.

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

The separate p55 recursive-fold report (`im-results/p55-dspan-two-p-original-control.md`) shows that the 17 runes strictly between the D markers yield first-level **TWO** and terminal **P** under left-minus-right modulo29, and that this combined signature occurs once across the 7,247 strict word-interior runes. This is a real convergence candidate: reading TWO P as two P values gives 2×43=86, the GP-prime sum of the unique p57 body word **WE**, which is also the shared node of the two five-cycles. But the Parable's word-edge/D clue does not specify left-minus-right, pair order, center retention, or recursive repetition. The earlier Cicada-operation audit found no preserved precedent for that exact arithmetic fold. Nor does the source explicitly prescribe the TWO P → 86 → WE lookup. The result supports a plausible route to WE; it does not independently validate the 19-node graph's modulus, direction rule, or sign.

## Completion rule

Retain the exact p55 D geometry as a potentially useful clue. Retire the stronger claim that it **independently selects 59** or validates the 19-word graph.

The direct textual D selection can be retained as a **plausible intended marker**, without requiring the p50 number chain. A successor seeking a complete D → WE navigation rule still needs an original instruction that fixes, before reading the outcome:

- whether “circumferences” means stripping the first and last rune of each printed word and whether “divinity” selects its initial D;
- the recursive fold operator, left/right orientation, center handling, and repetition rule;
- the mapping from TWO P to 86 and from 86 to a p57 word;
- the p57 node set, direction number, and sign/start/stop rule.

The NUMBER factorization does not settle radix60 versus radix59: both factor sets can be mapped exactly to different features of the independently text-selected D span, and the source does not select the factor-to-feature mapping. Without the missing fold and address selectors, extending this chain would multiply post-selected arithmetic instead of moving toward plaintext.

**Reproducer:** `sims/p55_number193_dwithin_control_sft.cjs`.
