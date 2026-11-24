# Key-cycle packing lower bound from long printed words

Grant arbitrary start and direction for each word, literal-F bypass, and arbitrary common nonzero affine multiplier. A candidate dictionary word fixes a consuming shift sequence C-aP. Each length-seven contiguous shift substring, canonicalized under reversal, must occupy one of m forward starting positions on the shared cyclic key. A word with at least L non-F ciphertext runes occupies at least min(m,L-6) distinct such positions. If two words have no common possible seven-substring under a particular multiplier, their occupied start-position sets are disjoint. For any independent set in the exact pair-compatibility graph, m >= sum(L_i-6), provided at least two positive-weight words are in the set. Proof: if m is less than a member's weight, that member alone occupies every position, contradicting disjointness with another member; otherwise min(m,w_i)=w_i for every member. Maximize the weight by exact independent-set search, then minimize over all 28 coefficients. The result is a dictionary-conditioned all-secret lower bound, independent of clock state, word direction or actual period. It includes arbitrary word resets; a different wordwise affine multiplier, nonlinear alphabet, changed segmentation or an OOV anchor escapes the theorem.

Use up to 24 highest non-F-count words per section, all candidate native-GP dictionary words, every compatible transparent-F mask, and all 28 multipliers. An inverted signature index computes exact overlap edges; no probabilistic hash collisions (seven base29 digits fit exactly within JS integer precision). Control plants use authentic GP text and word-number phase/direction changes; their covered-anchor bound must not exceed true period at the actual coefficient. A bound involving OOV planted anchors is conditional and not used as a control failure.

| Case | Anchors | Min over all coefficients | Common independent-set bound | True period | Covered-anchor bound at true coefficient |
|---|---:|---:|---:|---:|---:|
| section1 | 24 | 50 | 31 | - | - |
| section4 | 24 | 81 | 48 | - | - |
| Emerson control m13 | 24 | 12 | 10 | 13 | 7 |
| LP1 control m29 | 24 | 17 | 17 | 29 | 15 |

[Part 1 raw results](lp2-wordrephase-keylength-packing-part1.json). Reproduce with `node sims/lp2_wordrephase_keylength_packing_sft.cjs`, optionally passing case names.

## Additional original sections

| Case | Anchors | Min over all coefficients | Common independent-set bound |
|---|---:|---:|---:|
| section2 | 24 | 64 | 44 |
| section3 | 24 | 91 | 65 |
| section5 | 24 | 58 | 33 |

[Part 2 raw results](lp2-wordrephase-keylength-packing-part2.json).

| Case | Anchors | Min over all coefficients | Common independent-set bound |
|---|---:|---:|---:|
| section6 | 24 | 77 | 50 |
| section7 | 24 | 72 | 47 |
| section8 | 24 | 101 | 77 |

[Part 3 raw results](lp2-wordrephase-keylength-packing-part3.json).
