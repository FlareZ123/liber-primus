# Numbered LP2 passages 1–5: no reused additive pad at numbered starts

**Status:** source-motivated, 9-model, positive-controlled negative test. **No new LP2 plaintext or cipher mechanism.**

## Actual original-image segmentation

Original JPEGs \`53.jpg\`–\`55.jpg\` (rune-bearing LP2 pages **36–38**) show **five explicit red Arabic numerals, 1 through 5**, introducing distinct ciphertext passages. They provide an independent, preexisting segmentation rather than choosing block starts from promising cipher scores. The source transcription records the digit-plus-hyphen markers exactly. The complete numbered spans end at the next numbered marker, and item 5 ends at the printed \`&\` section delimiter.

| Original red numeral | Rune count | Transcript source |
|---:|---:|---|
| 1 | 139 | LP2 p36, after numeral 1 |
| 2 | 91 | LP2 p37, after numeral 2 |
| 3 | 98 | LP2 p37, after numeral 3 |
| 4 | 96 | LP2 p37 into p38 |
| 5 | 129 | LP2 p38, before original section separator |
| **Total** | **553** | Original image corpus |

This structure suggests a narrow, testable cipher: each numbered paragraph restarts a **shared additive mod-29 keystream**, possibly offset by its numeral, or applies a numeral-specific Caesar shift. It is testable without knowing the pad: aligned equal ciphertext runes should be enriched when the unknown pad cancels out.

## Finite nine-model test, calibrated selection

Evaluate the Cartesian product of:

- key start offset per item: **−(item−1), 0, or +(item−1)**;
- added Caesar shift per item: **−item, 0, or +item** modulo 29.

For each candidate, align pairs of positions that use the same implied key index, undo that model's numeral shift, and count exact symbol matches in all ten unordered pairs of the five numbered passages. There are **977 aligned comparisons** for zero key offset; adjacent numeral offset models have 966 or 968. Score each against uniform GP expectation \`n/29\` with standard-deviation normalization. No plaintext, unknown key characters, or free offsets are fitted.

| Observation | Result |
|---|---:|
| Unshifted, zero-offset model | 29 matches / 977 comparisons (z = **−0.8223**) |
| Highest of nine interpretations | **41/977** (key phase 0, Caesar shift −item; z = **1.2818**) |
| Independent page-preserving null trials | **3,000** |
| Null statistic | Maximum z across all nine variants, per rotation |
| Mean null maximum z | **1.5799** |
| 95th-percentile null maximum | **2.7666** |
| **Family-wise p for observed winner** | **0.6741** |

The null independently circularly rotates each **complete numbered paragraph**, retaining its rune composition and immediate-repetition pattern, and repeats the **entire nine-candidate selection** for every sample (fixed seed \`0x53193211\`). Thus the result correctly accounts for examining the numeral shift and starting-offset choices.

## Authentic English-rune positive controls

To establish that this key-cancellation idea could work, generate synthetic ciphertext for each of three separated models: plain reset, key offset −(item−1) plus Caesar −item, and key offset +(item−1) plus Caesar +item. Each control has:

- the five exact original ciphertext block lengths;
- an independently generated uniform shared key;
- plaintext runes sampled directly from the **authentic cleartext LP2 page 57, PARABLE** (95 GP runes, a very small but independent solved-language sample);
- 81% suppression of same-rune successive ciphertext outputs, matching the source's unusually low immediate doublet count in scale, without forcing exactly the source count.

For **40 seeded controls per true model**, all **120/120** selected scores exceed the real-data maximum z=1.2818. Mean fitted true-model z scores are about **5.65, 6.48, and 6.07**. The solved-page GP plaintext has estimated symbol collision probability **0.07258**, versus uniform \`1/29 = 0.03448\`. A pad reused at the same numbered positions should therefore create a sizable equality signal under the tested source-language register.

**Interpretation:** the five explicitly numbered original passages do **not** show evidence of a common additive GP pad restarted at each number, with the nine tested tiny numeral offsets and Caesar shifts. The controlled plants show that the detector would usually recognize **this strength of actual GP-like plaintext collision excess**. The test does not exclude a different key per item, more substantial item-dependent offsets, changing outer alphabet, nonlinear pad combination, non-GP plaintext, or cross-item editing/insertions. Since GP-English reference P57 is short, its estimated collision rate and synthetic power do not generalize automatically to all possible hidden content.

This test adds a **new segmentation-specific constraint** motivated by the original red numerals, rather than revisiting all-page or all-section common-key baselines.

## Reproduce

Run \`node sims/numbered_five_item_pad.cjs\` from the repository root with Node.js 22. It consumes only the pinned \`resources/liber-primus/lp2-transcription.txt\` and \`resources/liber-primus/lp2-corpus.json\`, locates all five literal numbered markers, checks block lengths and paragraph rune total, executes deterministic 3,000 circular-shift controls, and prints all nine model scores and all three planted-control families. There are no external packages or random parameters selected from observed scores.
