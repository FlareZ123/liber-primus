# Historical Cicada PGP message word shapes versus the entire unknown LP2 transcript

**Decision (13 November 2026):** No contiguous 12-word source passage is preserved, at the level of printed GP29 word lengths, anywhere in the complete **12,956-rune / 2,896-word** still-unreadable LP2 text when compared with **20 original-blob-pinned PGP-armored historical-message snapshots**. The longest coincidence is six consecutive words. The search yields no genuine crib, plaintext, decryption key, or destination.

## Causal hypothesis and source contract

Solved LP2 p57 PARABLE is quoted verbatim in the 2013 `AUDIO/761.MP3` metadata. This established reuse motivates testing whether an independently available 2012–2014 Cicada-signed message was similarly copied into unknown LP2 pages and then encrypted, leaving plaintext word divisions intact. P56's solved cipher independently preserves its 25 plaintext word lengths. The exact source snapshots here are the original-looking armoured files in [krisyotam/cicada3301, pgp/messages](https://github.com/krisyotam/cicada3301/tree/main/pgp/messages), with Git blob SHA-1 identities pinned in the reproducer. This test does not independently adjudicate each historical PGP signature. The later 2015 and 2017 messages are out-of-era **negative controls**, not candidate sources for 2014 authorship.

The entire canonical 2014 unknown rune transcription is parsed as **one continuous printed-word stream**, joining line and physical page wraps while retaining true hyphen and punctuation separators. This yields exactly **2,896 original word lengths totaling 12,956 symbols**. The numeric-only LP2 physical p50 has no rune positions. Each extracted source text is separated into contiguous Latin-letter words and converted to GP symbol length under the same published GP multigraph convention `ING|TH|NG|EO|OE|AE|IA|EA` used in earlier quotation screening. The scan requires *exact contiguous word-length equality*, without insertions, deletions, reordering, spelling edits or fitted positions. It is deliberately permissive about mismatched punctuation.

### Results

| Historical message group | Raw source snapshots | Maximum exact contiguous original GP word lengths |
|---|---:|---:|
| 2012 signed text (book-code poem, end messages, key announcements, second chance and coordinate attachment) | 7 | **6** |
| 2013 (opening book code, CICADA OS and hello/rune records, including duplicated OS record) | 5 | **5** |
| 2014 (onion welcome, final/release texts, opening book code and signed hash record) | 5 | **5** |
| 2015 and 2017 later controls | 3 | **5** |
| **All 20 originals** | **20** | **6**, no match ≥12 |

The original 2012 poem's best six-shape snippet corresponds to “point We want the best not”; the original 2012 signed key announcement's best six-shape snippet reads “sign all messages with this key.” Both are short and occur by ordinary combinatorial chance in a book of nearly 3,000 unknown words. The 2014 signed hash block contains many hex words that are not ordinary linguistic plaintext, and its longest coincidence is only five.

The original 2014 first-release LP1 book is separately encoded as a much larger PGP armoured source file, `2014-01-onion5-liber-primus.asc`, and is **excluded from this 20-file set** to avoid confusing the already-known LP1 cipher with a signed natural-language instruction. An independent comparison against the provided solved LP1 plaintext reference pp1,3–16 and LP2 final solved pp56–57 finds no unknown-page identical word-shape run longer than seven words; that smaller check was exploratory and is not asserted by this reproducer.

## Reproducibility and bounded conclusion

[Standalone Node.js 22 CommonJS test](../sims/lp2_pgp_signed_message_wordshape_sft.cjs) pins the exact Git blob SHA-1 of each of the 20 archived message files, reads the repository's canonical `lp2-transcription.txt`, asserts **12,956 rune positions and 2,896 words**, and checks the frozen maximum matching run for every input. For every source containing at least 20 natural-language tokens, a 20-word planted word-length pattern must be rediscovered exactly; this demonstrates sensitivity to an actual verbatim source quotation.

The original-input source comparison was executed directly against the GitHub repository's current raw-file snapshots. A proposed original quote encrypted with **unchanged GP word boundaries** would preserve a long contiguous word-length pattern. None of these 20 archived message bodies supplies one. This does **not** exclude paraphrase, changed word segmentation, encrypted/copied prose from unpublished material, the audio ID3 corpus itself, or entirely different sources. Do not derive a secret key from the six-word coincidences. The next useful candidate source needs an independently supported reason to appear in the manuscript.
