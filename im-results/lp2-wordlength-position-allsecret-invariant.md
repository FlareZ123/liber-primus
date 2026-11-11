# LP2 original-cipher word-length/position alphabet: all-secret exclusion

**11 November 2026, Agent1. Status:** a bounded, key-independent original-cipher negative. No unknown LP2 plaintext, authentic key, complete cipher mechanism, or continuation was recovered.

## Motivated reversible model

The authenticated 2016 instruction names LP's words, their meaning and their numbers. The canonical unknown transcript preserves exactly **2,896** words and **12,956** runes, while LP2's numeric page and the p15 Fibonacci-prime square offer candidate length/position selectors. A simple human-constructible implementation might give each **(whole word's rune length, zero-based position within that word)** its own keyed 29-way substitution alphabet. This includes a source-derived deterministic offset, table-driven S-box, or even an **arbitrary secret permutation at each such coordinate**, with unrestricted ciphertext word order among words of the same length. Such a system is exactly reversible and consumes no additional per-word state.

**Weakest assumption:** the original plaintext remains in its GP29 spelling and the printed word lengths/positions survive encryption. A page-, word-, or time-varying alphabet is outside the tested family.

For any bucket `b=(length,position)`, let `n_b` be its rune count and `c_{b,r}` the count of original ciphertext rune `r`. A fixed secret bijection can relabel the 29 symbols but cannot change the number of equal pairs. Therefore every proposed plaintext must satisfy the **exact key-free invariant**

```
Q = [sum_b sum_r c[b,r] (c[b,r]-1)] / [sum_b n[b] (n[b]-1)]
```

The denominator/num-erator are computed only over buckets with at least 20 positions and words of length at least 2. This **gives the model more freedom** by discarding sparse buckets and all 83 one-rune words.

## Original-input result

The standalone reproducer uses the repository's canonical word parser, original rune indices and 29-symbol GP alphabet. It independently checks the 2,896-word/12,956-rune input and the original bucket tallies.

| Original invariant | Value |
| --- | ---: |
| Distinct length-position coordinate buckets | 104 |
| Buckets with at least 20 observations | **65** |
| Original runes retained in the test | **12,563** |
| Equal ordered pairs across all retained buckets | **155,338** |
| Total eligible ordered pairs | **4,506,722** |
| Original conditional collision fraction `Q` | **0.0344680679** |

This is almost the uniform GP29 baseline `1/29 = 0.0344827586`, including after conditioning on the printed lengths and within-word positions. The observed result is **invariant to all 29! possible secret alphabet choices per retained bucket**, not merely to a particular Vigenere or prime key.

For native-language controls, convert each of three checked-in independent English prose sources to GP29 using longest GP tokens (including TH/NG/EO/OE/AE/IA/EA), with the stated K→C, V→U, Z→S and Q→C folds. Draw **400 seeded source-word samples per author**, replacing each original ciphertext word by an independently chosen genuine reference word with **exactly the same GP-rune length**. Thus all 1,200 controls retain the complete original 2,896-word length pattern and its corresponding bucket sample sizes. No source word-length bucket is missing.

| Independent native-GP register | Minimum control `Q` (400 draws) | Mean `Q` | Control draws ≤ original |
| --- | ---: | ---: | ---: |
| Gibran, *The Prophet* | 0.11606573 | 0.12235628 | 0/400 |
| Emerson, *Essays* | 0.10725312 | 0.11336949 | 0/400 |
| Shakespeare excerpt | 0.10727753 | 0.11168885 | 0/400 |

**No one of the 1,200 length-matched native-language controls matches the original's near-uniform within-bucket collision rate.** This is a finite original-source/three-author exclusion; the distributional comparison does not prove that every possible plaintext is English.

A synthetic positive-control ciphertext was generated from an independent Gibran length-matched GP sequence using **105 separately generated secret 29-way permutations**, one per observed (length, position) bucket including singleton words. The decoder recovered all **12,956/12,956** plaintext runes. Its bucket collision numerator and denominator remained **562,250/4,506,722** before and after encryption (`Q=0.12475808`), confirming that even unrestricted secret substitution tables cannot flatten the native length-position fingerprint.

## Decision

**Retire static substitution alphabets indexed only by printed word length and within-word position**, including arbitrary table entries, GP-prime offsets and any within-length permutation of the encrypted words, for plaintext statistically comparable to the three length-matched English registers. An unknown key within this entire static family cannot rescue the original observed histogram. Do not rerun direct word-length alphabet or fixed length-position Caesar sweeps.

**Open route to actual plaintext:** a valid forward model must introduce additional changing state or a different intermediate register, alter the source word-boundary contract, or derive an independent key/codec selecting one of those alternatives. The original cannot fix any particular state from this invariant. This result is a research constraint and is not an unknown-page decryption.

**Reproduce:** [standalone CommonJS SFT](../sims/lp2_wordlength_position_allsecret_sft.cjs), reading the already committed corpus, parser and three GP-English controls. Invoke with `node sims/lp2_wordlength_position_allsecret_sft.cjs` under Node 22.