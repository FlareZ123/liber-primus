# Key-independent original LP2 plaintext-source crib search by printed word length

**12 November 2026, Agent6; independent exploratory investigation.** This search targets authentic plaintext recovery when the unknown cipher preserves printed word boundaries and the **GP29 symbol length of each word**, as the known solved text does under its fixed transliteration. A source book containing a long consecutive exact run of word lengths could yield identifiable plaintext without first finding any cipher key. No such source passage was recovered in three pre-existing public-domain control texts.

## Exact original-input scope

The canonically normalized `resources/lp2-transcription.txt` prints 12,956 GP29 runes over 2,896 words on unknown physical pages p0–p55. The original separator `-` and punctuation end a word; line `/`, page `%` and whitespace preserve a continued word. The parser asserts that its concatenated rune sequence equals all 12,956 canonical original indices from `resources/liber-primus/lp2-corpus.json`, so no alternate word segmentation was silently introduced.

Against each of three already-committed public-domain English source texts, the SFT searches **every** consecutive six-word-length anchor in the 2,896-word original stream and extends each exact match to its maximum length. It uses two pre-frozen registers:

1. **GP29 orthographic length:** uppercase source words mapped through the published GP29 transliteration; the source-native QU→CW, V→U, K→C, Z→S and ING→NG normalization produces the same greedy GP units as the solved-page orthography baseline. It is conditional on these editorial spellings.
2. **Raw Latin-letter length:** each source word has its normal number of A–Z letters, a control for plaintext that would preserve letter rather than GP-rune word length.

No key, phase, cipher decoder or language model is fitted to the original ciphertext. The source files and parser are already committed to the repository. The SFT outputs matched source passages and exact original word offsets for each strongest candidate.

| Source already in repository | English source words | Maximum continuous original word-length match, GP29 | Maximum, raw Latin |
| --- | ---: | ---: | ---: |
| `resources/control/shakespeare_first300k.txt` | 55,407 | **9** | **9** |
| `resources/control/gibran_prophet_58585.txt` | 15,733 | **9** | **9** |
| `resources/control/emerson_essays_2944.txt` | 77,932 | **9** | **10** |

The longest 10-word raw-Latin match is an Emerson passage (`THOUGHTS AND LAWS IN HIS OWN BREAST HE STUDIES THE`) aligned at original word index 910. It is length-only: the GP29 candidate under this exact source is shorter, and no independently recovered runic plaintext supports the supposed phrase. Many different, mutually inconsistent source passages match eight or nine word lengths, demonstrating that the short patterns are ambiguous. **Do not infer a plaintext quote or authenticate a book from a length coincidence.**

## Positive recovery control and decision

The SFT plants **32 consecutive, original-source GP29 word lengths** from Shakespeare at source word offset 1,000 into a *copy* of original length positions 500–531. The same fixed matcher must recover all 32 or more at the correct source/original offsets, without knowing the ciphertext letters. This is an exact positive software control, not proof that the authentic puzzle uses copied source prose.

The three texts cover **149,072 English source words** across two registers. None has a **continuous exact 11-word** alignment with the original. This is a complete bounded result for those exact source bytes and registers only. It cannot exclude a paraphrase, another book, changed word boundaries, different orthography, code groups rather than words, or an encipherment that changes word lengths.

**Next decision:** The method is reusable if an original Cicada page or signed text names a particular outside book, author, chapter or exact passage as candidate plaintext. Run that *selected source* once under the frozen two registers and inspect any unusually long matches for prospective held-out word/rune predictions. Without a source-selected book, additional blind generic corpus expansion does not resolve the key problem. This task recovered no original unknown plaintext/key.

**Reproducer:** [`sims/lp2_original_wordlength_source_crib_sft.cjs`](../sims/lp2_original_wordlength_source_crib_sft.cjs). The script uses only Node.js standard libraries, validates every original rune, enumerates all exact anchors, reports the two frozen registers, asserts the source-specific maxima, and demands the 32-word planted-source recovery.
