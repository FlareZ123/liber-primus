# Secret digraph tables and transposition layer order

**Decision (Agent40, 27 November 2026):** The reverse-order receiver is also conditionally excluded: arbitrary plaintext transposition before one or two fixed GP29² tables fails every 3000-rune p40–53 native reference window, and fixed-width row-major four/eight-table variants fail all possible column pairings.  eight of nine original LP2 chapters exclude the full-width rectangular, fixed-digraph-bijection plus arbitrary fourteen-column transposition architecture against every equal-length contiguous window of three native-GP literary references. The short terminal chapter survives the scalar count alone, but an exact row-equality signature rejects all 601,145 eligible contiguous literary/solved-native windows there. No unknown plaintext or authenticated key. The actual pairing-recovery algorithm recovers both concealed planted pairings, including their relative orientations. Do not infer a historical fourteen-column LP2 instruction from this result.

## Why this is a separate receiver

Earlier [static adjacent digraph gate](lp2-chapter-pair-sum-fiber-gate.md) and [page/line/word clocks](lp2-fixed-digraph-bijection-gate.md) do not cover a transposition separating the two encrypted coordinates. An authentic 2014 fourteen-column **within-row permutation** is reproduced in [the p33 transfer report](lp2-p33-actual-2014-14column-transfer.md). This motivates fixing width14 before looking at LP2; it does not independently select a digraph layer. Allow a much more general secret permutation than the historical fixed order, and additionally test rectangular column-major readout (a different, exploratory serialization).

At each visual chapter start take a complete R×14 rectangle, with R=floor(N/14), and leave the fewer-than-14 terminal runes unconstrained. The sender packs consecutive native plaintext digraphs into the row, applies any fixed arbitrary bijection pi on GP29² independently to each pair, then applies any one fixed permutation of the 14 columns; serialize row-major or column-major. Independent pi and permutation per chapter are granted. Rows themselves stay in source order. A pair-slot permutation changes no collision counts, and globally reversing all pair orientations also leaves them invariant. Thus the unknown column permutation is quotiented to 13!!=135,135 matchings and 2^6 relative orientations, covering 8,648,640 oriented pairing classes per layout.

## Exact optimization, not a sampled search

For each candidate oriented edge e=(column i,column j), let h_e(v) count its R ordered GP29 digraphs, v=0..840. For a perfect matching M, ordered collision count is

    Q(M) = sum_e sum_v h_e(v)(h_e(v)-1)
           + 2 sum_{e<f} sum_v h_e(v)h_f(v).

Swapping edge orientation transposes its histogram. Precompute the two possible cross terms (equal vs unequal orientation). Enumerate every perfect matching. Its sum of independent maximum cross terms is an admissible upper bound; only if that bound is below the current exact incumbent may all 64 orientations be skipped. Otherwise evaluate all orientations, count exact ties and retain a witness. Every reported maximum is exact, and the selected pairing is replayed to assert its collision count. This does not assume a particular pi, an English word segmentation, or a key shared between chapters.

## Original results

| Physical pages | Complete runes | Maximum Q, row-major | Maximum Q, column-major | Minimum native Q |
|---|---:|---:|---:|---:|
| 0–2 | 728 | 260 | 258 | 548 |
| 3–7 | 1134 | 544 | 554 | 1392 |
| 8–14 | 1722 | 1092 | 1090 | 3490 |
| 15–22 | 1890 | 1336 | 1334 | 4232 |
| 23–26 | 1008 | 438 | 428 | 1092 |
| 27–32 | 1428 | 804 | 802 | 2398 |
| 33–39 | 1680 | 1064 | 1088 | 3332 |
| 40–53 | 2996 | 3110 | 3066 | 11102 |
| 54–55 | 308 | 86 | 70 | 66 |

Native floors are exact rolling counts over every contiguous equal-length GP-encoded Gibran, Emerson and Shakespeare window, both start parities, using the same source-calibrated orthography as #3147. For example, p40–53 has 59,497+318,332+214,111 reference starts, all above its exact original maxima. No language score optimization or arbitrary donor selection. The table compares a necessary invariant, not population p-values; new prose can differ from the references.

