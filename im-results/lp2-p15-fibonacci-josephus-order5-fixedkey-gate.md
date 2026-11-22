# Page-15 spiral as a specific order-five alphabet key

**Research decision (18 November 2026): negative for a bounded source-construction hypothesis; no recovered plaintext.**

The original LP2 p15 image contains the red **3299** in a 4-by-4 number spiral. Its outward spiral is the absolute distance from 3301 of the primes at Fibonacci-numbered indices (the community's established decipherment of the square). Independently, LP2's conspicuous distance-five within-word coincidence has led to hypothetical **order-five mixed-substitution** mechanisms. Together these motivate one particularly simple human-constructible key candidate: choose a permutation of the 29 Gematria symbols by a cyclic Josephus read using the printed numbers, Fibonacci prime indices or the corresponding prime values. Group the resulting ordered alphabet into five successive 5-cycles with four fixed points. Such a permutation has exactly order five, without fitting plaintext or searching keyspace.

The [standalone source test](../sims/lp2_p15_spiral_josephus_order5_original_gate.cjs) freezes three operand sources, two traversal directions, four circle starts (0, 1, 14, 28), and both 5-cycle directions: **48 keys**. Extending the 16 source steps to 29 by repetition, and partitioning into five consecutive cycles, are **hypotheses** rather than Cicada-authored instructions. Each key's predicted within-word equal-adjacent ciphertext rate equals the bigram frequency of `p_previous = g(p_next)` in the given English GP register. An unknown, word-dependent base alphabet cancels, so this is a direct first-stage discriminator for **unrepaired** order-five alphabets.

| Frozen register | GP within-word bigram observations | Lowest predicted rate, 48 keys | LP2 observed rate |
| --- | ---: | ---: | ---: |
| Independent Shakespeare passage | 162,527 | 0.018157 | approx. 0.0063 |
| Earlier solved LP1 plaintext reference | 2,274 | 0.017590 | approx. 0.0063 |

Every proposed `g` misses the LP2 rate, by about threefold even at its best. In particular, none falls below 0.01 in either reference register. The script checks the 29-entry permutation and `g^5 = identity` property for each setting, reads only repository-fixed source files, and asserts the best rates.

**Implication:** The *specific* p15-Fibonacci Josephus, 5×5-cycle construction gives no cipher key and should not receive a dependent search for an unknown word-base or 2016 route. The test does **not** eliminate a different p15 alphabet derivation, a key changing by word, a genuine ciphertext-repair/preventer rule, or the broad 5-cycle model. Crucially, this is a candidate elimination, not an inference that the author intended this construction. Prefer original clue-selected operations that directly determine a decryption over extending this branch with newly fitted offsets.
