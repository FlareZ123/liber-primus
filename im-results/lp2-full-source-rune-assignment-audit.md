# LP2 full-source rune assignment audit

**Status:** complete for ordinary black-text position assignment. The p39 short-line glyph variants have now been resolved by matched original-pixel controls; earlier red-span recognition errors were independently adjudicated. This is a transcription/source-image audit, not a decipherment.

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

**Native red registration correction (11 November 2026):** 68 of the 79 raw red mismatch flags arise from seven one-position displaced glyph assignments where an oversized first rune was dropped and a 13-dot terminal mark was included as I. The following 62 ordinary red glyph predictions align exactly with the *next* source label, 62/62; the source JPEGs independently show the missed initial rune. The [original-image adjudication](lp2-red-rune-image-adjudication.md) further identifies a p0 two-glyph merge causing five additional flags and six ornate red initials causing the last six black-template errors. All 79 raw red flags are thus source-accounted without a canonical rune correction; the p53 51-position reading is unchanged, with 40/40 within-red repeated-class matches. Keep the raw 79 count as a model diagnostic, not a tally of questionable source glyphs.

The 83 disagreements are not ordinary black-text transcription corrections. The 79 red-span disagreements are inside the 213 annotated red positions. The four black disagreements are all on **physical p39 line 5**, a five-rune final line with source glyphs `ᛗᛋᚹᛟᚻ`, GP transliteration **M S W OE H** (the earlier abbreviation `MSWOH` omitted that OE is one GP rune). Original-image matched-component analysis now proves that **all five forms are ordinary printed glyphs** in the same font and size as their neighbors. The previous four OCR errors are template-model exceptions rather than four physically exceptional source symbols. Their five shapes and source positions are separately pinned in the [same-image decision SFT](../sims/lp2_p39_fiveglyph_typography_sft.py). The three widely spaced black dots to the right are source-visible punctuation, a separate motif from the five ordinary rune bodies.

Among the 11,891 held-out positions on lines with exact observed component counts and no skipped components, 11,881 match the p43 nearest-template prediction; the 10 disagreements are all red-span positions. No disagreement surfaced in ordinary black text.


### P39 short line: original-image resolution of the four supposed enlarged glyphs

**Issue #599; 12 November 2026.** The earlier p43-trained 29-class OCR made four mistakes in a *single* five-rune printed line at physical p39 line 5. The original p39 image is archive `56.jpg`, SHA-256 `d1b7ea5a6ffb79709753e3565d1d46e05edbe3d82ca70c3ed6065d46b131bd00`. The five printed runes are **M S W OE H**, each exactly one canonical GP symbol. All five are printed from the same ordinary font as p39's other prose. A `RGB<160` black component mask over a fixed small p39 prose-region control set yields **212 ordinary black-glyph components** above the font-size thresholds; their median glyph height is **114 px**. The five disputed line glyphs measure **[113, 115, 114, 115, 115] px**. The alleged enlargement was an image-model interpretation, not a typography fact.

For the five positions respectively, source component rectangles `(x,y,w,h)` are `(601,1616,52,113)`, `(660,1614,35,115)`, `(699,1615,35,114)`, `(737,1614,44,115)`, `(787,1614,43,115)`. Each has a **near-identical counterpart on a separate ordinary text line of the same original scan**: `(1316,1239,52,113)`, `(1317,2422,35,115)`, `(1432,1238,35,114)`, `(1169,2046,44,115)`, `(1682,2046,43,115)`. After resizing the cropped black masks to 64×64, their five mean-absolute grayscale silhouette differences are **[0.00661058, 0, 0.00573308, 0.02759696, 0.00779828]** on the 0–1 ink scale. Every independently chosen different-glyph counterpart is worse (**0.204–0.520**), and each matching glyph is at the nearest ordinary distance within this 212-element control set. Each match reproduces the source letterform independently of the OCR model.

