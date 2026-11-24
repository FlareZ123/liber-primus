# LP2 p32/p55 shared tree motif: fixed and arbitrary opacity-class keys

**Agent47, 24 November 2026. Bounded negative, no recovered unknown plaintext or authentic key.** The p32 blur and p55 pale outline appear to be transformations of one tree motif. The p32 runic length 121 permits an 11×11 receiver, but the original page does not print a grid or intensity quantizer. The investigation tests the converse of the prior p32 prime-kernel experiment (reported in the integrated challenge): use the image as a candidate operand for the text, rather than the text as an image filter. The earlier p32 perimeter and prime-kernel routes are not rerun. The latter report's referenced path currently returned 404; the existing synthesis records its negative conclusion.

## Source image relation and frozen extraction

Use the supplied original 2400×3600 JPEGs, physical p32 = archive 49.jpg and p55 = archive 72.jpg. Crop only the respective tree graphics: (x0,y0,x1,y1)=(600,2052,1752,3240) and (600,1440,1752,2520), chosen from the visible trees. Convert to grayscale ink opacity 255−L. Threshold p32 at >10 and p55 at >12 in the 0–255 intensity scale; p55 filled silhouette uses four binary-closing iterations and fill-holes. This simple fill also fills genuine negative-space pockets, so it is not an exact recovery of the original shape.

An illustrative model fits anisotropic scale/translation, a Gaussian blur, amplitude and offset using only the upper 150 rows of a 20%-scale p32 crop. The lower 88 rows are untouched by the numerical fit. Fit parameters and errors:

| Source p55 representation | Train RMSE | Lower holdout RMSE | Lower holdout Pearson r | Full r |
|---|---:|---:|---:|---:|
| Filled silhouette | 20.28693 | 24.57772 | 0.977599 | 0.890717 |
| Raw normalized outline | 26.29320 | 40.71495 | 0.756988 | 0.735787 |
| Binary edge mask | 25.05461 | 38.94455 | 0.782424 | 0.761360 |

The best filled fit has (sx,sy,tx,ty,sigma,amplitude,offset)=(0.955921,0.979795,7.585425,16.724563,6.457295,117.878676,-1.600470) at reduced scale. This supports the visual relationship and an approximate blur-of-fill interpretation. It does not establish pixel-identical generation, a unique historical filter, or an authenticated cipher instruction. The crop, threshold, fill and model family were chosen from the visible images, not via a blind historical clue. No residual payload is asserted.

## Original-input inverse

The p32 ciphertext is the exact canonical 121 GP29 indices, including the leading one-rune incoming carry. For each tree take the tight threshold bbox within its crop, area-resample to 11×11 in natural row-major order, normalize raw opacity by its peak (or use binary fill), and quantize q=min(28,floor(29×mean opacity)). This fixes three actual 121-symbol class tapes, with respectively 20/15/25 observed classes and 53/51/47 zero cells.

Test C=P+sK mod29, s=±1, with every rune consuming, and separately the authentic historical plaintext-F hold clock (P=0 emits C=0 and does not consume K). No fitted offsets, raster rotations or repeated key schedules. Every direct inverse reencrypts exactly; every legal F-hold path is enumerated and replayed. Zero-based failure is the first physical p32 rune with no legal path.

| Image class tape | Sign | Direct IoC | F-hold result |
|---|---:|---:|---|
| p32 raw | + | .03140496 | fail at 5 |
| p32 raw | − | .03402204 | fail at 7 |
| p55 raw | + | .03126722 | fail at 87 |
| p55 raw | − | .03278237 | 2 paths, both .03168044 |
| p55 filled | + | .04077135 | 4 paths, .03622590–.04077135 |
| p55 filled | − | .03457300 | fail at 72 |

The original p32 IoC is .03415978; native clear p57 .06270997. All six fixed direct readouts and six complete F-hold paths are nonprose. A p57 native plant for each key/sign retains its exact true path under exhaustive inverse (6/6); all six direct native plants recover 95/95 symbols. Some F-hold controls have multiple legal paths: this is feasibility, not blind key identification. The local preliminary phase-only DP collapsed alternative paths, so its representative counts (one and three) are superseded by the full path counts (two and four).

## All additive lookup functions of the same opacity classes

Allow K_i=f(q_i), for every arbitrary mapping f from observed image class to GP29 shift, rather than fixing the quantization's numeric output as the shift. Use a physical consuming clock, both signs absorbed into f. The original p32 page transcription agrees exactly with the canonical 121 indices; keep the incoming one-rune carry in the key clock but grant its plaintext arbitrary. The remaining 21 complete printed groups cover 120 runes. For each length-matched native dictionary word, every position with the same class must require the same shift. Thus a word's possible f assignments are enumerated exactly without ever enumerating 29^20/29^15/29^25 complete keys.

The pinned 29,060 GP-normalized TextBlob spellings are augmented with four independently clear p57 word forms absent from that lexicon (29,064 total). The original counts below use the same augmented vocabulary as the controls. Group indices are 0-based within the page including the incoming carry at index0.

| Classes | Individually impossible complete groups | Minimum out-of-vocabulary groups | Complete keys under intact finite lexicon |
|---|---|---:|---:|
| p32 raw (20) | 3,7,11,13,14,15,19,21 | 8/21 | 0 |
| p55 raw (15) | 3,11,13,15,19,21 | 6/21 | 0 |
| p55 filled (25) | 3,7,9,13,15,19,21 | 7/21 | 0 |

The first 11-rune anchor, group3, has zero candidates in every image representation even with a completely private class map for that group. All three full CSPs terminate after two nodes without caps. This is an exact finite-vocabulary necessary condition for every additive class lookup and does not require a guessed key or linguistic scoring.

Independent native p57 control plants use the actual 95 clear rune positions and same class-tape prefixes, with f(q)=17q+7 mod29 hidden from the solver. Every native word's true assignment survives; the bounded first-three-witness search finds three legal keys for each representation, including the exact observed-class planted key in the p55 raw case. The other two have not demonstrated unique blind recovery. These are not independent held-out-key predictions; they show that the candidate construction retains native compatible paths. Printed group alignment, direct additive consumption, these exact image classes and this finite vocabulary remain assumptions. Unknown arbitrary remapping with latent F holds, alternate representations, hidden reflow and unrelated image operations are outside the all-key statement.

## Decision and reproduction

Retire these three fixed opacity class tapes as direct additive keys for p32, and the shared arbitrary per-class shift model under the declared intact finite vocabulary. No new plaintext, key or first-party deciphering instruction. Do not expand to arbitrary thresholds, raster permutations or extra key schedules without a new independent clue. The same-tree visual correspondence is insufficient to authenticate an 11×11 receiver.

- [Image extraction, fit, direct/full-F-hold inverse SFT](../sims/lp2_tree_opacity_sft.py), run against the supplied original archive and canonical p32/p57 slices fetched from the repository. It accepts the full canonical corpus directly in a repo checkout.
- [All-class-map exact lexical SFT](../sims/lp2_tree_opacity_lookup_sft.cjs), reads the JSON output of the Python SFT; algorithm executed in connected V8 against the fetched canonical source/transcript/lexicon and the three generated class tapes. No Windows CI run claimed.

Commands in the repository: `python sims/lp2_tree_opacity_sft.py resources/liber-primus > tree-opacity-output.json`, then `node sims/lp2_tree_opacity_lookup_sft.cjs tree-opacity-output.json`. Python dependencies Pillow, NumPy, SciPy, opencv-python. The first script emits all exact candidate runes and class tapes, the second all per-group candidate counts and solver controls.
