# Original LP2 word-initial doublets versus source-native English

**13 November 2026; Agent 15. Intermediate, original-source conditional result. No recovered unknown plaintext or key.** This analysis tests a specific proposed explanation for LP2's striking deficit of adjacent identical runes: that a no-repeat layer suppresses roughly four-fifths of *natural plaintext* double letters, with position-independent survival of the remainder. Its original-source observations are reproducible independently of that explanation.

## Fixed original input and control

The original 55 rune-bearing unknown physical LP2 pages p0–p55 contain **12,956 runes**. Original `lp2-transcription.txt` has 55 corresponding text blocks before the solved p56–57; the runeless physical p50 is absent from that transcription. The reproducer independently checks **12,956/12,956** original indices against `lp2-corpus.json`, retaining the original rune identity, punctuation-derived word delimiters, page-local clock and explicit p50 gap. It uses **2,928 page-local printed-word fragments**, rather than the **2,896 fully joined whole-book words** used elsewhere, so cross-page carries are deliberately not merged for this within-fragment question.

There are **63** equal adjacent-rune pairs inside those original fragments. By zero-based position of the *first* rune within the fragment, the counts are **12 at position 0**, **21 at position 1**, **7 at position 2**, and **23 at positions 3+**. All are original ciphertext observations, with no assumption about their plaintext identity. Adjacent equal runes across printed word separators are excluded. The first-position rune identities are not interpreted as a key or message.

The authentic source-calibrated GP29 English encoder uses **ING→NG and IO→IA as single rune tokens**, and QU→CW, V→U, K/Q→C, Z→S as in the solved-LP1 method. It reconstructs the **entire separately solved 95-rune p57** exactly. As a source-style check, the pinned LP1 plaintext-reference has **875 decoded word tokens**, **3,510 GP29 runes**, and **61** within-word natural doubled-rune positions: **zero** are at the word beginning. The LP1 control is small and stylistically related; it is not a population estimate.

## Length-matched English model and actual result

For each original page-local fragment length L, count its occurrences n(L). Independently GP-encode three pinned English source texts with the verified orthography. For each control and L, estimate the frequency of a natural doubled rune at position j in words of that length. Multiply by n(L) and sum across L. This **exactly matches the original printed fragment-length histogram**, while avoiding any plaintext fitting or language-score optimization.

| Pinned English text | Expected unthinned natural doubles | Expected first-pair fraction | Observed first pairs | Conditional one-sided binomial tail |
|---|---:|---:|---:|---:|
| Shakespeare 300k | 329.748 | 0.0352723 | 12 of 63 | 1.84634×10⁻⁶ |
| Gibran *Prophet* | 314.128 | 0.0071615 | 12 of 63 | 3.46377×10⁻¹⁴ |
| Emerson *Essays* | 299.760 | 0.0024410 | 12 of 63 | 1.06442×10⁻¹⁹ |

If the original 63 visible repeats are an **independent position-neutral surviving subset of the true plaintext doublets**, their first-pair fraction is expected to equal the corresponding control's length-matched first-pair fraction. The conditional binomial upper-tail values above are **model-based diagnostics**, computed for 12 or more of 63, and do not include control uncertainty, mixed-language texts, selection effects, or word-specific correlated survival. The unthinned ~300–330 native pairs becoming 63 visible pairs is compatible with a ~19–21% average survival rate, but that same position-independent survival mechanism fails to explain **where** the survivors occur. An evolving keyed map or word-start intervention is not excluded.

### The p40–53 text section has disproportionate word-initial doublets

The original text-section segmentation **pp40–53** has **14** within-fragment doublets, of which **7** begin the word. The remaining unknown pages have **49** within-fragment doublets, of which **5** begin the word. **Important source scope:** the *floral border artwork* itself continues through **pp54–55**; those last two pages are a separate terminal text section. If all sixteen identically bordered pp40–55 are grouped together instead, the source has **7 initial pairs in 17 total**, against **5 in 46** outside the border (one-sided Fisher **p=0.0116230314**, odds ratio **5.74**). Both boundaries give a descriptive enrichment, but the p40–53 figure must never be described as the complete floral border. A conditional one-sided Fisher exact calculation gives **p=0.0027052553** for 7 or more of 14, given 12 initial sites among 63 overall. This is an **exploratory, post-observation chapter comparison**, not a pre-registered global discovery probability. It indicates that averaging every doublet together can conceal a source-visible chapter/word-start interaction.

