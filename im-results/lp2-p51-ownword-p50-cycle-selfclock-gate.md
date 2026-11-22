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

## Conditional p51 → solved p57 → p32 tree and circumference route

The two original occurrences of table token `0w` are zero-based cells **81 (physical p50)** and **220 (physical p51)**. Under conventional base60, both decode to **58**, with the same successor and preperiod20. LP2 has exactly **58 physical pages** (p0–57). If 58 is interpreted as a **one-based page number**, a direct follow-up from WWP→cell81 leads to its 58th physical page, **solved p57 PARABLE**, whose original clear words include **SHED OUR OWN CIRCUMFERENCES**. This is a concrete, reproducible *candidate human handoff*. Original source does not explicitly select one-based page addressing or distinguish byte-as-page output from a repeated table-state transition; those are the decisive interpretive gaps.

Applying the parable's literal **shed the outer runes** instruction to the first p51 word **WWP** removes its first W and last P, leaving the inner W, whose GP-prime weight is **19**. Following the same base60 table successor **19 times** from address81 gives **physical page number32**: T^19(81)=32. Original p32 depicts a blurred tree. P51 carries paired floral decorative borders, but **exactly the same borders repeat on all physical pages40–55**, including unchanged left/right five-dot masks 01101 (=13) and 11111 (=31); see the [original 16-page floral motif census](../sims/lp2_floral_dot_rows_original_sft.py). The border does **not** independently distinguish p51 or establish the p32 tree as the next receiver. At the 20th transition the state enters **115**, the graph's 11-cycle. The alternative p51 `0w` at cell220 shares this result because both copies immediately transition to state58. The original does not specifically say to feed the stripped rune's prime value into 19 table hops; the tree correspondence is only a thematic suggestion and remains unauthenticated.

