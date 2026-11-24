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

**All-directed-page census of the previously established p55→p56 seven-rune seam (14 November 2026).** The exact seven-rune ciphertext bridge and its punctuation boundary were already independently established on 12 November in the [original seven-rune bookend study](lp2-bookend7-p56-known-boundary.md), and a prime-totient p27 restart was rejected in [the previously published 200-rune original-input test](lp2-p27-terminal-bookend-p56-prime-restart-gate.md). The distinct contribution here is quantifying whether *any other ordered pair of complete source pages* could form a seven-rune bridge to a page interior. Appending the **first original p56 ciphertext rune**, `AE`, to p55's final six `D-J-U-B-E-I` yields `D-J-U-B-E-I-AE`, exactly the seven consecutive original p27 ciphertext runes at page-local offsets **28–34**. The overlap crosses the physical p55/p56 boundary (and p55's terminal period), whereas the matching p27 run is interior and continues with literal `F` at offset35. The independently solved p56 first key step is `φ(2)=1`, so its initial ciphertext `AE` corresponds to known plaintext **A**. This does **not** imply that the identical p27 ciphertext `AE` has plaintext A under an unknown p27 key.

The [complete original-corpus seam census](../sims/lp2_p55_p56_p27_seam7_sft.cjs) compares **all 3,192 directed pairs** of the **57 rune-bearing original pages p0–57**, joining a nonempty suffix of the first page to a nonempty prefix of the second for *every split of seven runes* (1+6 through 6+1). It searches the resulting seven-rune sequence against every wholly internal seven-rune window of those pages. **Exactly one directed page pair and split** has any hit: **p55→p56**, split **6+1**, matching **p27 offset28**. No wholly internal seven-rune window recurs elsewhere at length seven; the unique seam event is the only such original-input seven-rune repeat when one cross-page seam is allowed. Among all 57 rune-bearing pages, **p56 alone starts with ciphertext AE**, so an unrelated successor could not have supplied this particular seventh rune. The true physical order realizes the sole possible bridge.

If the **57 complete rune-bearing pages** were placed in a uniformly randomized order *after conditioning on this already-discovered unique eligible ordered pair*, the chance of p55 immediately preceding p56 would be exactly **1/57**. This conditional page-order fraction is **not** an unbiased chance estimate for discovering the recurrence: page order, repeated six-rune footer, matching target, and length seven were investigated together. The image-only p50 gap is also omitted from that conditional permutation. The exact bridge is a source-level navigation clue with a stronger internal consistency check, **not unknown plaintext, a key or a proven author instruction**. An actionable continuation still requires an independent rule for consuming p27 after the anchor.

**New clue-constrained numeric cross-check.** The two **complete printed cipher words** at the matched footer have GP prime sums **DJU = 89+37+3 = 129** and **BEI = 61+67+31 = 159**. Their total **288** satisfies **288 mod 29 = 27**, matching *exactly the page where the same complete two-word ciphertext appears*. Independently using the two ordered word values as a **difference**, **(129−159) mod 29 = 28**, matching *exactly the rune offset of that copy on p27*. These are the two coordinates **(p27, offset28)** of the genuine repeated ciphertext, produced by the simplest two operations on the same two original whole-word prime sums. Thus the genuine signed 2016 instruction that the manuscript's **words** and **numbers** convey **direction** could motivate an actual finite operation: add the six footer runes' published GP prime values and reduce modulo the **29-symbol** GP alphabet to select target physical p27 (zero-based). The resulting target repeats the exact two words at local offset28, equal to the 28-page backward distance. These relationships arise from **two original word boundaries**, six literal rune identities, a source-published prime chart, and the original page labels; no arithmetic parameter or target string was fitted to an English language score. **Full-corpus discriminator:** freeze these two operations as a single word-pair navigation rule, apply them to **all 2,454 page-local adjacent original printed-word pairs of combined length at least six runes**, and require the exact concatenated six-or-more source symbols to reappear at their predicted distinct-page (page, rune-offset) coordinates. **Exactly one of 2,454 pairs succeeds**, the final two words of p55 pointing to (p27, 28). This is an exact within-source uniqueness statement, with the rule chosen after the p55 echo was already discovered; it is **not** a preregistered significance test or decipherment. A player could reproduce the pointer with handwritten arithmetic.

**Critical ambiguity:** the original 2016 signed words-map clue never specifies **mod 29**, the page-zero origin, or the six-rune footer as the input. Another natural arithmetic convention, modulo all **58 LP2 pages**, yields **288 mod58=56**, merely selecting the following solved page p56. The two congruences are algebraically linked (58=2×29), not independent confirmations. Since the **six-rune terminal copy** and its target were discovered before this sum was calculated, the modulo-29 navigation success also suffers postselection. The specific combination is now a motivated *testable navigation conjecture*, not an authenticated decipherment rule.

