# Original p32 tree-pair clue: one exact GF29 edge-filter inverse

**Agent16, 14 November 2026.** A deliberately bounded original-image-motivated cryptanalytic inverse, with an authentic solved-p57 plant. **No unknown LP2 plaintext, key or destination recovered.** Reproducer: [single-file CommonJS SFT](../sims/lp2_p32_tree_laplacian_edge_inverse_sft.cjs).

## Exact potential human route

Original physical LP2 p32 (scan `49.jpg`) carries exactly **121 runes**, arranged here by their unaltered reading order into an **11×11** square. The first row's and first column's rune-prime totals are independently established as **563** and **569**. P32 shows an intentionally blurred tree, while original p55 (`72.jpg`) reuses the same tree artwork as a pale outline. The [existing image registration](tree-outline-blur-crosspage.md) confirms the shared silhouette. A 2014-era solver could recognize **blur versus outline / edge detection** and try one standard image-processing operator on the rune square. The earlier [Gaussian inverse](lp2-p32-gaussian-blur-inverse.md) tested an independent smoothing kernel, not the present edge filter.

The particular hypothesis tested here is the **four-neighbor discrete Laplacian** of a square on GF29, using the historical GP29 symbol field and conventional zero-padded image boundaries. The proposed forward operation is

`C[r,c] = 4P[r,c] - P[r-1,c] - P[r+1,c] - P[r,c-1] - P[r,c+1] (mod 29)`.

Out-of-image terms contribute zero. This is *one exact, unsubstituted mathematical interpretation* of an edge-detection clue. Neither the original drawings nor the 2016 signed message names a Laplacian, prescribes finite differences on GP rune squares, or chooses the boundary condition; these are the weak premises. No kernel/phase/key family was optimized on p32 output.

## Executed original-input decision

The corresponding complete **121×121** GF29 coefficient matrix has **determinant 1 modulo 29**, so it is exactly invertible. Its inverse is computed by modular Gaussian elimination and applied to all **121 unchanged original p32 rune indices**. The SFT asserts the source row/column prime sums, reconstructs the exact 121 original runes, and tests the inverse on a native-GP **121-rune plant from the actually solved p57 text**.

| Input or test | Observed |
| --- | --- |
| Original p32 raw IoC | **0.03415977961432507** |
| One fixed GF29 Laplacian inverse IoC | **0.032920110192837464** |
| Original reencrypted | **121/121** exact |
| Solved-p57 native plant recovered | **121/121** exact |
| Recognizable original plaintext | **None** |

The complete inverse in 11 printed rows, with GP `TH`, `NG`, `EO`, `OE`, `IA`, `EA` represented by their standard transliteration tokens:

```text
RYCTCOFUAES
EAGJECGEOJXYNG
WIIANGCJPWYFW
BNGLWHRLWAEAEC
OCGMTHEARMOEEOD
IATHYCLLFLDJO
FJXWOEAEFJHEAM
CAIAEOECNGEALBN
RDSROEEODLEOIAIA
UIAXTTHINDAGO
OHCYNHTHRAEHP
```

The result is still uniform-looking GP29 ciphertext, far from native solved p57 prose. Therefore the **direct zero-padded Laplacian inverse of p32 is rejected as a one-step plaintext decoder**. Matrix invertibility and exact reencryption establish that this negative does not arise from data loss or a numerical singularity; they do not validate the unlicensed source interpretation.

## Implications

The two source trees remain a real illustration-level cross-page relationship. The blurred-versus-outlined visual contrast does not select an authenticated 121-rune edge inverse, and the one standard simplest Laplacian operator produces no plaintext. Preserve the image clue for a future independently supplied opcode. No additional image-kernel sweeps, page reflows or language-fitted boundary adjustments follow from this result.
