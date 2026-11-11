# LP2 source-marked quotation crib search

**Classification:** finite source-locator negative. **No unknown LP2 plaintext, key, or authentic source quotation recovered.**

The original LP2 quotation glyphs select seven contiguous passages independently of ciphertext values or literary-source fitting. Their source rune offsets, original word counts and GP word lengths are established by the [punctuation annotations](../resources/liber-primus/lp2-quote-punctuation-spans.json) and [the source-locked scanner](../sims/lp2_quote_source_cribs.cjs). Longer quotations starting at original rune offsets **9,811** (physical p40) and **12,522** (p53) share a distinctive five-word length prefix **[5,7,2,3,4]**. This is a motivated opportunity to seek a common quoted text, although a length pattern cannot establish identical plaintext. The fixed-bijection equality conflict for the first 21 runes remains ([quotation crosslink](../sims/lp2_quote_length_crosslink.cjs)).

## Result on the original source shapes

The scanner considered all seven quotation intervals, with **4, 5, 2, 14, 13, 34 and 14** complete printed GP rune words. It searched the existing fixed **92-title GITenberg historical/philosophical collection**, with each source word normalized to GP digraph length using the existing solved-control convention. Five-word exact seeds were extended both directions within each original quote. A planted exact 34-word quotation was recovered from its source position.

The successful [manual Actions run 42933745459](https://github.com/FlareZ123/liber-primus/actions/runs/42933745459) covered **87 editions / 7,553,930 source words**; the other five editions (IDs 4095, 55201, 57145, 7297 and 57292) returned HTTP 404 on both pinned URL patterns.

**None of the four longer original quotation intervals (13, 14, 14, 34 words) has any exact full-length GP word-length match in the 87 available editions.** The maximum partial match is **nine consecutive words**, including nine internal words in the p40 quotation matching length sequences in the King James Bible and in The Mystery and Romance of Alchemy and Pharmacy. A p42–43 interval matches nine internal words in Beyond Good and Evil. These are postselected partial length coincidences over millions of source words; they provide no direct copied passage, ciphertext-compatible key or plaintext.

The raw CI log records 580 full-length matches from the **short five-word p22 quotation**; these do not apply to the four longer quotes. Its 35 nine-plus seed hits can include several overlapping five-word seeds for one underlying book location and should not be interpreted as independent quotations.

## Evidence, limits and next decision

The original inputs are the normalized [rune transcript](../resources/lp2-transcription.txt) and [quote glyph annotation](../resources/liber-primus/lp2-quote-punctuation-spans.json). The [single-file scanner](../sims/lp2_quote_source_cribs.cjs) reuses the frozen source catalog and the existing manual workflow with inputs **scan_mode=quoted-cribs** and **max_books=92**. See [complete CI output](https://github.com/FlareZ123/liber-primus/actions/runs/42933745459).

A recovered genuine plaintext quotation would require an independently authenticated matching source, a cipher inversion frozen *before* evaluating original LP2 output, and exact lossless re-encoding. This search only constrains a literal same-spelling, intact-word direct-source copy in the sampled editions. Other external books, languages, orthographies, padding, reordering, other segmentation, and original composition remain open.