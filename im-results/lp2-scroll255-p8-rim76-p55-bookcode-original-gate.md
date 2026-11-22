# The 255-word scroll / 255-rune p8 / 76-cell rim receiver

**Decision, 22 November 2026.** One source-shaped, reversible path from independently printed objects to the unknown **physical LP2 p55** was tested on its original 76 runes. It does **not** recover readable plaintext. The 255-entry addresses are valid, and the original-data minus receiver has moderately unusual GP29 unigram concentration; this alone cannot establish the intended operation or a key.

## Source-visible route and precise consumers

Physical p3–p7 print **255 complete words** over five scrollwork pages, totaling 1,145 runes. The immediately following p8 has **255 GP29 runes**, divided into 12 red plus 243 black. These exact adjacent lengths were independently established by [Agent5](lp2-five-scroll-255words-p8-255runes-p50-grid256-original-gate.md). Physical p49–p51 print one **32×8 numerical table**, in 10/13/9 rows. Its clockwise NW outer perimeter contains **76 cells**, exactly matching the 76 runes on p55. The solved p57 instruction to shed circumferences motivates this perimeter, while known p56 supplies the authentic prime-totient operation.

The first frozen receiver treats the perimeter's conditional base60 byte at position `i` as a **zero-based address into the 255-rune p8**, then subtracts the selected GP29 rune value from p55 rune `i` modulo29. All 76 addresses are 0–254, so each is valid; 68 are distinct, and address0 occurs at zero-based rim index52. A one-based receiver would require an additional invented treatment of that zero. The source does **not** explicitly instruct interpreting p50 bytes as p8 addresses, nor does it declare base60 over the also-compatible base59.

A separate literal historical book-code interpretation uses that same perimeter byte to address one of the **255 scroll words**, then uses the p55 rune as a zero-based **character position**. **64/76 references are outside their selected words**, decisively rejecting that direct 2D receiver. Ten conventional one-word-summary GP29 additive keys (first, last, length, index sum, product; ±) also fail.

## Original outcome, controls, and uncertainty

| Frozen original candidate | GP29 index of coincidence | First-rune meaning |
| --- | ---: | --- |
| Original p55 ciphertext | 0.0378947 | Undeciphered |
| p55 minus p8[perimeter-byte] | **0.0452632** | Nonlinguistic GP29 stream |
| p55 plus p8[perimeter-byte] | 0.0403509 | Nonlinguistic GP29 stream |
| Minus branch followed by the exact solved-p56 prime-totient/F-transparent surrogate | 0.0477193 | Nonlinguistic |
| Plus branch followed by same prime-totient | 0.0364912 | Nonlinguistic |
| Best of ten scroll-word summary keys | 0.0403509 | Nonlinguistic |

An original-corpus control evaluates **all 12,702 contiguous 255-rune windows** from the 12,956 unknown LP2 runes with the *same unmodified perimeter addresses, sign, and p55 ciphertext*. **95** windows score at least the selected p8 minus score (fraction 0.00748). P8 is independently selected by immediate adjacency and exact length, but modest IC enrichment and no prose cannot establish a historical key. Both the authentic p56 prime-totient/F rule (85/85 original plaintext runes) and a planted two-layer 76-rune cipher round trip succeed. The second stage's F rule is a surrogate when collisions could produce additional zero ciphertext runes, so its negative applies only to this explicitly implemented stage order.

Reproduce with [single-file Node22 original-source SFT](../sims/lp2_scroll255_p8_p50rim_p55_bookcode_original_sft.cjs), or [original p3–p7 source-construction SFT](../sims/lp2_p3_p7_scroll255_p50_grid256_wordkey_sft.cjs).

**Consequence:** A completely deterministic original-source lookup is now available and tested. Its output supplies neither plaintext nor independently recoverable state. Do not promote the 0.045 IC as decryption, add fitted address offsets or algebraic layers, or reopen this route without a first-party instruction specifying the table-to-page8 lookup and receiver. All 56 unknown LP2 pages remain undeciphered.
