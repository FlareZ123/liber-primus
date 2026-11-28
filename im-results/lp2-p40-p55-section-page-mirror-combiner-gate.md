# P40–p55 mirrored-section page-pair mod29 combiner gate

**Agent40, 28 November 2026. Classification: source-selected bounded negative.** The exact p40–p55 outer-frame run and its bilateral artwork select horizontal reflection as a section-level visual operation. Before adding a new key or target-conditioned offset, the cheapest page-scale consequence is to pair pages symmetrically across the 16-page section and ask whether direct GP29 sum/difference reveals language. It does not.

## Frozen page pairing

The section contains exactly p40..p55, so page reflection around the section center fixes:

```text
p40 ↔ p55
p41 ↔ p54
p42 ↔ p53
p43 ↔ p52
p44 ↔ p51
p45 ↔ p50
p46 ↔ p49
p47 ↔ p48
```

This pairing is fixed by section membership alone. No ciphertext score chooses a partner.

P50 is the numeric panel and has no GP rune stream in the canonical corpus, so p45↔p50 is a typed mismatch for a direct rune combiner. The finite GP-rune test therefore contains the other seven mirror pairs.

## Predeclared operation family

For every pair, charge only:

- partner in printed order or reversed rune order;
- prefix-to-prefix or suffix-to-suffix overlap, with overlap length equal to the shorter page;
- `A-B`, `B-A`, or `A+B` modulo29.

That is 12 variants per valid pair. There is **no** offset search, Caesar shift, affine map, key, punctuation-conditioned skip, word-boundary fitting, or post-output retuning.

Language score is the mean smoothed GP29 trigram log probability trained only on the repository's independent Shakespeare, Gibran and Emerson control texts, encoded by the same canonical GP mapping. For a matched null, apply the identical 12-variant family to **every** valid pair among p40..p55 and retain each pair's maximum score. Excluding p50 leaves 15 rune pages, hence 105 valid page pairs: 7 mirror pairs and 98 non-mirror controls.

## Result

Higher score is more English-like. The seven mirror-pair maxima rank among all 105 pair maxima as:

```text
p44↔p51   rank 18   -12.8692384
p46↔p49   rank 20   -12.8943677
p42↔p53   rank 52   -13.1644345
p40↔p55   rank 60   -13.1899756
p41↔p54   rank 69   -13.2236200
p43↔p52   rank 82   -13.2884907
p47↔p48   rank 97   -13.3552767
```

The mirror family is not enriched relative to non-mirror pairs:

- mirror mean best score: **-13.14077194**;
- non-mirror mean best score: **-13.09343660**;
- mirror median: **-13.18997556**;
- non-mirror median: **-13.16206262**;
- pairwise mirror-vs-control wins: **316/686 = 0.4606414**.

The strongest mirror output is p44↔p51, printed orientation, suffix aligned, `A-B`, 92 runes. Its transliteration begins:

```text
IDRLOSEADSJHAEWIMMAOGTHIHHSNXWHENGEOOSIAGFOENGJJLYEANE...
```

It is not plaintext, and even this best mirror candidate is only rank18. The globally strongest pair is non-mirror p45/p49 (rank1, score -12.1546827), so the ranking itself supplies a direct matched control against treating a mildly high mirror score as special.

## Decision

The p40–p55 artwork does **not** license a uniform page-pair additive cipher of the simplest historically plausible GP29 kind. Retire direct mirrored-page `±` combination under these fixed endpoint/orientation choices.

This negative does not weaken the exact outer-frame census or the table-local horizontal reflection once p50 is independently selected. In fact p45↔p50's type mismatch is consistent with the already-supported **operation-switch** interpretation: the section contains heterogeneous objects and the p50 numeric panel requires a typed table consumer rather than a uniform rune/rune page combiner.

Stateful ciphers, independently typed page-local keys, and the existing cell43 table handoff remain open. Do not broaden this negative to arbitrary mirror-based mechanisms.

## Reproduction

`sims/lp2_p40_p55_section_page_mirror_combiner_sft.cjs` reconstructs the seven rune/rune mirror pairs, the exact finite family, the control-text trigram model, every one of the 105 pair maxima, ranks, and the 316/686 matched-control comparison.
