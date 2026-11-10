# Full 32-bit MT19937 keyskip1 S2 seed-domain search: complete coverage

**2026-11-10, reproducible bounded negative experiment.** The previously unfinished 2^32-seed integer-key enumeration has now completed for every seed **0 through 4,294,967,295**. A single new candidate exceeded the historical *screening* claim threshold; direct 240-rune adjudication reduced its score and produced unreadable text. **No LP2 plaintext, reproducible key, or general decryption mechanism was recovered.** This closes a specific finite seed domain under a particular tested instrument.

## Hypothesis and reproducibility contract

- Generator: Python 2.7 MT19937, initialized by `init_by_array([w])` for each unsigned 32-bit integer `w`, reducer `int(random()*29)`; 29 Gematria Primus runes.
- Proposed cipher: additive mod 29, decryption sign -1, fixed key offset 0, with ciphertext-repeat-triggered key skipping, relation `keyskip1` exact up to 3 skipped positions. The model is a **hypothesis**, not an established LP2 mechanism.
- Stage A: first 120 unsolved ciphertext runes, width-64 beam decoder and 12-register panel-R36; keep candidates `pmax >= 5.0`. The **7.6341931878728095** legacy claim threshold came from an earlier 9-register null calibration, and therefore **cannot be treated as a valid standalone significance threshold for this 12-register scoring instrument**. A threshold crossing is a reason for extra analysis only.
- Stage B: independent 240-rune, width-400 decode and LP2/English/other-register score, with 1/4 attribution and 3/4 path self-consistency, using `sims/mt_nearmiss_stageb.py`. A high self-consistency score does not validate unseen plaintext.
- Every new shard pins source `Dukotah/cicada3301@f63501d8f2d835b80c30230eb89a1110fb9197d2`, `liber-primus/analysis/round36/P1-panel-r36/engine_inputs_copy/`. Before scoring, SHA256(`panel_lm.f32`) is checked against `e46d4bb73d16adeb02262361325b2a6ff578ae436b1374a7725a0a240f7e9928`, compilation uses `-ffp-contract=off`, the 64 reference seeds match bit-exactly and the planted seed-777 score is `17.931158509762`. Historic keyskip1 positive-control provenance: upstream `round27/P0-spec/S2-CONTROL.md`.

## Exact coverage ledger

The upstream frozen Round42 status `analysis/round42/S1-s2-recovery/state_recovered/STATUS.json` reported 6 already-screened worker prefixes and 2,235,695,586 total seeds. We built the *exact complement* of their six cursors, then split it into two new, disjoint matrix campaigns. This partitions all 2^32 seeds with no overlapping new intervals or untested gaps:

