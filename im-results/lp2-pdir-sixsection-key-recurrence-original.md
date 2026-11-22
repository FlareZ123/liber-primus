# Repeated historical-key screen across six original LP2 sections

**Decision (18 November 2026, updated after full-window 1033 readout):** A fixed historical key/multiplier/skip-model repeat is absent at first300 scaled IoC **≥1.30 in two different original sections** across 396 original vector screens. Matched 581-stream random-key controls produce four such pairs. A broader second screen, allowing the source's pointer *rule to change by chapter*, singled out the historical SHA256-CTR stream seeded by **1033** with three scored first300 sections; a 2,000-shuffle source-key-label control gave **p=0.0050** in convention 000. **Exact whole-window original decoding eliminates all three:** full scores are **1.069, 1.029 and 1.060**, with zero survivors of the predetermined original I0C and wrong-offset tests. No unknown plaintext, authentic key or destination has been recovered. The 216-shard source campaign remains incomplete.

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

## A different-rule, same-source-key test, and its original full-window adjudication

**Independent premise:** The original images visibly separate nine chapter sections, so a real historical *source key* could recur even if individual sections select different signed-2016 word-pointer rules, orientations or multipliers. This is a **weaker assumption about shared key material** and a **larger search** than fixing an exact cipher transformation. It is a bounded hypothesis, without a first-party instruction that chapters actually change rules.

The [cross-rule read-only SFT](../sims/lp2_pdir_crossrule_historical_key_sft.py) aggregates all 132 rule/orientation TSVs within each original chapter, retaining the best first300 score for each of 581 exact key-source identifiers. A 2,000-permutation control randomizes key identity **between the six original chapters** while preserving the full observed score profile and within-chapter correlations from 132 rules. The same operation is run on the original 581 matched random streams. One familywise maximum among all 581 keys is used per convention; the three conventions are strongly correlated and cannot be counted as independent replications.

| Source pointer convention | Best real source key | Third-highest distinct-section IoC | Empirical source-identity shuffled p, 2,000 draws | Strongest random stream third score |
|---|---|---:|---:|---:|
| 000 | SHA256-CTR, rejection, seed `1033` | 1.3475 | 0.0050 (9 exceedances) | 1.3191 |
| 001 | same key, but weaker chapter coverage | 1.3107 | 0.9050 (1,810 exceedances) | 1.3204 |
| 002 | SHA256-CTR, rejection, seed `1033` | 1.3475 | 0.0070 (13 exceedances) | 1.3313 |

The exploratory three-chapter 1033 key is therefore a *source-conditional ranking lead*. Its `000` maxima are original **seg0.13=1.3637, seg0.15=1.3553, seg0.11=1.3475**. The familywise shuffled-identity p-values are measured against this source key library and exact top50 screen; they cannot establish plaintext or account for every alternative hypothesis considered historically.

The key's actual ciphertext inverse was then **frozen to those exact three source records** without score tuning or any new key: [original Windows full-window run **44273381627**, PASS](https://github.com/FlareZ123/liber-primus/actions/runs/44273381627), [artifact 14412943209](https://github.com/FlareZ123/liber-primus/actions/runs/44273381627/artifacts/14412943209), [SFT](../sims/lp2_pdir_source1033_threechapter_wholewindow.py) and [manual Windows workflow](../.github/workflows/agent16-pdir-source1033-threechapter-wholewindow.yml). A pinned independent Rust decoder reconstructs complete untouched original chapters; each input retains the source row's orientation, key offset, model, multiplier, and rule, and compares 20 same-key wrong offsets.

| Original LP2 section | Source-selected pointer rule | Frozen first300 IoC | Whole-window IoC | Highest 20 wrong-offset IoC |
|---|---|---:|---:|---:|
| seg0.13 | `A_prev_G` forward | 1.3637 | **1.069** | 1.057 |
| seg0.15 | `GP_cur` forward | 1.3553 | **1.029** | 1.033 |
| seg0.11 | `B7_cur_ws` forward | 1.3475 | **1.060** | 1.055 |

The full runes are nonlinguistic, and all three fall far below the preset whole-window 1.40 threshold and offset-control margin 0.15. The source's 1033 symbol has historical associations, but these scores **do not authenticate it as the creator's key**, or exclude unknown other uses of 1033. The entire specifically tested “shared 1033 keystream with independently selected source pointer rules per chapter” original decryption route is rejected.

**Research fork:** Do **not** expand source-key recurrence or tune offsets after these three full-window failures. Continue reducing the already-running original 216-shard campaign and testing independent, source-selected key or receiver operations. A coherent untouched original plaintext followed by exact forward reconstruction remains the needed result.