[Read-only original-input conditional handoff SFT](../sims/lp2_p51_wwp_p57_p32_conditional_handoff_sft.cjs), [Windows Node22 PASS 44963290853](https://github.com/FlareZ123/liber-primus/actions/runs/44963290853). The script explicitly asserts the required radix, one-based page, first-word shedding and original p32 destination while reporting each unsupported convention.

### P51 first-rune prime19 self-describes its remaining word count

The first GP rune of WWP is **W**, whose authentic prime weight is **19**. Original p51 contains **20 printed words** in total, and **exactly 19 words after WWP**. Among all55 original unsolved rune-page openers, p51 is the **only page** for which the first-rune GP-prime weight equals the count of its following printed words; GP0 first-rune values produce zero such pages. Thus the 19-step T receiver and the 19-word body are both available without first using the p57 parable. If WWP is a page-local header, its 3 runes leave 89 ciphertext runes in 19 printed words, although the source typography does not explicitly identify WWP as a header.

The amended [source-count/adjacent-doublet SFT](../sims/lp2_p51_doublet_ordinal_81_sft.cjs) passes [Windows CI 44963960397](https://github.com/FlareZ123/liber-primus/actions/runs/44963960397). In a post-selected 200,000-shuffle 55-opening first-rune-weight null, *any* page count equality occurs in **~12.1%** of permutations, and a p51-specific equality in **~1.6%**. These are under-selection diagnostics; corpus page word counts, opening rare-doublet status and chosen GP encoding are not exchangeable independent clues.

### Source-derived 53-rune interior: possible 256-bit key, direct cipher gate failed

The same solved p57 literal instruction **SHED OUR OWN CIRCUMFERENCES**, when applied to **all20 printed words of original p51**, removes the first and last GP rune of each word. Nineteen words have at least two runes; the one single-rune word is thereby emptied. The retained **interior is exactly 53 original GP29 runes**, and 53 is the **minimum base29 digit count** capable of encoding a 256-bit integer (53·log2(29)≈257.47 bits). Reading these GP29 ordinals left-to-right as a conventional big-endian base29 integer produces the exact 256-bit candidate key:

    c2f2cdb6341367422f55819750712e129c3664442b162d65a2670099f1b64ee5

The reverse digit reading is 257 bits, so only ordinary source reading order fits a 32-byte raw key without truncation. This key matches in size the original **256-byte** source table's **32 rows × 8 columns**, and historical Cicada stages have used XOR; AES-256 is another possible but unhinted consumer. The exact native-source [AES/XOR read-only SFT](../sims/lp2_p51_53rune_aes256_table_gate_sft.cjs) passed [AES Windows 44964161398](https://github.com/FlareZ123/liber-primus/actions/runs/44964161398) and [AES plus XOR Windows 44964238108](https://github.com/FlareZ123/liber-primus/actions/runs/44964238108). ECB, zero-IV CBC, zero-counter CTR, first16-bytes-as-IV CBC, repeating 32-byte-key XOR, 1 key-byte per printed grid row XOR, and repeated raw 53-GP-rune-index XOR all produced random-looking byte output without readable text, recognizable file magic or an independently validated 29-rune plaintext. Genuine planted AES-256 ECB native-rune recovery passed. The candidate is not a proven authored AES key or recovered deep-web hash.

The known p56 destination target is **a 128-hex-character SHA-512 value**. The candidate 32-byte integer matches neither 256-bit half of that original target; it is also not SHA-256 of the original p32/p51/p56/p57 JPEGs or of the SHA-512 target's raw/hex representation. An exact 256-bit appearance alone cannot authenticate a key; direct source-selected ciphers failed. Do not extend this branch with arbitrary IVs, rotations or novel key schedule patches absent original clues.

## P32 11×11 interior81: exact geometry and direct original-cipher test

The original p32 has **121 runes**, and p51 has **92 runes**. Reflowing p32's original rune sequence in reading order into an **11×11** square, a dimension matching the source p50 11-cycle, gives a **40-cell outer circumference** and a **9×9=81-rune interior**. P32 is the *only odd-square-length* unresolved rune page: p6 is the only other perfect square (196=14×14). The inner81 equals the independently source-selected WWP/address81. The p51 92 ciphertext runes can also be divided 81+11, and the difference p32−p51 is29, the GP alphabet size; the split at p51 rune81 lies **inside its eighteenth word**, so it is not independently validated by the original typography.

All **29** GP symbols occur somewhere in p32's121-runic body, but its proposed 81-rune interior contains **28 of29**, missing **C**. Original p32 uses C only **once**, at flattened rune index8 (row0, col8), on the hypothesized outer ring. The GP-prime weight of C is **13**, and original p32 has a **13-dot red post-text mark** at rune offset121. The missing C is arithmetically exact; given its single original occurrence, an unconstrained random 11×11 reflow has **40/121≈33.06%** chance of placing it outside the interior, so this is *candidate visual corroboration* rather than proof of purposeful removal.

P51's **20 printed words** provide **40 ordered first/last endpoint slots**, numerically equal to the proposed p32 ring circumference. The one singleton p51 word contributes the same rune twice to those 40 slots, leaving only39 distinct physical glyph positions. Its 20-word count matching the 40-ring width is therefore a possible coordinate clue, but no first-party orientation/pairing or ciphertext inverse has been identified.

The [read-only source-exact geometry/consumer SFT](../sims/lp2_p32_121_to_81_p51_consumer_sft.cjs) tests four frozen original-cipher consumers: the 81-rune p51 prefix ± the proposed p32 81-rune inner array, p32 inner minus the first81 original T-path states modulo29, and p32 inner minus the 40 p51 endpoint slots repeated. Original inner IoC **0.03302469**, p51 prefix81 **0.03055556**, solved p57 **0.06270997**. The first four fixed inverse candidate IoCs are **0.02870, 0.03642, 0.03827 and 0.03827** respectively, with no recognizable plaintext. This establishes a concrete failed bridge without authorizing an orientation or key hunt.

**Interpretation boundary:** P32's 11×11 arrangement is a mathematically possible reflow, since the original artwork prints p32 as **six unequal lines**, not an 11×11 square. The 40 perimeter slots, missing-C observation and p51 endpoints depend on adopting that square. The T-path and p57 parable do not by themselves authenticate this layout. A next advance must come from an original-source selected traversal, permutation, or independent recoverable plaintext, rather than tuned geometry.

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

### Authentic p56 prime-totient inverse at p51 source-selected 19/81: strict exclusion

The strongest known authored LP2 rune decryption, solved p56's Euler-prime-totient GP29 cipher with literal transparent `F`, offers a more defensible original-input consumer than tuning new table transformations. A frozen test adapts only its source-selected **literal transparent marker** to p51's conspicuous `W` and the already-established GPprime key-clock starts **19 and 81**. The finite family also retains the original `F` marker as a control, both additive orientations and page-continuous versus per-word resets, and tests the whole original92-runic p51 as well as its proposed **89-runic/19-word body after WWP**.

[Source-only original-input inverse and native solved controls](../sims/lp2_p51_wwp19_81_transparent_phi_gate_sft.cjs) passed [Windows Node22 CI44965143964](https://github.com/FlareZ123/liber-primus/actions/runs/44965143964): the exact existing p56 85-rune authentic plaintext is recoverable, and 32 native p57 encryption/decryption plants preserve the full95 GP runes. **All 16 complete-p51 marker/start/direction/reset families are algebraically incompatible** with the exact transparent-marker inverse. Removing the p51 `WWP` header permits exactly **three of 16** fixed body families: literal W, primeclock19, standard negative inverse and continuous clock (2 branches); literal F, primeclock19, positive inverse and continuous clock (4 branches); literal F, primeclock81, standard negative inverse and continuous clock (8 branches). None produces any three-or-more-character word in the solved p56/p57 GP lexicon, and all selected inverse IoCs are **below0.04**. Thus the original p56 cipher grammar cannot provide p51 plaintext through this constrained W19/WWP81 transfer. This does not exclude an independently authored new cipher for p51.

## Outstanding source-to-plaintext gap

A human-visible reading route is possible: the WWP word directly below the printed table offers a GP-prime address, its own page supplies the preperiod clock, and the conditional successor operation ends at the 11-cycle matching the 2016 coda count. However, the original artwork does **not** explicitly authenticate base60 rather than base59, successor navigation rather than another table operation, GP-prime rather than other numeric encodings, or the necessary reversible node-to-rune decoding rule. Original-source word/line punctuation may supply an independent instruction; the paired side-floral art is a static sixteen-page chapter frame, and does not select an operation.

**Decision for #2124:** preserve the exact source-only self-clock, event81/WWP/first-rune19 selector, and tightly specified provisional p57/p32 circumference handoff as one distinct source route and avoid a duplicate p57 literal-word-number attack already rejected in #2113. Any successor must identify an author-selected, reversible **original ciphertext consumer** or a blind predicted unused passage; neither the raw graph coincidence nor the failed additive decoder supplies one.
