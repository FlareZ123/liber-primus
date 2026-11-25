# Source-selected linguistic unit audit

**Agent16, 25 November 2026. Bounded negative for issue #2781.** No source-authenticated reversible linguistic tokenization or orthographic operation beyond the established GP29 rune/word conventions was identified. No original LP2 decryption was attempted under an invented grouping.

## Decision standard

A candidate must be more than a plausible language theory or an available literary text. It must be fixed by a first-party Cicada instruction or an exact, historically attested literary exercise; specify a deterministic reversible unit/normalization; and predict an independent feature on authentic controls before it is applied to unknown LP2. A source being available in 2014 does not prove Cicada selected an analyst's extraction from it.

## First-party LP1 evidence

The editor-normalized solved LP1 transcription is traceable to the original page images and preserves these relevant instructions:

- The opening warning says not to edit or change the book or its message, including **the words or their numbers**. This supports preserving source word/number structure; it does not prescribe clitic attachment, phrase packets, syllables, or a different token boundary.
- The p5 rubric says primes and the totient function are sacred and that all things should be encrypted. Its accompanying 5×5 word/number grid is an arithmetic clue, not a multiword linguistic grammar.
- The p6 Koan distinguishes a person's name, occupation, species, and body from who they are. This is philosophical prose; it gives no reversible rule for expanding rune names or joining words.
- The p9 instruction says to do four unreasonable things each day. The p13 instruction says to program the mind and reality. The p15 instruction says “KWESTION ALL THINGS” and to discover truth inside oneself. None defines a tokenization.
- The solved prose contains isolated spelling forms such as `BELEIVE` and `KWESTION`; these do not define a consistent reversible orthographic transform. The `ING` rune in FOLLOWING is the established GP29 compound rune, not a newly inferred language unit.

The 2016 authenticated continuation is more direct: “Its words are the map, their meaning is the road, and their numbers are the direction.” This selects ordinary words and their numeric properties as relevant puzzle units. It does not select a larger packet or clitic grammar. The known p56/p57 plaintext controls also retain ordinary word boundaries.

## Exact literary-unit candidate: the Anglo-Saxon Rune Poem

The 1915 Dickins edition is a genuine exact literary source: its **29-stanza Anglo-Saxon Rune Poem** is ordered one stanza per rune, and its explicitly labelled “Anglo-Saxon (a) Runic Poem” sequence matches GP29 **29/29 in order**. This is already established as the source for the alphabet/order; see [the pinned source and key gate](lp2-anglo-saxon-rune-poem-source-gate.md) and [Dickins 1915](https://en.wikisource.org/wiki/Rune_poems#The_Anglo-Saxon_Rune_Poem).

A stanza is an authentic multiword literary unit, but the source establishes **rune ↔ stanza order**, not that LP2 plaintext is segmented into stanza-sized packets or that a stanza's first word, word count, line count, or other feature is to be consumed as a cipher symbol. The only nearby extraction with an independent LP1 clue is the p56 heading “AN END”: taking the final letter of each stanza's final word as a period-29 key was already tested against the full original stream (both signs, Old English and Dickins English readings) and produced **0/1,132 long dictionary words**. The 29-stanza structure therefore strengthens the alphabet source selector, but supplies no new reversible plaintext tokenization. Sweeping other stanza features would be an unselected extraction search.

## 2014 source audit

| Artifact | What it actually supplies | Linguistic-unit decision |
|---|---|---|
| [May 2014 signed message](../resources/cicada2014-may2-signed-message.asc) | “Your enlightenment awaits you,” an onion address, a request to report back, “Good luck,” and 3301 | No word, phrase, syllable, paragraph, or token rule |
| [Onion5 signed message](../resources/cicada2014-onion5-signed-message.asc) | “Very good. You have done well to come this far” plus a small embedded formal-logic image | No textual segmentation or orthographic rule |
| [Onion7 index](../resources/cicada2014-onion7-index.html) | An HTML index of 133 numbered image files | Image ordering only; no linguistic instruction |
| [Emerson *Self-Reliance* witness](../resources/external/cicada2014-self-reliance-2014-bookcode-witness.txt) | The literary source text | The text has paragraphs and sentences, but no LP2-specific tokenization instruction |
| [Emerson firstfive/word60 extraction](../resources/external/2014-emerson-firstfive-word60-source.json) | An analyst-derived selection of the first 60 words from each of the first five paragraphs | Its own status says **“no evidence Cicada selected this LP2 use.”** The 60-word cut is not a first-party exercise and cannot select an LP2 unit |

The May message and onion5 carrier are authenticated 2014 artifacts, but their contents do not bridge the Emerson text to a 60-word grouping. The fact that a book-code source existed in the 2014 ecosystem does not establish a five-word, 60-word, paragraph, or sentence unit for LP2.

## Existing tests that should not be repeated

- [#2723 clitic grammar](../im-results/lp2-clitic-group-q8-anchor.md) froze A/AN/THE/OF/TO/IN/ON/AT/BY/UP/AS and maximal attachment to a following content word. It improved all four marginal length metrics, but the exact q8 phrase-domain inverse failed its necessary anchor-support bound. The completion explicitly found no source selector.
- [#2767 clitic plus authentic prime clock](../im-results/lp2-postshuffle-prime-clock-long-anchor.md) retained the exact grammar and p56 clock. It failed the original long-anchor gate in every chapter while native plants recovered, so the fixed receiver was retired.
- The [word-length grammar diagnostic](../im-results/lp2-wordlength-order-grammar.md) and [word-order architecture study](../im-results/lp2-wordlength-order-architecture.md) find no native short-range syntax signal in ordinary printed word order. These results motivate asking about another register, but do not supply one.

## Conclusion and fork

**No candidate meets the source-selection gate.** The only authenticated language-level direction found is to preserve and use the printed words and their numbers. The Emerson 60-word selection is researcher-defined; the clitic list is a fixed experimental grammar without first-party authorization; the isolated LP1 spelling anomalies do not define a global reversible mapping.

Close #2781 as “no selector found.” Do not expand the particle inventory, sweep alternate clitic rules, or run a new original-cipher language score. Reopen this branch only if a first-party artifact or exact historical exercise supplies a specific unit and deterministic inverse that can first be calibrated on independent authentic plaintext. This does **not** prove that all alternative linguistic registers are impossible; it retires this source-selection attempt only.

## Reproduction and source identities

This is a documentary source audit, not a computational decryption. Key repository source blobs:

- `resources/liber-primus/lp1-plaintext-reference.txt`: `8ed037a6ddeef2b20a10bd6a84830e7cf9f43f7d`
- `resources/cicada2014-may2-signed-message.asc`: `e2b7382ac2cfb0adfe028cc063fc6048e0ad718e`
- `resources/cicada2014-onion5-signed-message.asc`: `e0ed3d728782d9d42dab82fb7a54b8d07ae2cea3`
- `resources/cicada2014-onion7-index.html`: `303db130705f0ef9be2a738f4336d5cfcebde80c`
- `resources/external/2014-emerson-firstfive-word60-source.json`: `2bc19a368f2608ecc2cb410d0eadc47950885095`
- `resources/external/cicada2014-self-reliance-2014-bookcode-witness.txt`: `12a6bc018047a1276e77f2b7f633d5905732fff9`
- `resources/cicada2016-4gq25.md`: `9ca050c3c6f3d732fd35828e121d656c26897b98`

No change to `results/README.md` is warranted; no plaintext or mechanism was established.
