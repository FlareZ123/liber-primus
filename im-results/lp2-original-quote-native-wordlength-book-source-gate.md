# LP2 original quoted plaintext source test using the exact printed word boundaries

**Agent25, 15 November 2026.** A direct way of recovering unknown plaintext would be to identify the historical printed book from which one of LP2's long, explicitly quoted passages was copied. The original quotes preserve word divisions even though their runes are ciphered; a sufficiently long sequence of source-native word lengths can identify a verbatim source without knowing the cipher. This bounded test uses three independent period-relevant texts: the earlier **original Liber Primus LP1 rune text**, Ralph Waldo Emerson's *Essays, First Series* (including *Self-Reliance*), and Aleister Crowley's available *Liber AL vel Legis* excerpt. **No direct matching quotation was recovered.**

## Crucial correct physical source parsing

The [canonical LP2 transcription](../resources/liber-primus/lp2-transcription.txt) uses `/\n` for a **physical line wrap**. Printed words often run across those wraps. Treating `/` as a word separator would create false single-rune words and change the quotation length fingerprints. The exact source-native parser **removes each slash+newline before tokenizing hyphens and printed periods**, preserving `%` as a physical-page boundary. The seven independent [quote spans](../resources/liber-primus/lp2-quote-punctuation-spans.json) then contain the fixed, original-source word counts **5,5,2,14,13,35,14**, with exact rune sums **18,19,12,58,68,160,70**. In particular the longest quote p42→43 has **35 complete words**. Previous raw-line splitting had falsely indicated 41.

A historical plaintext-to-GP length mapping collapses `ING`, `TH`, `NG`, `EO`, `OE`, `AE`, `EA` and `IA` as source-native GP runes and counts all other English letters singly. Its reproducible **independent known-positive test** uses the original solved p57 *PARABLE* section: all **20 printed words**, including `TUNNELING`, `THE`, `WITHIN`, match the known complete English plaintext's GP rune lengths **20/20** without any fitted substitutions. This licenses a cheap exact source fingerprint test but does not guarantee that every authorial phonetic spelling will use the same graphemes.

## Frozen source and results

Inputs are the original [LP1 GP rune transcription](https://github.com/rtkd/iddqd/blob/f2267b0c2f1e1d2662806b90b9c3a2953b3a7023/liber-primus__transcription--master/liber-primus__transcription--master.txt) (the exact **2,797 GP runes, 698 printed words** preceding LP2's first authenticated 32-rune prefix), [Wulfic's Emerson Essays source](https://github.com/Wulfic/Cicada3301-Liber_Primus/blob/521cb08a689d2159cf54e3c569fd59588601f875/data/corpora/emerson_essays.txt) (95,422 Latin word tokens including the file's wrapper) and [the repository's abridged Liber AL source](https://github.com/Wulfic/Cicada3301-Liber_Primus/blob/521cb08a689d2159cf54e3c569fd59588601f875/data/corpora/liber_al_vel_legis.txt) (2,247 tokens; **not a claim about the entire book**). Score each entire equal-number-of-words contiguous candidate by sum of absolute discrepancies between printed GP word lengths and source text's projected GP lengths. No gaps, per-word replacements, punctuation shifts, or site-specific corrections are fitted. For original LP1, the printed source GP rune counts are taken **directly from the original ciphertext/plaintext runic artifact**, without English orthographic conversion.

| Original LP2 quotation [rune start,end) | GP word count | Original LP1 minimum | Emerson minimum | Liber AL excerpt minimum |
|---|---:|---:|---:|---:|
| p40 [9811,9869) | 14 | 14 | **8** | 11 |
| p42 [10211,10279) | 13 | 19 | **10** | 18 |
| p42→43 [10279,10439) | 35 | 53 | **46** | 52 |
| p53 [12522,12592) | 14 | 19 | **13** | 18 |

The longest source quote's true GP-length pattern is:

`4 2 4 6 6 8 8 3 5 5 9 2 2 4 3 3 2 8 4 7 4 4 3 2 5 3 3 6 3 9 2 4 4 8 5` (sum160).

No 13-or-more-word quote has an exact zero-discrepancy match to **any of these three source texts**. The shorter quotes (2/5/5 words) frequently collide by chance and do not select credible plaintext; a *five-word* exact pattern in a 95,000-word corpus is not a cryptographic breakthrough.

### Decision

**Retire the proposition that the four long LP2 quotations copy a verbatim, same-word-length span of the printed LP1 words or the tested Emerson text or the *surviving excerpt* of Liber AL under the demonstrated GP grapheme mapping.** Do not pretend this excludes other Gutenberg editions, omitted Crowley verses, original Cicada prose, altered/deliberately paraphrased quotes, or other cipher schemes that change printed word lengths.

The technique retains a **direct route to plaintext** if an independently sourced authentic literary quotation is identified: match its complete 13–35 source words to one of the exact original windows, then use that full plaintext as a frozen crib to discriminate a separate reversible cipher. Reproducible, Windows Node22/CommonJS read-only SFT: [`sims/lp2_quoted_source_wordlength_sft.cjs`](../sims/lp2_quoted_source_wordlength_sft.cjs), which fetches three pinned historical source text files (including original LP1 runes) and requires the 20/20 solved p57 positive. No original unknown LP2 plaintext or key was recovered by the present two-source test.
