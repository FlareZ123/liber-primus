# Original LP2 word-length register and repeat-marker decision

**13 November 2026, Agent31 source census with Agent14 p55 all-secret follow-up:** the original word lengths are closer to a Latin26 register than to the conventional contracted GP29 register in four tested control texts. The initial stationary **Latin K repeat-marker** candidate has now failed a targeted short-word predictive diagnostic, though the finite corpus and author-style assumptions prevent a universal exclusion. An independently motivated **one-based GP29 cumulative sum** gives a similarly rare repeat-marker candidate (EA) but its direct inverse does not recover English. No key, unknown plaintext, complete cipher or continuation is recovered.

## Original-source constraints, unchanged

The canonical `resources/lp2-transcription.txt` parser joins page-continuation words and excludes runeless p50: **12,956 original unknown runes**, **2,896 printed words**, **86 adjacent equal-rune events within physical pages**, affecting **85 words**. The word-length histogram for lengths 1–14 is `[83,448,720,513,317,256,216,156,78,52,32,18,4,3]`; mean 4.473756906. Of the 86 repeats, 21 are in words with at least eight runes and 23 begin a printed word. One original twelve-rune word on p27 contains two separate repeats at zero-based positions 5 and 11. Four of the 448 two-rune words have repeat events, **three at their first rune and one at their second**. Page-initial runes are explicitly censored as having no preceding original cipher rune.

Under `D_KL(original printed word-length distribution || reference distribution)`, the independent corpus comparison gives:

| Reference | Latin mean | GP29 mean | KL Latin | KL contracted GP29 |
| --- | ---: | ---: | ---: | ---: |
| Gibran, *The Prophet* | 4.228119 | 4.011568 | 0.0151343 | 0.0357228 |
| Shakespeare | 4.141137 | 3.948960 | 0.0371898 | 0.0408087 |
| Emerson, *Essays* | 4.367577 | 4.165555 | 0.0117786 | 0.0427927 |
| Editor-normalized solved Cicada LP1/LP2 | 4.276571 | 4.068571 | 0.0358001 | 0.0473153 |

Here Latin length is the letter count before runic contraction. This empirical proximity is compatible with Latin-letter plaintext **only if** printed word boundaries and lengths survive encipherment. It is not a source clue selecting a 26-letter alphabet; control style and spelling can affect divergences.

## Exact original repeat-mask diagnostic: Latin K and native GP alternatives

A complete but hypothetical 26-to-29 changing-state injection can encode plaintext K as a repeated previous ciphertext rune, with the other 25 letters selecting 25 distinct outcomes among the 28 nonrepeating rune options. It is reversible given the authentic changing state/injection, which remains entirely unknown. K was selected retrospectively from 26 candidate Latin letters because its **expected** total/long-word/initial repeat counts were closest to observed in each of four references. Those expected triples were Gibran [102.109, 14.237, 15.428], Shakespeare [98.844, 14.584, 23.611], Emerson [77.832, 8.746, 12.910] and solved Cicada [74.077, 9.516, 31.199], versus observed [86, 21, 23]. This is exploratory model fitting.

The stronger test preserves **every original word's exact length, word boundary, repeat and nonrepeat positions**, with page-first inputs censored. An independent historical-English frequency lexicon (`resources/control/english_wordfreq_textblob.txt`; 29,144 alphabetic entries of length at most 16) was consulted without adapting the tested ciphertext. The exact candidate-word mask counts are:

| Marker interpretation | Original event-bearing words matched by at least one dictionary word | First-symbol marker frequency in reference two-symbol words | Observed first-symbol events across 448 source two-rune words | Binomial tail for at least three |
| --- | ---: | ---: | ---: | ---: |
| Latin K | **84/85** | **11/190,784** | 3 | **2.799×10⁻⁶** |
| Source-calibrated GP29 EA (ᛠ, ordinal 28) | **80/85** | **103/271,902** | 3 | **7.134×10⁻⁴** |
| Source-calibrated GP29 IO (ᛡ, ordinal 27) | **80/85** | **1/271,902** | 3 | **7.396×10⁻¹⁰** |

The 29-rune encoding uses the **actual source-attested ING/IO spelling** from `results/lp1-source-orthography.md`, not the old inventory-only encoder. Candidate K's single still-unmatched **p27 twelve-rune** repeated mask is `000001000001`: any ordinary Latin word would need K at positions 5 and 11, no other Ks, with no such spelling in the pinned lexicon. The earlier 12,261-entry three-literary-corpus union failed K in 7/85 masks, so the expanded frequency lexicon materially weakens that broad incompatibility while **strengthening the rare two-letter-initial positional conflict**. TextBlob has rare K-initial two-letter spellings `KA`, `KE`, `KM`, `KU` with aggregate weight just 11 across 190,784 two-letter tokens. GP EA's eligible two-rune initials include `EAR`, `EAT`, `EAU` after contraction.

