# All 8! secret p50 column orders fail to restore original native-GP word grammar

**Agent9, 22 November 2026. Keyed whole-word transposition decision with positive plants, full-search null and original source.** The [original-cipher SFT](../sims/lp2_p50_eightcolumn_allkey_wordinverse_sft.cjs) passed [Windows Node22 GitHub Actions 44973063346](https://github.com/FlareZ123/liber-primus/actions/runs/44973063346). This rules out the finite standard 8×362 column-read family as a *standalone* recovery of source-native English word order, even when the eight-column secret order is entirely unknown. No rune key, unknown plaintext, or destination is recovered.

## Original clue and critical alternative

The 2016 authentic Cicada instruction says the manuscript's **words are the map** and **numbers are the direction**. The original physical p50 numeric artifact has **eight printed columns**. The exact original 55 rune-bearing unresolved physical LP2 pages carry **2,896 authentic complete printed words = 8×362**, including all 32 words extending across physical page breaks. Those two facts suggest a standard whole-word 8-column transposition in which an arbitrary column order might need to be read off the numeric panel. Earlier source-gated work tested only the two **unkeyed** p50 readout directions and ruled out a single 16-column p15-family receiver. Testing a **secret** eight-column column order is a new bounded alternative with no additional unknown data.

The strongest objection is that 2,896 being divisible by eight could be coincidental and no first-party author instruction explicitly specifies the 8×362 page-spanning shape. The challenge here is therefore to make the broad 8-column model pass an original English-like word-length test **before** searching a rune-cipher key.

## Exact original inverse and null

Take the printed original word-length sequence in original order, preserving all 2,896 word lengths and 12,956 runes. Partition into **eight consecutive source blocks of 362 words**. For each possible permutation `π` of eight source blocks, form the candidate original plaintext-length order by reading a 362×8 rectangle row-major with output columns `π[0]..π[7]`. The search covers all **8! = 40,320** arrangements, including both first-row p50 table selectors: sort its original eight base60 bytes ascending or descending, with their two inverse readout orders, and the literal printed order. Original words are never cut or changed. The proposed operation is an exact bijection of word tokens.

The grammar score is the exact previously frozen [p50 eight-column GP-native adjacent-length log-likelihood ratio](../sims/lp2_p50_eightcol_2896word_fixed_inverse_sft.cjs), trained on the first 8,500 Gibran and 40,000 Shakespeare words using source-calibrated GP spelling (including NG/ING and IA/IO). There are 12 fixed length classes: 1–11 and 12+. The original candidate score maximization is computed without fitting or evaluating an unknown plaintext glyph.

Crucially, the **full familywise null** makes **500** fixed-seed (`0x3301f0c5`) exact within-chapter permutations of the original word lengths, preserving every one of the original nine chapter word counts `[158,255,383,437,224,326,378,669,66]`, and repeats the **entire 40,320-key maximization** for each null sequence. This charges all unknown-column postselection. Absolute English-like score and original vs null rank must both support a decoder.

## Results

| Eight-column inverse | Source column order (zero-based) | Native-GP adjacent-length LLR |
| --- | --- | ---: |
| Identity column order | `[0,1,2,3,4,5,6,7]` | **−0.01269881** |
| P50 first table row ascending bytes | `[4,6,2,7,3,0,1,5]` | **−0.01545497** |
| P50 first table row descending bytes | `[5,1,0,3,7,2,6,4]` | **−0.01795598** |
| Best among all **40,320** secret arrangements | `[6,5,4,7,0,2,1,3]` | **−0.00439684** |
| Unmodified printed word order | Original | **−0.01864546** |

Matched 500-null maximum-score mean is **−0.00398756**, median **−0.00406460**, minimum **−0.00887235**, maximum **+0.00158721**. The original secret-key optimum **−0.00439684** is **worse** than the matched-null mean, with plus-one upper-tail **p = 0.5788423**. Thus its score gain over the printed original comes from permissively optimizing 40,320 columns, rather than from a statistically distinguished original word route.

Two genuinely heldout native-GP word sequences of exactly 2,896 words are planted into the same 8×362 cipher. The encryption uses the literal first-row-ascending source permutation and is fully inverted without loss, recovering all **2,896/2,896** word lengths in each case. The secret-key exhaustive optimizer correctly identifies **the exact planted column order** in both control passages; the positive controls recover source-native English length scores **+0.01059275** (Gibran) and **+0.01367841** (Shakespeare), after printed encrypted scores **−0.01249889** and **−0.01351410** respectively. Therefore the finite family and original input are calibrated with genuinely successful cipher inverses.

## Decision and proper scope

Reject the entire **single-pass, full-register, eight-consecutive-column-block, arbitrary-secret-column-order** family as a complete restoration of source-native English printed word order in the original LP2 book. The p50 32×8 panel supplies a meaningful starting clue but the restored grammar signal does not survive the 40,320-key matched null. Since a ciphertext **alphabet** substitution alone preserves original word lengths, adding a separate rune substitution after this proposed word inverse cannot repair the missing word-length grammar. The original anti-repeat structure at word boundaries also requires a cipher-order explanation if a word transposition was used.

This does **not** rule out page-local/chapter-local word shuffling, nonrectangular/variable-length maps, a separate secret permutation of word identities, changed word delimiters, languages outside these controls, multiple transposition layers, post-emission cipher reordering, or a word route whose output is deliberately non-English. Such variants require an **independent first-party selector** before further brute force.

**Evidence:** original source and source-native controls in [reproducer](../sims/lp2_p50_eightcolumn_allkey_wordinverse_sft.cjs), previous fixed-key gate [p50 8-column SFT](../sims/lp2_p50_eightcol_2896word_fixed_inverse_sft.cjs), [successful Node22 Windows run](https://github.com/FlareZ123/liber-primus/actions/runs/44973063346).
