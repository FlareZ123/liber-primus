# LP2 full-source rune assignment audit

**Status:** complete for ordinary black-text position assignment; red spans and the p39 enlarged line remain separately unresolved. This is a transcription/source-image audit, not a decipherment.

## Scope and inputs

The audit covers the 55 rune-bearing unsolved pages (LP2 p0–49 and p51–55): **594 printed lines and 12,956 canonical rune positions**. Page 43 supplies 274 training glyphs; the remaining **12,682 positions are held out**. Solved pages 56–57 provide source-known controls. Inputs are the original JPEGs in `resources/liber-primus/`, `resources/lp2-transcription.txt`, `resources/liber-primus/lp2-corpus.json`, `resources/liber-primus/lp2-ink-annotations.json`, and `resources/external/Liber Primus 57.txt`.

## Method

The reproducer detects printed rows from grayscale projection, registers image rows to transcription lines with a monotone dynamic program using line rune counts, segments glyph components, and assigns them using a 29-class nearest-template model trained on p43. Templates use a 100×100 top-left canvas and BOX resize to 50×50. An independent HOG/SVM feature family is also tested. **No language scoring or word-level correction is used.**

The method parameters and all per-position boxes/predictions are preserved in the JSON result. The line registration is count-based; it does not independently infer line order from text content.

### Source-visible segmentation repairs

The previous script defined manual splits under 3-tuple keys but looked them up with 2-tuples, so none of those splits had actually been applied. The lookup contract is now corrected. Three undercounted rows are resolved using visible component valleys:

- p2 line 0, component 9: split at 47 and 86 after trimming the upper 33 px occupied by the overlapping infinity illustration; expected glyphs `ᚻᛒᛗ`.
- p20 line 9, component 13: split at 50; expected `ᚳᛒ`.
- p25 line 9, component 18: split at 50; expected `ᚳᚦ`.

These recover the four joined glyph positions in the three formerly undercounted rows. The corrected run has **zero unresolved expected positions and zero unmapped observed components**. The report also corrects an undefined held-out metric and counts unresolved positions from the full expected-position total rather than only the explicit undercount field.

## Results

| Measure | Result |
|---|---:|
| Expected positions | 12,956 |
| Position-aligned classifications, including p43 | 12,956 / 12,956 |
| Held-out classifications | 12,682 / 12,682 |
| Unresolved expected positions | 0 |
| Unmapped observed components | 0 |
| Nearest-p43-template disagreements | 83 |
| Disagreements in annotated red spans | 79 |
| Disagreements on the p39 special enlarged black line | 4 |
| Red-span first-glyph mismatches | 13 |

The 83 disagreements are not ordinary black-text transcription corrections. The 79 red-span disagreements are inside the 213 annotated red positions. The four black disagreements are all on p39 line 5, a five-glyph enlarged line immediately before a three-rune red span and red 13-dot punctuation. Manual inspection of the original crop supports the existing `MSWOH` reading; it remains explicitly marked as a special-form exception rather than being silently accepted or corrected.

Among the 11,891 held-out positions on lines with exact observed component counts and no skipped components, 11,881 match the p43 nearest-template prediction; the 10 disagreements are all red-span positions. No disagreement surfaced in ordinary black text.

## Solved-page controls and the red-ink limitation

The solved p56/p57 controls contain 168 black positions and 12 red positions:

- p43 nearest templates: **168/168 black**, **0/12 red**.
- HOG/SVM: **164/168 black**, **0/12 red**.
- All 29 rune classes occur across the combined solved controls; the 12 red controls cover 10 classes.

The first visual lines of p56/p57 are mixed lines containing known red GP rune spans (5 and 7 runes) alongside black text; they are not Latin titles. Their red positions are now identified from the source ink annotations and retained separately.

A red-only nearest-template experiment trained on those 12 solved red glyphs has duplicate-class leave-one-out accuracy **1/4**. On unknown red positions whose expected class is represented among those controls, it agrees at only **3/59** positions. This is too weak to validate or correct the red transcription. The red glyphs are a distinct visual domain for these simple classifiers; the 79 red mismatches must not be interpreted as 79 transcription errors. All 213 red positions, their source boxes, expected runes, and model predictions are retained in the JSON for an image-first follow-up.

## Registration ambiguity

The monotone row-to-line dynamic program has tied optimal mappings on pages **2, 7, 14, 22, 32, 49, 53, and 55** (respectively 2, 3, 2, 3, 3, 11, 2, and 2 optimal paths). The selected mappings are recorded in the JSON. Thus the 12,956 classifications are complete under the selected count-based registration, but these eight pages still need independent visual line-registration adjudication before making fine-grained line-local claims. Page 53 is especially relevant because its red span contains 51 runes.

## Conclusion and next decision

The canonical ordinary black-text rune assignments survive this full-position pixel audit: **no ordinary black-text correction is indicated**. The audit does not establish that all red glyphs are correctly transcribed, nor does it validate the eight tied line mappings. The p39 enlarged line is separately flagged. No plaintext, key, cipher operation, or destination is recovered.

A useful successor is an image-first adjudication of the 213 red positions, together with resolution of the eight tied row mappings—prioritizing p53's 51-rune red span. Repeating the same black-template or red-template screens would add little.

## Reproduction

- Script: `sims/lp2_full_source_rune_assignment_audit.py`
- Workflow: `.github/workflows/lp2-full-source-rune-assignment-audit.yml`
- Machine-readable report: `im-results/lp2-full-source-rune-assignment-audit.json`
- Successful reproducible run: [GitHub Actions 43084632576](https://github.com/FlareZ123/liber-primus/actions/runs/43084632576)
- Issue: [#251](https://github.com/FlareZ123/liber-primus/issues/251)
