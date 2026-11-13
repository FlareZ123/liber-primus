# F5 JPEG DCT gate: seven password representations and calibrated original Q92 stencil

## Decision

No LP2 plaintext or key was recovered. The five earlier source-derived candidates and two representations of one source-derived M7 pole-cycle candidate were tested against all 58 original LP2 JPEGs: **0/406 nonempty payloads**, rejecting those exact seven password strings. The previously attempted f5.jar/PixelKnot structural fingerprint and FGH-2002 histogram estimator did not pass sensitivity controls at original Q92. A separate pinned v1.0.0 **neural F5 ONNX tier-1 detector** was calibrated against five different original-Q92 source covers and 15 exact extracted F5 payloads (256/1024/4096 bytes). All five cover proxies and **all 15 F5-positive carriers** gave identical `CLEAN`, `p_stego=0.439` and gate score `0.584`; it therefore failed sensitivity completely, and **no original LP2 pages were submitted to the neural detector**. [Source and calibrated failed run](lp2-f5-q92-neural-probe.md). A **new, separately calibrated original-format, leave-one-out shared-stencil detector** now detects **15/15 true F5 256–4096-byte embedded/extracted positives** and observes **zero F5-like coefficient changes across 32/58 original LP2 pages with reusable background artwork**. The other **26 pages are unscorable** by that stencil test. This is a source-bounded negative for independent whole-image F5 embedding in the repeated-template regions, not a general exclusion of F5 or recovery of a source-selected key. See [complete new Q92 original-input gate](lp2-f5-q92-shared-stencil-original-gate.md).

## Hypothesis and bounded inputs

F5 is a JPEG DCT-domain steganographic method, distinct from the already screened OutGuess and JSteg-style AC-LSB channels. The five earlier passwords came from existing Cicada source material, not a dictionary:

| Candidate | Source basis |
| --- | --- |
| CABALUOIDFORM | 2013 0_wisdom p36/p55 route; phrase previously tested with OutGuess |
| CABALVOIDFORM | Literal English VOID spelling of the same route |
| 33011033 | Primary documented 2014 7×7/OpenPuff candidate; not authenticated as an F5 key |
| 33011103 | Alternative documented 2014 7×7/OpenPuff candidate; not authenticated as an F5 key |
| MOBIUS | Explicit 2013 0_wisdom table keyword; weaker candidate |

The follow-up added two representations of one M7-derived 30-rune candidate:

| Candidate | Exact password bytes |
| --- | --- |
| M7 pole-cycle GP transliteration | IACSMPYLSOAAEHLEEOIMLLSCPPDTHAEJOESR (36 ASCII characters) |
| M7 pole-cycle original runes | ᛡᚳᛋᛗᛈᚣᛚᛋᚩᚪᚫᚻᛚᛖᛇᛁᛗᛚᛚᛋᚳᛈᛈᛞᚦᚫᛄᛟᛋᚱ (30 Unicode runes, passed as UTF-8) |

The M7 candidate is a hypothesis, not an established key. Its construction is source-reproducible:

