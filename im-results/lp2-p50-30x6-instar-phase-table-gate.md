# p50 30×6 INSTAR phase-table receiver gate

**Agent 21, 26 November 2026 — bounded negative.**

## Source-selected hypothesis

The 256 two-character tokens in `resources/liber-primus/lp2-grid-256.json` form a 32×8 panel across LP2 pp.49–51. Removing a one-cell perimeter leaves a 30×6 interior (180 cells), while the p57 poem says to “shed our own circumferences.” GP29 has 29 rune symbols; the sixth-column count matches the six letters of **INSTAR**, repeated by the p57 poem and the 2013 audio title.

Tested the specific hypothesis that the 30×6 interior is a symbol-dependent six-phase GP29 table: row = current ciphertext rune (0–28); column = position in INSTAR; cell = base60 token value reduced modulo 29. Output was tested as direct cell value, or ciphertext ± cell modulo 29. Phase either advanced every rune or held on literal F; column order was natural INSTAR or standard keyword-rank order. This gives 12 predeclared variants.

The weakest assumption is interpreting a base60 cell reduced mod29 as the intended action. No phase-start search or arbitrary row/column permutations were allowed.

## Reproduction

- Source grid and corpus pinned to commit `ba3e23405607786150be78f02e92f7dac03df560`.
- SFT: [`sims/lp2_p50_30x6_instar_phase_table_sft.cjs`](../sims/lp2_p50_30x6_instar_phase_table_sft.cjs).
- Runner: [`.github/workflows/manual-p50-instar-phase-table.yml`](../.github/workflows/manual-p50-instar-phase-table.yml).
- Final null-calibrated run: [45863558535](https://github.com/FlareZ123/liber-primus/actions/runs/45863558535), artifact `p50-instar-phase-table-results`.

The test scored all 12 variants against the 12,956 unknown p0–55 GP29 indices using the repository's Shakespeare-derived trigram model. A deterministic 1,000-replicate null permuted the 29 rune rows while keeping the extra separator row fixed, and corrected for the same best-of-12 selection.

## Result

| Measure | Result |
| --- | ---: |
| Untransformed ciphertext score | −4.36983 |
| Best candidate | Direct substitution, natural INSTAR order, no F-hold |
| Best candidate score | −4.30409 |
| Null median (best of 12) | −4.29250 |
| Null 95th percentile | −4.27947 |
| Null 99th percentile | −4.27145 |
| Empirical p-value | **0.9421** |

The best candidate is worse than the null median. Its opening transliteration begins `CTHAEAEOEEDJRFMOETEACMCNCMIEAHARAEEALAEAECAUSEAMTHAAEIAFADDE...`, not recovered prose. No plaintext or key material is recovered.

## Decision

Reject this particular 30×6 INSTAR phase-table consumer. The 180-cell interior geometry remains a source-derived structural observation, but it does not establish this operation. Do not rescue it with new modulo rules, phase offsets, alternative row orders, or additional layers without a new independent clue. This result does not exclude every possible use of the p49–51 grid.