Two independent planted 2996-rune controls: random 841-way pi, independent secret permutation of 14 columns, Gibran column-major (seed 0x14002901) and Emerson row-major (0x14002902). Ciphertext-only maximization uniquely recovers all seven true unordered pairings and all relative orientations (modulo global reverse) in both plants: Q=13,318 and 14,658 respectively. Pair-slot order and pi are **not** blindly recovered. Given the actual full encryption key, all 5,992 runes invert exactly. These are nontrivial pairing-recovery controls, not solved authentic plaintext.

## Exact terminal donor-crib continuation

p54–55's 308 runes form 22 complete rows. The scalar collision range allows possible native controls. Define S[r,s] as the number of equal digraph-position pairs between rows r,s, counting unordered within-row pairs on the diagonal. Any fixed bijection and fixed pair-slot order preserve S exactly. It is also invariant under global simultaneous reversal of all pair coordinates. Row reversal is allowed as an additional concession.

Scan all 600,004 literary and 1,141 solved-native contiguous 308-rune windows. Only 1,078 distinct signatures have Q<=86 (Gibran6, Emerson442, Shakespeare630; solved0). Exact matching bounds leave 993 row-major and 413 column-major unordered matchings worth checking. After orientations and the scalar floor, 623 and 38 orientation classes respectively survive. Every one fails every reference signature, even allowing row reversal: **zero exact donor alignments**. A planted 308-rune control verifies signature invariance under an arbitrary bijective affine permutation of 841 labels, pair-slot reversal and full row reversal. No claim of excluding arbitrary newly composed terminal prose.

## Ragged-column readout extension (same fixed width)

The preceding rectangular result left a specific loophole: a conventional column-major transposition may consume the entire chapter, with t=N mod14 columns of length R+1 and the remainder length R. The unknown permutation then also hides which output columns are long. Do not simply truncate the serialized ciphertext prefix.

For column j let k be the number of long columns preceding it. Its first R symbols begin at jR+k. Enumerate every feasible prefix count max(0,t−(14−j))≤k≤min(j,t). Two or four selected column starts coexist in some long/short pattern iff the sorted prefix increments are nonnegative and at most the corresponding column-index increments, together with the individual endpoint ranges. Build every feasible ordered-pair histogram of the first R symbols, granting every partial final row unconstrained. For each unordered column-index pair, take its maximum within-edge collision count over all feasible starts; exact maximum-weight perfect matching gives U_self. For every pair of disjoint edges and all simultaneously feasible starts, maximize the histogram inner product over both relative orientations, giving U_cross. For every true matching and every ragged geometry,

    Q <= U_self + 42 U_cross.

The two maxima need not be jointly attainable; this is a deliberately optimistic upper bound, not the exact ragged optimum. Even this bound is below the same finite native floors in every previously excluded chapter with a ragged tail:

| Pages | Extra runes t | U_self | U_cross | Rigorous upper bound | Native floor |
|---|---:|---:|---:|---:|---:|
| 0–2 | 1 | 62 | 11 | 524 | 548 |
| 3–7 | 11 | 110 | 21 | 992 | 1392 |
| 8–14 | 7 | 222 | 40 | 1902 | 3490 |
| 15–22 | 13 | 248 | 41 | 1970 | 4232 |
| 23–26 | 13 | 72 | 17 | 786 | 1092 |
| 27–32 | 5 | 172 | 31 | 1474 | 2398 |
| 40–53 | 12 | 510 | 87 | 4164 | 11102 |

p33–39 and p54–55 have no ragged tail, so the earlier exact results apply. Row-major readout of the complete rows is unchanged. Thus the width14 chapter-start result now includes conventional ragged column-major serialization under an arbitrary permutation, even relaxing the association between long column identities and the secret pairing. It still does not address arbitrary row permutations, per-row column keys, variable pair maps or other widths. No plaintext recovered. [Ragged-bound SFT](../sims/lp2_digraph_column14_ragged_bound_sft.cjs), [raw output](lp2-digraph-column14-ragged-bound-output.json). Live V8 execution; native floors reused from the first SFT, not independently recomputed by this small extension.

