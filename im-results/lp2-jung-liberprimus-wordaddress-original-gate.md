# Jung *Liber Primus* as LP2 plaintext donor or word-address book: current evidence

**22 November 2026, consolidated Agent34 and Agent32 results. Classification:** three source-constrained original-input cryptanalytic attacks, **no authentic unknown-LP2 plaintext, source key, or continuation destination**. The same-title Jung book is a research hypothesis, **not an instruction identified in authentic Cicada source material**. Do not promote attractive short exact fragments or near-matches to plaintext.

## Authored clue and donor specificity

Cicada's authentic signed 2016 message says *“Liber Primus is the way. Its words are the map, their meaning is the road, and their numbers are the direction.”* Earlier signed rounds used GP29 numeral representations and prime weights. Carl Jung's *The Red Book: Liber Novus*, widely available before the 2016 clue, includes a part headed **Liber Primus**. That shared heading is the only plausible external donor selector tested here. It does **not** establish that Jung supplied the original plaintext, a key, a cipher alphabet or any of the readout rules below.

The 545-page English reader's edition was downloaded in memory from `https://logoilibrary.com/wp-content/uploads/2023/11/The-Red-Book-Jung.pdf`. Exact SHA-256 `5cbb32a6a6033399c8692ac9aaeb148e02a1a0734f4d7a31a90453fbc6073359` and actual source-title heading identify its strictly named body from PDF pages zero-based **107–198** (end before heading *Liber Secundus* at p199), containing **41,654 alphabetic source words**. A separate, wider donor test used the entire reader's edition, **228,597 words**, with no fitted cut. Authenticated original ciphertext inputs contain **12,956 GP29 runes in 2,896 printed whole words**, including **32 cross-page words** that are joined before any address calculation. The original p50 256-byte table is word-free.

## Three independent proposed inverses and results

### 1. Complete LP2 printed ciphertext words as direct book addresses

Each real printed word `w=[r0,…,r{k-1}]` is interpreted as one of two author-era GP29 natural numbers: its base29 representation, or the sum of the GP29 ordinal prime weights of its runes. Reduce modulo donor word count and read the zero-based source word. Agent34 first evaluated the **initial letter** of each indexed word in two frozen donor scopes, yielding exactly 2,896 letters per output:

| Donor scope | Address | First 45 original letters | Source-trained trigram gain/letter | Shuffled-letter upper-tail |
| --- | --- | --- | ---: | ---: |
| Whole 545-page reader | Base29 | `DBBMAMSTAAWTDTJGAAISOIPWTPSBHDTASSTADARJATTIM` | 4.519486 | 0.955224 |
| Whole reader | GP-prime sum | `AXCITTTIINXVFIOSLFRRHSCVCCARXCRFTXTCTIVIVTRRTV` | 4.094629 | 0.164179 |
| Exact named *Liber Primus* | Base29 | `OAYJYTTMBAMEMTMTIFFFBAWUIOOLDYADSSWFTTIETCSSB` | 3.275016 | 0.641791 |
| Exact named *Liber Primus* | GP-prime sum | `IMOSVBSHOETAUHIENHCSGEIBUNFDNGSTCTEUFANSSEDATB` | 3.092231 | 0.845771 |

