# LP2 p51 self-clock to the p50 11-cycle: exact source alignment, conditional calibration

**Agent6, 21 November 2026. Status: source-level, provisional navigation. No newly recovered LP2 plaintext, authenticated creator key, original-cipher inverse, or destination.** Director issue [#2124](https://github.com/FlareZ123/liber-primus/issues/2124). Reproducer: [single runnable Windows Node22 SFT](../sims/lp2_p51_selfclock_cycle_gate_sft.cjs), [successful original-input CI 44962334539](https://github.com/FlareZ123/liber-primus/actions/runs/44962334539).

## Decision and newly identified simpler selector

The existing candidate states p51's opening rune word **WWP** has original GP-prime sum **81**, and the conditional p50 **base60** successor map reaches its 11-cycle after 20 transitions. Previous reports supplied 20 from the solved **p57** passage, which contains 20 printed words. **The original p51 page itself independently contains exactly 20 printed words.** Thus the start and proposed number of steps can both be read from one physical page directly adjacent to the original 32×8 numerical table, without an unexplained leap to p57. The same 20 count on p57 is a separate cross-check.

Original p51 first word indices are [7,7,13], so its GP-prime sum is 19+19+43=81. The original p51 scan is 68.jpg, SHA256 2b9d60f62b2bc65d040f7ae1bc0960d5a44ca251d2730d049a618074a83e208b. The p57 scan is 74.jpg, SHA256 1dabc100ddbf1fc49715219636984eb6ad96a2bd8035e196c12e66db77a1077b. The exact canonical rune transcript independently gives p51 **92 original runes / 20 printed words**, p57 **95 runes / 20 printed words**. This check uses the complete GP rune range through ᛡ; truncating a rune-range regex at ᛠ incorrectly drops three p51 runes.

Take the source-documented conventional base60 successor function T[x] = original grid byte at zero-based index x. The 256 original bytes have SHA256 3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290. The exact route is:

    81 → 58 → 146 → 92 → 236 → 238 → 129 → 179 → 175 → 18
       → 15 → 212 → 70 → 169 → 228 → 144 → 125 → 20 → 102 → 32 → 115

Node 115 is the **first node on the 11-cycle**. The route has an exact **preperiod of 20**, stronger and more discriminating than simply observing that T^20(81) is somewhere on a cycle. Among all 256 original starting addresses, **only 81, 204 and 220** have preperiod 20. The entire original graph has two cycles, of lengths **11 and 2**, which correspond in size to the clear-signed 2016 message's final eleven-word coda and two-word verification clause. The 11+2 relation remains a count correspondence; no cycle-node-to-word serialization is authenticated.

The original cell **81** is the **second** cell (row0, column1) of the printed central p50 grid portion and contains 0w, interpreted as byte58 under base60. This is a zero-based coordinate; do not conflate it with one-based “cell 81,” which is index80 (2M).

## Independent adjacent-equal event selector: WWP as event81

The original 55 unresolved rune-bearing physical pages contain **86 same-page adjacent-equal rune events**, counting all 12,956 GP29 glyphs in original order. Page51 starts with `WWP`: its opening `WW` is **the only page-opening identical-rune pair among all 55 unsolved rune-bearing pages**. Exactly **81 adjacent-equal events precede it** in original page/rune order. The opening `WW` is event82 in one-based human counting, **event81 in zero-based counting**, exactly equal to its whole first-word GP-prime sum **WWP=19+19+43=81**.

A separate page-opening check compares each page's **preceding event count** (0..85) with its own first printed word's GP-prime sum. Exactly **one page matches: p51, 81=81**. Across all 86 event-containing printed words, only the p51 WWP event has its zero-based ordinal equal to its whole word's prime sum. Counting rare same-rune occurrences is a candidate way to select table cell81 independently of decoding WWP's prime sum. The historical author never specifically instructs a player to use a zero-based adjacent-doublet event clock, so this remains conjectural.

[Original-input 86-event SFT](../sims/lp2_p51_doublet_ordinal_81_sft.cjs) passed [Windows CI 44962942531](https://github.com/FlareZ123/liber-primus/actions/runs/44962942531). In 200,000 seeded event-word-value shuffles, **15,694/200,000 (7.847%)** have any zero-based event ordinal equal the corresponding event word's prime sum; **4,547/200,000 (2.2735%)** place a prime81 word at event81. Independent page-opener shuffles give **17,560/200,000 (8.78%)** chance of any page's first-word prime sum equalling the earlier event count, with **3,619/200,000 (1.8095%)** matching page51 specifically. These are *post-selected, conditional* probabilities. Neither model corrects the discovery process or assumes correctly that rune words/page positions are exchangeable.

**First-rune-weight receiver:** `W` has GP prime weight19. The frozen table walk gives **T^19(81)=32**, identifying physical p32, which has an original blurred tree illustration; the twenty-word self-clock gives **T^20(81)=115**, the first 11-cycle node. P51 has a pair of elaborate original tree drawings. These make p32 a visually plausible candidate navigation receiver, but the source does not instruct the first-rune prime-weight step. Table token `0w` occurs **twice**, at global cells **81 (physical p50)** and **220 (physical p51)**; both have successor byte58 and preperiod20. This duplication explains why two of the three depth20 starts coincide under T and is not an independent cipher key.

## Matched original-page family

The frozen family includes all **55 rune-bearing unsolved page-openers** (physical p0–49 and p51–55). For each opener, test **four natural numeric encodings**: GP0 sum, GP1 sum, GP-prime sum, and rune count. Retain valid zero-based addresses 0–255 only; the source supplies **208 eligible (page, encoding) pairs**. For each, use its **own physical page's printed word count** as the proposed preperiod, avoiding selection of a time from any different page.

**Only one** original (page, encoding) pair has preperiod(T, address) = printed word count: **p51, GP-prime, 81, 20**. The other three encodings of p51 have starts/depths **27/14**, **30/3** and **3/4**. The p57 twenty-word count can therefore be withheld from the inference. Source word-count parsing is deterministic from the canonical page-bounded transcript, joining visual line wraps and retaining all 29 GP glyphs; pages that begin with a cross-page word fragment remain included, conservatively, in the comparison family.

## Locked nulls and interpretation

The committed SFT performs deterministic fixed-seed exact-family tests on original 256-cell byte multiset permutations and on graph-isomorphic relabelings. Raw counts:

| Null / trials | Exact 11+2 cycles | p51 self-clock (81 has depth20) | Any of 208 self-clocks | Any GP-prime-only self-clock | Exact 11+2 and p51 self-clock | Exact 11+2 and any self-clock |
|---|---:|---:|---:|---:|---:|---:|
| Globally shuffled original byte multiset / 100,000 | 159 | 1,338 | 26,545 | 7,283 | 4 | 59 |
| Shuffled within original p49/p50/p51 table regions / 100,000 | 184 | 1,378 | 26,283 | 7,118 | 1 | 63 |
| Whole-graph node relabeling / 200,000 | held fixed | 2,328 | 45,014 | 12,256 | held fixed | held fixed |
| Node relabeling restricted within three source-table page regions / 200,000 | held fixed | 1,965 | 43,249 | 16,753 | held fixed | held fixed |

The first two nulls retain the **literal original grid-byte multiplicities**. The last two preserve its **entire graph topology**, including the original 11+2 cycles, basin sizes and preperiod histogram, and test only the numeric alignment of source words/addresses with that already-selected graph. In the fixed topology, exactly **3/256** possible global address labels have depth20; within the central 104-cell table region only one has depth20. The observed source-family-wide one-hit event is common under relabeling (20–23% for any of the four encodings). Raw conjunctions with 11+2 cycle lengths look uncommon under the particular multiset shuffles; both the cycle statistic and this p51 clock were discovered after long exploration of the table, so **these are conditional descriptive frequencies, not corrected discovery probabilities or evidence that the creator intended the map**. This report does not interpret a low raw tail as a decryption.

## Direct original-cipher consumer tested and retired

The most economical candidate requiring no further hidden key is: for word i (0–19) of original p51, subtract T^i(81) mod29 from every GP29 ciphertext rune of that word. A native solved-p57 planted ciphertext decodes perfectly under the same fixed operation. On the **original 92 p51 runes**, the inverse is:

    PPM FIALXBN REHOE OYLEG PDNG GUPA JFX HCG DFHIABOEED IARU
    FHGLCFHG P OEAJ AEIACTUCF AEYUB IAREWGMBH SGH EAHGNGEACFP NGYAETH IBY

Its GP29 index of coincidence is **0.04013378**, versus original p51 **0.03272814** and solved clear p57 **0.06270997**. It is not authentic recognizable plaintext. This **specific original-input word-shift consumer is retired**; adding arbitrary shifts, reset rules, or per-word translations without a first-party selector would overfit the 20 words. Synthetic planted recovery certifies implementation behavior only.

## Outstanding source-to-plaintext gap

A human-visible reading route is possible: the WWP word directly below the printed table offers a GP-prime address, its own page supplies the preperiod clock, and the conditional successor operation ends at the 11-cycle matching the 2016 coda count. However, the original artwork does **not** explicitly authenticate base60 rather than base59, successor navigation rather than another table operation, GP-prime rather than other numeric encodings, or the necessary reversible node-to-rune decoding rule. Original-source word/line punctuation and the two side trees might supply an independent instruction, but no such selector has been demonstrated.

**Decision for #2124:** preserve the exact source-only self-clock and the separately reproduced event81/WWP selector as a distinct p51 route and avoid a duplicate p57 literal-word-number attack already rejected in #2113. Any successor must identify an author-selected, reversible **original ciphertext consumer** or a blind predicted unused passage; neither the raw graph coincidence nor the failed additive decoder supplies one.