## Reverse layer order: arbitrary pretransposition and secret pair tables (27 November, Agent40 draw1)

The earlier result assumes the digraph map is **before** transposition. A different sender can first permute plaintext coordinates, then pair them and encrypt under an arbitrary GP29² bijection. Native adjacent-digraph collisions no longer constrain this sender, because the original plaintext neighbors can have been separated. The p40 eight-red-rune heading and exact 3000-rune black body (375×8) motivate both a broad order-independent gate and a tighter row receiver. Neither selects a historical digraph operation.

### Exact concentration capacity for any input permutation

For one fixed pair table, write the observed 841 digraph counts in descending order h[1] ≥ … ≥ h[841], and H(j)=sum of the largest j counts. For any set S of k plaintext GP29 symbols, exactly k² distinct plaintext pair labels have both coordinates in S, exactly 2k(29−k) have one, and the remainder have zero. Under any 841-element bijection, the rearrangement inequality therefore gives

    plaintext occurrences of symbols in S ≤ H(k²) + H(58k−k²).

This is sharp for a single k and any pair histogram (assign the largest counts to the double-weight cells and the next largest to the single-weight cells). The same bound applies to the k most common plaintext symbols, and is invariant under **every** length-preserving plaintext coordinate permutation, including any columnar or arbitrary shuffle before pairing. It also allows arbitrary ordering of complete encrypted pairs after a stationary table. For q independent maps with fixed public period q in pair ordinal, sum the bounds over the q observed phase histograms. On odd-length chapters allow the unpaired rune on either end and count it toward every top-k bound; maximize each k separately across these two phases, an optimistic relaxation. There is no hidden alphabet search and no need to assume the printed spaces survive.

Every contiguous full-length GP-encoded Gibran, Emerson and Shakespeare window is compared at all k=1…28; a pass means necessary-envelope compatibility only. Using the identical three pinned input blobs and serializer as above:

| Physical region | Runes | Native windows | Pass q=1 | Pass q=2 | Pass q=4 | Pass q=8 |
|---|---:|---:|---:|---:|---:|---:|
| 0–2 | 729 | 598741 | 323673 | 598741 | 598741 | 598741 |
| 3–7 | 1145 | 597493 | 5156 | 597493 | 597493 | 597493 |
| 8–14 | 1729 | 595741 | 0 | 350785 | 595741 | 595741 |
| 15–22 | 1903 | 595219 | 0 | 258493 | 595219 | 595219 |
| 23–26 | 1021 | 597865 | 52377 | 597865 | 597865 | 597865 |
| 27–32 | 1433 | 596629 | 0 | 534185 | 596629 | 596629 |
| 33–39 | 1680 | 595888 | 0 | 445856 | 595888 | 595888 |
| 40–53 | 3008 | 591904 | 0 | 0 | 551512 | 591904 |
| 54–55 | 308 | 600004 | 600004 | 600004 | 600004 | 600004 |
| 40–53 black body | 3000 | 591928 | 0 | 0 | 552399 | 591928 |

For p40's exact black body the top-eight ceiling is 1436 (q1), 1688 (q2), 2041 (q4), 2193 (q8); the minimum native top-eight count is 1644. The q2 top-eight test alone is insufficient, but **every** reference window violates some k by at least 83 occurrences (q1 by at least 299). Thus even arbitrary plaintext transposition cannot rescue the stationary/alternating pair-table hypothesis for this region. Five of nine whole chapters reject q1, independently of any chosen plaintext pairing. The shorter chapters' passes are not decoded text or evidence of a key. q4/q8 surviving the broad envelope warrants a more source-specific test rather than a larger unrestricted table search.

Three planted controls use arbitrary shuffled plaintext coordinates and independent random 841-element bijections, including authentic clear p57 as native plaintext. All three pass every bound; actual full-key inverses recover 3000 + 3001 + 95 = 6096 runes. The test does not infer the full key. [Standalone SFT](../sims/lp2_digraph_pretransposition_capacity_sft.cjs), [raw all-k and per-corpus output](lp2-digraph-pretransposition-capacity-output.json), commits f0dfa9a4 and 3f139fd3.

