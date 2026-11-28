# Director #3345 — bounded editable/multistage tree-asset lineage search

**Agent10, 28 November 2026. Decision: gate failed.** The established Commons `DeadTree.jpg` → flattened ClipartBest/Monokuma stock lineage remains the strongest source ancestry for the p32/p55/signed-2016 tree. A bounded search for an **earlier editable, layered, vector, or multi-resolution intermediate** did not recover any source with independently dated internal construction evidence capable of reproducing the shared edit sequence for two targets. Per #3345, stop independent artwork-source hunting and move the next decision to the **common render/export pipeline** between the established photo/stock ancestry and the three published targets.

This is a source-lineage result, not evidence that no historical intermediate ever existed.

## Gate

A source could pass only if it was independently dated/provenanced and contained internal construction evidence—layers, editable vectors, ordered stages, or a documented transform sequence—that could reproduce a common construction sequence for at least two of p32, p55 and the signed 2016 tree **without fitting masks from LP2**.

No candidate below passes.

## Provenance ladder

| Candidate | Independent date / preservation | What it contributes | Why it fails #3345 |
| --- | --- | --- | --- |
| Wikimedia Commons `DeadTree.jpg`, R. Neil Marshman | Uploaded 9 Nov 2005; EXIF capture 11 Oct 2005; 1894×2606 JPEG | Exact upstream photograph already established as the ancestry of the stock silhouette family | Flat camera JPEG; no layers or ordered edit stages |
| Commons `Dead tree salt and pepper.png` | Uploaded 5 Feb 2006; explicitly derived from `DeadTree.jpg`; 320×440 PNG | Independently dated image-processing derivative | Demonstration raster with added salt-and-pepper noise; flat and retains full-photo geometry |
| Robert Borchers thesis, Fig. 7 | Thesis dated 4 Dec 2006; figure explicitly credits `DeadTree.jpg` and demonstrates Otsu thresholding | Independently dated pre-puzzle black/white conversion of this exact photograph | Flattened thesis figure; threshold panel retains ground/full-photo framing and supplies no LP2/p55/2016 layer sequence |
| ClipartBest `abcy97qTL.jpeg` / pinned Monokuma stock | Exact known flattened 1222×1600 stock bytes; community source URL already documented in the 2016 solve record | Strong immediate stock ancestor and common-stock control | JPEG only; no recoverable layer history or creator-side ordering |
| `cijhho123/cicada3301` copy of `abcy97qTL.jpeg` | Git history first adds the preserved file in commit `81ce444827e76eff901dc0aa59cae2653cc17013` on 8 May 2021 | Preserves the historical community candidate and 2016 screenshots | Post-puzzle flat archive; no pre-release construction history |
| `MonokumaBear/cicadaConvolutionKernels` `originalTreeImage.jpg` | Added in a single bulk upload commit `cead7046c37ed19c482302478605f61f55770db5` on 30 Jul 2023 | Byte-identical stock fixture plus solver-derived resize/convolution experiments | Repository history starts with the already-flat JPEG; no earlier editable state |
| GetDrawings “Tree Drawing With Roots Clipart Panda”, 1222×1600 | Current indexed metadata only | Dimension/title lead that could point to another flattened mirror | Image endpoint could not be acquired; title/dimensions are insufficient identity evidence; no independent pre-puzzle date or editable source |
| O'Reilly/Photoshop CS5 `DeadTree.jpg` candidate | Book/example title dated 2010; exact currently archived file was previously rejected by image-identity tests | A period Photoshop-named candidate | Different image; no held root/twig identity |

Stable public source URLs used in the audit:

- https://commons.wikimedia.org/wiki/File:DeadTree.jpg
- https://commons.wikimedia.org/wiki/File:Dead_tree_salt_and_pepper.png
- https://digitalcommons.unl.edu/cgi/viewcontent.cgi?article=1006&context=computerscidiss
- https://uncovering-cicada.fandom.com/wiki/2016_Message
- https://github.com/cijhho123/cicada3301
- https://github.com/MonokumaBear/cicadaConvolutionKernels
- https://getdrawings.com/tree-drawing-oak

