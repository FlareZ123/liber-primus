# Exact original p49–51 2048-bit panel as a Cicada RSA-4096 factor: finite negative

**Agent4, 23 November 2026.** This tests a specific historically anchored candidate for recovering the original Cicada 3301 OpenPGP secret RSA factor. It is a complete arithmetic exclusion for the four source-natural byte orders and all ten contested `I/l` glyph cases. **No RSA factor, LP2 key, decrypted unknown rune or final destination was recovered.**

## Why this operation

The original LP2 physical p49–51 printed table has **32 rows × 8 columns = 256 two-character numeral cells**, conventionally decoded as **256 bytes = 2,048 bits**. One of the two RSA primes used to build a **4,096-bit** signing/encryption modulus would ordinarily have that size. A human familiar with Cicada's PGP verification key and the numeric table could test whether those published original bytes were deliberately its missing prime factor. A successful nontrivial GCD with the verified public modulus would instantly recover the full private RSA key and prove a useful cross-artifact link. This is explicitly a *candidate purpose* for the numeric table, not an authenticated creator instruction.

## Immutable inputs

1. LP2 printed grid: [`resources/liber-primus/lp2-grid-256.json`](../resources/liber-primus/lp2-grid-256.json), source-image-adjudicated against physical p49–51 original scans [`66.jpg`](../resources/liber-primus/66.jpg), [`67.jpg`](../resources/liber-primus/67.jpg), [`68.jpg`](../resources/liber-primus/68.jpg). Use the source-printed two-character base60 tokens, source-order rows, and the ten real `I/l` second-glyph alternatives at zero-based global cell positions **2, 25, 45, 50, 90, 165, 175, 182, 199, 246**. Each toggles base60 digit **18 ↔ 47**, a byte displacement of **29**. This grants every one of the 2¹⁰ possible case assignments, including the already adjudicated source case, rather than fitting glyph cases to the public key.
2. Cicada's authentic historical OpenPGP **primary public key** (OpenPGP packet tag6) and **encryption subkey** (packet tag14), each RSA modulus **4,096 bits**, exponent **65,537**. The primary fingerprint is **`6D854CD7933322A601C3286D181F01E57A35090F`**. Public armored source, embedded byte-for-byte in the test for a standalone build: [Cicada historical public key](https://github.com/krisyotam/cicada3301/blob/main/pgp/key/cicada-3301-public-key.asc) (blob `d44aec389e2f346c6b9d149d4c61e890f62979c9`). The test independently parses complete OpenPGP key packets/MPIs and SHA-1-fingerprints the primary key.
3. Four fixed simple table orders: row-major top-left→bottom-right; complete reversed row-major; column-major top→bottom then left→right; complete reversed column-major. Each gives one 256-byte unsigned big-endian candidate. Reversal covers the corresponding little-endian interpretation.

The test computes exact positive-integer **`gcd(candidate, N)`** for each key modulus `N`. If one candidate were a genuine RSA factor (or shared any factor with `N`), GCD would exceed one, independently of padding, plaintext or private exponent.

## Exact original results

| Dimension | Number |
|---|---:|
| Original table cells | 256 |
| Candidate factor width | 2,048 bits |
| Original alphabet `I/l` ambiguities granted | 10 |
| All source glyph-case assignments | 1,024 |
| Fixed direct table read orders | 4 |
| Authentic RSA-4096 public moduli | 2 |
| **Exact original GCD evaluations** | **8,192** |
| **Nontrivial GCDs** | **0** |

**Every one of the 8,192 tested values is exactly 1**. The script also verifies `gcd(pq,p)=p` and `gcd(pq,q)=q` on independently chosen RSA-sized-operation controls (small for runtime), ensuring the nontrivial-factor detection is operative. The first original table row under canonical source decoding is `[203,231,167,186,97,237,126,183]`.

[Self-contained original-source, public-key-fingerprint and full-case CommonJS SFT](../sims/lp2_p50_rsa4096_factor_original_sft.cjs) runs under Windows Node22 and uses only built-in modules, including `node:crypto`. It asserts both original RSA public-key packet structures and exactly 8,192 ordinary GCDs; it exits on any surprise nontrivial factor.

## Interpretation and next decision

The original 256-byte panel **is not a factor of either authenticated historical Cicada public RSA modulus** under the four unencoded, natural physical readings, regardless of the ten `I/l` case choices. This excludes an independently conceivable shortcut to obtaining the creator's RSA secret key via the original printed panel. Alternative nonliteral encodings, private keys unrelated to Cicada's authentic public moduli, and source-selected permutations remain outside this finite test; adding arbitrary secret transforms purely to rescue the factor proposal would lose its only source-motivated simplicity.

This finding leaves the creator's purpose for the 256 original cells unresolved and does not change the authoritative current fact that all 56 unknown LP2 pages remain undeciphered. Further priority belongs to **discovering a first-party typed instruction or independently decodable unknown original plaintext**, rather than searching more arbitrary factor renderings.
