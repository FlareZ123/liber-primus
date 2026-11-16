# Printed labels 1–5: literal indexing and five-share original-input decision

**Status (16 November 2026): no unknown plaintext or source-selected decoder.** The original 53.jpg–55.jpg print five red Arabic numeral labels 1, 2, 3, 4 and 5 inside the p33–39 cuneiform chapter. The 10-dot brackets enclose exactly **553 GP29 runes in 122 printed words**, divided into authentic lengths **139 / 91 / 98 / 96 / 129**. The fourth numbered unit crosses the p37→p38 physical boundary; the fifth contains a short second sentence before the next large red separator. This matters to the actual reading order.

The source-visible labels motivate a finite human-readable first hypothesis: take the first or last rune of each unit, take the `n`-th rune of the first printed word of unit `n`, or take the initial/final rune of the `n`-th printed word of unit `n`. These are literal, parameter-free book-code readings of the numbers, without selecting runes by their expected meaning.

| Original-source-only operation | Five GP transliteration outputs |
| --- | --- |
| First rune per numbered unit | L, N, D, NG, H |
| Last rune per numbered unit | A, B, W, M, C |
| `n`-th rune of first word of unit `n` | L, Y, P, J, B |
| Initial rune of `n`-th word | L, N, R, D, H |
| Final rune of `n`-th word | OE, I, W, E, Y |
| `n`-th rune of `n`-th word | L, U, I, **undefined**, NG |

None spells an identifiable instruction. The doubly ordinal reading is **not even defined** on section 4: its fourth printed word `DE` has only two GP runes. Extending to arbitrary alternate indexing, concatenations, reversed readings or anagrams would lose the original source selector.

A mathematically different rival is to interpret printed labels as **five x-coordinates for a GF(29) five-share polynomial**, by analogy with Shamir-style sharing. Over the **91-rune common prefix only**, interpolate at `x=1,2,3,4,5` and read each recovered coefficient as a candidate message. The unique inverse Vandermonde matrix is

```text
 5 19 10 24  1
25 13 24 15 10
 9 24  5 27 22
26  7 26 26  2
23 24 22 24 23
```

Five coefficient streams of 91 runes each yield IoCs **0.039072 / 0.031746 / 0.038095 / 0.036386 / 0.030769**. All remain nonprose in their unchanged GP transliteration; the candidate `x=0` secret opens `IALWTPWTEOJOJCXMHUIAPTHEAAJWOWMUNGPMTHSMGRUBFWHM...`. Exact five-way original reencryption succeeds, as it must for any invertible matrix. The original passages' **unequal lengths** give no authored common-share alignment or tail recovery for the remaining 98 runes. This is an exploratory *negative*, not evidence that Shamir was actually intended.

**Reproduction:** [source-native Windows Node22 SFT](../sims/lp2_p36_38_numbered_index_lagrange_sft.cjs), with [successful original repository manual Actions run 43907425417](https://github.com/FlareZ123/liber-primus/actions/runs/43907425417) (only the new gate executed; previous jobs skipped). The script reads original `lp2-transcription.txt` and canonical GP29 corpus, asserts all five authentic boundaries and word counts, calculates exactly these index readings, inverts the frozen GP29 Vandermonde and checks all 455 original prefix glyphs are restored. No cipher key is inferred from language score.

**Research decision:** The printed ordinal structure alone currently specifies passage order and straightforward possible letter selections, but **does not identify a full reversible 553-rune decipherment operation**. Previous source-family inverses (Wisdom-square masks, all-legal-F prime transfer, column interleaves, Wisdom matrix and five-state feedback) already fail for this enclosure; repeating them is unproductive. An actual authorial instruction selecting the operation, position clock and unequal-length treatment is the missing prerequisite. If that independent selector appears, freeze it before testing p36–38 and a separate untouched chapter. Until then, retire the nonunique extraction/share branch without asserting a general impossibility for the five passages.
