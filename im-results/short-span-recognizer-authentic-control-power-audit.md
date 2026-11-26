# Short-span recognizer: authentic-control and family-wise power audit

**Decision:** insufficient authentic-control power. Do not use the current C2 baseline to accept or reject short LP2 plaintext candidates.

## Why the published C2 baseline is not an authentic Cicada calibration

The external [C2 challenge specification](https://github.com/Dukotah/cicada3301/blob/main/CHALLENGES.md) reports a quadgram baseline near 0.408 TPR at 1% single-window FPR. Its [checker](https://github.com/Dukotah/cicada3301/blob/main/challenges/c2_short_recognizer.py) samples uniformly from three development files:

- `solved_plaintext.txt`: this is not a clean plaintext corpus. It contains PGP-signed material and long hexadecimal/ciphertext payloads; the checker calls `text_to_idx`, which strips non-A–Z but does not parse PGP. Hex A–F and signature/header letters therefore enter the positive pool. The trailing plaintext tail beginning "IT IS THE DUTY..." contains 143 alphabetic characters, generously counted, out of 9,294 alphabetic characters in the file: **1.54%**.
- `self_reliance.txt`: Emerson's public-domain essay, not Cicada plaintext.
- `thematic.txt`: a 41-word thematic keyword list, not body prose.

Because the checker chooses among the three files uniformly, the actual trailing plaintext tail contributes only about **0.51%** of positive draws. The reported TPR is therefore not a measurement on authentic solved Cicada prose. The keyword list may be useful as a title/keyword control, but it cannot stand in for body text. The PGP/hex file must be parsed or excluded before any calibration.

## Authentic LP2 control is too short for a 1% family-wise claim

The only available solved LP2 prose page in the local transcription is p57. It contains 112 runes total: a 7-rune title and approximately 105 body runes. At the C2 window lengths, the body provides at most:

| Window length | Non-overlapping body windows | 95% upper FPR after zero false positives |
|---:|---:|---:|
| 6 | 17 | 16.2% |
| 8 | 13 | 20.6% |
| 10 | 10 | 25.9% |
| 12 | 8 | 31.2% |

These are optimistic counts; overlapping windows are correlated, and the body is one page, not independent held-out sections. Even observing zero false positives cannot establish anything close to a 1% FPR. The title has only seven runes, so there is no separate authentic title corpus from which to calibrate a title model. p56 is a hash/non-prose target, not an English positive. The 2012 Blake material is an authentic puzzle source text, but not a recovered LP2 plaintext section and cannot replace held-out solved pages.

## Family-wise multiplicity defeats a single-window threshold

The already-recorded p0 affine fragment output has 1,816 fragments and 27,812 candidate transforms (`im-results/lp2-p0-short-affine-offset-spacingfree-output.json`). If a nominal 1% single-candidate FPR were naively applied:

| Candidate family | m | Independent-trials illustration of family-wise FPR | Per-candidate α needed for 1% FWER (Bonferroni) |
|---|---:|---:|---:|
| p0 fragments | 1,816 | effectively 100% | 5.51×10⁻⁶ |
| p0 transforms | 27,812 | effectively 100% | 3.60×10⁻⁷ |

The independence column is only an illustration; candidate fragments are correlated. The exact family-wise rate requires an empirical null distribution of the *maximum score over the whole frozen family*. The available authentic p57 text cannot estimate that distribution. A per-window C2 threshold is not a family-wise threshold.

## Decision and next prerequisite

No new candidate strings were generated and no "READ OUT / WILL / YOU" island was scored. Applying an uncalibrated English score to the p54 heading or p0 title would create a false sense of precision: both are title-like, and there are not enough authentic solved title controls to calibrate them separately from body prose.

The task's measurable-insufficiency criterion is met. A usable recognizer requires, at minimum:

1. a clean, source-verified multi-page solved Cicada plaintext corpus, with whole sections held out;
2. separate title/heading and body controls;
3. matched non-prose and ciphertext decoys;
4. empirical family-max null calibration for the exact frozen candidate family.

Until those exist, retain short English-looking fragments as unverified observations. Do not use the current C2 baseline to promote or reject them.

Reproduction of the quantitative bounds: `python sims/short_span_recognizer_power_audit.py`.
