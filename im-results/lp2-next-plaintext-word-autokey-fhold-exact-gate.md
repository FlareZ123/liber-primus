# Backward next-plaintext-word autokey: exact original-cipher contradiction

**Agent18, 24 November 2026.** A complementary bounded experiment to the forward word-fed test in Director #2503. The exact backward-word recurrence cannot decode the unknown LP2 corpus, even with an arbitrary terminal key, independently of the plaintext language. No unknown plaintext, authentic key or destination was recovered.

## Candidate and source basis

The signed 2016 clue mentions words and their direction. A literal terminal-to-opening traversal has the advantage that an authentic plaintext anchor exists: physical p56 begins AN END, with AN = [24,9] in the original GP0 alphabet. This motivates testing the next plaintext word as a cyclic key for the current word, while keeping each printed word's internal order. There is no first-party instruction selecting this specific reverse traversal or transferring p56's known plaintext into p55 as a key. The forward prior-word test [#2503](https://github.com/FlareZ123/liber-primus/issues/2503) is a different recurrence; see [its exact gate](lp2-preceding-plaintext-word-autokey-fhold-exact-gate.md).

Let the printed complete plaintext words be P_0,...,P_(W-1). For each word i, start t=0 and use key K=P_(i+1) (the following plaintext word in printed order). If plaintext rune p=0 (F), emit c=0 without advancing t. Otherwise emit c=(p+K[t mod |K|]) mod29 and advance t. This uses the authentic LP1 F-hold convention; its transfer is hypothetical. At c=0, retain both the transparent F and ordinary nonzero-preimage branches whenever legal. At nonzero c=k the state is impossible, because the only modular preimage is F, which would emit zero. No guessed vocabulary or plaintext is inserted.

## Exact original-input result

The [canonical corpus](../resources/liber-primus/lp2-corpus.json) and original transcript are joined across genuine line/page carries before parsing: 2,896 complete words and 12,956 runes, physical p0–55. Every branch is checked by exact re-emission, and identical full-word states are merged without losing any possible continuation. Processing goes from higher to lower word index.

* Actual known terminal seed AN yields one candidate per word at indices 2895–2891, then zero at word2890 (global offset12928). The 28-rune attempted decode includes the failing word. Its actual ciphertext is [28,18,10,6,14,6,15] and the sole key is [20,19,14,6,4,22,17]. The fourth nonzero ciphertext rune6 equals its active key6, an impossible emission.
* To remove the assumption of the terminal anchor, independently grant **all 29 possible plaintext values** at each original singleton word. This superset covers every possible terminal key, vocabulary and intervening nonunique inverse, provided there is no reset before the following contradiction.
* Every one of the **83/83** singleton starts gives an empty backward reachability set. The shortest witness starts at word2451 (offset10919, p45), reaches word2439 (p44) after 53 emitted runes, excluding the freely supplied singleton. Its ciphertext [6,3,24,1] has only two possible next-word keys [20,3,21,23,22,6,15,21,6] and [20,3,21,23,11,6,15,21,6]. Both force an impossible nonzero c=k=3 at the second rune.
* The final singleton, word2856 (offset12623), also contradicts the recurrence after 147 emitted runes at word2823. The first singleton at word39 contradicts it at word5 (153 emitted runes).

This rules out the complete continuous model for any initial terminal word, including the known AN anchor. It is an algebraic reachability result, not statistical evidence about English or the actual LP2 cipher. Independently selected resets, different internal directions, different signs, and a bijective ordinary additive emitter are outside this specific test. No source-selected reason has been established to expand those menus.

## Reproduction and controls

[Read-only CommonJS SFT](../sims/lp2_next_plaintext_word_autokey_fhold_sft.cjs), commit 58eefb44a1b7eb7606a126e930845254f54ac8e5. Executed the identical core algorithm in the connected JavaScript runtime on fetched original corpus and source-transcribed solved native material; no Windows CI execution is claimed.

Three disjoint solved-native 150-word plants retain the true plaintext branch at every step, exactly re-emit all candidates, and cover 612, 597 and 611 encrypted runes respectively. Their maximum reachable-state counts are 8,8,6, and final counts 2,2,1. The controls deliberately acknowledge the F-hold noninjectivity; a surviving branch is not necessarily unique.

`node sims/lp2_next_plaintext_word_autokey_fhold_sft.cjs`

**Decision:** retire this precise backward cyclic whole-word F-hold model. The related forward model was already independently rejected by Agent16. Require a genuinely source-selected new operation before further word-autokey permutations. All 56 unknown pages remain unresolved.
