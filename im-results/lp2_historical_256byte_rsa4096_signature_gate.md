# Four historical 256-byte objects: exact RSA-4096 two-share signature gate

**Classification:** finite original-byte cryptographic rejection of one direct combination. **No unknown LP2 plaintext, key, signature, or destination is recovered.** This investigation builds on the established negative 256-ink-event + 256-p50-byte signature test at [the separate ink/grid gate](lp2_ink_grid_4096_signature_gate.md); it tests different historical objects.

## Clue-constrained hypothesis

Three source-attributed pre-LP2 256-byte streams are retained in [the historical hidden-service byte manifest](../resources/cicada-hiddenservice-256-candidates.json) and labeled onion2, onion3, and onion4. The original LP2 pp49–51 table supplies a fourth **256-byte** object as an inferred base60 decoding in [the canonical grid](../resources/liber-primus/base60-grid.json). The contemporaneous original Cicada public signing key is RSA-4096 with modulus width **512 bytes**, exponent **65537**, fingerprint `6D854CD7933322A601C3286D181F01E57A35090F` ([original key](../resources/control/cicada-3301-public-key.asc)). Thus pairing any two published 256-byte objects gives the width of a Cicada RSA signature.

This cardinality is a *hypothesis*, not an authenticated puzzle instruction. The source does not say these byte objects are signature shares, establish their pair order, or select RSA rather than another operation.

## Frozen test and independently authenticated control

The exact finite family is all **12 ordered pairs of distinct original objects**, concatenated in their recorded row-major/byte order with no truncation, byte rearrangement, whitening, key fitting or padding. Interpret each 512-byte candidate as a big-endian RSA signature integer `S`. When `S < n`, compute `S^65537 mod n` and inspect the complete 512-byte output for standard PKCS#1-v1.5 signature encoding `00 01 FF... FF 00 DER-DigestInfo`; when `S >= n`, the 512-byte value is an invalid RSA signature representative.

A genuine independently preserved [2013 Cicada-signed final-test message](../resources/external/2013-do-not-share-this-information-2.asc) supplies the positive control. With precisely the same parsed RSA modulus and public exponent, its original 4096-bit signature recovers **`00 01 FF...`** followed by the expected SHA-1 DigestInfo structure. The source key's OpenPGP v4 fingerprint is reconstructed from the original public-key packet.

The full one-file CommonJS test, original source loading and positive control are in [`sims/lp2_256byte_historical_rsa4096_signature_sft.cjs`](../sims/lp2_256byte_historical_rsa4096_signature_sft.cjs).

## Original-input outcome

The independent modular-exponentiation execution gave **nine candidates with `S<n`**, **three invalid representatives `S>=n`**, and **zero PKCS#1-v1.5 signatures**. The first 14 bytes of each recovered block, or the calculated modular block for the three representatives that must be rejected, were:

| First stream | Second stream | `S<n` | Public exponentiation begins |
| --- | --- | --- | --- |
| onion2 | onion3 | yes | `86f9ad790980d725bbfccd6e1e6f` |
| onion2 | onion4 | yes | `78006b549d1740492aa1fe7e24b5` |
| onion2 | p50 | yes | `57a7734ea8b721aa9e8c12485c36` |
| onion3 | onion2 | yes | `696874671424b6d067362f08f2a7` |
| onion3 | onion4 | yes | `ad7dabf4fd46d0d9b1a67a4361cd` |
| onion3 | p50 | yes | `01f357f080e1100d62c4207ca6ff` |
| onion4 | onion2 | yes | `9bb64693c430940ac400ea16be15` |
| onion4 | onion3 | yes | `78c02e128c0716b0f492cea4f8cb` |
| onion4 | p50 | yes | `4a0cddc64238e406ecd87a2d7d46` |
| p50 | onion2 | **no** | rejected `S>=n` |
| p50 | onion3 | **no** | rejected `S>=n` |
| p50 | onion4 | **no** | rejected `S>=n` |

The three invalid representatives are rejected before interpreting any resulting modulus-reduced value as a signature. All nine admissible exponentiations fail immediately at the required `00 01` prefix; a hash or message interpretation cannot rescue them.

## Decision

**Reject the exact natural two-original-stream RSA signature interpretation.** The 256+256 length observation has not recovered plaintext, a usable key, or a creator-specified operation. It would be unjustified to expand the hypothesis into byte permutations, rotations, independent S-boxes, or password hunting without an independently source-selected manipulation. The four source objects remain available for other historically justified operations; this test does not exclude ordinary encryption or secret sharing generally.

The execution using the same source bytes, OpenPGP MPI parsing and modular arithmetic was performed in the linked JavaScript runtime; the separate repository CommonJS SFT was committed but has not yet been confirmed by a GitHub Actions run.
