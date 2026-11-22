# LP2 numeric-table GF(29) double root is case-sensitive to four printed glyphs

**Agent34, 18 November 2026. Evidence: complete finite, source-transcription-conditional calculation.** The canonical 256-cell LP2 numeric table has a zero and zero derivative at GP29 index 24 when read in the conventional base60 alphabet. Among five previously modeled alternative case readings, exactly one is invisible modulo29. All other alternatives individually destroy the **double** root. This is a reproducible check on a conditional cross-page clue, **not** a recovered key, an authenticated operation or decrypted unknown LP2 prose.

## Source and independently fixed selector

Original source scans `resources/liber-primus/66.jpg`, `67.jpg`, `68.jpg` physically print a 32×8 table in 10, 13 and 9 rows. `resources/liber-primus/base60-grid.json` is the canonical working transcription. Its base60 digit alphabet is `0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx`. Treat the first printed two-character cell as the coefficient of X^255 over GF(29), proceeding row-major to the constant term. This polynomial interpretation is a **solver hypothesis**: the table itself prints no polynomial instruction.

The distinct red three-rune GP29 inscription on p39 (source scan `56.jpg`) has ordinary GP **indices 27, 5, 15**, giving `27+5X+15X² = 15(X−24)² mod29`. The initial enlarged rune on p54 also has ordinal 24. These independently printed values motivate evaluating the table at X=24 before considering the result. With the canonical 256 tokens, direct Horner evaluation gives **P(24)=0 and P′(24)=0**. That exact double-root relation was already known from `sims/lp2_grid_radix59_60_double_root_source_sft.cjs`; this report evaluates its robustness to the separately published case alternatives, without claiming first discovery of the root.

## All 32 existing five-glyph transcription alternatives

The codebase already models five possible uppercase/lowercase or I/l changes in `sims/grid_section_column_keys.cjs`. They are **alternative reads**, not demonstrated corrections to the original source image. One-based image page row/column comparisons must respect the 10+13+9 physical row split. Their original zero-based row-major addresses and ordinary base60 values are:

| Cell | Canonical token / byte | Alternative token / byte | P(24), P′(24) if only this token changes |
| ---: | --- | --- | --- |
| 45 | `1l` / 107 | `1L` / 81 | 3, 19 |
| 50 | `0l` / 47 | `0L` / 21 | 17, 28 |
| 165 | `0I` / 18 | `0l` / 47 | **0, 0** |
| 172 | `2S` / 148 | `2s` / 174 | 18, 26 |
| 246 | `3I` / 198 | `3i` / 224 | 12, 19 |

Testing **every one of the 2^5=32 combinations** reveals precisely two that retain both equalities: none of the five alternatives, and only cell165 changed. The cell165 18→47 increment is **exactly 29**, hence no GF29 polynomial can distinguish that pair. Switching all five instead gives **P(24)=21, P′(24)=5**; retaining the root under that counterfactual would require a different selector or altered computation. In the 32-bit mask convention of the test, the surviving masks are **0 and 4**. This is an exact exhaustive claim, with no numerical score threshold or tuned phases.

On the unchanged scans the canonical `2S` at cell172 reads as a capital S, and `3I` at cell246 has no lowercase-i dot. Letters I and l in this font warrant greater caution: JPEG typography may not independently distinguish every vertical stroke. This evidence provides a transcription sensitivity warning and a possible manuscript consistency check. It does **not** prove Cicada intentionally planted a double root: the root and its selectors were discovered during a large cross-artifact search, so neither the two-of-32 figure nor its visual agreement is a prospective significance probability.

## Independent historical BASE29 factor as a second discriminant

The authenticated [2013 TCP `BASE29 3301 → 3QO` example](../resources/external/2013-tcp-server-signed-source.md) fixes a separate ordered numeral triple **[3,26,24]**, under the protocol's ordinary digits. Interpreting these three digits as the constant, linear and quadratic coefficients of **H(X)=3+26X+24X²**, the canonical table's polynomial also has **zero remainder upon division by H**, a previously established source relation from [the dual-factor discriminator](../sims/lp2_p50_radix_dualfactor_discriminator_sft.cjs). The p39 red **G(X)=27+5X+15X²** divides the same polynomial. The historical numeral source establishes the three digits; it does **not** instruct polynomial factorization.

Across the **same 32 predetermined glyph-case combinations** already enumerated above, the remainders of *both* source-derived quadratics are zero only at masks **0 and 4**, exactly the two cases surviving the double-root constraint. Replacing all five yields **H remainder [8,12]** and **G remainder [17,5]** in ascending polynomial coefficient order. Thus four of five case distinctions are simultaneously constrained by both candidate polynomial factors, without fitting letter keys or picking different coefficient orders. Factor divisibility is a much more specific source-conditioned algebraic relation than a single row sum. Nevertheless the apparent clue could remain postselected among many possible numerical operations; no plaintext output or authorial inverse has been demonstrated.

## Decision and reproducibility

The exact original-source result survives if the four GF29-effective case readings are canonical. It is inappropriate to “correct” the working table to the five alternatives and continue relying on the old double-root factorization, or to declare the canonical root a decrypted instruction. The change at cell165 is numerically invisible for every GF29 polynomial test, so this arithmetic cannot adjudicate the original upper/lower glyph there.

The [read-only original-source Node22 CommonJS SFT](../sims/lp2_p50_case_toggle_double_root_sft.cjs), successfully run on [Windows Node22 CI 44289319461](https://github.com/FlareZ123/liber-primus/actions/runs/44289319461) after adding both 2013/p39 factor assertions, asserts the 2014 physical page split, all five canonical source tokens, the p39 marked triad and p54 index24, both exact roots, all 32 toggle states, both exact source-factor remainders, and the two survivors. Its only imports are Node built-ins and repository source JSON. Previous [direct quotient/key-consumer tests](../sims/p50_dualfactor_quotient_direct_gate.cjs) did not recover unknown plaintext. A future advance needs a **source-selected reversible consumer** and untouched readable ciphertext output; more case toggling or extra roots without such a consumer is not a productive next decipherment route.

**Remaining unknowns:** whether the root was authored as a checksum, what the table's actual source-directed role is, how the p39/p54 selectors should be consumed, and every unresolved LP2 page's plaintext.