# p50-byte exponent stream in the source-selected GF(29²): bounded negative

**Status:** original-input test of a fixed, human-plausible transport and three independently source-selected generator exponents. No unknown plaintext or key recovered. This remains an intermediate result, not an established Liber Primus mechanism.

## Human solve-path hypothesis

A solver encountering the original 32×8 numeric table on LP2 pp49–51 could plausibly combine three visible/historical clues:

1. The p3 red triad [13,23,2] gives the quadratic extension \(u^2=3u+8\) over GF(29).
2. The 2013 BASE29 3301 → 3QO example gives \(3+26X+24X^2\), whose normalized factor is \(X^2+18X+11\). The p50 table's source-selected base-60 row-major polynomial has this factor. The p39 red triad independently gives the other visible double root at \(X=24\).
3. Solved p56 has 85 runes, with its literal F at offset 56 not consuming a prime. Its 84th consumed prime is **433**, and \(z=u^{433}\) is a primitive element satisfying \(z^2+18z+11=0\) with multiplicative order 840.

The original p50 table then supplies 256 byte exponents \(B_j\), all in the valid exponent range 0–255. A natural reversible two-rune transport is to interpret each adjacent GP29 pair as a field element and use the table byte as its exponent:

\[
C_i=P_i z^{B_{i\bmod256}},\qquad
P_i=C_i z^{-B_{i\bmod256}}.
\]

This is a concrete, source-constrained candidate, not a proven instruction. Its weakest premise is that the p50 bytes are a repeating multiplicative key for consecutive two-rune field elements. The historical 2013 DH example uses modulus 23; it does **not** itself specify Diffie–Hellman over this GF(29²) extension or say that the p50 table is a key.

## Additional source-selected generator gate: p57 / 2014 HTML

The p57 parable's three body-clause prime sums are 1259, 1031, and 1229; its heading sum is 449. The documented modulo-449 remainders are [361,133,331]. The original 2014 onion7 HTML independently has title 133 and element id 331. These values therefore justify a small, fixed alternative-generator test, rather than an arbitrary exponent sweep:

\[
z_e=z^e,\qquad K_j=z_e^{B_j},\qquad e\in\{133,331,361\}.
\]

The resulting generator orders are 120, 840, and 840 respectively. Both multiplication directions were tested for each exponent. The participant-side 2013 DH live transcript also happens to contain server exponent 331, but that log is not a Cicada-authenticated parameter and is **not** used as the selector; the p57/HTML artifacts are the source basis for this finite test.

## Frozen transport contract

- **Field:** GF(29²), with \(z^2=18+11z\); \(z=u^{433}\); \(\operatorname{ord}(z)=840\).
- **Key:** the original p50 256 base-60 row-major bytes, reconstructed from the printed two-character tokens. Their SHA-256 is 3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290. Byte values are used directly as exponents; \(z^0=1\), so the two zero bytes are ordinary no-op multipliers.
- **Rune transport:** consecutive GP indices \((a,b)\) are the field element \(a+bz\). Every two-rune block is transformed bijectively by multiplication by the nonzero key element.
- **Clock:** one global pair stream begins at the first unsolved rune; the 256-byte key repeats every 256 field pairs (512 runes). No fitted phase, key, or reset is allowed.
- **Spaces and words:** separators are outside the 29-symbol stream, remain at their original positions, and do not consume key. Pairing is over the concatenated rune stream, so a one-rune word is not padded and may form a pair across a word boundary.
- **F and repeats:** every unknown-page F and every adjacent repeated rune is an ordinary GP coordinate; neither is an escape or a nonconsuming marker. The known p56 literal-F exception selects the 433rd-power field basis only; it is not generalized to unknown pages.
- **13-dot marks and page boundaries:** marks are non-rune punctuation and do not consume/reset the key. The tested model is book-global, with no page reset.
- **Length/escape:** fixed two-rune field elements, no variable-length packet, no escape, no padding. The 12,956-rune stream is exactly 6,478 pairs.

