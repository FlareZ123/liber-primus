# Original p55 75-runic body and the 2014 three-square 25+25+25 route

**21 November 2026; Agent49. Classification: historically motivated but unselected cross-round GP29 additive-key hypothesis. Its direct original-cipher tests are negative; no plaintext or key material is recovered.**

## Player-visible selection and competing explanation

The historical 2014 Stage10 square-form source order is **5×5 sum3301; 7×7 sum1033; 5×5 sum1033**, with original numeric matrices in [the preserved source](../resources/cicada2014-openpuff-magic-squares.txt). The independent source-authenticated solved p57 manuscript instructs: **“SHED OUR OWN CIRCUMFERENCES.”** On the three squares, retain the first and third 5×5 unmodified, and remove the perimeter of the middle 7×7 to obtain a second 5×5. All three objects then contain exactly **25 numeric cells**, or **75** source-ordered values.

Original physical LP2 p55 contains **76** GP29 runes; the first is the end of a p54 word, leaving **75** locally owned runes in 16 complete source-printed words, with lengths
`[4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3]`. This exact **25+25+25 ↔75** correspondence is a potentially actionable human clue. An alternative explanation is a count coincidence across independently authored 2014 Stage10 and LP2 objects. The source does **not** instruct a reader to add three square-cell values to p55 runes or prescribe whether to use numbers, totients, row order or spiral order. Thus it is a proposed operation, **not** an established decipherment route.

## Original-input experiment, without fitted source keys

Freeze the three source squares in historical order. Strip precisely the middle 7×7 perimeter. Concatenate the three 5×5 matrices, either in ordinary row-major order, clockwise inward spiral beginning at upper left, or complete reverse of that spiral, **independently within each square**. Use every cell as either:

1. its exact printed integer modulo29; or
2. Euler's totient `φ(integer)` modulo29, motivated by the literal LP1 *SOME WISDOM* instruction to honor primes and the totient function.

For each of these six fixed source tapes, test the two GP29 additive inverse polarities `P[i]=(C[i]±key[i]) mod29` on the 75 locally owned p55 glyphs. Preserve all 16 printed word lengths. This is a predeclared **twelve-case** family; no alphabet relabeling, ordering optimization, per-word fitting, secret additional phase, or numeric-substitution rescue is allowed. Every case admits exact forward reconstruction, which alone is only an algebraic check.

**Direct results:** none of the twelve 75-rune outputs is coherent GP-native English. All twelve GP29 indices of coincidence lie below **0.04**. The highest of the twelve is the raw/row-major/subtract variant at **0.037837838**; compare the original 75 local runes at **0.038558559** and independently solved clear p57 first75 at **0.059459459**. Because some genuine 75-rune English passages can themselves have lower IoC, frequency alone is **not** claimed as a theorem excluding all natural language.

The source-native **word check is stronger**. The source lexicon `resources/control/english_wordfreq_textblob.txt` has **29,060 distinct GP rune-sequence types** after the same spelling calibration that reproduces original solved LP1/p57. Under the genuine p57 word segmentation, the lexicon recognizes **16/20 words, including three words of six or more runes**. On the twelve p55 decrypted candidates, **zero** original long-word positions (seven per candidate, lengths `6,6,13,6,7,7,6`) match the lexicon. The best individual outputs only match one to three short GP words such as *AS* or *US*, with no continuous readable phrase.

The exhaustive checks over the **specified twelve direct source tapes**, all original 75 glyphs, all complete-word boundaries, and twelve encrypted solved-p57 planted controls are in the [reproducible Windows/Node22 SFT](../sims/lp2_2014_three_square_trimmed75_p55_sft.cjs). The completed initial source-only regression is [Windows PASS 44941117814](https://github.com/FlareZ123/liber-primus/actions/runs/44941117814). The augmented, source-native 29,060-entry lexical-holdout regression also passed [Windows run 44941344249](https://github.com/FlareZ123/liber-primus/actions/runs/44941344249) with the complete original 75-rune input and the solved-p57 positive control.

## Research decision

The **triple-square-to-75 local-rune alignment** is a novel source-based way of proposing a p55 operand, but it does not select any of the tested reversible operations, and its straightforward direct-key consumers fail against the intact original ciphertext. Retire all twelve fixed direct additive/totient mask readings rather than searching arbitrary square symmetries, extra shifts, alphabet assignments or optimized periods.

A positive successor requires an original author/player-visible instruction for **how** the three squares or their rings operate as a reversible cipher, and **how** the carried first p55 rune is restored in a complete76-rune decoder. A clue establishing either would be substantive new evidence; merely observing the 75-cell match again would not.

Related independent source/receiver decisions: [p55 GP25 square family](lp2-p55-gp25-ranked-square-playfair-bifid-original-gate.md), [2014 Stage10 source form boundary](2014-stage10-three-square-pp49-51-original-fixed-layout-gate.md), and [current manuscript synthesis](../results/README.md).
