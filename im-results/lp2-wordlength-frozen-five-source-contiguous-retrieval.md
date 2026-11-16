# Original LP2 word-length retrieval against pinned literary sources

**Initial five-register decision (14 November 2026), expanded by an external-source screen (16 November):** No sufficiently long source-text match and no unknown plaintext recovered. The best exact original printed-word-length correspondence is **nine contiguous words**, which is **shorter than every one of 400 within-chapter-shuffled controls** or equal at the lower tail. This rules out only a *literal continuous excerpt with unchanged original GP word lengths* drawn from the five tested frozen sources, not a general linguistic plaintext or known-text key.

## Source and independently fixed test

Original 55 unsolved rune-bearing LP2 page blocks (12,956 runes) yield exactly **2,896** genuine printed words, preserving the **32 page-spanning words**. The nine original visual chapters are retained as hard stopping boundaries. The five already-pinned source registers are independent of the LP2 ciphertext and were previously used to study native word-length grammar:

| Text register | Fixed word count | Stored source |
| --- | ---: | --- |
| Gibran, *The Prophet* | 15,733 | `resources/control/gibran_prophet_58585.txt` |
| Emerson, *Essays* | 77,932 | `resources/control/emerson_essays_2944.txt` |
| Shakespeare source selection | 55,407 | `resources/control/shakespeare_first300k.txt` |
| Latin Vulgate source GP-length register | 39,835 | `resources/control/latin-vulgate-gp-wholewords.txt` |
| *Beowulf* source Old English GP-length register | 10,885 | `resources/control/beowulf_oe_gp_profile_corrected.json` |

For source English, the existing solved-runic GP spelling approximator contracts **ING, TH, NG, EO, OE, AE, IA, EA**; normalizes **K→C, Q→CW, V→U, Z→S**; and uses original printed GP word lengths rather than English character lengths. Latin and Old English control lengths were already recorded in GP units and are read unchanged.

Hash every contiguous **seven-word source GP length signature** and look up every seven-word original LP2 signature wholly within an authentic chapter. For matches, extend exactly both left/right while preserving source and original word order and chapter boundary. This tests over five source registers simultaneously and retains the actual source text/offset for any candidate. The seed creates a complete index from original source files, not any simulated plaintext.

## Completed test

- Best exact LP2↔source correspondence is **9 contiguous GP word lengths**. Several unrelated original positions and registers reach the same nine-match length, including Shakespeare source texts and Gibran. These are **length-only coincidences** and do not reproduce the ciphertext runes. One illustrative nine-word source string, the Gibran passage `are as weak as your weakest link This is`, matches p52 at source-word index 11,100 and LP2 original word index 2,768 by **lengths alone**.
- There are **737** seven-word exact signature candidates before maximal extension. No 10-word or longer exact source excerpt survived the complete bounded search.
- **400** fixed-seed original **nine-chapter** internal word-length-order randomizations, preserving the exact length histogram of each visual chapter, give maximum source-run match **9–13**, median **10**. Every shuffled case is at least as long as the original best (**400/400**, one-sided plus-one p=**1.0**).
- **Source-positive plant:** Replace 22 complete original word-length slots within the first chapter with 22 contiguous GP source lengths from the fixed Gibran text. The same lookup/extension immediately finds an exact **22-word** correspondence. This demonstrates sensitivity to the kind of literal preserved-length excerpt being tested.
- Neither the real scan nor the positive-control-null contains a decryption rule or original LP2 key. A source match of nine **lengths only** is not plaintext recovery.