The horizontal three-dot black ornament on this p39 line and the following enlarged red initial remain separate source-visible layout features. They do not turn the five ordinary ink forms into a four-symbol hidden alphabet, order the *four OCR errors*, or supply a source-selected key/operation. There is **no new original plaintext or side-channel**. The canonical transcription requires no correction. The source-gated hypothesis of four visibly exceptional glyphs is retired. [Complete original-pixel SFT](../sims/lp2_p39_fiveglyph_typography_sft.py) · [passing original-image GitHub Actions regression](https://github.com/FlareZ123/liber-primus/actions/runs/43259668215).

## Solved-page controls and the red-ink limitation

**Original-source control correction (11 November 2026):** The 0/12 raw red-control figure below is a detector-registration artifact. Original p56 and p57 start with oversized red initials omitted by the detector, while a 13-dot punctuation fragment becomes a final I; the ten real ordinary glyph predictions align with the source at offset +1 (**10/10**). The earlier red-only 12-sample classifier trained on incorrect labels, invalidating its 1/4 duplicate-class and 3/59 covered-unknown figures as evidence of a distinct red alphabet. Re-training from the ten correctly labeled solved samples gives eight GP classes and **40/41** correct original unknown red glyph classifications from eleven pages, p53 **11/11**. Only p15:14 B is nearest R because of native image proportions; the source glyph is visually B and black-template prediction agrees. [Reproducer](../sims/lp2_red_solved_control_alignment_sft.py) and [reconciled source analysis](lp2-red-rune-image-adjudication.md). The raw counters are historical outputs retained verbatim below.

The solved p56/p57 controls contain 168 black positions and 12 red positions:

- p43 nearest templates: **168/168 black**, **0/12 red**.
- HOG/SVM: **164/168 black**, **0/12 red**.
- All 29 rune classes occur across the combined solved controls; the 12 red controls cover 10 classes.

The first visual lines of p56/p57 are mixed lines containing known red GP rune spans (5 and 7 runes) alongside black text; they are not Latin titles. Their red positions are now identified from the source ink annotations and retained separately.

A red-only nearest-template experiment trained on those 12 solved red glyphs has duplicate-class leave-one-out accuracy **1/4**. On unknown red positions whose expected class is represented among those controls, it agrees at only **3/59** positions. This is too weak to validate or correct the red transcription. The red glyphs are a distinct visual domain for these simple classifiers; the 79 raw red mismatches must not be interpreted as 79 transcription errors. Sixty-eight are demonstrably misregistered, leaving eleven flags for focused source inspection. All 213 red positions, their source boxes, expected runes, and model predictions are retained in the JSON for an image-first follow-up.

## Eight apparent registration ties resolved by original images

**Agent32, 11 November 2026; Director #332.** The eight previously reported "tied optimal mappings" are **multiple skip-operation histories for one uniquely determined physical image-row registration**. The original pixel audit's dynamic program counts the same row assignment more than once because surplus illustration/table rows occur *after* the final original rune line. Each can be charged either to a `skip` transition or to the terminal remaining-row penalty. The number of reported ties is therefore `detected rows − original text lines + 1` on every implicated page.

An independent exhaustive reconstruction of all minimum-cost monotone image-row assignments, retaining only distinct complete mappings, gives **exactly one unique mapping for every page**. In every case zero-based printed text line `j` maps to zero-based detected image row `j`; all extras are original image features below the last text row.

| LP2 page / original JPEG | Original rune lines | Detected peaks | Earlier skip-path count | Distinct optimum mappings | Trailing peak row indices, original visual cause |
| --- | ---: | ---: | ---: | ---: | --- |
| p2 / 19.jpg | 9 | 10 | 2 | **1** | 9, insect |
| p7 / 24.jpg | 10 | 12 | 3 | **1** | 10–11, black dots |
| p14 / 31.jpg | 7 | 8 | 2 | **1** | 7, flying insect |
| p22 / 39.jpg | 6 | 8 | 3 | **1** | 6–7, illustrated staff |
| p32 / 49.jpg | 6 | 8 | 3 | **1** | 6–7, blurred tree |
| p49 / 66.jpg | 3 | 13 | 11 | **1** | 3–12, ten numerical-table lines |
| p53 / 70.jpg | 9 | 10 | 2 | **1** | 9, butterfly |
| p55 / 72.jpg | 4 | 5 | 2 | **1** | 4, butterfly |

The proof reads the native original JPEGs, measures their printed row centers and glyph-component counts under the *previously frozen* image thresholds, parses the unchanged 594-line canonical physical transcription, and independently enumerates every minimum-cost skip/match registration, deduplicating by its complete matched-row sequence. No language score, rune template classifier, cipher hypothesis or ciphertext-derived phase selects a row. The source-only [standalone verifier](../sims/lp2_eight_page_line_registration_uniqueness_sft.py) gives original image Y coordinates and the exact extra-peak component counts for all eight, and asserts all eight unique matchings.

**Interpretation of existing machine-readable JSON:** `mapping_ways` was a count of equivalent dynamic-program paths, not genuinely distinct image-to-transcript mappings. Its chosen `skipped_rows` arrays are correct and entirely terminal. The image-original line map, all 12,956 GP rune positions, word separators, page carries and original red-span offsets remain unchanged.

## Conclusion and next decision

The canonical ordinary black-text rune assignments survive the complete image audit: **no ordinary black-text correction is indicated**. All eight previously described line-registration "ambiguities" are now settled as unique source mappings; this removes a transcription-clock uncertainty without claiming a decryption. The 213 red rune identities, including the terminal p53 51-rune passage, remain subject to separate image-first review in Director #331. The p39 short final black line is ordinary typography; its four historical classifier flags are retained only as a machine-model diagnostic, as documented below.

No original LP2 unknown plaintext, key, decoding operation or destination was recovered. Future source-image work should target unresolved red forms rather than rescan these eight now-unambiguous row registrations.

## Reproduction

- Script: `sims/lp2_full_source_rune_assignment_audit.py`
- Workflow: `.github/workflows/lp2-full-source-rune-assignment-audit.yml`
- Machine-readable report: `im-results/lp2-full-source-rune-assignment-audit.json`
- Successful reproducible run: [GitHub Actions 43084632576](https://github.com/FlareZ123/liber-primus/actions/runs/43084632576)
- Issue: [#251](https://github.com/FlareZ123/liber-primus/issues/251)
