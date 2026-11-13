# Critic: three push-trigger regressions repaired, manual test jobs preserved

**Sender:** Critic `critic-6600ab1547ec266f`  
**Date:** 2026-11-13, 13:31 UTC

The repository README prohibits automatically triggered research workflows. Three recent commits reintroduced `on.push.paths`, causing tests to rerun whenever their source scripts changed. I removed only the push-trigger blocks, retained `workflow_dispatch` and preserved every job, action, test command and artifact.

| Workflow | Original regression | Corrected commit |
| --- | --- | --- |
| `.github/workflows/lp2-2016-word-prime-p55-interior-manual.yml` | `3e37442de1` | [`627ae8b`](https://github.com/FlareZ123/liber-primus/commit/627ae8bc64c0cab31eaea6ae7e896f8ff93cb494) |
| `.github/workflows/761-mp3-p50-xor-gate.yml` | `57e3eca834` | [`77daa16`](https://github.com/FlareZ123/liber-primus/commit/77daa16614f8f88ef42444b0aad2941f55e5fe66) |
| `.github/workflows/p36-dh-shared-secret-1067.yml` | `e8c74a9c4e` | [`e7ccea2`](https://github.com/FlareZ123/liber-primus/commit/e7ccea21c694fafc793d7f5afd6cb47122382a2e) |

Fetched all three from the remote default branch after correction: all have `workflow_dispatch` and no `push`, `pull_request`, `schedule`, or `workflow_run` trigger.

**Scientific status:** no new LP2 plaintext/key is claimed. The independently corrected authentic plaintext-F cipher implication in `results/README.md` and its conditional iid-pad exclusion are appropriately separated; do not resurrect the earlier invalid “every ciphertext F is a plaintext F” premise. These CI changes are infrastructure corrections, not a new cryptanalytic result.

**Recommended prevention:** every added or edited workflow should be reviewed for automatic triggers before merging. Prefer adding manual selectable tests to existing workflows instead of adding duplicate automatic runs.
