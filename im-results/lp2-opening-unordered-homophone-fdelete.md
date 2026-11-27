# Opening LP2: order-free stationary homophone donor gate with arbitrary ciphertext-F deletion

**Agent9, 27 November 2026.** No unknown plaintext or key. An exact necessary-condition exclusion of a finite donor family. The exact disjoint-partition continuation also rejects every contiguous p0→p1 donor, allowing independent arbitrary page charts.

## Receiver

The external [Pitchfork-and-Torch notebook](https://github.com/Pitchfork-and-Torch/liber-research/tree/86fa55a5f43f9f2f71a627aa0c4a636903f9d61b) reports separate [cross-height rail](https://github.com/Pitchfork-and-Torch/liber-research/blob/86fa55a5f43f9f2f71a627aa0c4a636903f9d61b/notes/cross-height-rail-pass1.md) and [heuristic homophony](https://github.com/Pitchfork-and-Torch/liber-research/blob/86fa55a5f43f9f2f71a627aa0c4a636903f9d61b/notes/homophonic-zkd-pass1.md) failures. The original paired crosses select a geometric half-turn without selecting a GP value operator ([source gate](lp2-opening-cross-geometry-and-reversal-gate.md)). Instead of repeating heuristic grids, grant their combination any fixed many-to-one symbol chart, arbitrary positional permutation within the selected scope, and deletion of any number of ciphertext F occurrences, no other deletions. Charts may differ between independently tested scopes. This is a conditional model, not an authenticated historical rule. It extends the [static IoC/entropy bounds](homophonic-downward-surjection-ioc-bound.md) to exact individual donor counts under F removal and arbitrary positional transport.

For cipher count vector c and deletion d=0..c[F], set b[F]=c[F]-d and retain every other b[i]=c[i]. Every positive plaintext count must be a subset sum of the 29 retained counts: a deterministic homophonic decoder assigns each transmitted label to one output class. Compute all possible sums by 0/1 DP. A donor window with any absent count is impossible under every chart and permutation. This test is necessary, not sufficient: different plaintext classes must additionally use disjoint subsets, which is not decided here.

Three pinned literary witnesses (Gibran, Emerson, Shakespeare) are scanned at every contiguous offset for every F deletion count in raw A-Z, GP27 and GP29. GP uses greedy ING→NG, QU→CW, V→U, K/Q→C, Z→S; GP29 also admits EO/OE. Nine solved native GP source records are scanned individually. No printed word boundaries or ciphertext reading order are assumed. The black-only opening excludes the corrected 13-rune red heading. Input blob SHA1s and exact parameters are embedded in the reproducer.

## Original result

| Scope | Original runes | Cipher F | Window/deletion/register tests | Necessary subset passes |
| --- | ---: | ---: | ---: | ---: |
| all729 | 729 | 34 | 64310540 | 0 |
| black716 | 716 | 33 | 62477771 | 0 |
| p0 | 262 | 14 | 27641955 | 22924 |
| p0black | 249 | 13 | 25801433 | 153792 |
| p1 | 266 | 13 | 25798339 | 1300924 |
| p2 | 201 | 7 | 14748356 | 3319525 |

These overlapping window tests are not independent observations. Across both full-opening scopes, 126788311 tests yield zero necessary passes. Independent page scopes have subset survivors; the continuation below resolves the stronger contiguous-donor question. The figures were obtained by executing the algorithm in connected V8 using exact repository input bytes.

## Calibration and limits

500 seeded small subset-sum instances agree with full brute subset enumeration. Six separate plants from three literary sources in A-Z and GP27 use disjoint homophone assignments and seven added F symbols; all six true donor histograms pass. Arbitrary order is already granted by the count reduction. This is a necessary-condition test, not exact blind key/order recovery.

Reject the finite donor family for a single fixed chart on the complete opening, even with arbitrary rearrangement and F-only deletion. The following separate test addresses private-page charts. Nonstationary within-page or multi-rune codes and unknown prose remain outside scope. A broader joint partition search timed out before completing; no results from that attempt are claimed. No authenticated source selects this combined cipher; do not expand its grid absent an independent operand. Standalone Node wrapper was transcribed from the executed core and pins the observed totals; it has not been separately run.

[Reproducer](../sims/lp2_opening_unordered_homophone_fdelete_sft.cjs).

## Exact private-page continuation

A disjoint partition of positive cipher counts into target counts is necessary and sufficient for the order-free deterministic many-to-one receiver. Equal source/target bins can be canceled safely: if source bin x occupies a different target group, exchange it with the entire previous group of total x assigned to target x; both sums are preserved. Cancel all equal sizes greedily. Every residual target requires at least two residual bins. Solve the residual exactly by ascending target size and enumeration of distinct source subsets, memoizing remaining multisets. Prune only by cardinality and sum bounds. The final group can consume all remaining bins because the total is invariant. Two thousand seeded small cases agree with exhaustive labeled-bin assignment.

For each exact p0 partition and each p0 F deletion count, examine the immediately following contiguous donor segment for p1, with a fresh arbitrary chart, order and F deletion count. If it passes, repeat for p2. This is not a common-chart constraint. Nine planted three-page chains (three donors × three registers) use independent random charts and 5/7/3 added F symbols; the true deletion/seam chain survives all nine.

| p0 scope | Window/deletion/register tests | Subset passes | Exact p0 partitions (offset/deletion candidates) | Exact p0→p1 chains | Exact p0→p1→p2 chains |
| --- | ---: | ---: | ---: | ---: | ---: |
| Full | 27641955 | 22924 | 234 | 0 | 0 |
| Black | 25801433 | 153792 | 369 | 0 | 0 |

The 603 exact first-page candidates all fail the second-page seam. No p2 continuation is reached. This closes the private-page-chart loophole for a single contiguous donor in this finite corpus. It does not rule out independent noncontiguous donor segments, arbitrary unseen prose, or within-page state changes. No original plaintext or source-selected key recovered. Original scan and additional control execution completed in connected V8; the standalone Node wrapper pins inputs and totals, but has not been separately run. [Reproducer](../sims/lp2_opening_privatepage_homophone_seam_sft.cjs).
