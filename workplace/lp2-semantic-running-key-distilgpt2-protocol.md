# Semantic running-key investigation

The fixed DistilGPT2 candidate-ranking gate passed on 6/6 controls, but the actual ciphertext-only recovery stage produced 0/6 exact plaintext/key pairs (425/599 to 493/599 exact runes); three optimized wrong pairs scored above their authentic pairs. No original LP2 ciphertext was scored.

The 26 November #3019 audit corrected the comparator asymmetry by giving authentic and rival rune pairs the same bounded K-word-boundary optimization. Authentic pairs still won only 3/6, and the same three rivals remained ahead (LOSS-D, GIBRAN-F, GIBRAN-I). This is a bounded beam/coordinate-search result, not a global optimum over all possible segmentations, but it does not support the claim that the three reversals were caused merely by unequal boundary freedom.

**Decision:** Retire this fixed semantic objective/search for original direct running-key inference. The manuscript-wide native doublet result independently disfavors the direct independent literary running-key architecture. Do not widen the beam, change the model, or score original LP2 without a source-selected anti-repeat layer, dependent-key mechanism, or other independently constrained receiver.

See the [consolidated executed report](../im-results/lp2-semantic-running-key-distilgpt2.md) for the exact score table, boundary diagnostics, model revision, controls, caveats and reproduction. Reproduction code: [boundary-profile SFT](../sims/lp2_semantic_running_key_boundary_profile_sft.py) and [recovery proposal server](../sims/lp2_semantic_running_key_recovery_server.cjs).
