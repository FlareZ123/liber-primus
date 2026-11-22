# Genuine Q92 F5 shrinkage/parity blind gate on heldout artwork

**Decision (13 November 2026, Agent 2): calibration failed; 26 originally unscored LP2 pages were never inspected.** This is a bounded rejection of this exact detector family. No plaintext or F5 payload was recovered. It closes Director #748's proposed new detection mechanism without ruling out other F5 detection.

## Independent motivation and frozen procedure

Original LP2 JPEGs use Q92 compression and 26 pages lack the shared original stencils required by the already calibrated exact-cover detector. Earlier 2007 JET 274D Markov/DCT detection had 4/100 sensitivity and 4/100 false positives at 256B. F5 is a speculative LP2 carrier, without a creator-authenticated F5 instruction. The new approach probes *actual F5 coefficient decrement and shrinkage signatures* using exact absolute-magnitude histograms instead of the 274D features.

- Generate 2,400 x 3,600 px Q92 controls in both one-component grayscale and standard 4:2:0 RGB. Each art family has synthetically drawn text, marginal decoration and a stable family-specific style.
- Freeze 24 train families and **50 independent heldout art families**. Within each of 74 families, embed a **256-byte K4 genuine F5 v1.0.0** payload under a synthetic-only password, check exact extraction by the separately installed official CLI, then extract JPEG quantized AC coefficients without image re-encoding. All **148/148** extraction controls succeeded.
- Count AC absolute coefficient magnitudes 0 through 8 and >=9 for three frequency bands in each component, and calculate relative magnitude ratios, odd/even magnitude parity, AC occupancy and one-coefficient occupancy. Train separate grayscale and RGB L2 logistic models (C=0.1).
- Training-only cutoff for each model is maximum training clean score +1e-9 or clean-score mean plus the 58-way 0.01 normal-tail z of 3.57906357245 standard deviations, whichever is larger. This is a nominal parametric familywise threshold, not an empirically proven 58-page all-clean maximum calibration.
- Gate requires **>=45/50 detected F5 controls per mode** and **<=1/100 combined heldout clean false positives**, before inspecting any of the 26 original unscored pages.

## Frozen heldout results

| Statistic | Grayscale | RGB |
|---|---:|---:|
| True F5 detected / 50 | **1** | **0** |
| True F5 missed / 50 | 49 | 50 |
| Clean false positives / 50 | 1 | 0 |
| Clean true negatives / 50 | 49 | 50 |
| Frozen threshold | 0.005010920870 | 0.005988904500 |
| Maximum heldout F5 score | 0.005464742645 | 0.003568086122 |
| Maximum heldout clean score | 0.005445172934 | 0.003572185387 |

Overall 1/100 false-positive requirement passes, but both required sensitivities fail dramatically. The script records **control_gate_passed=false**, **source_images_examined=false** and explicitly prints **ORIGINALS_WITHHELD**.

**Reproduction:** [exact histogram extractor](../sims/f5_detector_calibration/f5_mag_hist.c); [full paired genuine-F5 blind calibration](../sims/f5_detector_calibration/shrinkage_parity_gate.py); [manual-only workflow](../.github/workflows/f5-q92-parity-blind-manual.yml); [passing CI run 43445840935](https://github.com/FlareZ123/liber-primus/actions/runs/43445840935); [heldout scores and thresholds artifact 14047928257](https://github.com/FlareZ123/liber-primus/actions/runs/43445840935/artifacts/14047928257).

## Research decision

Retire the fixed blind magnitude-spectrum/parity detector on this heldout result. No threshold tuning, additional feature selection on this holdout, password guessing or original-page scan is justified by the failed gate. It leaves intact the earlier 32/58 source-exact known-stencil F5 negative and the remaining 26/58 unscored pages. No authentic LP2 plaintext, key, destination, or hidden data was found. A new carrier investigation would need independent source evidence for a genuinely distinct detector or for historical F5 selection, not another fit of these features.
