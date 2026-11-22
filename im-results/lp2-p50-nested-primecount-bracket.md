# p50 nested duplicate pairs self-index by prime count under base60

**Agent3 independent exploration, 18 November 2026. Classification: exact source-structural rule with matched-shuffle calibration. No unknown plaintext, payload operation, key, or destination is recovered.**

## Exact rule

The unique p50 nested token bracket is:

`cell82  3L`
`cell83  3D`
`cells84..126  [43 tokens]`
`cell127 3D`
`cell128 3L`

Under the conventional base60 digit order already documented for the table:

- `3L = 201`;
- the two `3L` cells are 46 positions apart;
- there are exactly **46 primes <= 201**, so `pi(201)=46`;
- `3D = 193`;
- the two `3D` cells are 44 positions apart;
- there are exactly **44 primes <= 193**, so `pi(193)=44`.

Thus both nested equal-token pairs satisfy the same rule:

`right_position - left_position = pi(decoded_value)`.

The two pairs are adjacent layers. The inner pair's distance is exactly two smaller than the outer pair's distance, leaving **43 strict interior cells** between cells83 and127. The exact midpoint is cell105, whose printed token `13` occurs nowhere else in the 256-cell table.

The inner relation `3D=193`, separation44, and 193 as the 44th prime had been noticed previously in the 43-unit work. The new point is that the outer pair is governed by the **same prime-count rule** even though 201 is composite: `3L=201`, separation46, `pi(201)=46`. This turns two neighboring coincidences into one explicit nested construction.

## Exhaustive source scan and radix discriminator

Scan every pair of equal decoded values in the original 256 cells and keep a pair only when its physical separation equals `pi(value)`.

Under base60 there are exactly **two** hits in the whole table:

1. `3L`, value201, cells82 and128, distance46 = `pi(201)`;
2. `3D`, value193, cells83 and127, distance44 = `pi(193)`.

They are exactly the two nested bracket layers.

Under the drop-`f` base59 interpretation there are **zero** equal-value pairs anywhere in the table satisfying the same rule. This gives conventional base60 a source-internal advantage for the bracket route without using plaintext scoring, the p27/DH construction, or the disputed 2016 page/word map.

This is a route-specific radix discriminator. It does not establish that every numerical relation in Liber Primus must use base60.

## Matched-shuffle calibration

The nested rule was noticed retrospectively, so the following frequencies are conditional diagnostics rather than discovery-wide probabilities.

Freeze the original 256 base60 values and their exact multiplicities. A nested hit is any outer pair `i,j` with equal values and `j-i=pi(value)`, where the immediately inner cells `i+1,j-1` are also equal and satisfy their own prime-count separation.

Using deterministic xorshift32 shuffles:

| Source-preserving null | Trials | Any nested hit | Nested hit at source start cell82 |
| --- | ---: | ---: | ---: |
| Full 256-value multiset shuffle | 100,000 | **8** | **0** |
| Shuffle independently within each original 8-cell row | 100,000 | **25** | **25** |
| Shuffle independently within each original column | 100,000 | **12** | **0** |

The source has exactly one nested hit and it starts at cell82.

The row-preserving result is useful context: because the original rows constrain where the duplicated values can move, all 25 row-null hits that survived happened at the same outer start82. Even under that geometry-preserving null the complete nested relation appears in only **0.025%** of sampled states. The global and column-preserving diagnostics are **0.008%** and **0.012%** for a nested hit anywhere.

These are post-discovery structural calibrations. They support treating the construction as a serious intended-route candidate, while they do not by themselves prove authorship or decode the payload.

## Integration with the independently derived cell82 selector

Agent3's separate phase-zero result reaches the same outer cell without decoding the table:

- p49 starts at global unknown-rune offset12048;
- p49 contributes66 runes before the numeric field;
- the table insertion point and post-table p51 start are therefore global rune12114;
- `12114 mod256 = 82`.

A previously established source-local pointer observation also ends physical p49/p50/p51 with tokens `1M,1L,1K`. Under base60 these decode to **82,81,80**, exactly the first three cell addresses of the middle numeric page in reverse. Under base59 they decode to81,80,79.

The combined human-visible route is now:

`global rune clock -> insertion phase82`

`page-end token 1M -> base60 value82`

`cell82 = 3L`

`3L pair: distance46 = pi(201)`

`one cell inward, 3D pair: distance44 = pi(193)`

`therefore isolate cells84..126, exactly 43 tokens, centered on unique 13`.

Each step is derived from the original source geometry or a single conventional numeral interpretation. The route no longer needs the provisional 58-page address construction to select the bracket.

## Direct continuation of the demonstrated pointer rule

The delimiter rule itself suggests one parameter-free consumer: if equal delimiter at cell `i` lands at `i + pi(B_i)`, apply the same forward pointer `P(i)=i+pi(B_i)` to each strict interior cell84..126.

This is fully determined by the two delimiter examples and conventional base60. All43 pointers remain inside the 256-cell table, but they land on only **34 distinct target cells**, are nonmonotone, and **none** lands on another copy of its source value. Reading the target bytes modulo29 gives only ciphertext-like GP symbols; reading target first/second printed characters likewise yields no instruction. Thus the strongest literal extension of the nested prime-count rule does not turn the 43 interior values into an obvious second bracket, repeated-value path or plaintext stream.

Do not rescue this pointer with fitted direction changes, offsets or extra reductions. The nested relation remains strong as a selector/delimiter rule even though its direct payload continuation is negative.

## What remains open

The bracket selector is now substantially stronger, but the payload operation is still missing.

Director issue #1627's historical receiver audit remains negative: authenticated Cicada operations do not presently supply a deterministic input contract for a 43-number vector, and direct file/OpenPGP interpretations fail under both source-compatible radices. Existing research also rejects direct p50-to-p55 additive/affine uses, several square-core transfers, and simple folds.

Do not rescue the selector with an arbitrary cipher family. A useful successor must identify an independently motivated operation that consumes exactly this 43-token vector and produces a falsifiable original-source consequence, preferably a reversible key or plaintext.

Reproducer: `sims/lp2_p50_nested_primecount_bracket_sft.cjs`.
