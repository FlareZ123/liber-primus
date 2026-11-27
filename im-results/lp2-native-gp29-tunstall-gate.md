# Fixed 841-leaf native-GP Tunstall receiver — original gate

**27 November 2026, #3130: retire the frozen direct pair-code transport.** It is reversible on all controls; two page frames are syntactically legal, but neither contains meaningful original text, no chapter frame is legal, and native plants do not reproduce the strong adjacent-equality suppression. No authenticated Tunstall instruction, plaintext, or key was recovered.

## Fixed representation

The historical BASE29 positional instruction and earlier binary payloads motivate a representation test, not an authenticated instruction to use Tunstall. This variable-to-fixed phrase code differs from the [fixed-symbol Huffman transport](lp2-native-gp29-canonical-huffman-gate.md), arithmetic interval coding and the prior standard compressed byte-file tests. Use the same pinned GP alphabet and source-native corpus as the Huffman test: LP2 blob `054f2a0f780b7d46901acbe3d9bf4f0ac1801165`, native solved records blob `1b064ef6d85819b7d96adaff31a82d1ec551598f`. Four independent named training records (WARNING, WELCOME, WISDOM, KOAN1; 1,636 runes) supply iid symbol weights with +1 Laplace. Expand the highest-probability leaf 30 times, all 29 children at each expansion; probabilities are compared exactly by integer cross products, ties by lexicographic GP order. Sort the 841 leaves lexicographically and emit each index in two fixed-width GP29 digits (most significant first).

The frozen [SFT](../sims/lp2_native_gp29_tunstall_sft.cjs) commit `2190ac8d255d66110274cb11a509411e174f1ee7` precedes original evaluation. Max leaf length is three. If a final native phrase stops at an internal node, append GP ordinal0 until reaching the unique leaf. Append one mandatory footer digit equal to the number of actual native symbols in that last phrase minus one; this allows the last phrase to end exactly on a leaf too. The receiver requires an odd digit count, at least three for a nonempty frame, a valid footer length and only zero omitted tail symbols. Empty native input has the distinct canonical frame [0]. All frames must re-encode exactly. The footer is an investigator-defined complete framing convention; no source selects it. Fixed frame scopes are the 55 rune-bearing physical pages, nine chapter intervals, and complete book, without trimmed ciphertext.

All 841 pair codewords are used: 29×29=841. Strict exclusion of repeat within the pair allows only 29×28=812 codewords, and strict exclusion of both repeats conditional on the preceding digit only 28²=784. Neither is a complete fixed two-digit 841-leaf receiver without a separately specified escape/longer code. No such independently sourced escape is known, so a rank transport is not tested or excluded here. Nonzero repeat probabilities are not subject to that strict capacity obstruction.

## Native recovery and repeat geometry

All 841 ordered two-rune plants recover, as do the five wholly held-out native records (LOSS OF DIVINITY, jpg107–167, jpg229, p56, p57; 1,343 native runes → 1,343 encoded digits including footers) and their five separately reset suffixes (674 native runes). The suffixes overlap the full held-out records; they are continuation/reset tests, not five additional independent donors. All ten malformed plants (missing footer or footer28) reject. Training bigram log gain over uniform is +0.554825…+0.692047 nats/rune for complete native held records and +0.584390…+0.771981 for suffixes. Sixteen seeded permutations of training weights serve as wrong dictionaries, not a search on original ciphertext: 28/80 wrong-dictionary plant parses are legal, zero exact, scores −0.505059…−0.051611.

Expected leaf length under the training iid model is 2.052614, or ~0.97437 digit/native-rune before the footer. The iid model predicts within-pair equality 0.0373430, across-pair 0.0346732. Actual held-native controls and original odd-length page/chapter frames (including those that later fail the footer) give:

| Scope | Within equal / opportunities | Across equal / opportunities |
|---|---:|---:|
| Native held records | 24/669 | 22/664 |
| Original odd-length physical pages | 21/3857 | 27/3825 |
| Original odd-length chapters | 25/3977 | 28/3971 |
| Two legal original pages | 2/272 | 2/270 |

The source scopes overlap and are not independent observations; the table is a descriptive comparison, not an iid p-value. The lexicographic direct pair output from these actual native donors exhibits substantially more repeats than the manuscript in both phases, so it does not explain the core suppression observation.

## Original frame and null decision

| Scope | Legal | Invalid length | Tail length | Nonzero tail padding |
|---|---:|---:|---:|---:|
| Pages | 2 | 23 | 27 | 3 |
| Chapters | 0 | 3 | 6 | 0 |
| Full book | 0 | 1 | 0 | 0 |

The two legal pages p11 and p25 (273 digits each) yield 301 and 304 native symbols, with log gains −0.312944 and −0.228727. Neither has coherent continuous prose; no original chapter continuation can pass the framing rule. The two legal parses are exactly re-encodable but that follows from the grammar; it is not key evidence.

Matched controls use 128 draws per odd-length frame, two fixed models (uniform GP29, symmetric repeat-suppressed Markov with repeat probability 86/12945), seed 0x3130babe. Among 4,096 page draws per model, 151 uniform and 167 low-repeat parses are legal, with score ranges −0.397390…−0.124484 and −0.435465…−0.148522. Among 768 chapter draws per model, 37 uniform and 21 low-repeat parses are legal. The two original legal scores are within both page-null ranges. No random or original illegal frame was language-scored.

[Full output](lp2-native-gp29-tunstall-output.json) preserves the dictionary, control lengths and geometry, original legal candidates, and matched-null summaries. The exact committed run function was retrieved and executed in connected V8; the standalone Node wrapper was not separately executed. Retire only the exact frozen direct pair/mandatory-footer receiver; no alternative variable-length escape, key-selected dictionary, or framing was selected by original evidence. No change to the established frontier.