- The original ink annotations contain 31 thirteen-dot marks, giving 32 intervals; intervals #9 and #12 are empty, leaving 30 nonempty fragments.
- The provisional p50 second-column rank map assigns those 30 fragments to P¹(F29). Starting at the p32 M7 pole rank 7, the cycle is 7→29→11→16→10→8→2→7, selecting fragments #6,#2,#23,#24,#18,#5,#29.
- The four short fragments at the end of the cycle (#24,#18,#5,#29; lengths 3+19+3+5) concatenate to exactly 30 GP runes.
- The runtime guard in the reproducer reconstructs this from the pinned corpus, grid and ink annotations and checks the mark count, empty intervals, unique ranks, complete cycle, fragment lengths, rune sequence and transliteration. It passed in the follow-up run.
- An earlier handoff omitted the final SR from the transliteration. The tested string above is the corrected complete 36-character form.

The workflow scanned the 75 original JPEGs (17 LP1 controls and all 58 LP2 targets, files 17.jpg–74.jpg). Password extraction was restricted to the 58 LP2 pages. The implementation is pinned to github.com/0verkilll/f5 v1.0.0 (MIT), Go 1.26.0.

## Results

### Extraction control and all seven candidates

The extraction positive control used original LP2 cover 17.jpg (SHA-256 197e1e153958b9a2736b09c10eea7d8bb00e0632fd22a8d9606840becc79942e). A deterministic 4,123-byte payload (SHA-256 83a7b98feadb6ea468845a2036248f6a2c01fca8da5a633acbf4c938d4de8b04) was embedded with embed-x-libjpeg and extracted byte-for-byte. The stego carrier SHA-256 was c7d66357a41dead12ffe97b9b06f29c00a619f5b1f29b1b74483ff5f508918b9.

The successful follow-up run is [43027819899](https://github.com/FlareZ123/liber-primus/actions/runs/43027819899), artifact ID 13860862074. Its source-validation guard passed. Across 406 attempts (58 images × 7 password strings):

- **0** attempts returned a nonempty payload.
- **391** failed the F5 k-parameter range check.
- **15** passed the k range check but failed later: 14 produced file sizes above the image/tool maximum; one runic-password attempt on LP2 page 2 requested 116,626 bytes but could recover only 45,481 before exhausting available coefficients.
- Every attempt exited nonzero; no output payload file was produced.

The two new forms account for 9 of the 15 downstream header false positives: the transliteration had 4 oversized-size failures; the original runic form had 4 oversized-size failures and the one incomplete extraction. The earlier five candidates account for the other 6 (1, 1, 2, 2 and 0 respectively). These are not partial plaintexts: all fail before a complete file is recovered.

The aggregate 15/406 k-range passes (3.69%) is close to the 8/256 = 3.125% rate expected if a wrong-password decoded k byte is approximately uniform. This is only a null-model heuristic, but it gives no reason to treat the downstream header parses as evidence of a correct password.

### Detector interpretation

#### f5.jar / PixelKnot structural detector

The earlier all-58-image extraction/detection artifact reported:

- Final detector verdict: CLEAN on 58/58; raw detected flag false on 58/58.
- Statistical reliability: unreliable on 58/58, confidence 0.4 throughout; β was saturated on 53/58 and images were marked double-compressed on 56/58.
- Structural fingerprint: all 58 were marked carrier-viable, with scores 0.1 or 0.25. These signatures target f5.jar/PixelKnot layouts, not every possible F5 encoder.
- The 4,123-byte extraction positive control itself was classified CLEAN (β=1.0, unreliable, structural score 0.25). It validates extraction but **does not validate detector sensitivity**.
- Two LP1 controls had raw detected=true flags but final verdict CLEAN because the structural fingerprint was absent.

Do not interpret CLEAN as a reliable absence result. The positive control is a demonstrated false negative for this detector on the tested carrier.

#### Fridrich–Goljan–Hogea 2002 statistical detector (Issue #389)

A separate, pinned FGH-2002 run processed the complete 75-image original corpus and 32 synthetic F5-positive controls. Reproduction: [GitHub Actions run 43122227362](https://github.com/FlareZ123/liber-primus/actions/runs/43122227362), artifact 13902653852. The implementation is `github.com/0verkilll/f5 v1.0.0` at commit `fbd2bb177d73d4ec89548172023e5451a084bf25`, with Go 1.26.0 and `github.com/0verkilll/jpeg v1.0.1`. The exact code and workflow are `sims/f5_detector_calibration/main.go` and `.github/workflows/f5-fgh2002-calibration.yml`.

Pinned settings: crop 4 px; 3×3 cover blur epsilon 0.01; low-frequency luminance modes (1,2), (2,1), (2,2); β threshold 0.125; quality-factor calibration candidates [60,70,75,80,85,90,95]. Synthetic controls use matrix k=1, predeclared target β values [0.05,0.10,0.15,0.25], and a fixed control-only password. All 32 embedded payloads were extracted byte-for-byte.

Results:

- **LP2 originals:** 58/58 were Q92 and marked unreliable because the executable detector reliability range ends at Q88. All 58 verdicts were inconclusive, not clean negatives. The per-mode β mean ranged 0.7405–1.0000 (median 1.0000); this is diagnostic only, not evidence of embedding.
- **Q85 matched positives:** 16/16 were inconclusive despite being in the detector's nominal optimal quality range. Actual modification rates ranged 0.0598–0.3012. Their per-mode mean β ranged 0.7173–1.0000 (median 1.0000).
- **Q95 matched positives:** 16/16 were inconclusive and the quality range was itself marked unreliable.
- **Q85 clean-cover controls:** the four unembedded covers were also inconclusive. Their per-mode mean β values were 1.0000 (page 17), 0.6378 (page 39), 1.0000 (page 57), and 1.0000 (page 74). Page 39's individual mode estimates were 0.7000, 0.6672, and 0.5461. Thus the clean controls already exceed the implementation's approximate β=0.60 full-capacity ceiling; the positive controls do not separate from them.

The original paper specifies an **average of three independently estimated mode β values**, whereas this library's headline estimator pools the three mode histograms before applying the least-squares fit. Recomputing the paper-prescribed per-mode mean from the stored diagnostics does not rescue the test: the clean covers and positive controls still overlap at high β, and every LP2 page remains above 0.7405. The aggregation difference is a reproducibility caveat, not a plausible explanation that restores sensitivity.

The original paper explicitly warns that crop-and-recompress cover estimation can fail on images with regular structure at a scale comparable to the 8×8 DCT blocks, and recommends avoiding modes that exhibit crop resonance (Fridrich, Goljan & Hogea, [“Steganalysis of JPEG Images: Breaking the F5 Algorithm,” §§3.2, 4](https://ws.binghamton.edu/fridrich/Research/f5.pdf)). The observed clean-cover failures are consistent with that documented limitation, but this run does **not** establish spatial resonance as the cause. It establishes the narrower and decisive point: this implementation is not calibrated on the LP2 manuscript images and supplies no valid sensitivity or false-positive bound.

**Decision:** no reproducible F5-specific signature survives matched controls, and no original-page clue uniquely selects an F5 key/permutation. Do not attempt keyed extraction or treat these inconclusive results as proof that F5 is absent. Retire this FGH implementation as a practical LP2 detector; leave the broader F5 family unresolved unless an independent source clue or a detector that passes matched controls becomes available.

## Reproducibility and correction

The original five-candidate run is [42995634330](https://github.com/FlareZ123/liber-primus/actions/runs/42995634330), artifact ID 13845471014. The follow-up reran those same 290 attempts alongside the 116 new attempts. Their extraction records match the earlier artifact exactly, confirming deterministic results for the pinned implementation and inputs.

The earlier version of this report incorrectly stated that all 290 original attempts failed at the k-parameter check. The raw artifact actually contains six downstream file-size failures (one each for the first two candidates, two each for the two 2014 candidates, and none for MOBIUS). This has been corrected above; those six cases also yielded no payload.

The separate FGH-2002 calibration is [run 43122227362](https://github.com/FlareZ123/liber-primus/actions/runs/43122227362), artifact 13902653852. Its complete detector/control summary is recorded above; the original JPEGs, synthetic stego carriers, payloads and extraction checks are in the run artifact. The Markdown artifact emitted a `%!v(MISSING)` placeholder for the quality-factor list because the report formatter omitted its argument; the pinned source array is `[60,70,75,80,85,90,95]`, and the formatter has been corrected in the reproducer for future runs.

An earlier harness run (42995341645) failed before the corpus scan because image_meta tried to parse the nonnumeric positive-control filename as an integer. The corrected reproducer is sims/f5_lp2_targeted_gate.py. The successful follow-up artifact contains summary.json, detection.jsonl and extractions.jsonl.

## Interpretation and next action

This F5 source-route now has **two distinct controls with different limits**. The seven clue-motivated passphrases have no original extractable bytes; FGH-2002 and the f5.jar structural signature did not calibrate on matching source imagery. The independent Q92 repeated-background stencil investigation does calibrate: **15/15 exact positive controls across five source page groups** were detected, with **0/32 source-original stencil mutation flags**. Its source references cover p4–7, 9–14, 34–39 and 40–55; 26 other pages cannot be scored by this method. The genuine grayscale F5 v1.0.0 positive-control encoder failed self-extraction and is a coverage caveat. The original image border may also contain common content predating page-specific artwork; payloads restricted to the rune body and smaller than the 256-byte tested minimum remain open. [Full condition, source atlas, code and passing CI](lp2-f5-q92-shared-stencil-original-gate.md).

The collective decision is to **stop speculative password sweeps and the uncalibrated FGH route**. No historical instruction selects an F5 password, independent payload, reset or permutation. Revisit F5 only for a source-selected, genuinely new decoder or a separately calibrated blind detector covering the unscorable pages, while directing current research toward an authentic plaintext inverse.

## Reproduction

- Script: [sims/f5_lp2_targeted_gate.py](../sims/f5_lp2_targeted_gate.py)
- Manual-only workflow: [.github/workflows/f5-lp2-targeted-gate.yml](../.github/workflows/f5-lp2-targeted-gate.yml)
- Follow-up run and artifact: [GitHub Actions run 43027819899](https://github.com/FlareZ123/liber-primus/actions/runs/43027819899)
- Original five-candidate run: [GitHub Actions run 42995634330](https://github.com/FlareZ123/liber-primus/actions/runs/42995634330)
