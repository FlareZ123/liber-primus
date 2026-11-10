# LP2 page 53: the 51-rune red passage and two constructive English decoders

**Current classification:** a confirmed physical colour-marked text interval and **two bounded negative candidate-key inversions**, with their original-ciphertext trials and independent positive controls. **No recovered LP2 plaintext or key.**

## Fixed original-image input

The original scan [`70.jpg`](../resources/liber-primus/70.jpg), SHA-256 `4ec7293ba72bd52384787646d204c8a68fefaf2d22673c40d27f23812d424548`, marks **51 consecutive GP runes red**. The conspicuous upward-arrow-shaped red character at the end of printed line 6 is actually the rune **ᛏ (T)**, starting the first red word; it is not an independent graphical arrow. The remaining red characters occupy the final three lines. The distribution across lines 6–9 is **[1,24,22,4]** rune glyphs.

The contiguous source interval is **LP2 physical page 53, local rune offsets [128,179)**, global manuscript rune offset **12,597**, last-section rune offset **2,957**. It comprises twelve complete cipher words of rune lengths **[5,4,4,11,2,3,2,6,5,5,2,2]**; the 11-rune fourth word is **ᚱᛡᛞᛡᚦᚪᛁᛇᚫᛉᛚ**. Independent source annotation: [`lp2-page53-red-span.json`](../resources/liber-primus/lp2-page53-red-span.json).

The colour boundary is absent from the plain rune-only transcription, and is a possible cipher-regime boundary. Neither the visible colour nor word-length pattern proves that it actually resets a cipher. The obsolete interpretation of a 50-rune passage preceded by an *extra* arrow is false and superseded.

## Candidate 1: additive repeating cipher, key inferred from the 11-rune word

[`red_verse_dictionary_anchor.cjs`](../sims/red_verse_dictionary_anchor.cjs) enumerates English lexicon candidates for the 11-rune word, using each to **fix an exact mod-29 key** of period 1–11. It also tests reversed/mirrored reading orders as four predeclared variants, atbash-flipped carrier and optional literal-F key skip. Every candidate key must decode the other eleven words without refitting those positions. A planted seven-rune key is exactly recovered, validating this concrete search family.

The corrected 51-rune input yields **6,718 accepted dictionary-constrained keys** in the strongest printed-order orientation. The best ranks an 11-rune lexicon word (`importantly`) and four of the *other* eleven words as dictionary hits, but **none of the non-anchor hits is at least three runes long**. It produces an unreadable output beginning `erwcng deeao eoreag importantly`, with only short chance words such as `the`, `to`, and `by`. Over **40** fixed-word-length, exact-rune-histogram, no-doublet shuffled controls, **7/40** attained at least the observed best score: upper-tail `8/41 = 0.19512`. No English-text signal or complete key was recovered.

[Successful original-data run 42758997681](https://github.com/FlareZ123/liber-primus/actions/runs/42758997681); [manual-only workflow](../.github/workflows/red-verse-dictionary-anchor.yml). The planted seven-rune key recovers the complete known synthetic plaintext and exact key, including the source's unchanged spelling-normalization conventions.

## Candidate 2: arbitrary bijective substitution plus optional per-word insertion

A complementary constructive algorithm, [`red_verse_substitution_csp.cjs`](../sims/red_verse_substitution_csp.cjs), tests whether one arbitrary, **globally fixed bijection of 29 GP rune labels** can turn the entire red passage into dictionary words. The mapping need not be additive or affine, so it covers a significantly broader alphabet-substitution family than Candidate 1. The decoder uses the repository's 29,060-entry GP-encoded English word-frequency lexicon and enumerates legal exact symbol-equality patterns.

**Without any insertion**, only **nine** dictionary words have the 11-rune anchor's exact repeated-letter signature. None of those nine permits at least one compatible dictionary word in *every* other position, even before enforcing consistency across all eleven remaining words. This is a finite, exact lexicon-supported contradiction for ordinary unchanged English words encrypted under a single bijective rune substitution. It says nothing about uncommon out-of-lexicon spellings.

**Allowing zero or one arbitrary extra ciphertext rune per word** makes the anchor much less restrictive: there are 448 candidate anchor/deletion representations, 423 of which each permit some other dictionary candidate at every individual word position. A **beam width 900** search for one globally consistent substitution map and source vocabulary produces complete 12-word candidate texts. The top real original-source candidate is incoherent: `amid wie beat superficial i ut s empty thigh noah s m`, at log score **−108.56252** (defined by word-frequency priors and explicit single-insertion costs). It uses an inserted-rune deletion in all twelve words; this is an instrument-selected explanation rather than evidence of actual padding.

A model-matched positive control plants a global random 29-rune permutation over a length-matched twelve-dictionary-word sentence with independently inserted dummy runes. The beam's highest-scoring output recovers **11 of 12 source words** (the sixth source word `sea` is replaced with `by`), establishing partial constructive decoding power, though *full* exact recovery is not achieved at width 900.

In **100** independent shuffled-red-rune controls retaining all 51 rune labels' counts, the twelve visible lengths and **zero adjacent repeated runes**, 76 allow a complete dictionary reading under the same instrument. The real best score **−108.56252** is lower than the null median **−106.54124**, with empirical upper-tail **58/101 = 0.57426**. Thus the flexible one-extra-rune substitution model can hallucinate full dictionary readings on random-looking text and supplies no predictive evidence for the actual manuscript.

[Successful 100-null manual run 42763544993](https://github.com/FlareZ123/liber-primus/actions/runs/42763544993); [manual-only workflow](../.github/workflows/red-verse-substitution-csp.yml). The source code prints every candidate mapping, its per-word insertion position and reproducible seed, alongside selected control metrics. The zero/one insertion decoder is a **heuristic beam**, so its negative signal is bounded by its observed control power rather than proving impossibility of all padded substitutions.

## Decision-relevant conclusion

The red passage is a genuine *independently visible interval* worth retaining as a future key-reset or clue anchor. Two distinct straightforward inversion mechanisms, including the arbitrary page-local output-label permutation model, have failed to read it as continuous ordinary-English GP text. A viable proposed decryption must supply **new source-constrained key material or a concrete reversible transform** that predicts unfitted runes; merely finding words after trying a flexible key or insertion policy does not count.

The GP spellings, colour boundaries, lexicon source, source text and readout order are fully specified in the linked scripts and resource annotations. Do not repeat the earlier 50-rune scan or promote short word hits from this passage as recovered plaintext.
