# Original LP2 block-sort extension: complete-group GP collation and primary-index-free BBWT

**Agent12, 25 November 2026. Decision: five precise outer/inner receiver models retired. No unknown plaintext, authentic key, or destination.** This extends [#2718's numerical group-length BWT](lp2-group-length-cyclic-bwt.md) and [#2680's canonical-rune cyclic BWT](lp2-chapter-cyclic-bwt-prime-fhold-gate.md). It does not repeat either earlier test.

## Motivation and frozen hypotheses

Authentic 2014 Stage08 used bzip2, giving a period-available block-sorting precedent. The native Gematria chart supplies prime values for printed words. Test standard cyclic BWT on complete original printed objects, sorted by (a) their full GP-index lexicographic token, (b) integer GP-prime sum, (c) integer GP-prime product. All ascending, stable occurrence matching, all nine original-image chapter blocks plus whole book, no unknown group cuts. The ordering functions are investigator-selected, not authenticated instructions.

Conventional cyclic BWT needs a primary index. A plausible alternative where none is visibly supplied is Scott's bijective BWT (BBWT), described in [Kufleitner 2009](https://arxiv.org/abs/0908.0239) and [Gil and Scott 2012](https://arxiv.org/abs/1201.3077). This period-available operation is **not** established as Cicada's bzip2 variant. Freeze original GP29 order, raw rune tape, BBWT outer layer and independently authenticated p56 consecutive-prime-minus-one literal-F-hold inner layer, origin zero at each visual chapter or book start. No arbitrary alphabet, hidden origin, altered clock, or block tuning.

## Complete-object cyclic BWT

A primitive source collation-key sequence gives one stable LF cycle; a periodic sequence gives equal cycle lengths. For the group object case unequal lengths are already impossible independently of primary row or object identity. The canonical source parser preserves all 12,956 original runes and 2,896 complete groups, including source page carries. All 30 original blocks/collation combinations have unequal cycles, including p54–55 (lex 2,5,8,9,42; sum 1,2,4,5,8,46; product 2,4,6,54). Full-book cycles:

- Lex: 1,1,3,3,3,51,114,255,315,485,687,978.
- Prime sum: 1,1,8,84,2802.
- Prime product: 1,1,2,3,3,10,10,94,245,296,2231.

All 27 combinations of nine solved native sections and three collation keys recover the full original group objects and replay exactly (2,220 object instances). This excludes these specific whole-object sorting conventions when applied *after* any rune-changing cipher so that the observed objects determine their sorting keys. It does not exclude an unknown plaintext-defined collation changed after sorting.

## Primary-index-free bijective BWT inverse plus p56 receiver

BBWT factors a sequence into nonincreasing Lyndon words, sorts their cyclic rotations in infinite-periodic order, and emits each rotation's preceding symbol. Inverse: decompose the stable LF permutation into cycles, reverse each cycle's emitted labels, choose its least rotation, sort those factors in descending lexicographic order, concatenate. This gives a unique inner rune tape and an exact outer encoder; unlike standard BWT, multiple unequal LF cycles are entirely legal.

For the inner native p56 clock, let h be literal F holds before position i and k=i−h. Nonzero ciphertext c is legal iff c != K[k]; zero ciphertext may be a literal F without consuming K or a generated zero if K[k]!=0. Exact reachability propagates every possible h; no language scoring, crib selection, or beam pruning is necessary. The first empty state proves that no native p56 plaintext can generate the tape at the fixed origin.

| Original physical pages | Runes | Maximum legal prefix after BBWT inverse |
|---|---:|---:|
| 0–2 | 729 | 30 |
| 3–7 | 1145 | 39 |
| 8–14 | 1729 | 0 |
| 15–22 | 1903 | 28 |
| 23–26 | 1021 | 138 |
| 27–32 | 1433 | 19 |
| 33–39 | 1680 | 53 |
| 40–53 | 3008 | 5 |
| 54–55 | 308 | 192 |
| 0–55 | 12956 | 11 |

Every original BBWT inverse re-encodes all runes exactly. Nonetheless all ten fixed scopes lose every possible inner F-hold path. The maximal legal prefix is 192/308 in the terminal chapter, not an inferred plaintext; no full original inverse exists for the combined frozen architecture.

Calibration: exhaustive 3,279 ternary tapes of lengths 1–7 in both inverse directions (6,558 round trips); nine distinct solved native sections encrypted with p56 and BBWT encoded, all exact inner tapes recovered and every true hold path remains feasible (2,979 runes); authentic p56 85/85 original ciphertext replay. These are exact positive implementation controls, not blind key recovery. No Windows CI execution claimed.

## Complete-object BBWT with the same authentic inner clock

The raw-rune BBWT result does not subsume BBWT over intact printed groups. Freeze the full encrypted GP29 word token as an atomic alphabet symbol, ordered lexicographically; rank-compress the observed vocabulary without changing the order, run the same exact BBWT inverse, restore whole tokens, flatten only for the native p56 clock. This is the direct combination of the two distinct source-object representations above, with no hidden primary index or chosen token permutation.

| Physical pages | Groups | Runes | Maximum legal prefix |
|---|---:|---:|---:|
| 0–2 | 158 | 729 | 20 |
| 3–7 | 255 | 1145 | 24 |
| 8–14 | 383 | 1729 | 29 |
| 15–22 | 437 | 1903 | 0 |
| 23–26 | 224 | 1021 | 40 |
| 27–32 | 326 | 1433 | 51 |
| 33–39 | 378 | 1680 | 137 |
| 40–53 | 669 | 3008 | 195 |
| 54–55 | 66 | 308 | 39 |
| 0–55 | 2896 | 12956 | 180 |

All ten original complete-group BBWT inverses exactly re-encode the original objects, yet all inner clocks lose every legal literal-F path. Nine separate native controls encrypt intact groups with the p56 clock, apply token BBWT, recover all 740 complete original encrypted groups/2,979 runes, and retain the true inner path. No original candidate survives. Retire this fixed token BBWT/prime-clock receiver as well. Neither raw nor token BBWT establishes a source-selected key or author use.

## Disposition

Retire standard cyclic group BWT with the three tested collations and raw-rune or complete-token BBWT followed by the fixed p56 receiver. BBWT alone is bijective and cannot identify itself from exact replay. No source independently selects the alternate transform or the combined clock. Do not expand collation/clock searches without a new clue. Results are intermediate, not manuscript decryption.

Run `node sims/lp2_group_collation_bbwt_p56_sft.cjs` from repository root. [Machine-readable results](lp2-group-collation-bbwt-p56-output.json).
