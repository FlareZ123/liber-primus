# LP2 word-order side channel: corrected word-boundary experiment

**Evidence class:** exploratory computational finding, not a decryption. Updated after a 2026-11-10 Critic challenge identified page-split fragments wrongly counted as complete words. The original fragment results remain reproducible in GitHub Actions run 42738369401 but **are superseded here**.

## Corpus contract and repair

Across LP2 unsolved rune-bearing pages there are **12,956 runes, 2,896 canonical rune-words, 55 rune-bearing page segments**, and an additional runeless numeric-grid page 50. Physical page breaks (`%`) and print line breaks (`/`) **can bisect a rune word**.

The original per-page parser returned 2,928 **fragments**, exceeding canonical word count by 32. The repaired span-aware parser `sims/lp2_word_pages.cjs` finds **32 words crossing page boundaries**. Its page-end metadata is pinned to each word's **last rune**, avoiding false crossings when a new page begins with a delimiter. Consequently the 32 crossing words account exactly for the 32 surplus page fragments. The parser retains both starting and ending page IDs, exposes full words assigned to their starting page, and also exposes only words wholly contained on one page. Its regression test `sims/test_lp2_word_pages.cjs` asserts rune count, canonical word count, old fragment count, page count and an artificial word split between two pages. Future tests must use these definitions explicitly.

Input is the shared `resources/lp2-transcription.txt`; it agrees rune-for-rune with `resources/liber-primus/lp2-corpus.json`, which preserves indices but does not encode punctuation.

## Loss of adjacent word-length structure

Use capped 9-category rune word lengths (1–8, then 9+). Within-clause permutation tests (1,000 samples) produce:

| Input | Adjacent pairs | Observed mutual information (nats) | Permuted null mean | z | One-sided p |
| --- | ---: | ---: | ---: | ---: | ---: |
| Unsolved LP2, *canonical words* | 2,709 | 0.0109137 | 0.0119722 | −0.506 | 0.677 |
| Previously solved LP1, runic text control | 590 | 0.1004871 | 0.0607112 | +4.109 | 0.001 |

This is a genuine negative constraint on a hypothesis that the visible LP2 word boundaries retain *the same ordinary-English word-order signature* as the solved LP1 reference. It does **not** prove plaintext word transposition, prove padding, or identify a cipher.

## Page-local 23/46 exploratory lag

A 9×9 length-bigram model is trained on the first 180,000 characters of a public-domain Shakespeare sample, collapsing `TH NG EA EO OE AE IA` as an approximation of two-letter Gematria Primus characters; additive-one smoothing is used. For each unsolved LP2 page, score the word lengths at positions `i` and `i+lag` with the model's log-odds against independent length marginal frequencies. Compare to within-page Fisher–Yates shuffles, preserving each page's word-length inventory.

The first exploratory scan over lags 1–60 suggested lags **23** and **46**. An explicitly subsequent harmonic scan over `k=2..30` used `z(k)+z(2k)` with independent Monte Carlo calibration (700 shuffles) and 2,200 familywise test shuffles.

| Treatment of page-crossing words | Highest harmonic | z at 23 | z at 46 | Harmonic sum | Exploratory familywise p |
| --- | --- | ---: | ---: | ---: | ---: |
| Assign complete crossing word to its starting page (2,896 words) | 23,46 | +2.486 | +1.592 | 4.078 | 0.0445 |
| Exclude 32 crossing words (2,864 contained-only words) | 23,46 | +2.579 | +1.668 | 4.247 | 0.0277 |

The **known fragment-parsing error inflated this statistic**: the obsolete 2,928-fragment analysis reported harmonic score 5.057 and familywise p=0.00454. Corrected values are weaker and near the statistical decision boundary. Both corrected projections nonetheless rank 23 first.

Additional qualification: the harmonic family was chosen after examining the raw lag spectrum; its permutation p corrects the scan within that family, **not** the entire earlier exploratory search. A small p in this setup is **not a proof that 23 is a cipher parameter**. Whole-book/section concatenation did not retain the original fragment-based lag-23 phenomenon; the effect was page-local. A length bigram model fitted only to the small solved LP1 sample did not replicate lag23. Independent English-language texts and a mechanistic prediction are still necessary.

## Mechanism test: 23-step column reading fails

For a simple candidate pagewise transposition, read the `k`th-spaced word positions in columns: `0,k,2k,...,1,1+k,...`. Test `k=2..33` and both column orientations. Both corrected representations again rank **k=23** first in raw Shakespeare bigram score, but the previous full 64-layout familywise permutation test on the **invalid fragment representation** returned `p≈0.372`. This evidence does not support a working transposition. A supplemental fixed 23-column boustrophedon test did not convincingly restore ordinary-English word-length dependence on both disjoint page subsets. Do **not** promote this simple reconstruction to a cipher explanation.

An independent rune-repeat test found 63 identical-rune pairs within 10,060 within-word adjacent positions and 23 across 2,895 whole-word boundaries. Rates were 0.00626 and 0.00794 respectively; the modest difference does not establish a word-boundary key reset.

## Productive next experiment

A mechanism, ideally suggested by a separate clue or image layout, should **predict exactly what a 23-word spacing means before inspecting plaintext-fit scores**, and then predict which unseen pages preserve the relation. Simple reordering of word groups has failed so far. An actual solution requires reconstructing rune plaintext or independent key constraints, not another unconstrained scan of fitted word-length models.

## Reproduction

- Canonical transcribed source: `resources/lp2-transcription.txt`, mirrored originally from the [rtkd/iddqd community lineage](https://github.com/krisyotam/cicada3301/blob/main/liber-primus/runes-text.txt); original scan artifacts are in `resources/liber-primus/`.
- Span parser and regression: `sims/lp2_word_pages.cjs` and `sims/test_lp2_word_pages.cjs`.
- Corrected deterministic experiment: `sims/word_length_order_probe.cjs`. It checks 2,896 canonical words, 12,956 runes, 55 page segments and 32 excess fragments.
- [Successful corrected manual GitHub Actions run 42741745509](https://github.com/FlareZ123/liber-primus/actions/runs/42741745509), which ran the regression before the experiment. Prior fragment-only run [42738369401](https://github.com/FlareZ123/liber-primus/actions/runs/42738369401) is **superseded**.
- Prior known plaintext reference: `resources/transcriptions/lp1_wulfic_canonical.txt`; Shakespeare control: `resources/control/shakespeare_first300k.txt` (original source and Git object hashes documented in `resources/transcriptions/README.md`).

No recovered key, decrypted LP2 passage, or decoded message is claimed.
