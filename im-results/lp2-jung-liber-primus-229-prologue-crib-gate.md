# Jung's *Liber Primus* prologue at printed page 229: direct original-LP2 plaintext-crib test

**14 November 2026, Agent36. Classification:** new, independently source-selected *candidate plaintext*, **bounded negative** under intact word segmentation. No authentic unknown LP2 plaintext, encryption key or destination was recovered.

## Why this is a finite, historically plausible plaintext candidate

The original 2014 Cicada Stage10 archive contains the prime-named file \`229.jpg\`, and the manuscript calls itself *Liber Primus*. C. G. Jung's earlier *Liber Primus* in *The Red Book* has a prologue *The Way of What Is to Come*, printed on page **229** of the facsimile edition. A three-page extract of the English translation is publicly supplied by [the British Association of Jungian Analysts](https://www.jungiananalysts.org.uk/wp-content/uploads/2024/09/The-Way-of-What-is-to-Come-from-C.-G.-Jung-Liber-Novus-The-Red-Book-1-1.pdf), headed page229 and continuing through page231.

This is a **conditional connection** between a 2014 *prime-selected filename*, a shared Latin book title and an independently located book page. There is no direct original Cicada instruction saying to consult Jung, and a numerically matching printed page can be coincidental. Previous direct title-as-Vigenère-key tests failed; this test takes a **distinct route**: verbatim passage recognition through original word lengths, which would survive a length-preserving pad, without guessing the rune cipher.

## Frozen direct-corpus test

Download the publicly posted PDF only during a manual GitHub Actions run; use Poppler \`pdftotext\` in three distinct standard extraction modes (\`default\`, \`-raw\`, \`-layout\`), because the original publication has two columns and English interspersed with Latin quotations and footnotes. No copyright-protected PDF or extracted source text is committed to this repository.

Read original \`resources/liber-primus/lp2-transcription.txt\` unchanged as **55 rune-bearing unknown physical pages**, **12,956 ciphertext runes**. Preserve printed spaces and punctuation as word breaks, and join original graphic line wraps, using the existing canonical scanner grammar. Independently test (1) historically solved GP29 word spellings (QU→CW, V→U, K/Q→C, Z→S, and native TH/NG/ING/IO and other multi-letter symbols), and (2) literal Latin26 letter counts. Search all exact contiguous five-or-more-word length matches by keyed 5-gram; extend deterministically to the first actual difference, retaining each original physical page boundary. No inserted/elided plaintext words, page shifts, custom rune values or word-boundary edits.

Positive source control: the separately authenticated 20 words of the already clear physical p57 *PARABLE* (95 original runes) match the fixed GP29 source-language normalizer **20/20**, byte-for-byte at word lengths.

**Run:** [successful manual-only GitHub Actions execution 43582175076](https://github.com/FlareZ123/liber-primus/actions/runs/43582175076). [Standalone CommonJS SFT](../sims/lp2_jung229_prologue_crib_sft.cjs); [manual-only workflow](../.github/workflows/lp2-jung229-prologue-crib.yml).

## Observations

| PDF extraction | Source words | Longest GP29 direct length match | Longest Latin26 direct length match |
|---|---:|---:|---:|
| Default | 4,241 | **10** | **8** |
| Raw text order | 3,936 | **10** | **8** |
| Layout columns | 4,240 | **10** | **8** |

The same strongest GP29 length match persists across all three extraction modes: **physical LP2 p10, zero-based printed word index11**, versus the Jung prologue excerpt near the words “the time when the great war broke out” (eight-word preview). The match reaches ten consecutive words, **then immediately fails**: the next five source GP lengths are \`[6,2,6,1,5]\`, whereas the original ciphertext page has \`[5,1,4,7,4]\`. This match cannot establish a direct, unchanged Jung quotation. The best Latin26 matches reach only eight words and also immediately fail; their leading positions differ among PDF extraction orders.

**Decision:** This exact three-page Jung prologue excerpt is not the intact, continuously copied plaintext of any 12-or-more-word LP2 passage under the two stated 2014-equivalent word-length registers and unchanged original word boundaries. The unique ten-word match has no withheld continuation and therefore supplies neither recovered plaintext nor a cryptographic keystream. Source-name and page-number resonance alone do not justify padding/transposition to rescue it. A different Jung text or nonliteral paraphrase is outside the scoped result; revisit only with a new original Cicada selector or a withheld source-specific prediction.
