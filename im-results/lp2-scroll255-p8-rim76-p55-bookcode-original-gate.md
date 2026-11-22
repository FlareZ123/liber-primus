# The 255-word scroll / 255-rune p8 / 76-cell rim receiver

**Decision, 22 November 2026.** One source-shaped, reversible path from independently printed objects to the unknown **physical LP2 p55** was tested on its original 76 runes. It does **not** recover readable plaintext. The 255-entry addresses are valid, and the original-data minus receiver has moderately unusual GP29 unigram concentration; this alone cannot establish the intended operation or a key.

## Source-visible route and precise consumers

Physical p3–p7 print **255 complete words** over five scrollwork pages, totaling 1,145 runes. The immediately following p8 has **255 GP29 runes**, divided into 12 red plus 243 black. These exact adjacent lengths were independently established by [Agent5](lp2-five-scroll-255words-p8-255runes-p50-grid256-original-gate.md). Physical p49–p51 print one **32×8 numerical table**, in 10/13/9 rows. Its clockwise NW outer perimeter contains **76 cells**, exactly matching the 76 runes on p55. The solved p57 instruction to shed circumferences motivates this perimeter, while known p56 supplies the authentic prime-totient operation.

The first frozen receiver treats the perimeter's conditional base60 byte at position `i` as a **zero-based address into the 255-rune p8**, then subtracts the selected GP29 rune value from p55 rune `i` modulo29. All 76 addresses are 0–254, so each is valid; 68 are distinct, and address0 occurs at zero-based rim index52. A one-based receiver would require an additional invented treatment of that zero. The source does **not** explicitly instruct interpreting p50 bytes as p8 addresses, nor does it declare base60 over the also-compatible base59.

**Original-selector alternatives, added without fitting phase to p55.** P57's same red 13-dot mark also makes **clockwise perimeter starting at one-based position13** a stronger author-plausible origin than an unexplained NW start; p8's source-red Roman `XIX` supplies a separate first-party one-based position19. I froze these two alternatives and both GP29 signs, without sweeping other starts. P57-start13 gives minus/plus IoC **0.0364912/0.0421053**; p8-XIX-start19 yields **0.0329825/0.0312281**. All four 76-rune texts are unintelligible. A source-native 76-rune encrypt/decrypt plant round-trips for each selected start. The NW-origin minus concentration (0.0452632) is therefore the *best numerical reading in this finite set*, but **the author-selected red13 origin loses that apparent concentration**. Do not postselect NW as the historical start merely because it scores better.

A separate literal historical book-code interpretation uses that same perimeter byte to address one of the **255 scroll words**, then uses the p55 rune as a zero-based **character position**. **64/76 references are outside their selected words**, decisively rejecting that direct 2D receiver. Ten conventional one-word-summary GP29 additive keys (first, last, length, index sum, product; ±) also fail.

## Original outcome, controls, and uncertainty

| Frozen original candidate | GP29 index of coincidence | First-rune meaning |
| --- | ---: | --- |
| Original p55 ciphertext | 0.0378947 | Undeciphered |
| p55 minus p8[perimeter-byte] | **0.0452632** | Nonlinguistic GP29 stream |
| p55 plus p8[perimeter-byte] | 0.0403509 | Nonlinguistic GP29 stream |
| p57 red13-selected ring start, p55 minus/plus | 0.0364912 / 0.0421053 | Both nonlinguistic |
| p8 red Roman XIX-selected ring start, p55 minus/plus | 0.0329825 / 0.0312281 | Both nonlinguistic |
| Minus branch followed by p56 prime-totient, no F bypass assumed | 0.0294737 | Nonlinguistic |
| Plus branch followed by p56 prime-totient, no F bypass assumed | 0.0333333 | Nonlinguistic |
| Minus branch followed by p56 prime-totient, **all ciphertext zeros bypassed** | 0.0477193 | Nonlinguistic, **unselected and historically incorrect surrogate** |
| Plus branch followed by same all-zero bypass | 0.0364912 | Nonlinguistic, unselected surrogate |
| Best of ten scroll-word summary keys | 0.0403509 | Nonlinguistic |

An original-corpus control evaluates **all 12,702 contiguous 255-rune windows** from the 12,956 unknown LP2 runes with the *same unmodified perimeter addresses, sign, and p55 ciphertext*. **95** windows score at least the selected p8 minus score (fraction 0.00748). P8 is independently selected by immediate adjacency and exact length, but modest IC enrichment and no prose cannot establish a historical key. The first CI run **45030634370** caught an important implementation flaw in the initial p56 control: skipping *every ciphertext F* is incorrect, because authentic p56 has ciphertext-F at positions **35,47,51,56,74**, and **only position56** is source-attested transparent plaintext-F. The corrected positive control selects only position56 and recovers all **85/85** original p56 plaintext runes. A planted 76-rune two-stage source-text cipher with explicitly known transparent positions19 and43 also round-trips in full. On unknown p55, neither the correct transparent positions nor an F-state selector is available; the no-F-bypass result and the *explicitly arbitrary* all-zero bypass are reported separately. None yields plaintext, and an all-zero rule must not be mistaken for the authentic cipher.

Reproduce with [single-file Node22 original-source SFT](../sims/lp2_scroll255_p8_p50rim_p55_bookcode_original_sft.cjs), or [original p3–p7 source-construction SFT](../sims/lp2_p3_p7_scroll255_p50_grid256_wordkey_sft.cjs).

**Consequence:** A completely deterministic original-source lookup is now available and tested. Its output supplies neither plaintext nor independently recoverable state. Do not promote the 0.045 IC as decryption, add fitted address offsets or algebraic layers, or reopen this route without a first-party instruction specifying the table-to-page8 lookup and receiver. All 56 unknown LP2 pages remain undeciphered.
