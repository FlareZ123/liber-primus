# Exact original GP29 word-length quotation search

**Decision (15 November 2026):** Across four existing source-native literary reference texts, no nine-chapter Liber Primus II passage has **10 or more consecutive printed words with the same GP29 whole-word lengths** as a literal passage of the comparison edition. An exact 20-word source passage planted into a copy of the original length stream is correctly recovered by the same search. This is a bounded negative, **not** a decryption, an all-literature exclusion, or an inference about Cicada's authorship.

## Human solve-path premise and source inputs

If the 2014 author copied prose from an earlier text and encrypted the runes while preserving the original whole-word separators, a reader could identify source passages from the *sequence of printed word lengths* even when all 29 ciphertext rune values appear uniform. This uses visible LP2 punctuation and typography rather than guessing a cipher key. The rival hypothesis is that the author composed fresh prose, altered word segmentation, or encrypted a transport format. This is a one-operation search for an independently sourced plaintext crib.

Use the manuscript's canonical [p0–55 physical-page transcription](../resources/lp2-transcription.txt) and matching [GP29 numerical corpus](../resources/liber-primus/lp2-corpus.json), without modifying any ciphertext rune. Printed LP2 page50 is a rune-free numeric table. Crucially, the physical page separator '%' is **not a word separator**: on this corpus 32 lexical words carry across page boundaries. Parsing each JPEG independently produces **2,928 artificial words**; joining them before lexical extraction yields exactly **2,896 actual printed words and 12,956 GP runes**, with authentic illustrated-chapter counts below.

The nine image-supported chapters have original page ranges **p0–2, p3–7, p8–14, p15–22, p23–26, p27–32, p33–39, p40–53, p54–55** and canonical complete-word counts **158, 255, 383, 437, 224, 326, 378, 669, 66**. Complete printed words never straddle those nine chapter boundaries. All source match offsets refer to complete-word zero-based positions within their chapter.

The four previously preserved comparison corpora are [Shakespeare](../resources/control/shakespeare_first300k.txt), [Gibran's *The Prophet*](../resources/control/gibran_prophet_58585.txt), [Emerson's *Essays*](../resources/control/emerson_essays_2944.txt) and an independently sourced [GP29 Latin Vulgate word corpus](../resources/control/latin-vulgate-gp-wholewords.txt). The first three source texts are converted to GP rune-word lengths using exactly the project's GP29 normalization: QU→CW, V→U, K/Q→C, Z→S, longest GP29 digraphs and ING→NG, IO→IA within a whole word. The source-native Latin file has one pre-encoded GP29 whole word per line and needs no further textual conversion.

The search makes a seven-word-length hash index of each source, finds every exact seven-word original candidate, and extends both directions to the complete maximal exact match. It examines all nine original illustrated chapters, without assuming any unknown rune-to-rune relation. The strings printed below reflect GP-normalized original source text rather than claimed plaintext.

## Reproducible source comparison

| Source | Source whole words | Longest exact GP29 word-length stretch | Example longest source excerpt |
| --- | ---: | ---: | --- |
| Shakespeare, first 300k characters | 55,407 | **9** | US IN HIM AND WAIL HIS DEATH LORD MAYOR |
| Gibran, *The Prophet* | 15,733 | **9** | THAT NO ONE HAS GONE HIS WAY WITH EMPTY |
| Emerson, *Essays* | 77,932 | **9** | HIGH BOARD THEIR UIRTUES ARE PENANCES I DO NOT |
| Latin Vulgate New Testament | 39,835 | **9** | Exact source-native nine-word sequence at source word index 34582 |

The first Gibran nine-word match begins at **original chapter 3 (p8–14), chapter word offset 225** and exact source-GP word offset 4957. A second source Gibran nine-word match occurs at original chapter 8 (p40–53), chapter word offset 607, source offset 11100. Shakespeare produces four distinct nine-word maxima; Emerson and Latin one maximum each. These are **only word-length coincidences**. The original CJS prints every tied maximum and the exact GP rune-length signature for independent review.

### Original-source positive

An authentic 20-word passage from the original Gibran source, starting at source word offset 4886, is inserted as word *lengths only* into a copy of original chapter7 at offset169. Without being told the target phrase, the same index search must rediscover a 20-word or longer match spanning that exact source placement. The assertion passes. Original inputs are unchanged in the non-planted run.

The passing [original-input Windows Node22 execution 43764369317](https://github.com/FlareZ123/liber-primus/actions/runs/43764369317) checks all nine chapter counts and runes, the four original-source maximum lengths, one exact Gibran offset, and the planted 20-word recovery. The entire fixed-input, copyable [CommonJS SFT](../sims/lp2_wordlength_source_crib_index_sft.cjs) runs via the repository's reused Agent3 manual workflow. Earlier failed runs exposed and corrected a source parsing issue: a preliminary per-page split mistakenly counted 2,928 words and produced a spurious 10-word Gibran match. **Do not reuse that invalid candidate**, which disappears when the 32 original page-carry words are reconstructed.

## Decipherment consequence

None of the four direct source passages is supported by a 10+ original whole-word-length match. No plaintext, key, authenticated quotation source, or destination follows. A copied text with different punctuation, an alternative GP29 phonetic normalization, inserted/deleted words, text not included in these exact editions, a freshly written manuscript, or a cipher that changes word boundaries all survive. Future use should add **independently motivated source works**, preferably texts referenced by first-party Cicada material, and demand a long, uniquely aligned source-length run **plus an independent original-rune decoder prediction** before promoting a quotation guess. Avoid an indiscriminate quote-guessing campaign; the current four registers have been exhausted by an exact bounded search.
