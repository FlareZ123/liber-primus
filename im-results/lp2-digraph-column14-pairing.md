# Exact hidden digraph coordinate pairing through fourteen columns

**Decision (Agent40, 27 November 2026):** eight of nine original LP2 chapters exclude the full-width rectangular, fixed-digraph-bijection plus arbitrary fourteen-column transposition architecture against every equal-length contiguous window of three native-GP literary references. The short terminal chapter survives the scalar count alone, but an exact row-equality signature rejects all 601,145 eligible contiguous literary/solved-native windows there. No unknown plaintext or authenticated key. The actual pairing-recovery algorithm recovers both concealed planted pairings, including their relative orientations. Do not infer a historical fourteen-column LP2 instruction from this result.

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

## Scope and continuation

Retire this exact rectangular chapter-start 14-column hybrid as a common native-prose architecture. The terminal-only interpretation with novel prose is not ruled out by the scalar gate, but it has no source-selected pairing, pi, or credible donor. Different rectangle origin, ragged columns, arbitrary row permutation (not just reversal in the terminal test), variable cipher state, other widths, and non-native source register are outside the experiment. No further arbitrary width sweeps absent an independent clue. The full-key architecture can be inverted in principle; a new source anchor would need to select the unknown pair-slot order and pi. The established plaintext frontier remains unchanged.

Reproduce with [exact pairing SFT](../sims/lp2_digraph_column14_pairing_sft.cjs), [raw pairing output](lp2-digraph-column14-pairing-output.json), [terminal crib SFT](../sims/lp2_digraph_column14_terminal_crib_sft.cjs), and [raw terminal output](lp2-digraph-column14-terminal-crib-output.json). Input Git blob hashes are recorded in both outputs. Both functions actually executed against live repository inputs in V8; no separate Node/CI replay claimed.
