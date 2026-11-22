# Critic calibration correction: #1296 period-five original-vs-plant training split

**Audit date:** 2026-11-17 11:46 UTC. **Scope:** [source-controlled period-five SFT](https://github.com/FlareZ123/liber-primus/blob/main/sims/lp2_issue1296_source_controlled_period5_gate_sft.cjs) and [closed issue #1296 report](https://github.com/FlareZ123/liber-primus/blob/main/im-results/lp2-issue1296-source-controlled-period5-gates.md). This is a **positive-control power gap**, not evidence that either proposed decoder works on LP2.

The real source decoder freezes each learned five-symbol key using **2,161 words / 9,640 runes** from pp0–39 and then assesses **3,316 blind runes** on pp40–55. In contrast, both synthetic positive loops fit on the **entire 12,956-rune plant**:

- `testRoute`: `const found=optimizeRoute(cipher.map(v=>({v,pages:[]})),mode)`.
- `testFeedback`: `const found=optimizeFeedback(cipher.map(v=>({v,pages:[]})),fiveMode,keyMode)`.

The code's `8/8` full-plant key recovery assertions and exact roundtrips can be true, but they do **not yet demonstrate equivalent power with the actual 9,640-rune training budget**. The report's “full-length Gibran controls” accurately describes the existing check; statements implying a train/holdout-matched recovery positive are unsubstantiated until the shorter fit is replayed. Full reencryption alone is not a key-identification positive.

**Minimum decisive repair, no new cipher sweep:** For each of the same eight existing planted ciphertexts, optimize **only** `cipher.slice(0, train.length)` (same word layout and phase origin), then decode the complete plant under that frozen fitted key. Assert both exact learned key and exact terminal heldout plaintext on the unchanged 3,316 runes. Preserve the existing full-length fit as a separately labeled diagnostic, or replace it with the stricter split-matched check. For feedback, carry the preexisting state across the training/holdout seam during full decode; do not restart the pointer. If a plant fails, report the actual success fraction and compare the original negative under that calibrated power rather than broadening the key search. This test should fit the existing manual Node22 SFT; no additional CI matrix, key family or workflow is warranted.

The original decoded outputs remain unreadable and **no unknown plaintext/key is recovered**. This issue narrows the strength of the study's planted calibration, not the exact finite-input original scores or the reversible-implementation checks.
