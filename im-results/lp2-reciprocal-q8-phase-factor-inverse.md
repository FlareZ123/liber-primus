# Reciprocal plaintext-autokey q8: constructive phase-factor inverse

**Decision:** [Director #2686](https://github.com/FlareZ123/liber-primus/issues/2686). Exact primer and withheld plaintext recovery on three independent native controls. Fixed original p54 prefix fails an **exhaustive maximum bigram score over all its eight Fehu schedules and every legal primer**. No unknown plaintext/key.

## Frozen receiver

At each consuming position the law is C_j=K_j−P_j mod29, with K_j=primer[j] for j<8, and P_(j−8) later. Plaintext Fehu (0) emits 0 without consuming or appending. Ciphertext 0 may instead be an ordinary consuming output. Printed spaces are ignored. Note that the reciprocal equation gives P_j=P_(j−8)−C_j, not an alternating-sign recurrence. For a fixed latent hold schedule the plaintext at each active phase r is its unknown initial primer value minus that lane's cumulative ciphertext sum mod29. The only forbidden consuming plaintext is 0. Thus all phase domains can be represented independently without enumerating 29^8 keys.

Fit scores use a native GP29 unigram prior (0.5 smoothing), bigram probabilities with 8 prior pseudo-observations, and no word boundaries. Train exclusively on warning, wisdom, second KOAN, instruction, p56, p57 native sections. The independent control target sections WELCOME, first KOAN, LOSS OF DIVINITY are all excluded. At ciphertext zero branch hold/consume; rank partial masks by sum of each lane's best unigram score plus held F contributions. Retain 4096 masks and solve the top128 completed masks. Given a fixed mask, bigram terms are unary or edges of the eight-phase cycle. Condition on phase0, use max-sum dynamic programming around the cycle, include the closing edge, and backtrack the exact maximum-likelihood primer. For the original 232-rune prefix only 3 zeros exist, so all 8 masks are solved exactly with **no pruning**. For controls the mask search is bounded, not globally exhaustive.

The prefix key and queue are then frozen. Held-out ciphertext is decoded with a bounded beam over only feasible zero branches. Full replay is asserted for each complete candidate. This is a statistical receiver rather than source authentication.

## Results (connected JS execution)

| Held-out native section | Prefix ciphertext zeros | True mask unary rank | Recovered key | Fit match | Held match | Fit score | Held score |
|---|---:|---:|---:|---:|---:|---:|---:|
| WELCOME | 20 | 3 | 8/8 | 232/232 | 76/76 | -653.737560 | -205.507406 |
| first KOAN | 21 | 1 | 8/8 | 232/232 | 76/76 | -588.023724 | -192.654517 |
| LOSS OF DIVINITY | 19 | 1 | 8/8 | 232/232 | 76/76 | -647.470673 | -203.579907 |

All three eight-rune primers were independently drawn uniformly using runtime secrets and pinned before the attack. Known-mask controls also recover the exact keys. The three deterministic independent-pad controls (retain literal F, replace each other rune by a reproducible independent uniform residue draw) attain fit scores -908.257657/-896.002025/-909.901071 and no legal continuation under their respective frozen best keys. Zero of three pass. This is a limited empirical calibration, not a formal universal false-positive probability.

Acceptance thresholds were frozen to worst native fit and held-out per-rune scores, respectively -2.8178343123845764 and -2.7040448161140906. Only after all three native controls pass and the independent pads fail is original ciphertext examined.

Original physical p54 (232) and p55 (76) come directly from the canonical corpus. Prefix has 3 zeros; all eight schedules feasible and examined with exact cyclic maximization. Best original score -939.6090625786151 (~-4.05004/rune) is below every genuine control and all three pads. Its primer [8,3,19,17,24,12,10,24], hold mask 6 (zero-index bits, two held), returns nonprose, and no legal 76-rune continuation exists from its frozen terminal state. The maximum score statement is exact over this prefix cipher family and this particular language model. The continuation failure is for the best prefix state only; it is not an all-keys algebraic infeasibility claim. Authentic English outside this finite model's statistical calibration is not mathematically excluded.

## Reproduction and next decision

[Node CommonJS SFT](../sims/lp2_reciprocal_q8_mask_phase_map_sft.cjs), commit 144ce8e5c6cbe6776b196503af99310140a7a077. Reads canonical native GP source and LP2 ciphertext. Actually executed in connected V8, no CI claim. Reuse the phase-factor construction for other source-selected additive-lane laws; do not retune q, signs, page resets or hold schedules to rescue this particular original result. No authenticated clue selects reciprocal autokey. Retire this fixed receiver on p54–55 after the powered negative. All 56 unknown physical pages remain unsolved.


## Exact language-independent extension: original p33–39

The consuming recurrence P_j=P_(j−8)−C_j mod29 allows direct domain propagation on the feedback queue. Each of its eight coordinates starts with all 29 values. A nonzero ciphertext block partitions into eight lanes; within a lane each cumulative ciphertext sum excludes that initial queue value because it would produce forbidden consuming plaintext F. Intersect the input domain with the complements of all these sums, rotate the remaining bitset by the negative final sum, then rotate the queue by the number of consumed positions. Each observed ciphertext zero is exhaustively branched as a hold or consumption. A consuming zero excludes input queue value 0 and rotates the queue. A fixed branch history has no cross-lane constraints, so nonempty domains are both necessary and sufficient. Empty domains terminate that entire branch. No lexicon or statistical assumption enters.

Canonical original p33–39 (1680 runes, 40 zeros) is **UNSAT for every possible 8-entry initial feedback queue and every latent hold schedule**. Exact depth-first traversal finishes at 294,213 nodes below the declared 1.5-million-node cap. Maximum zero-block depth 34. Binary search confirms a replayable 1278-rune prefix (21,790 nodes) and impossible 1279-rune prefix (294,213 nodes). Hence any continuous instance covering this interval, including book-continuous or this chapter-continuous q8 reciprocal plaintext autokey, is mathematically impossible under this clock. Arbitrary resets within the witness or other feedback laws are outside scope. The earlier p54–55 statistical negative is not an algebraic exclusion: all-hold has an exact nonprose witness with primer [2,0,3,1,9,0,1,6].

Validation: 80 deterministic toy cases (q1/q2) compared against direct brute force across all primers and legal hold histories; 73 SAT and 7 UNSAT, all agreeing. Three 308-rune native q8 plants produce 18/22/17 generated consuming ciphertext zeros respectively; all actual planted masks remain feasible and all three independent existential solver witnesses replay. The existential witnesses need not recover the true plaintext or primer. No new original plaintext recovered.

[Exact reachability SFT](../sims/lp2_reciprocal_q8_exact_mask_reach_sft.cjs), commit 3112119fc8eb4b66310286c58b20e0b47b870a33, executed in connected V8. No CI claim. This closes the continuous q8 reciprocal law over the witness without language-dependent evidence; prioritize source-selected alternatives instead of expanding this precise model.
