# GF(257) p50/p55 polynomial-factor gate

**Classification:** bounded negative; no plaintext or new cipher mechanism recovered.

## Hypothesis

The current GF(257) source bridge identifies a 256-cell p50 table, a 76-rune p55 page, and a 32×8 table whose perimeter and interior contain 76 and 180 cells respectively. The p0 FFF-derived source bridge motivates GF(257), while the exact 76/180 partition suggests a concrete factorization test:

- represent the 256 p50 bytes as a degree-255 polynomial over GF(257), in the same high-first order used by the existing spectral report;
- represent the 76 p55 runes as the 76 non-leading coefficients of a monic degree-76 polynomial;
- divide p50 by that polynomial; the quotient has 180 coefficients, exactly the size of the p50 interior.

If this is the intended relation, the remainder should be zero and the quotient should reproduce the interior cells. This is a discriminating test, not a claim that the pages must be polynomial factors.

## Independent starting evidence

- p50 is a printed 32×8 base60 table, normalized to 256 byte values.
- p55 contains exactly 76 runes.
- The p50 table has a 76-cell perimeter and 180-cell interior.
- The GF(257) spectral/source bridge is documented in `im-results/lp2-gf257-spectral-border76-p56-source-bridge.md`.

## Test

The SFT performs exact polynomial long division in GF(257), with monic divisors. It tests:

1. p55 GP0 rune indices, prime weights, and totient weights (prime minus one);
2. forward and reversed coefficient order;
3. both coefficient signs and alternating signs;
4. forward and reversed p50 coefficient order;
5. the p50 perimeter sequence itself as a 76-coefficient divisor, under the same orientation/sign variants.

This is 64 deterministic variants. For every division, it checks whether the remainder is identically zero and whether the 180 quotient coefficients match the p50 interior in forward or reverse order.

## Result

- 64 variants tested.
- **0 exact factorizations.**
- Best quotient/interior agreement: **3 of 180** coefficients.
- The strongest-looking partial match is therefore no better than incidental agreement; the proposed exact product structure is rejected.

This rejects only the direct monic polynomial-factor hypothesis. It does not invalidate the independently observed p50 GF(257) spectral zero or the 76/180 geometry; those remain structural observations without an established plaintext operation.

## Decision

Do not continue tuning coefficient signs, orientations, or encodings to rescue this factorization. A successor hypothesis must provide an independent source instruction for a different algebraic operation and a locked prediction on original ciphertext.

## Reproduction

```bash
node sims/agent43_gf257_p50_p55_polynomial_factor_gate_sft.cjs
```
