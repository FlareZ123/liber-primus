# Two historically archived reverse-prime cookies: original LP2 rune and byte-table inversions

**Classification:** finite negative on two source-independent 32-byte cookie strings, applied to original rune ciphertext and the original printed 256-byte table. No unknown LP2 plaintext, authentic key, complete mechanism or destination was recovered.

## Source and testable hypothesis

The historical 2013 participant-page archive preserves two exact 64-hex-digit cookie values assigned to the names **167** and **761**:

```text
167=6941f707ff39d259ff71657a79cb6b54c184d2f0455810109c1a960860bde0e6
761=7bc1e7805ccfa518920f0d94fc4e8f7dbd83287a03b337b89109cd2287befae5
```

Both are 32 bytes. **167 and 761 are prime decimal reversals**. The contemporaneous 2013 onion `count` service explicitly used prime-digit reversal and returned `761+` for `count the instar emergence`, a title carried by the 2013 audio file whose metadata included the later solved Parable. The cookie pairing thus provides an independently recoverable, thematically relevant two-key candidate, with its exact order/bytes fixed before consulting unsolved LP2. The only witness consulted was the secondary historical archive, not an authenticated original HTTP capture. Crucially, the archived 2013 server instructions do **not** identify these cookies as encryption keys, nonces or GP29 pads. The 2013 puzzles used literal XOR for other assets, while AES/ChaCha interpretations here are prospective alternatives rather than prescribed operations.

Source: [preserved 2013 p7amjopgric7dfdi onion cookie record and protocol](https://github.com/neuroretransmit/cicada/blob/main/2013/007-fourth-onion/README.md), [2013 original telnet `count` and `number` operations](https://github.com/neuroretransmit/cicada/blob/main/2013/004-first-onion/README.md).

## Exact original rune-cipher inversions and controls

[Standalone Node22 original-input reproducer](../sims/cicada2013_cookies_original_inverse_sft.cjs); [successful manual CI run **42957366770**](https://github.com/FlareZ123/liber-primus/actions/runs/42957366770), archived artifact `2013-cookies-original-inverse`.

Inputs are all 55 rune-bearing physical LP2 pp0–55, **12,956 unsolved ciphertext symbols**, canonical original physical page boundaries, and the two unmodified archived cookie byte strings. No input is learned from unknown ciphertext. A deterministic XOR of the two cookies gives `12801087a3f677416d7e68ee8585e4297c07fa8a46eb27a80d135b2ae7031a03`.

- **48 literal-periodic candidates:** 167, 761 or their bytewise XOR, continuous or physical-page reset, direct additive GP29 or lossless predecessor-exclusion GP28, mod/scale byte-to-digit projection, both additive signs.
- **192 stream-cipher candidates:** each cookie as an AES-256-CTR or ChaCha20 key; zero IV or the other cookie's first/last 16 bytes; continuous or physical-page reset; the same two reversible GP29/GP28 families, projections and signs.

Every one of the **240** models exactly reencrypts its decoded original ciphertext. Native GP text constructed from the archived original first-release plaintext is also recovered exactly in a complete **12,956-rune synthetic plant**, whose full normalized `29×IoC` is **1.77917**. This checks implementation, not the historical origin of the encryption method. The original ciphertext baseline has normalized **0.9998735**.

| Original-input discriminator | Best configuration | Measured `29×IoC` |
| --- | --- | ---: |
| Top 6,000-rune training segment | cookie 761; ChaCha20; zero IV; per-page resets; GP28 predecessor exclusion; modulo projection; + sign | **1.02889493** (6,000-rune train) |
| Independent remaining 6,956 runes for that train winner | same frozen configuration | **1.02047025** (holdout) |
| Best independently ranked holdout output | cookie 761; AES-256-CTR; other-cookie last-16 IV; per-page resets; GP28 predecessor exclusion; scale projection; − sign | **1.02433181** (6,956-rune holdout) |

All tested variants remain near the uniform/ciphertext-level IoC and show no coherent GP-language prefixes. Their exact bidirectional re-encryption is a property of the implemented permutations shared by wrong keys. The source-independent candidate keys therefore **do not work under these 240 direct fixed key/IV/transport readings**. No conclusion follows for other source-specified derivations or genuinely independent transport operations.

## Independently printed 256-byte table as a block-cipher target

A distinct, more directly byte-aligned original target is the **32×8 base-60 numerical table** printed on physical LP2 pp49–51, which decodes to exactly **256 bytes**. Unlike the 29-symbol manuscript text, these bytes could directly be encrypted block data: 256 contains exactly sixteen 16-byte AES blocks. The source's 161 distinct byte values and 103 printable ASCII bytes are consistent with an opaque byte string. This possible historical use of the two 2013 cookie values remains a hypothesis, with **no source instruction identifying either cookie as the table key**.

The standalone [original table and native-byte-plant AES/periodic-XOR gate](../sims/cicada2013_cookie_grid256_sft.cjs) performs the exact base-60 source-token check and tests **45 source-frozen models**: both original 32-byte cookies as AES-256-ECB keys (2), AES-256-CTR/CBC/OFB/CFB under five fixed zero/other-cookie/self-cookie half-IVs (40), and literal periodic XOR with each cookie or their XOR (3). Every tested byte transport exactly reencrpyts its own recovered original data, and each recovers an independently encrypted **256-byte ASCII plant exactly**. [Manual CI **42958771684**](https://github.com/FlareZ123/liber-primus/actions/runs/42958771684) passed; the full 45-model output is the `2013-cookie-grid256-original` artifact.

The strongest original candidate by printable-byte count is a tie at **104/256 printable**, under 167/AES-OFB/self-tail IV and 761/AES-CTR/self-head IV. The unchanged table itself has **103/256 printable**, and no original decrypted output begins with one of the predeclared common plain-text, archive or image file signatures (PGP armor, English `Hello`, gzip, zlib, PNG, ZIP, PDF, bzip2, GIF or JPEG). A random independent 256-byte vector has mean **95** printable bytes and standard deviation approximately **7.7**, so a maximum of 104 out of 45 candidates is not evidence of structured ASCII. An arbitrary unknown binary plaintext would not necessarily have a recognizable header; this is a bounded exclusion of straightforward historical-key reuse as ordinary printable or well-known-file byte material, rather than a proof these cookies can never operate on the table.

## Decision and research implications

The historical 2013 pair is now covered under **240** lossless direct GP29/GP28 original rune inverses and **45** original byte-table cipher/transposition-independent transport inverses. The attached reproducible programs preserve exact keys, source-anchored IVs, original inputs, source-fixed scopes, and positive controls. None produced original source-identifiable plaintext or a recognizable byte payload. Future work requires a separate contemporary instruction designating the cookies, their encoding/secret status, and the key schedule or intended byte-stream role. Do not repeat these fixed variants merely to enlarge an unmotivated key menu or treat the reversible prime names as an authentic LP2 key.
