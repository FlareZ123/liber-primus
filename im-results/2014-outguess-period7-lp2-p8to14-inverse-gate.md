# An authentic 2014 seven-column inverse, tested on the seven-page LP2 section

**Agent50 · 11 November 2026 · preserved historical operation; bounded LP2 null.** This is an experimentally fixed operator from an earlier *solved Cicada round*, not an LP2 plaintext or a selected cross-round key.

## Original human-discoverable operation

The 2014 image supplied an OutGuess message, *For those who have fallen behind*, followed by 56 characters grouped in 28 pairs:

```
TL BE IE OV UT HT RE ID TS EO ST PO SO YR
SL BT II IY T4 DG UQ IM NU 44 2I 15 33 9M
```

The original puzzle was solved with period **7** and columnar transposition key **1736254**, yielding exactly:

```
TOBELIEVETRUTHISTODESTROYPOSSIBILITYQ4UTGDI2N4M4UIM59133
```

The first 36 characters say **TO BELIEVE TRUTH IS TO DESTROY POSSIBILITY**; the following 16 characters `Q4UTGDI2N4M4UIM5` are the real **fifth Onion** address, with four trailing characters `9133` of unknown purpose. It led to the next historical stage. This operation, original ciphertext and destination were documented in the January 2014 [unfiction solver discussion](https://www.forums.unfiction.com/forums/viewtopic.php%40p%3D1028647.html) and [2014 reconstruction](https://uncovering-cicada.fandom.com/wiki/What_Happened_Part_1_(2014)); the original OutGuess message text is preserved in the [Wulfic archive](https://github.com/Wulfic/Cicada3301-Liber_Primus/blob/main/data/outguess/page_08.txt). The naked extracted text lacks its own PGP signature, so its source status is historical rather than independently signature-authenticated.

The **exact inverse** can be written without guessing a column order: strip spaces to get 56 symbols, group into eight successive blocks of seven, and for each block output zero-based source positions `[0,6,2,5,1,4,3]`. Applied to the genuine 56 symbols this reproduces the *whole* plaintext verbatim, including the URL and the unresolved `9133`. The inverse is `[0,4,2,6,5,3,1]`.

## One fixed original LP2 application

LP2 physical **pages 8–14** form an exploratory contiguous seven-page interval with exactly **1,729** canonical runes, and **1,729 = 7 × 247**. These are LP2 pages; the earlier 2014 operator is a cross-round comparison, not the date or provenance of this interval. The section size is therefore suitable for the *same* column-major seven-row operator with no padding, guessed empty cells, or alternative block widths. We applied the exact earlier inverse to the concatenated source runes in order; reversibility is asserted over all 1,729 symbols.

| Observable / direct inverse | Original p8–14 | Source seven-row inverse |
| --- | ---: | ---: |
| Canonical GP rune count | 1,729 | 1,729 |
| Adjacent equal rune pairs (whole section) | 9 | 46 |
| Exact GP29 index of coincidence | 0.03446048 | 0.03446048 |
| English-like plaintext | No | **No** |
| Conditional prime-totient gate requiring no key-encoded plaintext F | Fails at rune30 | **Fails at rune4** |

Pure transposition necessarily leaves unigram counts and IoC unchanged; an earlier 7-column step **cannot itself** explain the uniformly distributed LP2 alphabet or recover English. Using the literal historical numerical key `1736254` as seven periodic additive GP29 shifts, with both plus/minus signs on the original and reordered streams, yields GP IoCs from **0.03444910 to 0.03472490**, uniformly nonlinguistic. The reported rune30/rune4 failures arise from the **additional assumption that no key-consuming symbol may decode to plaintext F (GP index 0)**. The test permits a literal cipher-F passthrough, but excludes an ordinary valid additive inverse whenever its output would be F. Consequently these failures are a finite negative only for that restrictive plaintext-content model. General consecutive-prime-totient subtraction remains algebraically defined for every original GP29 stream and cannot be ruled out by this feasibility test. The transposition and periodic digit-key language/IoC negatives remain scoped as measured.

## Independent illustrated-passages stage-order control (Agent46, 11 November)

The same **historically fixed** seven-position inverse was also applied once to the other source-visible seven-page group: LP2 physical **p33 offset 91 through p39**. The starting point is the second red heading before the repeated 1033/3301 cuneiform artwork, rather than a fitted clock. This interval has **1,589 = 7×227** canonical runes; its 91-rune preface and all page boundaries remain source-grounded. The operator is identical to the 2014 positive-control inverse, and all 1,589 original indices are restored exactly by its forward counterpart.

| Source-fixed interval | Original adjacent equal runes | 2014 seven-position inverse | Length |
| --- | ---: | ---: | ---: |
| p8–14 complete | 9 | 46 | 1,729 |
| p33 local91 through p39 | 12 | 50 | 1,589 |
| **Joint original input** | **21** | **96** | **3,318** |

The authentic historical inverse **does not preserve the manuscript's strong adjacent-equality suppression** on either section. Exact enumeration of all **7! = 5,040** within-septet permutations on these same frozen segments gives joint repeat totals from **21** to **146**, median **99**. The original historical inverse's **96** falls at rank **2,318/5,040** for lower-or-equal repeat counts. This is a descriptive enumeration, not a discovery-wide significance estimate. Its closeness to the permutation median reinforces that the inverse does not restore a no-repeat *intermediate*.

**Cipher-layer consequence, conditional:** if both sections were generated by the same uniformly no-repeat-adjacent rune process, then applying this particular historical 2014 transposition **as the last step** is implausible: undoing that last step should expose the original suppression, whereas it produces substantially more adjacent repeats. This does **not** reject use of the historical permutation *before* a terminal anti-repeat layer, a differently reset/segmented transposition, or an independent cryptographic layer. It recovers no plaintext or key. Do not use the 96 count to select an alternative permutation post hoc.

The [extended source-and-original single-file SFT](../sims/2014_lp1_period7_lp2_p8to14_sft.cjs) checks the archived 56-character plaintext positive control, forward restoration for both LP2 segments, source boundary/length assertions, all 5,040 complete seven-position orders, and explicitly distinguishes the conditional no-F plaintext gate from the always-defined unrestricted totient inverse.


## Independent seven-*word* septet inverse: source-language order test

**Agent 30, 11 November 2026.** The rune-level seven-position inverses above operate on character indices. A separate motivated interpretation applies the same **source-authentic 2014 permutation** to each **consecutive group of seven complete printed LP2 words**. Unlike the earlier seven-*rune* test, this preserves the word and rune inventory in every word while altering adjacency and hence the language-like word-length dependency. The proposal is still a transfer hypothesis: neither the 2014 note nor the 2016 signed message specifies that LP2 encrypted words in septets.

The historical source-control ciphertext, stripped of spaces, is exactly 56 characters:

\`TLBEIEOVUTHTREIDTSEOSTPOSOYRSLBTIIIYT4DGUQIMNU442I15339M\`

The unique position mapping reproducing the independently documented solved string \`TOBELIEVETRUTHISTODESTROYPOSSIBILITYQ4UTGDI2N4M4UIM59133\` for **each of the eight septets** is the zero-based forward list \`[0,4,2,6,5,3,1]\` (key \`1736254\`). Its inverse is \`[0,6,2,5,1,4,3]\`; exact forward and reverse 56-character assertions are implemented in [the new standalone source-control and LP2 SFT](../sims/lp2_2014_word_septet_sft.cjs).

The canonical original unsolved manuscript contains **2,896 complete printed words**, with eight source-delimited text-section word counts \`[158,255,385,435,224,326,378,735]\`. Original word breaks may cross physical pages. The exact same fixed permutation is applied to septets either across the complete 2,896-word stream or reset within each of these eight source sections. The final incomplete septet in each independently reset group remains in original order. Both historical directions are included to avoid assuming an undocumented author encoding direction.

The test's frozen observable is the original three-category (word length **1–2 / 3–5 / 6+ GP runes**) adjacent-length Pearson independence statistic, previously reported as 3.949446 on the original, whose source-language controls ordinarily produce much larger values. This statistic is invariant under a letter-level substitution that preserves the word boundaries. Results of the **four fully specified** variants:

| LP2 word order | Length-dependence chi-square |
| --- | ---: |
| Original ciphertext order | **3.94944609** |
| Global decryption orientation | **7.71256290** |
| Global encryption orientation | **2.42083403** |
| Eight-section decryption orientation | **5.02855264** |
| Eight-section encryption orientation | **2.93439933** |

A prespecified null randomly permutes the **word lengths within each of the eight original source sections**, retaining each section's length inventory and the full observed word-length histogram. Each of 600 deterministic, independent fixed-seed shuffles evaluates the **maximum of all four historical-operator transfers**, so the reported tail accounts for the model-choice family. The original maximum is **7.71256290**; the null maximum's median is **6.38149**, 95th percentile **12.46127**, with **198/600 null maxima at least the original**. The plus-one familywise tail is **199/601 = 0.33111**. Thus there is **no evidence of recovering ordinary prose word adjacency** under this original-history-selected seven-word shuffle.

**Exact native-language positive:** convert 2,896 contiguous Shakespeare words to GP rune lengths (the repository's TH/NG/EO/OE/AE/IA/EA contract), partition them into the eight actual source section lengths, and deliberately scramble the words by the 2014 source-derived forward key. The original Shakespeare words have adjacent-length chi-square **22.71653**, the cipher-order text drops to **2.64714**, and the authentic historical inverse restores all **2,896 original words exactly** and the original **22.71653** statistic. This establishes that the same test could recognize a seven-word shuffling mechanism that had hidden the ordinary source-language word-length dependence. The original LP2 result falls within the matched null instead.

**Reproducibility:** [CommonJS SFT](../sims/lp2_2014_word_septet_sft.cjs), [manual-only workflow](../.github/workflows/lp2-2014-word-septet-manual.yml) and [successful original-input run 43078971989](https://github.com/FlareZ123/liber-primus/actions/runs/43078971989). The eight source sections derive from the canonical transcript's dollar-sign delimiters; the historical master text has additional subdivisions and is **not** a drop-in eight-section parser. Independent historical C/P and all original counts are asserted before the test. The scope is exact and finite, and no LP2 key or plaintext is claimed.


## Decision

The historical seven-column permutation is an **authentic, executable creator precedent** with an independent plaintext positive control. Its exact fit to the 1,729-rune seven-page section makes it worth preserving as possible *layer ordering* or a later missing-key framing clue. However, matching section divisibility alone does **not** license applying an unspecified second cipher or searching alternative 7-orderings; the simple transposition and periodic digit-key transfers do **not** recover anything, while the restricted no-F totient-content assumption fails at fixed positions. The general totient decoder remains unexcluded by feasibility and has no independently selected LP2 key/start state. Reopen this as a decoding route only if an independent original instruction or key identifies how the seven-way reorder is combined with a decrypting transformation. This is not a new Liber Primus solve.

**Reproduction:** [single-file Node CommonJS source control and complete LP2 gate](../sims/2014_lp1_period7_lp2_p8to14_sft.cjs). It asserts both exact 2014 plaintext recovery and full LP2 reordering/reversal.
