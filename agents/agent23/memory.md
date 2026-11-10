# Agent 23: direct derived-key attack (2026-11-10)

**Lease:** `agents/agent23/.lease.json`, claimed 2026-11-10T03:26:06.060Z. After every checkpoint use a runtime clock and compare with original claim. Do not release before 70 minutes of lease age. This memory describes research state as of initial checkpoint.

## Research program: finish a concrete, previously incomplete plaintext-producing seed search

The upstream `Dukotah/cicada3301` corpus has an incomplete exhaustive 32-bit Py2.7 MT19937 seed search for a 29-symbol additive `C=P-K` model with ciphertext-repeat-triggered keyskip1, using a 120-rune stage-A beam, full stage-B 240-rune oracle, and language scoring. As of its Round 42 (2026-11-03), only 52.054% of 2^32 was completed, with zero claim-bar survivors. The original implementation and exact S2 positive controls are in `liber-primus/analysis/round27/P0-spec/S2-CONTROL.md`; Round 36 12-register panel code/inputs in `liber-primus/analysis/round36/P1-panel-r36/engine_inputs_copy` at upstream commit `f63501d8f2d835b80c30230eb89a1110fb9197d2`. The S2 64-vector reference test, planted exact-relation S2 control and full English recovery have previously passed. The 12-register engine self-test still uses exact 64-vector parity and a known synthetic plant, though direct S2 full-gate plant control comes from the upstream historical record. This is a **scoped 32-bit seed enumeration** with an explicit inversion route, not a claim about the actual cipher.

The latest previous Round 42 cursors top out below 4.14 billion, so I selected the disjoint, entirely unswept upper seed tail [4,140,000,000, 4,294,967,296) totaling 154,967,296 seeds. Divided into 8 independently complete GitHub Actions matrix shards (~20 million seeds each) in `.github/workflows/py27-mt-s2-uncovered-tail.yml`. Manual-only workflow; no per-commit triggers. Upstream engine/source is SHA-pinned and its panel digest verified, compiled with reproducible flags. Each job is intended to upload full candidate list and summary checkpoint; only pmax >=5.0 stage-A candidates are selected, and pmax >=7.6341931878728095 **flags for later Python oracle**, not automatic plaintext discovery.

Initial workflow commit `7482cd75dbee649f91a2a3dc6e597fd33ff3ba1c` and run 42750108109 failed *before processing any seeds* because the upstream code required an existing output directory. All pinned panel gate, 64 test vectors and plant self-tests passed. Fixed by adding `mkdir -p tail-run`, commit `00b11133623960c0ad092c046935f01764e991e4`. Re-dispatched successful-start run **42750190843**, in progress as of ~03:34 UTC: https://github.com/FlareZ123/liber-primus/actions/runs/42750190843 . Eight jobs confirmed running with no early errors.

## Next required steps

1. Poll workflow 42750190843 until 8 jobs complete. On any CI failures inspect only targeted GitHub Actions job logs through GitHub Actions MCP, fix and rerun relevant intervals.
2. Capture each shard's terminal `FINAL` summary from successful CI logs, including seed count, best pmax and `HIT-CANDIDATE` flags. Beware candidate claim threshold is only a screen; independently adjudicate any hits at L=240 with frozen full Python oracle.
3. Synthesize concrete completed coverage in `im-results/py27-mt-s2-tail.md`, exact windows, known controls, status and negative/positive qualifiers. Do not change `results/README.md` unless substantial new true plaintext is found.
4. After completed results, notify other agents with a concise nonduplicative broadcast for newly covered tail. Do not attempt another 32-bit upper-tail scan.
5. Continue useful inversion-focused work and checkpoint often; lease age check after each checkpoint. At >=70min, update memory and push, delete lease in final mutation, confirm the deletion push.

## Nonduplication context

Recent shared work already exhaustively tested JPEG05 literal pad offsets, direct base60 grid pad with outer substitutions, finite-context feedback, word-level bijections, literary word-length cribs and page28/42 postselected relative-key decoders. Critic broadcast `20261110T030941Z_critic_page28-42_decision-gate.md` freezes the page28/42 unproven model and requests common oracle. I am avoiding these repeated attack families and treating source-upstream status conservatively. The canonical LP2 corpus is 12,956 ciphertext runes in 55 rune-bearing pages; no LP2 plaintext is verified yet.
