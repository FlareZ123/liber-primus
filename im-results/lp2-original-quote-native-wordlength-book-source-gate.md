# LP2 original quoted plaintext source gate

**Current conclusion, 15 November 2026.** Four long, visibly quoted LP2 spans have retained printed word boundaries but unknown runes. No verbatim contiguous window with the same native GP29 word lengths was found in the historical Cicada literary source copies tested here. This is a bounded negative. No genuine unknown-page plaintext or creator key was recovered.

## Exact original input and comparator

The canonical [LP2 rune transcription](../resources/liber-primus/lp2-transcription.txt) uses \`/\n\` as a visual line wrap and \`%\` as a physical page marker. Neither must end a word. Only \`-\`, \`.\`, \`$\`, \`&\` and \`§\` terminate words. The seven image-annotated [quotation spans](../resources/liber-primus/lp2-quote-punctuation-spans.json) have **4,5,2,14,13,34,14** words and **18,19,12,58,68,160,70** original runes. The longest p42→43 quote is 34 whole words, including a carried word across the physical page break. Source orthography treats the graphemes ING, TH, NG, EO, OE, AE, EA, IA as single GP runes. The longest quote's fixed target sequence is

\`4 2 4 6 6 8 8 3 5 5 9 2 2 4 3 3 2 8 4 7 4 4 3 2 5 3 3 6 3 11 4 4 8 5\`.

An independently known complete original-p57 English passage beginning \`PARABLE LIKE THE INSTAR TUNNELING\` matches all 20/20 GP-projected word lengths. This is a positive for this precise original English spelling, not a universal runic spelling theorem.

The test compares each complete quoted word-length sequence against every uninterrupted equal-number-of-words window in each source, with an absolute-difference sum and **zero as the only exact-match criterion**. It does not insert or delete words, edit plaintext, fit a substitution alphabet, or choose a different target window after seeing a source result.

## Results

The previously committed source screen compared the [original LP1 rune book](https://github.com/rtkd/iddqd/blob/f2267b0c2f1e1d2662806b90b9c3a2953b3a7023/liber-primus__transcription--master/liber-primus__transcription--master.txt) (2,797 GP runes/694 whole words before the LP2 prefix), [Emerson's Essays First Series](https://github.com/Wulfic/Cicada3301-Liber_Primus/blob/521cb08a689d2159cf54e3c569fd59588601f875/data/corpora/emerson_essays.txt) (95,422 tokens) and an [incomplete archived Crowley Liber AL excerpt](https://github.com/Wulfic/Cicada3301-Liber_Primus/blob/521cb08a689d2159cf54e3c569fd59588601f875/data/corpora/liber_al_vel_legis.txt) (2,247 tokens). Their minima for [p40, p42, p42→43, p53] were respectively **[14,19,58,19]**, **[8,10,44,13]**, **[11,18,53,18]**. None matched exactly.

The same frozen four windows were then compared with original round-selected literary works already preserved in [resources/external](../resources/external/). The table reports the minimum error for each window, in order:

| Archived source | p40 (14 words) | p42 (13) | p42→43 (34) | p53 (14) |
| --- | ---: | ---: | ---: | ---: |
| Crowley, *Book of the Law* I, II, III, minimum across three chapters | 8 | 16 | 50 | 12 |
| Blake, *The Marriage of Heaven and Hell* (1906 source) | 11 | 15 | 50 | 14 |
| *Mabinogion* 2012 selected corpus (105,582 derived GP words) | 8 | 11 | 42 | 12 |
| KJV Passion/Gospels excerpt | 9 | 14 | 45 | 14 |
| Tennyson, *Lady of Shalott*, 1832/1842 edition minimum | 12 | 17 | 51 | 16 |
| *Sefer Yetzirah*, Westcott archive | 10 | 15 | 51 | 15 |

All distances are positive. The Crowley text files provide more complete previous-round material than the earlier excerpt. The Mabinogion row uses a previously pinned derived GP-length array; the other rows project archived source text. Editorial wrappers, different editions, apostrophes, author-specific spellings and paraphrase are outside the strict exact-match hypothesis.

## Reusable procedure and next decision

The [corrected Node22 CommonJS SFT](../sims/lp2_quoted_source_wordlength_sft.cjs) preserves the original 20-word positive and three pinned external-source tests. It now tests all the additional local source texts without network access, while the original three pinned external fetches remain network-dependent. A malformed parser condition in the earlier SFT was corrected to use exactly \`-.$&§\`, restoring its ability to run.

A direct plaintext-recovery continuation requires **independent historical identification of a new candidate quote/source**. The scorer can then test its entire fixed original word-length pattern and pass any exact matching candidate as a frozen crib to a reversible original-cipher attack. Unconstrained broad text crawling or relaxed similarity searches are not supported by the present evidence.
