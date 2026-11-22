# Original LP2 2,896-word source-crib search: exact word-length fingerprints

**Agent15, 22 November 2026. Classification: source-only negative on seven reference corpora, with an authentic solved-page positive. No unknown plaintext.**

## Why this helps decryption

Liber Primus prints separators that may preserve plaintext word lengths under many encipherment families, including polyalphabetic ciphers with opaque keys. If a chapter copied a sufficiently long known poem, philosophical quotation or sacred text, it could disclose an authentic *unknown-page plaintext crib* without guessing the key. The manuscript itself and earlier Cicada challenges contain literature and religious motifs. A match has to be long enough to distinguish the intended source from coincidence and then predict withheld actual original words.

## Frozen original input and retrieval rule

Read all original **12,956 unsolved GP29 runes** (56 physical pages p0–55, 55 runic sections because p50 is a numeric-only table) from the checked-in unchanged `lp2-transcription.txt`. Respect authentic `-` printed word boundaries and punctuations; treat line `/` and physical-page boundaries `%` as transparent, preserving page-carry words. This yields exactly **2,896** complete original word lengths, independently agreeing with the established canonical parser. Neither the encrypted GP29 glyph values nor candidate plaintext scores participate in the initial match.

For each reference text, tokenize actual Latin words in source order and compare two independently fixed lexical-size conventions: **literal A–Z letter count** and conventional **GP29 runic count**, where TH, NG, EO, OE, AE, IA, EA are each one rune under a greedy digraph contraction. Search exact **contiguous** word-length matches with an eight-word index, extend every hit fully in both directions, and report maximally extended source and original positions. No word shifts, cipher keys, approximate spellings, phrase reordering, or selectively discarded source words are permitted. This simple gate can miss authentic paraphrases or alternative runic spellings, so a negative is restricted to these two normalizations and these specific references.

## Results on original manuscript

| Reference | Source Latin words | Longest literal-letter match | Longest GP29-digraph match |
| --- | ---: | ---: | ---: |
| Gibran, *The Prophet* (Gutenberg 58585) | 15,696 | 9 | 9 |
| Shakespeare, first 300k original text corpus | 54,189 | 9 | 9 |
| Emerson, *Essays, First Series* (Gutenberg 2944) | 77,773 | **10** | 9 |
| *Orthodox Daily Prayers* (Gutenberg 34981) | 28,107 | 9 | **10** |
| Blake, *A Song of Liberty* training excerpt | 466 | below8 | below8 |
| Cicada/LP1 solved-text reference corpus | 941 | below8 | below8 |
| 2012 Blake chorus excerpt | 130 | below8 | below8 |

One 10-word literal-length coincidence on original p46 (global rune offset **11,253**) is compatible with Emerson's “THE GOOD MAN WILL BE THE WISE MAN AND THE”, but that exact source segment does not survive the independent GP29-digraph convention; there is no source-selected crib. The other 10-word coincidence on original p35 (global offset **8,580**) matches `BORE GOD INCARNATE FOR US AND PRAYS CEASELESSLY FOR OUR` under GP29 lengths from the prayer book; it is a typical short numeric fingerprint rather than repeated authored prose. Other source matches reach at most nine consecutive words.

**Positive:** withhold original p56, the *already independently solved* 85-rune page, from the unknown-page pool. Its source printed word lengths reproduce **14 consecutive complete words** of the published p56 plaintext in the Cicada/LP1 reference, beginning with `AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO ...`. This establishes that the parser and GP-digraph convention can find a real phrase when a source contains one. A known-source native GP sequence also tests the correct line/page handling. The 14-word control is genuine *known* plaintext, not an LP2 breakthrough.

## Research decision

This corpus does not supply a sufficiently distinctive unknown-page plaintext crib under either original-word-length normalization, so none of its attractive eight-to-ten-word fragments licenses fitting a cipher key. The method is fully reusable on **new first-party dateable text and other independently selected candidate writings** through additional UTF-8 text paths; source-only scans are much cheaper than guessing millions of opaque rune keys. A positive worthy of decryption should contain a longer, author-plausible exact run and predict its untouched continuation, with original rune-level forward replay if a cipher hypothesis emerges.

[Complete Windows Node22 original-corpus script](../sims/lp2_original_wordlength_source_crib_search_sft.cjs) · [Windows Node22 PASS](https://github.com/FlareZ123/liber-primus/actions/runs/44979409953). All source files and actual original runic tape are versioned in `resources/`; no external text is silently added or altered.
