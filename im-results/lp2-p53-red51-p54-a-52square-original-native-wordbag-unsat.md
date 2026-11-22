# Terminal red script and enlarged A: exact whole-word GP29 permutation obstruction

**Agent27, 22 November 2026. Classification:** original-source finite-native-dictionary impossibility for all pure red51 GP rune transpositions even with arbitrary plaintext word spaces, plus all 26 one-rune padding choices in the enlarged-A 4×13 square when preserving the twelve printed word lengths. No unknown-page plaintext, creator key, or final puzzle destination recovered.

## Original visual puzzle-design premise

Physical LP2 p53 (`resources/liber-primus/70.jpg`) ends with exactly 51 RED GP29 runes at original page offsets128..178 and a red **13-dot** terminator. Immediately following, physical p54 (`71.jpg`) begins with one **enlarged red A** (GP index24). Thus `51+1=52=4×13`, a perfect four-row/thirteen-column rectangle. A human solver could try transposing these original symbols by rows/columns, perhaps discarding the oversized A as a terminal pad. That route should be tested before investing in arbitrary column permutations.

The 51 p53 red runes form **twelve complete printed words** with original GP rune lengths exactly `[5,4,4,11,2,3,2,6,5,5,2,2]`. The first three lengths sum to13. These original source constraints are checked against the independent literal transcription, not inferred from a proposed plaintext. The source red rune multiset contains **no E, OE or Y rune**. Its exact ordered equal-letter-pair count is **76 out of 51×50=2550**, hence **IoC 0.02980392156862745**. A pure transposition preserves this complete 29-symbol histogram and its IoC.

## Exact integer-programming decision

Define `h[r]` as the original histogram of source GP rune ordinal `r`. For every source-native GP word type `w`, let `v_w[r]` count the occurrences of each rune in that word. An integer multiplicity `x_w≥0` selects how many times it appears in the hypothetical plaintext. Necessary conditions for **any** transposition forming twelve complete words are

\[\sum_w x_w v_w[r]=h[r]\quad\text{for all }r\in\{0,\ldots,28\},\qquad\sum_{w:\,|w|=L}x_w=n_L.\]

The original required word-count vector is **`n₂=4, n₃=1, n₄=2, n₅=3, n₆=1, n₁₁=1`**. This integer system covers all possible word orders, all column orders, and all pure permutations of original ciphertext rune positions without searching any permutation. A proof of infeasibility is therefore a source-language exclusion for the *entire* family, independent of whether the transposition key is known.

The pinned lexicon merges TextBlob English words, Shakespeare, Gibran, Emerson, Blake, Hapgood and **181 complete original solved-LP1 native-GP rune words**, retaining native `ING` and `IO` rune symbols. It has **14,046 distinct GP word encodings in the six required rune lengths**, of which **5,015** individually fit the actual 51-rune source histogram. SciPy 1.17/HiGHS mixed-integer solver found the complete 29-rune + six word-count equality system **infeasible (status2)** on the original 51-rune ciphertext. It did so in 0.719 seconds. This is exact finite-lexicon integer infeasibility, rather than an English-looking score or a failure to find a word by heuristic search.

### All 26 possible padding symbols in the original 4×13 rectangle

The enlarged original p54 A is appended to the 51-rune p53 red multiset, giving 52 physical GP rune symbols. If the 4×13 square is a transposition carrier that drops **one arbitrary** symbol as a pad, the destination plaintext histogram is that 52-rune histogram minus exactly one original symbol. There are **26 distinct symbol values present**, so all possibilities are finite, source-defined, and exhaustive. For each removed value, the code regenerates all compatible source-native word encodings, constructs the same full integer problem with precisely the original twelve printed word lengths, and runs HiGHS. The answer is:

| Source-frozen case | Exact solver result |
|---|---|
| Original p53 red51 as printed (equivalent to deleting the extra p54 A) | **INFEASIBLE**, 5,015 eligible native-GP types |
| Full p53 red51 + enlarged p54 A, delete each of the other 25 distinct possible rune values | **25/25 INFEASIBLE**, independently regenerated eligible types |
| Entire 4×13 carrier, arbitrary single deleted source rune | **26/26 INFEASIBLE**, zero solver timeouts and zero feasible cases |
| A planted 51-rune twelve-word source-English bag with exactly the same printed word-length multiplicities | **FEASIBLE**; source-native 12-word integral witness is recovered and all 35 integer equalities replay exactly |

