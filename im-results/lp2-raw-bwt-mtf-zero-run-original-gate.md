# Raw original LP2 BWT and bzip2 rank-stage receiver

## Source motivation and decision

Cicada's authentic 2014 Stage08 index.bz2 establishes historical use of bzip2. [Issue #1468](https://github.com/FlareZ123/liber-primus/issues/1468) previously tested standard MTF and BWT on a **different input**: the participant-derived 2015 729-rune prime-difference intermediate. It failed. This study instead takes the unmodified original 12,956 GP29 ciphertext runes, retaining physical page order; the block cuts are documented below, as possible serialized ranks. BWT/MTF are authentic historical algorithms, but no first-party LP2 instruction selects this raw receiver. The full raw receiver and the specified bzip2 zero-run extension fail; no authentic plaintext or key is recovered.

## Original-image chapter-boundary correction (25 November 2026)

The original-image chapter map fixes the nine visual ranges as p0–2, p3–7, p8–14, p15–22, p23–26, p27–32, p33–39, p40–53 and p54–55. The earlier MTF and zero-run scripts in this report used legacy cuts [0,3,8,15,23,28,33,40,54,56], which split p23–27 and p28–32. Accordingly, every nine-block result described below as a chapter result is a result for that legacy partition, not the exact original-image chapters. The direct MTF-inverse → BWT-LF composition has now been tested on the correct visual boundaries: all nine fail; see [the exact chapter report](lp2-original-chapter-mtf-inverse-bwt-lf-gate.md). The bzip2 zero-run extension below remains a legacy-partition test and has not been rerun on the corrected chapter ranges.


## Direct circular BWT→MTF

A standard circular BWT sorts all rotations and emits the last column. Its stable LF permutation has one cycle for primitive input, or equal-length cycles for a periodic input. Unequal LF cycle lengths therefore exclude **every primary index** for that complete last-column hypothesis. This is a structural gate, not a language-score guess.

Decode the original as ranks using canonical GP alphabet (also reversed with matching BWT ordering), both move-to-front and move-to-back updates. Test the whole book, the legacy nine-section partition and all 55 nonempty physical pages as independent blocks. Every original MTF tape exactly re-encodes. Nevertheless **0/1, 0/9 legacy sections and 0/55** blocks have equal-length LF cycles in either orientation. With canonical alphabet and whole-book front update the actual cycles are [11228,1202,293,176,26,17,6,4,2,2]; back update [9658,1849,979,442,22,3,2,1]. Reversing both the starting alphabet and BWT collation is a relabeling and repeats these cycle structures; it is not an independent test. No hidden primary index can rescue these specific direct canonical inverses.

## All-secret phase labels

The [recency-rank report](lp2-recency-rank-allsecret-phase-gate.md) proves that repeated-access MTF rank is independent of arbitrary initial alphabet order, equaling the count of distinct intervening symbols. Equal repeat ranks at equal phase force equal emitted ciphertext, irrespective of private phase rank-label permutations. Here use the **BWT last columns** of five fixed full-length historical-source-native Crowley/Blake donor windows, separately BWT-encoded within each genuine block. This is distinct from comparing against raw prose. BWT collation ascending and descending are both tested. Each source-native BWT primary index is generated and all donor text recovered exactly, followed by MTF forward/inverse with a nontrivial initial alphabet and both orientations.

| Reset/phase regime | Periods | Original below all five encoded-donor lower bounds |
|---|---:|---:|
| Global | 1–3301 | 3301/3301, both collations |
| Legacy nine-section partition | 1–1033 | 1033/1033, both |
| Physical pages | 1–130 | 130/130, both |

Global ascending q1: original 2,893,513 same-phase collisions; five donor lower bounds 10,572,044–12,595,990. q3301: original 634 versus 2,383–2,749; smallest positive margin across q is 1,660. This is conditional on comparable native prose and on BWT before MTF, with periodic private rank labels but no run coding, compression entropy stage, altered clock or unknown block boundaries. It does not exclude all possible source objects or arbitrary secret BWT collation.

[Read-only BWT/MTF all-secret SFT](../sims/lp2_raw_bwt_mtf_allsecret_phase_sft.cjs) was executed through connected JS; all positive original/plant invariants passed.

## Standard bzip2 zero-run extension

A genuinely different receiver interprets the raw GP29 tape as the rank symbols after bzip2-style zero-run coding. Standard RUNA/RUNB codes 0/1 represent little-endian digits 1/2 of a bijective binary run length; nonzero MTF rank j emits j+1. Test a 28-symbol intermediate alphabet with implicit block end, all 29×28 ordered assignments of RUNA/RUNB glyphs, and ascending or descending relative order for the remaining 27 glyphs (1,624 maps per block). This is a finite historically typed rank grammar, not all possible private rank permutations. For explicit EOB, use a 27-symbol intermediate alphabet and reserve the actual final glyph as EOB; if that glyph recurs earlier, the entire explicit-EOB interpretation is impossible.

| Original input | Complete implicit-end maps | Valid circular-BWT last columns | Explicit EOB |
|---|---:|---:|---|
| Whole original book | 1,624 | 0 | Impossible: final glyph previously present |
| Legacy section p0–2 | 1,624 | 4 | Impossible |
| Legacy section p3–7 | 1,624 | 2 | Impossible |
| Each remaining legacy section | 1,624 each | 0 each | Impossible each |

Global decoded lengths 13,387–13,535. All implicit-end maps re-encode exactly through the zero-run MTF stage. The six single-cycle chapter candidates genuinely invert and forward-BWT to the same last column, but their 28-symbol IoCs are .03544501–.03640282 (uniform 1/28=.03571429), no native prose under direct register. Their RUNA/RUNB assignments are disjoint between legacy sections: first chapter (1,14 reversed), (6,26 ascending), (14,26 reversed), (22,10 reversed); second (5,21 ascending), (12,8 ascending). Thus **no common map passes even those first two legacy sections**, and every remaining chapter fails independently. This excludes the fixed-rank-order implicit-end architecture without choosing a primary index to score text. The genuine bzip2 EOB cannot be the repeated original final glyph.

Three complete authentic-source-native GP plants of 12,956 runes, with 28, 28 and 29 observed symbols respectively, round-trip BWT→zero-run MTF→inverse MTF→inverse BWT exactly. Their rank-code lengths are 11,174, 11,280 and 11,564; the two RUNA/B labels jointly occur 2,446, 2,398 and 2,459 times. These controls validate the direct grammar, not the source-selected alphabet or framing. [Reproducer](../sims/lp2_raw_bzip2_zero_run_original_sft.cjs) executed in connected JS; no CI claim.

## Next decision

Retire these raw direct rank stages. A genuine complete compressed file with typed framing, RLE1, entropy-coded blocks, checksums, and an authenticated primary index is a different hypothesis. The original artwork and stage materials do not presently identify such framing. Do not widen the tested rank maps to arbitrary 29! permutations, search arbitrary block splits, or tune primary rows without independent evidence. All 56 unknown LP2 pages remain undeciphered.
