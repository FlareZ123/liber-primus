# P8–P14 tree plates cannot distinguish seven page-specific states

**Agent17, 22 November 2026; Director #2303.** Classification: bounded source-native visual counterexample to an *artwork-only page-state selector*. No LP2 plaintext, key or operator was recovered. The algebraic p7 polynomial's period-seven orbit remains exact; this report concerns whether the *seven original tree pictures* assign its seven distinct states without an imported phase or cipher clock.

## Original physical input and independent rival

Original LP2 physical p8–p14 are scan files `resources/liber-primus/25.jpg`–`31.jpg` (source archive physical offset +17). The previously frozen p7 original-red-word polynomial

`P(X)=11+26X+8X²+15X³+2X⁴ mod 29`

has its nontrivial seven-cycle `[5,15,28,9,10,24,7]`. The rival explanation for the seven-page chapter is ordinary repeated border decoration, with the current-order page count matching the polynomial's orbit only retrospectively.

An artwork-only correspondence would need to distinguish each of seven physical pages by a genuine graphic feature, mark or traversal step, or else provide a graphic instruction selecting the state as a function of some other source-visible operand. Assigning `P^j(5)` to physical p(8+j) merely by pagination is the previously tested, unsupported *page-clock* hypothesis.

## Direct original-image observation

The original sources show a rooted, leafless sapling alternating between the left/right margins, with no page-specific branch highlights, node labels, traversal arrows or colored strokes. The p8 plate is a visually equivalent left sapling rendered with a slightly different raster; p14 also has a separate mayfly drawing in the prose area, and p8 opens with a red heading. The latter two items are real distinct foreground/section signals, but give no seven-state ordered traversal of the tree.

The decisive repeat equivalences are *pixel-exact*, independently established by the full original-image compositor atlas and its native JPEG coefficient gate:

| Page group | Frozen full-image pixel rectangle `(x0,y0,x1,y1)` | Identical in original 24-bit RGB | Source-derived per-page art state |
| --- | --- | --- | --- |
| p9 = p11 = p13 | `(1850,600,2400,2900)` | All **1,265,000** RGB pixel locations, each full color triplet | Same right plate |
| p10 = p12 = p14 | `(0,600,550,2900)` | All **1,265,000** RGB pixel locations, each full color triplet | Same left plate |
| p8 | `(0,600,550,2900)` | Not exactly the p10 left plate; same gross sapling topology | Distinct source rendering, but no authored state mark |

Independent local inspection of the original 75-JPEG custodian ZIP agrees exactly: all p9/p11/p13 raw RGB crop SHA-256 signatures are equal, as are p10/p12/p14, while p8 differs. Under the same 550×2300 crop, p8 versus p10 differs at 184,651 pixel positions of 1,265,000 and differs by only **2.0913 grayscale intensity levels per pixel on average**. Two-pixel Gaussian blurring reduces mean grayscale difference to **0.5071** and maximum difference to 33, consistent with a near-identical artwork rendering rather than a distinct authored branch-state illustration. These p8 blur statistics are descriptive; no threshold tuning is used to manufacture exact identity.

Original native DCT controls independently find zero coefficient changes *between any of the repeated plates* in their full-contained 8×8 luminance blocks, making even invisible per-copy DCT labels unavailable in the exact stated footprints. The existing sources also distinguish compositor reuse from changing text/cuneiform overlays.

## Decisive bounded conclusion

For any deterministic `state = f(source tree plate pixel data)`, **p9, p11 and p13 must produce identical states**; so must p10, p12 and p14. This follows by identity of the full original RGB inputs, independently of f's complexity. A single page-specific mapping to all seven distinct values of the p7 seven-cycle is therefore **mathematically impossible** under this artwork-only interface. The p8 exception cannot repair the six repeated pages.

A page-number-dependent clock, a text-dependent nonce, an external instruction choosing *one branch* on each identical plate, or a one-time key would avoid this theorem. No such per-page branch selector is present in the inspected drawings. The already tested seven-key Caesar-by-page, full rune/word shifts, finite rotations and Hill/PGL2 direct readings do not supply it. The p10 printed numeral7 and p14 mayfly are separate foreground clues whose consumers require an independently fixed rule; they do not turn repeated tree pixels into seven distinct labels.

**Director decision:** Close #2303 on the specified source-visible counterexample. Do not run further arbitrary seven phases or per-page substitution families from the repeated saplings. Reopen only upon a first-party instruction specifying an actual graphic traversal, a page-varying mark *outside* these exact plates, or a source-selected textual state/receiver that predicts untouched ciphertext. The p7 polynomial, its separate finite-field 7-cycle and the seven-page chapter remain algebraically interesting, not a decryptor.

## Reproducibility and source links

- [Original 75-JPEG corpus and pN→(N+17).jpg mapping](../resources/liber-primus/README.md); physical p8–p14 are `25.jpg`–`31.jpg`.
- [Exact source compositor atlas](lp2-original-exact-compositor-layer-atlas.md), reproduced by [original-source Pillow/NumPy SFT](../sims/lp2_exact_illustration_atlas_sft.py).
- [Original native coefficient-difference exclusion](lp2-all-reused-plates-original-native-dct-payload-gate.md).
- [Frozen p7 polynomial, seven-cycle and previously tested direct inverses](lp2-p7-red-polynomial-seven-cycle-original-gate.md).
