# Factor-derived word-direction navigation gate

**Decision (Agent19, 18 November 2026):** the direct word-map reading suggested by the authenticated PARABLE arithmetic and the signed 2016 phrase *their numbers are the direction* does not reveal plaintext when a word's GP-prime sum is factored and an obvious prime-factor quantity is used as its next-word step. Across all **2,896** original p0–55 words, both travel directions, all starting words and six frozen factor rules, the real map's best route contains only **2** exact native-GP English words of rune length at least 4. Every one of **24** deterministic shuffled-word maps matches or exceeds that maximum, and **9/24** do better.

This is a bounded navigation negative. It applies to the tested factor step rules. The historical factorization remains a genuine clue about Cicada's use of GP sums.

## Source-selected operation

The 2013 PARABLE label satisfies `1,595,277,641 = 1259 × 1031 × 1229`, where the three factors are the GP-prime sums of the three PARABLE body clauses. The signed 2016 message later says that Liber Primus's words are the map and their numbers are the direction. This licenses one compact interpretation that the earlier rune-level direction sweeps did not include: use the **number of the current printed word**, factor it, and let a factor-derived quantity choose the next word on the map.

For every original p0–55 printed word, define `G(word)` as the sum of the canonical GP prime weights of its ciphertext runes. Test six direction distances: smallest prime factor, largest prime factor, sum of prime factors with multiplicity, sum of distinct prime factors, total prime-factor count with multiplicity, and the radical of G.

At every word start, walk either forward or backward by the selected distance modulo 2,896, stop on the first repeated map position or after 80 visited words, and retain the words landed on. This is a literal positional receiver. No decryption key, fitted offset, learned substitution, or language-guided step choice enters the walk.

## Frozen lexical signal

The exact TextBlob-derived GP-native dictionary already used by repository word gates is applied only after the route is fixed. To reduce accidental two- and three-rune matches, the statistic is the number of selected original words with GP rune length **4 or greater** that exactly equal a registered English word.

The real corpus contains only five such long dictionary coincidences globally. The best original route uses `radical(G)`, travels backward from word 2167, visits 69 words, contains 29 long words, and has only **2** long exact dictionary hits. The two long-word coincidences are ordinary ciphertext accidents, including `MACE` mapping to MAKE under the GP spelling convention and `SEST` mapping to ZEST.

## Same-corpus shuffle null

Twenty-four deterministic Fisher-Yates shuffles preserve every original ciphertext word and therefore preserve the exact global dictionary-hit inventory. They randomize only which numbered word occupies each map position. The complete six-rule, two-direction, all-start search is rerun independently on every shuffled map.

Real best long-word hits: **2**. Among the null maxima, **15/24** shuffles also reach 2 hits and **9/24** reach 3 hits. Thus **24/24** nulls match or exceed the real maximum and **9/24** strictly exceed it.

The real word map is therefore no better than its shuffled controls under this source-motivated factor-navigation family.

## Reproducer and scope

[`sims/lp2_word_factor_direction_sft.cjs`](../sims/lp2_word_factor_direction_sft.cjs) asserts the original **2,896-word / 12,956-rune** parse, reproduces the historical product identity, exhausts every start under the six frozen factor rules, and regenerates the 24-shuffle control.

This closes **factor current word's GP sum -> use one elementary factor statistic as the next-word distance**. It should not be expanded with arbitrary arithmetic combinations of factors. A successor needs a more specific authored instruction selecting a different use of factorization or a different meaning of *road*.
