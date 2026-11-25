# Hidden true-word separator prime clock (#2689)

**Decision:** the frozen finite-lexicon hidden-space prime receiver has no legal path on p54 by its 18th original rune (zero-based index17). Two matched native controls recover exact restored word boundaries and all 152 frozen continuation runes. This is a conditional finite-lexicon result; arbitrary OOV spellings are not excluded.

## Model and independent source

The authentic p56 prime-minus-one schedule gives the consuming-rune shift and literal F hold. #2670 leaves decoy printed word boundaries possible. Freeze a different, explicitly speculative convention: before each noninitial *true* plaintext word, discard one consecutive prime-minus-one shift, whether or not its first glyph is F. Nonzero plaintext p emits (p+prime[j]-1) mod29 and consumes; literal F emits zero without advancing. Start at prime2, no other skipped values, resets, punctuation constraints, or use of printed words. Original physical p54–55 has 232+76=308 glyphs; a true word may straddle the boundary.

The dictionary is frozen from `resources/control/english_wordfreq_textblob.txt` using existing GP normalization (QU→CW, V→U, K/Q→C, Z→S, ING→NG, IO→IA, greedy digraphs), plus exact native word forms from `resources/external/relikd-solved-gp29-native-v1.json` excluding both donor sections. It contains 29,077 distinct rune forms and 72,173 trie nodes. No OOV is granted. Counts from both sources give word unigram probabilities; native words add one per occurrence. This is a finite lexical prior, not all possible historical orthography.

## Exact inverse

A DP state is (consuming prime cursor j, trie node z). At each cipher rune, either extend the current word or, if z is terminal, pay its word-end probability and advance the prime cursor once before starting a new word. At ciphertext zero, enumerate both legal held-F and nonzero consuming plaintext branches; at other runes, the only possible plaintext is (c−prime[j]+1) mod29 when nonzero. Restrict transitions to existing trie edges. Edge score is log(child mass / parent mass); word-end score is log(terminal mass / node mass). The sum of edge and word-end log probabilities scores one joint plaintext/segmentation prefix under the unigram model. The DP retains the maximum score at each merged state, so it computes the exact Viterbi (maximum joint path) prefix score, not a marginal likelihood summed over paths. Merging equal states retains the highest-scoring prefix without changing feasibility. The original reachability rejection at index17 is unaffected by this scoring distinction. No beam, width cap, or search over clock origins. The prefix DP fixes the best state at physical p54 end, including a possibly unfinished word; the suffix only extends that state and requires a completed last word. Reconstruct the boundaries and exactly re-encrypt the entire candidate including all discarded shifts.

## Control gate

Choose the first fully dictionary-covered, exactly 308-rune contiguous whole-word window from each of two independent held-out native sections, then hide all boundaries. Coverage conditioning is explicit: 15/43 matched windows in `0_koan_1`, 11/32 in `0_loss_of_divinity` meet the dictionary requirement. The latter's earliest length-matched window contains BEHAUIARS and BELEIUE outside the dictionary; its first covered window starts at word23. These controls establish conditional power, not robustness to historical misspelling.

| Control | Selected word indices, inclusive | Generated cipher F | Held plaintext F | Full recovery | Frozen p55-length recovery | Boundaries |
|---|---|---:|---:|---:|---:|---|
| Koan 1 | 0–87 | 15 | 3 | 308/308 | 76/76 | exact |
| Loss of Divinity | 23–101 | 13 | 2 | 308/308 | 76/76 | exact |

The full known-origin DP and independently frozen 232+76 prediction both recover the exact segmentation and plaintext. Sixteen independent deterministic uniform pads all lose their last legal state before the 232-rune cutoff (first failure indices 1–124). This gate does not estimate the rate for alternative encryption families.

## Original decision

On the first 232 p54 runes, every reachable finite-lexicon state is exhausted at index17. Peak state count is four. No original suffix scoring, key fitting, or alteration of the dictionary follows. No unknown plaintext or key is recovered.

A broader model allowing arbitrary spelling or a different hidden-separator clock remains mathematically possible; the native control coverage above warns against a universal claim. The particular frozen receiver is retired. A successor requires an independently selected source operation or an explicitly justified broader orthographic model, rather than tuning missing words to the original.

[Executable SFT](../sims/lp2_hidden_word_prime_clock_exact_sft.cjs) · [raw executed results](lp2-hidden-word-prime-clock-exact.json). Run `node sims/lp2_hidden_word_prime_clock_exact_sft.cjs` from the repository root. The same JavaScript function was executed against live repository source contents before committing; no new CI needed.
