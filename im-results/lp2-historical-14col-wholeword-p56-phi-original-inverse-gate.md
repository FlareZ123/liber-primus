# Source-fixed 2014 fourteen-column word transposition: original LP2 and authentic p56 inverse

**Status:** completed original-input finite cipher decision; **no unknown-page plaintext/key**. Original source: 2014 Stage03 signed 70-character string and documented historical column order `2,8,9,1,12,13,11,4,5,7,3,0,6,10` ([contemporary Stage03 solution](https://uncovering-cicada.fandom.com/wiki/CICADA_3301_2014_PUZZLE_FACTS_PART_3)). The original stage decodes exactly **70/70** under this permutation, so its source is more specific than a modern arbitrary permutation search. Actual LP2 pages do **not** contain a separate author-supplied instruction to transfer this row ordering to words; this is a finite human-solve-path hypothesis prompted by the independent observation that LP2 printed words lack native-English adjacent-length grammar.

**Reproducers:** [historical14 word-order SFT](../sims/lp2_2014_14column_original_word_transpose_sft.cjs), passing [Windows/Node22 run 44064701797](https://github.com/FlareZ123/liber-primus/actions/runs/44064701797); [historical14+original p56 prime/F two-layer exact SFT](../sims/lp2_2014_14column_phi_original_inversion_sft.cjs), **Windows/Node22 PASS [CI run 44065597217](https://github.com/FlareZ123/liber-primus/actions/runs/44065597217)**. Both scripts use existing original `lp2-transcription.txt` and `lp2-corpus.json`, Shakespeare and Gibran GP controls. Tests preserve **all 12,956 ciphertext runes, 2,896 original printed words, 32 across-page carried words**, and genuine visual chapter word counts `158,255,383,437,224,326,378,669,66`. A chapter-internal 14-word row is reordered using the *exact historical key*. Partial last rows are reversed by the inverse of the key restricted to present columns (no lost words). Two operation directions and both chapter/book resets tested; no fitted key.

## Complete-word 14-column test

A source-independent GP29 conditional word-length model trained on the first 40,000 Shakespeare + 9,500 Gibran words measures whether the fixed unscrambling recovers true English adjacent-word grammar. A **3,000-trial exact-word-multiset-preserving** per-chapter random shuffle supplies the null; two separate 2,896-word native-English control streams recover **2,896/2,896** original lengths after correct inverse, with positive native conditional-length scores of **+0.01280/+0.01147**.

| Original word ordering | Adjacent length MI, nats | Native GP conditional logLR | Null upper p |
|---|---:|---:|---:|
| Physical printed | 0.02031044 | −0.02368753 | 0.85305 |
| Historical14 **decode** in each chapter | 0.02138262 | **−0.01652746** | **0.12896** |
| Historical14 **encode** in each chapter | 0.02154354 | −0.01976889 | 0.44585 |
| Historical14 decode across whole book | 0.02098285 | −0.02247674 | 0.74675 |
| Historical14 encode across whole book | 0.01620722 | −0.02236698 | 0.74009 |

The improvement in chapter-decode direction does **not** beat original matched-shuffle controls (p≈0.129), nor replicate native English. The independently withheld p54–55 terminal chapter declines from conditional logLR **+0.01464** printed to **−0.00605** after historical decode.

## Direct value-changing plaintext-producing composite

After rearranging *complete printed rune-words* by either historical14 direction, feed each true original section into the independently authenticated **p56 GP29 prime-totient plaintext-F-bypass** inverse. For each direction and original section, exhaust **all 5,000 initial prime ordinals 0..4999**, treating every ciphertext F as either a transparent plaintext F (no key advance) or a normal key-consuming non-F. Complete reachability is solved without guessing plaintext or using any language scorer. There are **90,000 exact original section/order/start cases**.

| Original chapter | Runes | Furthest legal prefix, historical decode | Furthest legal prefix, historical encode |
|---|---:|---:|---:|
| p0–2 | 729 | 603 | **729** |
| p3–7 | 1,145 | 426 | 433 |
| p8–14 | 1,729 | 614 | 554 |
| p15–22 | 1,903 | 571 | 560 |
| p23–26 | 1,021 | 546 | 509 |
| p27–32 | 1,433 | 548 | 664 |
| p33–39 | 1,680 | 463 | 505 |
| p40–53 | 3,008 | 595 | 921 |
| p54–55 | 308 | **308** | **308** |

There are **seven** total complete native-lawful paths: historical-encode p0–2 at prime ordinals **3442,3444,3445,3446**; historical-decode terminal p54–55 at **4456**; and historical-encode terminal at **3498,4563**. All other original chapter/order pairs are mathematically impossible within the frozen initial prime range, regardless of plaintext, including the untouched 3,008-rune p40–53 section.

A separate *exact* best-native-GP-bigram path DP retains both consumed-prime count and previous plaintext glyph, so skips cannot be dismissed by an incorrect language-first merge. The four surviving 729-rune original inverses have log-score/rune **−5.11655, −5.06495, −5.05422, −5.05292**; all have rune IoC **0.03553–0.03562** and only **5/158** words in a pinned Shakespeare/Gibran dictionary. The three 308-rune terminal paths score **−5.14473, −5.31114, −5.11462**, IoC **0.03412–0.03520**, and **3/66, 1/66, 0/66** dictionary word hits. **No coherent plaintext** survives.

Authentic solved p56 independently produces the exactly known **85/85** runes, and its 25 actual word lengths are restored exactly after the same historical14 scramble. True p56 native-GP score/rune is **−2.66594449**, IoC **0.07002801**, establishing meaningful positive separation from the seven source-original chance paths. Every original complete path is also forward re-encrypted to the exact ciphertext.


## Literal original 14-column **rune-character** transfer

The 2014 Stage03 operation was applied to *individual characters*. For source fidelity, a second independent original-input screen applies the same 14-wide historical column order directly to consecutive individual **GP29 runes**, with the same two directions, nine real visual-section boundaries, and first **5,000** prime ordinals. This removes the speculative assumption that the earlier operation should act on intact printed words; after transposition, original printed word breaks are not used for scoring. The new screen adds another **90,000** exact original cipher/clock configurations, with fully unrestricted literal-F skip branches and heldout source-native bigram scoring only after mathematically complete paths exist.

| Original section | Runes | Furthest valid inverse, historical 14-rune decode | Furthest valid inverse, historical 14-rune encode |
|---|---:|---:|---:|
| p0–2 | 729 | **729** | **729** |
| p3–7 | 1,145 | 474 | 414 |
| p8–14 | 1,729 | 526 | 455 |
| p15–22 | 1,903 | 592 | 551 |
| p23–26 | 1,021 | 526 | 631 |
| p27–32 | 1,433 | 544 | 670 |
| p33–39 | 1,680 | 519 | 481 |
| p40–53 | 3,008 | 498 | 555 |
| p54–55 | 308 | **308** | **308** |

Exactly **19** complete original GP29 ciphertext inverses survive: historical-**decode** has opening p0–2 prime starts **2829,2830,2831** and terminal p54–55 starts **646,1215,1217,2724,3715,3716,4052,4377**. Historical-**encode** has opening starts **1713,1714,1715,1716,1718,1719,1720** and terminal start **1264**. **Eight of nine complete original visual sections have no valid full inverse in either direction** except the opening and terminal; all 19 survivors are confined to these two short source chapters.

The exact best native-GP English bigram path of each complete inverse has mean log score between **−5.26341** and **−4.77893** per rune; IoC range **0.03420–0.03659**. The original solved p56 control, independently pinned and exactly reproduced **85/85**, scores **−2.66594** and IoC **0.07003**. The 19 original outputs are nonprose and re-encrypt exactly into their source-transposed ciphertext. This rejects the direct, historically literal fourteen-column glyph permutation followed by the *authentic* p56 cipher, within the explicitly frozen 0–4,999 initial-prime range. It does not exclude a different cipher layer or independently selected permutation.

The same [single-file source-original inverse SFT](../sims/lp2_2014_14column_phi_original_inversion_sft.cjs) now asserts the 2014 70-character correct transformation, authentic solved-p56 85-rune positive, all nine glyph-level maximal-prefix maxima and their argmax starts, the complete original survivor sets, exact forward GP29 encryption of all survivors, and their English-score null failure. In total it covers **180,000** original chapter/order/start cases across intact-word and literal-rune historical variants. The glyph-level extension was added after the previous [passing base CI run 44065597217](https://github.com/FlareZ123/liber-primus/actions/runs/44065597217); the updated code's CI result must be checked separately.


## Same historic key as a 28-symbol non-F alphabet permutation

A third distinct, explicitly reversible use of the same **original 2014 14-column key** is selected by the genuine GP29 alphabet's **one special F interrupter and 28 non-F symbols**. Leave F fixed; split positions 1–28 into two fixed 14-symbol rows in canonical GP order; apply the source-fixed 14-column permutation independently to both rows, with each possible direction. Unlike the previous two paths this changes rune **values**, while leaving printed geometry untouched. Then try the same exact original p56 prime/F key inverse at each of the first 5,000 prime ordinals, per original nine visual sections.

| Original section | Runes | Maximal valid prefix after alphabet forward+prime | Alphabet inverse+prime |
|---|---:|---:|---:|
| p0–2 | 729 | 613 | 712 |
| p3–7 | 1,145 | 545 | 426 |
| p8–14 | 1,729 | 618 | 539 |
| p15–22 | 1,903 | 518 | 520 |
| p23–26 | 1,021 | 518 | 584 |
| p27–32 | 1,433 | 580 | 554 |
| p33–39 | 1,680 | 408 | 468 |
| p40–53 | 3,008 | 559 | 490 |
| p54–55 | 308 | **308** | **308** |

**All eight original sections p0–53 fail** on both fixed symbol directions across all 5,000 initial prime ordinals. Only terminal p54–55 has **nine** mathematical full inverses: forward phase ordinals **999,1001,2048,2284,3461,3462,3801**, inverse ordinals **1835,3593**. The optimum independently trained native-GP bigram candidate scores only **−4.74439** per rune; other eight are worse (down to **−5.11915**), IoC **0.03410–0.03617**. No candidate reconstructs prose. Source non-F alphabet permutation and its inverse are exhaustively asserted **29/29**, the real p56 85/85 ciphertext positive survives forward/inverse map roundtrip, and every completed terminal candidate forward-encrypts exactly.

The source offers **14 genuine historic column positions**, but it does not explicitly choose to rearrange GP letters themselves. This is an independently motivated finite 28=2×14 symbol-transfer consumer, **not** a proof about all 29! secret alphabets, all possible 2014 transpositions, or additional value-changing layers. Combining the word, rune and symbol roles gives **270,000 original-input 9×2×5000 exact tests**, with **35** full mathematically valid nonprose outputs (7 word, 19 rune, 9 alphabet); the literal final signed-p56 cipher remains the same frozen final layer. There is no legitimate unknown plaintext/key in these outputs.

## Decision and remaining unknown

The source-derived 2014 fourteen-column whole-word inverse lacks an independent native-English length signature. Testing the historical operation at **all three natural source locations** (intact words, individual runes, and canonical 28 non-F GP rune symbols) before the real p56 prime/F cipher produces only **35 nonprose complete mathematical outputs** among 270,000 chapter/direction/prime-start configurations, and no authentic unknown-page plaintext or key. Do not rescue this finite transfer by fitting new column keys or arbitrary secret prime phases to partial phrases. This does **not** exclude other independently selected word transpositions, changes in rune segmentation, or a new source-authenticated cipher/clock. **A concrete LP2 clue specifying a different reversible operation or key remains necessary.**
