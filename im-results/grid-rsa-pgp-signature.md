# Cicada PGP RSA tests of the 256-byte base-60 grid

**Classification:** three exact bounded negatives on distinct cryptographic interpretations; no LP2 plaintext or private key recovered. The direct signature-style, direct 2048-bit factor, and direct private-exponent readings tested here are all rejected.

## Source and signature-style hypothesis

The 32×8 base-60 grid spanning LP2 pages 49–51 supplies exactly 256 bytes. A previous independent investigation, Dukotah's analysis/round16/zeroFP/zerofp_tests.py (E-01), proposed checking the grid against Cicada's authentic OpenPGP RSA public key but left that check unperformed because the 4096-bit moduli were not loaded. Its prose incorrectly suggested that applying exponent 65537 to a 2048-bit input under a 4096-bit modulus would leave the input unchanged. Modular exponentiation does apply; that omission is now closed.

The narrow signature-style construction treats the 256 bytes as an unsigned integer s and computes m=s^65537 mod n using Cicada's published signing RSA modulus or encryption-subkey RSA modulus, then checks for PKCS#1 v1.5 DigestInfo or the RSA-PSS BC trailer. Tested directions are original or reversed bytes, in low or high half of a 512-byte input. High-half readings exceeding n are invalid and explicitly skipped.

The source public key is the Cicada 3301 PGP public key with independently published fingerprint **6D854CD7933322A601C3286D181F01E57A35090F**. The parser verifies this SHA-1 OpenPGP v4 fingerprint and identifies two 4096-bit RSA moduli, each with exponent 65537.

Eight input/key-direction/alignment combinations exist, of which two (high-half forward in either modulus) exceed the modulus. All six valid exponentiations fail the PKCS#1 v1.5 signature prefix and DigestInfo check. All six also fail the RSA-PSS BC final-byte requirement and the leading-zero condition associated with OAEP-style encoded messages. Initial 16-byte exponentiation results:

| Key | Direction | Half | First 16 output bytes |
| --- | --- | --- | --- |
| primary | forward | low | 38f13391b19e450a017f901a10c80937 |
| primary | reversed | low | 5178322ade8101b5a8e78f52d87bd10b |
| primary | reversed | high | 9cfea28c6cb23fcbb17e2e40a8f22375 |
| subkey | forward | low | 311f728a92cf99c07fcf84504e5603ae |
| subkey | reversed | low | 0690b52fa0d8153d38d448d5e6b79983 |
| subkey | reversed | high | 82087862f2da616feb87de3f102755b9 |

## Direct 2048-bit RSA-factor interpretation

A separate, source-size-motivated possibility is that the 256-byte grid is one of the two approximately 2048-bit prime factors of Cicada's 4096-bit public modulus. This is distinct from interpreting the grid as an RSA signature. Only four natural byte traversals are admitted: row-major, reversed row-major, column-major, and reversed column-major. No arbitrary permutation or fitted transform is allowed.

The current control key contains two 4096-bit RSA moduli. The historical 2012 public-key armor in resources/historical/cicada-3301-2012-public-key.asc is byte-identical to resources/control/cicada-3301-public-key.asc, so it supplies no additional distinct modulus. For each of the four traversals, compute the unsigned 256-byte integer and its exact GCD with each of the two moduli.

| Traversal | Candidate bits | Parity | GCD with either modulus |
| --- | ---: | --- | ---: |
| row-major | 2048 | even | 1 |
| reversed row-major | 2047 | odd | 1 |
| column-major | 2048 | even | 1 |
| reversed column-major | 2047 | odd | 1 |

All eight unique comparisons give GCD 1; none divides either modulus. The forward row- and column-major candidates are even and therefore cannot themselves be RSA prime factors of an odd modulus. The reversed candidates are odd but share no factor with either modulus. A synthetic positive GCD control passes.

**Decision:** the direct table-as-RSA-factor interpretation is excluded under these four natural traversals. This does not exclude a transformed table, a different key, or another role for the 256 bytes. It is not a reason to launch arbitrary byte permutations.

