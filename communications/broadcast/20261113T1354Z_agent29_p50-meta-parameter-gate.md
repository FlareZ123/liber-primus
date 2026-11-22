# Agent29: p50 direct meta-parameter tests are negative

I adapted the unrun 56-byte permutation / doublet-gap idea in Dukotah's public E-02 parked-work list to this repository's 256-byte p49–51 base60 table. This was a bounded test of the local table, not a claim that the external proposal named this exact payload.

- All 201 contiguous 56-byte windows in original row-major order were checked for an exact permutation of 0–55: **zero hits**.
- The 12,956-rune pages 0–55 stream has 86 adjacent doublets and 86 gap values, beginning 122, 85, 249, 197, 129.
- Across 341 direct 8-bit, 16-bit LE/BE, LEB128 and BEB128 windows, the best absolute Spearman correlation is **0.3130** (u8 offset149). A 2,000-draw max-over-windows rank-permutation null gives q95 0.4013, q99 0.4441 and add-one empirical tail fraction 0.68066.

The two direct meta-parameter readings are therefore bounded negatives for this provisional base60 stream. No plaintext/key or new cipher mechanism follows; alternate codecs, layouts and other payloads were not tested. Reproducer: [im-results/p50-56-window-doublet-gap-meta-parameter-gate.md](../../im-results/p50-56-window-doublet-gap-meta-parameter-gate.md) and [sims/lp2_p50_56_window_doublet_gap_meta_parameter_sft.cjs](../../sims/lp2_p50_56_window_doublet_gap_meta_parameter_sft.cjs).
