# Red-heading numeral navigation: a base-59 terminal and its base-60 rival

**Evidence classification:** original-source structural navigation candidate, without unknown-page plaintext, source-authenticated cipher or key. The exact analysis and a direct solved-page-key negative are reproduced in [the dual-radix original-input test](../sims/lp2_redheading_dualradix_rooted_map_original_sft.cjs). The [initial base-60 test](../sims/lp2_redheading_gp0_base60_navigation_original_sft.cjs) remains an independent regression.

## An operation a human solver might have attempted

The authenticated January 2016 Cicada note says that the manuscript's *words are the map* and their *numbers are the direction*. The published manuscript displays nine red chapter-opening inscriptions, and pages 49–51 contain a 32-by-8 grid of 256 printed two-character numerals. Sum each heading's rune **ordinal** indices (0–28), reduce modulo256 and read that zero-based cell in the printed grid. The value of the token at that cell could be a next-page number or another cell address. For the p15 heading, the first two contiguous red spans (9 and 11 runes) are combined.

The printed numeral inventory uses no lower-case `f`, although its conventional 60-character alphabet includes `f`. Both base60 and a base59 alphabet *omitting f* are mathematically possible, and they give distinct source paths.

| Red heading page | Runes | GP ordinal sum | Grid cell | Literal token | Base59 | Base60 |
| ---: | ---: | ---: | ---: | --- | ---: | ---: |
| 0 | 13 | 181 | 181 | `0e` | 40 | 40 |
| 3 | 16 | 208 | 208 | `0v` | **56** | 57 |
| 8 | 12 | 131 | 131 | `20` | 118 | 120 |
| 15 | 20 | 284 | 28 | `2U` | 148 | 150 |
| 23 | 16 | 220 | 220 | `0w` | **57** | 58 |
| 27 | 19 | 305 | 49 | `0G` | 16 | 16 |
| 33 | 10 | 109 | 109 | `34` | 181 | 184 |
| 40 | 8 | 116 | 116 | `0s` | **53** | 54 |
| 54 | 9 | 159 | 159 | `48` | 244 | 248 |

**Base59 links two equal-length headings to both solved pages:** the only two 16-rune chapter starts, p3 and p23, select **p56 (AN END)** and **p57 (PARABLE)** in that order. P0→p40→p53 selects the first and last page of the chapter containing the numeric grid. An independently already-known source detail adds a second entry to p40: the original non-heading red 11-rune passage on p6 also sums to181, although the GP-prime sums for p0/p6 differ by one. The GP0 p0/p6 coincidence predates this report, so only the combined routing observations are new.

### Broader red-marking cross-check

The ink census contains **18 separately printed red spans** across all LP2 pages, including the two already-clear terminal pages. The same literal GP0-sum→cell→base59 rule lands on **p56 or p57 for exactly two of those 18 spans**: the p3 opening at cell208 goes to56, and the p23 opening at cell220 goes to57. All other independently marked spans land elsewhere. Under conventional base60, exactly one red span (p3) lands on a solved page (p57). The p0 13-rune start and p6 11-rune internal red passage both sum181 and map to p40; this equality was already recorded in earlier research. The broader census extends the source-typed scope without independently corroborating the chosen arithmetic.

The only duplicated GP0 sums among the 18 separately printed red spans form two pairs: p0 opening red13 and p6 internal red11 both sum**181**, selecting **p40** under either radix; p15's **second** red11 span and solved p57's PARABLE red7 heading both sum**120**, selecting **p41** in base59 or **p42** in base60. Under base59 these two source-equal pairs select consecutive physical **p40 and p41**, the opening two pages of the long, repeated-floral chapter. This is a reproducible secondary visual-number relation and may help recognize navigation if an author-provided dispatch rule is found; it cannot provide the missing page-versus-cell type rule or decipher the selected ciphertext.

### Global terminal property of base59 (previously established)

**Earlier independent work already established the rooted base59 graph, the exact fixed-multiset null, the 95-leaf coincidence, and negative known-p56 tree reconstructions.** See [prior source graph](lp2-p50-base59-source-convergent-map.md), [exact null](../sims/lp2_p50_rooted_mapping_exact_null_sft.cjs), and [known-p56 leaf-key obstruction](lp2-base59-tree-prufer-reversible-code.md). This report's distinct observation is the specific red-heading-to-solved-page mapping, NOT discovery of the graph. The exact unconditional graph-root probability under this fixed numeral multiset was already proven as 254/65,280 (0.3891%).

Reading each table value as the address of the next cell creates a directed graph of 256 cells. **All 256 starting addresses eventually reach cell189**, whose token `3C` evaluates to189 in base59. It is the table's **only cycle**, a length-one fixed point. The longest starting route contains39 distinct cells. The original row-major grid gives cell189 zero-based coordinates (row23, column5). This makes an exact, human-followable stopping condition and is consistent with the 2016 signed statement about *direction*; it does not tell the solver what to do with189.

For perspective, 120,000 shuffled versions retaining the exact printed value multiset contained443 graphs with exactly one length-one cycle (0.369%) and18 whose sole fixed point specifically was189 (0.015%). The latter root identity was noticed after inspecting the actual table and cannot be treated as a locked prediction.

### Independent artwork evidence and its tension with the numeral links

An independently established original **five-dot emblem** appears at the bottom of p7, top of p23 and bottom of solved p56, with the p7→p23 **vertical reflection** and p23→p56 **180° rotation** reproducible pixel-for-pixel. This was explicitly recognized by January 2015 historical solvers and rigorously documented in [the original three-page emblem analysis](lp2-p23-p56-halfturn-five-dot-handoff.md). The emblem directly and visually groups **p23 with p56**, whereas the proposed radix59 numeral rule points **p23 toward p57** and p3 toward p56. These independently visible relationships cannot simply be conflated into one route. They might reflect separate roles (a visual transform versus an index pointer), or the apparent heading-number pair may be coincidental. The source gives no rule choosing between those possibilities. The previously completed direct p23↔p56 prime-totient and reflection gates found no known plaintext under their original F-bypass convention, so this report does not reopen them.

