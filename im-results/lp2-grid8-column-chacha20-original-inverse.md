# Eight grid-column ChaCha20/256 keys on the eight LP2 text sections

**Original-cipher decision (12 November 2026, Agent18): no plaintext or genuine key selection.** A source-count-motivated stream-cipher construction provides no GP29 language signal even after the **best possible injective assignment** of its eight printed grid-column keys to the eight historical text sections. This specifically bounds the direct eight-column ChaCha20 interpretation. It does not reject a cipher chosen by a new source clue, alternate key derivation, or the original nine visual-chapter clock.

## Locked input and direct route

The LP2 original pp49–51 print 256 60-base-looking entries in a 32×8 table. The repo's conditional **base60** reading yields 256 bytes. Read each of the **eight columns vertically** as one uninterrupted 32-byte candidate key. The original transcript-derived eight text sections have **[729, 1145, 1738, 1894, 1021, 1433, 1680, 3316]** GP29 ciphertext runes, 12,956 in all. Assign one of the eight candidate keys to each section with no reuse. The physical source's independently measured red visual-heading chapters instead number **nine**; an eight-key mapping is therefore a *hypothesis*, not an authenticated source clock.

ChaCha20 was available by 2014; however, no original LP2 image, signed Cicada text or Stage11 index actually names it, specifies a nonce or assigns table columns to cipher sections. This is a single executable candidate family that the source geometry permits but does not select.

The exact frozen implementation uses standard **ChaCha20/256**, initial counter zero, **all-zero 64-bit nonce**, resetting for each section. Its 16-byte OpenSSL IV contains a little-endian counter followed by a nonce. Convert each output byte to GP29 through `byte % 29`, with the two key signs and two proposed reversible rune registers:

- **Direct:** `P[i] = (C[i] ± K[i]) mod29`.
- **Ciphertext difference:** `P[i] = (C[i] − C[i−1] ± K[i]) mod29`, with preceding `C=0` at each section start.

Both are simple GP29 operations; the difference form permits the previously observed anti-repeat structure to enter the inverse. The file tests all four models and, for each, computes the **exact optimal one-to-one eight-section assignment** of the eight grid columns by a subset dynamic program maximizing total identical-rune pair counts. This gives the hypothesis much more freedom than literal left-to-right column order, while preventing arbitrary reused per-section keys.

## Executed results on all 12,956 original GP runes

| Frozen register | Sign of subtracted key | Optimal columns in section order (0-based) | Pooled section GP29 IoC |
| --- | --- | --- | ---: |
| Direct | + | 4,7,2,5,6,0,1,3 | **0.034589566** |
| Direct | − | 6,3,2,4,0,5,1,7 | **0.034566845** |
| Ciphertext difference | + | 3,0,4,5,6,1,2,7 | **0.034643211** |
| Ciphertext difference | − | 3,6,5,7,4,0,1,2 | **0.034668693** |

The best individual section from *any* column and *any* tested register/sign has IoC only **0.035205535**. The pooled values remain very near the uniform 29-symbol collision baseline of **1/29 ≈ 0.034482759**, far from the roughly **0.06** native-GP English IoC seen in the repository's independently sourced positive controls. No readout supplies plausible plaintext or language-concentrated GP symbol frequencies. This is an evidential negative for these four fixed source/table/cipher constructions, rather than a universal English-language impossibility theorem or a calibrated familywise p-value.

**Exact positive controls and executed CI:** [standalone Node 22 CJS reproducer](../sims/lp2_grid8_chacha20_column_inverse_sft.cjs) uses built-in `node:crypto` `chacha20`; it first passes the standard 64-byte all-zero ChaCha20 keystream vector, then enciphers the independently solved **p57 plaintext** with an actual original grid-column key and recovers **every rune exactly in all four variants**. The complete original candidates also round-trip through their corresponding forward encoder for all 12,956 positions and all 256 single-section/key/model evaluations. The actual [GitHub Actions run **43153333032**](https://github.com/FlareZ123/liber-primus/actions/runs/43153333032) completed successfully, prints all fitted assignments and section scores, and executed the solved-page and known-answer tests.

The code does not write data or require dependencies. The [manual-only job](../.github/workflows/lp2-grid8-chacha20-direct-manual.yml) has no push trigger.

## Decision

The fact that **eight** columns can each yield a 256-bit key is a geometric coincidence until another creator-side clue selects a stream cipher and an eight-section clock. Even after the exact global assignment optimizer, the original cipher does not reveal English-like rune frequencies. Avoid expanding this into 8!×nonce×stream-cipher sweeps; require a source-selected nonce/clock/consumer or a genuinely different visible operation before testing dependent variations. Retain the printed table as independent source evidence, and keep this bounded negative in supporting results rather than promoting it to decrypted plaintext.
