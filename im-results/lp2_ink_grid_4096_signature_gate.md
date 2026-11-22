# 256 ink events plus 256 table bytes as a Cicada RSA4096 signature

The original LP2 225 red runes and 31 thirteen-dot punctuation marks produce **256 chronological source events**. The separate printed 32×8 numeric table produces **256 source bytes**. Their combined length is **512 bytes**, exactly the width of the original Cicada 3301 **RSA4096** key. This cardinality suggests a specific finite cryptographic question: do the two published source streams combine into a valid Cicada signature, recoverable using the historical public key? The connection is a hypothesis, and no original cipher instruction authenticates that combination.

**Result:** the original pair does **not** yield a valid raw 4096-bit PKCS#1 v1.5 signature under the declared canonical reading family. The test also finds no PSS trailer candidate. This is a bounded negative, **not** a rejection of every cryptographic use of the streams.

## Frozen exact family

Read the ink events from original physical pages 0–57 in page/rune order, counting the thirteen-dot mark at the position just before any rune at the same source coordinate; include the one black mark. Preserve **225 red rune events** and **31 punctuation events**. Map runes to either their one-based GP ordinal (1–29) or original GP prime (2–109); map dot events to either 13 or 31. This gives four reproducible candidate byte streams of length 256. Retain all 256 printed base60-decoded table bytes independently, following the source token and row order.

For each event encoding, reverse or retain the two component streams independently and combine them by one of **four** layouts: event-first concatenation, grid-first concatenation, event/grid alternating bytes, or grid/event alternating bytes. Exactly **64** complete 512-byte candidate integers result, with no fitted keys or language-score selection. **48** integers are smaller than the RSA modulus and admissible as conventional signature representatives. For each, compute the original 4096-bit public exponentiation with the authentic Cicada key and inspect the decoded bytes for strict `00 01 FF...(≥8 FF) 00` PKCS#1 v1.5 padding. None passes; no exponentiated candidate ends in the necessary PSS marker byte `BC`.

**Positive authenticity controls:** this same extracted original Cicada 4096-bit modulus and exponent 65537 correctly recover v1.5 signature padding from the repository's independently preserved signed messages dated **2 May 2014** and **2017**. This verifies that the public-key parsing and exponentiation recognize signatures that the actual Cicada materials use.

## Decision

The natural two-stream concatenation/interleaving hypothesis is exhausted within these 64 settings. Reversing only one source stream, choosing GP primes rather than one-based rune indices, or replacing 13-dot stencil values with 31 does not rescue a raw Cicada signature. More elaborate byte maps, hashes, source-side encodings, a different key or non-signature cryptography remain open. Treat the 512-byte equality as retrospective until an independent original instruction selects an operation. This test recovers **no unknown Liber Primus plaintext, key or continuation**.

[Single-file CommonJS SFT](../sims/lp2_ink_grid_4096_signature_sft.cjs) using original [ink](../resources/liber-primus/lp2-ink-annotations.json), [GP corpus](../resources/liber-primus/lp2-corpus.json), [grid](../resources/liber-primus/lp2-grid-256.json), [historical public key](../resources/historical/cicada-3301-2012-public-key.asc) and two source-native signature controls. This extends the separately completed [half-width 256-byte grid-only RSA test](../sims/grid_rsa_pgp_signature.cjs) without duplicating its input model.
