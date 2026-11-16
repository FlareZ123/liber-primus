# P32 blurred tree and p55 gray tree: no simple filled-contour blur identity

**16 November 2026.** This is a source-image discriminator, not a decryption or an exclusion of arbitrary common sources. Both illustrations are from the original manuscript and were compared using their original 2400×3600 JPEGs. P32's diffuse black branching shape occurs in combined image `49.jpg` (SHA-256 `c0f778187a8e9ddbfc667a65929ac567430a2e38278a2022377984ac084e5f72`; 362,637 bytes); p55's pale, finely outlined tree in `72.jpg` (SHA-256 `a80191592add93a86ed3868f9e4e6ba3944ec20c9ffccc7d3e221b461344beba`; 614,928 bytes). It is tempting to infer that p32 is p55 with its outline filled and blurred, which would provide a source-visible link between otherwise distinct unknown-page passages.

## Frozen visual-source experiment

1. Crop p32's tree in full-resolution pixels `rows[2200:3150], cols[730:1670]` and p55's tree in `rows[1375:2475], cols[640:1680]`.
2. In the p55 crop, select grayscale values below 225 and fill the largest external contour, obtaining a black tree silhouette from the hollow gray line art. Normalize both crops to 200×200 with fixed reading directions, where ink is positive.
3. Apply Gaussian blur to the filled p55 silhouette at four fixed sigmas, `3, 6, 10, 14` output pixels. For each, fit a five-parameter affine approximation (independent horizontal/vertical scales 0.60–1.25, translations ±35 pixels, rotation ±22 degrees) by seeded differential evolution using Pearson normalized image correlation.
4. Independently plant a synthetic target by blurring and affinely distorting that same p55 source, with additive seeded noise and contrast/brightness changes, then perform the exact same registration.

| Test | Maximum normalized correlation |
| --- | ---: |
| p55 source, synthetic affine/blur/noise plant | **0.9942305** |
| p32 original vs filled p55, Gaussian σ=3 | 0.6259536 |
| p32 original vs filled p55, Gaussian σ=6 | 0.6800928 |
| p32 original vs filled p55, Gaussian σ=10 | 0.6999649 |
| p32 original vs filled p55, Gaussian σ=14 | **0.7001884** |

The best original fit stretches one axis almost to its 1.25 bound, rotates approximately 14.5 degrees and still fails to match the silhouette's trunk, principal branch volumes and root. A visually inspected original/fit overlay agrees with the numerical shortfall. A related unfilled-gray-stroke/affine fit also fell below 0.62 normalized correlation (exploratory, not part of the SFT).

## Decision and scope

The p32 image is **not established** to be a straightforward blur, reorientation and recoloring of the p55 outlined tree. A positive synthetic plant at the same resolution and search budget indicates that this comparison can recognize an actual member of the fixed geometric family. This is a bounded negative for *one* intentionally cheap and human-noticeable source-image route, not a proof that these drawings came from separate historical books, are unrelated symbolically, or cannot be linked through a non-affine redraw. More general image warping, low-resolution redraw, independent clipart sourcing and encoded illustration channels remain outside the experiment.

**Cryptanalytic consequence:** There is still no printed source instruction selecting an LP2 p32→p55 key, reading order, branch count, permutation, plaintext or cipher opcode. A forced shared-tree decoder would be a post-hoc substitution. Invest next in independently authenticated instructions or original ciphertext/partial plaintext rather than unrestricted image-fit variants.

**Reproduction:** [Original JPEG source-native Python SFT](../sims/lp2_p32_p55_tree_source_blur_sft.py), using OpenCV, NumPy and SciPy. The exact original images remain in [resources/liber-primus](../resources/liber-primus/). The SFT was executed successfully on the exact original local ZIP mirror, with planted and original image assertions passed. No GitHub Actions CI run was necessary for this bounded visual-screen result.
