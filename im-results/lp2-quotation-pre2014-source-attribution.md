# Seven original LP2 quotation spans: a finite, source-motivated attribution gate

**Agent 16, 12 November 2026. Director Issue [#417](https://github.com/FlareZ123/liber-primus/issues/417). Result: no independently attributable long quotation, unknown plaintext, key, or cipher-state equation.** This is an original-ciphertext negative for three historically available **specific source editions**, not a claim that LP2 contains no external quotations. Other manuscripts, translations and altered word breaks remain viable.

## Why these sources, before trying a key

The seven original marked passages total **405 printed GP runes**, and there are **14 visible quotation marks**. The source marks appear in the originally distributed LP2 JPEGs. The present scan covers exactly three additional author/text families with reasons a 2014 human solver might have chosen them before looking at decrypted text:

1. **Zhuangzi, *Chuang Tzŭ: Mystic, Moralist, and Social Reformer*, Herbert A. Giles translation (1889).** LP2 physical p53 has an insect emblem; the already decrypted p57 uses `INSTAR` and shedding to describe emergence. In Giles's chapter II a mention of **cicada wings** directly neighbors the famous butterfly-dream and metamorphosis passage. The text and the illustrated subject together select the work without inspecting quote-runic lengths. The checked digitization is pinned to Git blob `b8683719e62b919e29821be2b90025dde5ac8406`, [complete pinned source excerpt](https://github.com/yochail/taiku/blob/f13b69879da1dcbe3087166517c64c5e803da9f6/sites/taiku/sources/zhuangzi/chuang_tzu.txt). The repository's own source declaration identifies the 1889 Giles translation and [Project Gutenberg ebook 59709](https://www.gutenberg.org/ebooks/59709).
2. **Lewis Carroll, *Alice's Adventures in Wonderland* (1865), especially chapter V, “Advice from a Caterpillar.”** The source explicitly discusses a caterpillar becoming a chrysalis and a butterfly; the LP2 image and solved p57 insect metaphor make this a specific, finite thematic candidate. The checked full transcription, pinned Git blob `286921e38dfe9f754e35aec78270f1251086283b), is [this preserved edition](https://github.com/brandonprry/wicked_cool_shell_scripts_2e/blob/1f22d91a7b6b0ec986225817716586301f3ad680/alice.txt), corresponding to [Project Gutenberg ebook 11](https://www.gutenberg.org/ebooks/11).
3. **John Bunyan, *The Pilgrim's Progress* (1678).** The solved manuscript independently addresses the participant as a `PILGRIM`, and original LP2 p22 shows death/weapon imagery compatible with allegorical pilgrimage. A specific full public-domain digitization, transcribed from a 1942 edition, is pinned as Git blob `91c5f7817aa653c3e7066f3088b56ffb08de2da1`, [original file](https://github.com/benawad/Word-Counter/blob/30924d17500b574f40766e14b727a40ee7500078/bunyan-pilgrims-304.txt).

These are *source-selection hypotheses*, not an attribution of the engraved insect, original rune text or Cicada's authorship. The candidate set was chosen on recognizable source motifs and earlier authenticated `PILGRIM` text. Earlier blanket searches of Shakespeare, Emerson, Gibran, Cicada's 2013-selected *Book of the Law*, Blake, Latin/Old English texts and the King James Bible already have separate repository reports. We did not restart them or the previously negative quotation-period scan.

## Original seven spans, unaltered words and byte-checkable identities

A contiguous GP-rune span is counted in global **unsolved** rune offsets, zero-based and half-open. Newline/printed slash and physical page carry are joined; only actual printed word punctuation terminates a word. The source-transcribed 55 runic LP2 pages contain **2,896 complete words and 12,956 runes**. The standalone SFT checks all seven against the original GP-index corpus and hashes **concatenated original UTF-8 runes without spaces**.

| Quote | Physical LP2 page(s) (original combined JPEG) | Global original interval | Runes / words | SHA-256 of exact rune sequence |
|---:|---|---|---:|---|
| 0 | 6–7 (23,24.jpg) | [1659,1677) | 18 / 4 | `63fc17007006c722d4499193d3a99e7e21e8a917390b84b650e49effcb1d5897` |
| 1 | 22 (39.jpg) | [5459,5478) | 19 / 5 | `4f6afe50dd170c5f13fd7ac120084a6660396bead790e11bbf36a2919e58dcd0` |
| 2 | 40 (57.jpg) | [9715,9727) | 12 / 2 | `5c4a5c8b3d46f45ef5d6defcd70913c30036ed6e5240e67850ae9c922a3b57b4` |
| 3 | 40 (57.jpg) | [9811,9869) | 58 / 14 | `bdde0efb32e5411684c5b6ab9344fc16376485e7e1d0defdf4adb30e06250148` |
| 4 | 42 (59.jpg) | [10211,10279) | 68 / 13 | `5396834f1468f0efde79621ad13fcb02a8f5f31909552ed9db904e96c8b8ba88` |
| 5 | 42–43 (59,60.jpg) | [10279,10439) | 160 / 34 | `910ed2b11ffad802b8d269297296731a486a98c1fc17a232fa03bcf92d9c2a7e` |
| 6 | 53 (70.jpg) | [12522,12592) | 70 / 14 | `9601a31e0197eb30af7e03bc41c57ed18f964b9c3cb3ce010eb1f439ebf57e6c` |

The original images independently show the quoted sections on those pages. Individual quote-mark offset transcription is inherited from the separately image-audited [canonical quotation annotations](../resources/liber-primus/lp2-quote-punctuation-spans.json), and SFT confirms their start/end positions land on complete printed words. In particular quotes 4 and 5 touch exactly at offset 10279 and quote 5 crosses a page break. Treating a slash or page break as a word delimiter would corrupt those identities.

## Frozen comparison and what it excludes

Before scoring, translate each potential source word into its **GP-rune length** with longest-match multigraphs `ING, TH, NG, EO, OE, AE, IA, EA`, or leave every Latin letter uncontracted as an alternate control. `ING` as a single GP rune is attested in solved LP1 and solved p57. Source word order and punctuation stay fixed; search **every original source word start**, allowing no deleted/added words, no shuffled quotations, no fitted offsets and no key guesses. The comparison uses all text in the three pinned files, including headers, rather than selecting favorable chapters after inspecting scores. The compact [machine-readable exact source word-length fingerprints](quote-pre2014-source-length-fingerprints.json) preserve all 102,565 corpus word lengths separately in both conventions alongside Git blob IDs, so the entire test runs **offline**.

**Full exact matches per original quoted span, corrected GP/ING-aware encoding:**

| Source edition / words | Quote 0, 4 words | Quote 1, 5 words | Quote 2, 2 words | Quote 3, 14 | Quote 4, 13 | Quote 5, 34 | Quote 6, 14 |
|---|---:|---:|---:|---:|---:|---:|---:|
| Giles Zhuangzi / 17,251 | 4 | 1 | 106 | **0** | **0** | **0** | **0** |
| Carroll Alice / 28,403 | 12 | 9 | 99 | **0** | **0** | **0** | **0** |
| Bunyan Pilgrim / 56,911 | 15 | 9 | 287 | **0** | **0** | **0** | **0** |

For all **four long quotations (13,14,34,14 words)**, **all 3 × 2 source/orthographic settings** have zero complete uninterrupted matches. The strongest partial consecutive GP matches for these four quotes are respectively **[6,6,6,6]** source words in Giles, **[6,6,7,6]** in Carroll, and **[8,5,7,5]** in Bunyan. Even the no-contraction alternative provides no complete long attribution. A search of dozens of thousands of windows makes five-to-eight adjacent length equalities weak evidence without accompanying actual ciphertext decoding.

For the three **short** quotations, a complete 2-, 4- or 5-word shape matches repeatedly, sometimes in unrelated passages. Giles has one exact 5-word length-window, but its mere numerical shape does not identify the printed runes as that phrase; competing books and editions supply further alternatives. Do not promote a length-only short match to plaintext or derive a candidate key from its letters.

## Preserved 2012–May-2014 Cicada signed-message crib control (12 November 2026)

A separate, historically tighter source hypothesis is now tested without revisiting the three literary editions above. Solved LP2 p57 recycles the contemporaneous 2013 761.MP3 emergence wording, establishing that Cicada could reuse earlier challenge text. Accordingly, an unknown LP2 quoted passage might reuse the **original author's own signed messages**. The repository preserves eight clear-signed message witnesses between 2012 and the May 2014 LP2 release: 2012 countdown and MIDI email (including its Blake chorus), 2013 Onion greeting, forest-clue sentence, sky/knock hint and ICMP continuation, the 2014 Stage11 message and May release message. These are fixed, prior-era sources rather than a tuned keyword collection.

The new [source-word-shape SFT](../sims/lp2_signed_messages_wordshape_crib_sft.cjs) strips the armored PGP signature, keeps *only* the original signed body and derives its complete original-order word-length sequence using source-attested GP spellings and the longest-match `ING` contraction. It compares **every complete consecutive source phrase** against the fixed full original **2,896-word, 12,956-rune LP2 transcript**, allowing only identical lengths of uninterrupted printed words; page and printed-line wraps do not break words. No runic candidate letters, English scorer, offset-selected book code or cipher key influence the matches.

The eight messages respectively have maximum exact consecutive length matches of **5,5,6,5,4,5,5,5 words**, in the fixed source order given above. Therefore **none supplies a contiguous seven-word or longer verbatim word-length crib anywhere in the unsolved corpus**. A source-native positive control plants the entire signed-message word-length tape at a fixed original-word position and recovers it for each of the eight sources. This excludes only unaltered GP-word-shape quotation, *not* extracted substrings shorter than seven words, restated/edited passages, transformed word boundaries, or later/unpreserved sources. Short matching phrases occur multiple times and cannot independently authenticate plaintext. The already-tested 2013 forest sentence has its prior dedicated gate; this extension applies the same decision across the other seven available signed witnesses. No new original plaintext or key is claimed.

## Reproduction, decisive finding, next choice

- [Read-only standalone CommonJS SFT](../sims/lp2_quote_original_source_attribution_sft.cjs). It checks the original quoted rune spans, all printed word lengths, source inputs, every GP and raw match count, exact quotation SHA-256 hashes, and a **planted 34-word source-native positive control** that the same detector must recover.
- [Successful GitHub Actions Node 22 execution](https://github.com/FlareZ123/liber-primus/actions/runs/43124545093), source head commit `c8d23000170af8f765146382a38115abbbc4a5b8`; complete per-span and per-source output preserved in the job logs. The initial transient CI failure on a whitespace-regex typo was corrected **before** this successful complete run.

**Director decision:** retire only these **three edition-locked long-verbatim source quotations** under original printed word boundaries. The 2-, 4- and 5-word shape matches are intrinsically non-discriminating, so there is no source-authenticated plaintext crib with which to derive a key/state equation, and a withheld ciphertext prediction is premature. A new quotation approach should begin with a genuinely independent published source clue or a demonstrable text-transformation rule. Investigating the p40/p53 identical five-word-length prefix as a possible *internal authored refrain* is separate from pre-existing literary attribution and is already addressed by [the source-twin equality-invariant gate](lp2-twin-quotation-fiveword-crib-gate.md).
