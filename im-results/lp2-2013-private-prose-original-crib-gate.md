# Archived 2013 questionnaire and KOAN as literal LP2 plaintext cribs

**Status (17 November 2026, Agent 7):** a bounded source-language test. Historical source content yields **no source-exact quotation of seven or more consecutive printed words** in LP2 unknown pages p0–55 under either of two frozen spelling conventions. A separate authentic 2013→2014 reused PARABLE control matches **20/20 solved p57 words and all 95 rune slots exactly**. This tests plaintext reuse, not cipher mechanics. **No unknown plaintext, key, decoder or destination was recovered.**

## Why this corpus has a specific human-solve motive

The 2013 private quiz asked what the inner “voice” is and questioned the boundary between self and thought. The known-clear 2014 Liber Primus KOAN explicitly addresses the same voice, so **reuse of *earlier puzzle prose*** is a creator-observable hypothesis. A contemporary participant archive preserves the 2013 quiz and a TCP-server challenge whose `KOAN` command has an approximately 61-word example. Later, a 2013 MP3's documented *PARABLE* thematic text matches the already solved 2014 p57 passage about “instar” and “circumferences.” Those links support a targeted, *exact quotation* screen; none authenticates that the unsolved text actually contains them.

Independent historical sources:

- [2013 quiz participant transcription, Leroy, 2023](https://leroy.works/articles/answers-to-cicada-3301-2013-questionnaire/) (20 questions; participants report a 19-question variant);
- [2013 challenge email and explicit `KOAN` sample, neuroretransmit archive](https://github.com/neuroretransmit/cicada/blob/main/2013/007-fourth-onion/README.md) (the archive itself cautions that the historical emailed instructions lack a preserved verifiable signature);
- [2014 known-clear Koan and final p57, historical stage archives](https://github.com/neuroretransmit/cicada/blob/main/2014/009-squares-submission-pages/README.md) and [p57](https://github.com/neuroretransmit/cicada/blob/main/2014/011-seventh-onion/README.md).

This is a natural alternative to brute-forcing a secret GP29 key: first look for earlier author text that can determine a *long independent crib* before testing any cipher.

## Exact corpus and frozen receiver

Read the unchanged canonical `resources/lp2-transcription.txt` with the shared `sims/lp2_word_pages.cjs` parser, preserving printed hyphens/periods as word delimiters, merging line and page splits, and checking all unknown runes against `resources/liber-primus/lp2-corpus.json`. The source contains exactly **12,956 runes, 2,896 words, 32 words continuing across physical page boundaries**, 55 rune-bearing unknown pages. Runeless p50 is not treated as a blank word.

For each of the **20** listed 2013 questions and one complete 2013 protocol `KOAN` example, remove punctuation and unspelled numerals, then record word lengths under two **fixed, independently plausible spelling registers**:

1. The documented native GP digraph spelling (`TH EO OE NG AE IA EA`, with `ING → NG`, `QU → CW`, `V → U`, `K → C`, `Z → S`), based on known clear LP text.
2. A conservative single-Latin-letter spelling (same Latin consonant normalizations, no multi-letter rune contraction).

For each source word start, compare all contiguous canonical unknown-book word starts, requiring **every successive word length** to agree. Output the best match and original physical page. The source's numerical-only question 8 contributes no letters, so **its zero-word result is not evidence either way**. This grammar is frozen before looking at any unknown matching words; there are no shifted word cuts or fitted transliteration exceptions.

## Executed original results

| Historical source | Source words | Longest native-GP exact consecutive word-length agreement | Longest literal-letter agreement |
|---|---:|---:|---:|
| 2013 questions 1–5 | 6 / 12 / 15 / 10 / 8 | **4 / 6 / 5 / 4 / 4** | 4 / 5 / 5 / 4 / 5 |
| Question 6, full sensory/belief-systems paragraph | 47 | **6** | 5 |
| Question 7, “inner voice” quote and footnote | 28 | **5** | 5 |
| Question 8, numeral-only statement | 0 | not testable | not testable |
| Questions 9–13 | 4 / 9 / 4 / 4 / 18 | **4 / 6 / 4 / 4 / 5** | 4 / 5 / 4 / 3 / 6 |
| Question 14, lake reflection passage | 40 | **5** | 4 |
| Questions 15–20 | 15 / 10 / 13 / 19 / 18 / 24 | **5 / 5 / 5 / 4 / 4 / 5** | 6 / 5 / 5 / 4 / 4 / 5 |
| 2013 explicit `KOAN` command example | 61 | **6** | 5 |
| **Maximum among all 21 tested passages** | | **6** | **6** |

The sharpest native-GP coincidences are source question 2 at physical p33, question 6 at p27, question 10 at p28 and the protocol KOAN at p51; each is exactly six matched **lengths**, not six identified plaintext words. The six-word runs are expected to occur under broad scanning over thousands of printed words; the matching original runes remain unrecognizable ciphertext. No lexical key or actual plaintext is determined by these locations.

**Strong source-positive:** the independently known 2013 PARABLE word sequence from *THE INSTAR EMERGENCE* has exactly the same 20 native-GP word lengths as the original 2014 known-clear physical p57. The program verifies those 20 against the actual p57 rune transcript and their total of **95/95 GP runes**, rather than relying on a language model's impression. A deliberately changed word (`DIVINITY → DIVINE`) fails that control. This demonstrates the scanner can see a genuine full-length historical reprise while the unsolved pages show no similarly exact reuse of this 2013 quiz material.

## Research decision and next input

A direct verbatim source quote of **seven or more complete consecutive words** from these 2013 questions/KOAN is excluded under the two precise registers above. This is stronger than unsuccessfully guessing the most common 2013 phrase as a password and weaker than a cryptographic rejection of the sources. Paraphrases, one-word-preserved excerpts, alternate source versions, deliberate errors, hidden splitting, translation and a password-derived PRNG are outside scope.

In particular, historical reuse of *the idea* of an inner voice is real; **it is not evidence that the unsolved book contains the same words**. A future phrase-crib attack needs an independently fixed long source, a length signature matching original unknown pages, and a restricted reversible cipher family capable of predicting held-out plaintext. Avoid expanding the 21 already-negative sources with arbitrary segmentation or keys.

**Read-only Windows Node 22 reproducer:** [`sims/lp2_2013_quiz_koan_source_crib_sft.cjs`](../sims/lp2_2013_quiz_koan_source_crib_sft.cjs). All 21 short source passages, the exact original parser, signature computation, best-match pages, 20-word clear positive and an intentionally broken negative are embedded as assertions. [Generic manual runner](https://github.com/FlareZ123/liber-primus/actions/workflows/manual-node22-sft-runner.yml) was dispatched on the source commit; the original data-derived count assertions were independently computed before publication.
