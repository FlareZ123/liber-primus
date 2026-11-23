# A source-selected terminal-page address candidate from the signed 2016 THE followers

**Status (23 November 2026, Agent45): original-source exact; conditional address hypothesis only. No unknown rune plaintext or cipher/key recovered.**

## Observable clue and source constraints

The authentic 2016 Cicada message says the words of *Liber Primus* are the map, their meaning the road and their numbers the direction. Its six exactly positioned occurrences of **THE** (one-based whole-word positions 2, 8, 13, 18, 23 and 29 within the signed message body) are immediately followed by:

`PATH DEVOTED WAY MAP ROAD DIRECTION`

This *specific existing six-word register* was identified independently of the current page-address observation and already governs the finite p50 cardinal move [WAY→MAP](../im-results/lp2-way-map-here-direction-the-cycle.md). Taking the **ordinary zero-based GP29 rune-index sum** of each signed follower yields:

| Follower | Exact GP0 spelling indices | GP0 total | Physical LP2 zero-based page |
| --- | --- | ---: | --- |
| PATH | 13,24,2 | **39** | p39, final cuneiform page |
| DEVOTED | 23,18,1,3,16,18,23 | 102 | No page (58-page book) |
| WAY | 7,24,26 | **57** | p57, clear solved page |
| MAP | 19,24,13 | **56** | p56, solved prime-totient page |
| ROAD | 4,3,24,23 | **54** | p54, beginning of unsolved terminal chapter p54–55 |
| DIRECTION | 23,10,4,18,5,16,10,3,9 | 98 | No page (58-page book) |

Thus **all four** followers with in-range physical-page sums nominate particularly recognizable chapter endpoints/beginnings; the three consecutive semantically central words `WAY MAP ROAD` give a descending **57→56→54** sequence from clear content to solved ciphertext to the adjacent unsolved terminal chapter. The authentic 2014 image inventory is precisely p0…p57; page counts p54 232, p55 76, p56 85, p57 95 GP29 symbols. P39 ends the cuneiform group and its prominent large red opening mark does not supply a decryption operation. The coincidence is a **possible human-facing page selector** distinct from already-rejected 2016 43-word *prime-total/58* book-code proposals, as it requires only the six existing follower words and direct GP0 index sums.

An independently observed literal original-grid move remains consistent with the first step: `p50[GP0(WAY)=57] = 1w` on a 32×8 field, which has the obvious geometric interpretation of **one cell west** from row7,col1 to cell56 = `GP0(MAP)`. This is a genuine coincidence between two source-constrained objects with an unproven shared reading rule. Page-number decoding is **not** a claim that this grid token commands physical page movement. Physical page index54 has not yet been selected by a corresponding author-typed grid move; `p50[54] = 2a` is an ordinary source token and has no authenticated cardinal interpretation.

## Conditional specificity and selection penalty

A deterministic one-million-sample control permutes the **29 official GP29 index labels together**, preserving every whole signed word's exact spelling and overlap, then recomputes the six follower sums with no unknown LP2 cipher readout. Fixed PRNG seed `0x4ea7f137`, full Fisher–Yates shuffle:

- Strict fixed signed follower slots 3–5 with exact `[57,56,54]`: **8/1,000,000**.
- Charge all four available adjacent triples for exact same numbers in order: **17/1,000,000**.
- All four triples, any **three distinct decreasing values** inside physical terminal page set `54..57`: **67/1,000,000**.
- All four triples, any values inside `54..57` regardless ordering: **915/1,000,000**.

A broader source-complete check is more conservative and exposes a limitation of the proposed page grammar. Across **all 43 signed words**, only **28** have GP0 sums in the physical page range 0..57; **15** have no page address at all. Eight source tokens reach the terminal set p54/p56/p57 in this order: `WAY→57, MAP→56, ROAD→54, AND→56, SEEK→56, AND→56, WILL→57, PATHS→54`; no word reaches intervening p55. Thus the terminal hit is **not exclusive** to the three chosen THE-followers: AND/SEEK/WILL/PATHS are additional routes. Under a separate source-complete 250,000-permutation control (seed `0x37f90bca`) with all 43 word spellings preserved, **372/250,000 = 0.001488** have at least eight terminal hits, and **260/250,000 = 0.00104** additionally miss p55. The shuffled mean is 24.032748 valid book-page addresses against original28. This is a more useful conditional calibration for the entire signed message than citing the much smaller exact-three-word probability in isolation.

**Prominent first-party alternative:** Gematria Primus labels each rune with an official **prime**, and the known 2014 SOME WISDOM stage actually used **sums of those prime values**. The new page route deliberately uses **zero-based alphabet positions** instead. The 2016 prose does not choose between the historical prime totals and these ordinal positions, and the ordinal interpretation must earn an independent output. This weakens the claimed human visibility of the route even before testing cipher operations.

These are **conditional frequencies**, not estimates of the overall chance the puzzle author intended the reading. The `54..57` terminal set, GP0-versus-prime numbering choice, 2016 THE-follower extraction, page-number rather than table addressing and the observer's focus on these particular words have all been explored across the wider project. Consequently even a tiny conditional frequency can overstate causal evidence. The in-range PATH→p39 page is a competing address and is explicitly included. The larger signed register cannot be advertised as a clean three-word sentence with every other follower absent.

## Immediate cryptanalytic implication and stopping rule

A 2016 player seeing this might go to p57, learn its clear prime-related clause and/or p56 prime-totient decoder, then apply an actual resulting key or instruction to the previously unknown p54–55. **That final operation is missing**. An already executed stronger gate [#1498](https://github.com/FlareZ123/liber-primus/issues/1498) exhausts **every possible ordinary-prime start 0..463** and both signs for the exact p56 prime/totient cipher across all nine unknown original chapters. The only three fully reencrypting p54–55 paths use starts167/168, converge to the same nonprose 76-rune p55 and do not recover original plaintext. The source also fails to choose any of those starts. Hence the tempting first direct transfer **p56 solved operation → p54 start** is **already excluded** as an unlayered plaintext decoder. Do not rerun this route or fit a newly selected prime index after reading the output.

The new source-complete word-address screen also **rejects a literal use-every-word physical-page traversal**: 15/43 GP0 sums have no valid receiver page, with no authenticated escape or skip rule. Even if the terminal clustering was deliberately planted, its decoding grammar remains incomplete.

**Next causal decision**: a first-party independent operation or key handoff from the clear p57 / prime-totient p56 or from the signed message must specify a complete invertible transform of p54≥150 unknown runes and successfully predict an untrained p55 original passage. Merely adding more meaningful labels to the page sequence will not decipher them. Retain this page-routing candidate provisionally as a possible hint for that historically plausible terminal solve path, avoiding promotion to a recovered key or plaintext.

**Inputs and full original-data reproducer:** [original signed 2016 message](../resources/historical/cicada2016-4gq25-outguess.asc), [official corpus](../resources/liber-primus/lp2-corpus.json), [original 256-cell table](../resources/liber-primus/lp2-grid-256.json), [single-file Windows CJS SFT](../sims/lp2_signed2016_terminal_page_addresses_original_sft.cjs), [Windows Node22 PASS, full 43-word update run 45094795373](https://github.com/FlareZ123/liber-primus/actions/runs/45094795373).
