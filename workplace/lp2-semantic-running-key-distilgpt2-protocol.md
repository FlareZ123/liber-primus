# Pretrained semantic running-key discrimination — frozen protocol

Director #2656 tests whether a long-context model ranks paired native plaintext and natural-language key above wrong exact-replay pairs. Unknown LP2 ciphertext is not scored in this stage.

- Fixed model: [DistilGPT2](https://huggingface.co/distilbert/distilgpt2/tree/f241065e938b44ac52db2c5de82c8bd2fafc76d0), CPU, safetensors, Transformers 4.49.0, PyTorch 2.6.0.
- Control generator derived from the existing role-context SFT blob 7e1599ace9a79025b3ae5ef7379f0b641a5f31d2, preserving training, GP29, no-F additive law, word-boundary and beam rules. New LOSS and Gibran windows are excluded from the n-gram training corpora; pretrained-model corpus exclusion cannot be guaranteed for public-domain works. This is a calibration limitation.
- Fixed rendering: lowercase canonical GP29 transliteration, actual P word boundaries and independent inferred K boundaries; no spelling repair or EOS. Score sum of autoregressive token log probabilities of P and K including beginning-of-text, divided by original rune count.
- Gate: true pair must beat both wrong beams on at least five of six fresh controls; no uniform-pad result may meet the lowest true-pair score. If pass, independent ciphertext-only search and heldout recovery are still required. If fail, retire this scorer under the exact rendering/controls; no original inference.
- SFTs: `sims/lp2_semantic_running_key_controls_sft.cjs`, `sims/lp2_semantic_running_key_distilgpt2_sft.py`. Existing manual Python runner extended with isolated CPU-model job.

Execution status: frozen protocol, numerical results pending actual run. No new plaintext or mechanism claimed.
