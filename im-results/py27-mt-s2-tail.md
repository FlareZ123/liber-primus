# Exhaustive 32-bit MT19937 keyskip1 S2: disjoint upper-tail result

**Measured 2026-11-10.** This is a reproducible, bounded negative cryptanalytic measurement against one explicit decryption model; it does not recover LP2 plaintext. It extends a previously unfinished integer-seed search instead of rerunning completed seed ranges.

## Why these seeds and what mechanism?

The upstream `Dukotah/cicada3301` Round 42 S2 state (`liber-primus/analysis/round42/S1-s2-recovery/state_recovered/STATUS.json`, SHA-pinned source snapshot `f63501d8f2d835b80c30230eb89a1110fb9197d2`) has cursor 3,953,451,853 at the sixth worker and 52.0538442% complete. No earlier cursor reaches the interval [4,140,000,000, 2^32). This report covers exactly that interval once, in eight disjoint jobs.

The hypothesised cipher is an *additive* mod-29 rune cipher with a Python 2.7 MT19937 32-bit integer seed and `random()*29` keystream reduction, sign -1, initial key offset 0. The ciphertext doublet avoidance is represented with the `keyskip1` exact transition relation (up to 3 skips), with 64-wide beam at L=120. Detection uses the 12-register panel-R36. This parameterization is an architectural **hypothesis**, not established Liber Primus encryption.

The pinned engine source and frozen data are `Dukotah/cicada3301/liber-primus/analysis/round36/P1-panel-r36/engine_inputs_copy/`. Before each new shard the model gate checks SHA256(`panel_lm.f32`) = `e46d4bb73d16adeb02262361325b2a6ff578ae436b1374a7725a0a240f7e9928`, the engine compiles with `-ffp-contract=off`, 64/64 vector parity passes exactly, and the synthetic seed-777 positive control yields pmax `17.931158509762`. Independent historical source for the exact relation is upstream `round27/P0-spec/S2-CONTROL.md`. A stage-A result at pmax >= 5.0 is retained as a candidate; pmax >= **7.6341931878728095** is a trigger for a second-stage oracle and never certifies plaintext by itself. This threshold was fitted to an older nine-register null, so statistical significance for the newer 12-register panel must be treated cautiously.

## Eight-shard result

All jobs succeeded in [GitHub Actions run 42750190843](https://github.com/FlareZ123/liber-primus/actions/runs/42750190843), workflow [`py27-mt-s2-uncovered-tail.yml`](../.github/workflows/py27-mt-s2-uncovered-tail.yml). Each shard completed all assigned seeds, workers reported `done=true`, and complete candidate/top/hist files were uploaded as 90-day workflow artifacts. Candidate figures are from the immutable job `FINAL` output, not extrapolated.

| Shard | Seed half-open interval | Seeds | pmax >= 5.0 | Best seed | Best pmax | >=7.634193 |
|---|---|---:|---:|---:|---:|---:|
| 1 | [4140000000,4160000000) | 20,000,000 | 2,199 | 4157726481 | 6.648504 | 0 |
| 2 | [4160000000,4180000000) | 20,000,000 | 2,248 | 4165343104 | 6.636613 | 0 |
| 3 | [4180000000,4200000000) | 20,000,000 | 2,256 | 4199023849 | 6.866973 | 0 |
| 4 | [4200000000,4220000000) | 20,000,000 | 2,283 | 4219404431 | 7.144521 | 0 |
| 5 | [4220000000,4240000000) | 20,000,000 | 2,238 | 4221124312 | 6.641525 | 0 |
| 6 | [4240000000,4260000000) | 20,000,000 | 2,302 | 4257545039 | 6.685293 | 0 |
| 7 | [4260000000,4280000000) | 20,000,000 | 2,251 | **4271474643** | **7.577253** | 0 |
| 8 | [4280000000,4294967296) | 14,967,296 | 1,734 | 4283177722 | 6.643433 | 0 |
| **Total** | **[4140000000,4294967296)** | **154,967,296** | **17,511** | 4271474643 | 7.577253 | **0** |

**New near-miss worth adjudicating:** seed **4271474643** scores **7.577252757485072**, exceeding the upstream exploratory near-miss line `7.6341931878728095 - 0.1 = 7.5341931878728095`. It is below the claim threshold, but enough to justify a *240-rune, beam-wide=400 held-out reproduction test*. The separate L240 test **completed** in [GitHub Actions run 42751808019](https://github.com/FlareZ123/liber-primus/actions/runs/42751808019), using [`sims/mt_nearmiss_stageb.py`](../sims/mt_nearmiss_stageb.py) and `.github/workflows/py27-mt-nearmiss-stageb.yml`: **pmax 6.734465247844546** (LP1_REAL register), **English quadgram score −6.915576462742033**, **held-out path agreement 0.95**, 7 key skips, and no interpretable plaintext in the 240-rune transliteration. The high self-consistency alone is evidently insufficient to establish truth: this is a **negative** result for this near-miss. Other near misses below the shard maxima are possible; the hist/top files remain the definitive source for exhaustive near-miss recount.

The upstream Round 42 state covered **2,235,695,586** seeds and this run added **154,967,296** provably disjoint seeds: together they cover **2,390,662,882 / 2^32 = 55.6619578%** of this exact model's 32-bit seed space. The earlier base coverage is instrument-mixed (9 and 12 registers) and must not be presented as one homogeneous statistical experiment.

## The remaining test and decisive boundary

A second workflow [`py27-mt-s2-uncovered-remainder.yml`](../.github/workflows/py27-mt-s2-uncovered-remainder.yml) has been dispatched as [GitHub Actions run 42750834108](https://github.com/FlareZ123/liber-primus/actions/runs/42750834108), with 78 shards over the exact complement of the frozen Round 42 cursors, excluding this newly completed upper tail. Its **1,904,304,414** assigned seeds plus this upper tail and the frozen upstream completed prefixes partition **all 2^32 seeds** exactly, provided all 78 jobs finish. This is execution-in-progress, not covered seed count until confirmed by each job's terminal STATUS.

A decisive negative on the fully enumerated family would eliminate only `Py2.7 MT integer seed + random29 + exact keyskip1 + offset0 + sign− + L120 screen` under the instrument's detection power. Other encipherment mechanisms, generators, plaintext languages and key offsets remain open.
