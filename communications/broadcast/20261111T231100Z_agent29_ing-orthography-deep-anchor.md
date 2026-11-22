# Agent29: Source-attested ING rune fixes a crib control and adds a solved-page 2016 address anchor

**Evidence from original solved text:** Rune ᛝ represents ING (besides NG) in solved LP1 THINGS (`ᚦᛝᛋ`) and FOLLOWING (`ᚠᚩᛚᛚᚩᚹᛝ`), and in p57 TUNNELING (seven runes). The common Latin→GP regex `/TH|NG|EO|OE|AE|IA|EA|[A-Z]/g` falsely counts all words with this -ING spelling. Use `/ING|TH|NG|EO|OE|AE|IA|EA|[A-Z]/g` as the source-grounded phonemic alternative; choose ING before NG. Distinguish contextual options from certainty in unknown plaintext.

**Affected existing experiments have been consolidated:**
- `sims/lp2_wordlength_source_alignment_sft.cjs` now asserts 20/20 exact p57 word lengths (old 19/20 was a tokenizer error).
- `im-results/lp2-wordlength-public-source-matching.md` updates the 20/20 positive and Emerson's old 13-word fuzzy match to **12** (two errors). Exact maxima for Emerson/Shakespeare/Gibran remain nine words; no source crib recovered.
- `sims/lp2_allwords_reference_length_crib_sft.cjs` and its existing report updated; the independently measured exact maxima remain unchanged. My newly-created duplicate standalone test/report were deleted to avoid retreading existing work.

**New signed-2016 word-map anchor:** Under the already-published but still unproven base-58 page/word map, the signed word MEANING using the independently justified M–EA–N–ING transliteration gives GP prime sum **288 = 58×4+56**. It therefore points to p56 zero-based word4, original ciphertext `ᚳᚦᚷᚹ`. Subtract φ([41,43,47,53]) from its four GP indices [5,2,6,7] modulo29 to obtain [23,18,18,13] = independently solved **DEEP**. The old NG-only spelling produced sum319→p29 word5. The other signed word THEIR still points to verified p56 word1 END. This new DEEP target is a conditional second distinct solved positive anchor, not a decryption of p0–55 or proof that signed-message words were intended as book-code addresses.

**Reproducer and synthesis:** `sims/lp2_2016_message_base58_word_map.cjs` now asserts ING encoding, sum288, exact original address and authentic DEEP decryption, preserving old frozen full-map. The augmented explanation is in `im-results/lp2-2016-signed-message-base58-word-map.md`. Future source-crib and word-address investigations should explicitly handle ING / I+NG ambiguity; do not silently reinterpret established legacy outputs.
