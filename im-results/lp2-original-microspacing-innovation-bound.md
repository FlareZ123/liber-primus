# Original LP2 rune microspacing: a one-pixel bit-channel bound

**Agent35, 15 November 2026.** A genuinely new measured physical-channel test below the previously audited whole-space width. **Original-image result; bounded negative for a dense independent one-pixel gap channel. No runic plaintext, cipher key, or Cicada destination recovered.**

## Original evidence and competing explanation

The signed 2016 Cicada wording makes printed words salient. A physically plausible steganographic sidecar could encode one independent binary bit by shifting each rune-to-rune advance by one printer pixel, well below the approximately 16-pixel punctuation advance already measured in [the full-space original-JPEG typography report](lp2-original-rune-typography-space-channel.md). A competing mundane explanation is standard **integer rasterization of the same vector font:** a glyph's rounded left ink coordinate enters two adjacent measured advances with opposite signs, naturally creating negative lag-one covariance.

Original JPEGs are `resources/liber-primus/18.jpg` and the 24 other clean twelve-line pages selected in the earlier frozen audit, **25 physical pages** total. Their original 2400×3600 pixels yield **6,352** high-confidence rune-pair advances and **6,034** usable adjacent pairs. The independently calibrated 29-GP-glyph classifier is fitted only on original physical pp32 and55, and the prior SFT verifies complete rune readback on 12 full original pages. This experiment retains its frozen 0.88 confidence threshold, glyph geometry, original reading order, and native printed punctuation detection.

## New test: remove the shared raster rounding variable

A least-squares source-font model predicts each original advance as one outgoing glyph bearing, one incoming glyph bearing and an independently estimated advance for each class of visible 1-, 2-, or 3-dot punctuation. The printed punctuation classes are separate to avoid mistaking three actual large punctuation ink marks for hidden spacing. With a single additive gauge fixed, write the residual as:

\[
r_i = (x_{i+1}-x_i) - \hat U(g_i)-\hat V(g_{i+1})-\hat S(d_i).
\]

Under the declared model `r_i = e_(i+1) - e_i + m_i`, the `e_i` are independent glyph-left rounding errors and `m_i` are independent latent microgap marks. Thus:

\[
\operatorname{Var}(m)=\operatorname{Var}(r_i)+2\operatorname{Cov}(r_i,r_{i+1}).
\]

This **innovation variance** cancels the one shared glyph's rounding error in expectation; ordinary raw residual variance alone would mistakenly interpret raster noise as a hidden channel.

| Original JPEG source / control | Residual variance (pixel²) | Adjacent residual covariance (pixel²) | Innovation variance (pixel²) |
| --- | ---: | ---: | ---: |
| All **6,352** measured original advances | **0.23846760** | **−0.09151291** | **0.05544178** |
| Original gaps with **no visible punctuation**, **3,351** paired gaps | **0.23108875** | **−0.08946406** | **0.05216063** |
| **Positive plant**: independent fair 0/1 pixel bit on **each** original measured gap, then refit same model | **0.48077191** | **−0.09289065** | **0.29499061** |

The same 2000-seed-fixed **printed-line cluster bootstrap** gives conditional 95% intervals for the innovation variance **0.046658–0.063813 pixel²** on unchanged originals and **0.273586–0.315242 pixel²** on the positive plant. The paired plant increase is **0.219908–0.258006 pixel²**, including the independently expected **0.25 pixel²** for a centered fair 0/1-pixel bit. Original punctuation advances are 16.03599 px (single), 29.81351 px (double) and 46.66129 px (triple). The last two measurements are based on respectively one and 77 accepted original gaps; they are nuisance regressors, not cryptographic markers.

## Decision, power and limits

An **independent, balanced, dense one-full-pixel binary shift at each normal source glyph gap** would contribute about **0.25 pixel²** of residual innovation beyond the raster rounding contribution. The unchanged originals' **0.05544 pixel²** estimate and even its conditional bootstrap upper bound of 0.06381 pixel² fall well below that. The same algorithm detects a fully randomized original-input one-pixel bit watermark after its font parameters are re-fitted. This changes the next search decision: do **not** treat per-gap full-pixel independent bit marks as a plausible missing LP2 pad before an authentic creator-visible microspacing rule appears.

This is **conditional evidence, not a steganographic impossibility theorem**. It assumes the simple source advance model, independent glyph-coordinate rounding, and independent balanced marks; correlated typography edits, sparse/deliberately coded marks, antialiased subpixel changes, contexts not represented by the 25 sampled pages, JPEG DCT changes, and directly printed punctuation remain outside scope. The fitted innovation is an aggregate statistic, **not** a recovered bitstream or a decoded secret. The source does not specify that word gaps are a key carrier. In particular, earlier information-capacity work allows sparse positions or original word boundaries to carry many bits; this calculation neither closes those channels nor selects any reversible GP29 operation.

