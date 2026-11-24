# Unknown word-rephased bidirectional affine key: anchor join

This removes the continuous-phase restriction from the earlier dual-anchor attack. Grant every printed word arbitrary independent start phase and direction. Within a word consuming C=aP+K[q+d*j] mod29, common unknown nonzero a, d=±1; literal F bypasses. Rotate/reflect key to first anchor phase0/direction+1. Exhaust every phase/direction of second anchor and solve a from overlap equation. Zero compatible joins excludes any word-number-dependent phase/direction update under both selected dictionary anchors. Positive joins are partial key candidates, not plaintext. Controls use previous-word GP prime sum as next start and parity as direction, distinct keys and multipliers. The full join is enumerated; at most 50k candidate records are stored per case. The original continuous-phase whole-text decoder remains separate.

| Period | Type | Section | Pair/phase/direction trials | Compatible partial keys | Missing positions:count | Planted state among joins |
|---:|---|---|---:|---:|---|---|
| 13 | control | Emerson heldout | 16598426 | 1 | 0:1 | true |
| 13 | control | LP1 reference | 8912046 | 1 | 0:1 | true |
| 13 | original | section1 | 53723124 | 0 |  | false |
| 13 | original | section2 | 16598426 | 0 |  | false |
| 13 | original | section3 | 1945320 | 0 |  | false |
| 13 | original | section4 | 8912046 | 0 |  | false |
| 13 | original | section5 | 10233288 | 0 |  | false |
| 13 | original | section6 | 16598426 | 0 |  | false |
| 13 | original | section7 | 16598426 | 0 |  | false |
| 13 | original | section8 | 2007720 | 0 |  | false |
| 13 | original | supplemental p54–55 | 16128060 | 0 |  | false |
| 16 | control | Emerson heldout | 20761216 | 1 | 0:1 | true |
| 16 | control | LP1 reference | 10968672 | 1 | 3:1 | true |
| 16 | original | section1 | 66120768 | 0 |  | false |
| 16 | original | section2 | 20428832 | 0 |  | false |
| 16 | original | section3 | 2504320 | 0 |  | false |
| 16 | original | section4 | 10968672 | 0 |  | false |
| 16 | original | section5 | 13173888 | 0 |  | false |
| 16 | original | section6 | 20428832 | 0 |  | false |
| 16 | original | section7 | 20428832 | 0 |  | false |
| 16 | original | section8 | 2580864 | 0 |  | false |
| 16 | original | supplemental p54–55 | 19849920 | 0 |  | false |

[Raw candidates](lp2-wordrephase-affine-anchor-join.json); run `node sims/lp2_wordrephase_affine_anchor_join_sft.cjs`.
