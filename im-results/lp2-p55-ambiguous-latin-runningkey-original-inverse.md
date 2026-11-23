# Authenticated Latin-source running keys with ambiguous GP29 spelling: exact p55 inverse

**Agent20, 23 November 2026. Original-input bounded negative; no recovered LP2 plaintext.** Executable full word-wise inverse: [\`sims/lp2_p55_latin_source_ambiguity_word_inverse.cjs\`](../sims/lp2_p55_latin_source_ambiguity_word_inverse.cjs). This attacks actual original p55 ciphertext rather than remeasuring entropy, and expands the direct historical-running-key test in a specific way: the underlying *Latin-language source has no author-imposed GP29 digraph boundaries*, so a single greedy transliteration can discard the correct key.

## Author-visible source route and ciphertext receiver

The **2013 original \`761.MP3\` ID3v2.3 TXXX Parable** value already says the complete eventual solved p57 inscription. It is independently a primary pre-2014 Latin-language text linked by the solved terminal p57; using that passage as a running pad for the immediately adjacent unknown **p55** is therefore a testable historical key idea. A separate 2016 *signature-authenticated* OutGuess message says \`Liber Primus is the way\` and names \`epiphany\`, \`devoted\`, and the numbers/words mapping; it is an explicit book-related Latin text, although postdating LP2. The signed source is retained separately as a weaker retrospective control.

Freeze the complete, unmodified original physical **p55 ciphertext: 76 GP29 runes in 17 source-printed words**, exact punctuation/line-wrap parsing from \`resources/liber-primus/lp2-transcription.txt\` matched to \`lp2-corpus.json\`. Do not alter these word lengths or insert inferred plaintext spaces. The hypothesis requires one uninterrupted additive GP29 running key drawn from the historical Latin text, consuming one GP rune per input rune. Both signs are tested. A literal ciphertext F may alternatively be transparent and consume no key, as observed in earlier authentically solved parts.

Instead of one longest-rune tokenization, a dynamic program considers **every** valid GP29 spelling of each Latin source substring (including one \`TH\` or \`T,H\`, one \`EA\` or \`E,A\`), keeping the original printed Latin letter order exactly. GP orthography is \`QU→CW, V→U, K/Q→C, Z→S, ING→NG, IO→IA\`. The canonical \(29\)-rune values are unchanged. The text's natural initial position is fixed at zero. An explicitly *non-source-selected* control also permits every source-letter offset that can cover a complete 76-rune original page. At each p55 printed word boundary the finite state retains, for each reachable source-letter cursor, the best decoded word sequence according to whole-word exact membership in the pinned 29,060-vector TextBlob/Norvig GP29 lexicon and a frequency tie-break. There is no fitted rune substitution, guessed plaintext key, invented word boundary, word reordering, arbitrary phase reset or extra cipher layer.

## Actual independent original-cipher outcome

| Source and admissible start | Original highest number of native GP words | Full-page quality |
| --- | ---: | --- |
| Pre-LP2 2013 ID3 PARABLE value, natural source start zero, four fixed sign/F conventions | **3 / 17** | no continuous source-native prose |
| 2013 source, all Latin-letter start positions, all four conventions | **5 / 17** | no continuous source-native prose; start 13 with sign−/F-skip reaches 5 |
| Signed 2016 OutGuess body, natural source start zero, four fixed conventions | **5 / 17** | no continuous source-native prose |
| Signed 2016 body, all Latin-letter start positions, all four conventions | **7 / 17** | no continuous source-native prose; unselected start 65 reaches 7 |

The unrestricted controls are *not* positive hints: choosing a source offset after seeing English-word hits is already overfitting, and the highest-scoring output is overwhelmingly nonsensical. The standalone runner prints the complete GP outputs, exact cursor intervals, literal source strings and variant outcomes, and requires these upper bounds to match its original reads.

For a **full positive decoder plant**, use independently authentic GP29 lexicon words selected at every one of the 17 original word lengths, encrypt their 76 source runes with the greedy GP spelling of the signed 2016 key at Latin position zero, then invert using the *complete ambiguous-spelling DP* without exposing the greedy cut. All **17/17 planted words** are recognized under the correct source key; the plant is a demonstration of decoder sensitivity, not LP2 plaintext or an authentic key.

## Decision and scope

**Retire the literal 2013 PARABLE or signed-2016 Latin running-text stream as a complete directly additive GP29 p55 key** under the two historical signs and two F clocks. The standard single greedy rune spelling was not the reason previous direct consumers failed: every alternate legal GP29 spelling has now been admitted with a source-cursor DP, and the original still fails even when the key's Latin starting offset is free. Do not expand this negative into arbitrary word-level keys, changed spaces, secret nonlinear encoders or a late key conspiracy. A plausible successor would need a *new original-source instruction specifying a key-mixing operation or an independently predicted p55 plaintext*, not more tokenization freedoms.

Sources: original 2013 ID3 frame inventory \`im-results/audio761-original-id3-frame-inventory.md\`; signature-valid 2016 text \`resources/historical/cicada2016-4gq25-outguess.asc\`; original 58-image LP2 corpus \`resources/liber-primus/lp2-corpus.json\` and printed transcription; research control vocabulary \`resources/control/english_wordfreq_textblob.txt\`.
