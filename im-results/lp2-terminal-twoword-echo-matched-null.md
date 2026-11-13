# LP2 terminal two-word echo: original-cipher anchor and matched null

## Decision

The unknown LP2 text contains an exact two-word ciphertext recurrence. The complete three-rune words **ᛞᛄᚢ-ᛒᛖᛁ** occur together on physical p27 and again as the **last two words of physical p55**. Neither individual three-rune word occurs elsewhere in the 2,896-word unknown corpus. The original p55 image (archive 72.jpg) prints the second phrase immediately before the closing red dots; the first is on physical p27 (archive 44.jpg). This is a locked original-source phrase-local anchor. It is **not** unknown plaintext, an authentic key, or a source-prescribed state reset.

| Source object | Exact location |
| --- | --- |
| First two-word phrase | physical p27 offset 28; canonical word positions 1462–1463 |
| Repeated final two-word phrase | physical p55 offset 70; canonical word positions 2894–2895 |
| First six GP indices | 23, 11, 1, 17, 18, 10 |
| Unique repeated seven-rune substring | ᛞᛄᚢᛒᛖᛁᚫ, full-corpus global offsets 6555 and 12950 |

The seventh rune is ᚫ at physical p56 offset 0, the already-solved opening of AN END. This extension crosses a printed full stop, a page boundary and a distinct known cipher. The printed six-rune two-word phrase does **not** cross that boundary. A page-isolated seven-rune scan misses the repetition. The source transcription omits runeless physical p50, so its record 54 corresponds to physical p55.

## Source-native conditional rarity

The 2,896 original unknown words include **720 three-rune words in 704 distinct types**, with just fourteen types occurring twice and one occurring three times. The exact original word-length sequence has **184 adjacent three-plus-three word-pair slots**. Exactly **one ordered pair** repeats across all 184 slots; no pair identity was preselected.

Under a sharply defined null, randomly permute the existing 720 three-rune cipher words **among their 720 original three-rune positions**, retaining all empirical token frequencies and every printed word length/slot. For nonoverlapping adjacent-word edges the pair collision probability is

P_disjoint = [sum_(a!=b) (m_a)_2 (m_b)_2 + sum_a (m_a)_4] / (720)_4.

For overlapping consecutive edges it is

P_overlap = [sum_a (m_a)_3] / (720)_3.

There are **16,800 nonoverlapping** edge-pairs and **36 overlapping** pairs. The resulting exact expected number of duplicate ordered word pairs is **0.0000676538434737498**. By the first-moment union bound, the chance of observing *any* duplicate ordered pair in this particular matched null is at most **6.7654 × 10⁻⁵**. An exploratory 300,000-permutation experiment produced 24 collision-positive permutations, empirically **8 × 10⁻⁵**, consistent within sampling variation. The test avoids choosing the phrase's word identities after seeing it. The null assumes exchangeable three-rune word tokens and is **not** an authorship probability, a manuscript-wide selection-adjusted p-value, or proof that an enciphering state was reused.

The [CommonJS original-input SFT](../sims/lp2_terminal_repeated_wordpair_sft.cjs) recomputes the exact positions, layout, counts and first-moment bound, with seeded shuffle controls, using [canonical GP source](../resources/liber-primus/lp2-corpus.json) and [printed words](../resources/liber-primus/lp2-transcription.txt).

## Mechanism and next decision

The two occurrences lie on p27 and p55, the last pages of the two 28-page halves of the 56 unsolved physical pages. This coincidence does **not** validate a 28-page periodic or mirrored keystream. In the original-image physical-page map, the other 26 available (p,p+28) pairs have no shared five-rune substring. The length-normalized shared three-rune rate at page lag 28 ranks **21st of 55** possible page-distance bands. No independent half-book correspondence is apparent.

A different repository had already independently found the seven-rune match, and tested page/section key resets with 51 stream sources, page-as-pad candidates and low-complexity different-plaintext collisions, with negatives limited to their respective search domains: [Dukotah R44-R1](https://github.com/Dukotah/cicada3301/blob/master/liber-primus/analysis/round44/R1-key-resets/RESULTS.md), [R44-W2-A2](https://github.com/Dukotah/cicada3301/blob/master/liber-primus/analysis/round44/W2-A2-7gram/RESULTS.md), [R44-W2-C2](https://github.com/Dukotah/cicada3301/blob/master/liber-primus/analysis/round44/W2-C2-page-pairs/RESULTS.md). Their page label p54 maps to physical p55 here because they omit physical p50.

A useful future test needs **one independently sourced, fully reversible encryption operation** that predicts a plaintext and key/state for **both six-rune sites** without fitting this very repetition. Same-plaintext and different-plaintext readings have different implications and both remain open. The authentic solved p56 initial A can test a proposed continuation only if the proposed mechanism actually bridges that punctuation and page boundary. Avoid retreading those fixed 51 keys or tuning 28-page phases solely to explain this observed pair. **No unknown plaintext or key was recovered.**
