# Repeated historical-key screen across six original LP2 sections

**Decision (18 November 2026):** A repeated-key signal is absent in the frozen **top-50 screen outputs** of the first three complete pointer conventions of [Director #1329](https://github.com/FlareZ123/liber-primus/issues/1329). In 396 original rule/direction vector screens, no historical key/multiplier/skip-model triple attains a first-300 scaled IoC **≥1.30 in two different original sections**. Matched 581-stream random-key controls do so in **four** vectors. The complete source campaign is still running. This is a bounded original-source decision and recovers no unknown plaintext, key or destination.

## Human-solvable hypothesis and exact falsification criterion

The signed 2016 instruction that words, meaning and numbers determine a route could imply that **one authentic historical keystream recurs across separate LP2 sections**, even when the per-word pointer direction changes. A candidate should repeatedly score above the same-rule matched random library under exactly the same underlying historical key identifier, key multiplier and skip model on at least two of six source chapters. This is more discriminating than selecting one highest original IoC from millions of offset comparisons: an independently recoverable shared key is a potential route to extended plaintext.

The rival is that each finite top-50 list consists of independent offset maxima and occasional same-key coincidences. The published stage-2 search already contains **581 actual historical key sources and 581 matched random streams per vector** for conventions `000`, `001`, `002`. This study only reduces their completed original artifact TSVs; it generates no new key, rule, ciphertext or fitted search parameter.

The six original section windows are **seg0.9, seg0.11, seg0.12, seg0.13, seg0.14, seg0.15**. Each TSV has the frozen 50 highest initial scores. For each vector and source role, group rows by `(key item, multiplier, model)`; retain the largest first-300 IoC in each distinct section; count a repeat only if the same triple occurs in at least two sections. Original and null TSV sets must contain the same 132 vector names in each convention. Original score cutoffs at **1.30** and **1.35** are applied separately to the second-highest distinct-section score. No retrospective scan of arbitrary weaker thresholds is offered as a hit.

## Source-exact result

| Pointer convention | Real repeated key triples (any top-50 score) | Matched-random repeats | Real vectors with two sections ≥1.30 | Random vectors with two sections ≥1.30 |
|---|---:|---:|---:|---:|
| 000 | 31 | 38 | 0 | 2 |
| 001 | 33 | 40 | 0 | 1 |
| 002 | 30 | 36 | 0 | 1 |
| **Total** | **94** | **114** | **0/396** | **4/396** |

No original or matched-random triple appeared in **three distinct sections** in any of these vectors. Neither role has any two-section 1.35 survivor. The strongest original repeated-key second-window score is only **1.2964**, from `C_prev_R_fwd`, convention `000`, historical stream `sha256-chain reject :ALL THINGS SHOULD BE ENCRYPTED` (`mult=1,model=1`), original sections **seg0.15 (1.3178, key offset10881)** and **seg0.14 (1.2964, offset14598)**. This is below the frozen 1.30 comparison gate. The strongest matched-random pair exceeds it: **1.3139** under convention `001`, `B5_prev_pf_rev`, `RANDOM 379` (`mult=28,model=1`) on seg0.13 and seg0.9.

The exact paired discordance tails by convention are **0.5, 1.0 and 1.0**. These are diagnostics rather than a calibrated whole-campaign significance claim: the search screened many rule families and the conventions are correlated. The stricter qualitative outcome is stable: no historical stream shows two independently scoring original LP2 sections at the fairly modest 1.30 level.

## Implementation, full artifacts and limits

- [Original source Windows Node 22/Python 3.12 job, success](https://github.com/FlareZ123/liber-primus/actions/runs/44270557329) and [artifact 14412700706](https://github.com/FlareZ123/liber-primus/actions/runs/44270557329/artifacts/14412700706) contain the full JSON report and concurrent strict original shard checkpoint.
- [Standalone reproducible read-only SFT](../sims/lp2_pdir_sixsection_key_recurrence_sft.py) and [existing manual checkpoint workflow](../.github/workflows/agent48-pdir-original-live-checkpoint.yml). Their source is checked out at commit `eab091b7a1c109c63765a58d68993bf67a76273c`.
- In the same source checkpoint, **86/216 completed/rescued shards**, **948 original rule/direction vectors**, **zero** first300 scores ≥1.40 and highest original **1.3889**. **130 shard slots** are still pending or unavailable. Original failed `010/3` is the independently verified rescue.
- This recurrence gate covers **three complete conventions only** and uses **the top50 offset-ranked rows**, not exhaustive all-offset histories or fully decoded text. It does not exclude a historical key reused below the top50 cutoff, a key shared with different sign/model/rule, a section-specific key, or unseen pointer conventions. Original scored windows have no coherent plaintext claim, and full original forward reconstruction is not independently demonstrated here.

**Research fork:** Because original repeated-key evidence is no stronger than the matched random streams, do **not** expand this same-key coincidence screen or propose new key lists. Complete the existing 216-shard original campaign. Only any prespecified ≥1.40 score from that independent search merits exact whole-window decode with 20 wrong-offset controls and a coherent withheld ≥150-rune plaintext. Independent source-clue recovery remains a distinct stronger lead.
