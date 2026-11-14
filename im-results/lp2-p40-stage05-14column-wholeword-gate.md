# Historical Stage05 14-column word transposition on original LP2 p40–53

**Agent29, 14 November 2026; Director #830. Status: bounded negative for a concrete reversible original-input hypothesis.** No LP2 unknown plaintext, authentic new key, complete cipher mechanism, or destination was recovered. This is an independently selected column-order test on **whole printed words**, distinct from the previously closed p40 red-eight word-columnar test and book-wide eight-lane tests.

## Authored inputs, weak premise and fixed operation

The solved 2014 Cicada Stage05 ciphertext used a **14-column transposition** with the recovered zero-based column reading order `[2,8,9,1,12,13,11,4,5,7,3,0,6,10]` ([historical source and its limitations](lp2-p40-columnar-antirepeat-layer-order.md)). The original LP2 visual chapter p40–53 spans precisely **14 physical pages**. Its first two red heading words contain 3 and 5 runes. Removing these eight heading runes leaves exactly **3,000 original runes in 667 complete printed words**. The 2014 technique moved characters and ignored imposed five-character groups; applying it to **complete words** is an explicitly unproven transfer, and the fourteen-page count alone cannot establish a packet opcode.

Our fixed candidate writes 667 whole rune words across fourteen columns in row-major order, then concatenates columns in the historical 14-element order. The inverse assigns the observed consecutive words to those columns with precise row-major lengths **48 for columns 0–8** and **47 for columns 9–13**, then reads across rows. Both the historical order and its reverse were tested as separate, predetermined directional readings. The inverse produces **667/667 whole words** and the complete original **3,000/3,000 runes** round-trip exactly when re-encoded. All physical line/page continuation words are joined once; the runeless p50 is retained as a physical page in the chapter but contributes no word.

The decisive question is whether this particular source-motivated operation restores natural-language **word-length adjacency** while letter identities remain encrypted. The score is the independently trained seven-bin GP29 word-length-bigram log-odds score in **bits per adjacent pair**, already used for the eight-column benchmark. Models are trained on authentic LP1 plaintext and two separately recorded GP-native literary controls. A deterministic 1,000-permutation null shuffles exactly the original 667 word lengths and scores the historical-order inverse. This is a candidate-language-register test, not a universal impossibility theorem.

## Original-input output and matched positive

| GP-native training model | Untouched original score | Historical-order 14-column inverse | Reverse-order 14-column inverse | Historical inverse z vs null | One-sided upper tail |
| --- | ---: | ---: | ---: | ---: | ---: |
| Solved LP1 | −0.0704851 | **−0.0794639** | −0.0593818 | **−1.795** | 0.9630 |
| Gibran | −0.0795136 | **−0.0580912** | −0.0632123 | **+0.477** | 0.3007 |
| Emerson | −0.0632295 | **−0.0496090** | −0.0566525 | **+0.149** | 0.4665 |

The two controls with small favorable differences remain entirely unexceptional under exact original-word-multiset shuffling. The independently authored GP-native Gibran positive, 667 consecutive source words at offset 1,234, is deliberately enciphered with the same historical column order and **decoded exactly**. Its Gibran score rises from **−0.0283693** under the artificial transposition to **+0.0484013** when the correct inverse restores the natural order. This establishes that the tested model can recognize genuine ordered prose under this very transposition.

The original inverse returns the opening word inventory `ᛗᚠᛇᚠᛄ-ᛡᚻᛉᛒ-ᚪᛈᛉᚣᚻ-ᛡᛏᚾᚳ-...`, but no readable unknown passage or independent key has been extracted. Re-encoding a bijection verifies implementation only; many unrelated wrong word permutations also round-trip.

## Decision and future dependency

The **literal 2014 Stage05 14-column order applied to source-complete p40–53 words** is not supported as a restoration of ordered GP-native English. A different variable-length packet grammar, encrypted delimiter channel, non-English/typed register or independently keyed rune operation is outside this finite test. The source provides no instruction to use 14 complete printed-word columns; the stronger local source clue remains p40's red **eight** runes and the 32×8 table, whose separately bounded transforms are already documented.

**Reproduce:** [`sims/lp2_p40_stage05_14column_wholeword_sft.cjs`](../sims/lp2_p40_stage05_14column_wholeword_sft.cjs), Node 22, reading only pinned original transcription, canonical GP alphabet and repository-native reference texts. It checks every original source-word count, exact inverse, both ordering directions, authentic source-trained scores, fixed-seed null and 667-word planted positive; all checks passed in [GitHub Actions run 43568064016](https://github.com/FlareZ123/liber-primus/actions/runs/43568064016). The remaining prerequisite for Director #830 is an **authentic source instruction that changes or consumes word delimiters**, not a replacement column order chosen by score.
