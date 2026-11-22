# Keyless historical F5 274-feature calibration on original-format LP2 JPEG controls

## Research question and intended decision

A subset of the Liber Primus 2 manuscript's original **Q92 2400×3600 JPEGs** could contain a password-unknown F5 payload. For the **26 pages outside the previously tested same-template cover-difference gate**, a password-free historical detector is appealing, since a positive steganalytic image could direct an otherwise unbounded key search. F5 is an exploratory competing explanation, **not an authenticated LP2 operation or an established payload format**. The specific test here is whether the **2007 Pevný–Fridrich merged 274-dimensional DCT/Markov features** can detect true low-volume F5 implants with sufficiently reliable calibration that any original-page ranking is interpretable.

The decision rule was fixed in source **before** any original score: 256-byte F5 plants on original-format Q92 pages, *whole-artwork-family* heldout separation across L (one-component grayscale) and RGB (three-component color), at least **50 wholly held-out families and 100 clean negatives**, **≥90% true-positive sensitivity separately for each mode**, and **≤1 false positive out of the 100 held-out clean negatives**. Only then may the classifier score unknown manuscript originals. Even a successful pass would require original-source-selected framing or extraction and familywise multiple-comparison controls before reporting hidden payloads.

## What actually works: authenticated gray and RGB F5 positive controls

The historical 2007 source archive is publicly available from **Jan Kodovsky's official Binghamton [JET v2.2 274-feature extractor](https://dde.binghamton.edu/download/ccmerged/extract.tar.gz)**. Its C++ source needs only modern toolchain API accommodation: Boost Filesystem v2 `leaf()` becomes `filename().string()`, legacy headers use the system libjpeg8 ABI, and historical class-method qualifiers require `-fpermissive`. Compilation succeeds and a supplied fixture JPEG produces a vector of exactly 274 historical features plus image filename. This is an original historical implementation, not a novel approximate feature substitute. See [successful CI fixture and controls](https://github.com/FlareZ123/liber-primus/actions/runs/43411156388).

The pinned F5v1.0.0 port's ordinary CLI `embed` and `embed-x` can produce an **extractor-invalid original grayscale carrier** at 256 or 4096 bytes (nonsensical decoded `k`), while `embed-jar` changes one-component grayscale into three-component color. A source-compatible fix is to embed using **`embed.EmbedWithOptions(..., ForceK=4)`** on the *original quantized DCT coefficients* and re-encode with the original one- or three-component JPEG decoder, preserving the original source Q92 luma/chroma tables. On the original LP2 grayscale 62.jpg and RGB 71.jpg as **covers for known artificial payloads**, all **six** 256-, 1024-, and 4096-byte **`k=4`** positive controls re-extract **exactly** with no quantized coefficient discrepancies and no component conversion; `k=2` also passes all six. On source grayscale 62.jpg, `k=1` at4096 corrupts the final 64-coefficient block and no message extracts; `k=8` at4096 lacks capacity. These failures are separated from the genuine recoverable positive controls. Reproducer: [source-mode native F5 matrix-k SFT](../sims/f5_detector_calibration/gray_roundtrip_sft.go) and [source-mode preserving F5 control generator](../sims/f5_detector_calibration/native_f5_embed.go).

## Original 2007 blind detector: full preregistered 100-clean gate failed

The [full manual workflow run 43413416787](https://github.com/FlareZ123/liber-primus/actions/runs/43413416787), completed **2026-11-13 11:15:26 UTC**, implemented the frozen design with **24 training artwork families and 50 wholly heldout families**, each with independent grayscale L and RGB output. All **148 F5 v1.0.0 256-byte embedded controls** (including training) were extractor-verified; the classifier independently scored 100 heldout F5 positives and 100 matched clean controls. The historical 274-dimensional JET features were processed by a family-disjoint four-fold GroupKFold StandardScaler/RBF-SVC (best training-only C=0.1, group-CV balanced accuracy 0.50); threshold **0.006303149249019072** was frozen from the maximum training-clean decision score before any heldout test.

The holdout returned:

| JPEG color mode | Exact-extracted F5 positives detected | Missed positives | Clean false positives |
| --- | ---: | ---: | ---: |
| Grayscale L | **2/50** | 48/50 | 2/50 |
| RGB | **2/50** | 48/50 | 2/50 |
| **Total** | **4/100** | **96/100** | **4/100** |

Sensitivity was **4% overall** and **4% in each mode**, versus the locked **≥90% in each mode** requirement. False positives were **4/100** versus the locked **≤1/100** cap. The original manuscript evaluation was correctly withheld by the program, which printed `ORIGINAL_SCREEN_WITHHELD: failed independently heldout F5 detection gate`, and the recorded machine-readable field is `originals_examined: false`. Full case summary: [run logs and artifact f5-blind274-full-controls](https://github.com/FlareZ123/liber-primus/actions/runs/43413416787), ID 14030973235; reproduction script [blind274_gate.py](../sims/f5_detector_calibration/blind274_gate.py). The successful CI conclusion means **the experiment executed and stopped at its intended gate**; it does not mean classifier success.

Earlier pilot (8 train/5 heldout families): all 26 exact F5 plants extracted; 0/10 detected, 0/10 clean false positives, group CV balanced accuracy 0.50. [Pilot workflow](https://github.com/FlareZ123/liber-primus/actions/runs/43412746381). The full test agrees that this particular 274-D/SVC implementation is ineffective at the designated low-payload regime.

## Current conclusion and scope

**Decision: retire this blind 274-feature F5 detector at original-like Q92 256-byte payload rates.** The period-correct source feature extractor and authentic, coefficient-preserving grayscale/RGB F5 positive-control pipeline are useful reusable assets, but this detector did not separate embedded 256-byte payloads from matched covers at the stipulated sensitivity/specificity. Do **not** apply its raw scores to original LP2 images or call any original page F5-negative.

This result does **not** exclude other F5 payload sizes, alternate detectors, password-selected extraction, or non-F5 steganographic channels. None of the unknown original pages was examined by this experiment. No hidden original payload, unsolved LP2 plaintext, authentic decoding key, or destination was recovered. Any future F5 attempt requires an independently justified new detecting/extracting mechanism and an independent heldout positive-control gate; merely increasing this classifier's training size would repeat the failed premise.
