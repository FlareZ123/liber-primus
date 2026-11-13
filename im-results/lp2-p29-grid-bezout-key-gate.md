# Original p29 and 256-byte table: canonical Bézout inverse

**Agent30, 13 November 2026. Classification: exact original-source GF(29) calculation with a bounded negative direct-key test.** This recovers no unknown LP2 plaintext, author-selected key, complete cipher or destination.

## Independent source objects and executable operation

Original physical LP2 p29 (46.jpg) contains **277 GP29 ciphertext runes**. Original physical pp49–51 print a **256-byte 32×8 number table**, SHA-256 **3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290**. The independently source-marked p39 red triad corresponds to *27+5X+15X²=15(X−24)² over GF(29)*, a factor already proven to divide both p29 and the table; see the upstream [p29 marked-factor source analysis](lp2-page29-marked-quadratic-crosslink.md).

This shared factor suggests computing a unique modular-inverse certificate via the **extended Euclidean algorithm**. The original printed rune indices become descending polynomial coefficients A, with degree 276. The unchanged original table bytes reduced modulo29 become descending polynomial coefficients B, with degree 254 because the first original printed byte 203 reduces to zero.

The complete source-derived result is:

- **GCD:** *G(X)=X²+10X+25=(X+5)²*, monic over GF(29).
- **Canonical Bézout equation:** *S(X)A(X)+T(X)B(X)=G(X)*, with unique minimal-degree registers satisfying *deg S < deg(B/G)=252* and *deg T < deg(A/G)=274*.
- **S:** 252 GP29 coefficients, degree251, rune-index IoC **0.035129323974**. First printed-as-GP coefficients: JXBNMUXEEEOTAEACAEJLAEEYLLUWEAFOENGCTHAEHCEFHBOHAUNIYHAENTHE.
- **T:** 274 GP29 coefficients, degree273, rune-index IoC **0.033956311329**. First coefficients: ENUGAEBEIJIEADYRLSIPMBIBOEOOETHIEOJHYWSLCTHCINGIIAARFNGPNRLEO.
- **248 exact polynomial Euclidean divisions.** Exact multiplication and addition reconstruct the monic quadratic G, with zero polynomial remainder from each original object divided by G.

There are no guessed cryptographic keys, skipped runes, word edits or fitted language parameters in this construction. It is a legitimate inverse of the two original mathematical objects. Neither manuscript nor authentic historical clue currently instructs a solver to apply Euclid to them, so it is **not an authenticated intended decoding operation**.

## Frozen direct-key consumer

Treat S or T in the algorithm's natural ascending-power order as a GP29 positional additive key, with either sign and no phase adjustment, and apply to the 238 original p36 ciphertext runes. Independently solved p56 (85 runes) checks whether this simple key transfer can recover known plaintext, while direct-clear p57 (95 runes) checks for an unchanged final page.

| Exact source-derived consumer | p36 output IoC | Exact known p56 plaintext | Unchanged p57 positions |
| --- | ---: | ---: | ---: |
| p36 − S | 0.034641705 | 6/85 | 3/95 |
| p36 + S | 0.034003475 | 2/85 | 3/95 |
| p36 − T | 0.034677162 | 4/85 | 3/95 |
| p36 + T | 0.034358047 | 6/85 | 3/95 |

Unchanged p36 ciphertext IoC is **0.035989079**. All four direct decryptions remain ciphertext-like. Neither candidate reconstructs more than six symbols of the authenticated p56 85-rune plaintext, while none leaves p57's 95 direct cleartext runes unchanged. These tests reject precisely this source-derived direct additive consumer. The p57 check assumes an operation across the clear final page and need not hold for a future staged cipher.

A native GP English positive plant encrypts and decrypts an independent **238-rune Shakespeare excerpt** under each fixed S and T, recovering **238/238** in both roundtrips. This confirms a functioning inverse and excludes an arithmetic-code error as the source of the direct-key failure.

### Natural polynomial-convolution consumer

A second, genuinely different reversible operation is suggested by the polynomial source itself: treat original page ciphertext as a polynomial in **the same descending-power convention**, hypothesize that it is a multiplication of original plaintext by the Bézout key S or T, truncated to the first n powers in ascending-degree coordinates, and invert by **formal power-series division modulo X^n**. Both fixed keys have nonzero constant coefficients, so inversion is exact and does not need fitting. This is a source-led candidate, but still lacks an author-provided operation selector.

| Polynomial deconvolution | p36 output IoC | Exact known p56 plaintext | Unchanged p57 positions |
| --- | ---: | ---: | ---: |
| p36 ÷ S mod X^238 | 0.035279935 | 1/85 | 2/95 |
| p36 ÷ T mod X^238 | 0.033400702 | 3/85 | 7/95 |

Both outputs remain near-uniform, and both fail the known-p56 plaintext check. Original ciphertext is reconstructed exactly by multiplying each output by its fixed key modulo the page length. A native-English 238-rune polynomial product plant similarly recovers **238/238** under both inverse keys. This closes the simplest actual polynomial-key operation as well as the direct additive use.



## Decision and reproduction

The exact Bézout registers are newly computed intermediate original-source algebra. **No original cipher page is decrypted.** The observed p29/grid common factor was already established; the new registers provide neither recognizable text nor a historical key selector. Both exact source-key consumers, direct addition and polynomial convolution, are negative against the original source and independently solved plaintext. Do not extend this to arbitrary phases or other uncontrolled key-tuning without an independently motivated operation.

Reproducer: [single-file CommonJS Bézout gate](../sims/lp2_p29_grid_bezout_key_sft.cjs), reading original [LP2 rune corpus](../resources/liber-primus/lp2-corpus.json) and [byte table](../resources/liber-primus/lp2-grid-256.json). It asserts the original table SHA, exact polynomial identity, degree constraints, both additive and polynomial-convolution original-input results, exact re-encipherment, p56 matches and native-GP positive plants. The upstream complete factor analysis is [2013 BASE29 and table factors](2013-base29-gf29-grid-factor.md).