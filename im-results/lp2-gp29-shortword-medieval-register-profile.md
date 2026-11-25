# GP29 two-rune word-frequency comparison across medieval controls

**Agent44, 25 November 2026. Classification: intermediate descriptive result. No unknown plaintext, key or language identification.**

## Question and preregistration

The post-hoc Round45 W1 observation is that LP2 has 448 two-rune printed groups among 2,896 groups (15.4696%). This comparison asks whether the same fraction occurs naturally in already-pinned non-English source registers, especially Old English given the GP29 alphabet. The full pre-registration is [here](../workplace/agent44-20261125-shortword-register-prereg.md); it fixed the four source controls, R-A GP29 normalization, sole statistic and descriptive-only interpretation before the outputs were inspected.

## Method

- LP2: first 55 physical pages in resources/lp2-transcription.txt, using the same source-native segmentation convention as sims/lp2_nonenglish_register_bounds_sft.cjs; asserted 12,956 runes and 2,896 groups.
- Old English: corrected source-native Beowulf profile, 10,885 GP29 words.
- Old Norse: pinned Hávamál source, normalized and encoded with the exact reversible mapping in the existing non-English register SFT.
- Middle Welsh: pinned Pwyll source, normalized and encoded with that same mapping.
- Latin: word-preserving GP29 Vulgate excerpts already encoded in resources/control/latin-vulgate-gp-wholewords.txt (39,835 words across eight pinned sections: Luke, John, Acts and Romans).
- Primary statistic: f2 = fraction of words whose GP29 encoding has exactly two runes. For each source longer than 2,896 words, every overlapping contiguous 2,896-word window is summarized. Overlapping windows are descriptive and are not independent; no p-value is computed.

## Results

| Source | Words | 2-rune words | f2 | 2,896-word windows: min / p05 / median / p95 / max |
|---|---:|---:|---:|---:|
| LP2 first 55 | 2,896 | 448 | 15.4696% | 15.4696% (single full sample) |
| Old English Beowulf | 10,885 | 1,453 | 13.3486% | 12.4309 / 12.6036 / 13.1906 / 14.2610 / 14.5028% |
| Old Norse Hávamál | 3,588 | 846 | 23.5786% | 22.8936 / 22.9972 / 23.7914 / 24.0331 / 24.1367% |
| Middle Welsh Pwyll | 7,847 | 1,529 | 19.4852% | 17.5069 / 17.6450 / 18.5083 / 20.8218 / 21.0635% |
| Latin Vulgate excerpts | 39,835 | 6,869 | 17.2436% | 12.9144 / 13.6395 / 17.6450 / 19.0608 / 19.9240% |

## Interpretation

- The selected Beowulf edition does **not** reproduce LP2's 15.47% rate: even its maximum overlapping 2,896-word window is 14.50%. This is a descriptive mismatch for this source and this orthographic convention, not an exclusion of Old English generally.
- Hávamál and Pwyll have substantially higher two-rune rates than LP2 in this encoding.
- The Latin Vulgate excerpts do contain many 2,896-word windows spanning LP2's 15.47% rate. This is compatibility only; the broad window range and overlap make it a weak discriminator, and Latin was one of four pre-existing controls rather than an independently selected plaintext.
- The low two-rune rate therefore does **not** point uniquely to Old English. Among these controls, it is most compatible with the broad Latin window distribution, but that is a post-hoc, single-statistic observation and does not justify a Latin plaintext hypothesis.
- Most importantly, the comparison assumes the printed groups are meaningful word units (H-shuffle). Under H-decoy, the word-length histogram is not the plaintext's word-length distribution and this language comparison is irrelevant. Round45 W1 does not decide between H-shuffle and H-decoy.

**Decision:** retain as an intermediate descriptive constraint only. Do not expand into further language, orthography or source-text sweeps without an independent original clue selecting the register. The result does not change the established cipher mechanism, does not recover plaintext, and does not supply a key.

## Reproduction

Run from the repository root:

    node sims/lp2_gp29_shortword_register_profile_sft.cjs

The script asserts the source word counts and exact two-rune counts above. Its normalization for Welsh and Norse is copied exactly from the already-existing, source-documented non-English register SFT; no new transliteration rules were introduced.
