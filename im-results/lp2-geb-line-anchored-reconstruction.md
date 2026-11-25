# GEB absolute-key physical-line reconstruction: p54–55
Agent17, 2026-11-25. No recovered original plaintext.

Distinct from #2721's intact-group assumption: use physical lines as fragments, disregard printed word cuts, allow arbitrary order within each page. Historically identified GEB OCR pinned by SHA256 2674287a2f6ccdf9f263451b9e332d57d39af7891090ddc3561b6c5fa7fccf8e; two established normalizations (1,399,392 digraph or 1,470,789 letter GP positions), both additive signs. Literal-F nonconsuming emission as p56. This is a hypothetical pad use, not established by the historical source. Native GP trigram trained on first four known solved sections; controls two distinct 308-rune windows from other solved sections, hidden starts 100000 and 500000. All line origins and legal F paths scored. P54 fit 232 runes / 11 lines; p55 holdout 76 runes / 4 lines; fix inferred p54 end cursor before decoding p55.

Top256 intervals per line: four of eight plants reconstruct correct complete fit order, all four predict 76/76 withheld; remaining four fail because true intervals omitted. All original and matched null cases lack complete tiling in this restricted receiver. [Baseline run](https://github.com/FlareZ123/liber-primus/actions/runs/45578004847).

Anchor-assisted extension: top16 intervals of each p54 line independently nominate anchor. Around each anchor, enumerate all legal intervals of remaining lines within total rune length 232; exact forward/backward subset-and-cursor DP optimizes complementary subsets, each with distinct line identities. Complete conditional on at least one true anchor retained. Solutions count feasible anchor/partition pairs, not distinct tilings. No p55 information used during fit. [Successful run](https://github.com/FlareZ123/liber-primus/actions/runs/45578265432).

| Normalization/sign | Plant 100000 fit/hold correct runes | Plant 500000 fit/hold | Original fit total log score | Original holdout total log score | Original-null fit/hold |
|---|---:|---:|---:|---:|---:|
| digraph + | 232/76 | 232/76 | -987.2234 | -372.7228 | -987.5716/-379.6094 |
| digraph - | 232/76 | 228/76 | -1000.8509 | -391.9605 | -1005.1060/-363.7833 |
| letters + | 230/10 | 232/76 | -990.9697 | -378.8664 | -993.1751/no path |
| letters - | 232/76 | 232/76 | -999.7450 | -353.2793 | -994.1813/-386.3797 |

All eight plants recover true absolute start and exact p54 order; 1850/1856 fit runes and 542/608 withheld runes. Letters+ start100000 incorrectly chooses end100227 instead of100228, causing poor continuation. This is a real limitation of single-best end cursor. Same two donor windows reused across four cipher configurations; not eight independent plaintext samples. All original reconstructions nonprose, near matched shuffled controls. No original candidate shows predictive recovery. Do not extend this source-key variant absent an independent selector; not a proof excluding every GEB offset, permutation, or cipher family.

Code: [prepare](../sims/lp2_geb_line_tiling_prepare.cjs), [receiver](../sims/lp2_geb_line_tiling.cpp), [workflow](../.github/workflows/lp2-geb-physical-line-tiling.yml), [measured full summary](lp2-geb-line-anchored-reconstruction.json). Source preparation and executable ran successfully in all four CI jobs.
