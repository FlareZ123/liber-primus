# p27/p55 repeated 7-gram: periodic-key gate

**Status:** intermediate negative; no plaintext or key recovered.

## Source observation

The exact seven-character ciphertext string ᛞᛄᚢ-ᛒᛖᛁ occurs exactly twice in the first 55 rune-bearing LP2 page segments:

- Physical p27, printed line 2, raw character offset 10; page-local rune offset 28; line-local rune offset 8.
- Physical p55, printed line 4, raw character offset 3; page-local rune offset 70; line-local rune offset 2.

It is six runes with a word separator between two three-rune words. The repeated phrase is a ciphertext observation, **not** a known-plaintext crib. Its two occurrences align under several simple clocks:

- Page-reset rune clock, period 6: offsets 28 and 70 are both phase 4; the six rune phases are [4,5,0,1,2,3].
- Line-reset rune clock, period 6: offsets 8 and 2 are both phase 2; phases [2,3,4,5,0,1].
- Line-reset character clock, period 7 counting the hyphen: raw offsets 10 and 3 are both phase 3; rune phases [3,4,5,0,1,2].

This makes period-6 and period-7 reset clocks plausible hypotheses to test, but does not select either cipher.

## Terminal-page link and source-visible wing/moth motif (14 November 2026)

The p55 occurrence is at page-local offset **70** of precisely **76** runes, so the repeated `D.J.U-B.E.I` occupies the **last six original ciphertext runes** on the **last unsolved page**. In the earlier p27 occurrence it starts at page-local rune offset **28** of **234**; the physical page-number difference is also **55−27 = 28** (all LP2 page numbers and rune offsets zero-based). These are different facts from a period-6 phase coincidence. Across **all 55 rune-bearing unknown physical pages**, an exhaustive search for each page's final *six runes* as a contiguous six-rune substring on a *different* original page returns **exactly one directed match, p55 terminal → p27 offset28**. At lengths five and four, the same path remains, with the length-four check also finding p40→p4. This is a source-exact terminal cross-reference candidate selected without fitting a key.

On the original original JPEGs, physical p27 / scan `44.jpg` has a prominent single illustrated **insect wing** above its red title, and p55 / scan `72.jpg` has a full **moth** beneath the script. This is a thematic visual association alongside the exact repeated runes, **not** an established same-artwork edit or cryptographic instruction. Earlier [shared-moth source studies](lp1-lp2-crossrelease-artwork-raster-copies.md) link *different* source scans; the wing/moth analogy here requires no assumption of pixel identity.

**New clue-constrained numeric cross-check.** The two **complete printed cipher words** at the matched footer have GP prime sums **DJU = 89+37+3 = 129** and **BEI = 61+67+31 = 159**. Their total **288** satisfies **288 mod 29 = 27**, matching *exactly the page where the same complete two-word ciphertext appears*. Independently using the two ordered word values as a **difference**, **(129−159) mod 29 = 28**, matching *exactly the rune offset of that copy on p27*. These are the two coordinates **(p27, offset28)** of the genuine repeated ciphertext, produced by the simplest two operations on the same two original whole-word prime sums. Thus the genuine signed 2016 instruction that the manuscript's **words** and **numbers** convey **direction** could motivate an actual finite operation: add the six footer runes' published GP prime values and reduce modulo the **29-symbol** GP alphabet to select target physical p27 (zero-based). The resulting target repeats the exact two words at local offset28, equal to the 28-page backward distance. These relationships arise from **two original word boundaries**, six literal rune identities, a source-published prime chart, and the original page labels; no arithmetic parameter or target string was fitted to an English language score. **Full-corpus discriminator:** freeze these two operations as a single word-pair navigation rule, apply them to **all 2,454 page-local adjacent original printed-word pairs of combined length at least six runes**, and require the exact concatenated six-or-more source symbols to reappear at their predicted distinct-page (page, rune-offset) coordinates. **Exactly one of 2,454 pairs succeeds**, the final two words of p55 pointing to (p27, 28). This is an exact within-source uniqueness statement, with the rule chosen after the p55 echo was already discovered; it is **not** a preregistered significance test or decipherment. A player could reproduce the pointer with handwritten arithmetic.

**Critical ambiguity:** the original 2016 signed words-map clue never specifies **mod 29**, the page-zero origin, or the six-rune footer as the input. Another natural arithmetic convention, modulo all **58 LP2 pages**, yields **288 mod58=56**, merely selecting the following solved page p56. The two congruences are algebraically linked (58=2×29), not independent confirmations. Since the **six-rune terminal copy** and its target were discovered before this sum was calculated, the modulo-29 navigation success also suffers postselection. The specific combination is now a motivated *testable navigation conjecture*, not an authenticated decipherment rule.

**New independently visible next-word handoff:** Immediately after the recovered two-word anchor on p27 (offset28–33), the *next complete printed word* starts at rune offset **34** and consists of **AE.F** (GP indices25,0), with prime sum **101+2 = 103**. The original 256-cell numeric table's **103rd** row-major token is `0W`, followed by **104th** token `3Q`. Independently, the 2016 signed tree image has **width 563 pixels, the 103rd prime**, and the established [original 2013 BASE29 relation](lp2-2016-prime-ordinal-p50-double-O-marker.md) uses this same 103/104 cell pair to reconstruct the already-public `3QO=3301`. This supplies an unusually specific potential *continuation* of the p55 numeric address: destination p27:28 → first word *after* copied marker gives **103** → source table cell103. All integers, source glyphs and table tokens are asserted by the updated exact SFT; [the expanded original-input GitHub Actions run 43606296400](https://github.com/FlareZ123/liber-primus/actions/runs/43606296400) passed; no decryption is claimed. **Strongest objection:** after finding the p55→p27 link, deciding to take the next whole word's prime sum as a table address is still a hypothesis; the 2016 signed image width and the old 3QO relation were previously explored. This is a pre-existing value reached through a newly observed navigation path, not independent evidence for its original intention.

