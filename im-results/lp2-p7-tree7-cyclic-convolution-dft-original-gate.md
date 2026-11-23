# P7 red-quartic to seven-tree finite-field convolution: frozen original inverse

**Agent41, 23 November 2026.** Classification: original-source, lossless GP29 decryption experiment with independent solved-native plaintext controls. **No new unknown-page plaintext, creator key, or authenticated operation is recovered.** This concerns one source-defined seven-position cyclic-mixing family and its literal seven-point Fourier readout. It does not exclude arbitrary 7×7 Hill keys or another selected register.

## Independent clues and decision

The original physical p7 ends with five whole-red words whose GP29-index products, in printed order, are **11,26,8,15,2**. They are already known to define the polynomial `P(x)=11+26x+8x²+15x³+2x⁴ (mod29)`; its original p8 fixed-point relationships and seven-cycle are established in [p7 source arithmetic](lp2-p7-red-polynomial-seven-cycle-original-gate.md). The following seven consecutively tree-illustrated pages p8–p14 contain exactly **1,729=7×247** original runes, with physical sizes **[255,268,263,273,261,272,137]** and an unusual printed numeral7 on p10. This supplies a concrete, fully authored seven-slot *operand*.

A plausible simple human operation is seven-slot polynomial multiplication modulo `x⁷−1`, using the complete red polynomial as a short cyclic filter. For each seven-rune input vector `v`, define the forward output `y_j=Σ(k=0..6) a_{(j−k) mod7} v_k mod29`, with coefficient vector `a=[11,26,8,15,2,0,0]`. This is an actual invertible cipher candidate: the polynomial's seven Fourier eigenvalues over GF29, at one and all six primitive seventh roots `[7,16,20,23,24,25]`, are `[4,5,20,2,17,7,22]`, **all nonzero**. Hence no missing information or secret state is needed to invert it. The inverse is computed by exact modular matrix elimination with identity verification. A second source-natural winding uses `a_{(j+k) mod7}`; both are covered.

Two predeclared original placements cover the literal seven-rune blocks and the seven 247-rune vertical strands. Both directions of each convolution map and its inverse are computed. Independently, test the literal seven-point GF29 number-theoretic Fourier transform `Y_j=Σ v_k ω^(jk)`, for every one of the six admissible seventh roots and both ordinary/inverse normalizations. These are concrete finite sets, with no language-fitted key, phase, arbitrary padding, private matrix, or post-selected ciphertext alignment. They are still hypotheses because **no original source prints a command to multiply by P modulo x⁷−1 or to apply a DFT**.

## Exact original-cipher results

The source is the repository's unaltered `resources/liber-primus/lp2-corpus.json` concatenated for physical pages p8..p14, all **1,729** rune indices. Index of coincidence (IoC) is the ordinary `Σ n_s(n_s−1)/(1729·1728)` over the resulting 29-symbol sequence. Original untransformed IoC = **0.03446048347364137**. The independent first 1,729 authentic solved-GP runes in `resources/external/relikd-solved-gp29-native-v1.json` have **IoC 0.0605185506501296**.

| Frozen original transform | 7-symbol consecutive blocks | 7×247 column strands |
| --- | ---: | ---: |
| Cyclic polynomial, forward winding, direct | 0.034543490136 | 0.034204099994 |
| Cyclic polynomial, forward winding, inverse | 0.034605075723 | 0.035076339353 |
| Cyclic polynomial, reverse winding, direct | 0.034551523038 | 0.034320577084 |
| Cyclic polynomial, reverse winding, inverse | 0.034605075723 | 0.035076339353 |
| GF29 seven-point Fourier output, all six seventh roots (either scalar normalization) | 0.034570266478 | 0.034501986805 |
| Literal GF29 seven-symbol average (247 output runes) | 0.032684901748 | 0.034231921267 |

A separate **seven physical-page same-offset arithmetic mean** for the first 137 shared rune positions yields IoC **0.033061399742378705**. Each original full-length cipher output remains near-uniform. None gives sustained recognizable native-GP text or an authentic unknown plaintext passage. The DFT root and scalar variations change letter labels/order but produce no increased language concentration. The seven polynomial eigenvalues guarantee a fully reversible forward and inverse, yet no original-source evidence selects the operation as an intended decoder.

The standalone [Node22/CommonJS reproducible SFT](../sims/lp2_p7_tree7_cyclic_convolution_dft_original_sft.cjs), **[original-source Windows CI PASS 45193445880](https://github.com/FlareZ123/liber-primus/actions/runs/45193445880)**, asserts the original rune lengths, primitive roots, all output IoCs, every exact original source roundtrip, matrix inverse identity and **independent authentic solved-GP 1,729/1,729 planted encryption/decryption positives** for both DFT and cyclic convolution. The positive checks demonstrate correct code, not historical provenance. The same SFT covers the three rune-mean outputs, which are not independently invertible and therefore only diagnostics.

## Independent static-image receiver

The conditional separate p50-column Bitcoin address `1Meanpng7jzYW69Cqmto1r2mGeEoynXdoK` includes human-readable `Meanpng7` immediately before the tree-chapter image count 7. This is a **post-selection inference**, not an authenticated first-party operation. As the cheapest fixed image test, take exactly the complete seven original p8–p14 tree-scans (archive JPEGs **25.jpg–31.jpg**), decode unchanged RGB 2400×3600, align by original pixel coordinates, and compute channelwise equal-weight arithmetic mean with nearest-integer rounding; output literal lossless PNG, with no thresholding, cropping, filtering or image subset tuning.

The computed mean's native RGB raster SHA256 is **bf4c7d36548536b843d51d60ecb8be335f6231cc200cb8805fd4c4b9a5adc389**; exactly **6,412,242/8,640,000** pixel coordinates are identical across all seven originals. The average visibly retains common tree artwork and layers different ciphertext lines, with no independently legible hidden message or recovered key. This newly fixed seven-page image mean is distinct from earlier floral16 and all58 image means. It is an observational receiver negative, not proof that any conceivable image operation is impossible. The maintainer-upload original JPEG ZIP supplied the actual bytes and the extraction procedure is specified above.

## Decision

Retire the **direct seven-slot polynomial cyclic convolution**, its inverse and the **standalone seven-point GP29 Fourier readout** for literal untouched p8–p14 native GP29 plaintext. The original red polynomial's seven-cycle and original chapter's sevenfold length survive as source facts, but a new attempt needs an independently selected receiver, state-update command or separate authentic key. Do not tune roots, block offsets, masks, image subsets or phases to preserve this branch. No unknown LP2 page is solved.
