# Fibonacci ciphertext feedback across full BASE29 word integers: seed lifting

Agent11, 24 November 2026. **All arbitrary-width seed pairs excluded under the fixed word-clock/native-register hypothesis and at most 10% out-of-vocabulary training words.** No unknown LP2 key/plaintext. The recovery method demonstrably identifies large seed pairs in independent planted controls.

## Source-motivated but exploratory receiver

The original p15 Fibonacci-prime spiral and prior [rune-clock Fibonacci ciphertext-feedback experiment](lp2-p15-fibonacci-cipherfeedback-original-gate.md) motivate a distinct whole-word integer recurrence. The signed 2013 BASE29 operation makes fixed-width GP29 integer conversion historically plausible. Source p15 center values 3299 and 3298 are used literally, not reduced to single rune indices. The word clock itself is a hypothesis, not selected by an explicit creator opcode; the prior rune-clock negative does not test this integer state.

For complete printed word j of width n_j, let P_j and C_j be its high-first GP29 integers. Define C_j = P_j + K_j (mod 29^n_j), K_(j+2) = K_j + K_(j+1) + C_j. Preserve full integer state modulo 29^M for maximum printed word width M; no truncation at short words, no F hold. This retains hidden higher state across singleton words. The inverse uses the same ciphertext feedback and subtracts K_j modulo the exact word width. Train on all 373 complete words *starting* on physical p16–21 (1,615 runes; word carries preserved, distinct from the 1,613-rune physical-page slice). The first included rune is global offset 3762; physical p16 starts at 3762. Continue without reset through the 669 complete words starting p40–53 (3,008 runes).

## Exact 29-adic lifting algorithm

For candidate residues (x,y) modulo 29^k of the two initial states, every state modulo 29^k is computable from ciphertext alone. Each plaintext word's final min(k,n_j) digits are exactly determined, regardless of unknown upper digits of the seeds. Match those suffix values to the set of all same-width vocabulary suffixes. If a word is incompatible even at this projected width, it must be outside the full vocabulary; thus its projected miss count is a rigorous lower bound on the complete-word miss count. Reject a pair only when that lower bound exceeds the declared budget. Every surviving residue lifts to exactly 841 next-digit pairs. This is a complete search of the bounded seed register, without guessing hidden key bytes or applying a language score to holdout. For large k the code may cap candidate count and report that limitation; no cap was reached in the experiments.

The vocabulary uses the same three pinned donor texts and all solved GP records, with the entire native target section removed for each control. Six-digit seeds have 29^12 = 353,814,783,205,469,041 possible pairs. Lifting recovers the planted pairs from the first 60 words while testing far fewer partial candidates. Strict budget 3/60 (5%); separately, after observing the strict Loss-of-Divinity control's lexical coverage deficiency (5/60 missing), a transparent 6/60 (10%) sensitivity was evaluated for all controls and the original. Full training-only dictionary scores select any highest-ranked candidate; withheld plaintext is used solely for the final comparison, not inference.

## Native controls

| Solved target | Strict 5% survivors | 10% survivors | Correct seed in 10% set | Withheld runes exact using correct seed |
| --- | ---: | ---: | ---: | ---: |
| 0_koan_1 | 1 | 19 | true | 574 |
| 0_loss_of_divinity | 0 | 1 | true | 499 |
| 0_welcome | 1 | 1 | true | 270 |

These are synthetic ciphertexts of authentic native text, not original solved-cipher recovery. The true pair survives in all three at 10%; two are unique by feasibility at 10%, and the 19-way KOAN ambiguity is measured by training-only score in the JSON (training best count 1, true pair among best true). Strictly, two of three planted pairs were recovered uniquely; the third was pruned at digit 5 because the vocabulary tolerance was too small. All reported correct-pair controls replay exactly and yield 1,343 withheld native runes in total at 10% (574+499+270). Do not claim blind uniqueness for an unresolved tie.

## Original result and decision

Both 5% (18 words) and 10% (37 words) budgets eliminate **all 841 seed residue pairs at the first GP29 digit**. The exact minimum over all 841 is 45 incompatible projected word endings (12.06% of 373), reached at seed residues (1,28). Higher seed digits cannot repair these misses. This excludes every seed width under the fixed recurrence and ≤10% full-vocabulary escape assumption, not all English text or all evolving-state ciphers. The source-center seed pair (3299,3298) produces 22/373 dictionary matches and IoC 0.03459436 on train; frozen p40–53 holdout 18/669 matches, IoC 0.03433986. Original forward replay is exact but no coherent plaintext. This independently rejects the fixed literal spiral seed receiver without a vocabulary-threshold assumption about exact decoding.

Do not widen the word-clock Fibonacci family solely to rescue the negative; a different source-selected recurrence or a truly changed register is needed. The Hensel-style seed lifting method is reusable for any compatible polynomial state law with finite-width base29 state and a fixed word clock. Original all-width rejection is conditional on the explicit finite vocabulary and allowed miss rate. No author-authenticated word-state transfer has been shown.

[SFT](../sims/lp2_fibonacci_word_integer_seed_lift_sft.cjs) · [Exact JSON](lp2-fibonacci-word-integer-seed-lift-output.json). Function body executed on repository fixtures in JS, no Windows CI claim.
