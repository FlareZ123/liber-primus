# Authentic solved-Cicada prose gate on one frozen LP2 word-feedback inverse

**Agent39 · Director #2421 · 23 November 2026. Decision: negative on the sole previously frozen original candidate, with a useful limitation on scoring.** The exact original p16–21 and disjoint p40–53 output from Director #2417's two-edge ciphertext-feedback decoder is inconsistent with ordinary source-native GP29 prose under a fixed authentic solved-text recognizer. The recognizer also accepts period-available Crowley prose, so it cannot establish Cicada authorship or authentic decryption on its own. **No unknown LP2 plaintext, key or final destination was recovered.** [Original Windows Node 22 CI PASS](https://github.com/FlareZ123/liber-primus/actions/runs/45256254840) · [Complete read-only SFT](../sims/lp2_authentic_loo_prose_fib_feedback_sft.cjs).

## Frozen model, original inputs and independent positives

The original GP29 alphabet and 12,956 unknown source runes come from `resources/liber-primus/lp2-corpus.json` and `lp2-transcription.txt`. The nine source-solved records are `resources/external/relikd-solved-gp29-native-v1.json`, preserving published GP29 runes rather than silently translating them to a modern 26-letter spelling. Source-section records are editorial/community transcriptions, not physically re-verified author JPEG plaintext in this task.

Before the original inverse was scored, we froze a small word-local hierarchical 29-rune predictor: add-0.5 unigram baseline, with successive within-word bigram and trigram conditional updates of effective prior strengths 12 and 5. Its score is average negative natural log probability per GP29 rune, lower being more source-native. Each complete printed word resets the two-character context. No key, word dictionary, learned donor-language model, hidden feature search or fitted exception is included.

Whole solved units serve as independent cross-validation folds. The first **seven** solved records contain **2,799 runes**. Leaving out one entire unit each time yields scores as follows; a whole unit holdout is stricter than a one-page holdout for units spanning multiple pages.

| Left-out solved source unit | Runes | Nats/rune |
| --- | ---: | ---: |
| LP1 WARNING | 184 | 2.464153 |
| LP1 WELCOME | 515 | 2.407106 |
| LP1 WISDOM | 157 | 2.686747 |
| LP1 first KOAN | 780 | 2.341673 |
| LP1 LOSS OF DIVINITY | 755 | 2.543546 |
| LP1 second KOAN `jpg107-167` | 319 | 2.318638 |
| LP1 INSTRUCTION `jpg229` | 89 | 2.001335 |

The **frozen admissible prose threshold** is the maximum held-unit score plus **0.12**, yielding **2.806747 nats/rune**. This margin is a chosen calibration constant, not a p-value or a priori proof of author identity. Both completely untouched final solved records pass without altering it: authentic LP2 p56 (85 runes) **2.484936** and authentic p57 (95 runes) **2.262892**.

The original 2013-puzzle-related *Book of the Law*, chapter I, is independent historical **non-Cicada-author** prose, held in `resources/external/2013-book-of-law-I.txt`. It was mapped by the already documented deterministic 29-symbol Latin convention: V→U, K/Q→C, Z→S, ING→NG, and greedy GP two-letter tokens. Nine chronological text windows approximately matching the rune lengths of the nine solved source records score **2.47441–2.705675**, all passing the threshold (**9/9 false authorship accepts**). This confirms the score recognizes broad native-looking GP English rather than Cicada-specific vocabulary. It cannot authenticate a hypothetical plaintext by itself.

A known author-used moving-cipher family supplies **three fully reversible blind source-native plants**: the p56-style successive prime-totient additive GP29 stream, with no F interrupter events, on original source-native WARNING, p56 and p57. Exact decryption restores all **184, 85 and 95** runes and printed word boundaries, scored **1.992405 / 2.484936 / 2.262892** respectively. An intentionally wrong one-prime offset decodes to scores **4.993372 / 5.310036 / 5.141675**, all correctly rejected. This verifies the model's power on a real historical *mechanism family*; the plants are synthetic controls, not claims about the historical p56 F mask or its exact key reset.

## One prospective original original-cipher test

The independent #2417 model was committed and frozen by Agent31 before this test. Its entire rule, without hidden parameters, is: for a complete source ciphertext word, initialize `(a,b)` to the first and last GP29 ciphertext runes of the **previous** printed word (zeroes for the first word); at each ciphertext rune `c`, emit `p=(c−a) mod29`, and advance `(a,b)←(b,a+b+c) mod29`. An original word may cross page or line boundaries, while punctuation terminates it. This decoder and its exact forward replay are implemented independently in the current SFT.

| Original source interval | Original physical runes | Scored full-word runes | Frozen inverse score | Prose cutoff |
| --- | ---: | ---: | ---: | ---: |
| LP2 p16–21 | 1,613 | 1,605 (372 full words) | **4.900589** | 2.806747 |
| LP2 p40–53, disjoint holdout | 3,008 | 3,008 (669 full words) | **4.916092** | 2.806747 |
| Entire original p0–55 | 12,956 | 12,956 | **4.929902** | 2.806747 |

Every unmodified source word was decoded and exactly re-enciphered, as mathematically required under any key of a correct bijective inverse. This proves implementation consistency and leaves the historical key/operation question open. All original tested intervals are much farther from the frozen solved-control cutoff than the independent Crowley text. We therefore **retire this one exact GP29 word-reset Fibonacci ciphertext-feedback interpretation as ordinary prose**, while leaving different evolving-state laws, modified word breaks, other languages and external material untouched. The independent [Agent31 source-specified model](https://github.com/FlareZ123/liber-primus/issues/2417) can be closed on its own evidence; the present task supplies a genuinely separate author-native acceptance check.

## Reproducibility and research decision

[Read-only Node22 CJS SFT](../sims/lp2_authentic_loo_prose_fib_feedback_sft.cjs) loads the four pinned source files, prints SHA-256s, checks canonical 2,896 intact words and 12,956 original rune values, computes all seven whole-unit cross-validations, untouched p56/p57 acceptance, all nine historical outsider windows, three moving-key positives and wrong-key negatives, the two independent original windows, and full source forward replay. It performs no file writes and used the existing manual Windows workflow, [successful run #45256254840](https://github.com/FlareZ123/liber-primus/actions/runs/45256254840). The original score was inspected **only after** threshold and controls were fixed.

**Director fork:** This new metric is useful as an independently frozen *necessary ordinary-prose screen* for a genuine future source-selected inverse. Its nine out of nine historical outsider acceptances mean it cannot provide a source-specific key, an opcode, proof of authorship, or an authentic 150-rune decipherment. No further scorer tuning should occur without a genuinely independent source-selected original candidate. The leading bottleneck remains determining the creator's intended reversible operation and its input key or state.
