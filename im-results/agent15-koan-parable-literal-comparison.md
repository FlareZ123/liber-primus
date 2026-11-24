# Participant KOAN versus clear LP2 PARABLE (#2559)

## Correct source roles

The five-line KOAN is participant-server output, repeated four times in the anonymous March 2013 log at 05:59:08.832, 05:59:14.821, 05:59:20.877, and 05:59:28.822. The signed 26 January 2013 TCP specification requires a **participant-selected** koan; see [source roles](../resources/external/2013-tcp-server-signed-source.md). The March PGP signature authenticates NEXT only. Repetition demonstrates a deterministic participant implementation, not four Cicada-authored clues.

The issue's date is incorrect: **761.mp3 is the 2013 Cicada OS audio**, not a 2012 artifact. The known p57 relationship is numeric, not an independently preserved second 19-word text in the MP3. Its ID3 title is THE INSTAR EMERGENCE and user label Parable 1,595,277,641. The original clear p57 body has 19 words, 88 runes, three clauses. Its GP-prime sums 1259,1031,1229 multiply to 1,595,277,641; the title sums to 761. This strong, independently established cross-round source relation was reproduced, not discovered here. [Established 2013 source result](../results/2013-761-parable-prime-products.md). The actual 2012 MIDI payload was a different assignment, a participant-specific wordlist and Blake text; its direct continuation was rejected in [#140](2012-midi-49word-parable-continuation-gate.md).

## Exact frozen comparison

Extract from the [raw log](../resources/historical/cicada2013-clientlog-1362290293-9.txt), between received KOAN and transmitted dot terminator, dropping 01 OK. All four five-line payloads equal byte-for-byte:

    A student once asked his master,
    "What is the nature of the primes?"
    The master sat thoughtful for a moment,
    then fell asleep.
    And the student was enlightened.

Line word counts 6/7/7/3/5, total 28; normalized GP rune counts 26/24/30/13/26, total119. Clear p57 GP source is PARABLE heading plus 7/6/6-word clauses with 30/30/28 runes. Remove heading for comparison. Exact p57 rune indices checked against canonical corpus. Preserve raw native spellings; for Latin comparisons uppercase alphabetic tokens and use frozen GP aliases QU→CW, V→U, K/Q→C, Z→S, ING→NG, IO→IA, greedily consume longest GP token. Native source words are used directly; no arbitrary letter or word permutations. Compare unique exact word and adjacent word pairs, longest contiguous word/rune substring, and pairs after fixed common function-word removal.

Negative genre controls: three entire unrelated stories from the [27 January 2011 single-revision Zen collection](https://gist.github.com/dustin/798227), pinned raw version c2463a6042ba5ed1cc2116080e9684916ae0bb6b: A Cup of Tea, Muddy Road, Happy Chinaman. The web-view story text was used in execution; reproducer reads the pinned raw source. LP1's two actual koans and wisdom page are within-Cicada comparators, not independent authorship controls.

| Comparator | Words | Shared word pairs | Longest contiguous words | Longest GP runes | Shared content-word pairs |
|---|---:|---:|---:|---:|---:|
| LP2 p57 body | 19 | 0 | 1 | 4 | 0 |
| 2013 ID3 title | 3 | 0 | 1 | 3 | 0 |
| LP1 KOAN1 | 208 | 5 | 3 | 10 | 1 |
| LP1 KOAN2 | 88 | 6 | 2 | 12 | 0 |
| LP1 Wisdom | 31 | 1 | 2 | 8 | 0 |
| A Cup of Tea | 82 | 0 | 1 | 7 | 0 |
| Muddy Road | 112 | 0 | 1 | 5 | 0 |
| Happy Chinaman | 166 | 3 | 3 | 10 | 0 |

p57 shares only THE and AND, no exact adjacent phrase or content pair; its longest GP substring is NDTHE at offsets94/62 (zero-based, KOAN/p57 body). ID3 title shares THE only. LP1 KOAN1's longest is FOR A MOMENT (offsets17/65 in word sequence); its only content pair is ASCED MASTER after removing function words. KOAN2 shares common student/master words and enlightenment, but no distinctive content pair. The unrelated Hotei control also matches a three-word interrogative phrase. LP1 Wisdom shares THE PRIMES, an obvious theme already in first-party LP1; it gives no new target or inverse.

## Decision

The historical participant response and LP2 p57 have no distinctive literal relationship under this bounded comparison. Generic teacher/student/enlightenment and prime themes also occur in controls. The genuine MP3/p57 prime-product relationship is separate, remains valid, and supplies only an existing plaintext-verification property. No source-selected new operation, key, address or prediction follows from the repeated KOAN. Retire this source route without testing arbitrary running keys or further quotation searches.

[CommonJS reproducer](../sims/agent15_koan_parable_literal_comparison_sft.cjs). Metrics executed on original repository files and the cited web-view controls in connected JavaScript; the standalone pinned-URL fetch was not separately run.
