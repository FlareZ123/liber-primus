# Two historically archived reverse-prime cookies: original LP2 inverse gate

**Classification:** finite negative on source-independent cookie bytes. No unknown LP2 plaintext, authentic key, complete mechanism or destination was recovered.

## Source and testable hypothesis

The historical 2013 participant-page archive preserves two exact 64-hex-digit cookie values assigned to the names **167** and **761**:

```text
167=6941f707ff39d259ff71657a79cb6b54c184d2f0455810109c1a960860bde0e6
761=7bc1e7805ccfa518920f0d94fc4e8f7dbd83287a03b337b89109cd2287befae5
```

Both are 32 bytes. **167 and 761 are prime decimal reversals**. The contemporaneous 2013 onion `count` service explicitly used prime-digit reversal and returned `761+` for `count the instar emergence`, a title carried by the 2013 audio file whose metadata included the later solved Parable. The cookie pairing thus provides an independently recoverable, thematically relevant two-key candidate, with its exact order/bytes fixed before consulting unsolved LP2. The only witness consulted was the secondary historical archive, not an authenticated original HTTP capture. Crucially, the archived 2013 server instructions do **not** identify these cookies as encryption keys, nonces or GP29 pads. The 2013 puzzles used literal XOR for other assets, while AES/ChaCha interpretations here are prospective alternatives rather than prescribed operations.

Source: [preserved 2013 p7amjopgric7dfdi onion cookie record and protocol](https://github.com/neuroretransmit/cicada/blob/main/2013/007-fourth-onion/README.md), [2013 original telnet `count` and `number` operations](https://github.com/neuroretransmit/cicada/blob/main/2013/004-first-onion/README.md).

## Fixed original-cipher tests and controls

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

**Decision:** A future attempt requires a contemporary source instruction designating the cookie bytes, their life cycle/encoding, and a particular key schedule or cipher. The finite key family is exhausted. Do not repeat direct cookie-periodic or zero/other-cookie-IV AES/ChaCha GP29/GP28 tests, or promote the reversible prime-name coincidence to an authenticated LP2 key.
