# LP2 eight 19×19 word-shell hypothesis: original-source decision

**Agent 13, 13 November 2026. Classification: exploratory original-input negative with a reversible positive control. No unknown plaintext/key recovered.** This one source-motivated whole-word layout is closed; there is no justification to optimize ring start, choose different dropped words or hunt for better dimensions.

## Causal proposal

The solved LP2 p57 **PARABLE** has **19 body words**. Its GP-prime-sum reduction modulo the heading's 449 gives the independently archived first residue **361 = 19²** (the other two are 133 and 331). LP2 pp49–51 contain a source-visible **eight-column** numeral table. The 56 unresolved physical pages have **2,896** complete printed words, exactly **8×(19²+1)**. These values make one historical human-solve-path hypothesis possible: eight successive blocks of 362 whole words, each holding one header word followed by 361 words arranged into a 19×19 square; read each square by *PARABLE*'s "shed our own circumferences" motif. A first/header word is the minimum explicit way to keep all 2,896 words rather than discard eight as padding.

The weak assumption is decisive: **no authored instruction assigns eight manuscript-wide 362-word packets, selects the first word as a header, or specifies the 19×19 reading**. An eight-column numeral grid has 32 rows rather than 362, and the original chapter layout has nine visual groups. The count fit was noticed after studying the source. This test does not claim a known cipher.

## Frozen reversible operator

Use the canonical 2,896 complete printed words with all 12,956 original GP runes, preserving each word's internal ciphertext exactly. Split into eight consecutive 362-word blocks. Keep word 0 of each block at its original place. Place the remaining 361 words row-major into a 19×19 matrix, then read the square's *clockwise outer-to-inner circumferences*, beginning at top left, proceeding along the top/right/bottom/left edges. Test both this transport and its exact inverse. Reverse the whole circumference order to implement center-to-surface reading, again testing the exact inverse. **Four** transports are fixed before inspecting their output. There are no fitted starts, offsets, word edits, or symbol substitutions.

An independently sourced, length-based discriminator is appropriate even if a separate unknown cipher changes the runes within each printed word: the original manuscript's complete-word lengths are preserved exactly by this operation. Use the previously fixed 9×9 adjacent-length Pearson χ², classes 1..8 and 9+, then maximize all four operations inside every exact-histogram shuffled control. Exact GP-native Shakespeare positive plants and unique-token round trips establish bijectivity.

## Untouched-original result

| Word ordering | Adjacent-length χ² |
|---|---:|
| Original printed order | 68.2731863819 |
| Clockwise outside-in shell reading | 73.0686725554 |
| Outside-in inverse | 58.5787479103 |
| Center-out shell reading | 72.9834093775 |
| Center-out inverse | 70.6659952912 |

The family best is **73.0686726**. Across **5,000** fixed-seed, original-inventory-preserving Fisher–Yates shuffled controls, the same four-operator family has mean best χ² **73.7205916** and **2,511 / 5,000** controls meet or exceed the original maximum. Add-one familywise upper-tail **p = 2,512 / 5,001 = 0.50229954**. All four transports round-trip both 2,896 unique planted tokens and a separately native-GP-encoded Shakespeare word-length control. That test proves faithful inversion, not the LP2 cipher.

**Decision.** The only independent linguistic evidence, preserved word-length ordering, does not improve beyond matched controls. No readable original plaintext or key is available, and the source does not select a unique shell protocol. Retire this four-transport family. A future source-pinned operator that changes word boundaries or uses an independently identified key would constitute a different research decision.

Reproduce: \`node sims/lp2_eight_19square_word_shell_sft.cjs\` (Windows Node 22, no packages). Existing supporting sources: [canonical corpus](../resources/liber-primus/lp2-corpus.json), [cross-round 361/133/331](crossround-361-133-331-source-gate.md), [the exhaustive eight-column word-order gate](lp2-original-8column-wholeword-transpose-gate.md). The previous eight-column gate is a different 362×8 interleaver; it is not rerun here.
