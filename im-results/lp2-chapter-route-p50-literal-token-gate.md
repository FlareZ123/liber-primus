# Chapter SUM→PRODUCT route does not occur as literal p50 table tokens

**Agent11 — 28 November 2026. Classification: source-exact negative on the cheapest p40/p50 consumer for Agent8's chapter-navigation route. No plaintext or key recovered.**

## Question

Agent8's current #3388 source-only route assigns each of the nine red chapter starts a pair derived from the first complete black word after its heading:

~~~text
chapter: p0  p3  p8  p15 p23 p27 p33 p40 p54
IN=sum: 15   9  23   22  25   2   5  27  19
OUT=prod:23 11   2   13  16  19   3   3  27
~~~

Following OUT→next IN from p0 yields the published path `p0→p8→p27→p54→p40`, whose endpoint chapter contains the p49–p51 32×8 numeric table.

The cheapest literal consumer is therefore testable without inventing a cipher: interpret each `(IN,OUT)` pair as the two symbol indices of one printed p50 token, using the table's own ordered symbol alphabet.

## Exact literal test

The source table alphabet begins:

~~~text
0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ...
~~~

All route values are 0..28, so symbol-index lookup is identical under the repository's still-live radix59/radix60 numerical-interpretation dispute. This gate depends only on the printed glyph sequence.

The five path edges become:

~~~text
(15,23) -> FN
(23, 2) -> N2
( 2,19) -> 2J
(19,27) -> JR
(27, 3) -> R3
~~~

**None of these five tokens occurs anywhere in the 256 printed cells.**

Expanding to all nine chapter pairs gives:

| Chapter | IN | OUT | Forward token | Forward occurrences | Reverse token | Reverse occurrences |
|---|---:|---:|---|---:|---|---:|
| p0  | 15 | 23 | FN | 0 | NF | 0 |
| p3  | 9  | 11 | 9B | 0 | B9 | 0 |
| p8  | 23 | 2  | N2 | 0 | 2N | 1 |
| p15 | 22 | 13 | MD | 0 | DM | 0 |
| p23 | 25 | 16 | PG | 0 | GP | 0 |
| p27 | 2  | 19 | 2J | 0 | J2 | 0 |
| p33 | 5  | 3  | 53 | 0 | 35 | 0 |
| p40 | 27 | 3  | R3 | 0 | 3R | 0 |
| p54 | 19 | 27 | JR | 0 | RJ | 0 |

The sole reversed hit is `2N`, once, at row-major table index113. It is p8's reversed pair and does not create an ordered multi-edge route.

## Interpretation

This rejects the direct typography-preserving bridge:

~~~text
chapter first-black-word (sum mod29, product mod29)
        ↓
same ordered pair as one literal printed p50 two-symbol cell
~~~

The failure is structural rather than linguistic and does not depend on any unknown ciphertext, plaintext, radix choice, or table byte conversion.

It does **not** reject Agent8's chapter navigation itself. It says the p40 endpoint cannot be justified by claiming that its route state pairs are already printed verbatim in the p50 table. A successor table consumer needs an independently motivated normalization, address rule, arithmetic combination, or other authored operation. Do not repair this gate by choosing modulo reductions or pair encodings after seeing the table.

## Reproduction

`sims/lp2_chapter_route_p50_literal_token_gate_sft.cjs` reconstructs the canonical printed table from `resources/liber-primus/lp2-grid-256.json`, asserts all nine pair mappings, and checks all 256 cells exactly.
