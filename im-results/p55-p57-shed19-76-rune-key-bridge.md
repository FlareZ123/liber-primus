# Terminal p57 one-rune-per-body-word shedding: a source-complete 76-rune known-text candidate

**Agent 2, 12 November 2026. Evidence class:** exact original-source three-artifact length correspondence, with bounded direct-key and all-secret stationary-lookup obstructions. **No unbroken LP2 plaintext, authentic key, continuation, or confirmed cipher recovered.** [Executable single-file source test](../sims/p55_p57_shed19_key_bridge_sft.cjs).

## Original source and minimal human solve hypothesis

The *solved* LP2 physical p57 ends with “WE MUST SHED OUR OWN CIRCUMFERENCES. FIND THE DIVINITY WITHIN AND EMERGE.” The immediately preceding unknown LP2 page p55 contains exactly **76 GP29 runes**. The separate source-visible p49–51 32×8 numerical table has an outer one-cell-wide **76-cell circumference**. These three numbers are grounded in three original artifacts, although choosing to compare them remains a hypothesis.

The p57 **PARABLE** has one red **7-rune heading** and precisely **19 body words**. Its 95 runes become **76** if one removes exactly one rune from every body word while preserving the heading:

`95 − 19 = 76`.

Two whole-source extractions are fixed without fitting p55: remove the **first** rune of each of the 19 body words, or remove the **last** rune of each. Every body word has length at least two, so neither scheme erases a word. Keep the red PARABLE title intact. The 76 GP29 symbols are known exactly because p57 itself is solved.

This is more selective than the existing terminal **19×4/19×5** analysis, which partitions both full pages into equal-width quads/quints and tests all-secret affine transfers. It also differs from the original full-manuscript **first-and-last-rune word-interior** audit. Neither had constructed the **original 19-word, one-rune-shaven p57 76-rune key** or tested it as the p55 plaintext/keystream alongside the full original table perimeter. The 19×4 fixed-quads page bridge, literal 17-word matching and direct 76-byte table-to-p55 additions were already rejected separately; their prior findings remain unchanged.

## Direct key: full p57-derived 76-rune mask → original p55

Apply the only two direct GP29 additive inverses, `D[i] = (C55[i] ± K57[i]) mod29`, over all 76 original p55 runes, without altering printed order, inserting skips, or choosing a secret phase. All four are exactly invertible; no offset fitting is needed.

| Shed position from each p57 body word | Shaved key IoC | p55 minus key IoC | p55 plus key IoC |
| --- | ---: | ---: | ---: |
| First | **0.075439** | **0.040351** | **0.034386** |
| Last | **0.056491** | **0.032632** | **0.038947** |

The actual p55 source ciphertext has IoC **0.037895**, while known p57 clear prose has IoC **0.062710**. None of the four p55 inversions recovers a grammatical opening or a recognizable instruction. The highest, 0.040351, remains at the ciphertext-like level; its first 76-rune GP transliteration begins `HUSSMAEARXYDYHSUAEYSHTISUEAIAAEXSXEOTEOOECEODAEXMLRMPOJ`, without word-boundary evidence. These are narrow direct-pad negatives, not an exclusion of every possible cipher using p57 as source text.

## A three-way inverse: p57-shaved candidate plaintext, p55 ciphertext, p50-ring key

Read the real 32×8 table's perimeter from top-left, across the top, down the right side, along the bottom from right to left, then up the left side, without repeating corners: **76 source token values**. Reverse that complete ring as the sole direction alternative. The conventional published base60 interpretation gives original bytes 0…255, reduced modulo29 for a direct GP rune pad.

Under the exact candidate `C55 = shed(P57) + perimeterPad mod29` or `C55 = shed(P57) − perimeterPad mod29`, the **required** pad is `(C55 − shed(P57)) mod29`. Because both p55 and the shaved p57 are fixed original strings, **no guessed plaintext or cryptographic key is used**.

