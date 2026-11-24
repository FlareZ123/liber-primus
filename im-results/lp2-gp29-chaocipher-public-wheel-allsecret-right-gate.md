# GP29 Chaocipher: fixed public wheel, arbitrary private wheel

## Decision

The proposed two-wheel transfer does not explain the unknown LP2 ciphertext under ordinary native GP29 English. This is an exploratory, period-plausible mechanism, not an authenticated Cicada operation. The clear p57 uses the language of circumferences, the GP chart gives an ordered ring, and LP2 exhibits both low adjacent equality and near-uniform marginals. Byrne's cipher was publicly described in 2010: [Rubin's algorithm and reference example](https://www.chaocipher.com/ActualChaocipher/Chaocipher-Revealed-Algorithm.pdf). No first-party source prescribes Chaocipher.

## Actual inverse and all-right-wheel reduction

Let L and R be ordered wheels of n distinct symbols. For ciphertext c, find index j in L and emit R[j]. Rotate both wheels left by j; move left position 1 to midpoint m; additionally rotate the right wheel left once, then move right position 2 to m (zero-based). Encryption finds plaintext in R and outputs L[j] before the identical update.

For fixed initial L, the index sequence j is determined by original ciphertext alone. Both wheel updates operate on positions. If the unknown initial right wheel is R0 and the public identity wheel is I, decoding with I emits D such that the true plaintext is R0[D_i]. Induction: the right-wheel positional updates commute with fixed relabeling R0. Every one of 29! right-wheel keys preserves the equality partition and frequency spectrum of D. A cyclic rotation of L only rotates the corresponding initial right-wheel labeling. Under page resets, the weighted within-page equality count is invariant even with an independently chosen private right permutation on every page.

This reduces a dynamically changing cipher with a known ciphertext wheel to static substitution. A future independent left-wheel selector yielding a nonuniform D would enable conventional substitution recovery.

## Original source experiment

Input: all 12,956 GP29 indices on physical LP2 p0–55 from `resources/liber-primus/lp2-corpus.json`. Punctuation does not update wheels. Four left cyclic orders: chart GP, chart reversed, deduplicated literal p57 DIUINITY followed by unused chart runes in forward or reverse order. Both central insertion positions m=14,15 tested because 29 is odd. Clocks: continuous or fresh wheels at each physical page. No fitted right key. Exact forward re-encryption passes for every tested inverse.

| Left wheel | m | Continuous IoC | Page-reset within-page IoC |
|---|---:|---:|---:|
| GP |14|.034482711|.034565641|
| GP |15|.034492804|.034464345|
| Reverse GP |14|.034468174|.034452465|
| Reverse GP |15|.034449395|.034527499|
| DIUINITY + GP |14|.034475705|.034578147|
| DIUINITY + GP |15|.034462943|.034536878|
| DIUINITY + reverse |14|.034455675|.034683819|
| DIUINITY + reverse |15|.034466423|.034254875|

Native controls: 32 deterministic contiguous 12,956-rune windows per donor (seed 3301, Gibran/Emerson/Shakespeare, existing GP transcription conventions), encrypted with independently shuffled right wheels and recovered via identity-wheel reduction with exact relabeling. Continuous plaintext IoC ranges .059308–.061076, .060601–.062234, .058177–.061076; weighted within-page ranges .059711–.061630, .060719–.062862, .058316–.061571. All 96 controls separate from all original inverses. Authentic p57 plaintext planted through the mechanism recovers 95/95 runes after relabeling. The published 26-letter Chaocipher reference vector is reproduced exactly.

## Independent doublet consequence

At step i the left-wheel zenith after update is C_i. Hence C_(i+1)=C_i iff j_(i+1)=0; the event depends solely on the plaintext and evolving right wheel. The right wheel is driven exclusively by plaintext. Changing L cannot cure a doublet mismatch for fixed plaintext/right state.

The 96 native plants produce 397–477, 413–481 and 394–487 ciphertext doublets by donor. Original LP2 has 86 across the same number of continuous adjacent opportunities. These finite controls strongly disfavor the classic update even with an unknown left wheel, but are not an exhaustive theorem over all right wheels or plaintexts.

## Next decision

Retire the four fixed left orders, two insertion positions and two clocks for native GP29 prose. A new first-party wheel-order selector or distinct source-selected update is required before additional search. A secret right permutation cannot rescue any tested inverse. Arbitrary left wheels, non-native registers, latent F holds and other update laws remain outside the exact tested scope.

Reproducer: [agent43_gp29_chaocipher_allright_sft.cjs](../sims/agent43_gp29_chaocipher_allright_sft.cjs). Core computation executed on checked-in original data in the connected JavaScript runtime; no independent Windows CI claimed. No unknown plaintext or authenticated key recovered.
