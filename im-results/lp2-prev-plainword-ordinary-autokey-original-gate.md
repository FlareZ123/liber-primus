# Ordinary preceding-plaintext-word autokey: complete singleton-state inverse (#2503)

**Decision (Agent11, 24 November 2026): bounded original-cipher negative.** Standard cyclic previous-plaintext-word addition, with all GP29 symbols consuming a key position, fails both frozen original holdouts. The special-F variant has a separate exact contradiction. No unknown plaintext or authored cipher operation recovered.

## Mechanism and exact reduction

The 2016 signed text's words/numbers phrase and historical LP1 Vigenère motivate the word-fed hypothesis, but neither establishes it. The historical transparent-F receiver was already rejected on original LP2. This comparator removes the F exception entirely: for a complete printed word (P_i), let (K=P_{i-1}), and use

`C_i[j] = (P_i[j] + K[j mod |K|]) mod29`.

Subtract the same key to invert. Key phase restarts at each complete word, including words split across printed pages. No sign, phase, alternate spelling or boundary search. The rule and holdouts were frozen in [issue comment 7124105552](https://github.com/FlareZ123/liber-primus/issues/2503#issuecomment-7124105552).

The first complete original singleton is word 39, global rune176 (zero-based). It destroys all earlier key degrees of freedom for subsequent words. Grant all 29 possible plaintext singleton values, including non-language values. If (P_i^{(0)}) is the zero-seed path, induction on whole words gives

`P_i^(s)[j] = P_i^(0)[j] + (-1)^(i-39) s mod29`.

Each subsequent word differs between candidate paths only by a constant translation. In particular, for each word-index parity, the number of distinct singleton outputs is invariant under **every** prior seed. The original has **23** distinct singleton types on one parity and **21** on the other, with **25–29** distinct types combined over the 29 candidate paths. Ordinary solved-native prose in the three disjoint controls uses only GP0 A=24 and I=10 as one-rune words. This exact lower bound is conditional on the proposed receiver and authentic printed spacing; it does not assume a dictionary, an initial word, or a particular global relabeling of the alphabet.

## Complete original inversion and blind positive controls

Input: 12,956 runes in 2,896 complete words, all 32 cross-page carries preserved, verified symbol-for-symbol against the canonical corpus. Pin the existing 29,060-form native-GP TextBlob vocabulary and choose the singleton by exact matches of words of length >=5 on p0–2 after the anchor; ties by longest uninterrupted dictionary hit run, then smallest seed. Score only words fully contained in each physical page range.

| Receiver | Complete words | Runes | Length >=5 exact dictionary hits | IoC |
| --- | ---: | ---: | ---: | ---: |
| Opening p0–2 after anchor | 119 | 553 | 0/55 | .03416149 |
| Unchanged p16–21 holdout | 372 | 1,605 | 0/140 | .03425704 |
| Unchanged p40–53 holdout | 669 | 3,008 | 0/257 | .03443826 |
| All after singleton | 2,857 | 12,780 | 0/1,118 | .03446531 |

Chosen seed is GP0=7. Across **all 29** seeds, full suffix IoC is .03445374–.03449165, at most one of 1,118 long words matches, and the first holdout has zero matches for every seed. The second holdout has at most one match. No seed produces coherent original prose.

To exercise the remaining prefix, enumerate all 4,325 length-eight first-word forms; 189 lead to the chosen singleton seed. Select the highest prefix score under the same objective. The best conditional full 12,956-rune path matches just 1/1,132 long words (the conditioned first word) and IoC .03446356. Forward replay is exact from the second word onward. The first word is explicitly an unknown initialization; its own ciphertext is not predicted by the recurrence. Replay is an implementation invariant, not evidence for a historical key.

For three disjoint 150-word blocks of pinned solved-native GP, encode with precisely the same law, hide the first singleton value, rank all 29 paths using the first 60% of the post-anchor block, then evaluate the untouched remainder.

| Native block start | Actual / recovered singleton | Training long-word matches | Nearest wrong seed hits | Withheld runes exactly recovered |
| ---: | --- | ---: | ---: | ---: |
| 0 | 24 / 24 | 21/21 | 0 | 265 |
| 150 | 24 / 24 | 13/13 | 0 | 152 |
| 300 | 10 / 10 | 25/26 | 0 | 271 |

All **688 withheld runes** recovered exactly, with no per-word key or test-set adaptation. Native control suffix IoCs .0606–.0691. These are planted architecture controls on genuine solved native text, not fresh unknown-page solutions.

## Disposition and reproduction

Retire this no-hold cyclic preceding-plaintext-word additive recurrence, alongside the prior exact [forward F-hold](lp2-preceding-plaintext-word-autokey-fhold-exact-gate.md), [reverse F-hold](lp2-next-plaintext-word-autokey-fhold-exact-gate.md), and [prime-minus-one F-hold](lp2-prev-plainword-prime-minus-one-fhold-original-gate.md) variants. The preceding-word numeral and pointer families have their own negative studies; no source instruction selects another variant. A distinct [whole-word BASE29 repeated-reversal affine feedback](lp2-reverse-cycle-word-integer-autokey.md) now escapes the digitwise alternating-shift reduction by introducing true integer carries and three shared coefficients. Its all-small-key search uniquely recovers three native plant keys and 1,394 withheld runes, but all original candidates fail before four words even allowing one lexical escape; the same first singleton anchor is used. This closes the bounded small-coefficient extension only. A future word-fed candidate should explain how its state persists past a singleton, or justify changed spacing/representation independently. Do not widen these tests solely to compensate for their failure.

Reproduce: `node sims/lp2_prev_plainword_ordinary_autokey_sft.cjs` (CommonJS, standard library only). The executable calculation ran directly in connected JS against the repository source blobs. No new Actions run required.

Pinned source blobs:
- LP2 corpus `054f2a0f780b7d46901acbe3d9bf4f0ac1801165`
- LP2 transcription `43bfeb6bf8dabaf25b0446cc519f8d91d205d8a7`
- Native solved comparator `1b064ef6d85819b7d96adaff31a82d1ec551598f`
- TextBlob forms `140e1d22b5f8c45deddd2e8b25549d9d6307d938`