**Reproducible program:** [Original exact continuous-source word-length SFT](../sims/lp2_original_wordlength_frozen_source_retrieval_sft.cjs). **Manual-only run:** [43542946808, successful](https://github.com/FlareZ123/liber-primus/actions/runs/43542946808), using [this workflow](../.github/workflows/lp2-wordlength-frozen-source-retrieval-manual.yml). The source files and word-segmentation algorithm are all repository-tracked, so the result is independent of external web/network access.

## External cited-text extension (Agent12, 16 November 2026)

The original five-register screen above had already excluded literal word-length excerpts from three of the texts used here. A separate suffix-automaton scan extended it to five distinct public-domain historical works, with **the same 2,896 authentic printed LP2 words and full source-native GP29 spelling** (including ING/IO contractions). The alternate algorithm permits chapter-crossing matches; the strongest new match lies wholly within original physical p30, so no chapter cut changes it. Gutenberg licenses were stripped; publisher front matter in the sampled editions remains a possible nuisance and no tested text was author-selected as LP2 plaintext.

| Additional external source | Pin: GitHub blob SHA | Body words | Longest exact GP29 word-length alignment |
| --- | --- | ---: | ---: |
| [*Walden*](https://github.com/GITenberg/Walden-and-On-The-Duty-Of-Civil-Disobedience_205/blob/master/205.txt) | `ef740fbc0f9bf70ce68534ff40f151f597ca580b` | 117,162 | 9 |
| [Milton, *Paradise Lost*](https://github.com/GITenberg/Paradise-Lost_26/blob/master/26.txt) | `e792b429a8533f2696136af342bdaee87698e035` | 81,148 | 10 |
| [Blake, *The Marriage of Heaven and Hell*](https://github.com/GITenberg/The-Marriage-of-Heaven-and-Hell_45315/blob/master/45315.txt) | `44149cc32fa8a46501a95059283526a8a3429705` | 4,758 | 8 (edition front matter) |
| [Guest, *The Mabinogion*](https://github.com/GITenberg/The-Mabinogion_5160/blob/master/5160-0.txt) | `fd9db1c7bc90e11d41433b7cc2ec3b7e1ccb0cd7` | 108,227 | **11** |
| [Blake, *Songs of Innocence and of Experience*](https://github.com/GITenberg/Songs-of-Innocence-and-Songs-of-Experience_1934/blob/master/1934-0.txt) | `6d379eb7000a853d7cf2652e84a503ee8323131d` | 5,665 | 8 |

The eleven-word *Mabinogion* alignment is `one but the man who would fight with him Lady said` against LP2 whole words zero-based **1654–1664**, physical p30, GP lengths `[3,3,2,3,3,5,5,3,3,4,4]`. This is **only** a length-signature match, without readable rune output. Its apparent length is not surprising under matched natural texts: a fixed-seed conditional null drew 400 whole 2,896-word length windows from Shakespeare, Gibran, Emerson (rotating the three sources) and compared to the identical 108,227-word *Mabinogion* source. There were at least one 11-length-signature matches in **344/400** windows, plus-one upper-tail `345/401 = 0.86035`; the original contains exactly **one**. Original windows contain 5 matches of length10 and zero length12; the conditional null means are 10.475 and 0.49. This null is an illustrative source-conditioned baseline, with no global historical-corpus multiple-testing correction.

The new [read-only suffix-automaton source finder](../sims/lp2_wordlength_source_crib_finder_sft.cjs) is an independent reusable cross-check and permits additional **source-motivated** books as arguments. Its three local controls (Shakespeare, Gibran, Emerson) were executed against exact source bytes and asserted at maximum 9/9/9. The original [five-register full test](../sims/lp2_original_wordlength_frozen_source_retrieval_sft.cjs), with per-chapter boundary conditioning and its planted positive, remains the stronger original statistical control. The external extension adds no plaintext or key and gives no justification for broader blind book enumeration.

## Decision and remaining possibility

Retire this *specific five-register, unchanged-word-length continuous-excerpt* source identification hypothesis. These texts could still provide a **key**, a nonliteral paraphrase, or an excerpt after transposition/resegmentation; this test has no power over those. A truly useful next source lookup must be justified by an **authored source/book reference**, preferably with an independently specified transformation or known plaintext segment. Broadening hundreds of unrelated text sources would not fix the absence of a historically selected textual source.

**Authenticated unknown LP2 plaintext recovered: zero.**
