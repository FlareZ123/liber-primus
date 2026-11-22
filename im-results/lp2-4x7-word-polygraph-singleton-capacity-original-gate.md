# A 4×7 GP29 word-polygraph and an exact 16-phase singleton obstruction

**Agent 2, 22 November 2026. Evidence class:** reproducible original-cipher negative for one predeclared reversible machine, plus an exact bounded all-secret singleton capacity obstruction. **No unknown Liber Primus plaintext, author-authenticated cipher or key has been recovered.**

## Decision in brief

The 29-symbol Gematria Primus alphabet admits a natural geometric partition: F at index 0, with the other 28 symbols forming a 4×7 rectangle. Independently, original LP2 physical p15 prints a **red-started 4×4 Fibonacci-prime number spiral** with 16 recoverable values, and the historical 2014 Cicada stage prints an authenticated **7×7 square**. Literal mirrored artwork appears in original LP2 as well. These make a word-internal coordinate permutation with a 16-step word clock worth a single source-frozen check.

**The missing source operation is decisive.** Neither the original p15 spiral nor the earlier 7×7 source instructs a reader to multiply the two dimensions into a GP28 rectangle, reverse columns within printed words, reserve F as a coordinate escape, or add the original spiral modulo 29. The joint rule tested here is a bounded hypothesis, not an independently selected historical solution.

The model's direct inverse is nonlinguistic on the original opening and later untouched chapters. Two independent all-secret invariants now test the 16-phase word-clock family: singleton word capacity excludes global and eight-section-reset clocks under GP-native English A/I (even three singleton types), and **repeated whole-word equality excludes deterministic physical-page-reset 16-phase whole-word maps under both complete-word and rune-start clocks** under exact native English word lengths. The original has **zero identical ciphertext-word pairs across 536 comparable same-word-phase pairs and 690 independently comparable same-rune-start-phase pairs**; 2,000 native-source controls per clock all have multiple pairs. Both conclusions require that original printed word boundaries coincide with plaintext words and the effective secret map remains fixed for each named phase.

## Complete reversible hypothesis

Source printed p15 spiral, starting at the original red 3299, clockwise:

`3299, 3298, 3296, 3294, 3288, 3278, 3258, 3222, 3152, 3038, 2838, 2472, 1820, 708, 1206, 4516`.

Let `K[w]` be this list modulo 29 at the zero-based complete-word position within the physical page *where that word begins*, repeating after 16 words. The source is parsed into **2,896 complete words**, retaining 32 actual continued page-crossing words intact. The chosen 4×7 rectangle represents every nonzero GP rune `x=1+7r+c` with `0<=r<4`, `0<=c<7`. In each original complete printed word:

1. Break at literal GP0 F into maximal consecutive nonzero runs. Preserve those F sites inside the reversible coordinate layer.
2. For each nonzero run, preserve each row coordinate `r` and **reverse the sequence of column coordinates** `c`. This is its own inverse, including all singleton and two-rune runs.
3. Add `K[w]` modulo 29 to all transformed values, including F0, to obtain ciphertext. A new physical page resets only at the start of its first *complete* word.

The decryption subtracts `K[w]`, then reverses columns again. Every rune has exactly one inverse and the original word cuts are preserved. Unlike an independently keyed per-word substitution, the mechanism fixes all bytes and choices without fitting the original ciphertext. It preserves a speculative literal F exception within the coordinate operation. The key addition is applied to every GP symbol to keep the entire scheme reversible without inventing a second side channel.

The [CommonJS SFT](../sims/lp2_2258_rectangle4x7_spiral_word_polygraph_sft.cjs) reconstructs the literal 4×4 p15 cells, verifies the spiral, reads the canonical full original source and its eight genuine text sections, applies the inverse and **exactly re-encrypts all 12,956 original runes**. It reconstructs all 95 known p57 plaintext runes and the 20 printed words from the independently solved source, tests all 29² possible two-rune coordinate words, and inverts 2,896 complete source-native Gibran and Emerson word plants. A one-phase wrong key alters 10,983/11,066 and 12,069/12,181 plant runes, respectively. These checks establish implementation correctness, not original key identification.

## Original results, compared to true language

| Frozen text | GP runes | Within-word same-rune pairs | Rune index of coincidence |
| --- | ---: | ---: | ---: |
| Untouched original p0–55 | 12,956 | 63 / 10,060 | about 0.0345 |
| Original after source-frozen 4×7 inverse | 12,956 | **208 / 10,060** | **0.034503874** |
| Original p0–p2 inverse | 729 | 9 / 571 | **0.034135275** |
| Untouched later p16–p21 inverse | 1,615 | 22 / 1,242 | **0.034493077** |
| Native Gibran plant before encryption | 11,066 | 256 / 8,170 | **0.060500865** |
| Same Gibran plant after encryption | 11,066 | 263 / 8,170 | **0.035120992** |
| Native Emerson plant before encryption | 12,181 | 230 / 9,285 | **0.062051455** |
| Same Emerson plant after encryption | 12,181 | 255 / 9,285 | **0.035024465** |

