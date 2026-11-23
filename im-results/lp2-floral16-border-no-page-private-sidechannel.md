# LP2 p40–55 floral side borders: page-private exception side-channel gate

**Agent31, 23 November 2026. Classification:** exact original-image source comparison and scoped exclusion of a *page-varying RGB floral-border channel*. The still-undeciphered physical LP2 pages p0–55 yield no authentic unknown plaintext, key, full codec, or destination from this finding. Read the global synthesis in [results/README.md](../results/README.md) before treating it as a source instruction.

## Decipherment hypothesis and precise rival

The original LP2 29-rune ciphertext has **86 identical-adjacent events among 12,901 same-page successor positions**. [The lossless-capacity analysis](lp2-anti-repeat-lossless-capacity.md) shows that a *universal fixed-length* GP29 encoder producing no more than 86 repeats across the 55 original rune-bearing pages would require at least **326 bits** of recoverable extra information unless it changes the assumed input/output space. An authentic side information field might live in the illustrated manuscript, especially where floral decoration surrounds sixteen consecutive physical pages. The rival is a *static page template* with no evolving message; apparent differences could instead be central rune/text content.

The original images for physical pages **p40–p55** are exactly the distributed **57.jpg–72.jpg**. Every image has decoded RGB dimensions **2400×3600**. The fifteen rune-bearing images and the rune-free p50 all share the same floral family. If page-private bits were recorded in alterations of the outside botanical frame, the corresponding original pixels would vary between at least two pages.

## Exact decoded-image experiment

The [Python original-image SFT](../sims/lp2_floral16_border_sidechannel_sft.py) uses only Pillow, NumPy and the original repository JPEG files. For all sixteen pages, it verifies that these physical outside-margin crops are byte-for-byte identical in RGB:

- left: `x=0..549, y=650..2999`, 550×2350;
- right: `x=1850..2399, y=650..2999`, 550×2350.

Crop SHA-256 over each decoded RGB byte array, shared across **all sixteen** pages:

| Source area | Exact SHA-256 |
| --- | --- |
| Left floral border | `85aaf3d6c16ca1119b5fb4868e7ac7f26aa482d2a2400ae43a598ad435db2ed9` |
| Right floral border | `b86374a8d7756ea036653c871ac91e50fce18011ddeee66c75b683360281f3b9` |

A stronger original-array comparison uses p40/57.jpg as the baseline and takes the union of RGB-different pixels in every p41–55 source image. The union has exactly **2,631,883 changed pixels** out of **8,640,000** pixel coordinates. Its bounding box in source coordinates is **x=591..1831, y=624..3183**, inclusive. Thus **6,008,117 coordinates (69.53839%)** are exactly identical across all sixteen images; every page-varying decoded RGB pixel lies inside that central rectangular envelope. The deliberately fixed side borders are even larger than the two above crop strips.

The script asserts exact original dimensions, both crop identities for each physical page, the union count and its bounding box. Its source filenames and map back to physical LP2 are fully fixed before testing, and no threshold, salience criterion, ciphertext score or image registration was fitted.

## Consequence for the original cipher

The copied outside floral frame contains **zero page-specific decoded RGB information** across this sixteen-page family. In particular, it cannot be the source of a changing per-page mask, page key, or exceptional-repeat bits *encoded by visible pixel alterations in those specific borders*. A proposed decoder relying on such differences has no available page-private signal to extract.

This leaves the difficult part intact: a **constant** visual picture may suggest a common rule; page-varying symbols might be encoded by **central original text/ink or actual printed punctuation**, by other manuscript pages, by JPEG entropy-coding choices or **JPEG coefficients within the central changing area**, or by a genuinely external key. The formerly open JPEG-coefficient loophole in the fixed outside border is now closed by an [exact original-source DCT-level comparison](lp2-floral16-original-jpeg-dct-border-gate.md): all 81,676,800 luminance and 10,808,320 applicable chroma coefficient comparisons in the source-invariant exterior blocks match. JPEG coding-table choices are a separate, unsupported possible carrier. The 326-bit theorem concerns a universal constrained-output model, and does not prove a sidecar is needed for a source-restricted human-authored corpus. Repeated original-template pixels are not an authentic decoder or an all-channel impossibility proof.

## Decision

Retire *varying ornamental-border pixels* on p40–55 as a holder of the proposed repeat-exception channel. For [Director Issue #2273](https://github.com/FlareZ123/liber-primus/issues/2273), the next useful move is a **positive typed signal** from original central printed marks or a genuinely independent source-selected operation, with an explicit reversible GP29 inverse and withheld prose. Do not expend more compute on arbitrary floral-pixel passwords or search for page keys in exactly copied margins. This source gate supports the existing botanical-template evidence for other page groups, but its sixteen-page, all-pixel union is a separately reproduced condition.
