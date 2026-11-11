# Signed 2016 words/map: original-manuscript grammar gate (Director #357)

**Agent 21, 11 November 2026. Evidence status: source-locked original-input obstruction; no new unknown plaintext, authentic key, inverse or destination.** The GPG-authenticated 2016 sentence is: “Liber Primus is the way. Its words are the map, their meaning is the road, and their numbers are the direction.” Here *Its* refers to Liber Primus. This study evaluates two genuinely distinct literal interpretations using original printed words. It does not reuse #304's 43-word map made from the **signed message's own words**.

## Authenticated inputs and selected map

The 2016 signed JPEG is 563×569 pixels with the same tree as LP2 physical p32, archive 49.jpg. Its p32 rune text has 121 runes at global offsets [7839,7960), exactly 11×11. Original source-order GP prime weights total **563** across the first row and **569** down the first column. This selects the tree-page arrangement and width/height orientation independently of any guessed output ([source gate](lp2-tree121-signed2016-source-gate.md)). The image and signed text supply **no numbered map origin, step code, key, stopping rule or numeral reduction**.

Authentic older Cicada precedent supplies two conflicting definitions of a word's "number": **sum its rune GP-prime values**, demonstrated by the 2013 0_wisdom→2014 1033 square and the original 761.MP3 title; and interpret its GP29 rune sequence as a **positional BASE29 integer**, authenticated by the signed 2013 TCP challenge. Neither is designated as the 2016 directional encoding.

The source-visible first p33 red-titled body is the 91-rune / 23-word unit at global offsets **[7960,8051)**. The terminal p55 physical page contains 76 runes at **[12880,12956)**, but its first rune completes a **cross-page 11-rune printed word starting at 12870 on p54**. Thus it contains 16 *complete local words* in the other 75 runes. Treating 17 page fragments as 17 complete words would alter the authentic numeric inputs.

## Grammar A: word numbers directly index the 121 tree-map cells

The strongest direct address reading is: use historically established GP-prime **word sums** as 0-based row-major cell indices 0..120 in the image-selected p32 map. Its range fails before the output is examined.

| Original input | Whole words | Valid unmodified GP-prime addresses 0..120 | Valid positional BASE29 addresses 0..120 |
| --- | ---: | ---: | ---: |
| p33 first 91-rune unit | 23 | **6/23** | **0/23** |
| p55 16 local complete words | 16 | **5/16** | **1/16** |

All 23 p33 source-ordered GP prime sums:

    130,249,124,594,358,185,137,323,63,184,390,137,109,
    202,223,534,150,123,70,42,110,171,110

All 16 p55 complete-word prime sums:

    222,114,118,306,283,30,596,365,138,108,341,
    291,88,284,129,159

The p54→55 carry word, treated correctly as one whole printed word, has sum **521**. A complete 121-cell mapping requires a *new* reduction (e.g. modulo121, quotient/remainder or prime rank), plus an origin and a rule for reading results. No original 2016 or p32 cue selects one of them. Refusing to fit a reduction to attractive output is a source-evidence decision, not a negative test of all possible future map ciphers.

## Grammar B: words drive a path; their sums specify moves

A different literal grammar interprets printed words as ordered route instructions, with each word's **meaning** defining a road or landmark and its **numeric weight** specifying a direction. The p32 image provides a map representation, but no compass legend, coordinate start, movement units, word-selector, stopping event or glyph extraction convention.

A raw GP-prime word sum is never an eight-direction digit 0..7 in either source unit (**0/23 p33 and 0/16 p55**). Literal degree headings require further normalization: **3/23 p33** and **2/16 p55** sums exceed 359. Modulo8, modulo360, relative turns, prime ranks or wrapping would be new independent choices. More fundamentally the signed sentence refers to the words' *meaning*, unavailable for undeciphered LP2 text. This may be an instruction to follow after plaintext is recovered rather than an instruction to recover plaintext.

The original image identifies **p32** for a solver. It does not independently nominate p33's 91-rune first passage or p55's final 76-rune page as the next cursor, so neither offers a justified blind prediction. Starting one route on either page and choosing operations according to emerging English fragments would repeat the existing post-selection problem.

## Completion and next causal decision

**Both frozen direct grammars are underdetermined.** Direct cell addresses and bare compass digits fail an exact original-data capacity gate. A complete direction/road grammar cannot be frozen without adding unsupported conversion, origin, selection, stop and output rules. Therefore no speculative decoder+encoder was run, and no original plaintext was recovered. This closes the two literal *unreduced* transfers only, without excluding a map-based solution or missing external state.

An actionable successor needs a primary source that fixes **which complete word sequence**, **which numeric codec**, **how to map a number to direction/coordinate**, **the start and stop**, and **what original symbols to output**. An independently decrypted passage providing these rules would also suffice. No successor based solely on this source sentence is warranted.

[Single-file CommonJS original-input SFT](../sims/lp2_signed2016_word_map_grammar_gate_sft.cjs) reproduces the exact signed sentence, source blob, GP-prime image row/column sums, full p33/p55 word-sum vectors, p54→55 carry and finite numerical bounds. This is a capacity/grammar test rather than a solved cipher.
