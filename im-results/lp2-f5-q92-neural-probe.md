# Q92 blind F5 neural-gate sensitivity prerequisite

**Decision, 13 November 2026 (Agent21):** the pinned Q92 F5-specific neural ensemble **fails all authentic positive controls on the five manuscript-like source images**. The precommitted gate withheld all 58 original LP2 targets. **No claims of F5-negative originals, plaintext, keys or decoded payloads** follow from this detector.

## Why run this separately

The successful [two-peer known-stencil detector](lp2-f5-q92-shared-stencil-original-gate.md) covers 32 physical LP2 pages and no others. A genuine *blind* F5-specific method that first recognizes the known steganographic positives might examine the remaining 26 without assuming shared artwork. The available historically grounded [0verkilll/f5 v1.0.0](https://github.com/0verkilll/f5/tree/v1.0.0) implements a pinned F5-specific ONNX neural model with two-stage artifact gate, accessible by \`f5 gate -tier 1 -json\`. This is an alternative to the already failed paper-based β detector. The choice to try the model was source-independent, and its calibration was specified **before any original scan**.

## Frozen Q92 source controls and result

The complete script [lp2_f5_q92_neural_gate_probe.py](../sims/lp2_f5_q92_neural_gate_probe.py) embeds deterministically generated SHA-256 counter bytes using the pinned v1.0.0 Go F5 encoder, exactly extracts them with the same tool, and invokes the model on the original cover and resulting stego. The covers are unchanged original Q92 scans corresponding to physical pp6,13,14,36,54. Payload lengths are 256, 1,024, and 4,096 bytes for every cover. Hashes and controls are in the [successful manual CI artifact, run 43401974331](https://github.com/FlareZ123/liber-primus/actions/runs/43401974331).

The gate required **5/5 source covers CLEAN**, **5/5 4,096-byte F5 stegos F5_DETECTED**, and **at least 4/5 1,024-byte F5 stegos F5_DETECTED**. It is strict by design: the model must first distinguish known real embedded signals in the same atypical image class.

| Test class | F5_DETECTED | CLEAN | Identical model outputs |
| --- | ---: | ---: | --- |
| Five original Q92 cover proxies | 0/5 | 5/5 | \`p_stego=0.439\`, \`gate_score=0.584\` |
| Five 256-byte exact F5 stego/extraction positives | 0/5 | 5/5 | same |
| Five 1,024-byte exact F5 stego/extraction positives | 0/5 | 5/5 | same |
| Five 4,096-byte exact F5 stego/extraction positives | 0/5 | 5/5 | same |

Every result was \`CLEAN\` with model explanation \`p_stego=0.439 < 0.71\`. Both the p_stego and gate score remain invariant at all three embedded payload lengths, even though the separately calibrated [exact DCT reference detector](lp2-f5-q92-shared-stencil-original-gate.md) detects modifications from as little as 256 bytes on those identical source covers.

The original-target branch was explicitly **WITHHELD**, printed \`ORIGINAL_SCREEN_WITHHELD: known-positive/specificity calibration failed\`. A successful CI job establishes that the calibration code executed; the model was **not** a successful detector.

## Scope and next decision

This retires the tested **tier-1 neural gate**, whose Q92 manuscript-like input sensitivity is empirically zero at all tested rates. It does not establish that every neural ensemble variant fails. The entire independent F5 channel remains open beyond the known-stencil 32 pages. Avoid expanding a blind neural/CNN variant menu without an independently sourced mechanism or independent calibrated positive results. No original ciphertext was decrypted.

**Reproducibility:** [pinned runner](../sims/lp2_f5_q92_neural_gate_probe.py), [manual-only workflow](../.github/workflows/lp2-f5-q92-neural-probe-manual.yml), [CI run with 20 original/positive control evaluations](https://github.com/FlareZ123/liber-primus/actions/runs/43401974331). All source and stego SHA-256 identifiers, exact payload SHA-256 hashes, decisions, model scores and frozen gate criteria are retained in the uploaded \`im-results/f5-q92-neural-probe/probe.json\` and calibration images.
