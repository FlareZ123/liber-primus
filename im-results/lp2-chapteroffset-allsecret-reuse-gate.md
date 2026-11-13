# Chapter-offset all-secret reuse: source-visible nine-chapter obstruction

**Agent35, 13 November 2026. Finite original-English key-independent exclusion.** No unknown LP2 plaintext, key, or continuation destination recovered.

## Original visual clue and cipher hypothesis

Original red-heading layout partitions physical LP2 p0–55 into nine visual chapters. A human solver could reasonably reset a key clock at those source-selected chapter boundaries. This study examines the direct model **C(chapter,offset) = pi_offset(P(chapter,offset))**, where *every chapter reuses the same arbitrary secret GP29 bijection at the same chapter-local rune offset*, and each offset may have an entirely independent hidden alphabet. This covers arbitrary position-specific secret substitutions, with no guessed key, period or additive assumption.

The original chapter rune lengths are **[729, 1145, 1729, 1903, 1021, 1433, 1680, 3008, 308]**, exactly **12,956** unknown runes. At each chapter-local rune offset, count equal-symbol pairs across every pair of chapters with a rune at that position. Any chosen secret bijection preserves these equalities exactly, so this is a key-independent original-input necessary condition.

## Frozen original result

The [canonical original-mapped corpus](../resources/liber-primus/lp2-corpus.json) has **1,161 equality pairs among 35,551 comparisons**, exactly **0.03265730921774352**. A per-offset secret affine bijection (11*x+7*offset+5) modulo29 preserves all the equalities, and the same transformation on an independently native-GP encoded English plant passes. The existing GP source-calibrated English encoder is independently checked against **95/95** original clear p57 runes.

The identical nine chapter sizes were imposed on consecutive source-native English windows of three checked-in control texts, stride 127 GP runes, with identical comparison denominators.

| Finite English control | Windows | Minimum matching pairs / 35,551 | Minimum rate | At or below original |
| --- | ---: | ---: | ---: | ---: |
| Shakespeare | 1,608 | 1,944 | 0.054682006 | 0 |
| Gibran, *The Prophet* | 391 | 2,024 | 0.056932294 | 0 |
| Emerson, *Essays* | 2,429 | 2,014 | 0.056651008 | 0 |
| **Combined** | **4,428** | **1,944** | **0.054682006** | **0** |

The lowest authentic native-English control has **783 more** equalities than original LP2. No key, however nonlinear or source-secret, can change that difference in the stated **same-chapter-offset GP29 alphabet** model.

## Conclusion and exact scope

The source result excludes any identical per-offset GP29 alphabet bijection reused across **all nine** original visual chapters, **conditional on those three GP-native English control corpora**. It is genuinely distinct from the established physical-page-offset all-secret test ([existing source gate](lp2-pageoffset-allsecret-reuse-gate.md)), because source-visible red chapter resets and physical page resets are different clocks.

Independent secret keys for distinct chapters, state evolving with chapter content, transpositions, extra symbols, native orthographic variation and non-English plaintext remain open. The nine cuts are original-image facts but do not establish a historical instruction to reset a cipher. This is a reusable necessary-condition result; it provides no unknown plaintext or authentic key.

**Reproducer:** [source-exact read-only CommonJS SFT](../sims/lp2_chapteroffset_allsecret_reuse_gate.cjs). The source-frozen original, three control datasets, independent solved-p57 spelling and synthetic secret-bijection checks all passed in an actual execution.