## Reproduce

[Original-JPEG standalone reproducer](../sims/lp2_microspacing_innovation_sft.py) wraps the source-tested glyph extraction, fits all 62 measured bearings/visible-mark variables, measures the original lag-one covariance, plants independent per-gap bit shifts with fixed seed 3301, and bootstraps 2,000 original printed-line clusters. It reads only the checked-in JPEG and corpus files, asserts exact source counts and all three innovation estimates, and writes no files. [Windows 11-compatible GitHub Actions Python 3.12 source run 43681493354](https://github.com/FlareZ123/liber-primus/actions/runs/43681493354) passed on the original repository files with the native images and original glyph-control assertions, demonstrating the same exact estimates as the independent local original-ZIP measurement.


**24 November complement:** [p55 absolute-trajectory sparse-pattern bound](lp2-p55-microgap-capacity.md) estimates an independently calibrated raster envelope in two position measures and enumerates all compatible positive gap patterns on p55. At most 10 full-pixel or 21 half-pixel marks; 617,334,144 and 1,850,564,783,117,568 respective patterns. No recovered bits/key, no change to the stronger population-wide innovation conclusion.


## Independent LP1-to-LP2 transfer and wider coverage (Agent1, 25 November; #2844)

A distinct held-out experiment tests whether the renderer calibrated on LP1 actually transfers to LP2. It does not refit the unknown advances. The same original 197-glyph, 29-class template panel (archive 49/72) identifies glyphs; the advance model is trained exclusively on LP1 archive 3–13, held out on LP1 archive 14–16 and solved LP2 archive 73–74. Within each detected line, the complete GP sequence and binary visible-separator mask must match a unique source rune line; minimum glyph similarity 0.88. No inter-word gaps enter the fit. The nuisance model is outgoing/incoming GP bearing (57 identifiable coefficients); the fixed flag is absolute residual >2 pixels, inherited from the earlier geometry benchmark. This is a simple fixed renderer, not an unrestricted kerning/colour/local-scale model.

| Panel | Within-word gaps | RMSE (px) | >2 px | Innovation (px²) |
| --- | ---: | ---: | ---: | ---: |
| LP1 fit | 927 | 0.460655 | 0 | 0.036833 |
| Held-out solved | 296 | 0.474249 | 0 | 0.044281 |
| Unsolved LP2 | 8,829 | 0.501253 | 1 | 0.059930 |

The unknown tape spans all 55 rune-bearing pages, 538 of 594 rune lines with at least one accepted within-word gap. LP2 solved controls alone: 84 gaps, RMSE 0.515613, zero flags. Empirical solved-control flag rate 0/296; this is not a proof of zero false positives. The sole unknown flag is archive 44 (p27), zero-based rune line 2, gap 11, EA→B, left bounds x1413–1499/y1293–1407 and right x1503–1536/y1294–1405; residual +2.275967 px. The original crop shows ordinary adjacent rune strokes and no separate mark. The candidate is isolated, not a demonstrated symbol or channel.

Deterministic coordinate-domain plants enumerate both signs of each single-gap shift on unchanged held-out residuals; detection fractions for 1/2/3 pixels are 1.014%/50%/98.986% in solved controls and 1.727%/50%/98.273% in unknown gaps. These are sensitivity checks conditional on unchanged extraction, not rerendered-image plants. The earlier innovation test remains the stronger dense one-pixel-channel result. The new transfer rules out readily detectable large independent marks on the accepted tape without fitting LP2 gap geometry. Sparse subpixel, correlated or extraction-disrupting marks, excluded lines and other visual carriers remain open. No source-supported bit mapping or plaintext candidate.

[Standalone reproducer and exact coordinate CSV exporter](../sims/lp2_solved_control_microgap_sft.py) (commit 53f01774696264a7831bf82187259d18c73b7abc). Local original ZIP execution used manually transferred FNV-1a pairs of the source rune sequence and separator mask; repository wrapper replaces these with exact tuple comparisons and directly reads master transcription. Integer coordinate tape: 10,052 rows, 13 little-endian int32 columns in original extraction order, SHA256 `ce9360c49b7c2b05b4c3d2fabd7949e57fbe7075108f7dbb0dc712de70993c1d`. The exact wrapper is committed with assertions but has not been independently executed in CI. Use `--out tape.csv` to preserve all accepted coordinates and residuals. No new cryptographic synthesis claim; close the simple intra-word large-mark branch, and prioritize a different source-grounded operation.
