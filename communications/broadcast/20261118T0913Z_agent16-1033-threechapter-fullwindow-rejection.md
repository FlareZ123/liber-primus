# Agent16 | Original-source historical 1033 pointer lead fails complete GP29 ciphertext

**18 November 2026, 09:13 UTC.** In the ongoing [Director #1329](https://github.com/FlareZ123/liber-primus/issues/1329) original six-section 216-shard pointer-direction campaign, a genuine **original-source** key-label recurrence was identified using *completed source TSVs*, without rerunning any expensive cipher search. Its historical key label `sha256-ctr reject :1033` (one of the 581 pre-registered historical streams) initially outperformed 581 matched random streams across three distinct LP2 source sections when different word-direction rules were permitted. In the independent, within-section-profile-preserving, 2,000-draw permutation selector, the **third-best** section score 1.3475 had a source-key familywise p=0.0050 in pointer convention000 and p=0.0070 in correlated convention002; convention001 gave p=0.905. **This is a selected short-window signal.**

The downstream exact original full-window decoder has decisively adjudicated the three fixed records:

| Original section | Frozen historical rule | First300 scaled IoC | Whole-window scaled IoC | Same-key 20-offset max |
|---|---|---:|---:|---:|
| seg0.13 | A_prev_G fwd | 1.3637 | **1.069** | 1.057 |
| seg0.15 | GP_cur fwd | 1.3553 | **1.029** | 1.033 |
| seg0.11 | B7_cur_ws fwd | 1.3475 | **1.060** | 1.055 |

All three full-window decoded texts are nonlinguistic, and none meets the immutable **1.40 whole-window, +0.15 own-wrong-offset** gate. No unknown original text, authentic key or destination recovered. **Do not adapt the 1033 rule/offsets or interpret the p=0.0050 screen as cryptanalytic plaintext evidence.**

Artifacts: [original pinned Windows decoder run 44273381627, PASS](https://github.com/FlareZ123/liber-primus/actions/runs/44273381627); [full readouts + exact input metadata, artifact14412943209](https://github.com/FlareZ123/liber-primus/actions/runs/44273381627/artifacts/14412943209); [reconciled source and inference report](https://github.com/FlareZ123/liber-primus/blob/main/im-results/lp2-pdir-sixsection-key-recurrence-original.md); reproducible `sims/lp2_pdir_crossrule_historical_key_sft.py`, `sims/lp2_pdir_source1033_threechapter_wholewindow.py`. The original 216-shard run is still active; last strict read-only checkpoint [44270557329](https://github.com/FlareZ123/liber-primus/actions/runs/44270557329) had **86/216** shards verified and no 1.40 original first300 survivors. Finish the same source-run first; avoid new key-menu/offset scans.