### Source-width eight: exact row-slot spectrum gate

Fix the 375×8 black body geometry, but grant **any** secret permutation of the eight plaintext columns, followed by four arbitrary independent pair bijections (one per pair slot) or eight such bijections (separate pair slots on alternating rows). This includes the literal red8 ascending rank order and its inverse; the arbitrary permutation is a much stronger concession. The row-major sender is fully reversible given the column permutation and phase maps. q4 is additionally invariant to arbitrary reordering of the whole plaintext rows. q8 requires the specified alternating row classes.

For each candidate unordered native column edge, tabulate the multiplicity spectrum of its 841 pair labels over 375 rows (q4) or over 188/187 alternating rows (q8). An arbitrary bijection preserves the entire spectrum, not merely ordered collision count Q. Reversing an edge swaps pair coordinates and also preserves it. A valid column order is equivalent to an assignment of the four disjoint edges to the four observed pair slots with identical spectra (both alternating spectra for q8). Exact masks plus recursive perfect matching test all assignments. Rolling windows independently cover every start modulo8; no sampling or learned score.

Original q4 Q values are 162,212,168,162. The q8 values are 46,60,56,54,48,52,50,38. Full target spectra are preserved in the output. Across all 59,493 Gibran, 318,328 Emerson and 214,107 Shakespeare native windows, **not even one candidate column edge matches any original target slot** under either q4 or q8. Hence zero complete pairings, including all 8! column permutations and arbitrary independent bijections. Under the fixed-width row model this closes the broad q4/q8 envelope's apparent survivors; it is not an exclusion of arbitrary input shuffles with q4/q8.

Two concealed row-permutation/pair-table plants recover the unique unordered column pairing and slot assignment from their known donor windows (four edges each, both q4 and q8), and 6000/6000 runes with the actual full keys. Edge orientation and individual table entries are not recovered from spectra. These are model-matched plants, not historical-key recoveries. [SFT](../sims/lp2_p40_pretransposition_phase_digraph_sft.cjs), [raw spectra and witnesses](lp2-p40-pretransposition-phase-digraph-output.json), commits 30efc51b and 40697390. Both cores actually executed using live repository input in V8. Standalone Node wrappers have not been run separately.

**Decision:** retire q1/q2 arbitrary-input-transposition pair tables as a common native-prose architecture on p40–53, and retire the specific row-major 375×8 q4/q8 pair-table receivers. Column-major pretransposition with q4/q8, arbitrary rune-level shuffles under q4/q8, genuinely dynamic maps, compression, and different native text remain outside these gates. No newly decoded original rune, authentic key, or author-selected pair layer follows. Do not widen clock counts solely to rescue the hypothesis.

## Scope and continuation

Retire this chapter-start 14-column hybrid, including conventional ragged column-major readout, as a common native-prose architecture. The terminal-only interpretation with novel prose is not ruled out by the scalar gate, but it has no source-selected pairing, pi, or credible donor. Different rectangle origin, unconventional ragged framing, arbitrary row permutation (not just reversal in the terminal test), variable cipher state, other widths, and non-native source register are outside the experiment. These are the scope limits of the fourteen-column posttransposition gate; the reverse-order receiver and its separate exclusions are stated above. No further arbitrary width sweeps absent an independent clue. The full-key architecture can be inverted in principle; a new source anchor would need to select the unknown pair-slot order and pi. The established plaintext frontier remains unchanged.

Reproduce with [exact pairing SFT](../sims/lp2_digraph_column14_pairing_sft.cjs), [raw pairing output](lp2-digraph-column14-pairing-output.json), [terminal crib SFT](../sims/lp2_digraph_column14_terminal_crib_sft.cjs), and [raw terminal output](lp2-digraph-column14-terminal-crib-output.json). Input Git blob hashes are recorded in both outputs. Both functions actually executed against live repository inputs in V8; no separate Node/CI replay claimed.
