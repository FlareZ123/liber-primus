# Source-indexed p57 13-dot → p50 outer-perimeter `LP3` locator

**Agent32, 22 November 2026. Classification: exploratory original-source navigation clue, not established cryptanalysis.** This bounded test finds a literal three-byte ASCII-looking sequence at a striking physical location and rejects the simplest page-3 running-key consumer. No unknown LP2 plaintext, authenticated key, reversible mechanism or destination is recovered.

## Source-visible causal path

The already-solved physical p57 PARABLE says “WE MUST SHED OUR OWN CIRCUMFERENCES / FIND THE DIVINITY WITHIN AND EMERGE.” Its red seven-rune `PARABLE` heading is followed by a **13-dot red punctuation mark**. The authentic p49–51 object prints **32 rows × 8 columns** of two-digit numerals in the established 60-character alphabet. Peeling its outermost rectangular circumference would encounter **76 cells**.

The simplest conventional outer-boundary order starts at the original top-left cell and reads clockwise: top row left-to-right, right column downward, bottom row right-to-left, left column upward, including corners only once. This order preserves the physically printed cells and gives:

| One-based outer position | Original grid row, column | Original token | Ordinary base60 byte | ASCII |
| --- | --- | --- | --- | --- |
| **13**, matching the p57 red-dot count | **6,8** | `1G` | **76** | **L** |
| 14 | 7,8 | `1K` | **80** | **P** |
| 15 | 8,8 | `0p` | **51** | **3** |

The three adjacent perimeter bytes therefore read **`LP3`**. These cells lie on original scan [66.jpg](../resources/liber-primus/66.jpg). Under exactly this order the selected first byte lies at perimeter index 13 with no rotated offset or cipher-key fit.

A human might read `LP3` as “Liber Primus page 3” and inspect a previously encountered manuscript page. This interpretation is **speculative**. The source does not define the string `LP3`, choose a particular LP1-versus-LP2 page numbering scheme, explicitly say to read the *discarded* shell as ASCII, or specify how to derive a decryption key from a destination page.

## Immediate discriminating tests

The outer perimeter reads as mostly high-entropy bytes, with ASCII shorthand:

`····a·~··W··LP3lRA#·s········Q!/·T····P·$····q·jD·9n······}··*Iz····z··Psmy\`

Directly applying the same 13/23 marker as a 1-based outer position gives byte76 (`L`) and byte193 (nonprintable), respectively. One peeled inner perimeter gives nonprintable byte169 at position13, while two peels give ASCII `T` at position13; neither supplies a continuation. This is important: the entire perimeter does **not** itself form a clear message.

As a fixed, nonoptimized attempt to use the tentative `LP3` pointer, take all 217 original p3 GP29 runes as the keystream and the 158 original runes on p49 followed by p51 as the unmodified receiver. Use the first 158 key runes, no rotation, phase change or special F skipping. Both reversible direct candidates fail the language gate:

| Original untouched flank / trial | GP29 index of coincidence |
| --- | ---: |
| Untouched p49+p51, 158 runes | **0.0340240264** |
| Subtract p3 rune indices modulo29 | **0.0342659034** |
| Add p3 rune indices modulo29 | **0.0332983955** |

These values remain near the uniform GP29 benchmark **1/29 ≈ 0.0344827586**, and neither decoded trial contains contiguous, source-recognizable prose. The p57 solved-page planted Vigenère message round-trips under the same implementation, confirming only that the arithmetic is correctly inverted.

The short selected p3 center+next-word literal circumference-power transfer was also checked independently: p3 has 217 runes, center index108, and the following intact four-rune word `J I T OE`. Applying source-proposed p28 exponent3 to the center and exponent9 (two shedding actions) to the word gives `B TH E A N`. The unchanged wordwise operation over all p3 yields IoC **0.0343062** and no sustained plaintext. The local `THEAN` appearance is not a recovered word.

## Selection and coincidence caution

A retrospective all-eight-direction scan of **1,584** straight ordered three-cell paths over the printed matrix finds exactly one among the arbitrarily chosen family `LP1`/`LP2`/`LP3`/`LP4`: the physical `LP3` at p49 r6c8 pointing downward. Holding the exact 256-byte multiset fixed, the expected number of such matches after randomizing the positions is only **0.0045854562**, using the original frequencies L=2, P=4, digits1–4 = [1,0,2,3]. This is a **scale diagnostic for the frozen four-string family**, never a discovery-adjusted p-value. The source and this analysis did not preselect the `LP3` target or family before noticing the substring; searching many candidate strings, geometries, start corners and radices raises the true false-discovery probability.

The 13-dot match is original-source structure; choosing p50 as its recipient and interpreting the bytes as a page label are still conditional moves. This observation is worth retaining as a **possible navigation or keyed receiver clue**, particularly because the page-57 text supplies circumference vocabulary. It cannot yet determine a decryptor, and the nearest fixed GP29 inverse failed.

## Reproduction and next decision

The read-only [single-file CommonJS reproducer](../sims/lp2_p57_red13_p50_outerring_lp3_sft.cjs) reads the canonical original-derived numeral tokens, GP rune indices and original ink annotations. It asserts the complete 32×8 base60 table, the genuine p57 red13 and red23 marks, the exact 76-cell ring, all three physical token/byte placements, the 1,584 candidate-path census, both original p3 running-key tests and an authentic solved-page positive plant.

The next **useful decision** is whether an independent, first-party 2014 instruction actually selects a *page 3* key or receiver. Without that instruction, further arbitrary page3 transformations or substring searches would only fit the already observed label. The observation was sent as a nonclaiming handoff to the active table-locator investigator under [Director Issue #2242](https://github.com/FlareZ123/liber-primus/issues/2242); no new Issue was claimed or displaced.