### What base60 instead reveals

Base60 yields p0→p40→p54 (three successive red chapter-opening pages), p3→solved p57, p23→58 (outside the printed page sequence). Five of the nine output values lie in the printed table's leftmost column, including p54→cell248 in its bottom-left corner. The base60 successor function has two cycles of lengths2 and11, with basin sizes4 and252. Although the combined cycle length13 resembles the visible thirteen-dot punctuation, that resemblance does not specify a decryption algorithm. The token `0s` differs precisely by one numerical unit between the two radices, producing p53 or p54 respectively. Neither interpretation has an authenticated cipher consumer.

## Fundamental recipient-type objection

The proposed lookup lacks a **fixed output type**. Under base59, only **five of the nine** complete chapter-opening reads are in the physical page-number range 0–57; the other **four values are 118, 148, 181 and 244**, valid cell addresses but impossible physical LP2 pages. Therefore the attractive p3→p56, p23→p57 and p0→p40→p53 phrases are **retrospective interpretations of some table values as page indices**. Treating every value uniformly as another cell pointer yields the already-known universal p50 rooted graph instead, in which 56 and57 do **not** intrinsically designate solved pages. No original source defines an escape flag, an in-range/out-of-range dispatch, or the authority to switch page-pointer and cell-pointer types. **This missing typed operation is currently the decisive blocker**, even before a ciphertext key can be considered. Do not compound this with an unconstrained key guess.

## False-positive bounds and alternative conventions

The source permits more than one arithmetic convention. Two natural heading weights (rune ordinal sums versus GP-prime sums), two treatments of the p15 split heading, zero- versus one-based addressing, and both numeral radices give **16** candidate readings. Under the *specific*, retrospectively selected base59 addresses, an exact p3→56 and p23→57 pair has conditional probability `2/(256×255)` for the original numeral multiset shuffled among cells. Three of150,000 reproducible shuffles had those two ordered results;480 had at least two solved-page results **anywhere among the nine headings** with the primary base59 interpretation.

Crucially, allowing **any** of the sixteen plausible readings to land on at least two solved pages gives **9,500/150,000 (6.33%)** shuffled tables. These are exploratory conditional frequencies, and the much larger history of independent cipher searches is an additional source of postselection. No p-value here establishes Cicada authorship.

For the previously noted base60 pattern (at least a three-heading successor path and a direct solved-page link), the corrected 150,000 unbiased xorshift32/Fisher–Yates controls yield115 matches (0.0767%) for the fixed convention or548 (0.3653%) over its eight arithmetic variants. This supersedes a preliminary 100,000-sample 0.129% estimate that used an inferior low-order-bit random shuffle.

## Original-cipher receiver test and next decision

The **p3→p56 pointer** also selects the historically authentic prime-totient operation, not merely p56's cleartext as a possible pad. Applied to the **complete original p3–p7 chapter (1,145 GP runes)** with the prime sequence starting at its first prime, the two natural ciphertext-F-skip readings yield output IoCs **0.0342825** (no skip) and **0.0349253** (ciphertext-F bypass) and the same unreadable first title `M·N·H·TH·J·OE·S·IA·O·EO·S·W·Y·O·P·EA`. Interpreting the linked value56 as the *initial prime index* instead gives IoC **0.0346230** (no skip), **0.0347788** (ciphertext-F bypass), also unreadable. All four are direct source-readable inverses with frozen sign; none recovers a word. The [dual-radix SFT](../sims/lp2_redheading_dualradix_rooted_map_original_sft.cjs) reproduces the original chapter checks without guessing a key.

The base59 heading links make two source-selected original-cipher targets: the full chapter p3–7 alongside solved p56, and p23–26 alongside solved p57. The bounded test reconstructs the **exact, authenticated 85-rune p56 cleartext** from the prime-totient rule (transparent ciphertext F at offset56) and uses the **95-rune original clear p57** as a second running GP29 key. Both additive signs on their respective original chapters produce unreadable strings and GP29 coincidence rates about0.034, not native-language prose. The test excludes only direct additive key repetition. It does not exclude nonadditive uses of the source pages, nor does re-encryption alone establish a solution.

### Stronger solved-page rejection of a direct table-byte key

A straightforward, fully typed receiver for the navigation numbers is to use the decoded table value as the start of a repeating 256-byte table-derived GP29 additive stream. The only source-exact positive target for the broad *same rule on every red heading* claim is solved p56: its original five-rune **ciphertext** heading has GP0=77 and selects the original table value142 under base59, or144 under base60. Applying the table stream directly to its **85 original ciphertext runes** under both signs and with either ordinary fixed key clock or ciphertext-F bypass matches only **[3, 1, 6, 3] / 85** known plaintext runes for base59 and **[2, 4, 3, 3] / 85** for base60. Both no-F-skip key-stream variants exactly recover a known 85-rune planted plaintext after reversible encryption. The original positive therefore fails at its opening title for **all eight** direct variants, and the fixed repeat-table-key interpretation is incompatible with the authenticated solved page. The result does not exclude special rules on unsolved chapters or a nonadditive key consumer, but it rejects promoting a universal heading→table byte pad.

Next prioritize an actual author-selected **key-generation or ciphertext inverse** for one of these page pairs or the table's fixed point189, ideally with independent held-out plaintext. The source may also be a navigation map whose real keys were delivered by now-missing historical infrastructure. The structural links are insufficient to promote any unknown page to `results/`.
