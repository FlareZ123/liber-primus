# Exact affine Hill-4 private key recovery by word projections (p21)

Distinct from the chapter-wide histogram theorem: here each page may have an independent affine matrix and phase. For a complete word at printed offsets, each inverse row supplies every fourth plaintext rune. The 29,081 distinct lexical forms from TextBlob plus exact solved native forms define a set of permitted projections for each row and word. Each row's 25,260 projective directions × 28 scales × 29 offsets = 20,511,120 possibilities are enumerated exactly. Affine normalization of projected tuples reduces candidates without dropping any; the bit-parallel version propagates exact counts of exceptions. Then joint DFS uses dictionary projections onto increasing row masks, a shared whole-word exception budget, and linear independence. At full rank it verifies complete words. Fringes and words crossing the page/phase boundary are left arbitrary. No n-gram cutoff or beam.

Original p21 was selected for its seven >=9-rune words. For budget 3, all phases:
| phase | complete words | possible rows (lanes 0..3) | compatible full keys |
|---|---:|---|---:|
| 0 | 54 | 17,130,391,6 | 0 |
| 1 | 53 | 152,447,9,25 | 0 |
| 2 | 53 | 387,9,27,154 | 0 |
| 3 | 53 | 13,22,151,429 | 0 |

No two rows in the selected order can coexist within the global budget. Budget 2 at phase 0 yielded 1,5,15,0 rows, cross-checked with full unaccelerated affine search. The bit-parallel implementation reproduced phase 0 budget 3 exactly; other phases were run using the earlier exact orbit-union implementation.

Native positive control: actual 272-rune contiguous solved welcome passage (words 3..70), full-rank matrix [[1,3,6,4],[2,1,3,8],[7,5,2,3],[4,2,9,7]], offset [1,11,7,5]. Deliberately remove GREAT/JOURNEY/TOWARD from dictionary, three unique occurrences. Solver recovers a unique full key, all 272 runes correct, three exceptions. It uses no planted key or plaintext in search. This is recovery calibration, not a claim of an original solution. In native leave-one-section-out dictionary checks, 54-word windows from welcome (71), first koan (155), loss of divinity (128), later koan (35) have maxima 2,1,2,0 OOV words, respectively. Short specialized wisdom section has 10/31 missing, so this is a conditional exclusion of p21 under <=3 OOV words, not universal over all possible texts. Actual original words may be unconventional or carry changed boundaries.

Reproduce `node sims/lp2_hill4_private_lexical_rows_sft.cjs 21 PHASE 3` for 0..3, or `node sims/lp2_hill4_private_lexical_rows_sft.cjs plant 0 3`. Results are separate JSON files in im-results. Original and plant executed through V8; final bitset variant cross-checked on one original phase, not independently run on Windows. 
