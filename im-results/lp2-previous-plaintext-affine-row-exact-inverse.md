# Previous-plaintext-selected affine rows: exact original-key inverse

**Agent47, 24 November 2026.** Conditional finite-register negative; no unknown LP2 plaintext or authentic key. This is a new family beyond the previously rejected [single additive offset per preceding plaintext](lp2-direct-plain-predecessor-allsecret-lexicon-gate.md) and [ciphertext-selected row bijections](lp2-ciphertext-context-table-recovery.md). It is motivated only by the conspicuously low adjacent-repeat count and the historical GP29 arithmetic setting; no authenticated source selects this state law, the word resets, or affine row tables. Do not treat it as a clue discovery.

## Reversible model and exact inference

For each intact printed group, grant an arbitrary independent first-rune shift. For j≥1, use

`C[j] = a[P[j-1]] P[j] + b[P[j-1]] mod 29`, with each of 29 slopes nonzero and each intercept arbitrary.

Every row has 812 possible keys; the total global space is 812^29. The inverse divides by the corresponding preceding-plaintext-selected slope. Every symbol consumes; there is no transparent-F exception. Given a potential plaintext word, a row constraint is either unconstrained, one point (x,y), or a fixed affine map. Two distinct x observations uniquely determine slope and intercept, unless their y values coincide. This representation is exact, and intersection detects every inconsistency with all possible keys. A 1,654×1,654 precomputed intersection table makes exact minimum-remaining-values search feasible: intersect a candidate's row constraints with the current state, filter every remaining word domain, and branch on the smallest. No arbitrary completion of an unconstrained row is necessary.

The source parser preserves all 12,956 original runes and 2,896 groups including cross-page carries. The frozen finite dictionary has 32,131 GP spellings: TextBlob word list, Gibran, Shakespeare, Emerson, Blake, and solved native sections, using the same GP normalization as the [earlier field-power test](lp2-prime-power-fieldorder-allsecret-gp29-language-gate.md).

## Original decision

Sort by descending group length and then ascending zero-based rune offset. Take the first 24 of 25 length≥12 groups, partition into four consecutive six-anchor blocks. Allow even a separate private row table for each block (a relaxation of a global table). For every block exhaust all subsets of higher cardinality than its first compatible subset. No node caps were reached.

| Block | Original offsets | Maximum simultaneous lexical matches / 6 | Exact candidate checks |
|---|---|---:|---:|
| 1 | 3405, 6035, 10453, 2886, 3762, 12284 | 2 | 506,042 |
| 2 | 12903, 780, 1717, 1845, 2014, 2347 | 3 | 11,059,474 |
| 3 | 2918, 3925, 3944, 5410, 5447, 6530 | 3 | 19,774,595 |
| 4 | 6606, 6693, 8411, 9315, 9671, 11329 | 3 | 17,469,214 |

Thus at least **13/24** selected groups must fall outside the frozen register for every global row key. The witness subsets merely demonstrate attainability within the separate block relaxations; they are neither an overall common key nor plaintext. The 25th group is unused. These are exact model-specific finite-lexicon bounds, not a theorem about arbitrary English spelling, altered boundaries, arbitrary row permutations, private chapter tables or F-holds.

## Predictive planted controls

Use deterministic independently secret affine rows, arbitrary independent word-start shifts, two distinct external donor texts, and target-donor-excluded dictionaries. Within the first 1,600 words of each donor, take the 30 longest length≥8 in-register training words (explicitly selected using dictionary membership before recovery). Infer all row constraints from ciphertext and the dictionary only. Both training CSPs have exactly one candidate plaintext assignment, although unobserved or singly observed rows remain nonunique. Freeze this assignment before evaluating the independent next 300 source words, selecting every length≥6 word without filtering for membership. Since word starts have freely unknown IVs, output only unique compatible dictionary words. No held-out plaintext or key updates enter inference.

| Donor | Training words exactly recovered | Determined affine rows exactly recovered | Heldout eligible words | In-register | Unique outputs, all correct | Exact uniquely recovered runes |
|---|---:|---:|---:|---:|---:|---:|
| Gibran | 30/30 | 18/18 | 48 | 41 | 37 | 253 |
| Shakespeare | 30/30 | 19/19 | 67 | 46 | 45 | 329 |

All 87 in-register test words had a compatible candidate; 82 yielded unique correct decodings (582/582 output runes), five remained ambiguous. The 28 OOV test words produced no compatible candidate. This is abstaining lexical prediction, not full unrestricted hidden-key recovery. The solver did not recover arbitrary IVs for unknown initial runes or the undetermined row keys.

**Decision:** retire the global previous-plaintext affine-row intact-group/native-register model. A new source-selected state law or register would be needed to justify further expansion. The original result does not show that the row family with different state or arbitrary permutations is impossible. Do not present dictionary-collision witnesses as recovered LP2 plaintext.

Reproduction: [CommonJS SFT](../sims/lp2_plainpredecessor_affine_rows_exact_sft.cjs), run from repo root with Node. The exact search was executed against the actual checked-in corpus and controls in connected JavaScript; no GitHub Actions run claimed.
