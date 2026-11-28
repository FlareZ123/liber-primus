# Common-stock p32/p55/signed-2016 tree candidate reopened (27 November 2026)

Agent 6 fetched and base64-decoded the actual MonokumaBear/cicadaConvolutionKernels originalTreeImage.jpg at commit cead7046c37ed19c482302478605f61f55770db5 (blob 90015384624ee17c24c948c0968b17e03167122f). Length 280214 bytes; SHA-256 6fc875c099081908587fed6f1b3ac96bceece97f276e9fdd5cd52ec5ea791a34. The JS SHA-256 implementation passed standard empty and abc vectors. This exactly matches the ClipartBest stock digest in [Agent 2's positive signed-2016 registration](cicada2016-oak-stock-intrinsic-size-gate.md), and the asset previously visually dismissed in [the historical-source report](lp2-p32-tree-historical-source-gate.md).


## Distinct 2010 image-title candidate: exact archived file fails tree identity (Agent45, 28 November 2026)

A potentially relevant *dated title* was independently located: the May 2010 O'Reilly book *Photoshop CS5: The Missing Manual* distributes a file named \`DeadTree.jpg\`; its publicly available O'Reilly GitLab example repository has \`deadtree.jpg\` (Git blob \`f82ce3f940d8292ff07e7fe604e8822bbecbc811\`). Its exact **currently archived** JPEG is 721,592 bytes, 800×1200 pixels, SHA-256 \`d9d3d57803b1a80ed847285c4224768f758984d8e95cd5cba6b2d112b2a7217a\`. The book dates the *example name*, **not independently the present exact bytes**, because the public GitLab import is later. This image is different from both the Commons photograph and the 280,214-byte ClipartBest/Monokuma stock.

The source-only, unchanged-feature preflight tests direct, horizontal reflection, vertical reflection and 180° rotation. Exact known references are separately SHA-256 validated. With SIFT (4,000 features, ratio=.72, homography RANSAC 5 pixels), the O'Reilly example yields only **4–6 inliers per orientation** against the Commons 2005 photograph (10–17 ratio matches) and **4–6** against ClipartBest (8–17 ratio matches); no robust image identity is established. Normalized full-frame 128×128 correlations are at most **.3625** for Commons and **.1227** for stock over those orientations, not compatible with a simple scaled/reflected same-frame rendering. These correlations are only coarse triage, and SIFT failure does not exclude arbitrary repainting; this candidate provides **no recoverable held root or twig**, no caption selecting an LP2 operation, and no plaintext/key. The issue's independent-root-and-twig gate is **not met**. Stop this branch rather than attempting unconstrained image registration.

[Source acquisition and comparison script](../sims/lp2_oreilly_deadtree_2010_source_gate.cjs) · [fixed geometric comparison](../sims/lp2_oreilly_tree_identity_preflight.py) · [actual completed read-only CI and numeric logs](https://github.com/FlareZ123/liber-primus/actions/runs/46092795650). Upstream archive: [publisher's example tree](https://resources.oreilly.com/examples/0636920001140); [May 2010 book supplement](https://www.oreilly.com/library/view/photoshop-cs5-the/9781449381691/examples_page.html).


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

## Independent signed 2016 root prediction (Agent6, 21:32 UTC)

The p55-derived graph-cut raster is frozen, inverse-warped into stock coordinates and compared as (a) original reflected stock, (b) stock crown with only rows >=162 replaced by p55 reconstruction, (c) full p55 reconstruction. The exact signed 2016 JPEG (SHA256 a8340ad04b83fb3130e7ed9172867a440812e87089d6aa2b932d97c6ae38aebe) is decoded via pinned jpeg-js v0.4.4. Average 2x2 grayscale blocks; omit blocks whose surrounding 6x6 neighborhood contains intensity >40 to suppress signature/message ink. Independent training halves y290–419, x188–283 and x284–383; held root y430–484, x188–383. Valid block counts left 3120, right 3250, root 2269. Fit stock-only geometry and blur on each half, freeze them, then fit gain and bias for each candidate on the same training half. No root pixels inform selection or photometry. Results:

| Train | Predictor | Opposite crown r | Opposite MSE | Root r | Root MSE |
|---|---|---:|---:|---:|---:|
| Left | Stock | .822693 | .945282 | .797486 | 1.823332 |
| Left | LP2 root only | .822692 | .945461 | .855492 | 1.552429 |
| Left | Full LP2 reconstruction | .858617 | .679468 | .855623 | 1.311083 |
| Right | Stock | .930982 | .984610 | .765038 | 2.029548 |
| Right | LP2 root only | .930987 | .984591 | .849258 | 1.750084 |
| Right | Full LP2 reconstruction | .936104 | .775785 | .849266 | 1.405796 |

Geometry in signed pixel coordinates [cx,cy,sx,sy] left [201.25,256.25,1.05,1.05], sigma4 stock cells; right [200.25,255.25,1.05,1.05], sigma2.5. Root-only edit improves both independent held root predictions while leaving opposite crown essentially unchanged; full reconstruction additionally improves opposite crown prediction and reduces root MSE 28.1%/30.7%. Thus the signed image likely shares the distinctive edited LP2 intermediate, beyond common stock ancestry. This is positive cross-year evidence; it does not establish author intent, exact shared raster, or a cipher operation. Root text suppression is imperfect (JPEG ringing and blocked pixels remain); similarity metrics are not independent pixel significance tests. Source: `sims/lp2_tree_signed2016_held_root_sft.cjs` plus p55-only mask fixture `im-results/lp2-p55-contour-inverse-mask.b64`. Core executed against connector-fetched exact JPEG bytes in V8; standalone filesystem wrapper not separately executed.

## Image-selected p32 trunk route into p33 (Agent6, 21:34 UTC)

Use the already established cumulative GP-prime axes of p32 (first row/column; 563x569 exact signed-image dimensions). Overlay the frozen p55 reconstruction in the signed 2016 geometry from each independent crown fit. No rune-based alignment. Nonzero reconstructed foreground cell counts, zero-based (row,col):

| Tile | Rune | Left-fit count | Right-fit count |
|---|---|---:|---:|
| (7,4) | NG | 2421 | 2478 |
| (7,5) | IA | 53 | 69 |
| (7,6) | EA | 812 | 796 |
| (7,7) | J | 13 | 10 |
| (8,4) | M | 1587 | 1574 |
| (8,5) | B | 68 | 63 |
| (8,6) | U | 315 | 299 |
| (8,7) | D | 14 | 11 |
| (9,4) | N | 383 | 366 |

All nonempty graph-cut priors p=.3,1,2,3,5,10 independently preserve the column4 trunk cells (7,4),(8,4),(9,4); far-right crown fringe membership is unstable. The bottommost p55 foreground (native rows >=170) maps solely to (9,4) in both crown registrations (366 cells each). This yields a geometry-fixed root-up occupied-column read N→M→NG, original offsets 103→92→81, primes 29→71→79. The exact original signed pixels independently show excess grayscale above baseline1 in these three cells of 821.75, 2759, 3695.5 (masked 2x2 samples, as above); this is not solely a prior projection. Root N is immediately east of E at offset102, previously selected independently as GP0(DEVOTED)=102 and phi(GP(BUDS))=102. The literal HOME X marker at (3,4) selects the same column. The geometry gives east from E to N at the root, then north through M and NG. **Source correction (Agent4): p33's actual enlarged initials are D/NG, not M/NG; the proposed two-marker connection and its upper-body route fail.** The original-pixel native glyph comparison and corrected arithmetic are documented in [the p33 initial correction](lp2-p33-initial-native-source-correction.md). This is a new source-constrained connection, discovered after inspecting the overlay; no discovery-wide probability or authored semantics claimed. The independent crown-fit geometry has no p33 labels or rune scoring in its objective.

Direct consumer test: the right-hand adjacent stable two cells (B,U)/(IA,EA), selected three-cell suffix (B,U,D)/(IA,EA,J), entire six-cell right suffix, marker plus three cells, or full corresponding p32 row as repeating section-local pad; both ordinal and GP-prime-mod29 bases, both signs, all-consuming or literal-F-held clock. 40 models per p33 body. Native-independent trigram objective from exact core attack. Best first-body score -5.802987 nats/trigram, second -5.833894, both unreadable (raw -6.554646/-6.214566). No genuine plaintext. Fringe-based keys remain especially weak since J/D occupancy is threshold-dependent. Retire these simple local additive consumers. The trunk geometry itself survives, but no longer supplies the claimed two-marker receiver order. A separate full81 road-priority permutation/pad test is negative; see [p33 initial correction and road inverse](lp2-p33-initial-native-source-correction.md). Do not use M/NG as the p33 source states.

## Discrete right-terminal branch gate (Director #3257)

The shared edited lower silhouette is visible across the three placements. A finer claim about branch topology needs sensors that can recover a known branch after the rendering process. A downward component merge tree in reflected stock coordinates isolates the rightmost stock twig. Start below the documented trunk anchor at row 162, keep the eight-connected foreground attached to the trunk, and add rows from the bottom upward. A connected component born at a lower row dies when it joins an older component. Tie-break same-row births by the leftmost tip. The stock rightmost twig is born at row 205, x=75, survives two rows and contains 20 cells just before merging. Deleting x≥74 in rows≥203 removes that branch. The initial strict three-row condition misses the twig in the exact stock mask. The two-row sensitivity was set using stock and the plant before measuring the originals. Both rules use tip x≥74, y≥200 and area≥6.

Both original comparison fits use the previously fixed crown halves, with the root held out. The signal is evaluated across two independent calibrations, three offsets per axis (−0.5, 0, +0.5), and five filled-mask thresholds (.30–.70). p55 additionally uses stock-independent contour closure and fill at four ink cutoffs (12, 20, 30, 40 gray units), with and without one-cell closing. The separate graph-cut result is prior-dependent. The signed image uses the existing signed-ink exclusion rule with two extreme assignments for excluded pixels.

| Rendering | Known stock right twig | Known deletion | Original |
|---|---:|---:|---:|
| p55 contour | 585/720 | 0/720 | 0/720, trunk recovered 644/720 |
| p55 graph-cut reconstruction | — | — | 0/90 |
| p32 blur | 0/90 | 0/90 | 0/90 |
| Signed 2016 masked blur | 0/180 | 0/180 | 1/180 |

The synthetic contour recovers the known twig in every one of the 16 fit × ink cutoff × closing groups for some registration shift and level. Its absence in the direct p55 contour is meaningful against this stock model. Neither blurred placement distinguishes the two controls on the frozen observable. The lone signed-image branch is a threshold-sensitive observation outside the calibrated two-row support: the signed stock and deletion controls both return zero positives. The sweeps share inputs and their counts are sensitivity summaries. Two pairs of pixel-identical original adornments independently illustrate the nuisance: adding only blur and sampling changes the component/hole signature in 33/36 floral-strip and 35/36 cuneiform-heading trials relative to their baseline. These checks use authentic common raster inputs and do not establish the historical tree rendering process.

The artwork evidence supports a shared altered root outline and the p55 contour disfavors the stock rightmost twig as rendered here. The independent placements do not resolve a shared discrete branch deletion. No typed rune operation, key or plaintext follows. A sharper independent original would permit another topology test.

[Reproducer](../sims/lp2_tree_root_topology_sft.py) · [Full output](lp2-tree-root-topology-output.json). The default repository layout replay used the attached original scans and the existing pinned masks and signed JPEG. NumPy, SciPy and Pillow suffice.

## Root edit as a discrete selection-and-trim operation (Agent40, 28 November 2026)

**Decision:** the common modified root is consistent with a shortened, compressed or redrawn silhouette, but neither simple rectangular erasure nor a uniform selected-root affine transform identifies the creator's discrete operation. A robust approximate cut occurs at stock row 202–203 (zero-based, exclusive); this is a coordinate in a derived 160×210 mask, not a source-authenticated rune index. Do not promote it to a key or to the p57 circumference operation.

Prior overlap: the public [Cicada Notebook index](https://cicadanotebook.com/) dated 26 November already describes [session 426](https://cicadanotebook.com/sessions/426.html), learning a horizontal bottom cut from p32 or the notice, with mild cross-image improvement but failure to reproduce the p55 base. The individual session could not be retrieved here. The comparison below extends that indexed result by selecting the full rectangle and affine-plus-cut family from p55, comparing direct contour and reconstructed-mask optima, and predicting held p32. It does not claim novelty for bottom truncation or for every affine variant.

Motivation: the p55-only inverse has a flat lower termination, while the unmodified source has several forks below it. Test the plausible image-editor operation of selecting the unbranched root (stock row 162 onward, from the earlier independent stock segmentation) and clipping it to an axis-aligned rectangle, with no new alignment or cipher fitting. Inputs: exact pinned stock and p55 graph-cut fixtures, original 49.jpg and 72.jpg, previously frozen left/right/full crown registrations (left/right rounded as printed above). For each independent registration map the p55 mask into stock coordinates, threshold at .5, and minimize root Hamming error by maximizing the sum of stock*(2*target−1) over every half-open rectangle [162,bottom)×[left,right). Prefix sums give exhaustive solutions without heuristic search. Two planted crops (50,75,203), (42,76,205) recover the exact unique rectangle and raster.

| p55 registration | Best bottom-only cutoff | Best rectangular crop (L,R,B) | Target root pixels | Stock error | Bottom-only error | Rectangular error |
| --- | ---: | --- | ---: | ---: | ---: | ---: |
| Left | 203 | 59,74,203 | 601 | 289 | 176 | 109 |
| Right | 202 | 59,75,203 | 580 | 308 | 159 | 100 |
| Crown | 203 | 59,75,203 | 596 | 294 | 169 | 104 |

The right and whole-crown fits have respectively 3 and 2 equal optimum rectangle masks. All surviving errors are real mask disagreements; a deletion-only model also cannot add any foreground beyond stock. The p55 root contour MSE using the original crown photometry improves from .001756–.001915 to .000972–.000999 under the rectangle. On original p32, whose root does not enter the fit, the frozen left/right crown geometries give r=.97765–.97893, versus unmodified stock .95238–.95496 and mapped full-root replacement .99589–.99757. Rectangle MSE is worse than stock (.007426–.011691 vs .005369/.007452); correlation improvement alone is not a recovered operation.

One motivated extension applies an affine transform to the selected root only, around the stock's row-162 foreground centroid: horizontal scale .50–1.25 in .025 steps, vertical scale .75–1.25 in .025 steps, x translation −4..4 in .5 steps, and exact optimal bottom cutoff. The nearest-neighbor inverse fit to all three reconstructed masks independently selects x scale .825, y scale 1.025, dx=+1, bottom 203/202/203, with 79/72/76 disagreements. On p32 this gives r=.99166–.99484 but MSE .005592–.010537, again worse than the corresponding stock predictions. To check dependence on the graph-cut reconstruction, fit the same four parameters directly to the original p55 lower contour, fixing crown geometry, blur, contour threshold and photometry. Bilinear source warp, seed3301 differential evolution (2,112 evaluations per registration) selects scales .951–.955 and 1.153–1.174, dx=.90–1.10 and cutoff 203, with MSE .000832–.000838. These independent target representations disagree on scale despite similar cutoff. Raw-fit held p32 r=.98570–.98878, MSE .005467–.009581; still worse absolute MSE than stock.

The direct raw fit is heuristic, not a universal exclusion of affine editing. The stable cutoff and approximately shared contraction narrow the artwork question, but the target-dependent scale, residual shape differences and held absolute intensity error block an exact discrete operation. A source-selected root-cut clue would require an authentic intermediate raster or independently evidenced cropping convention. No original ciphertext or rune values entered any fit; no plaintext, key or destination recovered. Reproducer: [sims/lp2_tree_root_clip_transform_sft.py](../sims/lp2_tree_root_clip_transform_sft.py), executed locally in repository-shaped fixture directory on actual original scans (NumPy, OpenCV 4.13.0, SciPy 1.17.0, Pillow).
