# Printed LP2 numeric grid: two-column serial-order signal

**Classification:** exploratory physical-source observation, with a finite rank test. No LP2 plaintext, key, cipher, or intended traversal has been recovered. The metric was chosen after inspecting the unusual behavior of the eight displayed columns; the empirical probabilities correct the **28 within-test column pairs**, not all historical model exploration. It is a clue to investigate, with a source-selection caveat.

## Original input and hypothesis

The manuscript's physical pp49–51 show a **32-row × 8-column** base-60 table of 256 byte values. Row order is visually supplied, making an order-sensitive test meaningful. The file `resources/liber-primus/base60-grid.json` preserves its 10 / 13 / 9 row page division. An ordered pair of neighboring printed columns could carry a two-coordinate trajectory, a state varying gradually down rows, or a separately generated data stream. None of those readings is currently specified by another source instruction.

The proposed detection statistic preserves all byte values and column identities. Within each column `c`, define

`B_c = mean_{i<j} |byte[i,c]-byte[j,c]|`

where the pairs `i<j` are drawn from the prespecified row-order segments. Let `V_c` be the mean absolute adjacent-row change within the same segments, divided by `B_c`. Define `T=min_{1<=c<d<=8} (V_c+V_d)`. Low `T` means some two displayed channels jointly change less than the exact observed column values would suggest if their row positions were unordered. This is a **scan of all 28 pairs**, so no column pair is selected in advance. A matched null jointly permutes complete 8-byte rows, retaining cross-column dependence and the observed byte histograms. A second null permutes rows independently *within each of the three original physical pages*, retaining the pp49 / p50 / p51 row blocks.

## Findings on all 256 original table bytes

The print-order column-normalized variations, in visible left-to-right order, are:

`[0.8207972,1.0263224,1.1752563,0.8082664,1.0606854,1.0223460,0.7786957,0.6718489]`.

The minimum among all 28 pairs is **columns 7 and 8**, giving `T=1.4505445`. The null expectation is 2 for any fixed pair; pair selection is accounted for by resampling.

A seeded 100,000-permutation whole-table row-shuffle SFT gives **630** null trials with a minimum at least as small, a plus-one family tail `631/100001 = 0.00630994`. Keeping all three printed physical-page blocks intact, the original selected pair remains columns 7 and 8, with `T=1.4499066`; **812 / 100,000** nulls are as small (`813/100001 = 0.00812992`). The corresponding baseline is recomputed from all possible within-page pairs, and only within-page row joins are scored. Both calculations retain all other 8-byte-row structure.

For an independently recorded 256-byte historical input, `resources/cicada2014-onion2-timing.json`'s `final_hex` string, use the same natural 32×8 row-major reshaping, whole-table null and identical SFT seed. Its best pair is **columns 2 and 4**, with `T=1.9250600`, giving **95,109 / 100,000** null exceedances, plus-one tail `0.9510905`. This contrast is descriptive: the two byte strings have different creation histories; it does not prove an LP2 cipher channel.

**Reproducer:** `sims/grid_two_channel_serial_order_sft.cjs`, Node.js 22 CommonJS with no external dependencies. Fixed PRNG `xorshift32` seed `0x33013301`, 100,000 shuffles in each comparison. The source files, row partitions, all-pair scan, nulls and exact numeric test are directly executable. The rightmost pair of columns contains **64 bytes**, but that coincidence alone does not identify a SHA-512 digest, a key, two-dimensional coordinates, or a GP plaintext register.

## Original-source selection challenge

The previous tree-stencil de Bruijn hypothesis defines a different, conjectural grid-row order `[31,30,28,25,19,6,13,26,20,9,18,4,8,16,0,1,2,5,10,21,11,23,14,29,27,22,12,24,17,3,7,15]`. Under that row order, the same two-channel variation becomes **2.23039**; its black-stencil-zero rotated interpretation gives **2.17876**. A smooth row-to-row source channel would favor the plain printed order in this particular criterion. That only compares hypotheses about the original numeric table's possible semantics; it does not invalidate a de Bruijn order as a possible cryptographic key schedule.

**Next discriminating step:** find a clue in the original illustrations or earlier authenticated Cicada artifacts that specifically calls for treating the last two columns as an ordered coordinate or state channel, then derive a concrete reversible key/clock/offset prediction *before* using unknown LP2 rune values. A cipher inverse must account for all 12,956 runes and 86 neighboring repeats with independently testable unknown plaintext. The present variation statistic cannot supply an identifiable key or authenticate an intended cipher by itself.

The existing `results/README.md` remains the authoritative finding synthesis and correctly reports that the unresolved plaintext has not been recovered.