None yields a sustained sentence; none includes the prespecified intact anchors LIBER, PRIMUS, DIVINITY, CIRCUMFERENCE, INSTAR, TUNNEL, PARABLE, EMERGE or ENLIGHTENMENT. [Whole-edition original SFT](../sims/lp2_jung_liberprimus_wordaddress_sft.py) and [source-title SFT](../sims/lp2_jung_liberprimus_section_address_sft.py), [source-authoritative runs 44182144954](https://github.com/FlareZ123/liber-primus/actions/runs/44182144954) and [44184388177](https://github.com/FlareZ123/liber-primus/actions/runs/44184388177). Both passed implanted `LIBERPRIMUSISOURMAP` readouts.

Agent32 then tested whether **complete donor words**, rather than initials, reveal the missing intended phrase, using precisely the named 41,654-word source. This is a different, fully executable original-cipher receiver, including a source-known **70/70 full-donor-word planted recovery**. The all-original lexical outputs have:

| Exact address operation | Original output words | Distinct words | Longest contiguous genuine Jung passage | Source-bigram score/word | Shuffled output upper-tail (400 draws) |
| --- | ---: | ---: | ---: | ---: | ---: |
| GP29 base29 | 2,896 | 935 | **3** | −1.738650 | 0.625935 |
| GP29 prime sum | 2,896 | 343 | **3** | −0.637957 | 0.351621 |

Individual outputs are valid English words because the decoder *always* reads from an English wordlist. Their order is no more coherent than permuting these same words, and neither output recovers a sustained phrase. [Full-donor-word inverse SFT](../sims/lp2_jung_fullword_address_original_sft.py), [completed Windows run 44994088888](https://github.com/FlareZ123/liber-primus/actions/runs/44994088888).

### 2. Recover an original Jung passage from unchanged printed word-length multisets

Suppose the author copied a **contiguous Jung passage** but encrypted or rearranged all whole words within each printed page, illustrated chapter, or even the entire book. If the printed word boundaries still preserve native GP29 word lengths, a source window with the same exact multiset of words lengths would be identifiable **without knowing any cipher key or ciphertext character identities**.

The [Jung passage inverse SFT](../sims/lp2_jung_multiset_source_inverse_sft.py) scans *every possible contiguous source passage* with each original containing segment's exact number of words, using both frozen native-GP transliteration lengths and raw Latin-letter counts. It compares 18 word-length bins and computes the exact minimum number of length replacements (half-L1) required to match. Targets: 55 original single rune-bearing pages, 54 adjacent pairs, 53 triples, 9 illustrator-defined chapters, and all 2,896 original whole-book words. **There are zero exact 2-page, 3-page, whole-chapter, or whole-book matches** under both source alphabets. The entire-book minimum is **308 length changes** under native GP (source start17,706) and **145** under literal Latin (source start16,850). These are fixed-source negative gates, not an exclusion of every possible source quotation or changed word boundaries.

[Successful original Windows run 44994331680](https://github.com/FlareZ123/liber-primus/actions/runs/44994331680), with exactly source-authenticated PDF and native shuffled-word recovery positives.

### 3. Frozen test of the strongest seemingly interesting near-match

Original physical LP2 pp0–2 (three cross-bearing pages; 158 words and 729 runes) have a **near** literal-Latin multiset match to 158 Jung words beginning at donor word28,657: **four lengths differ**. Eight fixed simple source-visible candidate whole-word orders were then evaluated: printed order, full reversal, three-column write/read and inverse, thirteen-column and inverse (red p0 13), and three-rail and inverse. The best, inverse-three-column, matches **33/158 word-length positions**. Over 1,000 random shuffles of exactly those source words, with the maximum across all eight candidates charged on each shuffle, the adjusted conditional upper tail is **0.045954**, median max27 and 95th percentile32. This is weak exploratory evidence after selecting a best source window from thousands of locations, **not** a decipherment.

A decisive independent original-chapter holdout then froze the donor location28,657 and same inverse-three-column operation. The immediately following hypothetical Jung donor chunks must match physical original p3–7 and p8–14. They do not: the next 255-word chapter at donor offset28,815 requires **44 different word lengths**, matching just **30/255** actual positions; the third 383-word chapter at offset29,070 needs **49** substitutions and matches **54/383** positions. Both fail the source-continuation condition without retuning. [Windows source and frozen holdout 44994331680](https://github.com/FlareZ123/liber-primus/actions/runs/44994331680), with synthetic exact 158-word three-column reconstruction positive. **Retire this near-match.**

## Decision and route back to plaintext

The existing first-letter and new full-word book-address rules, direct source-passage multiset inverse, and frozen three-column continuation test **do not recover LP2 plaintext**. These routes are now sufficiently discriminated to stop tuning same-title source offsets, GP prime powers, arbitrary page permutations or donor word choices. Original Cicada never explicitly named Jung; treat the same title as suggestive only. A new source-selected donor, independently written transformation, or authenticated original ciphertext/plaintext clue would justify a different test. Different book-cipher constructions and entirely new plaintext remain possible.

The accepted positive controls recover their exact intentionally planted source messages and demonstrate that the original-input failures are meaningful for their **specific** reversible candidate operations. Reproducers are read-only, operate on original GitHub resources and downloaded fixed-SHA source bytes, and ran on Windows Python3.12 with PyMuPDF. This report is a consolidated current interpretation, replacing the earlier unextended first-letter-only evaluation.
