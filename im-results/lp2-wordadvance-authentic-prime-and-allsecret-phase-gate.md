# Original LP2 word-edge advance: two source-locked constraints

**Agent 18, 17 November 2026, Director [#1341](https://github.com/FlareZ123/liber-primus/issues/1341).** Independently executed on Windows Node 22 in [successful CI run 44027164145](https://github.com/FlareZ123/liber-primus/actions/runs/44027164145); both original-gate programs and their solved/native controls passed. Outcome: no unknown plaintext, no authentic new key. Two distinct finite tests constrain a concrete historically motivated possibility, namely one invisible additional key advance before every source-printed word after the first. The tests deliberately hold the original ciphertext, all **2,896 genuine printed word boundaries**, all **32 page-carried words**, and the numeric-only p50 page unchanged.

## Source clue, previous work, and the exact proposal

The original LP2 manuscript separates 12,956 unknown runes into 2,896 words; Cicada's 2016 signed instruction says the book's words are a map and its numbers a direction. The solved p56 cipher uses **successive prime totients modulo 29**, with an original plaintext **F** passing unencrypted and without consuming a prime key. The manuscript also prints a **32-row × eight-column**, 256-value numeric table. These are genuine sources of *possible* clock lengths and events. There is no original-authored instruction linking the 256 cells or a +1 word-edge advance to a particular unknown ciphertext. The new operation is a bounded hypothesis.

The much more general source-defined **probabilistic** Phase24 extra-advance engine, with event probability 0.42, had already been calibrated by the independent [pnotisdev Phase24 study](https://github.com/pnotisdev/cicada3301/blob/main/work/log/phase24_word_edge_channels.md): 192/192 synthetic detections, and one original 300-rune 0.7@0 pilot with no hit in 319,878,576 cells (best advance score -72.41). [Local closed #1195](lp2-2014-keyword-wordedge-advance-original-gate.md) had separately tested the 2014 authenticated 13-rune keyword under probabilistic extra advances, with three strongly positive 300-rune plants and an exact solved p57 plant; original 300-rune windows p0–1 and p40–41 scored -166.46 and -150.12. The present tests neither rerun that search nor infer another free event mask.

## Test A: actual solved prime-totient key with deterministic +1 per original printed word

Freeze `K[j] = (prime[j] - 1) mod 29`, starting at the prime 2, with the actual p56 plaintext-F bypass. For each word-initial rune after the segment's first rune, **advance j once before reading the rune**. Then either:

- When the original ciphertext rune is F, permit the **literal plaintext-F path** that emits F and consumes no ordinary key value.
- For any ciphertext rune, permit the encrypted path `P=(C-sign*K[j]) mod29` and consume the ordinary key value **only if P is not F**.

The exact dynamic program retains all legal current key-pointer states after each rune. No guessed F mask, plaintext word, language fitness, key phase, or collision-repair operation is used. A source-coded inverse requiring the actual p56 F skip recovers the authentic solved opening **ANENDWITHIN**. A separate original-p56-plaintext plant and a p57 95-rune clear-text plant are encrypted under the hypothetical extra-advance rule, and the exact ambiguous-F inverse retains the true pointer path at **every rune for both encryption signs**.

| Untouched original region, fresh source prime 2 | C = P + K | C = P - K |
| --- | --- | --- |
| p0, 262 runes, 59 source words | **No legal path at original rune offset 175** (cipher L, K=20, forced P=F) | **No legal path at offset 256** (cipher NG, K=8, forced P=F) |
| Independent p40, 231 runes, 55 words | **No legal path at offset 34** (cipher G) | **No legal path at offset 20** (cipher L) |
| Actual solved p56 with *hypothetical* advance | Fails at offset 13 | Fails at offset 23 |

The **p0 failure is decisive for this whole-book, chapter-reset or page-reset exact source key clock beginning at its first rune**. Every possible F bypass has been retained, and each failure has only one remaining pointer state: the observed non-F ciphertext forces a prohibited plaintext F. Allowing a non-F ciphertext to encrypt plaintext F would contradict the actual solved-p56 bypass rule. Different starting states, probabilistic advances, other collision repairs or keys are outside this assertion.

Reproducer: [exact known-prime original cipher SFT](../sims/lp2_prime_wordadvance_Fallbranch_source_sft.cjs). It validates the original page corpus, the authentic p56 opening, synthetic native controls, both GP29 signs and disjoint original pages.

## Test B: an unknown secret 256-phase key still has a key-independent invariant

Give the hypothesis an **arbitrary secret permutation of all 29 GP symbols at each of 256 phases**. The phase clock advances once for every ciphertext rune and **once extra at every genuine printed word beginning**. Check three natural reset conventions: book-global, nine visually separated chapters, or original physical page. Additionally check the literal p56-style F-bypass analogue under which all 458 original cipher-F positions preserve F without consuming their ordinary key step, while their word-edge advance still applies.

Regardless of the 256 secret permutations, **two ciphertext symbols at the same phase are equal if and only if their corresponding plaintext symbols are equal**. This is an exact algebraic equality invariant; it is independent of the 256 printed table's unknown role. Count all unordered within-phase pairs and compare with 991/968 deterministic source-native GP29 English reference windows, stride 50, from the independently held Gibran control, with original physical word positions imposed as the phase schedule.

| Key reset | Literal F bypass? | Original phase-equal pairs / all phase pairs | Original rate | Native GP reference minimum equal pairs | Reference windows |
| --- | --- | --- | --- | --- | --- |
| Whole book | No | 11,199 / 322,515 | 3.4724% | 18,818 | 991 |
| Whole book | Yes | 10,920 / 299,819 | 3.6422% | 18,102 | 968 |
| Nine chapters | No | 11,199 / 323,233 | 3.4647% | 18,928 | 991 |
| Nine chapters | Yes | 10,826 / 300,616 | 3.6013% | 18,180 | 968 |
| Printed page | No | 12,291 / 353,012 | 3.4818% | 20,620 | 991 |
| Printed page | Yes | 11,708 / 326,515 | 3.5857% | 19,758 | 968 |

The real original ciphertext is below **every** inspected source-native reference window on all six frozen clocks. Independently generated *secret 29-symbol bijections at every phase* exactly encrypt and re-decrypt all 12,956 positions (and the original p57 clear-text 95-rune positive); the invariant is reproduced exactly before/after encryption. The F-bypass plant keeps the observed F positions and uses 28-symbol fixed-F permutations.

This is a controlled **English-reference mismatch**, not a probability covering all possible plaintexts. The reference windows overlap, and projected original word boundaries are not a separate lexical matching condition on the reference. The mathematical conclusion is precise: these original runes cannot be an exact phase-preserving substitution encryption of **any of those particular source-reference windows**. They may be encrypted compressed text, another language or a different mechanism. Non-bijective tables, position-dependent repairs, random unknown advance masks and a second transforming layer evade the invariant.

Reproducer: [source-word-advance 256-all-secret invariant SFT](../sims/lp2_wordadvance256_allsecret_samephase_sft.cjs). The scripts use the pinned [original corpus](../resources/liber-primus/lp2-corpus.json) and [unbroken physical transcription](../resources/liber-primus/lp2-transcription.txt), with source-code asserts for the 2,896 words and 12,956 runes. Native GP controls are generated from [Gibran](../resources/control/gibran_prophet_58585.txt).

## Next decision

The completed natural deterministic source grammar fails in **two independent original regions under the authenticated key**, and its very liberal secret-256-phase fixed-alphabet extension has a strong English-reference mismatch. The previously completed probabilistic 2014 keyword/Phase24 tests also fail their fixed original windows. None yields a source-selected plaintext, key or destination. Retire **mandatory +1 at every printed word with unchanged source prime/F rule**. Further Phase24 searches require a genuinely different, authored input that determines *which* words advance or a key from an unexhausted original source; additional free masks, retrofitted offsets and unrelated cipher families are not warranted.
