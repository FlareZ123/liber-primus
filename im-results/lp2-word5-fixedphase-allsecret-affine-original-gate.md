# Word-local five-phase affine cipher: original LP2 decision

**Status: conditional original-cipher exclusion; no plaintext or authentic key recovered (17 November 2026).** This analysis builds on the existing [per-word phase-partition inverse](../sims/lp2_lagfive_perword_phase_partition_sft.cjs), [full five-phase lexical-capacity test](../sims/lp2_wordlocal_fivephase_allword_lexical_capacity_sft.cjs) and [long-word five-phase morphology test](../sims/lp2_longword_fivephase_morphology_sft.cjs). **The p51 echo, MESDAMES/TURBETUR-pattern lexical leads and the METEMPSYCHOSIS candidate were already investigated.** The additional contributions here concern affine-specific invariants, a distinct fixed-copy-escape inverse, conditioned runs and original-image reading. The original 55 rune-bearing unsolved physical pages p0–p55 contain 12,956 GP29 runes in 2,896 printed words. The canonical transcription and original physical-word continuity are the fixed inputs. This report tests several fully invertible *direct* five-position families suggested by the original LP2 five-dot motifs and the anomalous distance-five repeats. It physically adjudicates a previously reported three-rune echo near the numeric table. Each operation is precisely bounded; moving-state nonlinear substitutions and layered decoders remain outside the tests.

## Source-motivated model and exact invariant

For word `w`, within-word rune coordinate `j` and `p=j mod 5`, consider

`C[w,j] = a[p]·P[w,j] + b[w,p] (mod 29)`,

where the five nonzero slopes `a[0..4]` are **completely secret** and each `b[w,p]` is also **completely secret and independent for every word and phase**. This already grants 14,480 unconstrained offsets across 2,896 words. As `29` is prime and each slope is nonzero, the codec is lossless; synthetic original-shaped GP29 English plants, encrypted with independent hidden phase offsets per word, exactly invert in the SFT.

Every within-word five-back difference obeys

`C[w,j]−C[w,j−5] = a[p]·(P[w,j]−P[w,j−5]) (mod 29)`.

Thus each of the five phase-conditioned difference histograms is only permuted by multiplication by nonzero `a[p]`. Its index of coincidence (IoC), including the count-weighted average over the five phases, **cannot be changed by any choices of the secret offsets or slopes**. A simpler wordwise `C=P+key(word)+phase offset` model has the same invariance for the phase-conditioned adjacent `C[j]−C[j−1]` differences.

The observed original lag-five phase counts are **872, 584, 350, 190, 109**. Their exact GP29 difference IoCs are **0.0341429760, 0.0347987500, 0.0344821940, 0.0333054859, 0.0378865104**; count-weighted original **0.0344995653**. The analogous adjacent phase counts are **872, 3397, 2715, 1835, 1241**; their count-weighted IoC is **0.0353591261**.

## Independent native-GP language controls

Two distinct English corpora in `resources/control/` are greedily encoded into the documented GP29 source orthography (including `ING` and `IO`), and 2,896 words are independently drawn with each original printed word length held fixed in every trial. The seed for the 32-bit LCG is `0x13a5c023`. Each control corpus supplies **3,000** independent full 12,956-rune, exact-geometry trials. Every trial has all five observed word/phase histograms computed by the same code. This conditional calibration covers English comparable to these two sources, not all possible plaintext languages or orthographies.

| Invariant | Original | Gibran native controls | Shakespeare native controls |
|---|---:|---:|---:|
| Adjacent-difference weighted GP29 IoC | 0.03535913 | min 0.04401521, mean 0.04580943 | min 0.04214097, mean 0.04372801 |
| Five-back-difference weighted GP29 IoC | 0.03449957 | min 0.04012625, mean 0.04314134 | min 0.04035122, mean 0.04458337 |

An independent **Latin Vulgate already GP29-encoded** corpus, with its original word breaks and GP digraph orthography, supplies **3,000 more length-matched original-shape trials**. Its weighted adjacent-difference mean/min is **0.04556043/0.04403489** and weighted five-back mean/min is **0.04021837/0.03795238**. Zero of 3,000 Latin controls is as low as original on either invariant. This independent non-English check strengthens the direct fixed-slope conclusion while remaining conditional to those finite source registers.

**Zero of 3,000 controls from any of these three corpora** has a count-weighted IoC as low as the authentic LP2 ciphertext for either invariant. The phase-specific five-back IoC minima in the two English corpora are **not individually all excluded**: 12 of 3,000 Gibran controls fall below original phase four alone. The weighted statistic combines all source phases and is the intended bound; isolated individual-phase significance is not claimed.

