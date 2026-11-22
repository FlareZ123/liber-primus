# P8 49 page-local black fragments and historical Stage10 7×7 matrix: original-cipher decision

**Original test: Agent49, 21 November 2026. Source-boundary correction: Agent36, 22 November. Status: 49-fragment candidate, finite inverse negative; no plaintext.**

## Independently visible operand and receiver

The authenticated 2014 Stage10 source includes an **original 7×7 integer magic square** with all seven row and column sums **1033**. It has 49 integer cells, and its reduction modulo29 is invertible. The p8 original 255-rune physical page begins with **twelve red runes in two complete words** (printed lengths4,8), followed by exactly **49 page-local black word fragments** totaling **243 runes = 3⁵**. Source-aware seam parsing establishes that only **48** of those fragments are complete black words. The **49th is the final one-rune fragment** of p8, whose following **five runes begin p9** before the next genuine printed separator; the authentic spanning word has length **six**.

This exposes a critical distinction in the earlier 49-word reading: **49 is the count of p8 page-local fragments**, rather than 49 complete words. If the last fragment is completed with the five p9 runes, the 49 source words instead total **248** runes, so the same 49 units cannot simultaneously be all complete words and the original **3⁵ = 243** p8-rune cube.

The 49 page-local fragments still provide a physically visible 7×7 **fragment** receiver for the 49 historical matrix cells, but the case for author-intended word-level use is now materially weaker. Unlike an arbitrary selected LP2 window, the receiver's source-printed page-local fragment boundaries determine its 49 numbers. It may be an intentional square/word alignment, but neither the historical Stage10 protocol nor solved LP2 presently instructs applying that 2014 matrix to p8.

## Frozen single reversible matrix hypothesis

The prior Cicada original *SOME WISDOM* word-to-number mechanism makes each complete printed GP rune word's **sum of its GP primes** a historically plausible scalar. As related source-based alternatives, use zero-based **sum of GP rune indices**, the **product of GP rune indices modulo29**, and the **product of GP rune primes modulo29**. Index-product is especially motivated by the separate p6–p8 red-source DH reconstruction. Reduce the original 49 **page-local fragment** sums modulo29, keep their source order and arrange as **seven consecutive seven-symbol row vectors**.

For the exact historical Stage10 7×7 matrix `M`, interpret each row as a vector in GF29, and decode with either `M⁻¹` or `M` (direction unknown). For row versus column vector convention, use the relevant multiplication orientation. This creates **sixteen fixed tests**: four word aggregators × two cipher directions × two row/column conventions. Do not search alternate word windows, reorder cells or derive new matrices from output. Every model is exactly invertible at the 49-symbol *word-sum* level, verified both on the original data and on independent GP29 synthetic controls; it does **not** reconstruct the 243 underlying source glyphs, so it is a candidate short message rather than a full-page cipher.

First direct source test already rejects simply reading the p8 49 prime sums as the original historical 49 matrix values: only **one** p8 value appears anywhere in the square; **zero** entries agree by printed cell position. Their seven original row totals are `[1465,1445,1650,1985,1823,2143,1814]`, not the expected fixed 1033.

## Original-cipher results

None of the sixteen reversible GF29 matrix operations yields legible GP-native prose in its 49-symbol output. The recovered GP29 indices of coincidence are:

| Input / decoder | `M⁻¹` row | `M⁻¹` column | `M` row | `M` column |
|---|---:|---:|---:|---:|
| GP prime sum | 0.035714 | 0.027211 | 0.034864 | 0.036565 |
| GP index sum | 0.039116 | 0.031463 | 0.023810 | 0.040816 |
| GP index product | 0.031463 | 0.036565 | 0.036565 | 0.029762 |
| GP prime product | 0.027211 | 0.037415 | 0.037415 | 0.035714 |

Example of the historically motivated **prime-sum, inverse row** 49-rune readout: `D O N R L F A H O I R C TH H IA G D IA P F S M X L W P X EO M NG R U A OE EA H X R O P R W H N O S D TH S`. This is GP-rune transliteration, not plaintext.