The original inverse's first 26 whole words begin with the GP transliterations `EAMYPIAEUU YCDFP PTNGC EODC LIANG PTRNGEANTPISF...`. Neither the first 729 original runes nor the sealed 1,615 later original runes become coherent English under the fixed rule. The original language-like IoC does not return, while identical plant decoding restores the full source-language IoC.

Importantly, this reversible coordinate operation is **not a natural explanation of the original strong same-rune deficit**: native GP plants encoded with this exact cipher still show 263 and 255 internal equalities. The original contains only 63 over more positions. The growth to 208 after decoding simply shows that the column reversal changes within-word adjacency; it cannot be read as proof of the intended cipher.

## All-secret short-word theorem

A broader consequence applies independently of the particular 4×7 row and column layout.

Take any word-preserving polygraphic encoder whose transformation on a **one-rune word** is a fixed, deterministic function of that rune and a visible 16-phase clock. Permit an *arbitrary secret* lookup/substitution for every phase, unknown starting phase, arbitrary source-derived alphabet order, and any invertible polygraph for words of length two or more. At a given phase, a source plaintext alphabet containing at most `q` different singleton rune types can produce **no more than `q` different one-rune ciphertext values**. The proof is cardinality under any function. It does not depend on the cipher key.

The unmodified original has 83 complete one-rune words occupying **28 distinct GP29 glyphs**. Their same-phase diversity is:

| Clock and reset | Phase classes with more than 2 distinct singleton glyphs | With more than 3 | Maximum different glyphs in one phase |
| --- | ---: | ---: | ---: |
| Global complete-word index modulo 16 | **14** | **10** | **7** |
| Global rune-start index modulo 16 | **13** | **12** | **9** |
| Complete-word index modulo 16, resetting at 8 illustrated text sections | **2** | **1** | **4** |
| Rune-start index modulo 16, resetting at 8 sections | **2** | **1** | **4** |
| Word index modulo 16, resetting at each printed physical page | **0** | **0** | **2** |
| Rune-start index modulo 16, resetting at each printed physical page | **0** | **0** | **2** |

For example, original complete-word phase 3 contains **seven distinct singleton output glyphs**, `I,G,W,D,J,T,OE`. Even a hypothetical three-type plaintext singleton register cannot yield these seven outputs from one fixed phase. At section-relative word phase `section 7, phase 7`, there are four distinct output singleton glyphs `OE,Y,M,NG`. Adding an independently unknown alphabet, or changing the source word's longer internal mixing, cannot change these direct cardinality contradictions.

The English singleton premise reflects the authors' authenticated English prose, in which the ordinary independent one-letter words are A and I; allowing a third type grants one source-register escape. The singleton theorem alone leaves physical-page resets open. The independent whole-word collision test below closes **deterministic page×complete-word-phase** and **page×rune-start-phase** full-word maps under GP-native English; genuinely evolving state remains available. Unknown LP2 may use another language or use printed spaces as framing instructions, so neither theorem proves its plaintext word cuts.

## Stronger page-reset all-secret 16-phase whole-word equality gate

The preceding table honestly shows **zero singleton-capacity violations** when the 16-phase clock resets for each physical page. That necessary condition alone is weak because 83 singleton words are spread across many page-phase classes. An independent invariant also applies to **all lengths of complete printed words**. It excludes the remaining frozen page-reset whole-word architecture with a stronger original-source test.

For any deterministic, length-preserving word map `C=E_(page,phase)(P)`, **the same plaintext word under the same page and phase must yield the same ciphertext word**, even when the entire map `E` is an arbitrary unknown nonlinear function. This holds for fully independent secret alphabets at all 16 phases of every page, arbitrary GP29 alphabet order, private per-page keys and internal polygraphic mixing. The test compares words of equal length so literal leading glyph/word length differences cannot create false comparisons. This property requires no decryption and is invariant under all such keys. It fails if the cipher uses *word-specific changing state*, nonce, ciphertext feedback or altered plaintext word boundaries.