**Decision:** Under original GP29 word boundaries and ordinary source-native English, the direct five-phase affine cipher with a *global* slope per phase and arbitrary hidden offset per word/phase is incompatible with the measured original corpus. Arbitrary word-specific slopes, transpositions, nonnative plaintext, nonlinear feedback, inserted/dropped runes and additional cipher layers remain outside this theorem.

## Separate five-back equality clue

Within the 2,105 authentic within-word distance-five sites, **104** have identical runes. Of these, **11** are the rune S (GP index 15). A source-conditioned rejection null independently shuffles the runes within each of the 441 eligible repeated-symbol words, preserving the word's exact rune multiset and the **exact original adjacent-equality mask**. The deterministic 3,000-trial control has **mean total 76.106** (two of 3,000 trials at least 104) and **mean S 2.117**, maximum eight S events; zero trials reach 11 S events. The S selection is retrospective and this is a Monte Carlo conditional anomaly, not an established cipher opcode or an authenticated plaintext crib.

Independently sampled native English words with the original word lengths give approximately **121.7** (Gibran) or **123.0** (Shakespeare) five-back equality sites, with about 4–5% of 3,000 native controls below the original 104. Hence the **total 104** is not intrinsically a strong native-language exclusion; the stronger five-phase affine exclusion uses the *value distribution of the lag-five differences*.

## Reproducibility and next fork

