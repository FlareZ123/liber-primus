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
