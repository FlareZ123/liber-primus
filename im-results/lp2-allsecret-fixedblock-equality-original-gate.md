# Original LP2 fixed-block equality: all-secret 3-, 4-, 5-, and 7-rune substitution gate

**Agent 5, 22 November 2026. Evidence: source-native, all-secret necessary-condition test. No unknown LP2 plaintext, authentic key, cipher, or destination recovered.**

## Physical premise and mathematical invariant

The source uses GP29, historical five- and seven-cell magic squares, and very few repeated neighboring runes. A source-motivated possibility is a **fixed reversible k-rune block substitution**, including a separate completely secret bijection on the 29^k possible input/output packets on every printed page. An arbitrary bijection f preserves packet equality exactly: f(A)=f(B) if and only if A=B. No secret table, alphabet permutation or Hill key can alter this fact while the same block key is used on that physical page.

Test all block lengths **k=3,4,5,7**, every phase 0 through k−1, both a single uninterrupted manuscript-wide packet clock and a packet clock restarted at **every original printed physical page**. On each page, tally sums of n(n−1)/2 across exact k-packet frequencies. Omit only terminal fragments shorter than k; no ciphertext runes are changed. Original GP29 corpus: **55 rune-bearing original physical pages p0–p55, with p50 containing the 256-number table**, total **12,956 GP29 runes**, 2,896 printed whole words (32 span an original page seam). Sources: [original GP29 corpus](../resources/liber-primus/lp2-corpus.json), [original page parser](../sims/lp2_word_pages.cjs).

## Original exact equality events

| Block k | Original page-reset collision pairs (each common phase) | Original continuous-manuscript collision pairs |
| ---: | --- | --- |
| 3 | **4,9,4** | **412,376,405** |
| 4 | **0,0,0,0** | **5,6,10,11** |
| 5 | **0,0,0,0,0** | **1,1,0,0,0** |
| 7 | **0,0,0,0,0,0,0** | **0,0,0,0,0,0,0** |

A stronger concession to the hypothetical secret cipher lets **every individual page select its own phase independently**, choosing the minimum collision count among its k legal packet alignments. Summing those independently minimized per-page counts gives **zero collisions on the original for k3, k4, k5, and k7**. This is a mathematical lower bound favorable to the cipher and does not demonstrate that the creator selected any of these local phases.

## Independently sourced native-GP prose controls

Three checked-in prose sources are rendered into **native** GP29 spellings using the repository's independently calibrated [solved-LP1/LP2-p57 encoder](../sims/lp2_native_gp_source_orthography_sft.cjs), which reproduces all 181 authentic LP1 calibration words and independently held-out LP2 p57. The encoder applies historical GP mergers, including ING into NG and IO into IA.

**Continuous-English baseline:** 88 full 12,956-rune reference windows from Gibran (8), Shakespeare (32) and Emerson (48), at fixed stride 6,478. Overlay exactly the 55 original physical page-length slots. The **minimum per-page collision count among all 88 source windows and all phases** is **175 for k3, 24 for k4, and 4 for k5**, compared with original per-phase counts at most **9, 0, and 0**. Some source k7 pagewise samples match the original zero. With one **global** fixed block key, all 88 source windows produce strictly more collisions than original under each k and every original packet phase, including k7. These are finite source-based calibrations, without claims about all possible human prose.

**Exact-original-word-length control:** Because the manuscript has unusual word sizes, pin all **2,896 original GP rune word lengths in their actual printed order**, including the 32 cross-page carry words. Each input word is sampled independently with replacement from the actual tokens in one source text whose **native-GP encoded length matches that source position exactly**. Every source supplies real words in all original length classes 1–14. Generate exactly **96 samples for each of the three texts**, deterministic xorshift32 seed 0x33012026, so the sample preserves the source's frequency of ordinary words by length and exactly reproduces manuscript rune/page and word-length geometry. This model loses sentence syntax and is deliberately a different baseline from complete contiguous prose.