The single original-source and native-positive test is [`sims/lp2_word5_shift_difference_original_sft.cjs`](../sims/lp2_word5_shift_difference_original_sft.cjs). It reads `resources/liber-primus/lp2-corpus.json`, the original printed text transcription and the two source-native language control texts. All critical original counts and inverse invariants are asserted. The source-shaped affine and conditioned-shuffle run [passed on native Windows Node.js 22](https://github.com/FlareZ123/liber-primus/actions/runs/44070827346); the logged 3,000-trial shuffle numbers above are taken from that run. The original runes are the fixed observation; no source words, keys, or plaintext were learned from them.

## Stronger word-specific slope model: actual candidate plaintext search

We also test the substantially more permissive cipher `C[w,j]=a[w,j mod5]·P[w,j]+b[w,j mod5]`, with **each of five nonzero slopes and offsets completely independent for every printed word**. This makes the aggregate-IoC exclusion above inapplicable. Even so, for long words, three or more runes from the same phase give an **exact secret-key-independent affine ratio test**. The original manuscript has exactly 57 printed words of GP lengths 11–14: 32 of length11, 18 of length12, four of length13 and three of length14.

We searched every one of these 57 original ciphertext words against two independently supplied whole-word lexicons. A 29,157-entry TextBlob word-frequency dictionary supplies **1,453 native-GP words length11, 772 length12, 382 length13 and 155 length14**. An independently GP-encoded Latin Vulgate text supplies **478 distinct length11, 297 length12, 153 length13 and 77 length14** strings. Each candidate must exactly satisfy all five phase-wise affine constraints for some hidden key, including repeated-rune sites. The test independently encrypts and correctly recovers **400/400 planted English GP words** under random per-word/per-phase affine slopes and offsets.

| GP word length | Original words | English dictionary: zero matches | Latin Vulgate: zero matches |
|---|---:|---:|---:|
| 11 | 32 | 1 | 1 |
| 12 | 18 | 6 | 13 |
| 13 | 4 | 4 | 4 |
| 14 | 3 | 3 | 3 |

Across the original **seven 13–14-rune words**, no candidate survives either supplied lexicon, despite unrestricted per-word key freedom. For the original 12-rune words, 12/18 have at least one English candidate, with some merely coincidental isolated strings (e.g. *prerogatives*, *reverberation*, *sardonically*); **none is authenticated plaintext**. Source word positions and all candidate counts are emitted by the SFT.

This excludes the exact word-specific affine coding of those seven long original words **into either finite native reference vocabulary**, provided the original printed word boundaries and GP rune counts are preserved. It does not prove exclusion for unlisted English/Latin words, novel vocabulary, other languages, ciphertext word resegmentation or multiple layers. The highly secret per-word key family may fit many shorter words, so the surviving isolated dictionary hits are insufficient to identify the author’s operation.

The complete original-input candidate inverse, positive controls and Latin sensitivity are [`sims/lp2_wordlocal_affine5_allsecret_dictionary_sft.cjs`](../sims/lp2_wordlocal_affine5_allsecret_dictionary_sft.cjs); [the final English+Latin Windows Node22 test passed](https://github.com/FlareZ123/liber-primus/actions/runs/44073121675), with both per-length original nonmatch counts and 400 synthetic inverse positives asserted. This is a second, distinct decision from the aggregate five-phase slope gate.

## Original p51 five-back word echo and a second lossless inverse

The **original physical LP2 p51 image `68.jpg`**, immediately after the nine rows of the p49–51 numeric table, prints a word crossing a physical line break: **ᛋᛞᛝᚷᛚᛋᛞᛝ** (GP `S D NG G L S D NG`). It is manuscript printed word **#2723**, at physical p51 local rune offset43; the exact eight GP runes are indices `[15,23,21,6,20,15,23,21]`. The final three runes repeat the first three **exactly five positions later**. The unusual word is present in the original JPEG and in the canonical transcription; it is not produced by a line-joining ambiguity.

Across all 2,896 original words, the maximum **consecutive run** of within-word lag-five equalities is distributed as **2,803 with none, 85 with one, seven with two, one with three**. Thus **eight different words** have at least two consecutive lag-five copies. Under 10,000 source-conditioned word shuffles holding **each original word's multiset and every original adjacent-equality position fixed**, the mean number of words having a run of at least two is **1.7471** (five of 10,000 samples reach the original eight), while the mean number with a run of at least three is **0.0415** (410 of 10,000 have at least one). The stronger double-run concentration is a motivated, retrospective structural clue, with selection and multiple-testing uncertainty. In separate native-source word-length controls, Shakespeare gives a mean **2.574** double-run words (13 of 3,000 reach eight), Gibran **4.799** (321 of 3,000 reach eight); neither has a triple-run word across 3,000 trials. These language differences are substantial and do not identify the original plaintext language.

A more general test asks whether the plaintext itself might preserve this three-rune echo under *any* within-word, within-phase **injective** transform. That requires an eight-rune GP-native plaintext word with `P[0..2]=P[5..7]`, rather than a triple identical ending. Among **4,331** eight-rune English dictionary entries exactly **one** has this pattern: **MESDAMES** (GP `M E S D A M E S`). Among **2,997** independently sourced Latin Vulgate eight-rune word occurrences, exactly **two** have the pattern; both are **TURBETUR** (GP `T U R B E T U R`). These are **formal dictionary candidates under an unproved equality-preserving five-phase cipher**. Neither source supplies an authentic ciphertext-to-plaintext key or a reason to choose either word. The specific seven additional original words with copy-pair runs also constrain full lexical consistency. This accidental-candidate risk limits the evidentiary value of the rare matches.

The five-step lag and the repeated block motivate a **second explicit, lossless model**: a fixed plaintext escape rune `E` causes `C[w,j]=C[w,j−5]` at eligible within-word positions `j≥5`; all 28 other plaintext runes map bijectively to the 28 *nonmatching* outputs by an arbitrary secret 28-ary key. The first five runes of each word have an ordinary keyed start. Both forward and inverse rank-skip encoders are implemented; **1,000 independently hidden native English positive words roundtrip exactly** and copied-output positions match plaintext escape positions.

The authentic p51 eight-rune word is decisive for this literal **single-E** receiver: its three consecutive copy outputs require `P[5]=P[6]=P[7]=E` for **every** possible E and secret key. Among the source-native GP29 words encoded from the 29,157-entry English dictionary and independently GP-encoded words of the Latin Vulgate, **zero eight-rune words end in three identical rune symbols**. Therefore this complete, straightforward 29→29 five-back-copy escape model fails for the witnessed p51 word under those actual English and Latin registers. This is a finite lexical contradiction, not a theorem excluding all invented vocabulary, languages or block-copy rules.

The independent reversible-source SFT is [`sims/lp2_p51_word5_echo_copyescape_original_sft.cjs`](../sims/lp2_p51_word5_echo_copyescape_original_sft.cjs), [passed on native Windows Node22](https://github.com/FlareZ123/liber-primus/actions/runs/44073703227). Its source word location and original run counts are pinned; positive encrypt/decrypt plants and 10,000 conditioned word nulls are executed in one file. A generic variable-length **copy-block** mechanism would require its own explicitly authored trigger and copy length, and should not be inferred from the existence of this striking ciphertext echo alone.

## Decision and next fork

The direct five-phase affine family has two complementary negatives: fixed global slopes fail a key-independent whole-corpus invariant even with arbitrary word keys; freely changing slopes fail exact candidate compatibility for all original words of length13–14 within the two specified natural-language dictionaries. An alternative model needs its own independent first-party clue selecting a real key/update rule or a richer encoding register. The additional p51 echo suggests a block-copy or five-step feedback lead, yet the natural single-escape source receiver fails the eight-rune word. Repeating unconstrained five-position affine, fixed-copy or key-period sweeps cannot recover plaintext from these facts alone.


