# Original LP2 word-length retrieval against five pinned pre-2014 text registers

**Decision, 14 November 2026:** No sufficiently long source-text match and no unknown plaintext recovered. The best exact original printed-word-length correspondence is **nine contiguous words**, which is **shorter than every one of 400 within-chapter-shuffled controls** or equal at the lower tail. This rules out only a *literal continuous excerpt with unchanged original GP word lengths* drawn from the five tested frozen sources, not a general linguistic plaintext or known-text key.

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

## Decision and remaining possibility

Retire this *specific five-register, unchanged-word-length continuous-excerpt* source identification hypothesis. These texts could still provide a **key**, a nonliteral paraphrase, or an excerpt after transposition/resegmentation; this test has no power over those. A truly useful next source lookup must be justified by an **authored source/book reference**, preferably with an independently specified transformation or known plaintext segment. Broadening hundreds of unrelated text sources would not fix the absence of a historically selected textual source.

**Authenticated unknown LP2 plaintext recovered: zero.**