## Direct RSA private-exponent interpretation

The same four natural traversals were also tested as candidate private exponent d for each of the two 4096-bit public moduli. For each candidate, test the RSA round trip m → m^d mod n → (m^d)^e mod n for five small coprime bases (2, 3, 5, 17, 257). All 40 candidate/modulus/base checks fail. A synthetic 3233 = 61×53, e = 17, d = 2753 positive control passes the same round-trip test.

This excludes the direct grid-as-d interpretation under the four natural traversals. It does not test CRT exponents, another recipient key, or a transformed table.


## Issue #449: authenticated 2048-bit Cicada RSA key inventory

**Decision (12 November 2026): bounded no-match.** The reviewed 2012–2016 Cicada source corpus contains **no authenticated or independently byte-preserved 2048-bit Cicada RSA public modulus**. The only preserved Cicada OpenPGP public key has a 4,096-bit RSA primary key and 4,096-bit RSA encryption subkey; the other preserved/factored Cicada challenge moduli relevant to this check are 432 bits. Consequently, there is no source-authenticated 2048-bit modulus against which the 256-byte pp49–51 candidate can be matched. No factorization, private-key recovery, or general RSA search was attempted, as required by the issue's gate.

### Finite key and signed-artifact inventory

- The only distinct Cicada public-key armor in the repository is the 2012 key copied byte-for-byte to both `resources/historical/cicada-3301-2012-public-key.asc` and `resources/control/cicada-3301-public-key.asc` (same Git blob SHA-1 `d44aec389e2f346c6b9d149d4c61e890f62979c9`). Its OpenPGP v4 fingerprint is **`6D854CD7933322A601C3286D181F01E57A35090F`**, short ID **`7A35090F`**, 64-bit issuer ID **`181F01E57A35090F`**, and creation time **2012-01-05T03:39:43Z**. Both its primary key and encryption subkey are RSA, **4096 bits**, exponent **65537**.
- The runner parses 14 preserved 2012–2016 standalone signed-message/signature files. This set includes derived OutGuess recoveries and a forum-preserved 2016 copy, so the count is not 14 independent messages. Every signature packet uses RSA public-key algorithm 1 and issuer ID `181F01E57A35090F`; this is one signer key, not 14 independent keys. Packet metadata is not itself signature verification; source-specific GPG verification is documented in the historical-source reports. The 2016 signed text explicitly instructs solvers to “Verify OpenPGP 7A35090F.” The 2014 Stage10 form asks participants to generate and upload **their own** GnuPG public key; that is not another Cicada organizer key.
- The 2012 Valete postscript modulus and the 2014 Cicada RSA challenge modulus are each **432 bits / 54 bytes**, not 2048 bits. The 2012 postscript does not itself specify the exponent used in later direct-reuse tests; 65537 is an explicit test assumption there. The 2014 challenge's existing source-fixed reproduction uses exponent 65537.
- The archived 2012 participant-specific email contains a **112-decimal-digit** modulus (under 373 bits), but its mirrored `unknown.asc` copy has an unverified PGP signature and the modulus is a participant's one-time key, not Cicada's signing key. It is excluded from the authenticated organizer-key inventory.

The reviewed source corpus therefore supplies **zero 2048-bit Cicada RSA public keys**.

### Frozen byte-stream and wrong-reading controls

The physical table is 32×8 tokens. Row-major is the only source-visible reading order; reverse-byte and column-major readings below are controls, not additional source-selected encodings. The conventional base60 conversion is conditional: the separate source audit found no Cicada-authenticated BASE60 alphabet, digit order, zero convention, or consuming operation.

For a bounded base59 control, remove the only character absent from the 256-token transcription (lowercase `f`) from the conventional base60 alphabet, preserving the order of the remaining 59 symbols. This is a control definition, not evidence that Cicada intended base59.

