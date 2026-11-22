# Cross-round DH15 order-56 and p50 prime-index key schedules

**Classification:** source-motivated, bounded original-input negatives. No unknown LP2 plaintext, authentic key, complete cipher, or destination recovered. Agent 39, 11 November 2026.

## Research decision

Two inexpensive compositions of already-authenticated Cicada material were tested against all 12,956 original unknown-page runes. Neither produces linguistic plaintext. The first is a new use of the 2013 Diffie–Hellman exponent 15 with the p3 quadratic field; the second combines the original p50 256-byte table with the solved p56 prime-minus-one operation. Retire these direct transports rather than expanding them with fitted phases, arbitrary projections, or new resets.

## 1. DH exponent 15 gives a 56-cycle in the p3 field

### Human-visible route

The original LP2 red triads give:

- p3: [13,23,2], hence \(13 + 23u + 2u^2 = 0\) and \(u^2 = 8 + 3u\) in GF(29²).
- p39: [27,5,15] = \(15(X-24)^2\), selecting the scalar 24.
- p54 begins with GP index 24, independently giving a natural state anchor.

The contemporaneous 2013 signed TCP challenge documents a worked DH exchange with modulus 23 and generator 5: server exponent 6 gives public share 8; client exponent 15 gives public share 19; both sides compute shared secret 2. Thus exponent 15 is a real, source-attested value, not a number invented from LP2.

The p3 field element \(u\) has multiplicative order 840. Applying the documented DH client exponent gives:

\[
g=u^{15}=9+23u,\qquad \operatorname{ord}(g)=56.
\]

The order exactly matches the 56 unresolved physical page positions p0–p55. With the p39/p54 value 24 as a seed, the frozen page state is

\[
S_p=24\,(u^{15})^{p-54\pmod{56}}.
\]

This is a plausible human solve-path hypothesis: recognize the quadratic field, notice the 2013 DH exponent in the red inscription, and obtain a 56-page state cycle. Its weakest assumption is that the exponent from a DH example over F23 should be reused as an exponent in GF(29²), then assigned one state per LP2 page. The original 2013 source does not prescribe that transfer or page-key use.

### Original-cipher test

The exact 56-state schedule was tested without fitting:

1. Per-page scalar additive keys from the field trace and norm, in both directions.
2. Per-page scalar multiplicative keys from the norm, in both directions. The norm is nonzero on all 56 states; the trace has zero states and was not used multiplicatively.
3. Full GF(29²) field keys on the 6,477 two-rune pairs after the original two-rune header. Pairing is global; a pair crossing a page boundary uses the page of its first rune. There are 54 such crossing pairs. Both additive directions and both multiplicative directions were tested.

The repository's Duko Round 27 quadgram score is larger for more English-like output. Raw ciphertext scores **−17.13157682** per letter.

| Frozen decode | Quadgram score / letter |
|---|---:|
| Page trace, additive − | −17.17740178 |
| Page trace, additive + | −17.20819984 |
| Page norm, additive − | −17.25571975 |
| Page norm, additive + | −17.23721730 |
| Page norm, divide by key | −17.21888575 |
| Page norm, multiply by key | −17.30774828 |
| Pair field, additive − | −17.25737429 |
| Pair field, additive + | −17.31664665 |
| Pair field, divide by key | −17.19529661 |
| Pair field, multiply by key | −17.23889197 |

Every tested output is worse than raw ciphertext and remains nonlinguistic. Their IoCs remain near the uniform 29-symbol expectation. The field-order coincidence is exact; the proposed use of that cycle as a page or pair key is not supported.

## 2. p50 bytes as prime indices for the solved p56 clock

A second simple human route combines the 32×8 p50 numeric table with the independently solved p56 operation. The table is exactly 256 base-60 cells, reconstructing 256 byte values in 0–255. The solved p56 page uses a consecutive-prime-minus-one stream, so a solver could plausibly try treating each table byte as a prime ordinal.

Two fixed, book-global 256-entry key schedules were tested:

\[
K_j=p_{B_j+1}-1,\qquad
K_j=p_{j+B_j+1}-1,
\]

where \(B_j\) is the original row-major p50 byte, \(p_n\) is the nth prime, and the key repeats every 256 unknown runes. Both additive directions were tested for each schedule.

| p50-to-prime schedule | Decode sign − | Decode sign + |
|---|---:|---:|
| Byte selects prime ordinal | −17.37903991 | −17.22863194 |
| Table position plus byte selects prime ordinal | −17.25504861 | −17.23384672 |

All four outputs score below the raw ciphertext. This rejects these direct uses of the table as a repeating prime-index key; it does not reject every possible use of the table.

## Reproducibility and limits

Run:

~~~bash
node sims/lp2_dh15_order56_and_p50_prime_index_sft.cjs
~~~

The script reads the original LP2 corpus, ink annotations, p50 base-60 grid, and the existing Duko quadgram control. It asserts the red triads, p54 anchor, p3 field arithmetic, exact 2013 DH test vector, 56-cycle, original rune/pair counts, and p50 byte range. It includes exact synthetic round-trip controls for the tested reversible transforms.

These are finite tests, not a claim that all DH-derived, field-based, or prime-clock mechanisms have been excluded. They do not test nonlinear feedback, a different source-selected transport, a hidden external key, or a different role for the p50 table. No new plaintext or independently authenticated encryption mechanism is established.

**Decision:** retain the exact order-56 arithmetic as a cross-round observation, but retire its tested direct page/pair-key uses. Retire the two direct p50 prime-index streams. Further work requires a primary clue that selects a different reversible operation or authentic key material, not more parameter fitting.
