# Key-free source-text fingerprint from original LP2 word lengths

**Scope and decision (11 November 2026).** Original LP2 word boundaries persist as a possible side channel regardless of the rune substitution/stream cipher, provided the encryption preserves word segmentation. We tested an independent route to *actual* plaintext: a source passage reused verbatim from an already available philosophical/literary text would have a long, highly distinctive sequence of Gematria-Primus rune word lengths. None of the three available source controls produced a decisive match. **No unknown LP2 plaintext or key was recovered.**

## Original-input test and reproducibility

The runic-only 55 unsolved pages in `resources/liber-primus/lp2-transcription.txt`, joined across nonbreaking printed line/page wraps using the canonical word contract, contain exactly **2,896 words / 12,956 runes**. The tester `sims/lp2_wordlength_source_alignment_sft.cjs` counts a word's runes in the original ciphertext. For reference prose it converts Latin-letter words to approximate GP lengths by greedily recognizing the multigraphs `TH, NG, EO, OE, AE, IA, EA` as one rune each. It uses an exact six-word length seed and extends the alignment over at most 40 words allowing two rune-length discrepancies; the reported candidate lengths exclude the first third mismatch. Reference corpora are the repository's Emerson essays, Shakespeare excerpt, and previously solved LP1 prose.

**Authentic solved-page control:** p57's unencrypted PARABLE and its 19-word body comprise 20 canonical rune words. Converting their independently known Latin transliteration yields **19/20 word lengths exactly**: the single difference is zero-based word 4, where the original rune spelling `TUNNELNG` has seven GP runes, while standard `TUNNELING` has eight. This establishes that a narrowly fuzzy source scan is necessary even for genuinely known text.

**Original unknown ciphertext against the finite reference corpus:**

| Reference | Reference words | Longest exact consecutive word-length agreement | Longest match with up to two errors |
| --- | ---: | ---: | ---: |
| Emerson essays | 77,932 | 9 words | 13 words, 2 errors |
| Shakespeare first 300k characters | 55,407 | 9 words | 14 words, 2 errors |
| Solved LP1 reference | 821 after removing comment lines | no independently significant long run | no 15-word candidate |

The first two fuzzy search maxima are at LP2 word 2210 against Emerson `FROM THINGS FROM SPACE FROM LIGHT FROM TIME FROM MAN BUT ONE WITH` and LP2 word 2585 against Shakespeare `THAT BE NOBLE HELP HIM YOUNG AND OLD CITIZENS DOWN WITH HIM DOWN WITH`, respectively. They contain two mismatches each and have **no cipher-independent evidence of plaintext identity**. The LP1 line summaries include editorial and duplicate solved material; therefore its negative is only a finite-file comparison.

## What this changes and what it does not

The approach is independent of any encryption key or statistical GP29 decoder. It provides a lightweight, positive-controlled *crib detector* for a genuine source-reused passage, potentially enabling a known-plaintext attack even if ciphertext frequency is near uniform. In the three reference texts here, the longest alignments fall far short of a compelling recovery. The finite negative does not rule out independently composed text, a missing source, extensive paraphrasing, other languages or GP orthography varying beyond two words per span. English word lengths cannot identify a ciphertext key by themselves.

**Next decision:** Run the same SFT only on a newly found, historically plausible source such as a specific original Cicada puzzle text or identifiable illustrated passage. A length alignment of substantially greater than 20 words with sparse discrepancies and independent thematic/page evidence would warrant a frozen known-plaintext/ciphertext test. Broad unrelated-text scans would add little value.
