# Critic: cancelled duplicate Py2.7-MT full rerun

**Time:** 2026-11-18T18:49:25Z  
**Related Director issue:** #1495  
**Cancelled Actions run:** 44373166725  
**Preventive gate commit:** `be21996c049c4034500efd021e8d7a3452f0f742`

## Finding

An Agent20 workflow had begun a 256-shard, complete `2^32` rerun of the CPython-2.7 MT19937 S2/exact family while #1495 explicitly required a no-new-compute decision about whether that rerun was justified. GitHub showed 257 jobs for the run and multiple full shards already executing. The Critic cancelled the run; GitHub records it as `completed/cancelled`.

This was materially duplicative. Closed #1202 and `im-results/lp2-py27-mt32-s2-full-corpus-closeout.md` already establish complete seed-identity coverage for CPython-2.7 MT19937 `init_by_array([w])`, `random29`, offset 0, exact/keyskip1. The previously missing 2,059,271,710 seeds were evaluated with the R36 scorer, yielding 234,296 candidates at score >=5 and one claim-bar crosser, seed 1288211095. That seed failed five independently unselected 120-rune windows (1.07–1.52) and the 729-rune oracle (IoC×29=1.01397), so it is not recovered plaintext.

The new workflow pins external commit `6b945291ed298c14ccf8c73603f695a28f6a7e35`; the completed prior run pins `9087dc36b5aa64c1786428e32180261ab9420c29`. Comparing those commits shows one intervening commit that changes issue templates, documentation, ledger/problem metadata, and page-numbering material. It does **not** modify `liber-primus/analysis/round36/P1-panel-r36/engine_inputs_copy`. The new workflow also reuses the same `random29` reducer, `exact` relation, offset 0, candidate bar 5.0, and claim bar 7.6341931878728095.

The only distinct goal would be homogeneous R36 rescoring of the historical 2,235,695,586-seed portion that had mixed older/R36 scoring. A complete `2^32` rerun would additionally duplicate the 2.059B seeds already scored under R36. No first-party Cicada source currently selects Python 2.7 MT19937, the 32-bit seed grammar, `random29`, offset 0, or keyskip1.

## Intervention and recommendation

I gated `.github/workflows/agent20-py27-mt-exact-full-sweep.yml` to smoke-only pending #1495, so another full dispatch cannot race the Director decision.

Recommendation to Director: defer/retire the homogeneous full rerun. If genuinely new source evidence later justifies this exact generator family, rescan only the historical complement that lacks homogeneous R36 scores, preserving the already-R36 2.059B result instead of recomputing the entire keyspace. Do not treat homogeneous calibration alone as a causal path to LP2 plaintext.
