# P50 11-cycle / p32 blurred tree: exact 11×11 GF29 deconvolution gate

**Agent 47, 21 November 2026.** A finite, original-cipher, source-motivated receiver was tested and rejected as a direct LP2 p32 decoder. **No previously unknown plaintext, authentic key, or next destination was recovered.**

## Causal source path

The signed 2016 message directs readers toward the words as a map. The source-printed 256-entry p50 table, under the historically conventional **working** base60 byte reading, contains an exact directed eleven-cycle
`0→203→68→199→47→76→114→197→115→247→192→0`.
The `EPIPHANY/SEEKS/THE/DEVOTED` candidate navigation route to **p32** was separately calibrated across all discovered routes in [#2046](../im-results/lp2-p50-discovery-aware-null-calibration.md) and remains conditional, with no existing decipherment. P32 has **121 original rune symbols = 11×11** and depicts a blurred tree. P55 has a corresponding sharper/outlined version of the same tree, a visually confirmed manuscript relationship ([image pair](../im-results/lp2-p32-p55-blurred-tree-correspondence.md)). Blur versus outline is an independent, human-visible motivation for one mathematically familiar operation, **convolution/deconvolution**.

This creates a test distinct from the previously negative **simple repeated additive use of the p50 cycle** ([prior test](lp2-p32-p50-11cycle-key-negative.md)): a key-selected **circulant GF29 kernel** applied rowwise, columnwise, or both to p32's 11×11 original-cipher rune matrix. The key phase is fixed by `GP0(SEEK)=27`: among the eleven cycle nodes, **only state114 is 27 mod29**.

Cycle beginning at 114:
`[114,197,115,247,192,0,203,68,199,47,76]`

GF29 convolution coefficients:
`[27,23,28,15,18,0,0,10,25,18,18]`

Define `H[i,j]=key[(i−j) mod11]`, its exact GF29 inverse `H⁻¹`, and p32 reading-order ciphertext reshaped to `C` 11×11. The three predetermined receivers are:

- Rowwise inverse: `P=C·(H⁻¹)ᵀ`.
- Columnwise inverse: `P=H⁻¹·C`.
- Separable 2D inverse: `P=H⁻¹·C·(H⁻¹)ᵀ`.

No guessed rune, plaintext-fitting shift, alternate orbit phase, rerouted navigation link or secret key is introduced. The original page text is not printed as a perfect 11×11 graphic, so the matrix reshape is still a hypothesis, as is treating the p50 cycle as a blur kernel. Neither is a signed instruction.

## Observed complete original-input results

All 121 original p32 rune indices are consumed once; the directed p50 graph edges, phase selection, kernel invertibility and exact GF29 matrix inverse are asserted. A 121-rune authentic GP29 English plant derived from independently established LP1 prose was encrypted and recovered **121/121** under every proposed operator.

| Original or decoded register | GP29 IoC | Source-native mean GP29 trigram log probability |
|---|---:|---:|
| Source p32 before deconvolution | 0.03415978 | −3.42330201 |
| Inverse 11-tap rowwise | **0.03333333** | **−3.41798724** |
| Inverse 11-tap columnwise | **0.03815427** | **−3.43442688** |
| Inverse 11×11 separable 2D | **0.03319559** | **−3.41308957** |
| Independent solved p57 control | native readable GP | **−2.46814471** |

Every proposed inverse remains at the encrypted/random-like language floor. The minor score improvements in two orientations contain no readable consecutive passage or full original-cipher key. The controlled inverse passed in [native Windows Node22 GitHub Actions run 44943728484](https://github.com/FlareZ123/liber-primus/actions/runs/44943728484); the log emits exact 121-rune candidates and retains all source indices for independent inspection.

## Decision and limit

**Reject the literal p50/SEEK-selected 11-cycle as a cyclic GF29 image-blur key for p32.** This result advances a specific operation choice beyond repeated Vigenère by consuming the independent tree-pair cue, and closes that proposed mechanistic handoff. It does not invalidate the separately measured word→table→p32 navigation selectivity, which still lacks a creator-authenticated operation. The eleven-cycle, 121-rune length, and shared original artwork are authentic observations; **convolution is an investigator hypothesis**. Do not react to the negative by searching fitted blur kernels, secret rotations or word resets without another first-party selector.

Reproducer: [single standalone CJS source-input SFT](../sims/lp2_p32_p50_11cycle_circular_deconvolution_sft.cjs) · [manual Windows workflow](../.github/workflows/agent47-11cycle-deconvolution-manual.yml) · [successful run and full output](https://github.com/FlareZ123/liber-primus/actions/runs/44943728484).
