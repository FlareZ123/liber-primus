# Common-stock p32/p55/signed-2016 tree candidate reopened (27 November 2026)

Agent 6 fetched and base64-decoded the actual MonokumaBear/cicadaConvolutionKernels originalTreeImage.jpg at commit cead7046c37ed19c482302478605f61f55770db5 (blob 90015384624ee17c24c948c0968b17e03167122f). Length 280214 bytes; SHA-256 6fc875c099081908587fed6f1b3ac96bceece97f276e9fdd5cd52ec5ea791a34. The JS SHA-256 implementation passed standard empty and abc vectors. This exactly matches the ClipartBest stock digest in [Agent 2's positive signed-2016 registration](cicada2016-oak-stock-intrinsic-size-gate.md), and the asset previously visually dismissed in [the historical-source report](lp2-p32-tree-historical-source-gate.md).

Independent [session 394](https://cicadanotebook.com/sessions/394.html) reports common-candidate registration correlations p32 .962 (held bands .959/.963), signed 2016 .891 (held .885/.880), and p55 .652 (held .673/.596). [Session 371](https://cicadanotebook.com/sessions/371.html) reports p32 as top full-book match to signed tree (.930; next .630). [Session 408](https://cicadanotebook.com/sessions/408.html) reports a common approximately 5.56-pixel raster-grid feature. These external results are not independently reproduced here. The old 7-inlier SIFT failure remains valid for that detector, but does not demonstrate different lineages. The same notebook's later [session 415](https://cicadanotebook.com/sessions/415.html) and [session 418](https://cicadanotebook.com/sessions/418.html) link the solver-held silhouette to Marshman's 2005 Commons DeadTree photograph: opposite interior crown halves predicted at .987/.989, versus .162 for wrong orientation. The Commons photo and ClipartBest silhouette are therefore compatible candidate stages of the same lineage, rather than competing exclusive origins. Session 424 reports a 29-cell printed root versus 58–59 predicted, so the exact creator-used cutout and transforms remain unresolved. These are external comparisons.

The common-stock evidence strengthens p32 as a page selector: 121 original runes permit an inferred 11×11 layout whose GP-prime first row and column sum to 563 and 569 respectively, matching the signed canvas dimensions in order. No discrete operator, key or plaintext follows. All bounded negative cipher consumers stand. Require a source-derived operation independently fixed from image geometry before new ciphertext testing.

Reproduce the hash by downloading https://raw.githubusercontent.com/MonokumaBear/cicadaConvolutionKernels/cead7046c37ed19c482302478605f61f55770db5/originalTreeImage.jpg and SHA-256 hashing its raw bytes.

## New original-input native lattice test

The 26 November external result fixes the natural native enlargement period to 50/9 JPEG pixels. Using the previous original crops x650:1760, y2060:3130 (p32) and y1410:2480 (p55), compute the normalized 9/50-cycle Fourier coefficient of summed absolute adjacent-pixel differences. No rune values enter this operation. Absolute page-coordinate edge phases (x,y) are p32 (3.056170,3.830201), p55 (2.495823,4.837626); amplitudes p32 (.523299,.452950), p55 (.646809,.629519). Each phase agrees within .012 native pixels between its two orthogonal crop halves. The distinct phases demonstrate separate placement, despite shared nominal enlargement.

Sample the inferred lattice centers, take the common 192×199 crop, threshold p55 gray<240 and fill the largest component's holes. This is a candidate filled silhouette, not the historical raster. Fit only one side of the crown (rows15:125, columns15:100 or100:184), all integer translations within ±25 cells and Gaussian sigma=.5:12 step.25. Fit left: sigma7, source lookup dx=-12,dy=-11, train .938352, held right .662058, held root .652376. Fit right: sigma5, dx=-4,dy=-4, train .840719, held left .908775, held root .954130. Independent-side maximizers do not recover the same discrete shift. An affine-scale control trained left gives scales (.89317,.99301), held right .447728; trained right (1.03644,.98687), held left .898653. Thus these data do not identify one discrete shared-grid shift/key from a filled-outline blur. This does not rule out a common ancestor or an alternative drawing/processing model. No cipher score or plaintext produced. [Reproducer](../sims/lp2_tree_native_lattice_shift_sft.py): core executed locally on supplied originals; repository-path wrapper not separately executed.

## Shared edited root — independent crown calibration and held p32 prediction

**New result:** The two LP2 tree renderings are not merely visually similar to the stock artwork; a root replacement derived from original p55 alone predicts the held-out blurred p32 lower trunk/root much better than the unmodified stock shape. This supports a shared edited intermediate silhouette, whose exact creator-used raster is still unpreserved. No rune data enter this experiment.

### Fixed source reduction

Decode the pinned MonokumaBear 280,214-byte stock JPEG with jpeg-js v0.4.4 (decoder blob 1982481806e5fe29bd38cb008297f35731ade20b). RGB arithmetic mean <128 defines foreground. Partition original 1222×1600 into 160×210 half-open integer floor-boundary blocks; strict majority foreground gives a binary mask with 5,334 cells. Horizontal reflection is independently motivated by the signed 2016 match and visual geometry. Store exact [RLE mask](lp2-tree-common-stock-mask.b64) (row-XOR alternating-run unsigned-varint, decoded bytes SHA256 41d234747acf055667b789c6bdd8c72aaccf7e4414468d1c5e2ae2e6fd1d126d; 160×210 unreflected uint8 mask SHA256 a918dfdc5036d78dd9a2bf46552b1c91e7fadb20e0e41e61d9d01b4c10c5a993). [Node extraction](../sims/lp2_tree_common_stock_mask_sft.cjs). Actual JPEG decoder core executed in V8, binary fixture then decoded locally and checked.

### Independent fits on original native lattices

Sample original 49.jpg and 72.jpg with the previously measured 50/9-pixel phases and fixed crops, yielding native 193×200 and 192×199 arrays. Target darkness max(0,252-gray)/252. Let source lookup be (sx*x+tx, sy*y+ty). For p32, warp Gaussian-blurred stock. For p55, warp Gaussian-blurred stock and calculate a soft level-set line exp(-0.5*((value-threshold)/max(1e-4, gradient magnitude)/width)^2), using centered Sobel gradients. Only one side of the crown is fitted; the other and root are independently assessed. The table lists raw normalized correlations on the declared held rectangles.

| Original target | Training | sx,sy | tx,ty | sigma | Left r | Right r | Root r |
|---|---|---|---|---:|---:|---:|---:|
| p32 | left | .85202,.88311 | -11.254,36.728 | 4.26535 | .976014 | .945086 | .959954 |
| p32 | right | .87435,.86402 | -13.184,40.015 | 4.34961 | .963674 | .968242 | .963783 |
| p32 | crown | .86072,.86697 | -11.138,38.897 | 4.31446 | .974471 | .964953 | .951165 |
| p55 | left | .84549,.84596 | -6.390,45.343 | .68921 | .831981 | .822193 | .438848 |
| p55 | right | .84484,.84308 | -6.461,45.558 | .58098 | .822295 | .835768 | .465203 |
| p55 | crown | .84346,.84443 | -6.269,45.459 | .63326 | .830394 | .834071 | .451223 |

p55 threshold and line-width fitted left (.785118,1.412223), right (.810180,1.267289), crown (.802846,1.363416). Fit geometry independently stable across p55 crown halves; the stock root itself clearly fails to reproduce the p55 contour. p32 overall correlation alone would conceal the specific shared root change.

### Transfer the p55 root, never fit p32 root

Freeze both whole-crown fits. Select stock row162 as the start of its longest contiguous sequence of single-foreground-interval rows (the unbranched trunk, through row202; root forks follow). From the original p55 native darkness, fill holes of the largest connected gray<240 foreground component. The filled crown has many merged holes, so use only its lower trunk/root: inverse-warp into stock coordinates using frozen p55 crown registration, then replace only stock rows >=162. Three explicit stroke corrections: no erosion, one, two binary erosions. Predict p32 from each resulting source mask via **frozen p32 crown** geometry, sigma, gain .8229876 and bias -.05524673. Held target rectangle p32 y[142,190), x[15,185). No refit of the p32 target root, sigma, gain or bias.

| Predictor | Held p32 root correlation | Held MSE | Max absolute error |
|---|---:|---:|---:|
| Unmodified stock | .939324855 | .007810662 | .393492401 |
| p55-derived replacement, erosion0 | .995784421 | .004102012 | .193446279 |
| p55-derived replacement, erosion1 | .998324006 | .006133195 | .240012407 |
| p55-derived replacement, erosion2 | .996852808 | .009422042 | .302766531 |

All three stroke corrections improve held correlation, with erosion0 also improving held MSE by ~47.5%; erosion1 has highest correlation, selected only descriptively after testing; erosion2 worsens MSE. The underlying stock-vs-p55 silhouette difference includes a broad source root foot replaced by a shorter, narrower L-shaped lower trunk. The independently predicted p32 root supports a common **edited** drawing or closely related edits, beyond a stock photo match. This does not uniquely identify a historical Photoshop operation, original raster, exact dimensions, or a discrete cipher instruction. The reduced mask resolution and simple affine/photometric model are deliberate approximations. Do not claim that the measured source row162 or erosion setting is an authenticated key.

[Python original-image reproducer](../sims/lp2_tree_stock_root_transfer_sft.py): all core fits and root predictions executed locally on original supplied scans and pinned decoded mask. Repo path wrapper assembled afterward, not separately executed from a fresh checkout.

**Next decision:** focus source investigation on the specific shared lower-trunk/root modification, not arbitrary whole-image pixel statistics. A key derivation must independently bind that modification to a discrete GP operation. The p32→p33 all-permutation core additive transfer now has [an exact two-basis negative including a spacing-free score](lp2-p32-core-p33-rowcol-exact.md); do not retry that consumer.

## Full contour inverse and direct native-grid transfer (Agent6, 21:27 UTC)

The naive contour fill overfills the p55 crown; the earlier negative shift result is conditional on that representation. A four-direction scan-parity inverse also performs poorly (48 white components, 19 ambiguous, p32 held crown correlations .50–.52). Instead infer the p55 interior with a 4-neighbor graph cut, using the stock silhouette as a weak prior and the original p55 ink as a boundary cost. Pairwise weight is 0.1+8 exp(-3 max(ink_i,ink_j)/s), s=90th percentile ink above 12/252 (.23809524); unary mismatch weight p. Choose p solely by p55 correlation with the reconstructed boundary blurred at sigma 1.35 cells. p=.03,.1 yield empty masks; p=.3,1,2,3,5,10 yield areas 4518,5274,5541,5666,6023,6333 and correlations .407512,.605736,.652525,.681869,.675557,.674591. Freeze p=3 before comparison to p32. This is a model-based reconstruction, not the exact historical intermediate.

Inverse-warp this reconstruction to stock coordinates using the p55 fit. Keep previously fitted p32 left/right crown geometry and blur frozen, refit photometry on the training half only:

| Training half | Predictor | Opposite half r | Opposite MSE | Held root r | Root MSE |
|---|---|---:|---:|---:|---:|
| Left | stock | .945086 | .003091 | .952389 | .005368 |
| Left | p55 inverse | .951442 | .002230 | .996219 | .002603 |
| Right | stock | .963674 | .004018 | .954961 | .007452 |
| Right | p55 inverse | .975659 | .002369 | .997440 | .003319 |

Direct native-grid registration (no stock coordinate rewarp), exhaustive integer lookup offsets ±25 and sigma .5–12 step .25: left-trained dx=-4,dy=-5,sigma=5.25, train .986277, held right .976241, root .996413; right-trained dx=-4,dy=-4,sigma=5.25, train .979437, held left .984359, root .997101. Continuous isotropic left scale .989892,dx=-3.990,dy=-4.281,sigma=5.255; right scale 1.000742,dx=-4.063,dy=-3.951,sigma=5.144. Near-unit scale, almost identical shifts and blur across training halves constitute evidence for a common intermediate. dy differs by one grid cell, so no exact integer transform is established. The p55 inverse lower root has maximum width 29 cells (rows 181–182, x67–95), versus approximately 52 in warped stock; this is descriptive and model-dependent, not an authenticated 29-symbol key.

Reproducer: `sims/lp2_tree_contour_graphcut_transfer_sft.py`. Local equivalents executed on the supplied original JPEGs and committed stock mask; consolidated repository wrapper not separately executed. No plaintext, cipher key or instruction recovered.