| p57 shaving | Ring direction | Matches if ring added to known p57 | Matches if ring subtracted |
| --- | --- | ---: | ---: |
| First | Clockwise | 1/76 | 4/76 |
| First | Reversed | 4/76 | 3/76 |
| Last | Clockwise | 5/76 | 6/76 |
| Last | Reversed | **6/76** | 4/76 |

Every direct ring interpretation has at least **70** contradicted positions. There is no resulting source-key encryption of the observed p55 ciphertext under these stationary source-order rules.

More permissively, allow the **entire 76-byte table perimeter** to act through an **arbitrary completely unknown but fixed function** `F(byte) → GP29 pad`, with a different free F for each of the four source readings. This contains *every possible stationary substitution codebook*, including the ordinary byte residue rule. The original perimeter has **68 distinct byte values** in 76 positions, hence eight repeated-token occurrences. A single stationary function must give identical pad for each repeated token. The exact maximum-match calculation sums the modal required-pad frequency for each source-token class:

| Shaving / perimeter orientation | Absolute maximum exact positions under every secret lookup | Forced errors |
| --- | ---: | ---: |
| First / clockwise | **68/76** | 8 |
| First / reversed | **68/76** | 8 |
| Last / clockwise | **70/76** | 6 |
| Last / reversed | **69/76** | 7 |

Thus no *fixed token-to-key lookup*, regardless of its unknown 256-entry content, can make the two original terminal strings form a clean additive relation using this literal 76-cell ring order. This conclusion is conditional on the p57 shaving actually being the proposed p55 plaintext, which is **unproven**. A stateful or position-dependent key and another geometric traversal remain logically possible, but no original source selects them.

## Independent word-number reading of the p57 body

A second literal interpretation of the signed 2016 hint “Its words are the map … their numbers are the direction” lets each of p57's **19 body words** supply one additive GP29 key value, repeated across a consecutive group of four p55 runes. The two obvious source-authentic word values are sum of GP rune indices and sum of GP prime weights, each modulo29. These yield precisely **19×4 = 76** p55 decoded runes with no chosen phase. All four plus/minus streams have IoC in **0.032632–0.041404** and no native-GP prose. This excludes those four direct scalar-key reads alone. The 19×4 block assumption is not an independently printed p55 layout.

## Decision and future condition

The p57 `heading7 + (19 words − one glyph each) = 76` is an **unambiguous arithmetic construction**, plausibly motivated by the word “shed,” and it can produce a full-length, known-source key/crib for p55. The three-way fit against the real 76-cell numerical-table border does **not** work even with a wholly secret stationary token-to-rune mapping. The direct p57 key and 19 repeated word-number keys also do not recover plaintext.

Do not elevate the count match into a verified human solve step. It is one more exact alignment among a project that has already considered numerous post-selected 76/95/19 relationships, and its best original-cipher tests are negative. Retire the explicitly tested direct additive, stationary ring lookup and four scalar word-key variants. Reopen the shaved p57 route only if an **independent original instruction selects a changing key, different receiver, transport, or decoder** and yields withheld plaintext predictions.

**Reproduction:** `node sims/p55_p57_shed19_key_bridge_sft.cjs`; the test reads both original canonical LP2 pages and the exact source 32×8 base60 tokens, reconstructs both 76-rune shaved strings, checks direct GP29 encryption/decryption and an independent solved-native 76-rune plant, proves the stationary lookup maxima by exact class enumeration, and plants a secret stationary map that fits every original ring position. No known manuscript ciphertext was edited.

**Executed original-source regression:** the new `p55_p57_shed19_key_bridge_sft.cjs` step completed without error and printed the source-derived measurements in [manual Actions run 43168398561](https://github.com/FlareZ123/liber-primus/actions/runs/43168398561). The **overall reused workflow is red** because a *separate pre-existing* `p55_2016_sha1_exterior_crib_inner_sft.cjs` step fails a hard-coded legacy score assertion at line94. It ran after this SFT. The new step's success should not be confused with the aggregate workflow conclusion, and the legacy failure is not evidence about this new hypothesis.
