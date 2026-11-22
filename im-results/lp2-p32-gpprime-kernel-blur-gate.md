# P32 GP-prime 11x11 blur-kernel hypothesis: negative gate

**Classification:** intermediate negative result; not an established decryption.

## Hypothesis and source path

P32 is independently selected by the signed 2016 phrase EPIPHANY SEEKS THE DEVOTED and contains exactly 121 runes. Reflowing those runes row-major gives an 11x11 matrix. Under the Gematria Primus prime-weight interpretation, its first-row sum is 563 and first-column sum is 569, matching the dimensions of the signed 2016 image.

P32 also carries a blurred tree image, while p55 carries a clearer outline of the same ornamental tree. This motivates one specific image-domain hypothesis: the row-major 11x11 GP-prime matrix is the point-spread function that blurs the p55 tree into the p32 tree.

This is a motivated hypothesis, not an instruction printed on either page. The 11x11 reflow is derived from the 121-rune count, and the image-dimension match alone does not prove a filter interpretation.

## Fixed test

Reproducer: [sims/lp2_p32_gpprime_kernel_blur_gate.py](../sims/lp2_p32_gpprime_kernel_blur_gate.py)

Inputs are the original LP2 scans:
- p32: resources/liber-primus/49.jpg
- p55: resources/liber-primus/72.jpg

The script:
1. Reads the canonical p32 121-rune sequence from resources/liber-primus/lp2-corpus.json.
2. Converts each rune to its GP prime weight and reshapes row-major to 11x11.
3. Fills the largest connected p55 tree-outline component in the fixed crop, uses the p32 blurred-tree crop as target, and resizes both to 360x360.
4. Reuses the already-frozen p32/p55 registration (scale 0.88, translation +10,+24); it does not refit the transform.
5. Applies the normalized prime-weight matrix as an 11x11 filter in both mathematical-convolution and correlation orientations.
6. Compares the exact row-major kernel against 20,000 random permutations of the same 121 prime weights, charging the maximum of the two orientations. The null preserves the kernel's weight multiset and tests whether its specific spatial ordering matters.

The fixed crop/registration comes from the existing p32/p55 correspondence work; this test does not add dilation, tune scale, or search translations.

## Results

The prime-weight matrix has first-row sum **563**, first-column sum **569**, and total weight **6,045**.

| Candidate | Raw correlation | Correlation after symmetric metric smoothing (sigma=6) |
|---|---:|---:|
| GP-prime matrix, correlation orientation | 0.481056 | 0.565561 |
| GP-prime matrix, convolution orientation | 0.482602 | 0.567259 |
| GP-ordinal matrix, best orientation | 0.482713 | 0.567283 |
| Uniform 11x11 box kernel | 0.482698 | 0.566702 |
| 11x11 Gaussian, sigma=2 | 0.465143 | 0.561821 |
| Identity (no added filter) | 0.442051 | 0.558611 |
| Generic Gaussian blur, sigma=9 | 0.548751 | 0.604484 |

The GP-prime matrix is effectively indistinguishable from a uniform 11x11 blur and does not outperform a generic Gaussian blur. Its specific row-major arrangement is not supported by the permutation control:

- observed maximum over convolution/correlation orientations: **0.482602**
- random-permutation maximum mean: **0.484223**
- random-permutation maximum 5th-95th percentiles: **[0.481925, 0.486958]**
- 17,246 of 20,000 random permutations scored at least as well
- empirical upper-tail fraction with +1 correction: **0.8623**

The exact matrix arrangement is therefore not unusually predictive of the p32 blur. The Gaussian control is materially better.

## Decision

**Reject the direct 11x11 GP-prime point-spread-function hypothesis.** Do not continue with scale, orientation, or kernel permutations to rescue it. This result does not rule out other roles for the p32 matrix, nor does it disprove the established p32/p55 visual correspondence; it only closes this simple, source-motivated spatial-filter interpretation.

No update to results/README.md is warranted: no plaintext, key, or established mechanism was recovered. Future p32 work should seek a separately source-selected value-changing operation rather than another generic image-filter family.