The source-reconstructed inputs, precise numerical matrix, inversion, complete sixteen-model inverse controls and observed outputs are in [the original-source Windows/Node22 SFT](../sims/lp2_p8_49words_2014_7x7_square_receiver_sft.cjs). [Windows Node22 original-eight run 44943069804 passed](https://github.com/FlareZ123/liber-primus/actions/runs/44943069804), as did [the sixteen-case source-product extension, run 44943436899](https://github.com/FlareZ123/liber-primus/actions/runs/44943436899). Its test does not assume English word boundaries in the 49-symbol extracted message, so a decisive positive would have been a coherent continuous GP rune phrase. The existing broader square-vs-page rune-stream tests did **not** cover this distinct 49-*fragment*-sum matrix receiver.

## Genuine 49-whole-word complete-seam receiver

The correction above gives one source-accurate **full-word** registration independent of the earlier page-local 49-fragment word sums: the original 48 complete p8 black words, followed by its one-rune tail plus the first five runes of p9, form exactly **49 whole words totaling 248 runes**, in the same printed order as the historical 2014 seven-square's 49 integer cells. This makes possible a direct *rune-preserving* consumer instead of the earlier lossy single GP sum per word: each magic-square cell supplies a literal source-decoded integer shift applied **uniformly to every rune in its corresponding complete word**, modulo29. This is one conventional source-matched word-local Vigenère mechanism, with four fixed orientations (printed row-major / column-major) and signs ±. The historic square's repeated values make rank sorting underdetermined; the decoder therefore uses the exact printed numeric values without new tie-breaking, fitted phases or keys.

The original-input [whole-word Windows Node22 SFT](../sims/lp2_p8_p9_49wholeword_2014_magic7_sourcepad_sft.cjs) verifies the exact 49 complete printed words and their 248 GP29 values, constructs 49 independently ordinary source-native English control words with precisely those original GP lengths, encrypts them with the source magic numbers and then recovers **248/248** source runes under every frozen orientation and sign. The unchanged original words yield:

| Magic-square cell register / sign | Native English dictionary words among 49 | Entire 248-rune IoC |
| --- | ---: | ---: |
| Source printed row-major, subtract | **3/49** | 0.0335–0.0365 |
| Source printed row-major, add | **0/49** | 0.0335–0.0365 |
| Source column-major, subtract | **2/49** | 0.0335–0.0365 |
| Source column-major, add | **0/49** | 0.0335–0.0365 |

The quoted IoC band is the bounded range of the exact four outputs; their full original GP readouts and precise individual IoCs appear in the reproducible SFT output. **None** recovers continuous source-native English, a plaintext sentence, a key or a destination. [Windows original-source CI PASS](https://github.com/FlareZ123/liber-primus/actions/runs/44968924589). These exact source-appropriate **whole-word** negatives supplement the earlier 16 reversible *fragment-sum* matrix negatives and close the most immediate consequence of correcting p8's last-word boundary.

## Research decision

Preserve **49 physically delimited page-local black fragments ↔ 7×7 source-square cells** as a possible exact page-local receiver. The original assertion of 49 **complete** black words is superseded. A proper *whole-word* 49-receiver would have to include five runes from p9, changing the total from 243 to 248 and requiring an additional cross-page reading instruction. Retire the sixteen exact direct GF29 row/column Hill-word-sum and product consumers and the four corrected 49-whole-word historical-square shift consumers. They are reversible but fail to recover language. A valid successor must obtain a first-party operation that connects individual black-word spellings to matrix keys without losing the original 243-rune information, or authenticate an independent 49-symbol destination/message in a different encoding. Mere count agreement does not fix a cipher.

The parallel [p6–p8 source-red full DH23 state gate](lp2-p6-p8-red-shamir-dh-fullstate-coverage.md) is a separate physically motivated route; its arithmetic does not authenticate this 7×7 matrix consumer.
