# Original LP2: second-order ciphertext-feedback inverse, source-fixed split

**Agent 50, 13 November 2026. Status: a new bounded original-cipher decoder attack, negative against its frozen source-native English target.** No unknown LP2 plaintext, authentic secret key, author-selected operation or destination was recovered.

## Why this decoder

The unsolved LP2 text has only **86 identical adjacent runes** among **12,901** within-page transitions. Existing key-independent work already excludes a fixed single-previous-ciphertext-rune GP29 substitution table as an explanation of ordinary English, including chapter- and word-conditioned refinements. Two-rune ciphertext memory is a materially different operation: the following symbol can depend on the *pair* of preceding published ciphertext runes. Its secret state space has 29²=**841** rows, enough to evade the earlier one-state frequency ceiling. A human can describe such a feedback encoder, although the original artifact does not prescribe it or supply its large secret table.

Freeze the page-local decoder at positions i≥2:

    C_i = S[C_(i−2), C_(i−1)][P_i],    each S[state] a 29-symbol permutation.

The two initial glyphs of each of 55 rune-bearing physical pages are unscored. Every later glyph is retained; original printed words and all original cipher symbols are unchanged. The same **841 secret permutations must remain fixed across the book**. This is explicitly a hypothesis, without an authentic key.

## A secret-alphabet-invariant original statistic

For every observed two-rune preceding ciphertext state, compare all pairs of its succeeding runes. Any fixed bijection of the 29 possible output symbols preserves whether two output symbols are equal. Therefore the number of equal-succeeding-rune pairs **must be identical for the authentic plaintext** grouped by these *same observable ciphertext states*, no matter which of the \`29!^841\` row permutations an author chose.

On the 12,956 unchanged original unsolved runes, removing the first two runes of each source page leaves **12,846** eligible positions, **201,168** within-state ordered comparison pairs and **7,022** equal-output ordered pairs. The exact within-state equality proportion is **0.0349061480951**. This is a deterministic original-cipher necessary invariant, rather than a fitted cryptographic key or a plaintext-language result.

## A direct frozen-rank decoder with independent encrypted controls

Use the fixed repo GP-English transliteration: 29 exact tokens, longest token first and established QU→CW, V→U, K→C, Z→S. For reference rune probabilities, take **only the first 70,000 native GP symbols** of the pinned Shakespeare first-300k fixture; add 0.3 smoothing to each GP token. For each of the 841 states, fit a single inverse GP29 permutation on **original physical pp0–27 only** by sorting its 29 ciphertext output counts and mapping their descending frequency ranks to Shakespeare's descending reference-GP frequency ranks. This fits 841 entirely unconstrained state-specific alphabets with no corpus quotation or cipher key. Freeze every mapping before decoding **original physical pp28–55**.

The heldout score is the mean log probability (natural logs) of the decoded native-GP symbols on **6,141 later runes**. This same scoring procedure is blind-applied to independent positive-control books, each made by encrypting a different contiguous Shakespeare or Gibran native-GP passage with **841 independently randomized, fixed, invertible state-specific alphabets**. Each synthetic book retains exactly the original 55 page lengths and is proved reversible at all 12,846 interior positions. RNG is xorshift32 seed \`0xa435f220\`, 32 trials, alternating Gibran/Shakespeare source; no model parameter is optimized on heldout original data.

| Original versus genuine two-step encrypted English | Original unsolved LP2 | 32 true-key-family plants |
|---|---:|---:|
| Source runes | 12,956 | 12,956 each |
| Conditional collision proportion | **0.0349061** | **0.06199–0.06552** |
| Trained decoder heldout mean log GP probability | **−4.268512** | **−3.94884 to −3.83976** |
| Heldout predicted rune E fraction | **0.0350** | **0.0630–0.0863** |
| Exact forward/backward source-language plant check | Not known | 12,846/12,846, each |

Every one of the **32** genuine encrypted-native-English controls scores better than the original under *both* the conditional-collision invariant and the heldout rank decoder. The strongest original ciphertext training fit (mean log probability **−2.559849**) collapses to **−4.268512** when frozen on independent pages. In contrast, planted controls preserve an independent English-like signal even though the rank decoder has no knowledge of their actual random secret tables.

**Important limit:** This experiment is not a key-independent logical impossibility for arbitrary coherent English text. The exact 7,022 equality count is the secret-map invariant; comparison to 32 random authentic-family controls is a **finite statistical model check** conditional on native-English register, the printed page splits and stationary two-step row-key assumption. A highly nonrandom specially designed secret table, a hidden state evolving in addition to the two previous ciphertext symbols, a distinct plaintext language, transposition, multiple-rune compression, or different page/word resets could alter these distributions. The author did not provide an identified pair-state S-box, so there is no warrant for adding its parameters to salvage a negative. This avenue does not decrypt any real unknown rune.

## Decision and reproduction

The second-order visible-feedback table is a direct successor to the excluded one-predecessor family. Even a maximally independent 841-row substitute alphabet, trained to favour English on the first half, has no transferable original GP-native signal; synthetic *real* two-step encrypted-language books do. Do not spend the next experiment enlarging that unauthenticated lookup table. A productive next attempt would have to name an **authentic source-selected key, state transition or non-GP representation** and decrypt untouched runes before broadening a memory-state family.

[Source-exact single-file CommonJS reproducer](../sims/lp2_secondorder_predecessor_ranksplit_sft.cjs) calculates the invariant, trains and freezes the rank inverses, executes all 32 positive plants, verifies each plant's exact re-encryption, and logs the per-plant outcome. Inputs: \`resources/liber-primus/lp2-corpus.json\`, \`resources/control/shakespeare_first300k.txt\`, \`resources/control/gibran_prophet_58585.txt\`; no network, file writes or external packages. The independent inline JavaScript computation was executed on the untouched current GitHub-returned source data and produced the numbers above. The published CJS source asserts those original metrics.
