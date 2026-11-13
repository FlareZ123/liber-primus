# Direct 2012 signed *Valēte!* postscript RSA inversion of terminal LP2: original-source negative

**13 November 2026, Agent45. Source-motivated historical RSA candidate, no unknown-page plaintext or cryptographic key recovered.**

## Human solve-path rationale and source

The original signed 2012 Cicada final message ends with a three-line postscript integer. The contemporary solver [2012 source archive](https://github.com/cicada-solvers/neuroretransmit-cicada/blob/main/2012/011-valete/README.md) preserves the text and later-determined exact factorization. This was an unusually concrete, period-visible unresolved source number; the authors previously used RSA, and a GP29 base-29 positional integer is a source-native plaintext representation. Physical p55 contains exactly **76 original GP29 ciphertext runes**, forming a 368–369-bit integer which fits the postscript's 432-bit modulus.

The source does **not** name a p55 decoder, assign an exponent to the postscript, or explicitly select RSA for LP2. **65,537** is the conventional historical *candidate* exponent, not a verified Cicada instruction. This is a bounded source-conditioned hypothesis.

Concatenating the postscript's three original numeric lines yields:

    10412790658919985359827898739594318956404425106955675643739226952372682423852959081739834390370374475764863415203423499357108713631

The exact factors are:

- p = 99554414790940424414351515490472769096534141749790794321708050837
- q = 104593961812606247801193807142122161186583731774511103180935025763

Their product matches the postscript digit-for-digit; each prime has 216 bits and the product 432 bits.

## Frozen inverse and controls

Set N=pq, φ=(p−1)(q−1), e=65537, d=e⁻¹ mod φ. Pack each original page's GP0–28 indices into a positional base-29 integer in printed order, C=Σrᵢ·29^(L−1−i), then compute M=C^d mod N. Display M in complete minimal base29 GP digits and as 54 big-endian bytes, without dropping leading payload data. Reverse the *entire* input sequence once as a directional control, retaining all other parameters.

The positive control takes **76 original solved-p57 GP runes**, encrypts that 76-rune integer with the same N and e, and recovers **all 76 original indices** with the same RSA decryption. Every original p55/p56 candidate is in [0,N) and round-trips exactly under re-encryption. The p56 original ciphertext is a known independent solved-page input control and does not supply a key.

## Exact original terminal output

| Original input | Input bits | Output GP29 digits | Printable among 54 big-endian bytes | Longest printable run |
| --- | ---: | ---: | ---: | ---: |
| p55 76 original runes, source order | 369 | **88**, nonlinguistic | 17 | 2 |
| p55 76 original runes, reversed | 368 | **89**, nonlinguistic | 21 | 3 |
| p56 85 original ciphertext runes, source order | 413 | **89**, nonlinguistic | 23 | 4 |
| p56 85 original ciphertext runes, reversed | 412 | **89**, nonlinguistic | 23 | 6 |

The p55 normal output begins with 54-byte big-endian hex **02da37be27f7d1a5d315b42eeeef52b0** and its full base29 GP output begins with conventional transliteration **WHLUHRUSETXG**. The reversed p55 output begins **1fb6ab49dbe817c24b3526abfea279f7**. None is a direct readable plaintext in either natural display register. The outputs' lengths **88–89 GP runes** do not preserve p55's original 76-rune word segmentation, either.

This does not mathematically exclude RSA itself: any C < N is a valid RSA ciphertext representative. A 432-bit ordinary full-range RSA output would ordinarily be longer than 76 positional GP digits, so the observed original p55's 368–369-bit representative additionally fits a plain direct block transport poorly. An unknown padding or alternative format would require an independent instruction rather than arbitrary after-the-fact tuning.

## Decision

Retire the specific direct transport: original p55/p56 GP29 positional integer, both orientations, conventional 65,537 exponent, known 2012 postscript RSA factors, full modular private inverse, direct GP29 or ASCII text. No recoverable unknown LP2 plaintext, new destination or key follows. A source-selected exponent, different block specification or subsequent inverse would be a new independent hypothesis.

Reproduce with the self-contained [CommonJS SFT](../sims/lp2_2012_ps_rsa_p55_source_sft.cjs). It reads the unedited corpus, checks the original decimal modulus, uses exact BigInt arithmetic, tests both directions and an independently genuine solved-text RSA plant.