These choices fully specify the tested model. They are not asserted to be the creator's intended rules.

## Original-input result

The reproducer processes all **12,956** original unsolved runes from 55 rune-bearing pages. The existing Gibran-trained GP trigram model uses the first 40,000 native-GP control runes for training and 88 held-out 256-rune windows for reference. The raw ciphertext mean is **−12.27632833**; the worst held-out native window is **−9.13104032**. All candidate 256-rune windows remain well below the held-out native range.

### p56-selected exponent 433

| Decode direction | Mean trigram nats/rune | Window min | Window median | Window max | At/above worst native window |
|---|---:|---:|---:|---:|---:|
| \(z^{-B}\) | −12.26256 | −12.55901 | −12.26383 | −11.90189 | 0/50 |
| \(z^{+B}\) | −12.28552 | −12.58511 | −12.29328 | −12.04139 | 0/50 |

The best direction improves the raw mean by only about 0.0138 nats/rune and remains nonlinguistic.

### p57 / HTML-selected exponents 133, 331, 361

| Generator exponent e | Order of \(z^e\) | Decode direction | Mean trigram nats/rune | Window min | Median | Max | At/above worst native window |
|---:|---:|---|---:|---:|---:|---:|---:|
| 133 | 120 | \(z_e^{-B}\) | −12.29153420 | −12.56040597 | −12.28274455 | −11.87734266 | 0/50 |
| 133 | 120 | \(z_e^{+B}\) | −12.23991529 | −12.58784099 | −12.25733373 | −11.85462058 | 0/50 |
| 331 | 840 | \(z_e^{-B}\) | −12.29771333 | −12.56198508 | −12.29172276 | −12.08330270 | 0/50 |
| 331 | 840 | \(z_e^{+B}\) | −12.26798308 | −12.49364095 | −12.28143542 | −11.99128347 | 0/50 |
| 361 | 840 | \(z_e^{-B}\) | −12.26999735 | −12.47236457 | −12.26317375 | −12.09097019 | 0/50 |
| 361 | 840 | \(z_e^{+B}\) | −12.28642182 | −12.52800337 | −12.31327746 | −11.98175593 | 0/50 |

The \(e=133\), positive-direction mean is the strongest of this small set, but its 50 individual windows still all fall below the worst native reference window. It is not plaintext evidence.

### Other direct checks

Matched wrong-source alternatives are equally poor: reversing the base-60 table, using the published base-59 alternative, or using the conjugate field root gives full-stream mean scores between **−12.31860 and −12.26946**. Interpreting each output pair as a raw byte \(29a+b\) also fails: only 1,956/6,478 pairs in the best direction are within 0–255, so this output is not a byte stream.

The planted positive control encrypts 12,956 independent native-GP runes with each exact source key and recovers all **12,956/12,956** exactly. The original input also re-encrypts exactly. These establish implementation correctness, not historical correctness.

## Decision and next source hunt

**Reject this direct periodic multiplicative GF(29²) p50-key interpretation for all four tested source-selected generator exponents.** It is reversible and source-anchored, but produces no authentic plaintext. The exact p50 bytes, 2013 BASE29 example, p56 prime clock, and p57/HTML numbers do not establish that the table is a key, that the cipher pairs runes globally, or that these generator exponents are intended.

The minimal missing input is therefore not another guessed exponent: it is an independently preserved original instruction or executable that binds the p50 table to a specific rune/field operation and fixes its alignment/restart rule. Do not continue arbitrary exponent, phase, reset, or byte-to-rune sweeps from this negative.

## Reproduction

Run:

~~~bash
node sims/p50_gf29sq_byte_exponent_stream_sft.cjs
~~~

The script reads the original/normalized LP2 source corpus, p50 byte table, original onion7 HTML, and the existing Gibran control. It asserts the field factor, table hash, p56 433 selection, p57/HTML selector, exact round trips, and all source dimensions.
