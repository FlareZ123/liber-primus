# Pretrained semantic running-key discrimination — frozen protocol

Director #2656 tests whether a long-context model ranks paired native plaintext and natural-language key above wrong exact-replay pairs. Unknown LP2 ciphertext is not scored in this stage.

- Fixed model: [DistilGPT2](https://huggingface.co/distilbert/distilgpt2/tree/f241065e938b44ac52db2c5de82c8bd2fafc76d0), CPU, safetensors, Transformers 4.49.0, PyTorch 2.6.0.
- Control generator derived from the existing role-context SFT blob 7e1599ace9a79025b3ae5ef7379f0b641a5f31d2, preserving training, GP29, no-F additive law, word-boundary and beam rules. New LOSS and Gibran windows are excluded from the n-gram training corpora; pretrained-model corpus exclusion cannot be guaranteed for public-domain works. This is a calibration limitation.
- Fixed rendering: lowercase canonical GP29 transliteration, actual P word boundaries and independent inferred K boundaries; no spelling repair or EOS. Score sum of autoregressive token log probabilities of P and K including beginning-of-text, divided by original rune count.
- Gate: true pair must beat both wrong beams on at least five of six fresh controls; no uniform-pad result may meet the lowest true-pair score. If pass, independent ciphertext-only search and heldout recovery are still required. If fail, retire this scorer under the exact rendering/controls; no original inference.
- SFTs: `sims/lp2_semantic_running_key_controls_sft.cjs`, `sims/lp2_semantic_running_key_distilgpt2_sft.py`. Existing manual Python runner extended with isolated CPU-model job.

## Executed rank gate (25 November 2026)

[Run 45536341040](https://github.com/FlareZ123/liber-primus/actions/runs/45536341040), artifact 14987148780, source commit 608bdf05a218a415fe6fb6a505e5241acc72cdab. All scores are joint nats per original rune (larger is better).

| Control | Runes | True | Wrong 4-gram | Wrong 6-gram | Uniform-pad candidate |
| --- | ---: | ---: | ---: | ---: | ---: |
| LOSS-A | 102 | -4.389912 | -5.285800 | -5.161434 | -6.073362 |
| LOSS-B | 102 | -3.629962 | -5.335529 | -4.928474 | -6.074141 |
| LOSS-C | 97 | -4.161423 | -5.407739 | -5.376733 | -6.085413 |
| GIBRAN-C | 96 | -3.734186 | -4.484140 | -4.378577 | -5.855748 |
| GIBRAN-D | 98 | -4.067075 | -5.387353 | -4.845882 | -5.509839 |
| GIBRAN-E | 97 | -3.594050 | -5.615495 | -5.625189 | -5.895146 |

**Rank gate passed 6/6; uniform false positives 0/6.** Minimum margin over the best wrong pair 0.644390 nats/rune; worst true -4.389912 vs best uniform -5.509839. This establishes candidate discrimination against the sampled alternatives, not blind recovery or a calibrated probability for all possible keys. DistilGPT2 pretraining may contain public-domain passages. The next gate must recover actual hidden P/K runes from fresh ciphertext-only controls with no access to the truth during search. Unknown LP2 remains unscored; no authentic new plaintext or key.
