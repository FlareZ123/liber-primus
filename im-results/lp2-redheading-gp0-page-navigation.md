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

### Global terminal property of base59 (previously established)

**Earlier independent work already established the rooted base59 graph, the exact fixed-multiset null, the 95-leaf coincidence, and negative known-p56 tree reconstructions.** See [prior source graph](lp2-p50-base59-source-convergent-map.md), [exact null](../sims/lp2_p50_rooted_mapping_exact_null_sft.cjs), and [known-p56 leaf-key obstruction](lp2-base59-tree-prufer-reversible-code.md). This report's distinct observation is the specific red-heading-to-solved-page mapping, NOT discovery of the graph. The exact unconditional graph-root probability under this fixed numeral multiset was already proven as 254/65,280 (0.3891%).

Reading each table value as the address of the next cell creates a directed graph of 256 cells. **All 256 starting addresses eventually reach cell189**, whose token `3C` evaluates to189 in base59. It is the table's **only cycle**, a length-one fixed point. The longest starting route contains39 distinct cells. The original row-major grid gives cell189 zero-based coordinates (row23, column5). This makes an exact, human-followable stopping condition and is consistent with the 2016 signed statement about *direction*; it does not tell the solver what to do with189.

For perspective, 120,000 shuffled versions retaining the exact printed value multiset contained443 graphs with exactly one length-one cycle (0.369%) and18 whose sole fixed point specifically was189 (0.015%). The latter root identity was noticed after inspecting the actual table and cannot be treated as a locked prediction.

### What base60 instead reveals

Base60 yields p0→p40→p54 (three successive red chapter-opening pages), p3→solved p57, p23→58 (outside the printed page sequence). Five of the nine output values lie in the printed table's leftmost column, including p54→cell248 in its bottom-left corner. The base60 successor function has two cycles of lengths2 and11, with basin sizes4 and252. Although the combined cycle length13 resembles the visible thirteen-dot punctuation, that resemblance does not specify a decryption algorithm. The token `0s` differs precisely by one numerical unit between the two radices, producing p53 or p54 respectively. Neither interpretation has an authenticated cipher consumer.

## False-positive bounds and alternative conventions

The source permits more than one arithmetic convention. Two natural heading weights (rune ordinal sums versus GP-prime sums), two treatments of the p15 split heading, zero- versus one-based addressing, and both numeral radices give **16** candidate readings. Under the *specific*, retrospectively selected base59 addresses, an exact p3→56 and p23→57 pair has conditional probability `2/(256×255)` for the original numeral multiset shuffled among cells. Three of150,000 reproducible shuffles had those two ordered results;480 had at least two solved-page results **anywhere among the nine headings** with the primary base59 interpretation.

Crucially, allowing **any** of the sixteen plausible readings to land on at least two solved pages gives **9,500/150,000 (6.33%)** shuffled tables. These are exploratory conditional frequencies, and the much larger history of independent cipher searches is an additional source of postselection. No p-value here establishes Cicada authorship.

For the previously noted base60 pattern (at least a three-heading successor path and a direct solved-page link), the corrected 150,000 unbiased xorshift32/Fisher–Yates controls yield115 matches (0.0767%) for the fixed convention or548 (0.3653%) over its eight arithmetic variants. This supersedes a preliminary 100,000-sample 0.129% estimate that used an inferior low-order-bit random shuffle.

## Original-cipher receiver test and next decision

The base59 heading links make two source-selected original-cipher targets: the full chapter p3–7 alongside solved p56, and p23–26 alongside solved p57. The bounded test reconstructs the **exact, authenticated 85-rune p56 cleartext** from the prime-totient rule (transparent ciphertext F at offset56) and uses the **95-rune original clear p57** as a second running GP29 key. Both additive signs on their respective original chapters produce unreadable strings and GP29 coincidence rates about0.034, not native-language prose. The test excludes only direct additive key repetition. It does not exclude nonadditive uses of the source pages, nor does re-encryption alone establish a solution.

Next prioritize an actual author-selected **key-generation or ciphertext inverse** for one of these page pairs or the table's fixed point189, ideally with independent held-out plaintext. The source may also be a navigation map whose real keys were delivered by now-missing historical infrastructure. The structural links are insufficient to promote any unknown page to `results/`.
