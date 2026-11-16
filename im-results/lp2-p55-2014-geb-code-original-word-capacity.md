# Original p55 word capacity versus the authenticated 2014 GEB book-code grammar

**Agent 22, 16 November 2026. Intermediate gate, no recovered plaintext.** The 17-item output of the authenticated 2014 Fifth Onion book code cannot be transferred *literally* as 14 one-record-per-word GEB coordinates plus its two single-digit items and ONION terminator onto the original 17 p55 printed words. The coincidence 17=17 and the 43 interior runes does not specify any alternative compressor or key.

## Independently specified historical decoder

The primary [2014 Fifth Onion source record](https://github.com/neuroretransmit/cicada/blob/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2014/007-fifth-onion/README.md) publishes a Cicada-signed message containing 14 records of `chapter-title abbreviation : dialogue-exchange : word : letter`, separated by two literal digit tokens `3` and `7`, then the literal terminator `ONION`. Its documented positive readout is `ut3qtzbrvs7dtvzp.onion`. The second coordinate is **dialogue exchange**, not line. This is an authentic prior *operation*, and it independently precedes the LP2 release. Its return as a decoder for p55 is an unverified transfer.

The original p55 printed glyph stream is the 76-rune physical page at `resources/liber-primus/lp2-corpus.json` p55 and the 76-glyph section of `resources/lp2-transcription.txt`; the latter retains all original printed word divisions, with line-wrap `/\n` eliminated before tokenizing. Both source representations agree on all 76 rune identities in order.

## Fixed original-page result

The 17 printed word lengths are:

```text
1, 4, 2, 2, 6, 6, 2, 13, 6, 4, 2, 7, 7, 2, 6, 3, 3
```

Exactly **one** word has one rune, **five** have two, **11** have at least three, **nine** have at least four and **seven** have at least five. All 17 sum to 76. Removing two boundary runes from each of the 16 nonsingleton words leaves **43** interior runes (the singleton contributes none). The intriguing 43 is therefore an accounting consequence of 76 original glyphs in 17 words, with one singleton; it does not in itself encode 42 parameters.

A literal `chapter : exchange : word : letter` encoded as four **nonempty** rune fields in one printed word requires at least **four** glyphs, even if all numerals and a chapter code fit in one rune each. Only **9/17** original words are that long, fewer than the required **14** coordinate records. Even granting that the chapter is supplied externally, `exchange : word : letter` requires at least **three** symbols per word, available in only **11/17**. This disproves the direct one-GEB-record-per-original-word packing without needing a GEB text copy, a key search or fitted interpretation. Furthermore the specific 2014 output has two literal single-symbol digit items, while only one original p55 word is a singleton. Those two digits could be encoded in a different way, so this last observation is auxiliary rather than a universal contradiction.

## Decision

The original 2014 GEB **book and coordinate semantics** remain available if a separate Cicada-authenticated instruction identifies how p55's 17 words should be parsed, compressed, grouped, or used as key material. Nothing in the presently fixed original p55 word geometry chooses such a rule; declaring one post hoc merely rescues the attractive 17/43 count fit. Do not launch an unconstrained GEB chapter-title/modulo/field-order sweep or promote any extracted letters as LP2 plaintext without that selector. The direct 14-record one-word grammar is excluded. The established unsolved-page status is unchanged.

**Reproduction:** `sims/lp2_p55_2014_geb_word_capacity_sft.cjs` validates the original Unicode glyphs, all 17 word boundaries, rune count, 43 interiors and direct-capacity inequalities. It requires only Node 22 built-ins and repo-local source files. The authentic book cipher positive is documented by the cited original 2014 archive; this test does not redistribute the copyrighted source book or claim to re-run its literary index.
