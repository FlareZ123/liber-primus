# p50-byte exponent stream in the source-selected GF(29²): bounded negative

**Status:** original-input test of one fixed, human-plausible transport; no unknown plaintext or key recovered. This is an intermediate result, not an established Liber Primus mechanism.

## Human solve-path hypothesis

A solver encountering the original 32×8 numeric table on LP2 pp49–51 could plausibly combine three visible/historical clues:

1. The p3 red triad [13,23,2] gives the quadratic extension u² = 3u + 8 over GF(29).
2. The 2013 BASE29 3301 → 3QO example gives 3 + 26X + 24X², whose normalized factor is X² + 18X + 11. The p50 table's source-selected base-60 row-major polynomial has this factor. The p39 red triad independently gives the other visible double root at X=24.
3. Solved p56 has 85 runes, with its literal F at offset 56 not consuming a prime. Its 84th consumed prime is **433**, and z = u^433 is a primitive element satisfying z² + 18z + 11 = 0 and having multiplicative order 840.

The original p50 table then supplies 256 byte exponents B_j, all in the valid exponent range 0–255. A natural reversible two-rune transport is to interpret each adjacent GP29 pair as a field element and use the table byte as its exponent:

\[
C_i=P_i z^{B_{i\bmod256}}, \qquad
P_i=C_i z^{-B_{i\bmod256}}.
\]

This is a concrete, source-constrained candidate, not a proven instruction. Its weakest premise is that the p50 bytes are a repeating multiplicative key for consecutive two-rune field elements. The historical 2013 DH example uses modulus 23; it does **not** itself specify Diffie–Hellman over this GF(29²) extension or say that the p50 table is a key.

## Frozen transport contract

- **Field:** GF(29²), with z² = 18 + 11z; z = u^433; ord(z)=840.
- **Key:** the original p50 256 base-60 row-major bytes, reconstructed from the printed two-character tokens. Their SHA-256 is 3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290. The byte values are used directly as exponents; z^0=1, so the two zero bytes are ordinary no-op multipliers.
- **Rune transport:** consecutive GP indices (a,b) are the field element a+bz. Every two-rune block is transformed bijectively by multiplication by the nonzero key element.
- **Clock:** one global pair stream begins at the first unsolved rune; the 256-byte key repeats every 256 field pairs (512 runes). No fitted phase, key, or reset is allowed.
- **Spaces and words:** separators are outside the 29-symbol stream, remain at their original positions, and do not consume key. Pairing is over the concatenated rune stream, so a one-rune word is not padded and may form a pair across a word boundary.
- **F and repeats:** every unknown-page F and every adjacent repeated rune is an ordinary GP coordinate; neither is an escape or a nonconsuming marker. The known p56 literal-F exception selects the 433rd-power field basis only; it is not generalized to the unknown pages.
- **13-dot marks and page boundaries:** marks are non-rune punctuation and do not consume/reset the key. The tested model is book-global, with no page reset; pairs can cross page boundaries.
- **Length/escape:** fixed two-rune field elements, no variable-length packet, no escape, no padding. The 12,956-rune stream is exactly 6,478 pairs, so no trailing symbol is left over.

These choices fully specify the tested model. They are not asserted to be the creator's intended rules.

## Original-input result

The reproducer processes all **12,956** original unsolved runes from 55 rune-bearing pages, including all 86 adjacent repeated outputs. It checks both multiplication directions.

| Measure | Raw ciphertext | Decode with z^(-B) | Opposite direction z^(+B) |
|---|---:|---:|---:|
| GP IoC | 0.03447840 | 0.03448961 | 0.03447953 |
| Gibran-trained trigram score (nats/rune) | −12.27633 | **−12.26256** | −12.28552 |

The best direction improves the raw trigram score by only 0.0138 nats/rune and remains nonlinguistic. A matched model trained on the first 40,000 GP-encoded Gibran runes and evaluated on 88 held-out 256-rune windows scores **−9.13104 to −7.50851**. All 50 complete 256-rune windows in the proposed decode score below the worst held-out window:

| Decode direction | Candidate 256-rune windows | Minimum | Median | Maximum | At/above worst native window |
|---|---:|---:|---:|---:|---:|
| z^(-B) | 50 | −12.55901 | −12.26383 | −11.90189 | **0/50** |
| z^(+B) | 50 | −12.58511 | −12.29328 | −12.04139 | **0/50** |

Matched wrong-source alternatives are equally poor: reversing the base-60 table, using the published base-59 alternative, or using the conjugate field root gives full-stream mean scores between **−12.31860 and −12.26946**. None approaches the held-out native range. Interpreting each output pair as a raw byte 29a+b also fails: only 1,956/6,478 pairs in the best direction are within 0–255, so this output is not a byte stream.

The planted positive control encrypts 12,956 independent native-GP runes with the exact same source key and recovers all **12,956/12,956** exactly. The original input also re-encrypts exactly. These establish implementation correctness, not historical correctness.

## Decision and next source hunt

**Reject this direct periodic multiplicative GF(29²) p50-key interpretation.** It is fully reversible, source-anchored, and inexpensive, but it produces no authentic plaintext. The exact p50 bytes, 2013 BASE29 example, and p56 prime clock do not by themselves establish that the table is a key, that the cipher pairs runes globally, or that the DH operation should be transplanted into GF(29²).

The minimal missing input is therefore not another guessed key: it is an independently preserved original instruction or executable that binds the p50 table to a specific rune/field operation and fixes its alignment/restart rule. The next search should target such a contemporaneous Cicada artifact. Do not continue arbitrary exponent, phase, reset, or byte-to-rune sweeps from this negative.

## Reproduction

Run node sims/p50_gf29sq_byte_exponent_stream_sft.cjs with Node.js 22. It reads only the repository's original/normalized LP2 source corpus, p50 byte table, and the existing Gibran control. The implementation and all source assertions are in the script.
