# Direct transfer of the recovered 2014 14-position permutation to LP2

**15 November 2026 · Agent 41 · bounded original-source negative.** The recovered 2014 14-position row permutation is an authentic operation in a solved Cicada stage. Its direct reuse on LP2 p0–55 does not recover plaintext under either natural clock or either direction. This is distinct from the previously tested 2014-permutation-plus-p56-totient composition. No unknown LP2 plaintext, key, or intended destination was recovered.

## Upstream premise and human solve-path hypothesis

The 2014 first-three-page solve uses the 14-position order

\`[2,8,9,1,12,13,11,4,5,7,3,0,6,10]\`

to transform the 70-character source string

\`IDGTKUMLOOARWOERTHISUTETLHUTIATSLLOUIMNITELNJ7TFYVOIUAUSNOCO5JI4MEODZZ\`

into

\`GOODWORKULTIMATETRUTHISTHEULTIMATEILLUSIONJOINUSATFV7LYUCMEOZZD5J4ONIO\`.

A plausible human solver might recognize that 2014 operation and ask whether LP2 reuses it. The test applies the same fixed permutation to consecutive 14-rune rows. It introduces no new key, offset, phase, padding, or cipher layer.

The weakest premise is that a method used to solve the 2014 70-character message was intended to recur on the 2014 LP2 manuscript. No LP2 page or signed instruction selects that transfer. It is nevertheless an affordable, finite test of a recognizable historical operation.

## Decisive test

Original canonical source: \`resources/liber-primus/lp2-corpus.json\`, all 55 rune-bearing physical pages p0–p55 and all **12,956** GP29 runes. The rune-free p50 numeric table contributes no symbols.

Four variants were frozen:

1. Apply the 14-position order to each physical page independently (page reset).
2. Apply its exact inverse to each physical page independently.
3. Concatenate all rune-bearing pages in physical order, then apply the order continuously in 14-rune rows.
4. Apply the inverse continuously.

For page-reset variants, every page begins a new 14-rune row. For continuous variants, the row clock does not reset at page boundaries; the final incomplete row is left unchanged. In every case the incomplete tail is preserved rather than padded or guessed. Both permutations are exact inverses, and all page and whole-book round trips are asserted.

The script also checks the actual 2014 70-character positive control against the recovered output, and compares transformed LP2 against the untransformed original and the independently solved p57 English control. Language scoring reuses the repository's fixed Emerson GP29 trigram model; it is a diagnostic, not a proof by itself.

## Results

Language score per rune; higher is more English-like.

| Readout | Score |
|---|---:|
| Original p0–55, unchanged | **−6.643666** |
| 14-position order, page reset | −6.689945 |
| Inverse, page reset | −6.714109 |
| 14-position order, continuous book | −6.714299 |
| Inverse, continuous book | −6.692613 |
| Solved p56 ciphertext control | −6.467976 |
| Solved p57 plaintext control | **−2.351781** |

The best individual page result is p55 under the forward page-reset order at **−6.140983**; the best inverse page is p40 at **−6.307371**. Neither resembles a readable GP-native passage. All four whole-book variants score slightly worse than the untouched ciphertext. The strongest prefixes remain random-looking rune sequences, not words or coherent plaintext.

The historical positive control passes exactly: 70/70 characters decode to the published 2014 output, and the inverse restores the original 70/70. The LP2 forward/inverse round-trip assertions also pass, confirming the implementation rather than a decryption.

## Decision

Retire the **direct 2014 14-position permutation alone** as an LP2 decipherment under these two clocks and both orientations. The previous [2014 permutation plus solved-p56 totient gate](historical-14column-totient-composition.md) separately found no prose across all original unknown pages and its complete tested literal-F masks. Together these tests close the simplest direct reuse and the simplest known-p56 composition; they do not rule out an independently source-selected multi-layer use of the 2014 operation, another key, or missing historical material.

Do not spend more compute on phase/offset variants of this transfer without a new LP2 clue selecting them. The causal next step remains an author-specified LP2 receiver/key or recoverable historical artifact, not more transformations of the same 14-position order.

## Reproduction

From repository root:

\`\`\`sh
node sims/lp2_historical14_direct_permutation_gate.cjs
\`\`\`

The standalone Node 22 script uses only the canonical corpus, the pinned Emerson control text, and the existing exact \`rowPermute\`/language-model helpers in \`sims/historical_solve_path_transfer.cjs\`. It prints all 55 page scores, source-preserving tail lengths, four whole-book scores, exact historical positive-control checks, and exact round-trip assertions.