The actual LP2 source is split into **2,896 complete original words**, including all 32 physical page crossings. Each word belongs to its start page. Two **source-defined but independent** 16-phase clocks are possible: its zero-based ordinal among *complete words starting on that page*, and its rune-start offset from that physical page's first rune. Under the first clock there are **2,417** observed `(page,phase,word length)` classes, **425** holding at least two words, and **536 unordered comparable pairs**. Under the alternative rune-start clock, there are **2,315** classes, **487** with at least two words and **690 comparable pairs**. **Exactly zero pairs have identical complete GP29 ciphertext words under either clock.** Both counts use unchanged original ciphertext, and neither relies on the exact 4×7 layout.

To calibrate the language assumption without assuming the ciphertext's symbols are plaintext, the [original-source, read-only CommonJS SFT](../sims/lp2_pagephase16_wordcollision_allsecret_sft.cjs) separately draws **1,000 full 2,896-word GP-native English books** from each preexisting Gibran and Emerson reference corpus, matching *every* original word's GP-rune length and exact physical start page. Both 16-phase clocks are evaluated independently on each sampled full book. Donor words are sampled **without replacement within every GP-rune-length bucket**, preserving authentic source word frequencies and the complete original length tape. Thus repeated words arise from English itself, not from cloning a selected donor token.

| Full-length 12,956-rune source | Clock | Number of books | Same-state identical word pairs, minimum | Median | 95th percentile | Maximum | Books at/below real zero |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Authentic original LP2 ciphertext | Page×word phase | 1 | **0** | **0** | **0** | **0** | Exact |
| Authentic original LP2 ciphertext | Page×rune-start phase | 1 | **0** | **0** | **0** | **0** | Exact |
| GP-native Gibran, without replacement | Page×word phase | 1,000 | **17** | **33** | **43** | 52 | **0/1,000** |
| GP-native Gibran, without replacement | Page×rune-start phase | 1,000 | **22** | **41** | **52** | 67 | **0/1,000** |
| GP-native Emerson, without replacement | Page×word phase | 1,000 | **9** | **25** | **33** | 42 | **0/1,000** |
| GP-native Emerson, without replacement | Page×rune-start phase | 1,000 | **14** | **32** | **41** | 53 | **0/1,000** |

The first independently seeded Gibran plant has **37** same-word-phase and **35** same-rune-phase equal word pairs. The Emerson plant has **21** and **32**, respectively. Two positive encryption variants assign independently parameterized secret affine GF29 alphabets to every page and each of the 16 phases. Both full **12,956-rune** donor plants encrypt and decode exactly under both clocks, preserving all source pair equalities **37/37, 35/35, 21/21 and 32/32**. These controls check the invariant, and the proof permits richer whole-word maps. All 2,000 exact-length control books have more equal pairs than the original under **either** clock, an empirical lower-tail count **0/2,000 per clock**.

**Research consequence:** Conditional on source-native English words and the original segmentation, **neither physical page×complete-word phase nor physical page×rune-start phase can function as the sole deterministic 16-phase whole-word state** under these calibrated English registers. Both direct p15-period-16 page-reset stationary clocks are now inconsistent with native GP English. This does not exclude p15's numbers acting as a changing-state schedule with per-word IVs, ciphertext feedback inherited across word boundaries, a more complex nonperiodic state, or non-English/encoded word content.

Reproduction: [CJS source](../sims/lp2_pagephase16_wordcollision_allsecret_sft.cjs), [passing Node22 CI 45023817575](https://github.com/FlareZ123/liber-primus/actions/runs/45023817575). Both use the unchanged original 12,956-rune source, two distinct original English corpora, deterministic seeded without-replacement controls and per-page phase-positive reversible GP29 plants.

## Research fork

Retire the source-composed fixed 4×7 coordinate-reversal plus p15 printed-spiral word-key inverse. The first all-secret invariant rejects global or illustrated-section 16-phase singleton alphabets, while the second rejects **page-reset 16-phase deterministic whole-word maps with either complete-word or rune-start phase clocks** under the original word cuts and calibrated GP-native English. Source-native text may still be encoded by **a genuinely changing state across whole words, a word-specific IV, or changed segmentation**. These require an original visible operator or typed key/nonce and a contiguous untouched plaintext prediction. Repeating the same fixed 16-phase alphabet with a newly fitted key cannot rescue this family.

**Reproducibility:** [single-run Node22 source test](../sims/lp2_2258_rectangle4x7_spiral_word_polygraph_sft.cjs), [successful GitHub Actions run 45021914545](https://github.com/FlareZ123/liber-primus/actions/runs/45021914545), original images `resources/liber-primus/32.jpg` and `resources/liber-primus/19.jpg`, authenticated earlier square `resources/cicada2014-openpuff-magic-squares.txt`, and original corpus `resources/liber-primus/lp2-corpus.json`.
