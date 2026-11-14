# Historical Stage05 seven-position permutation applied to complete LP2 printed words

**Agent 6, 14 November 2026. Classification: bounded original-input negative on one specifically selected reversible word-order transfer. No recovered unknown LP2 plaintext, creator-selected LP2 key, cipher or destination.** The complete source-exact test passed on [Node22 GitHub Actions run 43647520462](https://github.com/FlareZ123/liber-primus/actions/runs/43647520462); reproducer: [sims/lp2_2014_stage05_sevenword_grammar_sft.cjs](../sims/lp2_2014_stage05_sevenword_grammar_sft.cjs).

## Causal premise and strongest objection

A real solved 2014 Cicada Stage05 operation rearranged every consecutive *seven-character* packet by the explicit fixed inverse index order **[0,6,2,5,1,4,3]**, whose inverse is **[0,4,2,6,5,3,1]**. Its exact historical 56-character regression is documented in the [source-exact 2014 Stage05 report](lp2-2014-stage04-source-exact-stage05-seven-column-inverse.md). Independently, the **2,896 original unknown LP2 printed words** have an unusual lack of natural-prose word-length adjacency and sentence-role dependence, despite their nonuniform word-length marginal. A whole-word permutation preceding an identity-changing rune cipher is one plausible way to scramble length syntax.

The new, directly testable hypothesis is to apply that *already historically attested seven-position order* to **whole printed word packets**, independently within the nine **original-image-visible LP2 chapters**. This changes the packet unit from Stage05's documented *characters* to LP2's *words*. **No contemporary author instruction authenticates that packet-unit transfer.** Distinct earlier tests covered the seven-character rune transform on selected LP2 spans, eight- or thirty-two-lane word interleaving, and general whole-word-scramble statistics; none identified this exact seven-word historical operator as an LP2 cipher.

## Frozen lossless inverse and inputs

Read the unchanged rune and punctuation transcription [lp2-transcription.txt](../resources/liber-primus/lp2-transcription.txt) with the 29 genuine GP rune forms in [lp2-corpus.json](../resources/liber-primus/lp2-corpus.json). Join original page and printed-line continuations transparently. Keep all **2,896 words**, **12,956 rune positions**, **175 sentence periods**, and all 32 original page-carry words; the rune-free physical p50 is omitted in the file but restored to physical numbering for chapter assignment.

The nine originally illustrated source chapters have complete-word counts **[158,255,383,437,224,326,378,669,66]**. Independently in each chapter, split the word sequence into full consecutive seven-word blocks. The final incomplete block of each chapter remains unchanged. Apply the authentic Stage05 inverse **[0,6,2,5,1,4,3]** within each full block; attach each original sentence-final punctuation mark to its word. The authentic opposite order is a matched directional control. Every packet operation is a bijection and is exactly reversed by the other order. This is an order-only operation and cannot, by itself, alter the source's nearly uniform GP29 rune frequencies.

Evaluate the unchanged original, the frozen inverse and its opposite using (a) plug-in mutual information of adjacent word lengths, with lengths binned 1..8 / 9+, excluding the nine chapter joins; (b) word-length-versus-sentence-role mutual information for start/end/interior; and (c) 800 fixed-seed Fisher–Yates shuffles of the source's **same word tokens inside each chapter**, followed by the same operator. The shuffle null therefore retains each original chapter's complete word inventory, word-length marginal and total sizes. The source baseline exactly reproduces the existing independent [word-length grammar study](lp2-original-wordlength-grammar-mi.md) before transformation.

## Original LP2 results

| Frozen source sequence | Adjacent-length MI (nats) | Sentence-role MI (nats) | 800-shuffle adjacency null mean | Standardized z | Upper-tail p |
| --- | ---: | ---: | ---: | ---: | ---: |
| Original unchanged | **0.0121561010** | 0.0014681943 | 0.0111838287 | +0.4876 | 0.2859 |
| Historical Stage05 inverse on seven-word blocks | **0.0104881550** | 0.0021199558 | 0.0112207795 | −0.3590 | **0.6280** |
| Opposite Stage05 order on seven-word blocks | **0.0138194112** | 0.0021487076 | 0.0112466093 | +1.3010 | **0.1011** |

The exact historical inverse **reduces** original adjacent-length association. The opposite orientation increases it slightly, but remains entirely typical of source-word shuffles and lacks an author-specified directional basis. Neither direction restores a natural-prose word-order pattern. The sentence-role MI remains small in absolute magnitude under either, with no claimed causal language interpretation.

A separate source-native GP-positive plant uses the first 2,896 whole words of the already pinned Gibran control, encoded with the same repository-standard GP tokenization, preserving the original chapter sizes. Its natural adjacent-word-length MI is **0.0524090998**. Scrambling complete seven-word packets with the authentic opposite permutation reduces that MI to **0.0146795173**; exact source Stage05 inverse recovers **all 2,896 words** and restores MI to **0.0524090998**. The inverse recovers the original source word order byte-for-byte. This positive test demonstrates that the proposed packet mechanism could erase the same grammar signal when genuinely used on ordinary GP-native prose, and that the frozen decoder would detect its recovery.

The complete CommonJS SFT checks every source count, nine chapter sizes, precise output MI values, both permutation orders, full inverse identity, 800 seeded inventory-preserving null draws and intact GP-native positive controls. It ran successfully in [the original-source manual GitHub Actions job](https://github.com/FlareZ123/liber-primus/actions/runs/43647520462).

## Decision

Retire **only** the exact historical Stage05 seven-position operator applied in independently reset, complete **seven-word** packets to the nine original illustrated chapter boundaries, including its matched inverse-direction control, as a direct restoration of natural-prose word order. Its original-input outputs cannot justify an additional unselected rune-value cipher layer, secret key or post-fitted grouping.

This does **not** reject other word-order mechanisms, changed delimiters, a non-English or intentionally unusual text register, later stateful substitutions, or historically attested character-wise Stage05 in its original setting. A genuinely actionable new route requires first-party evidence selecting a *different* original packet clock or a creator-selected rune-value inverse and an independently checkable unknown-page plaintext. No authenticated unknown LP2 plaintext or final continuation has been recovered.
