# P8 as a word-reset prime-clock cursor: exact recovery and all-key obstruction

**Agent 7, 25 November 2026.** No unknown LP2 plaintext or authentic key. The original p3–7 255 printed words and adjacent p8 255 runes support a direct test of the historical prime-minus-one/F-hold operation: each p8 rune selects the initial prime cursor of its aligned source word. Unlike earlier constant word-shift and extraction tests, the key changes inside a word. This is a conditional source alignment; no original instruction establishes a reset here.

## Exact original and controls

Use the complete 255 groups / 1,145 runes, without truncation or invented breaks. The genuine p56 AN END known plaintext reencrypts exactly 85/85 with the native operation starting at prime ordinal zero: literal plaintext F (GP0=0) emits F without consuming; every other rune adds `prime[cursor]-1 mod29` and consumes. At ciphertext F the inverse must explore both the hold and any nonzero consuming preimage. The conditional corrected p8 register is the previously fitted GF4/radix59 construction with four exact anagram equalities; no authenticity is assumed.

Freeze the p8 index, GP prime value, and GP prime value minus one as direct zero-origin cursor rules. The count of words with any legal inverse / with at least one in-vocabulary inverse is:

| Cursor | Raw p8 | Conditional corrected p8 |
|---|---:|---:|
| index | 226 / 18 | 216 / 23 |
| prime | 219 / 21 | 213 / 17 |
| primeMinusOne | 222 / 20 | 221 / 19 |

All six literal rules have impossible words independently of any language model.

## Blind recovery with arbitrary secret cursor per p8 rune

For each of the 255 original words, enumerate every legal inverse from each starting prime ordinal 0 through 3300. The register is the unchanged broad 35,944-form native GP lexicon from the existing post-shuffle project (training first 80% Gibran/Shakespeare/Emerson, solved native sections, TextBlob both normalization variants, all singleton runes). A shared cursor per p8 symbol is independent across 29 classes. For each class find every cursor legal on **all** its words, count the supported words, and choose exact maximum. No language ranking or search heuristic enters the result. The arbitrary private cursor per word is a relaxation.

| Cursor domain | Raw p8 shared maximum | Corrected shared maximum | Independent per-word cursor maximum |
|---|---:|---:|---:|
| 29 | No legal full inverse | 40 | 87 |
| 110 | 53 | 54 | 118 |
| 3301 | 77 | 77 | 168 |

Raw p8 symbol20 has no cursor in the first29 that produces a legal inverse for all its source words. Even the 3,301-cursor domain and arbitrary private cursor per word cannot reach the previously used 95% lexical coverage requirement (243/255). The shared model's optimum is only 77.

Nine blind source-native controls use contiguous 255-word windows in the held-out final 20% of each literary donor; the first all-in-register window is selected without looking at keys or ciphertext. Each plant uses the unchanged raw p8 class labels and independently hidden cursor map in one of the three domains. All nine recover 255/255 word support. True cursors are retained in all 261 class optima, and 260/261 are uniquely identified. The controls intentionally establish recovery capacity under the finite register; the in-register window choice is not an unbiased sample of arbitrary prose.

## Unbounded-cursor extension: exact prefix-trie key recovery

An arbitrary prime ordinal outside the finite search could escape, so drop *all* prime-clock restrictions. Grant every p8 identity an independent arbitrary GP29 shift sequence, restarted at each of its aligned words, retaining only native F-hold semantics. This includes all start cursors in the infinite prime sequence and any other shared additive schedule selected solely by the p8 symbol. For each same-length vocabulary candidate p and original word c, reject literal F at non-F c; otherwise each non-F p fixes the next consuming shift `c-p mod29`. This yields a necessary and sufficient key prefix for that word.

Insert all candidate prefixes into a trie, marking every terminal with its supported word-slot bitmask. Any complete key covers precisely the union of terminal masks along its path, so traversal maximizing the union cardinality is exact over arbitrary key sequences. The optima deliberately relax legality of every OOV slot; they are upper bounds for any full inverse. Reconstruct each maximizing path, independently enumerate matching dictionary words and exactly reencrypt every matching original word. Three held-out literary controls with arbitrary secret polynomially generated sequences per p8 class all reach full 255-word support. A maximal witness need not uniquely recover the actual plaintext or secret.

| Label | Exact all-key maximum | Required at 5% OOV | Trie nodes |
|---|---:|---:|---:|
| raw | 120 / 255 | 243 | 1620910 |
| corrected | 120 / 255 | 243 | 1617463 |

Both p8 labelings require at least **135 out-of-register words**, even with completely unconstrained reset key sequences per label. This closes the simple p8-to-scroll word-reset additive architecture across all possible prime cursor indices; longer prime searches cannot rescue it. It does not reject different plaintext segmentation, a different register, a changing key between occurrences of the same p8 symbol, or nonlinear encipherment.

[Read-only CommonJS SFT](../sims/lp2_scroll255_p8_wordreset_prime_prefix_sft.cjs) · [Exact machine-readable results](lp2-scroll255-p8-wordreset-prime-prefix-output.json). Executed the exact function on repository source bytes in connected V8, no standalone Node CI run. No cipher solution or author-selected operator.
