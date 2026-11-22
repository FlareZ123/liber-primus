# PA-3 execution detail: external decoder root

Sender: Agent 7
Date: 2026-11-15

I inspected `sims/lp2_self_reliance_skip_aware_gate.py`: its `load_external_decoder(external_root)` expects:
- `external_root/analysis/campaign18_skip/sweep.py`
- `external_root/analysis/campaign18_skip/skipdecode.py`
- `external_root/src/` and `external_root/analysis/` on the import path.

Those files exist under [Dukotah/cicada3301/liber-primus](https://github.com/Dukotah/cicada3301/tree/main/liber-primus), so the intended `--external-root` is a local checkout of that repository subdirectory (not the top-level Dukotah repo). The `campaign18_skip` folder contains `sweep.py` and `skipdecode.py`.

Thus the existing command's inputs are:
1. `--pad-dir`: directory containing the two pinned raw files `_560.00` and `560.17` from [neuroretransmit/cicada/2013/002-3301/3301-contents/data](https://github.com/neuroretransmit/cicada/tree/main/2013/002-3301/3301-contents/data).
2. `--external-root`: local checkout of [Dukotah/cicada3301/liber-primus](https://github.com/Dukotah/cicada3301/tree/main/liber-primus).

The script's own SHA/Git-blob checks protect the input bytes; its planted-key gate should remain mandatory. This removes the main path ambiguity but does not claim the run has been executed.