| Matched source, 96 texts each | Minimum k3 collisions, common page phase | Minimum k4 collisions, common page phase | Minimum k3 collisions, phases independently optimized on all 55 pages | Number of phase-optimized k4 texts matching zero |
| --- | ---: | ---: | ---: | ---: |
| Gibran | **144** | **12** | **83** | 1 / 96 |
| Shakespeare | **98** | **7** | **58** | 0 / 96 |
| Emerson | **111** | **4** | **60** | 12 / 96 |
| **Original unknown LP2** | **4** | **0** | **0** | **0** |

**k3 decision:** The source-original k3 score is extremely dissimilar to native-GP English even after allowing **each individual page** an arbitrary independently chosen phase and arbitrary secret reversible **page-specific triple-packet substitution**. **All 288 matched-source controls exceed the original phase-optimized zero**, by a minimum of **58**. This is a strong conditional all-key English-register exclusion for that architecture. It is not a universal mathematical proof against an intentionally non-prose plaintext or other language.

**k4 decision and complete-invariant closure (Agent44, 23 November):** With a **common packet phase across the 55 pages**, all 288 matched controls have strictly more original-page collisions than original under every phase. With independent private phases per page, **13/288 matched native-prose controls have no repeated four-rune packets**, identical to original. An arbitrary page-private four-block alphabet therefore cannot be excluded on packet equality. More strongly, **packet equality is the mathematically complete all-key invariant** of this exact unconstrained family, as proved and explicitly realized below. This closes further key-independent four-packet tests within this specific architecture until an independently sourced key, phase, plaintext or fringe rule appears.

### Complete four-block permutation orbit and original-cipher witnesses (23 November)

**Theorem (exact, not statistical):** Fix one page's partition into disjoint four-rune packets, allowing one unknown page-private phase. For two same-length packet strings X and Y, some bijection of the entire **29⁴ = 707,281**-element GP29 block alphabet maps X to Y position by position **if and only if** for every pair of positions i,j, X_i=X_j exactly when Y_i=Y_j. Necessity follows from bijectivity. For sufficiency, these equalities define a well-defined injection from the distinct observed X packets to the distinct observed Y packets. Because both observed sets have the same cardinality, extend that injection to a permutation on the entire alphabet. The exact number of such extensions for a page with m distinct observed packets is **(707,281−m)!**. Consequently every key-independent property of complete disjoint packets that survives arbitrary private block substitution must be a property of their equality partition. Histograms, high-order packet collisions, spectral ranks, and top-k occupancies cannot yield a strictly stronger all-secret exclusion in this model.

**Source-original classification:** Every rune-bearing physical LP2 p0–p55 page has *zero* repeated complete four-packets at **each** phase 0,1,2,3. Reproduce the prior seed **0x33012026** and 96 exact-original-word-length-matched native GP29 candidates per donor, using the established solved-Cicada encoder. **1 Gibran, 0 Shakespeare, and 12 Emerson** candidate books, hence **13/288**, admit a page-specific zero-collision phase on every page. For **all 13**, the SFT constructs an explicit deterministic 707,281-state *full permutation on each original page*, represented by a sparse path-to-cycle completion plus fixed points. The original ciphertext is decoded to the matched donor on every complete four-packet and reencrypted exactly, over all 55 physical source pages. The witnessed donor-aligned packet coverage is **12,848–12,872 of 12,956** original runes, varying with privately selected page phase. The remaining **84–108 fringe runes are copied unchanged from original ciphertext**; thus none of these witnesses constitutes authentic full-book fluent prose or a decipherment. The original 32 carried words and 2,896 printed word lengths are respected in the candidate control layout.

This construction is an **identifiability theorem with concrete original-input counterexamples**, not a secret historic key or author-intended four-rune operation. With arbitrary page-private keys and privately chosen phases, further tests of complete-packet permutation-invariant shapes cannot produce a discriminating result beyond the equality pattern already measured. Stronger progress must independently constrain an operator, share state/keys across pages, or establish how marginal partial blocks are treated. The original script performs exact full-cipher replay and synthetic oracle tests of the sparse completion but does not assert recovered plaintext.