These results rule out every 4×13 row-to-column, column-to-row, route, spiral, arbitrary column permutation, or other **rune-permutation-only** decoding of the frozen source 52-square **with exactly one padding rune omitted**, provided the output is twelve complete words from this native-English dictionary with the source-printed word lengths. There is no need to attempt individual route keys. This also rules out any unknown pure permutation applied to red51 alone under those source-printed spaces.

## Stronger original red51 result with all word spaces free

To challenge the weakest assumption in the twelve-word result, a second integer problem **removes all six printed word-length equations** and permits **any number of native-GP dictionary words of any length from 1 through 51**, including repeated words, in any order. It retains only the 29 independent source-histogram equalities `Σ x_w v_w[r]=h[r]` over nonnegative integer word multiplicities. The source corpus now contains **25,834 distinct GP word types across all possible lengths**, of which **7,683** fit the original red51 histogram individually.

**HiGHS again proves the original p53 red51 histogram INFEASIBLE (status2 in 0.738 seconds)**, with no arbitrary word spaces, no fixed number of words and no imposed original word lengths. The independently source-native planted 51-rune word bag remains integer-FEASIBLE with a complete 29-symbol exact reconstruction. This means that **no pure rune permutation of the original 51 red ciphertext symbols can produce any concatenation of dictionary-recognized source-native English words, regardless of how spaces are inserted**. That is a materially stronger obstruction than the original twelve printed lengths.

This unrestricted English word-bag exclusion applies to **p53 red51 as printed**. The separate enlarged-A 52-rune square plus arbitrary one-symbol removal has been exhaustively excluded only when preserving the original twelve word-length groups; no arbitrary-spacing claim is made for those other 25 padding choices. Exact matching [Windows Python/SciPy PASS 44983123877](https://github.com/FlareZ123/liber-primus/actions/runs/44983123877) includes original status2, exact positive planted status0, and the unchanged original 26/26 printed-word-square negatives.

## Independent source-native frequency calibration

Compare the source red51 collision count76 against every consecutive 51-rune window (overlapping windows are not independent) in the authenticated source-compatible reading texts. **0 of 604,917** windows have as few ordered equal-rune pairs, with minimum counts Shakespeare84 (217,056 windows), Gibran88 (62,442), Emerson82 (321,277), Blake92 (1,951), and Hapgood90 (2,191). Separately, all 705 literal 51-rune windows in solved-LP1 original source exceed original red51's IoC, with a minimum count104. These are descriptive controls, not independent-sample p-values; they corroborate the exact dictionary constraint without proving universal language impossibility.

A matched internal encrypted-manuscript baseline provides an essential interpretation limit. Among **10,206** 51-rune windows wholly inside individual original unsolved LP2 pages p0–p55, **2,239** have fewer than 76 equal-symbol ordered pairs and **654** tie it. Thus original red51 is at roughly the **25th percentile of the LP2 ciphertext distribution**. It is unusual only relative to native-English prose controls, and there is no evidence that the author specially flattened the red passage.

## Reproduction and next decision

Code: [`sims/lp2_p53_red51_native_wordbag_milp_sft.py`](../sims/lp2_p53_red51_native_wordbag_milp_sft.py). It reads and asserts original page/transcription/red-span data, builds all source-native word types from repository-local files, tests a true planted English-GP word bag, then exhausts the original 51-rune case and all 26 possible 52-square one-rune padding choices. The generic single-purpose Windows Python3.12 SciPy1.17 CI workflow is [`.github/workflows/agent27-p53-red51-wordbag-milp.yml`](../.github/workflows/agent27-p53-red51-wordbag-milp.yml). Source-original matching **Windows CI PASS [44982246848](https://github.com/FlareZ123/liber-primus/actions/runs/44982246848)** confirms all 26/26 status2 and a valid planted status0 witness. The broader dictionary original-only predecessor also passed in [run 44982096014](https://github.com/FlareZ123/liber-primus/actions/runs/44982096014).

**Decision:** eliminate all direct pure rune transpositions into source-native English words for original p53 red51 **even with arbitrary new word breaks**; also eliminate the enlarged-A 4×13 carrier under every possible one-rune pad with the twelve source-original word lengths. A full-letter monoalphabetic substitution plus transposition also preserves low coincidence but can change individual rune symbols, so the exact word-bag contradiction is **not** valid for that larger family. The result remains conditional on this broad *finite* source-native word inventory and English original word spaces; a non-English or deliberately lipogrammatic text, multiple symbol substitutions, inserted/removed symbols beyond the one page-selected pad, or an arithmetic/polyphonic cipher could evade it. New work should look for a creator-selected symbol-changing operation or external source text before resuming transposition experiments.
