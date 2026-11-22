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

### Four independent historical source books (original Gutenberg reprints)

To exclude the possibility that the first small source set missed a **historically compelling Cicada literary key**, independently read complete unchanged first-party mirrors of four more public-domain texts directly through GitHub's GITenberg source repositories, without importing a preselected phrase into the candidate key. Original spellings and word order are frozen from the linked originals. Apply the **same unchanged all-2,896-word original LP2 index and two orthographies**. Results:

| Original source edition | Source words | Longest Latin-letter match | Longest native GP29-length match |
| --- | ---: | ---: | ---: |
| [*The Mabinogion* (Gutenberg 5160)](https://github.com/GITenberg/The-Mabinogion_5160/blob/master/5160-0.txt), specifically used in earlier Cicada puzzles | 111,275 | **11** | **11** |
| [*The Kybalion* (Gutenberg 14209)](https://github.com/GITenberg/The-KybalionA-Study-of-The-Hermetic-Philosophy-of-Ancient-Egypt-and-Greece_14209/blob/master/14209.txt) | 37,411 | 9 | 9 |
| [Blake, *The Marriage of Heaven and Hell* (Gutenberg 45315)](https://github.com/GITenberg/The-Marriage-of-Heaven-and-Hell_45315/blob/master/45315.txt) | 7,778 | below8 | below8 |
| [Buddhist *Dhammapada* (Gutenberg 35185)](https://github.com/GITenberg/The-Buddha-s-Path-of-VirtueA-Translation-of-the-Dhammapada_35185/blob/master/35185-0.txt) | 19,001 | below8 | 9 |

The two Mabinogion length-only 11-word candidates come from **different source excerpts**, e.g. literal `WAS GREEN AND IN FULL LEAF AND NIGH THERETO HE SAW` and GP29 `ONE BUT THE MAN WHO WOULD FIGHT WITH HIM LADY SAID`. Neither supplies an authored page selector, encryption key, or verbatim native-GP rune match. Full direct searchable readings are reproducible by passing these unmodified UTF-8 texts as optional paths to the same committed SFT. The original seven bundled sources plus four unmodified external references now cover over **350,000 literary source words** with no independently identified unknown-page quotation. Exact match length 11 remains weak evidence in a search over hundreds of thousands of words and two normalization rules.

**Positive:** withhold original p56, the *already independently solved* 85-rune page, from the unknown-page pool. Its source printed word lengths reproduce **14 consecutive complete words** of the published p56 plaintext in the Cicada/LP1 reference, beginning with `AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO ...`. This establishes that the parser and GP-digraph convention can find a real phrase when a source contains one. A known-source native GP sequence also tests the correct line/page handling. The 14-word control is genuine *known* plaintext, not an LP2 breakthrough.

## Research decision

These eleven checked literary corpora do not supply a sufficiently distinctive unknown-page plaintext crib under either original-word-length normalization, so none of its attractive eight-to-ten-word fragments licenses fitting a cipher key. The method is fully reusable on **new first-party dateable text and other independently selected candidate writings** through additional UTF-8 text paths; source-only scans are much cheaper than guessing millions of opaque rune keys. A positive worthy of decryption should contain a longer, author-plausible exact run and predict its untouched continuation, with original rune-level forward replay if a cipher hypothesis emerges.

[Complete Windows Node22 original-corpus script](../sims/lp2_original_wordlength_source_crib_search_sft.cjs) · [Windows Node22 PASS](https://github.com/FlareZ123/liber-primus/actions/runs/44979409953). All source files and actual original runic tape are versioned in `resources/`; no external text is silently added or altered.
