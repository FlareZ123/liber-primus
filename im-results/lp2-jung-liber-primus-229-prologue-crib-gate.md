# Jung's *Liber Primus* prologue at printed page 229: direct original-LP2 plaintext-crib test

**14 November 2026, Agent36. Classification:** new, independently source-selected *candidate plaintext*, **bounded negative** under intact word segmentation. No authentic unknown LP2 plaintext, encryption key or destination was recovered.

## Why this is a finite, historically plausible plaintext candidate

The original 2014 Cicada Stage10 archive contains the prime-named file \`229.jpg\`, and the manuscript calls itself *Liber Primus*. C. G. Jung's earlier *Liber Primus* in *The Red Book* has a prologue *The Way of What Is to Come*, printed on page **229** of the facsimile edition. A three-page extract of the English translation is publicly supplied by [the British Association of Jungian Analysts](https://www.jungiananalysts.org.uk/wp-content/uploads/2024/09/The-Way-of-What-is-to-Come-from-C.-G.-Jung-Liber-Novus-The-Red-Book-1-1.pdf), headed page229 and continuing through page231.

This is a **conditional connection** between a 2014 *prime-selected filename*, a shared Latin book title and an independently located book page. There is no direct original Cicada instruction saying to consult Jung, and a numerically matching printed page can be coincidental. Previous direct title-as-Vigenère-key tests failed; this test takes a **distinct route**: verbatim passage recognition through original word lengths, which would survive a length-preserving pad, without guessing the rune cipher.

## Frozen direct-corpus test

Download the publicly posted PDF only during a manual GitHub Actions run; use Poppler \`pdftotext\` in three distinct standard extraction modes (\`default\`, \`-raw\`, \`-layout\`), because the original publication has two columns and English interspersed with Latin quotations and footnotes. No copyright-protected PDF or extracted source text is committed to this repository.

Read original \`resources/liber-primus/lp2-transcription.txt\` unchanged as **55 rune-bearing unknown physical pages**, **12,956 ciphertext runes**. Preserve printed spaces and punctuation as word breaks, and join original graphic line wraps, using the existing canonical scanner grammar. Independently test (1) historically solved GP29 word spellings (QU→CW, V→U, K/Q→C, Z→S, and native TH/NG/ING/IO and other multi-letter symbols), and (2) literal Latin26 letter counts. Search all exact contiguous five-or-more-word length matches by keyed 5-gram; extend deterministically to the first actual difference, retaining each original physical page boundary. No inserted/elided plaintext words, page shifts, custom rune values or word-boundary edits.

Positive source control: the separately authenticated 20 words of the already clear physical p57 *PARABLE* (95 original runes) match the fixed GP29 source-language normalizer **20/20**, byte-for-byte at word lengths.

**Ordered-crib run:** [successful manual-only GitHub Actions execution 43582175076](https://github.com/FlareZ123/liber-primus/actions/runs/43582175076). [Standalone CommonJS SFT](../sims/lp2_jung229_prologue_crib_sft.cjs); [manual-only workflow](../.github/workflows/lp2-jung229-prologue-crib.yml).

## Whole-page word-permutation invariant: additional independent architecture test

An alternate reading could rearrange **complete page-local printed word segments** while preserving their lengths, even if the source's original ordered quotation no longer matches. Such a route cannot change the *multiset* of word lengths on each physical page. The same frozen Jung excerpt and GP29/Latin26 spelling registers therefore supply a stronger second test: slide a contiguous source window of **exactly the same word-segment count** across each of the 55 original rune-bearing unknown LP2 physical pages; compare the full 18-bin word-length histogram (lengths1–17 and 18+), ignoring the order of tokens entirely. This grants any arbitrary secret permutation of those page-local segments, without searching its key.

**Result:** **zero exactly matching page-sized source windows** under **both GP29 and Latin26** in **all three independent PDF extraction modes**. A near miss is common on short pages and is not source evidence: e.g., in default extraction, the 18-segment p49 length bag can be made to match a source window after changing **one** segment's length, while the actual exact-edit-free source window does not exist. Likewise the original 10-word ordered p10 coincidence does **not** extend to a whole-page word-inventory match. Every run checks 55 physical page-local records. For longer pages this is a stronger rejection of a verbatim source passage with intra-page reordering; it remains conditional on unaltered word counts/lengths, source extraction and page boundaries. Moving source words *between* printed pages, changing word boundaries, paraphrasing or using a different book passage lies outside the test.

[Successful extended Actions run 43583665540](https://github.com/FlareZ123/liber-primus/actions/runs/43583665540) executes the updated same [CommonJS source scanner](../sims/lp2_jung229_prologue_crib_sft.cjs) in all three PDF orders; its JSON reports 55 checked page inventories and zero exact matches for each of the six cases. No additional key, plaintext or authenticated passage was found.

## Same historical source as a full-book Vigenère running key

A stronger causal possibility than a quoted Jung passage is that the **2009 p229 prologue supplies a running key** for the 2014 LP2, under the actual solved Cicada GP29 modular-additive cipher. The three-page excerpt is **16,915–16,917 GP29 runes** when the PDF starts at its first extracted token, enough for all 12,956 original encrypted runes. This candidate uses a single book-continuous cipher clock, normal native GP digraph contraction, both authentic additive signs, and only two source-selected starting points: first extracted token and the literal printed prologue heading *The Way of What Is to Come*. The latter occurs as extracted word index413 in the raw-text PDF (otherwise index0). No language-fitted key offset, page phase, secret spelling adjustment or F-skip is granted. The decoder is exactly reversible, and a separate real p57 plaintext plant recovers all **95/95 runes** under each candidate.

**Result:** Across all **12** (three PDF orders × two starts × two signs) original full-book inverses, decoded whole-stream IoCs range approximately **0.03447–0.03453**, essentially unchanged from original **0.034478398** and close to the flat GP29 benchmark (1/29 ≈ 0.034482759). Every first-120-rune decoded preview is nonlinguistic. For example, the *raw* PDF prologue-heading source, plus sign, yields IoC **0.03452444035**; the *default* PDF first-token source, minus sign, yields **0.03449175543**. The positive control and original forward replay show the operation is implemented correctly. This excludes these explicitly frozen *verbatim Jung p229 running-key GP29 clocks* as recognizable English decryptions; it does not exclude another source start, a keyed source selection instruction, a source reshuffle, non-additive decoding or a nonnative-plaintext intermediate.

[Passing original-input GitHub Actions run 43583965296](https://github.com/FlareZ123/liber-primus/actions/runs/43583965296) contains all 12 exact IoCs, key lengths, first-rune previews and solved native-positive controls. All three experiments in this report share [one CommonJS SFT](../sims/lp2_jung229_prologue_crib_sft.cjs). The conclusion is now supported under three independent possible roles of the same historically suggested Jung source: direct quotation, in-page word permutation and direct GP29 running key. None has delivered new ciphertext plaintext or authentic key material.

## Observations

| PDF extraction | Source words | Longest GP29 direct length match | Longest Latin26 direct length match |
|---|---:|---:|---:|
| Default | 4,241 | **10** | **8** |
| Raw text order | 3,936 | **10** | **8** |
| Layout columns | 4,240 | **10** | **8** |

The same strongest GP29 length match persists across all three extraction modes: **physical LP2 p10, zero-based printed word index11**, versus the Jung prologue excerpt near the words “the time when the great war broke out” (eight-word preview). The match reaches ten consecutive words, **then immediately fails**: the next five source GP lengths are \`[6,2,6,1,5]\`, whereas the original ciphertext page has \`[5,1,4,7,4]\`. This match cannot establish a direct, unchanged Jung quotation. The best Latin26 matches reach only eight words and also immediately fail; their leading positions differ among PDF extraction orders.

**Decision:** This exact three-page Jung prologue excerpt is not the intact, continuously copied plaintext of any 12-or-more-word LP2 passage under the two stated 2014-equivalent word-length registers and unchanged original word boundaries. The unique ten-word match has no withheld continuation and therefore supplies neither recovered plaintext nor a cryptographic keystream. Source-name and page-number resonance alone do not justify padding/transposition to rescue it. A different Jung text or nonliteral paraphrase is outside the scoped result; revisit only with a new original Cicada selector or a withheld source-specific prediction.
