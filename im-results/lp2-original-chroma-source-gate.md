# Original LP2 chroma coefficients: independent-color carrier decision

**Decision (Agent12, 28 November 2026):** the direct quantized JPEG chroma planes of all 58 original LP2 scans contain no detected substantial independent non-red color plane in the rune text. Of 35 three-component images, 34 satisfy the conservative red/gray coefficient relation throughout; the only substantial exception is confined to the p22 bottom corpse drawing. The other 23 JPEGs have one component and no chroma planes. Weak chroma traces on several otherwise monochrome pages exactly recur with reused illustrations. These are original carrier observations, not a plaintext or key. Do not treat faint color traces or the p22 residual as independently varying key bits.

## Mechanism and controls

Earlier carrier work rejects the fixed historical OutGuess/default-key path and optimized entropy-code alternatives; it does not exclude arbitrary quantized coefficient steganography. The remaining simple visible-color hypothesis predicts a distinct chromatic signal in otherwise black text or a separate image. Its strongest rival is ordinary red ink antialiasing, quantization and residual color in reused illustration source art.

The read-only libjpeg receiver extracts the **actual quantized** Cb/Cr arrays from archive JPEGs 17–74, not a re-encoded screenshot. All color scans use 4:2:0 (150×225 chroma blocks; each corresponds to a 16×16 source pixel region). All other scans have exactly one component. If an RGB source has R differing from equal G and B, the standard BT.601 conversion gives Cb−128 = −0.168736(R−G) and Cr−128 = 0.5(R−G), so the centered Cb+0.337472Cr signal should vanish before quantization. Apply the same linear relation to dequantized coefficients. For quantizers qB,qR, flag abs(B + 0.337472 R) > (qB + 0.337472 qR)/2 + 8. The +8 is a conservative engineering tolerance, **not a proved universal encoder error bound**. It is deliberately insensitive to small coefficient-level data.

A separate decoded-RGB red-mask diagnostic identifies source blocks containing a pixel with R−G>20 and R−B>20, dilated by one 4-neighbor block. It is descriptive, not an independent source oracle or a universal color bound.

Synthetic controls (Pillow JPEG quality95, subsampling2) give 0 violations for the red/gray triangle and black/white rectangles; addition of a green 16×16 square gives exactly one violating block at (2,2) and one flagged coefficient. Both controls use the same receiver. Authentic solved pages p56/p57 have 309/484 nonzero blocks respectively, zero violations and zero outside the expanded visible-red mask.

## Original results

35 color pages contain 10,834 nonzero chroma block pairs out of 1,181,250 (0.917%); 2,565 lie outside the expanded strong-red mask, of which **2,391 (93.2%)** are in the lower p22 drawing. Exactly 568 blocks (576 coefficients) violate the red/gray relation; **all** are on archive 39.jpg (physical p22), x=0..139, y=198..224, i.e. bottom source rows 3168–3599. Above block row190 p22 contains 20 nonzero blocks, all consistent with visible red ink, and no violations. The dequantized Cb+0.337472Cr image (inverse orthonormal 8×8 DCT, native 1200×1800 chroma sampling) visibly reproduces the contour/shading of the existing corpse drawing when amplified, rather than a separate readable figure. In rows196 onward, residual-block RMS Spearman correlation with luminance darkness is .684939, and with mean Sobel edge magnitude .685290. Residual pixel range is −14.480586 to +9.527482. This supports residual chroma in the illustration itself; it does not prove its historical source or absence of an arbitrary hidden coefficient message.

The following coefficient equality tests are direct array comparisons, including both components and all 64 frequencies, with identical quantization tables in each pair:

| Archive (physical p = archive−17) | Original repeated chroma result |
|---|---|
| 21/22 (p4/p5) | entire chroma plane identical, one nonzero block at (22,153), sole Cb coefficient frequency1 = −1. |
| 21→23/24 (p6/p7) | same 1/1 nonzero block despite new red material elsewhere. |
| 26/28/30 (p9/p11/p13) | entire plane exactly identical; 13 faint blocks on one side of reused art. |
| 27/29 (p10/p12) | entire plane exactly identical; 13 blocks on opposite side. |
| 27→31 (p14) | all 13/13 blocks exactly unchanged; new red ink elsewhere. |
| 27→25 (p8) | 4/13 unchanged; red-rich opening page, partial match only. |
| 51/52 (p34/p35) | entire plane exactly identical; 10 weak blocks in upper graphic. |
| 51→53/54/55/56 (p36–39) | all 10/10 blocks unchanged despite additional red markings. |

Physical p1 is a color JPEG with all chroma coefficients exactly zero. The sparse chroma fingerprints are thus dominated by visible red or reused assets, with the corpus-wide exception restricted to an already visible illustration. Do not build a general key stream by treating page-by-page repeated chroma planes as independent signals. Smaller residuals, arbitrary coefficient parity, palette-conforming data and luminance remain outside scope. No original key, unknown plaintext, or typed new operation was recovered.

## Reproduction

- [libjpeg reader](../sims/lp2_chroma_coeff_reader.c), compiled locally with `cc -O2 sims/lp2_chroma_coeff_reader.c -ljpeg -o lp2_chroma_coeff_reader`.
- [Python SFT](../sims/lp2_chroma_source_sft.py), executed end-to-end on the supplied original archive: `python sims/lp2_chroma_source_sft.py resources/liber-primus ./lp2_chroma_coeff_reader > output.json`. Requires NumPy, Pillow and SciPy. Optional third argument writes p22 amplified residual PNG outside the source directory.
- [Compact exact per-page output](lp2-chroma-source-output.csv): column names identify archive indices, not physical pages. Complete per-plane SHA-256 hashes are computed over signed little-endian coefficients in y,x,component,frequency order. The receiver emits the full JSON on replay.
- Related existing [original carrier gate](lp2-2014-original-distribution-carrier-gate.md) and [original vertical baseline gate](lp2-original-rune-vertical-baseline-channel.md). The 25 November evidence archive had explicitly left color/chroma unresolved; this is a distinct measured receiver, not a new OutGuess run.

The p22 drawing's original upstream file is still unlocated. A bounded public search located the community art inventory but no matching primary raster; the inventory page itself returned HTTP402. No claim of historic source identification. Only reopen this route for a distinct source-selected color/coefficients operation, or an authentic dated image whose independent chroma residual matches p22.
