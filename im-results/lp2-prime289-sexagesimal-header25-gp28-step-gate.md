# 289 interpause primes as an exactly sized GP28 word-block step key

**Agent 25 · 22 November 2026 · independent original-source experiment.** This is a finished, bounded negative for a direct candidate key/receiver and does **not** recover unknown Liber Primus plaintext, a proven authorial cipher or the continuation address. It tests a structurally different operator from the prior GP29 prime/totient additive receiver and 290-prime GP28 cycle.

## Source-selected route and actual target

The original 2013 CicadaOS `prime_echo` source independently pauses only after prime **1033** and again after **3301**. The strict intervening span has **289 primes**, 1039 through 3299. Each is representable by **exactly two base-60 digits**, which matters because the LP2 cuneiform headings visibly use sexagesimal numerals. Expanding ascending primes as high digit then low digit gives **578 digits**. The three authentic 2014 Stage10 magic-square orders are **5, 7, 5**, selecting a possible **25-digit first-square header**. Subtracting that header leaves **553 digits**, exactly the rune count of the original five red-numbered p36–p38 passages of lengths **139, 91, 98, 96, 129**.

This exact arithmetic is a good reason to test a *single bounded codec*. It is **not** a signed instruction to discard a header or use a particular step cipher. In particular the 2014 form contains two distinct 5×5 squares; there is no author-confirmed definition of a prime-digit packet.

## Distinct inverse selected for an anti-doublet ciphertext

The 553 original runes contain **one adjacent repeated-rune event** when the incoming ciphertext symbol is the original p36 rune immediately before the first numbered passage. An ordinary additive GP29 key fails to explain why repeats are almost absent, so the source-derived digits are tested as a **28-way predecessor-excluding alphabet clock**:

* At each position `i`, retain the previously printed ciphertext rune `c_prev` and one source digit `d_i`.
* Represent each of the 28 nonrepeating successors by `step=(c_i-c_prev-1) mod29`, giving a digit from 0 through27.
* Decode an ordinary plaintext rune `p_i=(step-sign*(d_i mod28)) mod28` for `sign=+1` or `-1`.
* If `c_i=c_prev`, decode **EA** (GP index28), the distinguished equality marker. Unlike the earlier 290-prime EA test, the source key **advances on every rune including EA**. This uses exactly one digit per original rune.
* Reencrypt with `c_i=c_prev` when plaintext is EA, otherwise `c_i=(c_prev+1+(p_i+sign*(d_i mod28)) mod28) mod29`. The operation is a full 29-to-29 bijection at each position given previous ciphertext and a digit.

The source first-digit readout, initial 25-digit omission and both arithmetic signs are frozen, with high-first/low-first and no-header copies retained as basic controls. No word was repaired, no ciphertext or unprinted padding was fitted. All results below are over **original 553 runes**, continuous through the five original passages and their authentic prefix IV.

| Base60 digit order | Digits omitted | Sign | Exact GP29 IoC of decoded 553 runes |
| --- | ---: | :---: | ---: |
| high-first | **25** | − | **0.035281861782** |
| high-first | **25** | + | **0.035019786671** |
| high-first | 0 | − | 0.034816678460 |
| high-first | 0 | + | 0.035701181959 |
| low-first | 25 | − | 0.035701181959 |
| low-first | 25 | + | 0.036618444846 |
| low-first | 0 | − | 0.035661870692 |
| low-first | 0 | + | 0.035674974448 |

For comparison the original unchanged 553-rune ciphertext has IoC **0.034233561339**. The decoded values are all near the uniform-GP29 baseline 1/29 ≈0.03448, and their beginnings are nonlinguistic. The highest output among all eight controls is **0.03662**, far short of normal solved-native GP English in a passage this size. Each original readout nevertheless **reenciphers exactly**; reversible code alone is insufficient evidence of a correct key.

An independent **553-rune source-native positive** repeats the solved original p57 passage and deliberately inserts one EA symbol. Every tested key/sign/order encrypts and decrypts **all 553 symbols exactly**, with exactly one ciphertext doublet. This confirms that the detector can recover actual language under the proposed operator, and that the original failure is not caused by the predeces­sor logic or automatic dropping of the one exceptional event.

## Decision

The source-led **578 = 25 + 553** framing, even coupled to a reversible, anti-repeat-compatible, position-changing GP28 cipher, **does not decode the five numbered original passages** into native GP English. This removes the simplest direct key-schedule explanation for that unusually tight numeric alignment. Keep the historical 289-prime/17×17 structure as an unresolved potential source *only if an independent source selects a different real opcode or key use*. Do not promote the numerical length coincidence to a cipher or extend it with tuned exceptions, new offsets or additional layers.

[Original-source read-only Node22/CommonJS SFT](../sims/lp2_prime289_base60_header25_gp28_step_sft.cjs) · [Windows Node22 Actions PASS](https://github.com/FlareZ123/liber-primus/actions/runs/45075508967) · [earlier distinct 289-prime source arithmetic](lp2-cuneiform-primeecho-squareorders-289-original-gate.md) · [earlier 290-prime GP28 receiver](lp2-cuneiform-prime-echo-290-key-gate.md).