**Next-word handoff and source-selected order-140 test.** Immediately after the recovered two-word anchor on p27 (offset28–33), the next complete printed word begins at rune offset34 and is AE.F (GP indices25,0), whose published GP prime values sum to **103**. The p50 table's 103rd row-major token is 0W (base60 value32), followed by 104th token 3Q (value206). This is a plausible continuation of the p55 numeric address: destination p27:28 → next-word sum103 → p50 cells103/104. The 2016 signed tree image width is 563, the 103rd prime, and the established 103/104 table pair also participates in the earlier 3QO=3301 relation. These are source-visible links, but the address rule was selected after the p55/p27 echo and is not an authenticated instruction.

A concrete field consumer is now closed. The two table values reduce to (3,3) modulo29, yielding g=3+3α in the source H quadratic α²=11α+18. Its exact order is **140**, and the 840 p33–39 adjacent pairs form six periods. An exhaustive 13,664-configuration test of pairwise additive/multiplicative streams and scalar trace/norm/coordinate readouts over all phases, conjugate roots, directions, orientations and natural page/global clocks recovers no plaintext; best pairwise IoC is 0.03526476 and best scalar IoC is 0.03505701, against original 0.03436002. See [the source-selected order-140 gate](lp2-p27-103-p50-cell-pair-order140-gate.md). Thus the 103/104 pair does not provide a direct field-stream key under these natural consumers. The navigation pointer remains a postselected hypothesis, not a decipherment or independent confirmation of author intent.

A finite, explicit attempt to turn this directional match into unknown plaintext is: treat the last six p55 runes as a *pointer*, move back 28 original pages to p27 offset28, consume the anchor there, and take the **next 70 p27 runes** (offsets34–103) as a running GP29 additive tape for the **preceding 70 p55 ciphertext runes** (offsets0–69). This is a complete original-input decoder with no chosen start phase, secret alphabet, or tuned key word. Both natural + and − operations fail to recover ordinary GP-native English: p55 decoded first70 has symbol IoC **0.03064** (addition) and **0.03106** (subtraction), versus authentic p57 first70 as a native-language control. The complete proposed 70-rune tapes are emitted by the [read-only standalone source exact SFT](../sims/lp2_p55_final6_p27_28loop_original_sft.cjs); its known-p57 additive encryption plant is losslessly inverted. Neither inverse yields a recognizable contiguous passage. This rejects **that precise following-anchor direct additive consumer**, with no claim that the terminal pointer is false or that another operation is selected.

**A directly solved-key continuation at the seven-rune seam fails exactly.** The copied p55/p56 terminal-to-p27 seven-rune text suggests a distinct finite hypothesis: begin at the p27 rune *after* the matched marker (local offset34), transfer the same 85-rune **p56 prime-totient key** in its original sign and phase, and require the proven p56 **plaintext-F transparency**. The authentic p56 key on original plaintext is `φ(p_n)=p_n−1`, consuming no key rune when plaintext is F. This hypothesis would turn the original p27 offsets34–118 into unknown plaintext without any fitted secret or additional source. But those 85 p27 ciphertext runes have five F-valued ciphertext symbols at relative offsets **[1,20,27,34,77]**. **All 32** ways of assigning those as F-transparent or ordinarily encrypted fail the exact inverse rule: somewhere, a ciphertext rune that is not F must decrypt to plaintext F, which would have bypassed encryption. This is a **key-independent and language-independent contradiction once the transferred known key and matching phase are fixed**. As an optional opposite-sign comparison, exactly two masks (8 and 24) remain reversible, with GP index-of-coincidence **0.0361344538 / 0.0344537815** and no coherent original-rune text; the opposite sign is not p56's authenticated cipher. For context, the first 56 p27 runes decoded with the unaltered p56 key clock have IoC **0.0292207792**. The original **85-rune** p56 known decryption and an independent authentic p57 plaintext encryption plant both recover perfectly with precisely this implementation. [Complete read-only source-exact SFT](../sims/lp2_p27_p56_seam_phi_no_reuse_sft.cjs) · [successful Node22 original-corpus run 43655726089](https://github.com/FlareZ123/liber-primus/actions/runs/43655726089). This retires only *same-phase p56 key reused on p27 after the seam*, and cannot eliminate a separate p27 cipher, different key alignment or the seam as a navigation clue. No new plaintext/key follows.

For positional scale, *conditional on selecting these exact two source pages and this pre-existing six-rune matched block*, independently circularly shifting intact p55 and p27 rune arrays gives 76×234=**17,784** placements, and only one makes the same unique six-rune copy simultaneously end at the p55 boundary and begin at p27 offset28. This is a **conditional placement fraction**, expressly **not** an uncorrected significance claim: the six-rune sequence, pages, matching length, and numeric offset relationship were all noticed during investigation. The printed 2016 words/map/numbers clue does not instruct a rune-6 suffix jump, an offset measured in runes, or use of the following material as an additive pad.

