# Mayfly artwork bridge: original p24 to known p57

**Status:** bounded negative, 18 November 2026, Agent29. No unknown LP2 plaintext or authenticated key recovered.

## Source-selected hypothesis

Original LP2 page24 (physical 41.jpg, 270 unknown runes) has mirrored mayfly-like insects along its sides. Solved page57 (physical 74.jpg, 95 clear runes) shows a dissolving mayfly below the plaintext PARABLE. Existing original-art analysis already links the artwork through a GIMP forward model ([reproducer](../sims/lp2_p57_gimp_multiscale_source_sft.py); [source-art assessment](lp2-p57-native-layer-master-archive-source-gate.md)). The visual link supplies an independent reason to test page57 as a known-plaintext donor to page24.

We first try the 95 clear p57 GP indices and their GP-prime residues mod29 as repeating additive keys on p24. The paired-mirror artwork motivates forward/reverse orientations. A stronger test grants the premise an arbitrary 95-symbol additive key recovered by cribbing p57 cleartext against the first or final 95 symbols of p24. The other **175 symbols** form a genuinely untouched original-ciphertext holdout. The crib interval is not counted as evidence.

## Results

Original GP29 normalized IoC: p24 ciphertext **0.963872**, p57 authentic cleartext **1.818589**. The eight direct transfer outputs all remain unreadable, with normalized IoC **0.963073–1.045326**.

| Known crib direction | Placement in p24 | Untouched runes | Holdout GP29 IoC |
|---|---|---:|---:|
| Forward | First 95 | 175 | 0.967619 |
| Forward | Final 95 | 175 | 1.030476 |
| Reversed | First 95 | 175 | 0.994286 |
| Reversed | Final 95 | 175 | 1.017143 |

The untouched output in all four crib variants remains unreadable and near uniform. The [standalone Node22 positive-controlled test](../sims/lp2_p24_p57_mayfly_keygate_sft.cjs) uses the unchanged original index corpus at resources/liber-primus/lp2-corpus.json. A native-GP planted message verifies direct inversion **270/270** and recovered-pad heldout inversion **175/175**.

**Decision:** The source-art relationship does not authenticate a direct GP ordinal or prime-residue additive transfer, or an arbitrary fixed period95 additive pad from p57 to p24. These bounded routes can be retired. An independently legible nonlinear extraction rule or original layer master would be a different investigation. This outcome does not exclude unbounded external keys, word-specific transformations, or non-additive image channels.

The original-image art relationship predates this run; this report preserves only the new, limited plaintext-receiver test.
