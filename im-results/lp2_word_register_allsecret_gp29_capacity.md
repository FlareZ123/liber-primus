# Whole-word GP29 register: all-secret printable-language capacity

**Agent 36; 22 November 2026.** Direct, source-native, all-secret exclusion of one class of *one plaintext GP29 rune per printed ciphertext word* decoders. Eight source-motivated word summaries are covered, even granting fourteen unrelated secret 29-symbol permutations indexed by printed word length. No original unknown-page plaintext, historical key, or Cicada destination was recovered.

## Why this is a causal cipher question

The 2016 signed Cicada clue emphasizes the **words** and **numbers**, while the original LP2 manuscript has 2,896 printed whole words with page-spanning words verified against the scans. One plausible human-readable operation is to summarize each printed word to a GP29 number, then decode that number through an alphabet selected by the word's length. This could yield a 2,896-symbol plaintext from the published 12,956-rune ciphertext without inventing arbitrary page breakpoints.

The source registers are computed directly from the unmodified canonical GP29 rune values and authentic printed hyphen/period boundaries. Page marker \`%\` and line marker \`/\` do not end a word. The parser stops after the exact 12,956 unknown runes to exclude the already-solved p56–57, and it asserts 2,896 source words and exact lossless re-concatenation.

Eight fixed, familiar one-rune summaries are individually tested: **first rune, last rune, ordinal sum mod29, GP-prime sum mod29, GP-prime product mod29, ordinal product mod29, ordinal XOR mod29 and alternating ordinal sum mod29**. Their selection is motivated by GP29 arithmetic and visible word boundaries; the original does not explicitly prescribe any of these as a key. We do not search arbitrary word-to-rune hash functions.

## Secret-key-independent upper bound

For each printed word length \`L\` from 1 through 14, write the histogram of its chosen summary \`r(word)\` among the 29 possible values. Grant an entirely arbitrary secret bijection \`sigma_L\` for each \`L\`. Regardless of the unobserved permutations, the largest possible total number of decoded plaintext runes belonging to *any chosen twelve-rune subset* is bounded by

\[
B_{12}=\sum_{L=1}^{14} \sum_{j=1}^{12} n_{L,(j)},
\]

where \`n_{L,(j)}\` is the j-th largest original summary-bin count for printed word length \`L\`. This is a direct rearrangement/majorization bound. The corresponding \`B_1\` bounds the most frequent single decoded rune.

The original 2,896 printed words have length-frequency counts **[83,448,720,513,317,256,216,156,78,52,32,18,4,3]** for word lengths1–14. Their all-secret bounds are:

| Fixed source word summary | Maximum most-common rune, \`B1\` | Maximum total of twelve common runes, \`B12\` |
|---|---:|---:|
| First rune | 161 | **1,536** |
| Last rune | 170 | **1,546** |
| Ordinal sum mod29 | 170 | **1,556** |
| Prime sum mod29 | 176 | **1,554** |
| Prime product mod29 | 424 | **1,715** |
| Ordinal product mod29 | 435 | **1,704** |
| Ordinal XOR mod29 | 224 | **1,630** |
| Alternating ordinal sum mod29 | 173 | **1,566** |

The historical [nine authentic solved-LP1 GP29 text records](../resources/external/relikd-solved-gp29-native-v1.json) contain 2,979 original source-native GP rune tokens. **All 84 contiguous 2,896-rune controls** have **2,233–2,241** runes among their twelve most frequent types (and **366–369** of their most frequent single rune). Therefore **even the most permissive of the eight original unknown-key models falls at least 518 GP symbols short of the least native original-LP1 control**. The unknown secret 29! permutations *cannot* bridge the gap: reassigning labels does not change a word-length class's sorted histogram.

The product summaries have conspicuous special residues, so their \`B1\` capacities can exceed native top-one counts. However, their **all-secret B12 remains far below native text**. This demonstrates why a single strong count or enticing numerical match is inadequate.

## Exact positive inverse and research decision

The source-read-only [CommonJS Node22 reproducer](../sims/lp2_word_register_allsecret_gp29_capacity_sft.cjs) asserts all original source lengths, all eight per-class \`B1/B12\` values and all 84 independent solved-native reference windows. It creates a genuine **2,896-rune solved-native text plant**, encrypting each output rune with an independent secret 29-permutation indexed by its *actual original ciphertext word length*. It fills the remaining ciphertext word positions to preserve all 2,896 source word lengths exactly. The matching inverse recovers all **2,896/2,896** native GP symbols. Under that genuine planted encryption, the \`B12\` source-invariant is satisfied as required.

**Decision:** Exclude those eight direct **one GP29 symbol per whole printed LP2 word** decoders for ordinary source-native English, even with fourteen unrestricted secret substitution alphabets. This result changes which route merits compute: further permutation-key searches or word-length-specific Caesar shifts for these registers cannot recover ordinary native text. Non-GP or compressed plaintext, non-bijective word-level symbols, multiple plaintext runes per printed word, word-order permutation, and dynamically keyed word summaries remain outside this test. The source does not choose such an extension; seek a genuine instruction before changing its model.

### A separate 256-word/table coincidence

The original book happens to contain exactly **256 six-rune printed words**, matching p50's **256 printed numerical cells**. This selects a clean 256×6 source register without arbitrary word splitting but remains **retrospective numerical alignment**. In a direct register test, assigning one word to each table cell in printed row-major order, GP ordinal sum and GP prime sum match the cell's byte value in only **1/256** positions each (prime sum modulo256 matches **2/256**); first/last-rune values, natural six-digit base29 values and reversed/column-major comparisons likewise supply no readable GP text or exact byte map. A candidate *index* interpretation of byte \`b\` into this 256-word register yields GP output IoC **0.03992** (first rune) and **0.03689** (last rune), without an independently typed instruction. Do not promote this matching count to a key, or commission dependent arithmetic sweeps absent a source-selected operation.
