# P55 body and the three 2014 magic squares: exact 75-symbol direct-key decision

**Agent24, 22 November 2026. Original-input conditional cipher negative; no authentic plaintext recovered.**

## Independently sourced human route

The historical Cicada 2014 numerical squares are printed in order **5×5, 7×7, 5×5** ([source](../resources/cicada2014-openpuff-magic-squares.txt)). The final 5×5 square has an independently recovered byte-for-byte embedding in original LP1 p05's near-palindromic JPEG ([source proof](lp1-page05-reversed-prefix-anomaly.md)). Clear p57 explicitly says to **SHED OUR OWN CIRCUMFERENCES**. Remove precisely the outer 24-cell rim from the historical middle 7×7, leaving three complete 5×5 squares, or **75 source numbers**. Original p55 has 76 GP ciphertext runes, but its first rune genuinely continues the final p54 word. Its **75 complete-word body** therefore provides an independently visible length-exact receiver.

This 75-match and the original instruction motivate the input. They do **not** authenticate the interpretation that the squares must be a direct GP29 key. The strongest rival is that the instruction relates to a different source or that the numbers require a different operation.

The original printed p55 body contains 16 complete words with rune lengths **[4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3]**. The original [transcription](../resources/lp2-transcription.txt) wraps the 13-rune word after rune1 and a later 6-rune word after rune4. The program joins these two original presentation wraps before validating exact word lengths and all 76 runes against the canonical original [LP2 corpus](../resources/liber-primus/lp2-corpus.json). No ciphertext rune, punctuation break, or word-length partition is reinterpreted or modified.

## Bounded original cipher experiment

Read the three 5×5 matrices in their historical order. Apply the printed cell value modulo29 or its Euler totient modulo29 (totients are explicitly named in solved LP1 and used in the known p56 cipher). Evaluate both normal and reversed source-key direction and both original GP29 additive signs. The original p55 body contains exactly three **ciphertext F** locations at body offsets **[14,24,40]**. Enumerate every one of their **eight** possible authentic-p56-style F-interrupter masks. Designated F emits literal plaintext F while consuming no key; all other symbols consume one key. A non-F ciphertext decoding to plaintext F while consuming the key is incompatible with the tested transparent-F model. Re-encrypt each compatible candidate and require all **75 original symbols** to match.

This yields **2 scalar readings × 2 directions × 2 signs × 8 masks = 64**, with no fitted clock offset, key values, phrase guess or arbitrary unknown layer.

| Exact source-key case | Compatible F masks | Best compatible GP IoC | Matched attested 13-rune English word |
| --- | ---: | ---: | ---: |
| Printed values mod29, historical order, decrypt by C+K | **4:** 0, 3, 5, 6 | **0.035315** | 0 |
| The other seven fixed key/sign/order families | **0 of 56 candidates** | None | 0 |

The four mathematically viable candidates have 13-rune words transliterated as **ICEACAHRTPPMCG**, **CNGFLNISDTMNGAEI**, **CNGGPURMHAHYEY**, and **ICFPURMHAHYEY**; GP IoCs **0.035315**, **0.031351**, **0.032793**, and **0.034234**, respectively. None matches any of **426 source-native GP13 word encodings** drawn exclusively from the pinned TextBlob, Gibran, Shakespeare, Emerson, Blake and solved LP1 reference sources. They show no coherent English plaintext.

The four surviving F masks in one of eight key families are a *conditional alphabet-domain observation*, not recovered cipher truth. The lexical receiver assumes p55's 13-rune word is ordinary English and covered by the available corpus. An unknown proper name, alien spelling, or encoded nonprose would fall outside that assumption; arbitrary source reorderings, nonlinear operations and secret extra layers also remain untested.

## Positive control and decision

Take the **authentically decrypted first 75 runes of p56**, independently rederived with its prime-totient method and actual F-transparent exception at local56. For each of all eight scalar-reading/direction/sign families, encrypt the real 75-rune solved plaintext using its own F-bypass rule, enumerate the resulting ciphertext-F mask possibilities, and recover the **exact same 75/75 source-native GP plaintext** with full inverse encryption. All eight planted source-English positives pass.

[Complete, original-data read-only CommonJS SFT](../sims/lp2_p55_original_three_2014_squares_75_directkey_sft.cjs), [Windows Node22 CI PASS 44981850177](https://github.com/FlareZ123/liber-primus/actions/runs/44981850177). The initial CI failure was limited to incorrectly treating an original line wrap as a word break. The final version joins the original presentation wraps without changing any runes.

**Decision:** The historical three-square circumference operation supplies a plausible **75-key material candidate**, but the direct GP29 additive/totient and source-key-direction family yields **no recovered unknown p55 plaintext**. Do not tune arbitrary offsets or an additional unmotivated layer to rescue these outputs. Require a new first-party decoding-operation instruction to reopen this specific register.