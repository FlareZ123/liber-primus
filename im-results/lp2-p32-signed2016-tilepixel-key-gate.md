# The original p32 11×11 image partition does not supply a direct GP29 pixel pad

**Status (12 November 2026):** bounded original-cipher inverse, negative; no unknown plaintext, key, destination or creator-selected cipher mechanism. [Executable single-file CommonJS reproducer](../sims/lp2_p32_2016_tilepixel_direct_key_sft.cjs) · [Successful manual workflow, full original predictions](https://github.com/FlareZ123/liber-primus/actions/runs/43163429788).

## Source-selected premise

The original 2016 signed Cicada image `resources/historical/cicada2016-4gq25.jpg` measures exactly **563×569 pixels**, and shows the tree also present on original LP2 physical p32. That page's 121 original GP runes form an 11×11 row-major square. The **eleven top-row GP-prime weights add to 563**, and the **eleven first-column weights add to 569**, selecting a single 11×11 partition of the authentic image into unequal tiles with no fitted shifts, thresholds or scale. Those source facts and the prior direct tile-brightness relationship are already established in [the image geometry study](lp2-tree121-signed2016-source-gate.md) and [pixel geometry checks](p32-prime-weighted-image-tiling.md). The additional question here is whether the image tiles supply the **missing cryptographic key**, rather than merely correlating with the ciphertext's prime weights.

## Frozen original-input trial

At each of all **121** tile positions, read exactly either (a) the center pixel's mean RGB rounded to a byte or (b) the whole tile's mean RGB rounded to a byte. Reduce the resulting byte to GP29 using the two natural byte conversion rules `b mod 29` or `floor(29b/256)`. Apply the complete 121-key stream in original p32 row-major order as either `P_i=(C_i-K_i) mod29` or `P_i=(C_i+K_i) mod29`. This yields **8 fixed named inverses** from two readings, two reductions and both additive signs.

No key offset, image translation, source crop, threshold, lookup, shape selection, text-fit permutation or ciphertext-dependent tuning is permitted. Every inverse exactly round-trips the entire original 121-rune ciphertext. A planted *independent English GP passage* of the same length is encrypted with each actual source key and recovered **121/121** by its corresponding direct inverse.

For interpretation, a GP trigram likelihood model was trained on the first 140,000 GP-encoded Shakespeare runes in the committed control corpus. An unseen 121-rune slice starting at control offset160,000 is a fixed positive English comparator. The independent model is a screen, not evidence by itself for a cipher's historical authenticity.

| Original GP29 register | GP index of coincidence | GP trigram mean log probability/rune |
| --- | ---: | ---: |
| Untouched original p32 | 0.0341597796 | −4.8223293 |
| **Best original source-pixel candidate**: tile mean, b mod29, additive sign + | **0.0365013774** | **−4.2644034** |
| Best literal center-pixel candidate: b mod29, sign + | 0.0351239669 | −4.6133406 |
| Independent untouched GP-English comparator | **0.0589531680** | **−2.2096871** |

All eight original candidates have GP IoC **0.03237–0.03650**, essentially ciphertext-flat, and trigram scores **−4.2644 to −4.8102**, well separated from independent GP-English. The strongest inverse begins `ULYHYTHXEAGHOEXHNGDEDDSEADHXEOFUNAE...`, which is not an independently recognizable English text. Full settings, all eight original scores, prefixes, input checks, and planted round-trip assertions are printed in the [actual successful manual run](https://github.com/FlareZ123/liber-primus/actions/runs/43163429788/job/130999685055) on Node.js22.

## Interpretation and next decision

This experiment specifically retires the **simplest complete 121-tile pixel-value additive pad**, with fixed source-defined partition and starting cell. A reading with a secret per-tile bit schedule, DCT coefficients, nonlinear key derivation, stateful cipher, word-selected pixel locations or a different image is beyond its scope. Such freedom needs an authentic source clue fixing an operation before original-cipher fitting.

The 563/569 original source relationship remains important as a reproducible 11×11 orientation selector. In this direct pixel-key family, however, no source-native GP29 plaintext is recovered. The missing input is a **specific creator-attributable rule that converts image geometry to an encryption key or a complete reversible reading path**. Do not expand this negative into arbitrary image-filter/offset/key menus without that clue.
