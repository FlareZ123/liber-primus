# P49/P55 recursive-core packets partition the p50 table 144/112

**Agent1, 19 November 2026. Classification: intermediate structural correspondence plus a bounded direct-Hill negative. No unknown LP2 plaintext, authentic cipher key, or complete inverse recovered.**

## The new cross-page relation

The existing p55 and p49 recursive-SHED studies expose the same four-field signature:

- p49 cores: [20, 19, 19, 14, 4]. Its packet is [GP0=76, H0=21, H1=28, middle=19], totaling **144**.
- p55 cores: [1, 6, 2, 11, 18]. Its packet is [GP0=38, H0=36, H1=36, middle=2], totaling **112**.

Here H0 and H1 are the ordinary integer sums of the first and second coordinates from the fixed outside-in H pairs. The packet total is the sum of the four already-reported fields; it deliberately treats the middle core as a separate typed field even though it is also included in GP0.

The original p50 table is 32×8:

- outer circumference: 2(32+8)−4 = **76** cells;
- second circumference after removing the first: 2(30+6)−4 = **68** cells;
- two circumferences together: **144** cells;
- remaining inner rectangle: 28×4 = **112** cells.

Thus p49's four-field total equals the two outer circumferences, p55's total equals the remaining 28×4 inner core, and 144+112=256 exactly partitions the whole table. A full page-level census finds p49 and p55 are the only five-core pages; they are also the only pages whose four-field packet totals are 144 and 112, respectively.

This correspondence is independent of the p50 radix choice. The previously reported labels remain consistent with the geometry: p49 GP0 76 addresses p50[76]=1s, whose base59 value is 112=GP0(DIRECTION); p55 GP0 38 addresses p50[38]=2D, whose base59 value is 131=GP0(CIRCUMFERENCES). These labels make the paired geometry an appealing human solve-path hypothesis: DIRECTION plus CIRCUMFERENCES, with the first page's packet matching the removed shell and the second matching the inner remainder.

A second dimensional fit is that p55 has 76 runes = 19×4, while the p50 inner area has 112 cells = 28×4. The 19 and 4 are the existing DH fields B and q; 28 is 29−1. This is suggestive of a four-column state representation, not yet a cipher rule.

## A bounded consumer test: p29 state packet selects a 4×4 inner-core matrix

The existing p29 word30 H4 packet is [22, 15, 8, 0] = [p−1, b, A, F]. All four values are valid zero-based row indices in the 28×4 inner table. I tested the simplest direct block-cipher consumer selected by that packet:

1. Remove the two outer circumferences, leaving the 28×4 p50 inner rectangle.
2. Select rows [22, 15, 8, 0], in the p29 packet's printed order, to form a 4×4 key matrix.
3. Decode the table tokens under both live radices (base59 and base60), reducing entries modulo 29.
4. Invert the selected matrix over GF(29).
5. Apply the inverse to p55's 76 original runes as 19 consecutive four-rune blocks, testing the two conventional row-vector and column-vector Hill orientations.
6. Re-encrypt every output block and require exact recovery of the original p55 ciphertext.

Both selected matrices are invertible. The exact results are:

| Table radix | Selected 4×4 matrix | Column-vector inverse output | Row-vector inverse output |
| --- | --- | --- | --- |
| base59 | [12,1,28,26] / [26,13,9,16] / [24,16,25,28] / [15,4,13,19] | OTCEAOBIATTHNGLTHIAYMGLWCRYBNGAEJSLREWDEOICFIRXIASDSLEAEALRWTEMGMEOSOEHITAEPHGHIATPURDOECLONI | MBLRAEEOEOEOMHILLXNUEAAOEWRTHWBNGUODTYXHEOJOIALLAESTHOETNMIACEONGROSGBMYAENGIAGDTHNGYGPTUFNENEBG |
| base60 | [14,2,2,28] / [1,13,13,17] / [27,19,28,28] / [15,4,15,21] | OETHUOXEOMMDPNGDYLOIITHFUCPBPXEOWBAEBPAEMNNGHOEPEGEAMLNGEOXSNXEBMXYPPOIMAOLTEOLNETHTHXYBEAXTH | FNGWEAXDEAEUTTPEAFMCOTHTHOJRFCIEOLGCAEWNGANGMTFCTHWYXOWFDXCEAEAJXOOUFUEOFWUOEOEDNGOEIAEGXNGXGYNG |

All four inverses round-trip exactly. None produces readable p55 plaintext.

## Interpretation and limits

The 144/112 partition is a precise cross-object structural correspondence and is worth preserving. It ties the p49 and p55 five-core packets to the exact two-shell/inner-core geometry of the p50 table, while the existing DIRECTION and CIRCUMFERENCES readouts agree with the roles of those regions.

It is **not yet evidence of an intended cipher**:

- The four-field packet sum is an investigator-derived aggregation; no independent source instruction explicitly says to add GP0, H0, H1, and the middle field.
- The row-selection interpretation of the p29 packet [22,15,8,0] is a new hypothesis, not an established operation.
- Direct Hill4 is not independently selected by the manuscript, and 4-rune blocks cross printed p55 word boundaries.
- The direct consumer test is negative for this exact row selection, both table radices, and both standard Hill orientations. It does not exclude other cipher families, but it is not permission to widen arbitrary matrix/key searches.

The next useful decision is to find an original clue that selects a reversible consumer of the 28×4 inner core, or that fixes a different role for the four p29 state values. Do not search arbitrary row permutations, phases, alphabets, or matrix variants without such a selector.

## Reproduction

Run:

    node sims/lp2_p49_p55_p50_144_112_partition_sft.cjs

The script parses the canonical transcription, reproduces the page-level five-core census and packet totals, checks the p50 geometry, derives the p29 H4 selector, constructs both radix-specific matrices, verifies their inverses, and asserts exact forward re-encryption of all 19 p55 blocks.

Supporting studies: p55 recursive word core, p49 recursive-SHED direction transfer, p50 radial shed geometry, and p29 direction self-index packet.
