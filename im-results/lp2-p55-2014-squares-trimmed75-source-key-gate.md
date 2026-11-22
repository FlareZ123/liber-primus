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

The exhaustive checks over the **specified twenty-four direct/differential source-tape tests**, all original 76 glyphs, all complete-word boundaries, and twenty-four encrypted solved-p57 planted controls are in the [reproducible Windows/Node22 SFT](../sims/lp2_2014_three_square_trimmed75_p55_sft.cjs). The completed initial source-only regression is [Windows PASS 44941117814](https://github.com/FlareZ123/liber-primus/actions/runs/44941117814). The augmented, source-native 29,060-entry lexical-holdout regression also passed [Windows run 44941344249](https://github.com/FlareZ123/liber-primus/actions/runs/44941344249) with the complete original 75-rune input and the solved-p57 positive control.


## Full-physical-page difference-feedback consumer

The exact same source-selected 75-cell length also fits a **reversible 76-symbol original-input mechanism**: retain physical p55's first glyph as the initial ciphertext state, take precisely **75** successive modular GP29 differences `D[i]=(C[i+1]-C[i]) mod29`, and apply any of the same twelve source-square masks to `D`. This makes the unmatched p54→p55 carried glyph an explicit IV rather than silently deleting it. Rebuilding ciphertext from the preserved IV and the inverse masked differences reconstructs **all 76 original p55 glyphs**; separate source-native solved-p57 planted passages roundtrip through the same 76-symbol mechanism. It remains a proposal, because no creator instruction currently says to take these differences or use these square values.

The source p55 has **one** equal-rune step across the 75 observed increments. All **twelve** differential-feedback candidates have IoC under **0.04**, and all **twelve** have **zero** recognized source-native English words of length six or more in the seven complete-word positions. The short matches are incidental; none yields continuous prose. This closes these **fixed source-key feedback consumers**, while leaving unknown evolving feedback rules or a genuinely authored different key open.

## Extended p56-style F-interrupter exact inverse (Agent24, 22 November)

The preceding row/spiral no-skip trials are complemented by an explicitly **F-transparent** inverse using the **two source scalar registers, row-major historical order, both whole-register directions and both additive signs**. The 75 original p55-body ciphertext runes include F at local body offsets **14, 24, 40**. Exhaustively enumerate their eight possible transparent-F bypass masks; a designated F outputs plaintext F and consumes no key, while any key-consuming decryption that itself produces F is disallowed under the authenticated solved-p56 model. The eight fixed register/sign cases × eight masks give **64 original hypotheses** with **no free phase, fitted crib or tuned key**.

Only one register family is mathematically F-compatible: **historical raw numbers mod29, forward order, decrypt P=C+K**, with masks **0,3,5,6**. All 56 alternatives in the other seven families fail the F-through domain constraint. The four surviving original 13-rune word outputs are **ICEACAHRTPPMCG / CNGFLNISDTMNGAEI / CNGGPURMHAHYEY / ICFPURMHAHYEY**. Their 75-rune IoCs range **0.031351–0.035315**, and none matches any of 426 GP13 native reference words extracted from the pinned English-frequency, Gibran, Shakespeare, Emerson, Blake and solved LP1 controls. The surviving masks are **algebraic viability**, not authentic decipherment: no candidate reads as English.

As a strong source-positive control, the same F-interrupter encrypt/decrypt path reproduces the **actual first 75 plaintext runes of authentically solved p56**, preserving its known literal F at local56, exactly 75/75 for every one of the eight source-key scalar/direction/sign families. This checks the difficult F clock independently of the original p55 outcome. [Complete additive+F SFT](../sims/lp2_p55_original_three_2014_squares_75_directkey_sft.cjs) · [Windows Node22 PASS 44981850177](https://github.com/FlareZ123/liber-primus/actions/runs/44981850177). The original p55 transcript's two merely visual `/<newline>` continuations are joined before validating all original word lengths and runes.

**Updated decision:** Source-specified p56-style F skipping does **not** rescue the previously documented 75-square additive inverse; all four surviving paths remain nonprose. This closes a motivated but formerly untested F-clock exception while retaining the existing boundary and source-order caveats.

## Research decision

The **triple-square-to-75 local-rune alignment** is a source-based way of proposing a p55 operand, but it does not select any of the tested reversible operations. Both the direct GP29 masks and the full-original-input differential-feedback inverse yield no recoverable plaintext. Retire these **twenty-four fixed direct and feedback additive/totient mask readings** rather than searching arbitrary square symmetries, extra shifts, alphabet assignments or optimized periods.

A positive successor requires an original author/player-visible instruction for **how** the three squares or their rings operate as a reversible cipher, and how the carried first p55 rune is interpreted as plaintext rather than only as an IV. The present feedback variant reconstructs all 76 ciphertext symbols but provides only 75 tentative decoded symbols. A clue establishing either would be substantive new evidence; merely observing the 75-cell match again would not.

Related independent source/receiver decisions: [p55 GP25 square family](lp2-p55-gp25-ranked-square-playfair-bifid-original-gate.md), [2014 Stage10 source form boundary](2014-stage10-three-square-pp49-51-original-fixed-layout-gate.md), and [current manuscript synthesis](../results/README.md).