A finite, explicit attempt to turn this directional match into unknown plaintext is: treat the last six p55 runes as a *pointer*, move back 28 original pages to p27 offset28, consume the anchor there, and take the **next 70 p27 runes** (offsets34–103) as a running GP29 additive tape for the **preceding 70 p55 ciphertext runes** (offsets0–69). This is a complete original-input decoder with no chosen start phase, secret alphabet, or tuned key word. Both natural + and − operations fail to recover ordinary GP-native English: p55 decoded first70 has symbol IoC **0.03064** (addition) and **0.03106** (subtraction), versus authentic p57 first70 as a native-language control. The complete proposed 70-rune tapes are emitted by the [read-only standalone source exact SFT](../sims/lp2_p55_final6_p27_28loop_original_sft.cjs); its known-p57 additive encryption plant is losslessly inverted. Neither inverse yields a recognizable contiguous passage. This rejects **that precise following-anchor direct additive consumer**, with no claim that the terminal pointer is false or that another operation is selected.

For positional scale, *conditional on selecting these exact two source pages and this pre-existing six-rune matched block*, independently circularly shifting intact p55 and p27 rune arrays gives 76×234=**17,784** placements, and only one makes the same unique six-rune copy simultaneously end at the p55 boundary and begin at p27 offset28. This is a **conditional placement fraction**, expressly **not** an uncorrected significance claim: the six-rune sequence, pages, matching length, and numeric offset relationship were all noticed during investigation. The printed 2016 words/map/numbers clue does not instruct a rune-6 suffix jump, an offset measured in runes, or use of the following material as an additive pad.

**Decision:** preserve this unusually specific, easy-to-inspect original footer-to-wing-page alignment as a possible *navigation or key-location* clue. Do not promote it to plaintext or start arbitrary alternative cipher searches; a successor needs an independently authored operation for consuming the p27 following text and a 70+ rune exact reciphered p55 original plaintext result. Source image scans: [p27](../resources/liber-primus/44.jpg) and [p55](../resources/liber-primus/72.jpg). Exact test successful in [manual CI run 43605401162](https://github.com/FlareZ123/liber-primus/actions/runs/43605401162).

## Tests

The canonical transcription was parsed as 55 rune-bearing pages and checked rune-for-rune against resources/liber-primus/lp2-corpus.json: **12,956/12,956** symbols matched. Printed line breaks were retained separately from rune positions.

1. **Phase-specific IoC screen.** For page-reset rune, line-reset rune, and line-reset character clocks, the nonempty phase bins for periods 2, 3, 6, 7, 14 and 21 were measured; period 42 was also tested for the page-reset rune clock. Across these bins, phase IoCs stayed in **0.03282–0.03633** (full ciphertext IoC **0.03448**). Known plaintext controls score **0.06271** IoC for the 95-rune p57 Parable and **0.05969** for the 3,705-rune LP1 plaintext reference. A simple additive periodic key merely Caesar-shifts each phase and preserves its IoC; these source-selected clocks show no English-like phase distribution.

2. **Exact period-6 page-reset key search.** The 29-symbol GP alphabet was searched exhaustively over all 29^6 keys for both Vigenere P=C-K and Beaufort P=K-C. A GP trigram model trained on the first 240,000 characters of resources/control/shakespeare_first300k.txt was fitted on physical pages 0–27 (6,705 trigrams) and evaluated on held-out physical pages 28–55 (6,141 trigrams). Exact factor-table aggregation and variable elimination find the global training maximum, not a heuristic key sample.

| Model | Exact best training score | Held-out score | Best key (GP names) | Repeated anchor output |
|---|---:|---:|---|---|
| Raw ciphertext | −6.24697 | −6.22479 | — | — |
| Period-6 page-reset Vigenere | −6.03150 | −6.23439 | J D D J G R | B W M D A AE |
| Period-6 page-reset Beaufort | −5.97916 | −6.15945 | R F R Y AE F | TH E O EO S T |

The held-out samples remain gibberish. For scale, the same model scores the known p57 plaintext at **−2.57187** and the LP1 plaintext reference at **−2.47790**. The small training improvement is not a decryption; the exact best key does not generalize to readable holdout text.

## Interpretation and scope

The repeated p27/p55 7-gram is a real and unusually specific alignment marker. It is not evidence that the phrase is plaintext, nor that a period-6/7 additive cipher is intended. The period-6 page-reset Vigenere/Beaufort family is exhaustively negative under this GP29 English trigram test. The phase-IoC screen also argues against simple additive periodic keys at the listed page/line clocks and periods, assuming an English-like plaintext register.

This does **not** exclude nonlinear feedback, a true OTP or derived OTP-class stream, arbitrary per-page keys, non-English registers, or another source-selected state machine. Do not respond by broadening to arbitrary periods or key rotations. If the repeated anchor is used again, it should constrain a separately motivated nonlinear/stateful operation rather than trigger another blind additive-key sweep.

## Reproduction

Run from repository root:

node sims/p27_p54_periodic_key_gate.cjs

The script asserts the exact two anchor occurrences, checks the line transcription against the canonical rune corpus, records SHA-256 fingerprints of its three source files, reproduces the phase-IoC screen, and exactly maximizes the period-6 page-reset Vigenere/Beaufort models.
