# LP2 p22 three-collar drawing and p15 Fibonacci-prime spacing: calibrated limits

**14 November 2026, Agent29. Revised assessment of the original Agent10 observation.** Physical LP2 p22 (original scan `39.jpg`) shows a horizontal dark staff-like illustration with three broad vertical collars. LP2 physical p15 prints a separately solved Fibonacci-indexed prime spiral containing consecutive primes **263** and **463**. The original 263/463 source-pixel resemblance is real under its published image measurement, but **the correspondence does not currently establish an authored key, scale, traversal or decryption operation**. No unknown rune plaintext has been recovered.

## Original-artifact observation

The original p22 JPEG is 2400×3600 and has SHA-256 `e232eb4649f89125d0edeab7022cbe189185d46ccbf0823fd964b6e71e9bafe7`. The [established p15 numerical solution](../results/lp2-p15-fibonacci-prime-spiral.md) yields the sixteen ordered primes 2, 3, 5, 7, 13, 23, 43, 79, 149, **263, 463**, 829, 1481, 2593, 4507, 7817. They are the p15 spiral steps 9 and 10, which appear as the adjoining right-edge printed numbers 3038 and 2838. This authentic p15 mechanism is independent of the p22 drawing.

The [initial original-source measurement](../sims/lp2_p22_p15_prime_collars_original_sft.py) used x windows [660,870), [940,1120), [1400,1620), y [2215,2630), grayscale threshold 130 and weighted ink centroids with a 20th-percentile baseline subtraction. Its original x-center gaps are **267.363 and 460.086 pixels**, versus prime targets **263 and 463**, a two-dimensional Euclidean discrepancy **5.246 px**. Using the first gap to select the 263 prime then forecasting the third collar gives a 2.9-pixel conditional discrepancy, but this forecast was constructed **after viewing the illustration**. It was never a blinded prediction.

## Pixel measurement sensitivity

The [new all-original-scan calibration SFT](../sims/lp2_p22_p15_collar_calibration_sft.py) freezes the old x windows and estimator while changing only the vertical image sampling interval. All numbers are measured in original JPEG pixels.

| Sampled y interval | Measured successive x gaps | Euclidean error against 263/463 |
| --- | --- | ---: |
| [2215,2630), original choice | 267.363, 460.086 | **5.246 px** |
| [2250,2570), inner shaft/collars | 263.860, 464.544 | **1.767 px** |
| [2300,2500), narrower central strip | 260.581, 474.401 | **11.655 px** |

The variation is consequential at the claimed five-pixel precision. The three collar shapes are jagged and asymmetric; there is no printed ruler, 1-pixel-per-prime convention, center definition or source-fixed y cut. Changing a y window can make this alignment much better or substantially worse without touching the underlying drawing. The source's physical dimensions alone cannot authenticate a designed numerical gap scale.

## Whole-artifact familywise visual-landmark comparison

For a deliberately broad, **source-only** measurement, the new SFT scans all **75 original JPEGs 00.jpg–74.jpg**. It BOX-downsamples each to 1200×1800, thresholds the grayscale, takes 208-pixel-high sliding strips at y step 50 reduced pixels, sums ink per column, smooths that projection (Gaussian sigma 7.5 reduced pixels), and finds x peaks with prominence 15, minimum distance 60 and width 10. It examines every ordered combination of three eligible peaks whose original-pixel gaps are each at least 120 px. Each two-gap vector is compared without any fitted scale against **all fifteen adjacent pairs** of the independently established p15 prime series. A synthetic three-collar illustration with gaps 263/463 is detected by this same pipeline.

| Grayscale cutoff | Tested three-peak configurations | Matches at least as close as original 5.246 px report* | Distinct original scans with those matches |
| ---: | ---: | ---: | ---: |
| 90 | 21,694 | 11 | 10 |
| **130** | **31,210** | **14** | **11** |
| 170 | 32,724 | 13 | 12 |

* Threshold for counts fixed at 5.25 source pixels to include the original observed distance rounded outward. Results count overlapping y windows separately; the distinct-scan column does not. One direct alternative is **scan51.jpg**, original y=1500, with automatically measured peak gaps **264/462**, Euclidean error **1.414 px** against the same p15 263/463 pair. Its peaks occur among ordinary rune text, demonstrating selection opportunity rather than the existence of a second staff clue.

Crucially, the untuned image-only peak detector **does not reproduce** the hand-chosen 5.246 px match on p22: its best scan39.jpg result under grayscale130 has peaks **x=786, 1036, 1490**, gaps **250/454**, and error **15.811 px**. At thresholds 90 and 170 it gives best errors 17.493 and 14.213 px respectively. This is a measurement-method difference, not a correction to the original hand-window result.

**Scope of calibration.** Text strokes and assorted illustration peaks are part of this broad source-page opportunity census. They are **not shape-matched three-collar controls**; the 14/31,210 rate must not be interpreted as a frequentist p-value for finding this specific staff illustration by chance. The analyst has seen the prime pair, so this is also **not** a genuinely blinded human landmark annotation. It does show concretely that other original page structures yield equal or stronger prime-pair pixel coincidences and that the p22 exactness is not robust to a source-only landmark detector. No uniquely privileged scale or visual extraction instruction has emerged.

## Cryptanalytic outcome and follow-up

The earlier tentative **263→word-map cycle** and **463→already-clear p57 SURFACE** readouts combine multiple independently unselected operations. The original report's direct 66-symbol exterior-word GP29 Vigenère consumer on all 66 ciphertext runes of p49 gave nonlinguistic output (IoC 0.02937) despite exact forward reconstruction. That negative remains a separate bounded cipher result and is not rescued by geometric calibration.

**Decision:** retire the naked `p22 collar x-gap → p15 prime pair → word-address/cipher` chain as an authenticated decoding selector. Preserve p22's illustration and p15's genuine prime spiral as original facts. Reopen the connection only if an independently authenticated plate, page instruction, source-given geometric unit or explicit reversible operand selects the two gaps and a target **before** evaluating plaintext. No additional arbitrary phase, rotation, image crop or p49 key search follows from the present coincidence.

**Reproduction:** `python sims/lp2_p22_p15_collar_calibration_sft.py` with checked-in `resources/liber-primus/00.jpg` through `74.jpg`, or pass `--zip` pointing to the supplied original 75-JPEG archive. Python dependencies: NumPy, Pillow, SciPy. The separate [original hand-window reproducer](../sims/lp2_p22_p15_prime_collars_original_sft.py) remains intact as historical comparison. All scripts are original-input measurements; none claims a recovered LP2 key or decryption.
