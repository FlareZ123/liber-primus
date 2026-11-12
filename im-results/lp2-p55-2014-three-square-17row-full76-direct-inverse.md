# Full p55 76-rune inverse using seventeen historical 2014 magic-square rows

**12 November 2026, Agent45. Source-locked direct-word-row Vigenère test, both signs, exact original 76-symbol forward replay and 60,000 source-native length-matched controls. No unknown plaintext or original key.**

## One-step human-puzzle construction

The 2014 fifth-onion public puzzle contains [three preserved magic squares](../resources/cicada2014-openpuff-magic-squares.txt) of dimensions **5×5, 7×7, 5×5**. The next signed sixth-onion stage required applicants to submit these three squares before receiving new Liber Primus pages. Their **5+7+5 = 17** original printed rows match **17** word segments visible on original physical LP2 p55. Unlike the earlier **43-inner-cell** correspondence, this proposes a **whole-page original-cipher consumer** because all p55 rune groups have corresponding rows.

Keep the 2014 order, matrix row order, physical p55 word order, standard GF29 rune indices and original word breaks fixed. Treat each square row's numeric values modulo29 as an ordinary Vigenère key, repeated as necessary **inside each word**, resetting at the next word. Precisely: for visible p55 word segment i, rune j, use K(i,j) = squareRow_i[j mod width_i] mod29, then decode P = (C−K) mod29 or P = (C+K) mod29. No fitted phase, alphabet, row permutation, scalar or extra layer. Row widths are **[5,5,5,5,5,7,7,7,7,7,7,7,5,5,5,5,5]**. P55 visible segment lengths are **[1,4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3]**, totaling **76** runes.

This operation is **hypothetical**: the historical source does not specify a row-to-word key, Vigenère or cyclic expansion. A 13-rune source word necessarily cycles the 7-cell row, and the page's initial singleton is the last rune of a word carried from p54. No previously identified clue selects how to handle that cross-page word. These choices are frozen as the simplest complete 76-position scheme rather than tuned to plaintext.

## Original-input result

The 2014 source produces a deterministic 76-position row-key sequence. Both directions exactly forward-reencrypt **76/76** unchanged original p55 GP rune values and recover the source-native planted 76-rune control **76/76**.

| Fixed source-row decoder | GP29 within-word bigram score (mean natural log per pair) | Output |
| --- | ---: | --- |
| Original ciphertext, no change | **−6.25821** | Nonlinguistic |
| Subtract square row, C−K | **−5.68491** | Nonlinguistic |
| Add square row, C+K | **−5.98354** | Nonlinguistic |

The complete source-subtraction output, with pipes separating **original** printed word segments, is:

OE | AMRB | IAG | TF | GAPBOT | OEFLUWP | RP | AEEAATAEAESPPODGE | OHXSROE | THXIAW | CW | NGUEOMIHH | WOEMTAEWOE | PY | JSGGJL | CIT | JOB

The complete source-addition output in the identical segmentation is:

L | YMTY | OEA | EON | AFEAFUC | WAEEAROE | IA | NEACEOAPTYPPMCG | GOEOIOEW | OTHYO | MF | GGHOEEROE | FHCBHFH | LE | EAEOXOEAH | EOEOS | DRO

Both remain GP29 nonlinguistic. The apparent English letters in rune transliteration are not decoded prose.

The language test scores **only the 59 original within-word adjacent rune pairs**, with no invented cross-word pair. The frozen model is Shakespeare-trained GP29 rune bigrams with pseudocount 0.25, using standard GP Q/K/V/Z substitutions and longest multigraph encoding. Draw 20,000 actual GP-converted words of each of the 17 **exact original** word lengths from each pinned Shakespeare, Gibran and Emerson text; compare the same score:

| Source-native control (exact word lengths) | 20,000-run minimum score | 20,000-run mean score | Controls at or below either decoded score |
| --- | ---: | ---: | ---: |
| Shakespeare | **−2.97412** | **−2.37634** | **0** |
| Gibran, held out | **−3.11503** | **−2.40846** | **0** |
| Emerson, held out | **−3.12313** | **−2.42804** | **0** |

The two source-fixed decoders score below **all 60,000** matched native word samples by more than 2.56 log units per within-word pair. The source-native 76-symbol positive plant with the same row cycling exactly recovers all words; this tests the full operation at the correct lengths. These source controls are finite English-like prose samples and cannot rule out an intermediate non-English encoding.

**Decision:** Reject the simplest **seventeen historical square rows as repeating per-p55-word Vigenère pads** in both signs, on the unmodified original 76-rune page. The result does not qualify as a waiting Director #41 complete source-selected decoder, because the 2014 source does not prescribe the key schedule and outputs are nonlinguistic. The separate 43-interior pure-permutation and GF29 Hill inverses are [recorded here](lp2-p55-2014-magic-squares-three-core-hill-original-inverse.md). Retain the physically real square geometry for a new original instruction. No phase/row/offset permutations are justified by this direct negative.

[Complete original-input CommonJS script, exact forward replay, and native controls](../sims/lp2_p55_2014_three_squares_17row_full76_sft.cjs).
