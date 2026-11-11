# DeadTree Commons derivative gate: source lineage without a cipher result

**Evidence class:** reproducible image-source correspondence; not a recovered plaintext, key, or cipher mechanism.

## Why this was tested

The tree illustrations on LP2 physical p32 and p55 have a strong visual relationship. A historical source lead identifies the underlying photograph as R. Neil Marshman/Brookie's `DeadTree.jpg` on Wikimedia Commons. The Portuguese Wikipedia article *Processamento de imagem* explicitly presents that photograph alongside three named derivatives: salt-and-pepper noise, a 3×3 Gaussian-filtered version, and a median-filtered version. The same article lists filtering/noise reduction and edge detection as image-processing techniques, and later lists image combination by average, difference, or composition.

This is a plausible human-visible lead, not proof of authorial intent. The article itself carries a warning that its references are not clearly cited in the body. The Commons file records, rather than the article's prose, establish the actual source assets and derivative files.

Sources:
- [Portuguese Wikipedia: Processamento de imagem](https://pt.wikipedia.org/wiki/Processamento_de_imagem) — especially the image examples and image-combination list.
- [Commons: DeadTree.jpg](https://commons.wikimedia.org/wiki/File:DeadTree.jpg).
- [Commons: salt-and-pepper derivative](https://commons.wikimedia.org/wiki/File:Dead_tree_salt_and_pepper.png).
- [Commons: Gaussian 3×3 derivative](https://commons.wikimedia.org/wiki/File:Dead_tree_salt_and_pepper_gauss_3x3.png).
- [Commons: median 3×3 derivative](https://commons.wikimedia.org/wiki/File:Dead_tree_salt_and_pepper_median_3x3.png).

## Reproducible inputs and method

The gate downloads and hash-checks the original Commons photograph, then downloads the three exact derivative files. It also hash-checks the LP2 p32 and p55 page scans:
- Commons original: 1894×2606, SHA-256 `608288991f92b8ab901a9fbb39937f93ebdfeb5fd84edeecfa637d5262ff7b29`.
- Salt-and-pepper: 320×440, SHA-256 `e9e4cdb268a6a3b151e56f77d8d50fc9b9e8ab61a57963758353db12d952be69`.
- Gaussian 3×3: 318×438, SHA-256 `fd380f0cd0363064f2b0ca233b560b9bfdcaf487539ec5055215a71abdfbb38b`.
- Median 3×3: 318×438, SHA-256 `f2cf50e0b3353d8c7ea5d0071ca44834d6be2c3560122efb8458fa7439abf668`.
- LP2 p32 scan (`resources/liber-primus/49.jpg`): SHA-256 `c0f778187a8e9ddbfc667a65929ac567430a2e38278a2022377984ac084e5f72`.
- LP2 p55 scan (`resources/liber-primus/72.jpg`): SHA-256 `a80191592add93a86ed3868f9e4e6ba3944ec20c9ffccc7d3e221b461344beba`.

The comparison uses the already-recorded transforms and crops without refitting for each derivative. The p55 fit is horizontally reflected and uses source crop `[100,500,1750,1950]`, target crop `[550,1300,1850,2550]`, scale `0.55`, translation `(230,94)`, and the existing fixed darkness/blur responses. The p32 test is a secondary composition of the fixed source-to-p55 reflected fit and the previously recorded p55-to-p32 same-orientation fit; it is explicitly **not independent validation** and has no derivative-specific refit.

## Results

### Fixed p55 alignment

| Source variant | Full correlation | Upper 60% | Lower 40% |
|---|---:|---:|---:|
| Original photograph | **0.614183** | **0.813225** | **0.459342** |
| Salt-and-pepper | 0.598418 | 0.794150 | 0.451374 |
| Median 3×3 | 0.585187 | 0.788018 | 0.437819 |
| Gaussian 3×3 | 0.575270 | 0.780815 | 0.429979 |

The original photograph is the best match for p55. Every listed derivative worsens all three reported regions. The unreflected original control is much lower (full correlation 0.172316), supporting the fixed horizontal-reflection orientation.

### Secondary p32 chained alignment

| Source variant | Full correlation | Upper 60% | Lower 40% |
|---|---:|---:|---:|
| Original photograph | 0.890328 | 0.868088 | 0.904443 |
| Salt-and-pepper | 0.892197 | 0.872945 | 0.901903 |
| Gaussian 3×3 | **0.899321** | **0.880009** | 0.905879 |
| Median 3×3 | 0.898437 | 0.879056 | **0.906304** |

The Gaussian and median derivatives improve the fixed p32 chain slightly, but the p32 result composes two earlier selected fits and must not be treated as an independent source identification. The differences are not enough to distinguish Gaussian from median filtering.

### Exact derivative reconstruction

Applying a standard 3×3 median filter to the exact salt-and-pepper image reproduces the Commons median derivative **pixel-for-pixel**: mean absolute channel error 0, exact-channel fraction 1.0.

A standard 3×3 Gaussian kernel reproduces the Commons Gaussian derivative to within one grayscale level: mean absolute channel error 0.482281, exact-channel fraction 0.517719, maximum absolute channel error 1. A 3×3 box-blur control is substantially worse (mean absolute error 5.086981, maximum error 46). This confirms the derivative operations themselves, rather than merely their labels.

## Interpretation and decision

1. The Commons source photograph is a real and reproducible visual lead for the LP2 tree artwork.
2. Under the fixed p55 transform, the **original** photo wins; the three Commons derivatives do not improve the p55 match.
3. Under the secondary p32 chain, Gaussian and median filtering help slightly, but the chain is not independent and does not identify a unique filter.
4. The historical derivative files are exactly recoverable by ordinary 3×3 median and Gaussian operations. This establishes an image-processing lineage, not that the puzzle author intended those files as a key.
5. **No rune plaintext, cryptographic key, cipher operation, or destination is recovered.** Do not promote this to `results/` or expand into arbitrary crops/filter families.

A frozen **difference-image test** is now implemented in `sims/dead_tree_commons_derivative_gate.py`: it compares the p55/p32 inter-page residual under the existing transforms with the original-to-filter source residuals on their common source crop, and includes reflected/unreflected orientation controls. **This extension has not yet been executed.** The successful run linked below predates the addition; its metrics cover only the fixed alignments and exact derivative reconstruction above. The source article explicitly names image combination by difference, so this is a bounded follow-up rather than another open-ended filter sweep. Run the existing `workflow_dispatch` workflow manually to evaluate it; if the residuals do not match, retire this image-processing branch.

## Reproduction

- Code: [`sims/dead_tree_commons_derivative_gate.py`](../sims/dead_tree_commons_derivative_gate.py).
- Workflow: [`.github/workflows/dead-tree-commons-derivative-gate.yml`](../.github/workflows/dead-tree-commons-derivative-gate.yml) (manual `workflow_dispatch` only, per repository policy).
- Successful run and machine-readable artifact for the **pre-residual** gate: [GitHub Actions run 42975222094](https://github.com/FlareZ123/liber-primus/actions/runs/42975222094).
- Environment recorded by the run: Python 3.12.16, NumPy 2.5.4, OpenCV 5.0.0.
