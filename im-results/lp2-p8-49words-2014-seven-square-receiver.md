# P8 exact 49-word body and historical Stage10 7×7 matrix: original-cipher decision

**21 November 2026, Agent49. Status: source-visible word-register candidate, finite inverse negative; no plaintext.**

## Independently visible operand and receiver

The authenticated 2014 Stage10 source includes an **original 7×7 integer magic square** with all seven row and column sums **1033**. It has 49 integer cells, and its reduction modulo29 is invertible. The p8 original 255-rune physical page begins with **twelve red runes in two complete words** (printed lengths4,8), followed by exactly **49 complete printed black words** totaling **243 runes = 3⁵**.

The 49 complete black words provide a fixed, physically visible 7×7 receiver for the 49 historical matrix cells. Unlike an arbitrary selected LP2 window, the receiver's source-printed word boundaries fully determine its 49 numbers. It may be an intentional square/word alignment, but neither the historical Stage10 protocol nor solved LP2 presently instructs applying that 2014 matrix to p8.

## Frozen single reversible matrix hypothesis

The prior Cicada original *SOME WISDOM* word-to-number mechanism makes each printed GP rune word's **sum of its GP primes** a historically plausible scalar. As related source-based alternatives, use zero-based **sum of GP rune indices**, the **product of GP rune indices modulo29**, and the **product of GP rune primes modulo29**. Index-product is especially motivated by the separate p6–p8 red-source DH reconstruction. Reduce the original 49 per-word sums modulo29, keep their source order and arrange as **seven consecutive seven-symbol row vectors**.

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

The source-reconstructed inputs, precise numerical matrix, inversion, complete sixteen-model inverse controls and observed outputs are in [the original-source Windows/Node22 SFT](../sims/lp2_p8_49words_2014_7x7_square_receiver_sft.cjs). [Windows Node22 original-eight run 44943069804 passed](https://github.com/FlareZ123/liber-primus/actions/runs/44943069804), as did [the sixteen-case source-product extension, run 44943436899](https://github.com/FlareZ123/liber-primus/actions/runs/44943436899). Its test does not assume English word boundaries in the 49-symbol extracted message, so a decisive positive would have been a coherent continuous GP rune phrase. The existing broader square-vs-page rune-stream tests did **not** cover this distinct 49-*word*-sum matrix receiver.

## Research decision

Preserve the strong **49 black words ↔ 7×7 source-square cell count** observation as an independent, physically selected candidate. Retire the sixteen exact direct GF29 row/column Hill-word-sum and product consumers, which are reversible but fail to recover language. A valid successor must obtain a first-party operation that connects individual black-word spellings to matrix keys without losing the original 243-rune information, or authenticate an independent 49-symbol destination/message in a different encoding. Mere count agreement does not fix a cipher.

The parallel [p6–p8 source-red full DH23 state gate](lp2-p6-p8-red-shamir-dh-fullstate-coverage.md) is a separate physically motivated route; its arithmetic does not authenticate this 7×7 matrix consumer.
