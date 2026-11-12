# 85 repeat-bearing LP2 words: direct GP-prime direction-key consumer

**Director #609, 12 November 2026 (Agent24). Result: original-source negative with an independently solved 85-rune target.** No source-selected direction/address rule, unknown LP2 plaintext, original key, original operation, endpoint or hidden instruction has been recovered.

## Observable premise and source-selected candidate

The 55 rune-bearing unknown LP2 pages contain **86 within-physical-page identical-adjacent ciphertext-rune events**. Assign an event to the complete original *printed word containing its second rune*, preserving original page order and carrying text across visual line/page wraps. Exactly **85 distinct printed words** contain the 86 events; one p27 word contains two. Separately, the genuinely solved LP2 physical **p56 is 85 GP runes** long. These equal numbers motivate one cheap **independent known-plaintext key test**, not an assertion of an intended link.

A signed 2016 Cicada message states that the book's **words** form a map and their **numbers** give directions; LP1 also identifies prime weights as sacred. The weakest unsupported premise remains the selection of *precisely the 85 duplicate-bearing words*: neither signed prose nor a printed instruction explicitly selects those words, chooses chronological order, or states that their prime sums key p56. We therefore test the simplest fully specified operation once, without fitting an alphabet or shifting an offset.

**Frozen readout:** For every distinct event-bearing original word, in first-event chronological order, sum its original GP rune **prime weights** and reduce the sum modulo 29. This gives exactly 85 digit symbols. Interpret them, without any rotation or permutation, as the **85-symbol additive GP29 key** for the independently solved p56: P(i)=C(i)−K(i) mod29 for all i=0..84. A human knowing GP29's prime legend can execute this word-number operation on paper.

## Original solved-page rejection

- Source parser agrees rune-for-rune with the original [canonical GP corpus](../resources/liber-primus/lp2-corpus.json) and the word punctuation in [the manuscript transcription](../resources/liber-primus/lp2-transcription.txt): **12,956** unsolved runes, **2,896** original complete words, **86** doubled adjacent events belonging to **85** source words.
- The first three event-bearing words have GP-index vectors [2,13], [28,19,21,14,14,12,23,17], [5,13,2,14,13,28,28]; their original prime sums are **48, 544, 369**, so this fixed key begins **19, 22, 21** after modulo29. The words are selected by the actual printed event locations; no symbol renaming occurs.
- The independently known authentic p56 plaintext is the GP-normalized 85-rune sequence of **AN END / WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO / IT IS THE DUTY OF EVERY PILGRIM TO SEEK OUT THIS PAGE** (the printed deep-web hash is not 29-rune plaintext). It reproduces the original 85-rune p56 ciphertext under the already established prime/totient scheme, so C(i)−P(i) mod29 is an exact known 85-position key oracle.
- The 85 event-word prime sums agree with this genuine original key at only **2 / 85 positions**; random independent uniform GP labels would match **85/29 ≈ 2.93** positions in expectation. The candidate p56 decryption has native-GP IoC **0.030812324930**, with no coherent English and fails **83** of the 85 independently known plaintext symbols. This is a complete 85/85 original-target falsification; no special exception to the actual p56 F position is introduced.
- An independent 85-GP-rune **synthetic plant** encrypts the entire known p56 plaintext with exactly the 85 event-word-derived key values, then recovers **all 85/85 plaintext runes** under this same inverse. A one-symbol deliberately wrong key fails. The plant checks the cipher and normalization without needing any unknown LP2 text.

## Research decision

**Retire this one complete 85-word chronological GP-prime-sum → 85-rune p56 additive-key mapping.** The source-visible 85-to-85 length coincidence and the signed words/numbers maxim are insufficient to license a different event-word order, first/last distance, phrase-length transport, or arbitrary secret arithmetic. Most importantly, **no original clue yet identifies duplicate-bearing ciphertext words as addresses**. The same issue does not warrant tuning a second word-numeral readout merely because the first fails. A genuine successor requires a specific original visual or signed instruction that identifies the event word subset, reading direction, output register and an independently decodable consumer.

Original-input and native positive reproducer: [Node.js CommonJS SFT](../sims/lp2_repeat_words_p56_prime_direction_sft.cjs). Its single-trigger Windows workflow is [here](../.github/workflows/lp2-repeat-words-p56-manual.yml) and the actual [GitHub Actions run #43267569331](https://github.com/FlareZ123/liber-primus/actions/runs/43267569331) validates the assertions.
