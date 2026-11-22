# P57-driven dynamic walk on the p50 outer76 ring: source-selection gate

**Agent6, 18 November 2026. Director issue #1669.**

## Decision

The original p57 parable does not specify a changing walk around the p50 outer76 ring. Its movement words describe movement between an interior and a surface, or removal of a boundary. They do not specify the tangential information required to traverse a closed rectangular perimeter.

Per #1669's stop rule, no dynamic walk, start search, turn sequence, key schedule, or p55 language score was run.

Preserve the exact 76-cell ring ↔ 76-rune p55 correspondence as a structural navigation clue. Reopen a dynamic-ring receiver only if a first-party source fixes a start, direction, update/turn rule and clock before p55 output is inspected.

## Frozen p57 wording

The clear original parable is:

```text
LIKE THE INSTAR TUNNELING TO THE SURFACE
WE MUST SHED OUR OWN CIRCUMFERENCES
FIND THE DIVINITY WITHIN AND EMERGE
```

The source-visible movement vocabulary is therefore:

- `TUNNELING`;
- `TO THE SURFACE`;
- `SHED`;
- `CIRCUMFERENCES`;
- `FIND`;
- `WITHIN`;
- `EMERGE`.

## What the text fixes

The wording gives a coherent radial/topological interpretation:

- `CIRCUMFERENCES` nominates a boundary;
- `SHED` nominates removal of a boundary layer;
- `WITHIN` nominates the interior side of that boundary;
- `SURFACE` and `EMERGE` describe crossing from an interior toward or through a boundary.

This is consistent with the independently visible p50 geometry. The printed 32×8 table has one outer perimeter of exactly 76 cells, and p55 has exactly 76 original GP29 runes. Removing that ring leaves 180 table cells, matching solved p56 plus clear p57 at 85+95 runes.

## What a dynamic ring walk requires

A deterministic nonstationary walk on a closed 32×8 perimeter needs four kinds of source input before any cipher operation is considered:

| Required input | P57 source support |
| --- | --- |
| Start cell | No corner, table cell, coordinate, numeral, or unique perimeter mark is named |
| Initial tangential direction | No clockwise, anticlockwise, left, right, forward, backward, east/west, or equivalent ring direction appears |
| Changing turn/update rule | No instruction says when to reverse, turn, jump, skip, reflect, rotate, or change stride |
| Clock | No rule maps p57 words, punctuation, or movement events one-to-one onto the 76 p55 positions |

The verbs `TUNNELING` and `EMERGE` supply a radial relation to a surface. A rectangular perimeter traversal is tangential. Radial movement cannot choose clockwise versus anticlockwise motion or a changing tangential update without another instruction.

Likewise, `SHED` selects removal of the ring as a set. It does not order the cells within that set.

## Why punctuation does not repair the missing rule

P57 has a title and three clear text lines. Its line breaks and punctuation separate semantic clauses. They do not provide 76 marked events, four named corners, alternating directions, or any explicit reset rule.

Treating word lengths, rune sums, punctuation positions or clause boundaries as turn commands would introduce a second mapping that the issue explicitly forbids unless the text itself identifies it as the clock. No such identification is present.

## Relationship to previous outer76 tests

The existing outer76 gate already established:

- the physical ring size is 76;
- the p55 rune count is 76;
- all source-natural stationary corner/direction GP29 ring-pad candidates are nonlinguistic;
- direct byte XOR/add/subtract candidates are nonlinguistic;
- the 180-cell interior cannot explain known p56/p57 plaintext through a stationary byte→rune or byte→key lookup.

Those results leave open a genuinely source-selected stateful receiver. P57 does not supply the required state-transition grammar for that receiver.

## Human solve-path assessment

A contemporary solver can reasonably infer:

1. inspect a circumference;
2. remove or separate it;
3. inspect what lies within.

That sequence can motivate the 76/180 decomposition of the printed table. It does not tell the solver how to serialize the circumference or how its values act on p55.

The missing instruction is therefore concrete: an ordering/state rule for the ring and a reversible value operation on the p55 symbols.

## Disposition

Keep:

- p57 `SHED ... CIRCUMFERENCES` as a plausible source-visible reason to inspect the p50 table perimeter;
- outer76 ↔ p55 length equality;
- inner180 ↔ p56+p57 length equality.

Close:

- a p57-selected nonstationary ring walk;
- any walk family requiring fitted start, direction, turns, stride, resets, or word-length commands.

No unknown p55 plaintext, authentic key, or reversible receiver is recovered.

## Reproduction pointers

- Existing complete outer76/inner180 source gate: `im-results/lp2-terminal-32x8-outer76-inner180-source-gate.md`
- Original source SFT for the stationary/direct ring families: `sims/lp2_32x8_outer76_p55_instar_source_gate_sft.cjs`
- Clear p57 source text: `resources/liber-primus/lp1-plaintext-reference.txt`
