# The original five-dot plate versus an actual pre-2014 Aquila line chart

**Agent42, 18 November 2026 · Director [#1435](https://github.com/FlareZ123/liber-primus/issues/1435).** **Decision:** The best postselected five-star Aquila fit does **not** follow the five-star walk in a documented period-accessible Aquila constellation graph. A 2008 Xplanet chart supports a different five-star chain whose mismatch with the same original manuscript dots is about **1.94× larger**. This is an independently sourced *candidate-selection objection*, not an all-constellation exclusion. No unknown LP2 plaintext, source-authenticated key, decoding operation or endpoint is recovered.

## A genuinely pre-2014 chart supplies a different five-star selector

Xplanet **1.2.0**, shipped by 2008 and archived as Debian **lenny** package `1.2.0-6`, contains an unaltered plain-text line-segment atlas under [`xplanet/arcs/constellations`](https://sources.debian.org/src/xplanet/1.2.0-6/xplanet/arcs/constellations); see the [version inventory](https://sources.debian.org/src/xplanet/) and a [2008 dated package](https://archive.freebsd.org/ports/sparc64/packages-7.0-release/astro/). This is historical, human-accessible sky-chart geometry, independent of any LP2 fitting. Its Aquila segment explicitly contains the ordered continuous links:

`Tarazed γ → Altair α → Beta β → Eta η → Iota ι`.

It additionally draws `Eta η → Delta δ` as a separate branch. It does **not** join `Alpha α → Delta δ`. The earlier best-fitting `γ,α,δ,η,ι` therefore chooses one star from another branch rather than following the drawn five-star chain. A chart or original instruction could still select the five in another way; the historical graph itself does not.

Earlier [original-image Aquila measurement](lp2-fivedot-aquila-astrometry-original-gate.md) used the true source 2400×3600 `40.jpg` five-circle positions, then permitted all 120 correspondences, continuous scale, translation, rotation and reflection. It reported `0.1878283989` normalized residual for five retrospectively chosen J2000 stars `γ,α,δ,η,ι` and warned that no star/chart/reading order had been authored by Cicada.

## Source-frozen historic-star counterfactual on the unchanged five printed dots

Retain those exact five original ink centroids and their independently measured layout. The original `40.jpg` SHA256 is `d31a23cb3a2e50b505e1c468ffbb0106f5353f469bb5958b87ab929fc88decee`. Read both five-star sets from the **same old Xplanet atlas coordinates**, four decimal places in RA hours and declination degrees. Apply precisely the previous geometric criterion: center both 2D point sets, project RA by cosine of mean declination, evaluate all 120 label permutations, and allow rotations/reflections and a free isotropic scale. The label search grants each candidate every possible orientation; no labels or cipher registers are chosen by language scores.

| Star set in the 2008 source's own J2000 values | Best normalized residual | Best original left-to-right assignment | Orientation |
| --- | ---: | --- | --- |
| **Historical chart's connected five-star walk** `γ,α,β,η,ι` | **0.3644199847** | `ι,η,α,β,γ` | rotation |
| Retrospectively chosen alternative `γ,α,δ,η,ι` | **0.1879863887** | `γ,α,δ,η,ι` | reflection |

The latter agrees with the previous original's `0.1878284` to the precision expected when that study's full-precision J2000 coordinates are replaced with Xplanet's **four-decimal** coordinates. The historical contiguous chain fits substantially worse. A true geometric five-point chart synthetic positive subjected to a free rotation/translation/scale passes the same fitter with residual below `1e-7`.

The complete fixed-input [Windows Node22 CommonJS SFT](../sims/lp2_fivedot_xplanet_2008_graph_sft.cjs) hashes the original JPEG, uses the independently extracted five fixed ink centroids, contains the exact old chart RA/Dec values, visits all 120 assignments and both orientations, asserts both measured residuals and the positive plant. It reads and changes no original file.

## Contemporary meaning remains underdetermined

The historical [Allen *Star Names* account](https://penelope.uchicago.edu/Thayer/E/Gazetteer/Topics/astronomy/_Texts/secondary/ALLSTA/Aquila%2A.html) identifies **α/β/γ** as the *Family of Aquila*, **δ/η/θ** as *Al Mizan*, and **ι/λ** as *Al Thalimain*. Thus both the star-identity ambiguity (ι versus λ) and the mixture of bright families are intrinsic older-chart problems. A genuinely source-selected five-star key needs a visible instruction choosing exactly which five of those stars and their order; brightness alone cannot select the faint ι while excluding brighter β, ζ, θ and λ.

A [2019 interview with a person calling themselves “gHOST3301”](https://therealsamizdat.com/2019/08/30/cicada-files-ghost3301-interview/) contains a retrospective claim that manuscript dots “apply to the constellations.” The speaker's Cicada authority is **unverified**, the reference to “page 7” uses conflicting pagination and the interview postdates LP2 by five years. It cannot establish an authenticated 2014 source or specify Aquila, the five names, their order, GP29 mapping or an inverse operation.

**Conclusion for #1435:** A pre-2014 astronomy chart certainly exists and is historically usable, but this concrete dated chart favors a different path from the best retrospective Aquila fit. Neither supplies a sender-authored selector. Retire the **Xplanet-connected Aquila five-star walk as an exact original plate** and keep the wider constellation resemblance provisional. Do not promote `3,1,4,7,9` as a key or launch a new phase sweep. The research-changing input would be an authentic pre-2014 or original signed clue that commits to a particular chart, names, and reversible receiver.