| Portion of 32-bit seed domain | Complete seeds | Status and primary evidence |
|---|---:|---|
| Upstream Round42 completed prefixes across six disjoint bands | 2,235,695,586 | Frozen upstream `STATUS.json`, mixed historical 9/12-register instruments |
| Previously uncovered six worker tails (78 CI shards) | **1,904,304,414** | All 78 passed, [GitHub Actions 42750834108](https://github.com/FlareZ123/liber-primus/actions/runs/42750834108) |
| Previously uncovered extreme high tail [4140000000, 4294967296) (8 shards) | **154,967,296** | All 8 passed, [GitHub Actions 42750190843](https://github.com/FlareZ123/liber-primus/actions/runs/42750190843) |
| **Entire 32-bit domain** | **4,294,967,296** | All historical prefixes plus 86 newly completed CI shards |

The six previously uncovered gaps are `[371757563,715827882)`, `[1090732453,1431655764)`, `[1806229583,2147483646)`, `[2519684857,2863311528)`, `[3231257507,3579139410)`, `[3953451853,4140000000)`. Each was partitioned into consecutive 25-million-word or shorter intervals by [`py27-mt-s2-uncovered-remainder.yml`](../.github/workflows/py27-mt-s2-uncovered-remainder.yml). The high tail was partitioned by [`py27-mt-s2-uncovered-tail.yml`](../.github/workflows/py27-mt-s2-uncovered-tail.yml).

The 78 job results were **independently reconciled from their stored 90-day artifacts** by [`sims/aggregate_mt_exact.py`](../sims/aggregate_mt_exact.py) in successful [aggregate run 42754166843](https://github.com/FlareZ123/liber-primus/actions/runs/42754166843). The aggregator asserts each seed interval is fully complete, verifies contiguous six-gap exact coverage and candidate counts against line-by-line `candidates.jsonl`, and emits full near-miss/score-tail summaries. No coverage was inferred merely from job startup.

## New screen outcome: 2,059,271,710 seeds

The new seed domain (six gaps plus high tail) produced **234,296 first-stage candidates** at pmax >=5.0. Counts and strongest screen candidates:

| New partition | Tested seeds | Stage-A candidates >=5.0 | Above old claim bar | Highest seed and pmax |
|---|---:|---:|---:|---|
| Six worker tails | 1,904,304,414 | **216,785** | **1** | seed **1288211095**, pmax **7.839010536552472** |
| High tail | 154,967,296 | **17,511** | **0** | seed **4271474643**, pmax **7.577252757485072** |
| **Total new** | **2,059,271,710** | **234,296** | **1** | seed 1288211095 |

Across the six-gap run, there were **26** candidates with pmax >=7.0, **2** with pmax >=7.5, and exactly **1** with pmax >=7.6341931878728095. Its raw full candidate record and comparison histogram are preserved in the 78 shard artifacts and merged 90-day aggregate `mt-exact-complete.json`.

### The one screen-threshold crosser fails full-length plaintext recovery

The full L240 re-decode of seed **1288211095** in [Actions run 42754259175](https://github.com/FlareZ123/liber-primus/actions/runs/42754259175) yielded:

- pmax(L240) **5.221988928560868**; best register `LATIN`.
- English quadgram score **−7.0741585856963995**, compatible with noise.
- Held-out path agreement **1.0** and 4 key skips. This agreement is a consistency of two decoders under the same candidate key, rather than ground-truth plaintext recovery.
- An unreadable transliteration beginning `PTHOOIPSDEMIRALETERWEEDILAEXEATMBF...`, with no repeatable English or alternative-language plaintext.

**Fifteen additional top-ranked six-gap seeds** (including second-best `2559791778` at 7.531313 Stage A) were re-decoded in the same independently logged job. All yielded unreadable transliterations; their L240 pmax range was **3.6969–6.6680**, and many had held-out agreement 1.0 despite noise-like language scores. Consequently high self-consistency is *not* a reliable cipher-solution certificate under this beam model.

The highest high-tail seed **4271474643** underwent its own L240 examination in [Actions run 42751808019](https://github.com/FlareZ123/liber-primus/actions/runs/42751808019): pmax **6.734465247844546** (register `LP1_REAL`), English −6.915576462742033, held-out agreement 0.95, unreadable result.

## Interpretation and next cryptanalytic step

**Domain closure is exact:** every one of the 2^32 initial integer seeds was processed under an S2 screening implementation across the inherited historical prefixes plus the new fixed panel-R36 completion. **Statistical homogeneity is absent** across the older portion because its data arose under nine- and twelve-register instruments. Additionally, first-stage screening at 120 runes can miss a true key if the real cipher deviates from the exact assumed keyskip1 relation, if it belongs to another language register, or if the true key has a different offset/sign or generator. It is accurate to say the declared integer-seed search is complete; it is **not** accurate to declare MT19937 or every plaintext it could produce globally impossible.

The strongest newly selected candidates were subjected to actual plaintext-path reproduction at length 240 and did not decrypt LP2. Continued brute-forcing this **same finite seed domain** without changing a justified cryptographic assumption would duplicate completed research. A meaningful follow-on needs an independently motivated key construction, a new structural constraint, or a cross-page prediction that substantially increases recovery power.