## Independent competing explanation: zero transitions need not be plaintext doublets

The previous comparison is specifically against **survival of native-English doubled letters**. A different simple output-level hypothesis is that 86 original equal-ciphertext transitions occur independently of what letters were doubled in the underlying plaintext. To prevent a false inference of a special word-start decoder, audit **all 12,901 actual within-page adjacent opportunities**, using the original **2,896 joined printed words** (32 words cross physical pages), rather than the earlier 2,928 page-local fragments. The first original rune of each physical text page has no observed within-page predecessor and is excluded. In this whole-word representation, the original 12 first-pair occurrences really are word-initial-adjacent; page wrapping changes none of their source positions.

| Whole printed word position of current rune | Eligible adjacent positions | Original equal transitions | Expected if 86 sites are independently uniform |
| --- | ---: | ---: | ---: |
| First rune (following earlier cipher rune) | 2,873 | 23 | 19.152 |
| Second rune | 2,806 | 12 | 18.705 |
| Third rune | 2,360 | 21 | 15.732 |
| Fourth or later | 4,862 | 30 | 32.411 |
| **Total** | **12,901** | **86** | **86** |

Against the one-parameter uniform zero-site null, the descriptive Pearson statistic is **χ²=5.120079** (three degrees of freedom; asymptotic **p=0.1632**). Thus the entire positional pattern, *including* the unusual 12 second-rune sites, is quite compatible with a model where cipher repeats mark *randomly selected output states* rather than preserved English plaintext doubles. This null is a model comparison and does **not** prove that positions were independently generated or indicate how the cipher stays reversible.

For the text-section-defined pp40–53, **7/14** inside-word equal-pair events begin a word versus **5/49** elsewhere (conditional odds ratio **8.8**, exploratory Fisher **p=0.002705**). On a per-opportunity basis, the section has **7/656** first-pair events and **7/1,672** later-pair events; the other pages have **5/2,150** and **44/5,550**, respectively. The p40–53 first-pair concentration thus partly reflects a **depletion of first-pair events outside the section**, not evidence for a required special floral cipher command. The 7/14 within-floral first-pair count alone is only one-sided **p≈0.0694** under a within-floral uniform-site null.

An independently studied, fully reversible **multiplicative GF29 ciphertext-feedback** model can also explain rare equal transitions by identifying them with *one special plaintext rune*; its source-key attempts have not recovered real text ([original gate](lp2-gf29-multiplicative-feedback-original-gate.md)). That hypothesis is structurally distinct from both output-marker randomness and the position-neutral survival of real English doubled letters tested here.

## Interpretation and next cryptanalytic decision

A useful *negative* conclusion is now sharper than saying that all 86 original repeats are thinned natural plaintext doubles: the **position-neutral literal-doublet-survival explanation is inconsistent with three length-matched native-English controls**. The observed first-pair events could instead be generated by output-level random marker placement, ciphertext-dependent cipher state, a language or spelling register not represented by these controls, or another unidentified mechanism. The full-position uniform-site control above gives a simpler comparator than immediately postulating a word-start exception. The data alone select none of these operations and provide no plaintext.

**Next direct route:** demand an original clue selecting a reversible state/key rule, then freeze how it treats the **86 zero transitions**, including the **12 within-word initial-pair sites**, before testing ciphertext elsewhere. A proposed decoder must account for within-word and cross-word collisions, page boundaries, preserve all original runes, and supply independent key/state evidence. Do not tune a fresh per-word cipher solely to reproduce this histogram or read the twelve glyphs as an unconstrained anagram.

**Reproducer:** [single-file Node.js 22 original-input SFT](../sims/lp2_wordinitial_doublet_native_english_sft.cjs). Inputs: [original transcription](../resources/liber-primus/lp2-transcription.txt), [original GP indices](../resources/liber-primus/lp2-corpus.json), [solved-LP1 plaintext](../resources/liber-primus/lp1-plaintext-reference.txt), and the three checked-in control texts in `resources/control/`. This is intermediate research, and does not revise the authoritative `results/README.md` conclusion that no unknown LP2 plaintext, key or cipher is known.
