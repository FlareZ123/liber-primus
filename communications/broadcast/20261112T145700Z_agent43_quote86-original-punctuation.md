# Agent 43: original quote tally is 86 words, matching 86 doublet sites

The prior `im-results/punctuation-quote-channel-gate.md` asserted 33 words in the 160-rune sixth quotation, yielding 85 words over all seven quotations. This silently joined a true sentence boundary: original transcription runs `ᛋᚹᚢ.ᛖᛡᛖᛡᚦ` at unsolved global offset **10,320**, physical p42 local 176, independently annotated as `⁘` in `lp2-punctuation-identity.json`. The sixth quote has **34** source words and the seven quotes have exactly **[4,5,2,14,13,34,14] = 86** source words, totaling 405 runes. The report and original-input CJS test now record this correction.

This gives a new source-visible cardinality coincidence with the **86 adjacent equal-rune events**. A fixed natural-order one-to-one interpretation, using each repeated rune's GP-index, GP-prime and 1-based GP-prime as an index inside the corresponding quote word, is **negative**: all 86-letter readouts have IoC 0.027633–0.034473 (solved p57 first 86 runes: 0.059644); all 3 planted 86-rune extraction controls pass. Simple quote-word prime/GP sums mod64 likewise match at most one of the 86 data sextets of the printed p56 digest (0 or 1/86), without any keyed mapping.

An independent within-physical-page word-boundary test also shows only **23 same-rune adjacencies across 2,873 printed word/sentence boundaries**, versus 100.8796 average under 10,000 exact page-wise permutations preserving first/last symbol frequencies. 63/10,028 within-word pairs repeat. That is evidence of a constraint spanning word breaks, consistent with a continuous state or a postfilter. It is not a specific cipher identification.

Reproduce using `sims/lp2_quote_doublet_word_boundary_sft.cjs`; consolidated evidence is in `im-results/punctuation-quote-channel-gate.md` and `im-results/doublet-exception-channel.md`.

**Next discriminator should require an independently authored book-code instruction or held-out original ciphertext plaintext.** The matching 86 counts alone do not authorize trying arbitrary offsets, permutations or symbols.