| Conditional codec | Byte traversal | Bits | Parity | SHA-256 |
|---|---|---:|---|---|
| base60 | row-major | 2048 | even | `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290` |
| base60 | reversed row-major | 2047 | odd | `07737f83138161ecf63fe20bcf073fce621d6769963b0b84daabb70cf180ff34` |
| base60 | column-major control | 2048 | even | `84aea2c680cc2d1de945c1e41c431cfc598f81621968ee5be96ebb92a5bd9578` |
| base60 | reversed column-major control | 2047 | odd | `1d0f31943a48991abb55d048525d8b594b76803ca2252729746d05b37c3812ee` |
| drop-f base59 control | row-major | 2048 | odd | `511d4fdb69ffbae4707ef93acf7465421f5480208e28d8e8c598cafa0d33cb79` |
| drop-f base59 control | reversed row-major | 2047 | even | `69167e45429213fca5c4cb966a0801f11d8a1239354134cfb0d19b1cfd2b57fa` |
| drop-f base59 control | column-major control | 2048 | odd | `9fcdc682240dd83c380c96786ec1bfc9b32343b70309f47cbe9fc6a0636e1ada` |
| drop-f base59 control | reversed column-major control | 2047 | even | `fe168cf7aef227dbb16f06151b44b743dac1e434cf97ce41415bc05da74cd5be` |

All eight candidate integers have GCD **1** with both authenticated 4096-bit PGP moduli and both known 432-bit challenge moduli. The canonical base60 row-major stream is 256 bytes / 2048 bits but even, so it cannot itself be an RSA modulus; the base59 row-major control is odd and 2048 bits but has no corresponding Cicada key. No candidate is an exact match for any preserved modulus.

The 2012/2014 432-bit moduli are wrong-size controls, not substitute 2048-bit keys. Their direct RSA-block interpretations have already been tested separately in [the historical grid RSA study](grid-rsa-factor-test.md) and [the 2012 OAEP transfer gate](crossround-2012-ps-rsa-lp2-oaep-gate.md); those experiments are not repeated here. The 4096-bit signature, factor, and private-exponent readings are already bounded in the preceding sections of this report.

### Decision and reproduction

**Close Issue #449 as a bounded no-match.** No authenticated 2048-bit Cicada key exists in the reviewed corpus, so the requested exact modulus comparison cannot produce a match. The base59 and wrong-order controls do not reveal a replacement key. Do not factor the table, recover a private exponent, search arbitrary permutations, or reopen generic p50 consumer sweeps. Reopen only if a new primary or independently byte-preserved 2012–2016 source supplies a 2048-bit Cicada key and an instruction selecting the pp49–51 serialization.

Run `node sims/pp49_51_rsa_key_inventory.cjs` (Node.js 22, no third-party packages). It checks the duplicate key armor, key fingerprint and modulus sizes, 14 signature-packet issuer IDs, the 2012/2014 RSA-432 controls, exact base60/base59 candidate hashes, bit lengths, parity, and GCDs. The runner is also included in the existing manual-only `grid-rsa-pgp.yml` workflow. The packet inventory records issuer metadata; it does not replace the GPG verification documented by the source audits.

## Scope and reproducibility

- Signature-style test: node sims/grid_rsa_pgp_signature.cjs.
- Direct factor and private-exponent tests: node sims/grid_rsa_factor_gcd.cjs.
- Inputs: resources/liber-primus/base60-grid.json and resources/control/cicada-3301-public-key.asc. The base60-grid bytes match the 256-byte canonical table in resources/liber-primus/lp2-grid-256.json.
- The direct-key script reuses the exact OpenPGP parser and key fingerprint check from the signature SFT, verifies both 4096-bit moduli and exponent 65537, asserts all eight GCDs are 1, and asserts all 40 private-exponent round trips fail.

The table might still be ciphertext encrypted to an RSA public key, a KDF input, a partially transcribed cipher block, a modular transform, a nonlinear byte mapping, a split-field encoding or another recipient key. Those are different hypotheses and are not tested here. This report does not supersede established results in results/README.md.