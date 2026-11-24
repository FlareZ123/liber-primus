# Exact adaptive fixed-insertion list inverse: all partitions, no original solution

## Model and exact reduction
This is an exploratory reversible adaptive-alphabet family, not a source-authenticated opcode. The 13/23 counts on p57 suggest testing fixed insertion ranks 13 and 23 (and one-based 12/22); no claim that those marks select this operation. For an arbitrary initial list of all 29 symbols, encrypt plaintext rank p by emitting list[p], removing it, then inserting it at fixed rank r. Decryption reads the current rank and applies the same update. A fixed arbitrary bijection from plaintext symbols to ranks is also considered below.

After emitting the first symbol, every possible list has that symbol at rank r, and every such list is attainable. Assign 28 persistent token IDs to the other symbols in ascending symbol order; the central token is distinguished. On a nonrepeat emission, swap token IDs attached to the previous central symbol and the newly emitted symbol. The accessed noncentral token keeps its original side of the center and moves to the adjacent end of that side. Therefore initial side memberships are fixed in token coordinates, while access sequence is determined by ciphertext alone. For a repeated access to a noncentral token t, let b be its bit and G the mask of distinct other accessed tokens since its prior access. Let M be the initial left-side mask (popcount r). Rank is exactly r-1-popcount(G&M) if b&M, otherwise r+1+popcount(G&~M). Immediate repeated ciphertext emits rank r. First accesses may depend on initial within-side ordering and are omitted, never guessed. Once all tokens have been accessed, the entire subsequent rank stream is fixed by M.

## Original LP2
Inputs: canonical corpus and master transcription, all 12,956 unknown runes and 2,896 word spans. The first 729 runes have 28 two-rune words whose ranks are determined independently of initial order. The TextBlob control lexicon yields 189 two-rune GP29 types (ING->21, IO->27, canonical Latin normalizations). Exhaustive two-rune intersection for direct GP ranks:
| zero-based insertion | exact partitions | survivors after first four pairs | final survivors |
|---:|---:|---:|---:|
|12|30,421,755|69,028|0|
|13|37,442,160|144,514|0|
|22|376,740|1,000|0|
|23|98,280|386|0|

The stronger all-secret global alphabet gate does not rely on that dictionary: all 83 original one-rune words have known rank events. Every possible partition for every insertion position 0..28 was enumerated, total 2^28 = 268,435,456. Minimum number of distinct ranks among the 83 singleton positions by r=0..28:
`27,23,23,23,22,21,21,21,20,20,20,19,20,19,20,19,20,19,20,20,20,21,21,21,22,23,23,23,27`.
Thus any fixed global output bijection still requires at least 19 distinct singleton plaintext symbols. All nine archived native solved sections together have only GP A and I as one-rune words, under the same apostrophe treatment. This decisively rejects the continuous fixed-insertion model for ordinary native plaintext preserving word boundaries, even with any secret starting list, insertion rank and global rank alphabet. It does not reject dynamic insertion, page-reset schedules, altered word boundaries, or non-native plaintext.

## Positive controls and reproducibility
Two plants use the first 448 complete-word runes of archived LP1 Koan 1, seeded shuffled initial lists, r=13/23. In each, all known rank events match the source exactly and the two-rune gate uniquely recovers the true side partition (local GNU C++17 masks 86484673 and 116850671; shuffle implementation may vary by standard library). No unknown initial within-side order is claimed recovered. The C++ experiment was executed locally with extracted canonical inputs, including all 29 rank minima and both plants. Companion JS source reconstructs and checks the canonical source vectors; C++ solver asserts the minima and positive recovery. Compile optimized C++17 and pass the executable path to the CJS runner; alternatively the JS script emits the input vectors. Neither original nor historical plaintext is asserted from this model.

**Decision:** park the entire continuous fixed-insertion family. Do not sweep initial permutations or global output alphabet keys. Source-selected dynamic state or changed segmentation would need a distinct justification.
