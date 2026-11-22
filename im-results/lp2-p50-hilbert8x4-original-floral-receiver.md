# LP2 p50 printed 32×8 grid: classical Hilbert-tile key and the complete floral ciphertext

**Decision (Agent35, 22 November 2026):** A source-layout-preserving traversal of the original p50 byte grid using four connected classical 8×8 Hilbert paths yields no readable GP29 plaintext when used as a repeating additive key for the complete original 3,316-rune p40–55 floral register. **All eight complete inverses remain at the random GP29 coincidence level**, even though exactly the same inverses recover a deliberately encrypted 3,316-rune native solved-text control. No original unknown LP2 plaintext, authentic key or decoding command was recovered. [Windows Node.js 22 original-source PASS](https://github.com/FlareZ123/liber-primus/actions/runs/45029327716) · [single-file reproducible attack](../sims/lp2_p50_hilbert8x4_original_receiver_sft.cjs).

## Source-constrained proposal and competing explanations

The original physical p49–51 numeric block has **32 rows × 8 cells**. Its conventional base60-byte parsing gives exactly 256 bytes, with unmodified SHA-256 `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`. It is adjacent to the original 16-page p40–55 floral section (15 rune-bearing pages; p50 has no runes). Cicada's signed 2016 reminder says the manuscript's numbers give direction, and p15 has an explicitly spiral-shaped 4×4 number diagram. Those are reasons to consider an original-grid route, but they **do not specify Hilbert traversal**, a byte-to-rune code, or a cipher.

A classical 8×8 Hilbert path is a historically available, visually followable continuous route. The **native** 32×8 printed table comprises exactly four vertically stacked 8×8 squares. In each square orient the standard path to begin at its top-left and end at its bottom-left, then connect the square to the one below by one orthogonal step. This visits **every one of the original 256 cells once**, keeps the printed arrangement unchanged, and has no nonadjacent step. The base readout begins with decimal bytes `203,231,249,92,121,109,198,202,15,173`.

The source's horizontal/vertical reflections and path reversal yield **four unique ordered 256-byte sequences** after exact deduplication. A key of period256 can be applied continuously to the full 3,316 original floral GP symbols; the runeless p50 occupies zero key positions. To avoid a postselected cipher fit, the frozen direct inverse uses only

```text
K[i] = ordered_table_byte[i mod 256] mod 29
P[i] = (C[i] ± K[i]) mod 29
```

This is a proposed reversible receiver, *not* a Cicada-authenticated instruction. A different interpretation is that the table is a binary payload or unconnected artwork, or that a source-selected receiver would use a nonlinear operation. Existing ordinary row-major and selected-row tests are separate experiments; this investigation adds the historically ordinary square-Hilbert *native-grid* route.

## Exact original-input result

The Windows runner read the unmodified JSON transcription and original numeric table with the pinned source digest, asserted that every route has exactly 256 unique source addresses and every step moves one cell, and ran **4 keys × 2 additive signs = 8** complete original inverses. Every candidate was re-encrypted byte-for-byte to the original ciphertext. The table-derived key was also used to encrypt and recover a native-GP29 planted control assembled from original **solved p57**, with **3,316/3,316 runes** recovered.

| Original test | Result |
| --- | ---: |
| Entire unmodified p40–55 ciphertext | **3,316 GP29 runes**, exactly |
| Original first p40–53 part | 3,008 runes |
| Original untouched p54–55 terminal | 308 runes |
| Direct original decoded whole-section index of coincidence, all eight | **0.034307630–0.034562713** |
| Uniform 29-symbol reference | **0.034482759** |
| Solved native p57 repeated control, roundtrip | **0.072221161** |
| Primary top-left route, subtract pad, whole-section IoC | **0.034489390** |
| Primary top-left route, subtract pad, p54–55 IoC | **0.035576801** |
| Primary top-left route, subtract pad, p49 / p51 independently reset local IoCs | **0.038694639 / 0.033205925** |
| Plaintext / original authorial operation | **None recovered** |

The primary top-left subtract inverse begins `F.I.TH.NG.U.U.U.N.N.X.E.OE.E.U.G.L.H.U.B.D.I.U.W.OE.EA.M.W.N.I.TH.M.J`, with no discernible English. Neither the original long section nor the source-closest short flanks offer a positive GP29-language signature. The 66- and 92-rune flank IoCs are noisy small samples and are not scored as independent proof. The unmodified full output, all four key bytes, and the entire eight-model table are printed in the linked CI run.

## Cryptanalytic decision

**Retire** the literal four-Hilbert-tile 256-byte key followed by ordinary additive GP29 inversion. It has a complete, affordable original-input negative, native-plaintext positive, and exact inverse. This result does **not** forbid Hilbert's geometry as an address route under a separately sourced decoder, or other original-table structures. A more elaborate traversal or cipher must first have independent first-party evidence choosing its new inputs and operation; otherwise this would become another unbounded key search. Continue looking for a creator-authenticated **reversible receiver** and genuine plaintext rather than using an attractive tour as proof of a key.
