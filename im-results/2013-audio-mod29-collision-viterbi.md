# Collision-only hidden-consumption test of the 2013 audio-derived GP keys

**Classification (10 November 2026):** source-constrained mechanism test with a validated positive control and random-key ordering controls. No LP2 plaintext was recovered.

## Hypothesis

The 2013 `AUDIO/761.MP3` source number factors as (1259cdot1031cdot1229). Modulo 29 the residues are ([12,16,11]), their product is 24, and (761mod29=7). Residues 16 and 24 have order 7; residue 11 has order 28. This motivates the fixed periodic keys
[
K_i=24cdot16^i,quad 24cdot24^iquad(	ext{period }7),
qquad
K_i=24cdot11^iquad(	ext{period }28).
]
The direct additive/multiplicative readings were already tested and failed (see [the cross-round key study](2013-audio-mod29-crossround-key.md)).

A distinct possibility is **collision-only hidden key consumption**: at each ciphertext position, the cipher may consume one extra key draw if using the current draw would reproduce the previous ciphertext rune. The skipped draw is admissible only when the current plaintext under that skipped key would equal the previous ciphertext. This is the same reversible rule used in the repository's other keyskip investigations, specialized here to a periodic key.

## Dynamic program and validation

For a key period (m), the Viterbi state is only ((	ext{next key phase},	ext{previous skip bit})), giving (2m) states. The previous two plaintext runes are reconstructed from the ciphertext, current phase, and previous skip bit; the algorithm therefore supports an unbounded total number of skips without an arbitrary skip cap. A skip transition is accepted only when the skipped key would have emitted the immediately previous ciphertext symbol. Each skip incurs the repository's 3.5 log-score penalty.

The language model is trained on the first 200,000 characters of the repository's Shakespeare control file (144,611 GP symbols). A deterministic 1,200-symbol English plant encrypted with the period-7 key and the same collision-only rule contained 38 skips; the Viterbi recovered **all 1,200 symbols exactly** and recovered the exact skip count. This validates the periodic-state reconstruction and traceback.

## Original LP2 result

The full 12,956-rune, 55-page unknown stream was tested under the period-7 factor-16 and product-24 keys, their reverse generators, both signs, and book-continuous / page-reset clocks; the period-28 primitive-11 key and its reverse were tested in the same way.

| Candidate family | Best GP trigram score (nats/rune) | Skips | Random-order control |
|---|---:|---:|---|
| Period-7 source keys | −5.77729 | source-specific | 20 random cyclic orders: median −5.76830, range −5.78612 to −5.75774; source ranks at 20th percentile |
| Period-28 source key | −5.74522 | 283 | 20 random cyclic orders: median −5.74029, range −5.75331 to −5.72129; source ranks at 30th percentile |

The random controls preserve the same key alphabet and initial value 24, and optimize over the same signs and clocks. For period 7 they also test the same four generator strides; for period 28 they test forward and reverse cyclic orders. The source-derived orderings are not exceptional; they score below the random-control medians. The decoded strings remain incoherent, with no sustained English passage.

The 20-order null is a coarse empirical calibration, not a formal p-value. Its purpose is to prevent the Viterbi's large hidden-consumption search space from making an ordinary key look significant merely because it can optimize a language score.

## Decision

The collision-only hidden-consumption extension does not rescue the 2013 audio-derived 7- or 28-period keys. Retire these fixed source keys under this rule; do not expand to arbitrary key permutations or unbounded key searches. The exact mod-29 cross-round relation remains a possible historical clue, but it is not a working LP2 key.

**Reproducer:** [`sims/parable_mod29_periodic_collision_viterbi.cjs`](../sims/parable_mod29_periodic_collision_viterbi.cjs). It reuses the repository's GP-English model, asserts the exact planted positive control, runs the source-key variants, and reports deterministic random cyclic-order controls.
