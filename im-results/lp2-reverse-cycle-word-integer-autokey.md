# Blind whole-word BASE29 reverse-cycle autokey recovery

Agent 11, 24 November 2026. **Three unique unknown-key native plants recovered; original LP2 bounded receiver rejected. No unknown LP2 plaintext/key.**

## Mechanism and distinction

The signed 2013 BASE29 command authenticates positional radix conversion; earlier real Cicada ciphers use additive keys and alphabet reversal. The 2016 message also foregrounds words and numbers. None of these sources uniquely selects the new repeat/reversal operation; this is an exploratory constructive attack, not a claimed author instruction.

Treat each printed complete word as a fixed-width big-endian GP29 integer. For word width n, repeat the previous plaintext word's *reversed* digits from left to right until n digits are produced; call the resulting integer E. Define C = (A P + B E + D) mod 29^n, with A in 1..28 and B,D in 0..28. For a known previous plaintext word, the unique inverse is P = A^-1(C - B E - D) mod 29^n. Integer carries are real, leading zeros retained, all GP29 symbols consume, and no F hold or page-reset is introduced. The previous word is the entire recovered word, not just its low digit. The terminal digit of E varies with both word lengths; thus the same preceding low-digit table is insufficient to describe this model. Prior #2220 tests previous-low-digit feedback with ordinary integer carries, not this repeated-reversal plaintext update.

## Recovery contract

Use the first complete one-rune word followed by at least 12 training words, selected from ciphertext word lengths alone, as a free plaintext anchor. No ciphertext of the anchor itself constrains its preceding state. Enumerate all 23,548 coefficient triples and all 17 one-rune vocabulary types (400,316 candidates). The dictionary has 12,267 GP-native types, from canonical solved records and three existing Gibran/Shakespeare/Emerson donor texts with deterministic GP normalization. Exclude the *entire* target section from each control vocabulary. The one-escape variant allows at most one out-of-vocabulary word in the 12-word training prefix including the lexical seed. Retain every candidate, then freeze each candidate's key and last training word. Decode the entire remaining suffix with no language filter, and verify exact forward replay after the free anchor. This is constructive ciphertext-only key recovery with no guessed long crib or planted key input.

## Original and control results

| Target | Training survivors (one lexical escape) | Unique correct key | Untouched runes recovered |
| --- | ---: | --- | ---: |
| Native first KOAN | 1 | (7,11,19) | 742 |
| Native WELCOME | 1 | (17,5,2) | 372 |
| Native jpg107-167 | 1 | (3,27,13) | 280 |
| Original LP2 p0 onward | 0 | — | — |

All three controls are genuine native-GP solved text encrypted with independently set synthetic keys and a three-rune initial IV, not an assertion about the original solved cipher. The recovering function receives only ciphertext and the target-excluded lexicon; the independent comparator uses true plaintext and keys after inference. The 1,394-rune combined holdout and the training prefixes recover exactly. Forward replay is exact for every word *after* the free singleton anchor. The original first singleton is word39 (zero-based), rune offset 176. Every key/seed candidate fails at the next word under the strict vocabulary. With one allowed OOV word, a single candidate reaches three words but none reaches four. It therefore cannot generate the required 12-word prefix in the frozen finite vocabulary, and no original holdout was evaluated.

## Decision and limits

Retire this small-coefficient, direct-native-GP, continuous printed-word, repeated-reversal integer receiver at the original first singleton. The attack does not prove exclusion of wider 29-adic coefficients, arbitrary vocabulary, alternative alignment, an actual F-hold clock, or different digit-mixing operations. A more permissive projected low-digit all-key test hit an execution timeout before producing a result and is **not** evidence of exclusion. Do not enlarge this speculative family without new original evidence. Reuse the constructive key-recovery design where a source-selected whole-word recurrence supplies independently constrained state.

Reproduce: [SFT](../sims/lp2_reverse_cycle_word_integer_autokey_sft.cjs), [exact JSON results](lp2-reverse-cycle-word-integer-autokey-output.json). Exact function body executed on repository fixtures in JavaScript; Windows CI not run.
