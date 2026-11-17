# Singleton-successor key oracle on the original LP2 ciphertext

**Agent 30, 17 November 2026. Classification: bounded original-data negative, with a reusable key-discovery test.** Ten fixed, source-led key streams fail to produce a reusable native-English signal under the specified plaintext-feedback architecture. **No unsolved LP2 plaintext, authentic key, cipher method or continuation destination was recovered.** A heldout positive plant demonstrates sensitivity to the true key.

## Original clue and inverse

The unedited LP2 transcript contains **12,956 runes, 2,896 printed words and 83 complete one-rune words**. The ciphertext has 86 equal neighbours among 12,901 within-page transitions. One possible feedback encoder adds the current plaintext and a table entry keyed by the previous plaintext to the previous ciphertext:

\[
D_i=(C_i-C_{i-1})\bmod29=(P_i+f(P_{i-1})+K_i)\bmod29.
\]

The unknown \(f\) may be *any* 29-entry GP29 function. \(K_i\) is a concrete proposed changing key stream. The original prime/totient instructions and 32×8 numerical table suggest possible key sources, although **no authenticated LP2 instruction chooses this equation**.

If the original printed one-rune words preserve ordinary English GP plaintext **A** or **I**, the rune immediately following such a word must satisfy

\[
(D_i-K_i)\bmod29=P_i+f(A)\quad\text{or}\quad P_i+f(I).
\]

There are exactly **75** original complete one-rune words followed by a literal hyphen with the following rune on the same physical page. Seven others precede a full stop and one precedes a page join. Restricting to these 75 avoids guessing sentence/page reset behavior. The two unknown table entries \(f(A),f(I)\) each range over 0–28, giving an **exact exhaustive 841-case** key-agnostic partial inverse with all other 27 entries unrestricted.

## Source-trained original-input key screen

The canonical GP first-rune distributions following A and I are learned on the **first 988 A/I-next-word events** in resources/control/shakespeare_first300k.txt. Transliteration applies the known GP digraph symbols and K/Q→C, V→U, Z→S; 0.5-count smoothing is fixed. Another **988** A/I-next-word source events are held out. The training fraction of A singletons is 0.382591. The score is the best native-initial log likelihood of the 75 adjusted GP differences, minus the iid-uniform GP29 log likelihood, optimized exactly over all 841 possible \(f(A),f(I)\).

For each original source key, the middle columns fit the secret shifts on one half of the original 75 positions, then score the **other half with both shifts frozen**. The reverse direction is independently reported.

| Original key candidate and clock | All-75 best log gain (nats) | First half → withheld second | Second half → withheld first |
| --- | ---: | ---: | ---: |
| No external keystream | **−8.350** | −11.72 | −10.34 |
| Consecutive prime totients, book continuous | **−7.763** | −25.73 | −19.32 |
| Consecutive prime totients, physical-page reset | **−1.569** | −23.00 | −6.03 |
| Prime totients, global prime start +3301 | **−10.458** | −13.51 | −12.85 |
| P50 256 bytes, row-major, book clock | **−15.241** | −33.47 | −30.04 |
| P50 row-major, page clock | **−12.356** | −13.38 | −22.76 |
| P50 column-major, book clock | **−5.365** | −16.95 | −13.70 |
| P50 column-major, page clock | **−12.796** | −24.96 | −20.97 |
| P50 reversed row-major, book clock | **−14.216** | −22.97 | −17.44 |
| P50 reversed row-major, page clock | **−10.890** | −14.74 | −17.44 |

**Correction to final row:** the source-exact reverse-page, second-to-first holdout is **−17.43996**; the adjacent rounded value should therefore read **−17.44**.

The strongest full-sample signal is prime-totient page-reset, with fitted \(f(A),f(I)=(23,17)\). It breaks on withheld data: fitting the first half chooses (6,14) and scores **−23.001** on the second; fitting the second chooses (23,17) and scores **−6.034** on the first. Every tested key has a negative score in both withheld directions. The known p56 cipher's literal-F nonconsuming clock is outside the consuming-clock hypotheses tested here.

## Heldout positive and random controls

The first 75 **unseen native-English A/I-successor events** are encrypted with the authentic consecutive-prime-totient *page-reset* key at the exact original 75 rune coordinates and with hidden \(f(A)=7,f(I)=13\). The same original-key screen identifies the correct prime-totient-page candidate and **recovers both hidden offsets exactly** at **+28.222 nats**. All nine incorrect key sources score below zero (highest −1.635). This is a deliberately planted control and contains no recovered LP2 plaintext.

A 1,000-run deterministic iid-uniform 75-event control, fitted using the identical 841-case optimizer, has median optimal score **−11.513**, 95th percentile **−3.371** and 99th percentile **+0.257** nats. The original best score −1.569 is compatible with the search across ten choices and does not generalize in a heldout test.

## Consequence and reusable next operation

The original word shape offers a **cheap key-source test** that does not require decoding 12,956 symbols or guessing the remaining plaintext-feedback table. Apply a newly identified *independently sourced* keystream at these 75 fixed positions, estimate the two secret shifts on one half, demand predictive signal on the other half, and only then invest in a full plaintext-producing inverse. The exclusion here is conditional on preservation of word boundaries, A/I source singletons, GP-native next-word initials and the explicit differential feedback law. Additional hidden states or different plaintext registers remain possible.

**Source-exact reproducer:** [sims/lp2_singleton_nextword_key_oracle_sft.cjs](../sims/lp2_singleton_nextword_key_oracle_sft.cjs). It checks all original positions, both heldout directions, the hidden-key positive, every tested key stream and iid-uniform calibration. [Manual Windows Node 22 run 44005085642](https://github.com/FlareZ123/liber-primus/actions/runs/44005085642) completed successfully.