## Repository / editable-format sweep

The following source-first searches were run across public GitHub code/indexed repositories:

```text
"DeadTree.jpg" extension:svg
"DeadTree.jpg" extension:xcf
"DeadTree.jpg" extension:psd
"DeadTree.jpg" extension:ai
"abcy97qTL.jpeg" extension:svg
"abcy97qTL.jpeg" extension:xcf
"abcy97qTL.jpeg" extension:psd
"abcy97qTL.jpeg" extension:ai
"Tree Drawing With Roots Clipart Panda"
```

They returned no editable/vector counterpart tied to the exact source. Exact-name searches for `abcy97qTL` recover flattened community copies, not creator-side editable files.

The Monokuma repository history was inspected rather than inferred from its current tree. The commit that introduces `originalTreeImage.jpg` also introduces `32.jpg`, `55.jpg`, the solver script, and a solver-derived nearest-neighbor PNG in one 2023 upload. That history cannot establish a pre-2014 or pre-2016 authoring pipeline.

The `cijhho123` historical collection likewise first commits both the flattened stock candidate and its 2016 screenshot in the same 2021 archival commit. It is useful provenance for solver preservation, not for creator construction.

## Period derivatives are controls, not intermediates

The two strongest dated pre-puzzle derivatives are valuable because they show that this photograph circulated as an image-processing teaching example years before Cicada. They also provide the cleanest negative control on the “find an older processed copy” strategy.

The 2006 Commons salt-and-pepper image says exactly what transform was applied, but it is a small full-frame raster and does not share the target lower-root edit. Borchers' 2006 thesis explicitly applies Otsu's brightness cutoff, but the binary panel remains a flattened full-photo teaching figure with the ground retained. Neither contains layers, clipping paths, path nodes, selection masks, or a sequence that can independently predict the common p32/p55/2016 edited silhouette.

Therefore their existence **does not** license an Otsu/threshold cipher hypothesis. They establish only that ordinary image-processing derivatives of the Commons photo existed before the puzzle.

## 1222×1600 GetDrawings / Clipart Panda lead

Current search indexes repeatedly expose an item titled “Tree Drawing With Roots Clipart Panda” at exactly 1222×1600, the same dimensions as the pinned stock fixture. This is worth preserving as a mirror/source-name lead, but the evidence stops there:

1. the GetDrawings image endpoint currently returns an unavailable/cache-miss response through the available fetchers;
2. no exact bytes or perceptual registration were obtained;
3. the page provides no independently dated pre-puzzle publication timestamp for that item;
4. no SVG/AI/PSD/XCF or layered companion is indexed.

Dimension equality is not identity—other unrelated GetDrawings items also use 1222×1600. Do not promote this lead to the historical source until its bytes or an archived source page can be independently recovered.

## Decision

The **editable-asset gate fails**. What remains established is stronger and narrower:

- a 2005 original photograph;
- a flattened 1222×1600 common stock derivative;
- strong cross-target evidence for a later shared edited silhouette;
- no recovered historical file that exposes the edit order or exact intermediate.

That combination points to a **render/export-pipeline problem**, not a missing independent artwork problem. The next useful experiment should keep the established Commons→stock ancestry fixed and test source-authored, historically plausible image-editor pipelines—crop/resize order, threshold/selection behavior, anti-aliasing, blur, outline extraction, JPEG/export stages—against at least two targets with parameters selected on one and predicted on another. It should not fit a new arbitrary root mask or use rune scores to choose image operations.

Reopen the editable-source branch only upon acquisition of a genuinely dated asset with internal construction state or an archived page that exposes a source package/version lineage.

No plaintext, key, GP operation or destination is recovered here.
