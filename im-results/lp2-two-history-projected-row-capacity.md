# GP29 two-history projected-row substitution: exact private-frame bound

**27 November 2026 — Agent 4.** No unknown LP2 plaintext or authentic key. A ciphertext-only method identifies a hidden linear state projection in three full-length native controls, but no such stationary or illustrated-chapter-private projected-row receiver can accommodate any of 567,679 matched native reference windows. Even with arbitrary physical-page cuts and private row permutations, a necessary majorization bound requires at least 12 independent frames. This is a finite-reference exclusion and architecture constraint, not a cipher attribution.

## Receiver and causal rationale

The low adjacent-repeat rate and flat conditional rune spectra motivate considering a recoverable state richer than the immediate ciphertext predecessor. The [previous-cipher row gate](lp2-previous-cipher-row-collision-allsecret-gate.md) tests one-history rows; [linear two-tap residual feedback](lp2-phase-private-two-tap-feedback.md) is a different receiver. Here grant **arbitrary** secret bijections on all 29 symbols, selected by a scalar projection of the preceding two ciphertext runes:

```
s_i = a C_(i-1) + b C_(i-2) mod 29
C_i = pi_(s_i)(P_i)
P_i = pi_(s_i)^(-1)(C_i)
```

All nonzero coefficient pairs reduce, by row renaming, to the 30 projective directions (1,t) for t=0..28 and (0,1). A constant row is dominated by every such relaxation. The first two positions of each frame are granted arbitrary plaintext independently of the rest. This gives an exact inverse when state projection and rows are known. There is no authenticated LP2 clue selecting this two-history law; its value is as a sharply bounded extension of the prior state hypothesis, not a license to search more arbitrary state rules.

## Exact histogram bound, even under arbitrary plaintext transport

For a fixed direction, count observed ciphertext labels in each state row: h[s,x]. The sum of the k most frequent plaintext labels anywhere in the frame cannot exceed

```
U_k = 2 + sum_s sum_{j=1..k} sorted_desc(h[s,:])[j].
```

The two free initial positions are counted in the upper bound for every k. Every row is independently permutable, so this bound permits all secret rows without any optimization of an English score. Maximize separately over all 30 projections. Across private frames, add these prefix bounds, allowing each frame independent direction and row permutation. A global plaintext histogram must satisfy every k bound even after arbitrary cross-frame positional transport. The maximizing direction, rows and partition may differ by k, so passing is necessary only.

Use all 12,956 canonical unknown runes and the nine genuine illustrated chapters; p50 has no runes. Exhaustively scan every contiguous 12,956-rune window of the three pinned literary control streams, using the same greedy GP chart convention as the earlier digraph study (QU→CW, V→U, K→C, Z→S). The deficit for a donor is the largest excess of its sorted histogram prefix over the exact upper envelope. Positive deficit excludes that donor.

| Donor | Windows | Global minimum deficit | Nine chapter-private minimum deficit |
|---|---:|---:|---:|
| Shakespeare | 205,845 | 2,924 | 693 |
| Gibran | 50,159 | 3,150 | 819 |
| Emerson | 311,675 | 3,256 | 932 |
| Total | 567,679 | 0 survivors | 0 survivors |

All 567,679 pass the relaxed 55-page-private envelope; do not interpret this as an actual page-private key.

## Exact physical-cut dynamic program

Let E(l,r,k) be the maximum above over directions for a frame consisting of contiguous rune-bearing physical pages l through r−1. Compute all 1,540 intervals with incremental state histograms, omitting exactly two initial symbols per interval. For each k, the recurrence

```
D(0,0,k)=0
D(b,r,k)=max_{b-1 <= l < r}(D(b-1,l,k)+E(l,r,k))
```

computes the best possible bound with b private frames and cuts restricted to physical page boundaries. It independently optimizes every k; monotonicity follows because splitting a frame can retain the same direction/rows and grant additional free initial symbols. The code checks monotonicity and selected interval histograms against direct recomputation. The zero-rune p50 cannot create a new independent nonempty frame by itself.

Distribution of the **first passing necessary envelope**, not the true minimum number of actual keys/frames:

| Independent nonempty frames | Shakespeare | Gibran | Emerson |
|---|---:|---:|---:|
| 12 | 34,440 | 0 | 0 |
| 13 | 73,641 | 37,514 | 0 |
| 14 | 96,298 | 11,139 | 69,644 |
| 15 | 1,466 | 1,506 | 229,347 |
| 16 | 0 | 0 | 12,684 |

Thus even an adversarially selected partition at arbitrary physical-page cuts needs at least 12 independently keyed frames for any reference window. This is stronger than testing the nine fixed illustrated chapters, and no source selects those extra resets. It does not exclude cuts within pages, arbitrary nonlinear state partitions, wider histories, literal-F clocks, non-bijective representations, or new prose outside the frozen donor register.

## Constructive projection inference

On each of three independently permuted 29-row plants of length 12,956 (fixed seed 0x412711; source start 123), select the projection with maximum conditional equality rate using only the first 6,478 ciphertext runes. Freeze the direction and evaluate on the second half. This is ciphertext-only projection recovery; row inverses remain an oracle.

| Plant | True and recovered direction | Fit rate | Runner-up | Held rate | Exact decode with oracle rows |
|---|---:|---:|---:|---:|---:|
| Shakespeare | 4 | .061738 | .036240 | .060878 | 12,956/12,956 |
| Gibran | 19 | .059766 | .035701 | .061129 | 12,956/12,956 |
| Emerson | 29 (0,1) | .063929 | .035433 | .063613 | 12,956/12,956 |
| Original LP2 | 0 (1,0), no ground truth | .035319 | .035201 | .035472 | — |

The selected original direction is just the immediate predecessor; its held rate is near uniform, unlike the positive plants. Do not construe it as an authenticated key. The exact histogram exclusion above does not rely on this heuristic.

## Reproduction and decision

- [Standalone CommonJS SFT](../sims/lp2_two_history_projected_row_capacity_sft.cjs).
- [Raw output, all 55 reset envelopes, native distributions, witnesses and source blob pins](lp2-two-history-projected-row-capacity-output.json).

The numerical core was executed in connected V8, including exact interval cross-checks and all donor scans. The standalone Node filesystem wrapper has not been run separately. Retire the ordinary-consuming global and chapter-private projected-row family on these donor registers; do not infer resets from the passing relaxed envelopes. Reuse the projection recovery only if independent source evidence identifies a relevant state law. No authoritative plaintext frontier change.
