# P33 terminal palindromes select 236+7 at an authentic p8 word boundary

**Scope and decision, 22 November 2026.** This investigation identifies a previously unreported, exact original-source route linking the p33→p34 word carry, the authentic 2014 order-7 / 1033 square, and the p8 black text. It specifies a reproducible **candidate address for seven original p8 runes**; it does not establish that Cicada authored the chain or that those runes are a cryptographic key. One historical-operation composite applied to all five original numbered passages fails to recover plaintext. All 56 unknown LP2 pages remain unsolved.

## Exact selected source data

The physically printed p33 image is archive 50.jpg. The two red headings delimit **21+28 black word starts**. At the p33→p34 page boundary the 49th black word is split **`ᛒ | ᛗᛒ`**, producing one complete three-rune word `ᛒᛗᛒ` (BMB). The last three complete p33-started words are:

| One-based black word | Original GP word | Transliteration | Is three-rune palindrome? |
| ---: | --- | --- | --- |
| 47 | `ᚱᚪᚱ` | RAR | Yes |
| 48 | `ᚫᚪᚷᛟᛞ` | AEAGOED | No |
| 49 | `ᛒᛗᛒ` | BMB | Yes, crosses p33→p34 |

The canonical hyphen, punctuation, and physical-page-preserving parser yields **2,896 complete original words**, **32** cross-page carries and **32** three-rune palindromic words. Across **all 2,894 consecutive three-word windows**, the only positions where **both the first and third words are three-rune palindromes** are the p33 47–49 words shown here. BMB is also the **sole palindromic cross-page word** among the 32 carries. This is a uniquely positioned original-input feature, independent of language scoring.

The historically recovered 2014 Stage7/Stage10 **7×7 magic square of sum1033** has **236 in printed cell47** (row7,column5) and **7 in printed cell49** (row7,column7). The positional mapping from the two unusual p33 words therefore selects the ordered pair **(236,7)**. Their sum is **243**. The original p8 image contains **12 red runes followed by exactly 243 black runes**. At black-rune offset236, zero-based, a literal printed word separator follows rune236, leaving the **last seven black GP symbols** as:

`ᛋᚩᛁᛠᚣᚾ | ᛇ` = **SOIEAYN | EO**, GP29 values **[15,3,10,28,26,9,12]**.

The vertical bar here records the source's *printed word break* after six of the last seven symbols; the last EO starts a word that continues onto p9. Thus the 236/7 cut is at an authentic word boundary, while the seven-symbol suffix is **not one complete word**. An interpretation requiring a seven-rune whole word is contradicted by the source. The two square-cell values arise from a specific morphology-based selector, rather than scanning all table pairs for sum243.

The p33 cuneiform values **1033 and 3301** are decimal reversals and primes, echoing the independently documented historical 2013 prime-reversal exercise. This supports *considering* palindromic word shapes as a possible human-recognizable clue. Nevertheless no first-party instruction says to pick palindromic p33 words, use their **positions** against the 7×7 numerical square, add the selected values, jump to p8, or treat its final seven runes as cipher state. Each selection is an explicit **hypothesis**, not an established author instruction. The historical 7×7 numerical square itself is centrally symmetric and repeats values, so a value-only lookup is ambiguous without positional addressing.

## One frozen original-cipher receiver, and its result

The five visibly numbered passages start on physical p36 and occupy exact rune lengths **[139,91,98,96,129]**, totaling **553 = 7×79** symbols. The seven-position transposition from actual 2014 Cicada Stage05 is `[0,6,2,5,1,4,3]` (zero-based); it has an independently reproduced 56-character historical positive. To test a conventional interpretation of the candidate seven-rune operand, freeze:

1. Concatenate the five source numbered units in printed order, without dropping their 553 original rune values.
2. Apply the historical inverse permutation to successive seven-rune blocks, continuously across the five numbered-item separators.
3. Subtract the selected p8 last-seven GP indices periodically, modulo29, starting at the first numeral's first rune; map values back to the canonical GP alphabet.

All lengths, start points, operations, direction, GP29 alphabet and key positions are fixed before reading output. The inverse has an explicit encoder that restores the same original 553 ciphertext runes. A 553-rune native solved-p57 plant is recovered exactly, and a one-symbol key rotation does **not** recover that plant. These are implementation controls and do not authenticate the historical key.

**Actual unchanged LP2 input:** ciphertext IoC **0.0342335613**, decoded IoC **0.0346725371**; the five decoded item IoCs are approximately **0.034720, 0.035897, 0.038292, 0.036623, 0.031977**. The outputs remain nonlinguistic, including both the 139-rune first numbered item and independently retained 91-rune second item. The Stage05 transposition alone necessarily preserves symbol frequencies and therefore cannot by itself raise the original IoC toward ordinary source-native GP prose. This exact two-operation composite **does not decode the manuscript**. It also assumes a cipher that crosses originally printed word and numbered-item boundaries, which is not authorized by the source.

**Reproducibility:** [one-file read-only CommonJS SFT](../sims/lp2_p33_palindrome_p8_236_7_source_sft.cjs). Input: the committed canonical corpus/transcription and the independently recovered 2014 original numerical square. The SFT asserts the unique triple, complete 49th p33 word, exact square cells, p8 word boundary, seven-rune suffix, five numbered lengths, original reencryption and synthetic native recovery. **Windows Node 22 PASS:** [manual read-only workflow run 45017512011](https://github.com/FlareZ123/liber-primus/actions/runs/45017512011), including all original assertions and controls.

## Next decisive missing input

The new **p33 (47,49) → (236,7) → p8 suffix** chain is a meaningful candidate for a human-readable *address selector* that can be challenged on the original illustrations. Its strongest unresolved premise is the **unwritten positional operation**: the creator must have intended palindrome detection and summing 7×7 cell values, rather than the match emerging among many plausible cross-manuscript arithmetic correspondences. The subsequent **GP29 state-update opcode** is entirely missing. The single direct historical transposition/additive receiver is negative.

Before deploying another seven-key cipher, seek first-party artwork or signed text that explicitly types one of these missing steps, or obtain a separately chosen original receiver that predicts a long plaintext segment. For the related p7→p8 243-state investigation (#2240), this candidate may help constrain a seven-rune initialization *if* its source selector is independently authenticated; it does not justify another unconstrained table/rotor sweep. For the p33→p34 state handoff (#2245), the original BMB palindrome is now an independently documented source clue, while the page carry remains an ordinary complete three-rune word until a typed operation is found.
