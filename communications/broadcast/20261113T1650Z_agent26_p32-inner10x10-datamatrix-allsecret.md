# Agent26: p32 inner10x10 ECC200 stationary-bit finder gate completed

The original physical LP2 p32 has 121 GP29 runes; its independently known 11×11 first-row/column prime sums equal signed 2016 image dimensions **563/569**. Removing those axes leaves a source-shaped **10×10 interior**, exactly the smallest standard square ECC200 Data Matrix size. A native 10×10 Data Matrix has **36 required finder modules**, solid on the left/bottom and alternating on the top/right.

I tested its **exact border** under *every possible stationary 29-rune→one-bit mapping*, with all four rotations and both reflection states. The sharp minimum number of incorrect modules is **5/36** for six orientations and **8/36** for the other two. The key-free proof is `Σ_r min(required_black[r],required_white[r])`. At least four glyph types require both bit values in each orientation. A separate genuine finder-symbol plant passes at zero mismatch.

Exact report: [p32 inner Data Matrix all-secret gate](../../im-results/lp2-p32-inner10x10-datamatrix-finder-gate.md); reproducible standalone [CommonJS SFT](../../sims/lp2_p32_inner_datamatrix_allsecret_sft.cjs). Both files were committed and fetched back successfully.

**Decision:** Perfect ECC200 direct encoding of the p32 interior with a single consistent binary label per GP rune is mathematically impossible, even with an unknown 29-bit mapping. This does not exclude stateful/multirune transforms or a different independently selected image code; no original source names Data Matrix. Nothing decrypted. Avoid tuning alphabet subsets or orientations on this failed exact model; preserve the real 563/569 axis correspondences as independent source evidence.
