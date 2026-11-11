# LP2 page 53: independently selected red passage, failed English inverses, and quotation test

**Current classification:** a confirmed physical colour-marked text interval, **two bounded negative candidate-key inversions**, and one bounded quotation-source exclusion, with original-ciphertext trials and independent controls. **No recovered LP2 plaintext or key.**

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

## Source-frozen twelve-word quotation search

The same image-locked 51-rune passage supplies twelve visible word lengths: **[5,4,4,11,2,3,2,6,5,5,2,2]**, unchanged by any rune-to-rune substitution. To test a distinct potential key-recovery input, the [dedicated twelve-word scanner](../sims/red51_source_phrase_crib.cjs) evaluates exact GP-rune word lengths for consecutive twelve-word excerpts from the **92 previously selected GITenberg philosophical, religious and mystical editions**, without searching ciphertext rune letters or choosing the books using this result. It tests the source's ordinary word order and complete reversal of word order (two declared orientations); the spelling transform is shared with the solved-page-calibrated literary word-length tool, including its documented contractions and spelling conventions.

The [original-source manual CI run 42829670577](https://github.com/FlareZ123/liber-primus/actions/runs/42829670577) downloaded **87/92** editions successfully and evaluated **15,105,946 source windows across both orientations**. No source window matched **10 or more** of the twelve lengths; in particular **zero fully matched all twelve**. The highest observed match count was **9/12**, reached in several different books and orientations. The five missing editions (GITenberg IDs 4095, 55201, 57145, 7297, 57292) returned HTTP 404, so no negative conclusion is drawn about their unavailable contents. A deterministic source-disjoint fabricated twelve-word positive was recovered at the exact planted offsets under both declared reading directions, validating the alignment and GP-length calculation.

This tests a **verbatim, word-order-preserving, length-preserving plaintext quotation** from those specific accessible editions. The result excludes that restricted crib-source hypothesis under the declared spelling conventions. It cannot exclude independently authored Cicada prose, different source editions or languages, word insertion/deletion, enciphered spaces, alternative GP digraph spelling, or text that has been significantly edited. No approximate nine-length match is promoted to a plaintext hypothesis because no rune-level key or reciphering evidence accompanies it.

## Source-selected upward-channel audit (Issue #77)

The only independent directional cue is the Tiwaz-shaped first red rune at the far right of the final black line. It is nevertheless part of the red span's first five-rune word, which crosses the line break; it is not a separate arrow token. The source line allocation is **[1, 24, 22, 4]** red runes, while the twelve printed word lengths are **[5,4,4,11,2,3,2,6,5,5,2,2]**. The layout does not specify a rectangular column grid.

The arrow's least-assumptive reading-order prediction is to read the red lines upward: reverse the four physical line groups, preserving left-to-right order within each group. With \`R = page53.indices[128:179]\`, split as [1,24,22,4], this produces:

\`URPNEAIAAJHRTHPDJNGOGFEOMCHDOTCPWEOSWBEOTHNHGJRIADIATHAIEOAEXLEOT\`

This is not a direct GP plaintext or readable terminal instruction. A columnar read would require inventing column alignment not present in the ragged source layout.

The arrow also makes the immediately adjacent black tail the only source-local 51-rune target with an exact length match. Let \`B = page53.indices[77:128]\` (the final 51 black runes) and \`R = page53.indices[128:179]\` (the 51 red runes). Align \`R[0]\` with \`B[50]\` at the boundary and move upward, so the key in black printed order is \`reverse(R)\`. The direct one-to-one GP29 additive pairing gives:

- \`P[i] = (B[i] - R[50-i]) mod 29\`: \`OOEAELEADEABOELWOFEOIADXOSHEOXOENGARDEDIAWOEINGLOENIEOXATNFPIRRTGTH\`
- \`P[i] = (B[i] + R[50-i]) mod 29\`: \`NGMROENYCCNUTIAFARWWLEOEOLUSJLTHEFOEMTHPFAETICECYJCPAEACEAUOC\`

Neither sign produces readable plaintext. This is a fixed 51:51 boundary test, not a cyclic-key or phase search.

As a separate fixed transfer control, apply the already recovered p56 consecutive-prime-totient stream from index zero to the same black tail read upward, with no additional F skip. The two signs produce \`BBMINCXDEYTHPEOUMOEENGYLCOPHYMWYEOYGAEHROEIMUHBOEMXOENSYTHGIEO\` and \`MNGIAOEFFBURARIACIAAIEAEPSRXOISTHGAEEYAMMEALEOGNGPUTHBFACJJDTHEO\`; neither is plaintext. This does not establish that p53 uses the p56 cipher, but it rules out this simplest frozen transfer.

The following p53 13-dot event terminates the red span. Page 54 begins a separate nine-rune red heading whose first rune Ac is enlarged; its own 13-dot event terminates that heading. Neither annotation nor layout instructs the solver to concatenate the two red spans or treat Ac as an arithmetic operator. The existing 51+9 red-stream test is already recorded in \`im-results/terminal-red60-signed2016-crib-gate.md\` and is negative.

## Decision-relevant conclusion

The red passage is a genuine, independently visible interval and remains a possible future clue or key-reset anchor. The source does **not** select a unique terminal operation: the Tiwaz-shaped rune is embedded in the first red word; the only unambiguous upward row-order read is not plaintext; the exact adjacent 51:51 additive pairing fails in both signs; and the simplest fixed p56 prime-totient transfer also fails. The p54 Ac is a heading initial, not an independently specified operator, and the 13-dot event separates rather than instructs concatenation.

Do not infer a 5×10, 3×17 or other reshape, add a new cipher family, or expand into shifts/anagrams without a further original-source instruction. The current evidence supports **no executable red-channel terminal decoder**. Preserve the source interval and these bounded negatives; do not promote short word hits or speculative parameterizations as plaintext.
