# Whole-word source inverse: exact word-length multisets

**22 November 2026, Agent32.** Classification: bounded original-cipher plaintext-source attack. **No authenticated LP2 plaintext or key recovered.** The completed [Node22 CommonJS SFT](../sims/lp2_source_wordlength_multiset_scan_sft.cjs) passed on Windows ([initial CI run 44991558291](https://github.com/FlareZ123/liber-primus/actions/runs/44991558291); [extended CI run 44993123729](https://github.com/FlareZ123/liber-primus/actions/runs/44993123729); [Old English extended run 44993423135](https://github.com/FlareZ123/liber-primus/actions/runs/44993423135); [complete-book extended run 44994328457](https://github.com/FlareZ123/liber-primus/actions/runs/44994328457)). The extended test includes the genuinely solved Liber Primus corpus and the nine source-illustrated chapters, guarding against a word permutation that crosses printed page boundaries.

## How this would recover actual plaintext

An original source prose passage may have had its **whole words permuted**, while maintaining the 29-rune GP spelling and **length of each printed word**. Consequently, recovering the source would not require cracking the character cipher first: the word-length multiset of every containing segment is unchanged by such a permutation. A historical text whose contiguous passage exactly matches two or more original pages, a whole illustrated chapter, or the complete original 2,896-word manuscript, would become a concrete independent plaintext candidate. We would then lock the passage, construct a forward original-rune cipher prediction and test withheld pages.

Each original printed word is read from `resources/lp2-transcription.txt`. Hyphen and terminal punctuation separate words, but literal line, section and page wrap markers do not: **all 32 cross-page words remain joined** and are assigned to their starting physical page. The original unknown corpus has **12,956 runes in 2,896 printed words** on 55 rune-bearing pages (physical p50 is a numeric-only table).

For each source, every contiguous passage of exactly the same number of source words is tested. A sliding histogram of 18 bins (length 1–16; 17+ joined) computes **half the L1 distance** between the candidate source passage and original target. A distance of zero means the entire multiset matches, independent of word order. Any positive distance is a strict lower bound on the number of word lengths needing modification. Source data are encoded with either fixed GP-native compound TH/NG/EO/OE/AE/IA/EA/IO and ING rules, or literal Latin word length. These two alternatives are chosen in advance and not tuned to a lucky-looking fragment. The solved LP2 source also receives its exact original rune-count encoding.

The predeclared 55-published-page windows are **55 single, 54 adjacent pairs, 53 adjacent triples**, for 162 windows per source encoding. Independently, the source-visible chapter bounds are original physical pages **0–2, 3–7, 8–14, 15–22, 23–26, 27–32, 33–39, 40–53 and 54–55**, holding respectively **158, 255, 383, 437, 224, 326, 378, 669 and 66 printed words**. These nine chapter windows allow a whole-word permutation across the physical pages of a chapter while preserving each chapter's original printed words. An independent **whole-book multiset** tests arbitrary word movement across all chapters.

## Fixed inputs and real original results

The included public source texts are Gibran's *The Prophet*, Emerson's essays, Shakespeare, the Latin Vulgate, Crowley's *Liber AL* I–III, Blake's *Marriage of Heaven and Hell*, Caesar's *De Bello Civili*, *The Kybalion*, the King James Passion Gospels and Tennyson's *Lady of Shalott*. In addition the extended run directly tests the repository's editor-normalized solved LP1 English text under both length conventions, the source-native solved LP2 rune words, and source-native Old English GP29 word lengths from the corrected Gutenberg *Beowulf* control. These comprise **12 modern/literary files, 24 converted literary inputs, three authentic-solved inputs, one native Old English *Beowulf* input and 28 total candidate source sequences**. In all, the SFT evaluates **4,536 page-range queries, 252 chapter-range queries and 28 whole-book queries**, with every source-contiguous placement examined by the sliding scanner.

| Gate | Observed on original LP2 |
| --- | --- |
| Source inputs, original page-range windows, chapter windows, whole-book window | 28, 162, 9, 1 |
| Exact source passage matching **two adjacent original pages** | **0** |
| Exact source passage matching **three adjacent original pages** | **0** |
| Exact source passage matching a **whole illustrated chapter** | **0** |
| Exact source passage matching the **entire 2,896-word book** under arbitrary whole-word permutation | **0** |
| Nearest whole-chapter match among 12 literary source files | **7 word-length changes** out of 378 original words, Emerson literal-Latin word lengths, source index 59,363 vs physical LP2 pp33–39 |
| Nearest three-original-page match | **3 word-length changes** among 103 words at physical pp48,49,51, separately seen under Shakespeare and KJV GP conversions |
| Genuine solved-LP1/LP2 control as possible source | **0** exact two/three-page or chapter matches |
| Synthetic source-known positive | **Exact** passage recovered after deterministic shuffling of three consecutive 40-word blocks under both fixed GP and Latin conventions |

The corrected native Old English *Beowulf* source produces no exact multi-page or whole-chapter passage (nearest original two-page pair requires two word-length replacements; nearest chapter requires 25). The original short physical p49 (17 words) produces exact one-page collisions in multiple unrelated historical sources. The extended run obtains a literal-Latin one-page match in the **known solved LP1 translation** as well, reinforcing that short pages do not identify a shared plaintext phrase. A three-word-length or seven-word-length *near*-match is likewise no discovery when the procedure screens millions of source-passage offsets. No unknown rune is decoded.

## Scope and next causal decision

The experiment rejects **exact borrowing of a contiguous passage from these particular source texts with whole-word permutation confined to original pages, chapters, or even the entire unknown 2,896-word book**, provided that the original transcription preserves every source word's length. It does **not** reject original prose, untranslated languages, paraphrasing, inserted/deleted words, GP spelling differences, a donor text not in these sources, changed rune lengths, pseudo-spacing, or keys from these books used in unrelated cipher mechanisms.

Only a separately identified *author-selected* text warrants extending this exact source search. A credible exact long match with independent untouched original-passage confirmation would supply actual key-independent plaintext and justify forward cipher analysis. Until that occurs, do not promote the closest chapter, short-page collision, or unrelated literary source to an invented LP2 decryption.

The SFT is read-only and contains an independent shuffled-120-word source positive, original rune/word/chapter assertions, exact minimum distance, source index and all candidate counts. It is implemented with Node's standard libraries and ran to completion on an unmodified Windows GitHub runner.
