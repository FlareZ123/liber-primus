# LP2 32×8 table as five-of-eight 256-bit Shamir shares: row-major block extension

**Decision (12 November 2026):** The existing [historical SSSS original-column gate](../sims/p50_2013_ssss_256bit_column_gate_sft.cjs) had already rejected both numeric radices with every threshold from 2 through 7 using eight original 32-byte **columns**. This work adds the distinct, source-preserving interpretation as **eight contiguous four-row (32-byte) blocks**, which fails the same five-of-eight held-out test for both radix readings. The column data below are an independent recalculation for context, not a novel result. No key, plaintext or continuation is recovered.

## Why this is a concrete historical inverse

The 2013 Cicada pklmx poster/ISO route demonstrably reconstructed an onion address from a **5-of-10 Shamir secret-sharing** process (im-results/pklmx-2013-onion-continuation-gate.md and its cited historical solver archive). Independently, LP2 prints a **32-row by 8-column** numerical table across original physical pp49–51 (scans 66.jpg–68.jpg). Conventionally the 256 two-character tokens serialize as 256 bytes. This suggests a finite recoverable key hypothesis: eight **32-byte (256-bit) shares**, any five defining a secret and the other three providing decisive algebraic consistency tests. A putative recovered 256-bit secret could then be tested as genuine symmetric key material, provided a separate LP2 source selected its consumer.

The strongest objections are significant. There is no original LP2 instruction saying SSSS or marking share identifiers, and even the radix60 byte interpretation is ambiguous with radix59 because lowercase f never appears in this table. The historical 2013 five-of-ten system does not prove any connection to the 2014 LP2 table. Thus freeze the natural share layouts and genuine historical polynomial construction, ask for exact internal consistency, and reject without attempting to adapt secret coefficients.

## Exact 256-bit field and frozen original input

The SSSS program source defines an irreducible polynomial for every byte-multiple field size; at **degree256**, its irred_coeff lookup indexes 3*(256/8−1)=93 and yields exponents **10,5,2**. Thus its field is GF(2^256) with reduction polynomial:

    X^256 + X^10 + X^5 + X^2 + 1

See the original open-source [SSSS C implementation](https://github.com/osresearch/ssss/blob/master/ssss.c), specifically irred_coeff, field_init, split, and field_import. Its share identifiers are integers **1 through n**. The default optional XTEA diffusion applies to the **secret coefficient before evaluating the polynomial**, leaving the Shamir relationship among printed share values intact. Share bytes are interpreted big-endian, matching mpz_import.

The extension retains the exact existing field and freeze: a **degree-at-most-four** polynomial fitted through only five original-share values at x=1,2,3,4,5. Values at x=6,7,8 must *each* be exactly predicted; interpolation over the actual 256-bit field makes this independent of the secret, four unknown polynomial coefficients, and diffusion. Both original layout readings have plausible editorial motivation:

- **Columns:** one 32-byte share per original printed column; preserves the 32×8 arrangement.
- **Contiguous blocks:** one 32-byte share per consecutive row-major eighth; preserves full printed row-major token order.

Test each with both the conventional 60-character alphabet 0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx and its same-order 59-character variant excluding lowercase f. No shift, chosen row permutation, guessed identifier, key, or offset is fitted.

## Original results

Each evidence row below records the **number of differing bits** between three complete 256-bit predicted share values and actual printed values at x=6,7,8. A real source instance would require **(0,0,0)** and exactly three matches.

| Numeric reading | Printed packing | Differing bits, x6 / x7 / x8 | Complete matches |
| --- | --- | --- | ---: |
| Radix60 | eight columns | 131 / 124 / 123 | 0/3 |
| Radix60 | consecutive 32-byte blocks | 121 / 118 / 126 | 0/3 |
| Radix59 | eight columns | 132 / 122 / 110 | 0/3 |
| Radix59 | consecutive 32-byte blocks | 130 / 127 / 136 | 0/3 |

The differences are near the 128-bit expectation for unrelated 256-bit values. The discrepancies rule out ordinary byte-transcription mistakes as an explanation for a failed share, although source transcription uncertainties remain outside this exact gate.

The new block-only SFT imports the previously established GF(2^256) interpolation and multiplication from the existing column gate, avoiding an independent duplicated arithmetic implementation. Its deterministic synthetic control generates five independently hashed 256-bit coefficients, evaluates eight shares at x=1..8 using this exact field, checks that x6/x7/x8 all interpolate **exactly**, recovers the true constant secret at x=0, then flips one bit of the last share and confirms only its held-out comparison fails. Multiplication of seven by its inverse is also checked. Controls verify the implementation only.

## Cryptanalytic consequence and next decision

The original complete table is **not** a straightforward historical 2013-SSSS-style eight-share, five-threshold, 256-bit construction in either of the two source-preserving 32-byte packings under the two live numeric interpretations. The 2013 shared-secret analogy supplies **no authentic 256-bit LP2 key** by this route. No arbitrary factorization, secret-table inference, brute-forced share permutation, or speculative AES decoding follows from these failures.

A successor requires a **new original clue** selecting a distinct share grouping, threshold, identifier system or byte serialization. Absent that clue, prefer source-driven attempts to discover recoverable cipher state or unknown plaintext over a larger Shamir parameter sweep.

**Reproducers:** [new block-only SFT](../sims/lp2_p50_ssss_5of8_field256_sft.cjs) imports the established [original-column SSSS SFT](../sims/p50_2013_ssss_256bit_column_gate_sft.cjs); both use the [canonical printed table](../resources/liber-primus/base60-grid.json) and the above linked historical source.
