# Source-locked Onion2 key under the R4 edge-null / T-repair channel

**Classification:** intermediate, reproducible negative result. No LP2 plaintext or authentic key recovered.

## Question

Can the 2014 Onion2 256-byte growing-string output serve as the LP2 keystream if the ciphertext also has the word-level channel proposed as model R4 in the independent pnotisdev/cicada3301 research?

This is a deliberately narrow bridge between two independently motivated observations:

- the 2014 Onion2 service exposes a 256-byte sequence in resources/cicada2014-onion2-timing.json;
- LP2 has an excess of the lag-six affine relation T(x)=(24-2x) mod 29, while the external R4 model explains this using collision repair plus non-key-consuming word nulls.

The external R4 model is not established as Cicada's cipher. Its own audit notes that its fitted null-placement model allowed word-edge positions, while its earlier decoder and positive controls covered interior positions only. This experiment explicitly includes both leading and trailing nulls.

Related current-repository work: sims/fibonacci_grid_keyless_null_word_inverse.cjs already has an edge-inclusive, keyless one-null-per-word DP for a different AES-CTR key derived from the Fibonacci/grid source. That implementation does not include the R4 lag-six collision-repair channel and does not test the Onion2 additive GP29 key. The present result is the distinct combination of that source family, Onion2 bytes, and T-repair; it should not be read as the first edge-null decoder in this repository.

## Fixed candidate

- Key: the original Onion2 final_hex, 256 bytes, period 256, global clock starting at byte 0.
- GP29 conversion tested: byte modulo 29 and floor(29*byte/256).
- Additive layer: C=P+K mod 29.
- Collision repair: q=0.81; a would-be repeated ciphertext rune is replaced by T(C[i-6]) when available and non-repeating, otherwise by a random non-repeat rune.
- Null channel: r=0.4484; at most one checked null per plaintext word of length at least two, uniformly inserted at any slot from 0 through the word length. This includes both edges. A null does not consume a key symbol.
- Clock: one continuous book-global key pointer; no phase or reset search.

## Data and decoder

The canonical transcription contains 12,956 runes in 2,896 words. The LP2 test uses the first 200 words (938 ciphertext runes).

A GP29 trigram model with additive smoothing 0.3 was trained on the first 636 words of the 796-word / 3,248-rune solved LP1 reference. The final 160 words (641 runes) were held out.

The inverse uses a dynamic program over the 256 possible key-clock offsets. For each cipher word it compares no-null decoding with every possible null position, including the first and last ciphertext positions. It advances the key only for real plaintext runes. At ambiguous collision-repair positions it makes a greedy local choice using the trigram likelihood and the R4 repair prior. This is not a globally exact Viterbi search over every repair history; the positive control below calibrates the implemented approximation.

## Positive control

The 160 held-out LP1 words were planted under the Onion2 key mapped with byte modulo 29, using the same q, r, edge-inclusive insertion rule, and fixed xorshift seed 0x8c3302.

| Measure | Result |
|---|---:|
| Plaintext words / runes | 160 / 641 |
| Planted ciphertext runes | 712 |
| Planted nulls / decoded nulls | 71 / 70 |
| Exact recovered words | 136 / 160 |
| Exact recovered runes | 612 / 641 (95.5%) |
| Exact null positions | 145 / 160 |
| Exact key offsets at word starts | 160 / 160 |
| Decoded mean trigram log-probability | −2.7034 |
| Held-out native reference mean | −2.6931 |

This shows that the decoder can recover a source-known key stream through the tested edge-null and T-repair channel at useful accuracy. It does not prove the R4 channel is authentic.

## Original LP2 result

| Key bytes / mapping | Selected nulls | Plaintext runes | Mean LM log-probability per rune |
|---|---:|---:|---:|
| Onion2, byte modulo 29 | 62 | 876 | −4.1213 |
| Onion2, floor(29*byte/256) | 59 | 879 | −4.1098 |
| Shuffled Onion2, byte modulo 29 | 93 | 845 | −4.0899 |
| Shuffled Onion2, floor(29*byte/256) | 87 | 851 | −4.1295 |
| Onion3, byte modulo 29 | 78 | 860 | −4.0980 |
| Onion3, floor(29*byte/256) | 64 | 874 | −4.1034 |
| Onion4, byte modulo 29 | 89 | 849 | −4.0697 |
| Onion4, floor(29*byte/256) | 77 | 861 | −4.1156 |

The Onion2 no-null baselines were −4.4209 (byte modulo 29) and −4.3676 (floor(29*byte/256)). The edge-null model improves those scores slightly, but the resulting plaintext remains far below the held-out native score of −2.6931. The decoded words are gibberish, and Onion2 does not distinguish itself from shuffled or wrong-service controls.

## Decision

Reject this exact candidate:

> Onion2 printed-order bytes, mapped by either tested natural byte-to-GP29 conversion, used as a period-256 global additive key beginning at byte zero, with the R4 checked edge-inclusive word-null and lag-six collision-repair channel.

The positive control makes the negative informative for this narrow candidate. It does not rule out the Onion2 data under a different source-specified transform, a different clock/reset, or a different cipher architecture. It does not establish or falsify R4 generally, and it does not show that the Onion2 string was intended as LP2 key material.

## Reproduction

Run: node sims/onion2_r4_wordnull_inverse.cjs

The script reads the original repository resources, fixes all parameters and the plant seed, asserts the corpus/reference dimensions, checks the positive-control accuracy, and prints the full control and LP2 result table.

External model reference: pnotisdev/cicada3301 — phase57_mechanism.py (https://github.com/pnotisdev/cicada3301/blob/main/work/phase57_mechanism.py) and its audit note 08_loose_ends.md (https://github.com/pnotisdev/cicada3301/blob/main/work/laptop_review/08_loose_ends.md).
