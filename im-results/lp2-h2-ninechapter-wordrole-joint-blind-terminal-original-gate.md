# Source-marked nine-chapter H2: blind tableau/clock recovery and original terminal gate

**17 November 2026, Agent48. Original-input source correction, calibrated synthetic inverse, and negative terminal decision.** No unknown LP2 plaintext, authentic H2 key, or Cicada continuation has been recovered. The [completed source-correct Windows Node22 run 44111879170](https://github.com/FlareZ123/liber-primus/actions/runs/44111879170) and [deterministic SFT](../sims/lp2_h2_nine_chapter_joint_blind_original_sft.cjs) supersede the shifted-boundary calibration of [run 44052350345](https://github.com/FlareZ123/liber-primus/actions/runs/44052350345).

## Original physical boundaries and causal premise

Original scans **43.jpg/44.jpg** delimit physical LP2 p26/p27 (p26 terminal mark; p27 enlarged red opening); **49.jpg/50.jpg** delimit p32/p33 (p32 terminal mark; p33 enlarged red opening and cuneiform labels). The native [page transcript](../resources/liber-primus/lp2-transcription.txt) puts terminal section markers at p26 and p32; independent [illustrated-chapter holdout work](lp2-doublet-visible-chapter-reset-predictive-holdout.md) already indexed the nine true breaks. Correct zero-based physical chapters are **p0–2, p3–7, p8–14, p15–22, p23–26, p27–32, p33–39, p40–53, p54–55** with GP29 lengths **729, 1,145, 1,729, 1,903, 1,021, 1,433, 1,680, 3,008, 308**. The runeless table is p50; 55 unknown rune-bearing pages total **12,956 runes** and **2,896 printed words** with 32 physical-page word carries.

**Correction to the prior H2 report:** the earlier “visual chapters” p23–27 / p28–31 / p32–39 were actually *unnatural shifted partitions* with lengths 1,255 / 1,078 / 1,801, despite having the same total runes and final heldout 308. Their 297.875/308 synthetic mean and −4.097512 original soft score were genuine results only for that differently partitioned model. They cannot establish a source-visible chapter-reset negative. The source-correct test below uses the originally printed boundaries and was run independently, without fitting to the real terminal output.

## Concrete conditional reversible cipher and inverse

The explored H2 family uses a shared, unknown **29×29 row-permutation GP29 tableau**. A prime-totient key-row stream starts from prime 2 at each source-marked chapter boundary. If a proposed output repeats the preceding ciphertext rune, a hidden Bernoulli trial with fixed **q=0.81** rejects that row and consumes another key row; the concealed skip history must be inferred. This motivated a genuine inversion program combining observable source word cuts (singleton, first, last, interior rune roles), an independent Shakespeare role-prior/bigram model, Hungarian permutation-row fitting, and annealed Viterbi recovery of key drift. All source roles and hidden key-row drift restrictions are frozen. There is **no first-party clue selecting a random shared secret tableau or the particular q=0.81 collision policy**. Their recovery from synthetic controls establishes algorithmic ability for this hypothesis only.

A blinded source-shaped positive draws GP-native Gibran words with exactly the original complete printed word-length profile, the 83 source singleton sites, four apostrophe-word placements and the *correct nine source chapter run lengths*. For each of eight independently seeded plants the 841 table symbols, entire original-shaped 12,956-rune H2 ciphertext and true key/reject histories are independently generated. The model fits only the first **12,648 ciphertext runes** (p0–53); all terminal **308** cipher symbols (p54–55) and their synthetic truth are excluded from fitting.

| Heldout original-shaped plant | Correct GP plaintext / 308 | Correct hidden key rows / 308 | Invalid inferred rejected-row checks |
| --- | ---: | ---: | ---: |
| Seed0, 855747533 | 294 | 308 | 0 |
| Seed1, 1869651756 | 300 | 308 | 1 |
| Seed2, 2883555979 | 300 | 308 | 1 |
| Seed3, 3897460202 | 293 | 303 | 3 |
| Seed4, 616397129 | 302 | 308 | 0 |
| Seed5, 1630301352 | 305 | 308 | 0 |
| Seed6, 2644205575 | 303 | 308 | 0 |
| Seed7, 3658109798 | 296 | 305 | 0 |

The source-correct mean is **299.125/308 (97.1185%)** heldout plaintext and **307/308 (99.6753%)** heldout clock rows, with an average **688.625/841 (81.8817%)** correct secret-table cells. The native GP English bigram log-score averages **−2.672791 per transition**, spanning −2.739652 to −2.590045. Six of eight synthetic terminal predictions satisfy every inferred rejected-row equality. These controls include exact forward H2 generation/replay and deliberately withhold test-time ground truth. The inversion is powerful but **still approximate**; even the best plant has three wrong plaintext runes.

## One frozen original-manuscript inverse

The identical model trained once on untouched canonical original ciphertext p0–53, then inverted the untouched final physical p54–55 section. No original key/tableau/terminal plaintext was supplied or tuned.

| Metric | Original p54–55 result |
| --- | ---: |
| Training GP bigram log-score | −3.508818 |
| Raw terminal ciphertext GP bigram log-score | −4.424373 |
| Blind terminal GP bigram log-score | −3.979321 |
| Soft-rejected-row-constrained terminal GP bigram log-score | **−4.112501** |
| Inferred hidden consumed rows | 13 |
| Violated inferred same-plaintext rejected-row equalities | **10 of 13** |

The soft terminal candidate begins `TCLILSIINTIGIPIAEATEAOYCOGIAASTSBGMPOPHLRSJJCCIDNGCRNGTXNGFCGIT...` in GP transliteration and remains nonlinguistic across the heldout 308 runes. Its −4.112501 is **1.439710** nats per symbol below the synthetic positive mean. Ten of thirteen violated rejection identities exceed the maximum of three failed checks across eight matching synthetic positives. The eight nonheldout original chapters remain near-uniform and do not reveal a genuine intact native-GP passage. A fitted table can round-trip its own inferred plaintext without being correct; this candidate fails both independent native-English coherence and its own hidden skipped-row consistency.

## Decision and limits

**Retire this exact source-marked nine-chapter H2 shared-random-table, prime-2 reset, q=0.81, fixed word-register inverse as a practical decoder for the original terminal 308 runes.** The earlier wrong segmentation is no longer evidence about physical chapters. The corrected original result is a model-conditioned negative with exceptionally strong source-shaped control behavior, **not a proof excluding every secret H2 tableau, other key clock, alternative skip law, non-GP language, or outer layer**. No authentic key or plaintext has emerged. A genuinely author-selected key/tableau/state operation or an independently authenticated original plaintext witness must precede a new parameterized H2 attack.

## Reproduction

The [single-file original-input runner](../sims/lp2_h2_nine_chapter_joint_blind_original_sft.cjs) uses source-asserted correct chapters and the existing [29-row Hungarian table solver](../sims/gp29_bigram_tableau_decoder.cjs); native source inputs are the [GP29 corpus](../resources/liber-primus/lp2-corpus.json) and canonical [printed transcript](../resources/liber-primus/lp2-transcription.txt). Original fixed seeds, original source lengths and heldout reports are preserved in [successful Windows workflow 44111879170](https://github.com/FlareZ123/liber-primus/actions/runs/44111879170). For a different, page-reset rival, see [frozen p41 gate](lp2-h2-page-reset-blind-joint-original-p41-gate.md). For independent source geometry controls, see [chapter-reset doublet test](lp2-doublet-visible-chapter-reset-predictive-holdout.md).
