# Line-local three-rail transposition with shared GP29 substitutions — original-input gate

**Decision: retire this exact composition for the tested native-GP register.** No unknown plaintext or key was recovered.

## Source selector and frozen model

The original LP2 p22 image (resources/liber-primus/39.jpg, archive image 39) contains three upright posts across a horizontal beam. Reading this as a three-rail selector is plausible, but it is not an explicit cipher instruction. The authentic printed rune lines provide the partition: 594 physical rune lines across 55 rune-bearing pages, with a maximum line length of 26. The original p50 page has no rune text.

Freeze one standard line-local three-rail zigzag, with rail assignment r(j)=0,1,2,1,0,1,2,1,… for rune position j within each original line. For each line, take the runes on rail 0, then rail 1, then rail 2 to form the ciphertext line. Apply one shared bijective GP29 substitution π₀, π₁, and π₂ to the respective rails. The three maps are global across all lines and pages; there are no line-private or page-private keys. Word separators, punctuation, whitespace, line breaks and page breaks are unchanged framing. No rune crosses a printed-line boundary.

The key budget is exactly (29!)³ ≈ 2^308.41 possibilities. No offsets, extra layers, alternate rail counts or tuned per-page parameters are admitted.

## Exact inverse

For each ciphertext line of n runes, split its row-wise encoding into rail lengths:

- n₀ = floor((n+3)/4)
- n₂ = floor((n+1)/4)
- n₁ = n − n₀ − n₂

Apply π₀⁻¹, π₁⁻¹, and π₂⁻¹ to the corresponding chunks, then interleave them in the original 0,1,2,1 path. Concatenate the recovered rune lines while retaining the unchanged non-rune framing. The implementation tests exact recovery of all rune slots and all non-rune framing.

## Key-independent equality constraint

For rail r, let Nᵣ,ₐ be the number of occurrences of GP29 symbol a among all plaintext positions assigned to that rail, pooled across all 594 lines. Define

Mᵣ = Σₐ Nᵣ,ₐ(Nᵣ,ₐ−1)/2.

A bijection πᵣ only relabels the 29 counts, so Mᵣ is invariant for every possible secret substitution map. The ciphertext line can be split into its three row-wise rail chunks without knowing any key. This gives an exact necessary condition before any language scoring or key search.

## Original-input results

The source parser cross-checks all 12,956 runes against the canonical corpus and reconstructs 594 physical lines across 55 rune-bearing pages. The pooled rail sizes are 3,457 / 6,333 / 3,166.

| Rail | Original collision pairs | Minimum across 49,537 matched native windows | Original below that minimum |
|---|---:|---:|---:|
| 0 | 206,004 | 336,272 | 38.7% |
| 1 | 691,579 | 1,157,126 | 40.2% |
| 2 | 172,952 | 281,566 | 38.6% |

The total original count is **1,070,535**, below the minimum native-window total **1,824,634** (41.3% below). The three per-rail minima occur at different offsets; the total minimum is measured over complete windows, not obtained by summing those minima. There are **zero** of the 49,537 windows at or below the original total, and zero windows at or below all three original rail counts.

The native register is the 62,492-rune GP29 encoding of resources/control/gibran_prophet_58585.txt. Every contiguous 12,956-rune window was tested with the exact original 594 line lengths and the same line-local rail assignment. This is a finite Gibran-register comparison, not a theorem about every possible English or plaintext corpus.

## Controls

- **Matched native-GP positive:** a 12,956-rune Gibran window beginning at offset 12,345 was encrypted using three deterministic shared bijections (seed 0x2463c0de). The exact inverse recovered all 12,956 runes and every non-rune framing character; all three collision invariants were preserved.
- **Independent uniform-pad null:** 1,000 independently sampled uniform GP29 streams (seed 0x33012463) were measured under the same line/rail mask. The original lies at the 56.2nd, 62.1st and 71.0th percentiles of the three rail distributions; its total is at the 65.1st low-tail percentile. Its rail collisions are therefore ordinary for the independent uniform null, not for the tested native-Gibran windows.
- **Reproducibility:** the source-backed Node 22 run completed successfully at [GitHub Actions run 45303471463](https://github.com/FlareZ123/liber-primus/actions/runs/45303471463). Re-run with node sims/lp2_line_local_3rail_shared_substitution_sft.cjs.

## Interpretation and limits

The exact line-local three-rail / three-global-bijection composition is rejected against the tested native-GP Gibran register: every possible choice of its three bijections must preserve the observed per-rail collision counts, and no matched native window satisfies them. The independent uniform-pad null is consistent with the original counts. This is a bounded negative, not a recovered solution.

It does **not** exclude other transpositions or rail counts, a different source-selected read order, per-line/private alphabets, changing-state or homophonic mechanisms, altered word segmentation, non-GP plaintext, or an external key. The p22 image remains a suggestive visual clue, not proof that the creator intended a rail fence.

## Prior work distinguished

- [Pure-transposition IoC gate](pure-transposition-ioc-original-gate.md) excludes a global rune permutation without the present line-local, rail-specific substitutions.
- [Conditional-permutation invariant](conditional-permutation-ioc-invariant.md) and [all-period secret-phase gate](lp2-allperiod-secret-phase-bijection-original-gate.md) test fixed-position families, not this line-local composition.
- [Continuous p22 three-rail fence test](lp2-p22-three-rail-fence-sft.md) tests a continuous three-rail permutation without the three shared rail substitutions. The present test is distinct.
- [Reproducer](../sims/lp2_line_local_3rail_shared_substitution_sft.cjs).
