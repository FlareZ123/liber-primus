# P57 TUNNELNG→SURFACE 19-node path: one state per four-rune p55 block

**Agent6, 18 November 2026. Classification: second bounded source-selected consumer of the phrase-derived pointer path.**

## Decision

The independently established terminal grouping gives p55 **76 = 19×4** runes. After p57 `TUNNELNG TO THE SURFACE` selects a 19-node p50 base59 pointer path, the most direct blockwise consumer is to assign one path value to each consecutive four-rune p55 block.

That exact four-candidate family fails decisively.

Best original candidate:

- source register: visited p50 cell;
- additive sign: plus;
- exact-word-shape GP29 score: **-13.6166462757**.

The worst of **2,000** exact-p55-word-shape native controls scores **-8.3649176076**. The best original candidate is therefore **5.2517286681 nats per scored within-word trigram below even the worst native control**.

A source-shaped positive plant under this same blockwise layout recovers **76/76** runes and scores **-7.1359061001**.

Together with the earlier direct 19-period test, both simple additive uses of the phrase-selected path are now closed.

## Source route held fixed

The path is unchanged:

`94,55,79,81,57,116,53,168,236,234,193,153,33,112,72,161,214,247,189`.

Its semantic source selection is:

- `TUNNELNG=94` gives the start;
- `SURFACE=67` selects p50 token `3C`;
- `3C` decodes under base59 to189;
- 189 is the unique p50 base59 fixed point.

P55 is partitioned in source order into 19 consecutive blocks of four runes.

## Frozen receiver

For path position `j=0..18`, the same GP29 key value is applied to all four runes in p55 block `j`.

Only two source registers are admitted:

1. visited p50 cell index modulo29;
2. emitted base59 pointer value modulo29.

For each register, test only:

`P = C + K mod29`

and

`P = C - K mod29`.

No phase, reversal, affine offset, block permutation, alternate radix, or key mutation is fitted.

## Original outputs

The four candidates score:

1. visited cells, plus: **-13.6166462757**;
2. emitted pointers, minus: **-13.8906358071**;
3. visited cells, minus: **-14.0439095165**;
4. emitted pointers, plus: **-14.3326653291**.

The best transliteration is:

`EAOYBREOXJJWRIABAEMDYDTRUWRBDANCPAEAWEOAEATNGBAEFOMWIALPLYOOEXIITHJXFYTTCTHENTINGULFNYTORAE`.

Its isolated familiar fragments do not survive complete word-shape scoring.

## Matched controls

The exact p55 word-length shape is preserved:

`[1,4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3]`.

Across 2,000 deterministic native controls:

- worst: **-8.3649176076**;
- median: **-7.2892274672**;
- 95th percentile: **-6.8842487674**.

The source-shaped positive plant recovers every rune and scores **-7.1359061001**.

## Consequence

The phrase-selected path remains a legitimate structural/navigation clue. Two obvious reversible additive consumers are now excluded:

1. repeat the 19 values four times across the 76-rune stream;
2. use one path value for each of 19 consecutive four-rune blocks.

Do not expand this path into arbitrary phases, nonlinear transforms, or fitted permutations absent a new first-party instruction.

No unknown p55 plaintext or key is recovered.

## Reproduction

`node sims/lp2_p57_tunnel_surface19_block4_p55_sft.cjs`

Passing GitHub Actions run: **44417135081**.
