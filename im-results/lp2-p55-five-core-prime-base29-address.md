# p55 five-core prime-sum / BASE29 address

**Status: intermediate source-led clue, not an established decryption.** No unknown plaintext, authentic LP2 key, reversible mechanism, or destination is recovered.

## Source observations

The solved p57 text says: “Like the instar tunneling to the surface. We must shed our own circumferences. Find the divinity within and emerge.”

The canonical parser finds 16 complete page-local words on physical p55, containing 75 runes. One incoming cross-page rune brings the physical page total to 76. Removing the first and last rune of each complete word leaves exactly **43 interior runes**. This is the literal word-edge interpretation previously tested in #343.

Original-image audit:
- p55, original scan 72.jpg: terminal 13-dot mark, 3 columns × 9 rows.
- p57, original scan 74.jpg: the 13-dot mark after the red title has the same 3×9 occupancy.
- p57's terminal 23-dot mark is 5×9. Its central column has five dots; the other 18 dots surround that spine. Selecting columns 1, 3 and 5 (zero-based 0, 2, 4) reproduces the 13-dot pattern.
- The five-dot spine is source-visible and plausibly motivates “instar” (five) and “within”. However, 13-dot punctuation recurs elsewhere in LP2; p55's count is not unique.

The occupancy patterns and original-image regions are reproduced by the dot-geometry SFT below.

## Candidate human solve path

A narrow reading is:
1. “Shed our own circumferences” selects p55's 43 word-interior runes.
2. “Instar” and the shared five-dot spine select the central five.
3. “Find the divinity within” motivates the centered window, at zero-based interior offset 19.

The selected GP indices are **[21,20,15,23,27] = [NG,L,S,D,IA]**. Their GP-prime weights are **[79,73,53,89,107]**, summing to **401**.

The ordinary BASE29 representation is **401 = 13×29 + 24**, giving digits **[13,24]**, which map to GP symbols **PA**.

Exact cross-page correspondences:
- p57's red title begins with the same two GP runes, PA (PARABLE).
- p54's red span begins with GP index 24.
- p55 has a 13-dot terminal mark; p57 also has a 13-dot mark immediately after its title. The 13-dot class is common, so this is supporting rather than unique evidence.
- 401 is the **79th prime**. The p55 and p56 word-interior streams contain 43 and 36 runes; 43 + 36 = 79.

A weaker possible reading of [13,24] against the 43 alphabetic words of the signed 2016 message gives “the” and “road” at one-based positions 13 and 24 if the opening “Hello.” is counted and numeric-only tokens / PGP metadata are excluded. Excluding the greeting shifts those positions to “way” and “and”; this tokenizer-sensitive echo is not evidence for a cipher.

## Controls and limits

The five-rune block crosses the boundary between p55 complete words 7 and 8. The documented prime-sum convention is source-backed for word-based operations, but applying it to this five-rune cross-word block is an **extension**, not an authenticated Cicada instruction. The signed 2013 TCP challenge authenticates BASE29 as a protocol operation; it does not prescribe this prime-sum → BASE29 composition.

A permutation null preserving p55's 43 interior symbols gives **751 / 962,598 = 0.00078018** of five-symbol subsets with prime-weight sum 401 (0.0780%). Across all 55 unsolved pages, the probability that at least one page's central five sums to 401 under independent within-page shuffles is approximately **0.10089568 (10.09%)**. The p55-specific selection is essential; the p55-only figure is not a discovery-wide p-value.

The same centered-five prime-sum / BASE29 calculation on solved p56 and p57 gives **HI** and **THM**, not a generic plaintext output. A quick direct repeating-additive GP29 screen using PA or PARABLE as the key on p55's 43 interiors, both signs, does not yield readable text. These negative screens reject only those immediate repeating-key interpretations.

## Decision

Retain this as a candidate **selector/checksum or human-solve-path clue**, not plaintext and not a key. Its strongest feature is the exact p55 five-core → 401 → BASE29 PA correspondence with p57's title and adjacent-page source features. Its weakest premise is extending word-based prime-sum to a centered five-rune block that crosses a word boundary.

The next useful decision is whether an independent source clue fixes a reversible consumer for [13,24]/PA. Do not treat PA or PARABLE as an established key, do not reopen the literal 43-word-length pad, and do not run unconstrained offsets, phases, or cipher-family sweeps.

Reproduction:
- Arithmetic and permutation SFT: ../sims/p55_five_core_prime_base29_sft.cjs
- Original-image dot geometry SFT: ../sims/lp2_p55_p57_red_dot_core_sft.py
- Inputs: ../sims/lp2_word_pages.cjs, ../resources/lp2-transcription.txt, ../resources/liber-primus/lp2-corpus.json, ../resources/liber-primus/lp2-ink-annotations.json, original scans ../resources/liber-primus/72.jpg and ../resources/liber-primus/74.jpg, and ../resources/historical/cicada2016-4gq25-outguess.asc.