**Decision:** preserve this unusually specific, easy-to-inspect original footer-to-wing-page alignment as a possible *navigation or key-location* clue. Do not promote it to plaintext or start arbitrary alternative cipher searches; a successor needs an independently authored operation for consuming the p27 following text and a 70+ rune exact reciphered p55 original plaintext result. Source image scans: [p27](../resources/liber-primus/44.jpg) and [p55](../resources/liber-primus/72.jpg). Exact test successful in [manual CI run 43605401162](https://github.com/FlareZ123/liber-primus/actions/runs/43605401162).

## Source-selected following-word difference and table cell103 direct-key gates (Agent35, 14 November 2026)

The exact original p55 terminal two printed words `DJU BEI` match p27 local
runes 28–33, and the immediately following complete p27 printed word is
`AE.F` at local offsets 34–35. Its source GP prime sum is `101+2=103`.
The original p49–51 grid's one-based **103rd** and **104th** cells are
`0W` (byte 32) and `3Q` (byte 206). These are independently sourced
position and object selections, although no original instruction commands
using them as an additive key, or tells us to decode the 70 preceding p55 runes.

Two non-fitted 70-rune candidate keys were tested against the **unaltered
p55 offsets 0–69**, with GP29 addition and subtraction:

1. **p27 successor difference:** `K_i=(p27[34+i]-p27[33+i]) mod29`.
   This uses the first 70 transitions after the matched six-rune anchor.
2. **Grid cell103 continuation:** `K_i=byte[102+i] mod29`,
   where the byte sequence is the original table's complete physical
   row-major order, and the first key byte is exactly 32.

| Frozen key | `P=C+K` GP29 IoC | `P=C-K` GP29 IoC | First forbidden non-F plaintext F under solved-page transparent-F rule |
| --- | ---: | ---: | --- |
| p27 70 successive differences | **0.04637681159** | **0.02857142857** | plus at original p55 offset **1**; minus at offset **10** |
| p50 table bytes from cell103 | 0.03436853002 | 0.03685300207 | plus at offset **20** if F15 is encrypted, **22** if F15 is bypassed; minus at offset **5** |

The table-derived **plus** inverse opens with the standalone letter **A**, but
the next words and the complete 70-rune output are nonlinguistic. That first
letter is a one-symbol coincidence, not recovered plaintext. Likewise the
p27-difference plus sign has a moderately elevated 70-rune IoC; among all
**234** intact cyclic p27 starting phases it ranks **second** by this
statistic, yet its full output is not prose. The reverse sign ranks **227th**.
In the p55 original printed **13-rune** word at local offsets23–35, neither
p27-difference sign matches any equality pattern among all **29,157** source-
native GP29 English dictionary entries. Even allowing an arbitrary unknown
shared output substitution on that word cannot turn it into one of those
dictionary types while preserving its original printed boundaries.

More strongly, conditionally applying the *actually solved* LP1/p56
**plaintext-F transparent bypass** to unknown p55 makes **all 16 consumers
impossible**. Original p55 has exactly three ciphertext F runes before its
six-rune tail, at local **15,25,41**. For each sign and each of all eight
choices of whether these Fs are literal bypasses, the purported plaintext
necessarily becomes F at the original ciphertext position identified in the
table, **where the source ciphertext rune is not F**. A genuine transparent
plaintext F would have appeared as ciphertext F, so this is an exact
source-cipher equation contradiction before any English scorer. For plus
grid key, the earliest impossible position remains 20 or 22 across all mask
choices. For the other three consumers, it occurs before the first source
ciphertext F and is completely mask-independent.

The exact read-only Windows Node22 [single-file SFT](../sims/lp2_p55_p27_delta_p50_103_exact_sft.cjs)
checks the original six-rune equality, p27 following word, the two grid bytes,
all F masks, phase ranks, complete original outputs, dictionary pattern
obstruction, and positive 70-rune arithmetic inversion. **CI passed**, with
the new gate as independent successful job step9: [run 43619726627](https://github.com/FlareZ123/liber-primus/actions/runs/43619726627).

**Original source cross-link to the p32/p15 square route**: The **same p27 `AE.F` sum103** reaches the original p50 cell103 independently of the 2016 image's prime-ordinal103. Under the explicitly conditional **base60 byte mod58 page-register** map, the adjacent cells103/104 both address p32; the next original p32 prime-bearing row/column pair cells113/116 both address p15. The complete p32 prime-bearing row targets are `[32,15,4,5]`, and column targets are `[32,15,46,56]`; agreement stops after the first two entries. P15's source Fibonacci-prime square independently yields the already-public 3301 identifier. All original-input calculations and the base59 counterexample are consolidated in [the p32/p15 numeric-junction report](lp2-2016-prime-ordinal-p50-double-O-marker.md#source-locked-p32p32p15-dual-page-register-junction-and-p55-entry-agent35-14-november-2026), [CI run43621862810](https://github.com/FlareZ123/liber-primus/actions/runs/43621862810). This new page-routing link remains **an inference**, with no source-authenticated key or decrypted p55 message. Do not repeat the failed additive inverse as if the numeric self-address validates it.

**Scope and decision:** This rejects only these two concrete additive
consumers **if** p55 inherits the solved pages' F-transparent rule; their
standard unskipped versions also give no authentic plaintext. The actual
p55 cipher could use a different F rule, a more complex state machine,
a hidden word boundary, or a different operation consuming the original
p27 or grid data. There is no historical key selected here, and the
p55→p27→103 navigation remains a conjectured clue path. Do not rescue
these failures with arbitrary shifts, masks or fitted phases.

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
