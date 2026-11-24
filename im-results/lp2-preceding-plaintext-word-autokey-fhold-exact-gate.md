# Exact preceding-plaintext-word autokey contradiction (#2503)

**Decision: the frozen recurrence is impossible on the original first LP2 chapter, even with every possible preceding one-rune plaintext seed.** This is an exact original-cipher obstruction, independent of language and frequency scoring. No unknown plaintext recovered.

## Frozen cipher and distinction from prior work

The authentic 2016 message mentions words and their numbers; solved LP1 provides GP29 additive Vigenère and the transparent plaintext F convention. Neither specifies the word-fed mechanism; it is an explicitly exploratory candidate. The issue's #2467 reciprocal-state law, #2247 carried affine alphabets and #1329 word-number-dependent key pointers are different architectures. The present candidate uses the complete previous plaintext word itself as the cyclic additive key for the next complete word, resets its key phase at that word's beginning, and carries genuine split words across physical pages.

For previous plaintext word K of positive length, initialize t=0. For each plaintext rune p in the new word, emit

- p=0: c=0, leave t unchanged;
- p≠0: c=(p+K[t mod |K|]) mod29, increment t.

All numeric values are canonical GP0. This is the LP1 plaintext-F forward convention (it does not prohibit an ordinary non-F plaintext plus key from also producing ciphertext F). At ciphertext zero there may therefore be two inverse choices. For any observed c and active k, the exhaustive inverse is:

- if c=0, allow p=0 and no phase advance;
- if p=(c−k) mod29 is nonzero, allow that p and advance;
- no other branch is valid.

In particular a nonzero ciphertext equal to the active key rune is impossible. Unlike an ordinary additive shift, the F hold makes the symbol emitter locally noninjective at ciphertext zero and nonsurjective at nonzero c=k. No greedy assumption that ciphertext F is always transparent is permitted. The reachability calculation below includes every inverse branch, verifies each branch's forward emission, and does not need to choose a unique inverse.

The [pre-execution issue comment](https://github.com/FlareZ123/liber-primus/issues/2503#issuecomment-7122614068) fixed the p0–2 opening chapter, sign, F law, word clock and seed treatment before opening the original results.

## Exact original result

Read the original transcript, join line wraps and physical page carries, and verify all 12,956 runes against the canonical p0–55 corpus. This gives 2,896 complete printed words. The first chapter has 729 runes. The first complete word has length eight; treating its plaintext as the unknown seed gives 4,325 distinct native forms of length eight from the pinned 29,060-form GP lexicon. This conditions on the first plaintext word, with no prediction of its own ciphertext. The state set at each subsequent word consists of all plaintext words reachable under the above exact inverse, merged only when the entire current word is identical, since the next key depends solely on that word. There is no dictionary test on later words.

The **4,325 lexical seeds all die at word 57**, zero-based, before rune offset261 (inclusive length261 from chapter start). This finite result alone would leave out-of-vocabulary seed words possible.

The first original one-rune word is **word39, rune offset176**. Independently grant every possible plaintext rune 0..28 there, even those incompatible with prior words; this is a strict superset of all possible states. The reachability counts at the following complete words are:

| Word index | 39 | 40 | 41 | 42 | 43 | 44 | 45 | 46 | 47 | 48 | 49 | 50 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Possible plaintext states | 29 | 49 | 62 | 58 | 52 | 97 | 31 | 24 | 22 | 21 | 20 | 19 |

| Word index | 51 | 52 | 53 | 54 | 55 | 56 | 57 | 58 | 59 | 60 | 61 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Possible plaintext states | 16 | 16 | 14 | 3 | 8 | 4 | 2 | 2 | 2 | 2 | **0** |

The 111-rune witness includes the initial unconstrained singleton. It crosses the p0/p1 physical seam inside word58: word58 begins at global rune261 and has length six, while p0 contains 262 runes. Do not reset at that seam. At word60 only the following previous plaintext keys remain:

```
[10,4,16,25,19,24,25,20]
[11,4,16,26,20,24,26,20]
```

The actual next ciphertext word61 starts at rune283 and is `[5,4,2,27]`. Its first ciphertext rune5 cannot be transparent, so the decoder must advance once. The second ciphertext rune4 then equals the active key4 for **both** remaining states. Its only additive preimage would be plaintext0, which would have emitted ciphertext0. No inverse branch exists. This is the final explicit contradiction, at the second rune of word61.

Because every possible one-rune state at word39 was admitted, the witness excludes the specified recurrence on this original interval for **all** prior initial seeds, all vocabularies, languages and prefix hypotheses. No need to fit or score a paragraph, choose a seed dictionary winner or open a holdout. The full chapter cannot have an inverse.

## Native planted controls

Three disjoint 150-word segments of the solved native GP comparator were used as plaintext, with their first words supplied as known seeds. Forward encode all following words with the fixed law; the exact inverse state sets retain the true word at every step and end in a singleton true final state (this is not a claim of unique full trajectory).

| Plant | Encoded runes after seed | Plaintext adjacent equal | Ciphertext adjacent equal | Plaintext internal equal pairs | Ciphertext internal equal pairs | Max reachable states |
|---|---:|---:|---:|---:|---:|---:|
| 1 | 612 | 22 | 25 | 56 | 46 | 12 |
| 2 | 598 | 15 | 30 | 42 | 54 | 24 |
| 3 | 608 | 15 | 24 | 71 | 76 | 16 |

The source's 110 emitted runes after the first singleton have one adjacent equality, one within-word adjacent equality and five total within-word equal pairs. This small comparison is descriptive only; no statistical rejection is needed. Native singletons occur as GP0 A=24 and I=10 on these donors and produce differing ciphertext singletons. The original witness has one emitted singleton (GP0=15); granting every possible initial singleton state is the stronger exact argument.

## Reproduce and research disposition

`node sims/lp2_preceding_plaintext_word_autokey_fhold_sft.cjs`

Inputs: canonical `resources/liber-primus/lp2-corpus.json`, `resources/liber-primus/lp2-transcription.txt`, `resources/external/relikd-solved-gp29-native-v1.json`, and `resources/control/english_wordfreq_textblob.txt` (lexicon blob 140e1d22b5f8c45deddd2e8b25549d9d6307d938). Executed directly against fetched repository data; standalone reproducer commit aadbc3de020a0ff799d1c539bcc9ad71c0bd4265.

Retire precisely this preceding-plaintext-word cyclic autokey with plus sign and transparent-F clock hold, continuous complete-word framing. A different law without the F hold, a different sign, an independently selected intervening reset or a different interpretation of printed word boundaries escapes this exact obstruction; none is licensed by the result. The universal singleton gate is reusable for any proposed word-local forward state whose entire next key is determined by a single preceding word: if its emission is not surjective, propagate all possible singleton states and check for an empty reachable set before any costly language search.
