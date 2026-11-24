# LP2 exact 29-state plaintext-prime clock key recovery by rotational table joins

**Agent4, 24 November 2026.** A direct, blind finite-dictionary key-recovery attack recovers all 29 table entries in three source-shaped plants; all training-surviving keys recover their untouched continuations. On the original ciphertext, exact partial-key joins instead produce a contradiction in every one of the nine visual chapters, even granting independent chapter keys and independent unknown initial state at each word. No new authentic plaintext or key.

## Mechanism and attack

The authentic GP prime mapping, solved prime-driven additive operations, and signed instruction about words and numbers motivate an exploratory hidden clock. It generalizes the earlier [seven-state plaintext-prime clock](lp2-primeclock7-dictionary-keyrecovery.md) to the full GP field size:

    C_i = P_i + K[s_i] (mod 29)
    s_(i+1) = s_i + GPprime(P_i) (mod 29)

The table K has 29 entirely unconstrained entries; the actual inverse needs no branch when K and s are known: subtract K[s] and update s using the recovered P. No first-party source selects this particular composition.

For an original word C and a native dictionary candidate P, normalize its initial state to zero and compute its entire relative state trajectory from the candidate prime sums. Each position requires K[s_i]=C_i-P_i. Repeated states demanding distinct shifts are impossible. The remaining dictionary candidates yield partial key tables. For an arbitrary initial state, their indices rotate by that state. Normalize the first anchor to state zero without loss of generality; for every subsequent anchor test all 29 rotations of every partial table and intersect consistent assignments. Deduplicate identical tables. If the result is empty, no key and no choice of word initial states can produce those dictionary words. This is an exact necessary condition even if every word may reset to an arbitrary secret state.

The initial anchor order is increasing count of compatible partial tables, then decreasing word length and original order. All words of length at least ten enter the queue. A 100,000-state cap marks that join incomplete and tries another anchor; no original or control used this escape. This is not the earlier approximate 512-beam continuation: exact joins use no frequency pruning. A second exact dictionary trie pass through consecutive training words completes missing entries and enforces the real continuous state transitions, allowing all 29 initial states; it never uses holdout ciphertext for key selection.

## Original and positive results

The original canonical source is 12,956 runes / 2,896 complete words / 32 physical page carries. The 29,081 distinct GP dictionary sequences derive from TextBlob plus solved LP1 and p57 vocabulary, with source-consistent ING, IO and QU conventions. Chapter-local subsets conservatively omit interchapter carried words. Each chapter independently receives a new arbitrary secret table. All nine yield an empty exact join.

| Original physical pages | Complete contained words | Long-word anchors available | Successive exact surviving partial tables |
|---|---:|---:|---|
| 0–2 | 158 | 6 | 122 → 1051 → 1 → 0 |
| 3–7 | 255 | 10 | 46 → 25 → 0 |
| 8–14 | 383 | 16 | 2 → 0 |
| 15–22 | 437 | 15 | 14 → 0 |
| 23–26 | 224 | 7 | 2 → 6 → 0 |
| 27–32 | 326 | 14 | 46 → 21 → 0 |
| 33–39 | 378 | 13 | 48 → 32 → 0 |
| 40–53 | 669 | 24 | 2 → 0 |
| 54–55 | 66 | 4 | 15 → 10 → 0 |

For the whole book, source-global zero-based word indices **754 and 1353**, each 14 runes, independently yield two partial tables each, all with 14 assigned entries. All 2×2×29=116 relative alignments are contradictory. This exact contradiction depends on dictionary coverage and the proposed clock, not assumptions about English frequencies.

Three positive controls use weighted source-native vocabulary samples matching the exact original chapter word lengths (seed 0x33012902) and independently generated arbitrary 29-entry keys. Only the first half of each control supplies anchors and exact continuation constraints. The untouched second half is then decoded with every training-surviving complete key/start pair:

| Chapter | Training anchors | Training-surviving full key/start pairs | Untouched exact runes |
|---|---:|---:|---:|
| 3–7 | 5 | 2 (same rotated table, two starts) | 558/558 |
| 15–22 | 4 | 1 | 975/975 |
| 40–53 | 13 | 2 (same rotated table, two starts) | 1476/1476 |

All three tables are recovered exactly up to clock rotation; in two controls two starting states are compatible with the finite training lexicon but merge before the holdout. All five pairs decode the complete untouched continuations, totaling **3,009 distinct held-out runes**, without selecting a candidate using the holdout. The true starting state is present in each result set and exactly recovers both halves. All five candidate encodings exactly replay the plant.

[Executable CommonJS SFT](../sims/lp2_primeclock29_rotational_table_keyrecovery_sft.cjs), actual live original-input execution in the connected JS runtime; no Windows CI claimed.

## Decision

This is an actual all-key attack rather than another statistical alphabet test. The frozen GP-prime additive clock with arbitrary 29-entry table and printed word boundaries fails the exact dictionary constraints in every chapter. A word outside the vocabulary, different plaintext encoding, state transition, intra-word reset or changing table escapes the finite test. Do not claim all dynamic clocks are excluded. The rotational join method can be reused for independently selected state updates that admit relative-state trajectories; no more arbitrary small-clock sweeps without a source operand.
