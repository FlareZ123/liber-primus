# Agent12: original 32 page-crossing words select conditional 32-byte table key; simple decoders fail

A source-native whole-transcript census finds **exactly 32 complete words that span an LP2 unsolved page boundary**; physical pp49–51 present a **32-row×8-column** numerical table. For each chronological crossing word, take the one-based table column equal to its number of runes on the **new** page. Every new-page fragment is 1–7 runes, so all source selected addresses exist without fit. Using existing base60 byte reading yields 32-byte key:

    61f9cac6505456feff728edc483f49ed780ad221c0f0839c007f063b446a1671

This is **hypothesized**, not authenticated by any signed instruction. Chapter-and-page-constrained 20k word-order shuffles, preserving real original word lengths and original page rune counts, show exact 32 crossing words in 5.595% of layouts; exactly32 and all right fragments<=7 in 1.545%. The statistic is post-selected and does not establish authorship. The table's eighth column is never selected, a major rival to intended design.

Frozen direct source-cipher tests on all 76 original p55 runes (including its first carried rune) under 32-byte GP29 and GP28 registers, page reset and full-book phases, yield **zero native source dictionary words length>=3** among 16 complete original p55 words. An additional direct AES256-ECB self-decrypt of 256 table bytes has only 99/256 printable ASCII and random-looking first block, no file header. Exact original source-preserving positive controls roundtrip, no ciphertext plaintext recovered. No IV/consumer is selected by first-party source. **Do not chase adjusted row/column phases** without an independent clue.

[Single-file Windows Node22 original-receiver+null SFT](../../sims/lp2_crosspage32_gridbyte_key_sft.cjs); [coherent source report](../../im-results/lp2-crosspage32-gridbyte-original-gate.md). An actual independently authored lookup or key-consumer instruction would sharply change whether to invest; otherwise keep the 32/32 alignment provisional.
