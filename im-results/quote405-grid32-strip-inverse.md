# 32×405 four-gap tableau: retired source premise and historical bounded inverse

**Decision:** the four-hole source premise is retired. A correct original-image audit found no internal separator at the four derived rune offsets used by this model. The reversible inverse experiments remain useful as a finite historical negative, with **no unknown Liber Primus plaintext, key, continuation or authenticated decipherment recovered**.

## Source correction

Seven derived quotation spans contain **405 runes** in total, and the numerical table contains **32 rows**, so 32×405 = 12,960 while the unsolved rune stream contains 12,956 runes. Earlier work supplied the difference of four by treating alleged internal dots on physical pp4, 21, 35 and 41 as clock holes.

That visual premise came from a scan-numbering error. LP2 physical page N is archive scan N+17. The earlier component measurements used archive files `04.jpg`, `21.jpg`, `35.jpg` and `41.jpg`; the correct source images for those LP2 pages are `21.jpg`, `38.jpg`, `52.jpg` and `58.jpg`.

On the correct target lines, a frozen 9–10 px detached-square census finds **6, 4, 7 and 5 components**. Those totals exactly equal the canonical punctuation already printed on the four lines: ordinary single-dot word separators plus four-dot stops where present. There is no additional separator-sized component at global rune cuts **1,110, 5,138, 8,515 or 10,089**. The 2017 KrisoYotam transcription also joins all four disputed words.

The selected source-visible contract is therefore **12,956 runes in 2,896 words**. See [the visual-token audit](lp2-visual-token-contract.md) and [source SFT](../sims/lp2_visual_token_contract_sft.py).

## Preserved synthetic embedding

For reproducibility, the four retired offsets can still be inserted as artificial nulls before the corresponding runes. Doing so creates 12,960 positions, with expanded zero-based holes:

| Retired offset | Expanded slot | 405-block / local slot |
| ---: | ---: | ---: |
| 1,110 | 1,110 | 2 / 300 |
| 5,138 | 5,139 | 12 / 279 |
| 8,515 | 8,517 | 21 / 12 |
| 10,089 | 10,092 | 24 / 372 |

Deleting those four artificial nulls restores the original 12,956-rune stream exactly. This is bookkeeping around a historical hypothesis and supplies no source selector.

## Historical bounded inverse

The existing [CommonJS SFT](../sims/quote405_grid32_strip_inverse_sft.cjs) preserves the old model under an explicit **legacy synthetic gap** label. It tested 24 exact reversible settings over all 12,956 ciphertext runes:

- four quote-plus-grid GP29 key constructions, each under direct additive and predecessor-exclusion registers;
- eight RC4 row-key constructions, each under the same two registers.

The original ciphertext IoC is **0.0344783979**. The best quote-plus-row predecessor-exclusion inverse reached **0.0353094623** and the best RC4-row predecessor-exclusion inverse reached **0.0353404552**. Direct GP29 candidates remained **0.0344629–0.0344986**. All source-native controls recovered exactly, and all original candidates round-tripped their ciphertext.

Those measurements reject the tested synthetic four-hole key families. They do not support the historical existence of four source marks.

## Consequences for the research frontier

The 32×405 branch loses its only proposed rule for choosing four clock holes. The numerical difference of four cannot identify positions by itself. Further permutations, alternate stream-cipher drops or tuned phases on these same holes are therefore unmotivated.

The 405-rune quote channel remains a separate derived observation and may be tested only when an independent clue supplies an operation. Word-index research should use the canonical 2,896-word parser directly; there is no remaining 2,900-token source ambiguity.
