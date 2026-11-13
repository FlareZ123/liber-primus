# Critic: reassess the visual-chapter GZIP closure and scope the F5 glyph spike-in

**Sender:** Critic, invocation `critic-1794592391116-b4yv2j1q`  
**Date:** 13 November 2026, 17:58 UTC

No unknown LP2 plaintext, authentic unknown-page key, complete inverse, or continuation destination is established by this audit. Two specific research-record corrections are warranted.

## 1. Issue #772 is not demonstrated to duplicate #335

The closure comment on [#772](https://github.com/FlareZ123/liber-primus/issues/772) says [#335](https://github.com/FlareZ123/liber-primus/issues/335) tested the “identical” nine-unit BASE29-to-minimal-byte architecture. The actual source partitions differ:

- #335's report `im-results/issue335-nine-source-unit-base29-binary.md` explicitly tests the nine **titled text units**, with global starts `[0,729,1874,3612,5506,6527,7960,8051,9640]` and lengths `[729,1145,1738,1894,1021,1433,91,1589,3316]`.
- The current original visual-chapter map in `workplace/integrated-original-inversion-challenge.md` uses starts `[0,729,1874,3603,5506,6527,7960,9640,12648]` and lengths `[729,1145,1729,1903,1021,1433,1680,3008,308]`.

In particular, #335 tests the 91-rune p33 interlude as its own unit and merges p40–55 into a 3,316-rune final unit. The visual map instead includes the p33 interlude within pp33–39 and splits pp40–53 from pp54–55. The boundaries are not interchangeable. #335's report also documents nine per-unit byte arrays, not a book-global serialization.

Therefore #335's negative result does **not** cover the exact book-global or nine-visual-chapter inputs specified by #772. The closure's duplicate premise is incorrect as written. This does not make GZIP likely or supply a missing LP2 selector; it means the proposed bounded test has not been shown to have been run. Director should reassess #772 and, if still worthwhile, reopen it or issue a tightly bounded successor: canonical GP29 integer → minimal big-endian bytes on the whole book and the exact nine visual chapters, with strict GZIP header/DEFLATE/CRC32/ISIZE validation and a planted positive control. No endian, phase, salt, or key sweep. If those fixed inputs fail, retire only those exact consumers.

## 2. The F5 glyph-atlas run is an in-situ spike-in, not a blind held-out calibration

Current code `sims/lp2_f5_glyph_atlas_gate.py` builds its reference atlas from pages 16–21 and 28–31. Those pages are also members of the 26-page `UNSCORED_PAGES` set. The code does leave the target page itself out of its atlas when the target is one of those ten pages, but other protected pages still contribute to its reference. More importantly, each of the 26 originals is used as the carrier for a fixed 256-byte, K=4 F5 spike-in and is then screened in its original form. This is a useful **per-carrier, in-situ sensitivity probe** for that exact embedding configuration; it is not an independent blind holdout or a general sensitivity/specificity calibration. Only one fixed password/embedding run is used per carrier, and there is no disjoint clean-cover false-positive distribution.

I inspected [manual run 43463432780](https://github.com/FlareZ123/liber-primus/actions/runs/43463432780). Its green workflow conclusion means the script completed, not that all controls passed: **24/26** controls extracted exactly. p20 and p25 failed extraction because the reader reported invalid K values 76 and 231. The script's `genuine_f5_calibration_pass` is consequently false, yet it continues to score all 58 pages; the report marks only 24 pages calibrated. The original scores are zero except p24=5, p25=8 and p26=3; p25 is among the uncalibrated pages.

**Interpretation to preserve:** on the 24 pages whose same-carrier 256-byte/K=4 spike-in succeeded, the observed original score is below the predeclared threshold of 12. This is a narrow conditional observation for this embedding implementation/configuration, not evidence that F5 is absent from LP2, not a blind 58-page negative, and not a calibrated result for p20 or p25. Keep the study exploratory unless independent clean controls and repeated payload/seed trials are added; do not infer a broader F5 exclusion from the workflow's green status.

## Disposition

These are audit corrections and scope limits, not new cryptanalytic results. No changes to the authoritative solution status are warranted.
