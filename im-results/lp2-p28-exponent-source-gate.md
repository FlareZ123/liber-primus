# P28 exponent source gate: cube-chain selects e=3; literal layer actions give (3,27)

**Agent4, 19 November 2026. Director #1720. Classification: source-only support for the frozen p28 exponent pair, with one explicit zero-index rival preserved. No English output, p0 receiver evidence, MAP, LEAD, ROAD, or NEXT is used in selecting the exponents.**

## Independent inputs

The gate uses only:

- original p28 center/page-word geometry;
- the independently reconstructed DH23 tuple `p=23,g=5,a=6,b=15,A=8,B=19,K=2`;
- canonical exponentiation on GP29;
- the finite cube-exponent orbit `{1,3,9,27,25,19}` modulo28;
- the visible layer counts of the one-rune center and five-rune page-numbered word.

## Base exponent: the full DH bridge isolates 3

Charge every exponent in the six-state cube orbit against the fixed DH values in GP29.

Require one exponent to carry the complete chain:

`K -> A -> B -> b`.

Exactly one orbit exponent satisfies all three transitions:

`2^e = 8, 8^e = 19, 19^e = 15 mod29`.

The unique value is:

**e=3**.

This is stronger than citing one numerical identity such as `g-K=3`. It selects the cube map from the already fixed DH tuple before any p28 plaintext output is evaluated.

## Short-expression audit

A separate low-description arithmetic audit charges raw, no-wrap single-field values and pairwise sums, differences, products, and exact quotients that land directly in the cube orbit.

Every orbit element has at least one short DH expression, so expression availability alone cannot authenticate an exponent.

The target base3 has the densest direct support, including:

- `g-K=3`;
- `a/K=3`;
- `b/g=3`;
- `A-g=3`.

The target word exponent27 also has the direct identity:

`A+B=27`.

The explicit zero-index rival has its own simple identities:

- `a-g=1`;
- `b-a=9`.

Therefore the useful source selector is the complete GP29 DH bridge plus a layer-action convention, rather than the existence of short arithmetic coincidences.

## Layer convention

The selected p28 source object is fixed before decoding:

- page28 has269 runes, exact center offset134;
- printed word28 begins at135, immediately after the center;
- word28 has five runes.

A single center rune has one visible layer. A five-rune word has three nested layers: outer pair, inner pair, center.

With the uniquely selected base map `e=3`, interpret "one operation per visible layer" literally:

- center: `3^1 mod28 = 3`;
- word: `3^3 mod28 = 27`.

This fixes the ordered pair:

**(3,27)**.

The chargeable zero-index interpretation treats the visible layer counts as indices0 and2:

`(3^0,3^2) = (1,9)`.

That rival is preserved. It applies the identity to the center rather than applying the independently selected cube map once to the one-layer center. The action-count reading is therefore the stronger source interpretation, while zero-indexing prevents claiming absolute combinatorial uniqueness.

## Whole-manuscript geometry test

Before evaluating any language, enumerate physical pages whose page-numbered word exists.

There are48 such objects in the current physical-page range.

The exact p28 geometry is unique:

- the page has an exact center;
- the page-numbered word begins immediately after that center.

Only **p28 word28** satisfies this condition.

A relaxed control keeps every exact-center page whose page-numbered word merely has five runes, so the frozen action-count exponents can be applied without requiring adjacency. Six pages qualify:

`p17, p19, p28, p41, p48, p52`.

The SFT applies `(3,27)` to each center/page-word pair and records the six raw GP outputs without dictionary or language scoring. Only p28 has the source adjacency that motivated joining the center and word into one six-rune object.

## Decision for #1720

The exponent pair is materially source-selected under the strongest low-description mechanism:

1. the DH23 tuple uniquely selects cube exponent3 by the complete `K -> A -> B -> b` bridge;
2. original p28 geometry uniquely selects the one-layer center plus three-layer page-numbered word;
3. literal one-operation-per-layer iteration yields `(3,27)`.

The main surviving source-only rival is the zero-index convention `(1,9)`. Short DH expressions exist for both target and rival, so those identities should be presented as corroboration rather than independent proof.

This supports retaining `(3,27)` as the preferred source-selected transform. Downstream evidence must still discriminate the action-count interpretation from the zero-index rival and must continue to carry the separate p50 output-type caveat.

## Reproduction

Run:

`node sims/lp2_p28_exponent_source_gate_sft.cjs`

The SFT verifies the unique GP29 DH bridge, audits short orbit-valued DH expressions, charges action-count and zero-index layer conventions, proves strict p28 center/page-word geometry uniqueness, and applies the frozen selector to all six relaxed five-rune center/page-word controls without language scoring.
