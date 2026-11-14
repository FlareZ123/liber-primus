# Three authenticated 2014 squares: a complete 56-page outer-ring candidate

**Agent 12, 14 November 2026. Intermediate source-to-key observation and bounded original-cipher negative.** No unknown Liber Primus plaintext, original LP2 key, verified historical decoder or onward destination recovered. Reproducer: [original-cipher CommonJS SFT](../sims/lp2_2014_threesquare_outer56_pageprime_sft.cjs) ([successful original-source Node22 CI run 43569843207](https://github.com/FlareZ123/liber-primus/actions/runs/43569843207)), pinned [2014 three-square transcription](../resources/cicada2014-openpuff-magic-squares.txt), and [original LP2 rune corpus](../resources/liber-primus/lp2-corpus.json).

## Source-led proposal

The 2014 Stage09 [PGP-signed instruction](../resources/historical/cicada2014-stage09-first-jpeg-recovered.asc) **explicitly required participants to post three magic squares**. Their published sizes are 5×5, 7×7 and 5×5 (first-row sums 3301, 1033, 1033). The solved p57 instruction says to **shed our circumferences** and find the divinity within. Distinguish the outer perimeter of each complete source square from its inner square:

| Shape | 5×5 | 7×7 | 5×5 | Total |
| --- | ---: | ---: | ---: | ---: |
| Complete | 25 | 49 | 25 | 99 |
| Interior after one-cell perimeter removed | 9 | 25 | 9 | **43** |
| Outer perimeter | **16** | **24** | **16** | **56** |

The **43 interior cells** already matched the **43 strict interior runes on the final unsolved physical p55**, under the established source-word interpretation, in [earlier source-core work](lp2-p55-2014-magic-squares-three-core-hill-original-inverse.md). The **complementary 56 perimeter cells** exactly match the **56 physical unsolved LP2 pages p0–55**, including p50, a runeless numerical-grid page. Thus, allocating one source perimeter cell to every original physical page uses every exterior cell without silently treating p50 as missing. This complete page-key geometry is a newly recorded **hypothesis**, not an authored instruction: the magic-square source does not say to index LP2 pages with exterior values. The 43/56 matching cardinalities can also arise as retrospective coincidences.

## Reversible source-fixed test

The authenticated solved p56 inverse uses Euler's totient of successive prime numbers as its GP29 keystream and *one* literal, nonconsuming ciphertext F at its **fourth** F position (local rune56). The same SFT first recovers the **complete authentic 85-rune p56 plaintext** exactly with this source-fixed mode, avoiding errors in index base, key advance or F handling.

For LP2 unknown page p, assign the p-th exterior value in the three source squares' printed order. Keep physical p50 as an unused assigned key slot. Test two naturally describable exterior orders: (i) original printed row-major perimeter cells and (ii) clockwise perimeter cells from the top-left corner. Use the exterior value as a zero-based start in the known p56 prime-totient keystream, under three fixed readings: literal decimal value, value mod29, and Euler phi(value). Apply p56 Vigenère subtraction, with the opposite sign as control. Treat every F as consuming, or extrapolate p56's observed **fourth-F-only skip** independently within each page. The latter extrapolation is explicitly conjectural. This yields **2 × 3 × 2 × 2 = 24** complete original-input configurations over all **12,956** unedited unknown runes. Every candidate forward-reencrypts the exact original ciphertext under its fixed F-mask.

The source unaltered GP29 pooled index of coincidence is **0.0344783978645**. All 24 inverse outputs have pooled IoC between **0.0344522189463** and **0.0345239637194**, indistinguishable at this descriptive resolution from 1/29 = 0.0344827586207. A genuinely solved p57 control has IoC approximately 0.06271. The maximum-score candidate, row-major exterior / value mod29 / addition / fourth-F rule, begins with the nonlinguistic rune transliteration WREABYEOUCYXIMNHIAAEAEEOYCTHSY. None recovers an unknown plain-language passage.

## Next decision

**Reject this explicit exterior-number → per-page prime-index clock, with the historical p56 operator.** The dual geometry remains a conditional proposal worth keeping visible if a fresh first-party consumer or independently predictive plaintext clue appears. Avoid searching arbitrary page permutations, source rotations or hand-fitted per-page shifts to rescue this failed direct cipher. The prior three-core Hill negative is independent and remains valid. The [authoritative status](../results/README.md) remains unchanged: all 56 unknown LP2 physical pages remain undeciphered.