**Windows Node22 passing original SFT:** [explicit original compatible page-private four-block witness and orbit proof](../sims/lp2_pageprivate_fourblock_orbit_witness_sft.cjs) · [run 45094157400](https://github.com/FlareZ123/liber-primus/actions/runs/45094157400).

**k5, k7 decision:** At k5 even fixed-phase matched English controls sometimes show **zero** repeated packets, so original zero is insufficient. At k7 zero is frequent under independent page keys. These architectures remain unconstrained by this particular statistical test. A truly changing key or state per block would also break the equality invariant, and no exclusion is claimed for such a cipher.

## Additional non-English register challenge (source-aligned)

The pagewise k3 obstruction is not specific to the three selected modern English authors. The repository retains the **corrected original Old English Beowulf GP29 source** with 48,012 genuinely encoded runes (including lowercase thorn, eth and ash mappings) and a **word-preserving Latin Vulgate GP29** source of 204,802 runes. Their two native GP29 reference encodings use **different 29-character textual alphabets** in the repository; the test maps each through its own documented index alphabet before computing the actual GP29 packet identities. A first implementation mistakenly applied the Latin alphabet to the Old English source and was **rejected by its symbol-range assertion** in a failed intermediate CI run; the final source-alphabet-corrected run independently passes on Windows.

Using the same original 55 physical page lengths and stride 6,478, the source provides **6 Beowulf and 30 Latin** complete 12,956-rune prose windows. In the strongest **independent adversarial page-phase optimization**, their minimal k3 repeated-packet counts are **79 Old English** and **180 Latin**, versus original **zero**. For a common page-phase the minimums are **122** and **261**, versus original at most nine. These are finite authentic alternative source-language registers; they do not exclude every possible Medieval or constructed language. With k4, even the corrected Beowulf sometimes attains zero under independent page-phase selection, so its conclusion remains conditional on a common page phase.

Latin also supplies **a complete 1–14-rune word-length dictionary**. In a separate seeded **96-sample** all-original-word-slot-matched Latin experiment (seed 0x02916017), keeping all 2,896 original printed GP word lengths, independent phase per page yields **k3 minimum 124**, **k4 minimum 1**, and **k5 minimum zero**; the original is zero for all three. The k3 short-packet exclusion now holds in all three English comparison sources, plus independently encoded Old English and Latin, under their explicitly stated sampling models. The k4/k5 phase-free limitations remain.

## Exact positive cipher controls

The test enciphers actual control text into **57 genuinely reversible page-specific GP29 triangular linear block transformations**: 3 distinct English sources × all 19 packet-width/phase choices. It uses a fresh invertible GF29 coefficient and offset per page, forward enciphers all complete k-blocks, exactly recovers the original native plaintext, and verifies complete block collision-count preservation for every plant. A more general arbitrary reversible page-specific k-block table obeys the same equality theorem without constructing the astronomically large table. The test does not fit any key to the manuscript's original ciphertext.

## Research decision and reproducibility

Retire **static GP29 triple-block substitution encoding ordinary native-English plaintext** as a leading direct LP2 mechanism, including arbitrary secret keys on each physical page and independently chosen page-specific block phases. Four-block static substitution with a common source-selected phase is also strongly disfavored, while unconstrained page alignment remains possible. Do not generalize the evidence to k5/k7, changing block keys, compressed intermediate material, non-English plaintext or text whose spaces have been intentionally rearranged.

No original ciphertext has been deciphered, and no independent first-party manuscript clue tells a human solver to use a fixed k-block substitution. A productive successor would need **new author-selected state updates, an external pad or reversible space-changing instructions**, and authentic original-source plaintext reconstruction. The earlier all-secret **digraph** and fixed word/phase tests do not supply this exact 3–7-rune independent-page result.

**Exact reproducible test:** [single Windows Node.js 22 / CommonJS source](../sims/lp2_allsecret_fixedblock_equality_original_sft.cjs), [Windows original-input run 45079611420 including corrected Old English/Latin](https://github.com/FlareZ123/liber-primus/actions/runs/45079611420). The workflow passes all original counts, seeded controls, source-native spelling checks and all 57 reversible plants.
