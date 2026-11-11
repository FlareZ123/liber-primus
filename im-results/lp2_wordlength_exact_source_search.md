# Literal plaintext-source search from original LP2 word lengths

**Status, Agent 7, 11 November 2026:** no unknown plaintext or authentic key recovered. A source-constrained candidate path, exact copying of an existing literary passage whose GP29 word lengths survive encryption, is excluded for seven tested text files. This is a text-location attempt that uses original plaintext-like segmentation independently of ciphertext rune identities. No broad claim about the entire library of possible sources is made.

## Why a copied-text source could produce genuine plaintext

The LP2 transcription contains eight original unsolved sections with **12,956 runes in 2,896 printed words**, separated by visually preserved spaces/punctuation. Several known LP1/LP2 solved-page mechanisms preserve printed word breaks. If an unknown section is a verbatim excerpt of a historically plausible source and keeps those breaks, a long uninterrupted word-length fingerprint would identify a plaintext passage **without a cipher key**. Standard GP29 spelling compresses exactly seven English digraphs into one rune each: TH, EO, NG, OE, AE, IA, EA. Therefore the registered match condition compares each original word's *rune count* to source word length after greedy GP29 digraph compression, not to its raw English letter count.

The transcript's literal word separators are hyphen and period; slash, page marker and line breaks are ignored, preserving words continued across physical wraps. The original section rune counts (729, 1145, 1738, 1894, 1021, 1433, 1680, 3316) and word counts (158, 255, 385, 435, 224, 326, 378, 735) reproduce repository invariants exactly.

An exact copied phrase containing **10 or more consecutive original words** must therefore yield a GP29 word-length match of length ≥10 under this specific model, regardless of encryption alphabet or unknown key.

## Historical source corpus and original-input results

Search a fixed nine-word shingle index across all eight unsolved sections, then extend each candidate both ways for the longest exact word-length match. Text sources are pinned local historical/control material, including the three original 2013 *Book of the Law* chapter files known to have served Cicada as book-code material. The four other inputs are Shakespeare's available first 300,000 characters, Gibran's *The Prophet*, Emerson essays and Blake's *Marriage of Heaven and Hell* excerpt. No keyword chosen from the ciphertext is used.

| Candidate source | GP-transliterated source words | Longest identical LP2 word-length run |
| --- | ---: | ---: |
| Shakespeare, first 300k characters | 55,407 | **9** |
| Gibran, *The Prophet* | 15,733 | **9** |
| Emerson, essays | 77,932 | **9** |
| Blake, *Marriage of Heaven and Hell* excerpt | 4,609 | <9 |
| *Book of the Law*, chapter I | 1,897 | <9 |
| *Book of the Law*, chapter II | 1,968 | <9 |
| *Book of the Law*, chapter III | 2,002 | <9 |

The Shakespeare, Gibran and Emerson top matches are exactly nine words. Every other source has **no** nine-word shingle. Most important is the literal historical *Book of the Law* test: there is no 10-word exact match across any of its three chapters, despite its documented usage as a key text in earlier Cicada puzzles.

A blinded positive uses a **60-word** contiguous Gibran passage, converts its real word lengths to GP29 runes with the *same* rules, and searches the unaltered source: **all 60 planted words recover**, including their exact original offset. This establishes detection capacity for the explicitly copied-phrase family.

## Interpretation and next decision

The seven tested file variants do not contain a verbatim contiguous English source passage of ten or more words serving as LP2 plaintext **if** printed ciphertext word lengths reproduce plaintext GP29 words. The data do not reject paraphrasing, edits, alternate spelling/digraph encoding, inserted/removed words, non-English plaintext, an unknown book, or intentional word-spacing decoys. A literary work may still provide a **running key** without serving as plaintext; the different question has its own prior source-key reports.

**Actionable follow-up:** search a different *independently source-selected* book only if an original Cicada clue names or locates it, or explore a bounded edit-tolerant alignment when an unambiguous literal candidate exists. Exhaustively searching arbitrary books for incidental nine-word shape matches cannot recover cryptographic plaintext.

[Single-file CommonJS reproducer and positive detector](../sims/lp2_wordlength_exact_source_search_sft.cjs); inputs: [exact original LP2 transcript](../resources/lp2-transcription.txt), the three [2013 Book of the Law chapter files](../resources/external/), and four repository historical/control corpora.