**Inference and calibration limits:** These binomial tails assume 448 independent length-matched words with reference two-letter frequencies and preselected marker identity. Author-specific vocabulary, dependent words, a different input register, postselection across alphabets and state-dependent repeat behavior can alter them. They are strong reasons against a plain **stationary** Latin-K marker interpretation, not proof against all repeat-escape ciphers or unusual prose. Exact lexicon coverage is a **finite-dictionary diagnostic**; unknown source words may lie outside it.

## Direct one-based GP29 running-sum route

The original Gematria Primus has 29 symbols. The natural source-alphabet operation `C[i] = C[i-1] + (P[i]+1) mod 29` makes ciphertext equality correspond exactly to the last plaintext rune **EA (ordinal 28, one-based value 29)**. This is a concrete reversible, independently motivated *operation*, without an authenticated instruction to apply it. On the untouched 55 source rune-bearing pages, discarding each page's initial ciphertext rune, `P[i]=(C[i]-C[i-1]-1) mod29` yields **12,901 runes**, exactly **86 EA** instances and frequencies **401–510 for each of the other 28 runes**, with decoded coincidence index **0.035325030389447606**. Native calibrated English controls have strongly uneven rune frequencies (for example, the pooled three-literary-source IoC is ~0.06034). The original inverse output remains nearly uniform, without a coherent plaintext passage. A nine-rune positive plant re-encrypts and decrypts exactly; this establishes only arithmetic correctness.

Consequently, the straightforward one-based cumulative-sum model is **negative on original plaintext evidence**, and a generic changing secret mapping would require an independently supplied state/key. Its zero-step EA hypothesis predicts unusual two-letter starts and at least five event masks absent from the pinned lexicon; neither observation authorizes parameter searches.

## Independent predecessor-relative rank capacity gate (Agent24 follow-up)

The preceding repeat-marker model treats the previous ciphertext rune as a state and the next nonrepeat rune as one of **28 possible successors**. A fixed map from the 25 ordinary Latin letters to those 28 successors would need to use no more than 25 distinct successor ranks. Test the correct rank—not the absolute emitted rune—by removing the previous ciphertext rune from the ordered GP29 alphabet:

`rank_i = C_i - 1[C_i > C_{i-1}]`

with zero-based indices and only nonrepeat transitions. This gives **12,815** eligible original positions. They use **all 28 ranks** over the whole book and in each of the nine visual chapters. **54/55** rune-bearing physical pages use more than 25 ranks (52 use all 28; p22 and p49 use 27; p55 uses 24). Thus a **stationary 25-letter→28-successor-rank substitution is impossible** globally, chapter by chapter, and on 54/55 pages.

This is an exact cardinality result, not an English-language score. It supersedes any argument based only on the number of absolute ciphertext rune values, which is not the relevant output alphabet once the predecessor is removed. It does **not** exclude a rank assignment that changes within a word, line or page, nor a different plaintext register; no original source currently selects such an update rule. The calculation and assertions are included in the current `sims/lp2_latin26_wordlength_repeat_marker_sft.cjs` (Agent24 commit `877ab40a59db5f085a9583867da5be1dfdbfcfc9`), and the overall `results/README.md` records the same bound.

## Research decision and reproduction

The last page-local stationary 25→28 rank exception **p55** was subsequently source-gated in [the source-exact word-shape study](lp2-p55-latin-predecessor-rank-wordshape-gate.md): its seventh word has 11 different rank classes in 13 positions, a full-equality pattern absent from four native English controls and a 1,578-word thirteen-letter dictionary, and zero of 400,000 matched-length native English plants replicates the original p55 frequency constraints. The short p55 rank occupancy itself has probability approximately 0.095 under an iid uniform-rank null. Thus the narrow remaining stationary page exception is **not a viable ordinary-English solution route** in these controls. Word-dependent or state-varying schemes remain untested.


**Retire unsourced stationary Latin-K marker key hunting and direct one-based GP29 summation** as immediate solution routes. A stronger exact [all-secret previous-ciphertext-state capacity theorem](lp2-firstorder-cipherstate-alphabet-capacity.md) now excludes every complete book-global first-order 26→29 secret row codebook against the 94 pinned Latin26 control windows, and excludes even nine visual-chapter-specific or eight-phase complete GP29 row codebooks against all 88 source-native English controls. Unlike the postselected K-marker diagnostic, this theorem does not select a secret marker or need to search row assignments. The original word-length proximity remains a useful clue that a plaintext register may differ from the usual contracted GP29. An author-selected alphabet, repeat/exception rule and evolving key remain necessary before a keyed inverse has evidential force. Another design should yield unknown plaintext outside any interval used to select the model.

Full assertions, original-input parser, independent TextBlob frequency data, positive arithmetic plant and numerical counts: `sims/lp2_latin26_wordlength_repeat_marker_sft.cjs`. The original reference controls also remain pinned to Shakespeare, Gibran, Emerson and solved Cicada. This is a finite conditional exclusion, and no recovered LP2 plaintext is claimed.
