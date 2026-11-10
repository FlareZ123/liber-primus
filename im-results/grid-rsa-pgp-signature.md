# Cicada PGP RSA signature test of the 256-byte base-60 grid

**Classification:** exact bounded negative on a concrete cryptographic-key interpretation; no LP2 plaintext or private key recovered. Agent 34, 2026-11-10.

## Hypothesis and reason for the test

The 32×8 base-60 grid spanning LP2 pages 49–51 supplies exactly 256 bytes. A previous independent investigation, Dukotah's `analysis/round16/zeroFP/zerofp_tests.py` (E-01), proposed checking the grid against Cicada's authentic OpenPGP RSA public key but left that check unperformed because the 4096-bit moduli were not loaded. Its prose incorrectly suggested that applying exponent 65537 to a 2048-bit input under a 4096-bit modulus would leave the input unchanged. Modular exponentiation does apply; that omission is now closed.

The narrow, testable construction is a *signature-style* interpretation: treat the 256 bytes as an unsigned integer `s` and compute `m=s^65537 mod n` using Cicada's published signing RSA modulus or encryption-subkey RSA modulus, then look for the PKCS#1 v1.5 encoded message `00 01 FF...00 DigestInfo` or the RSA-PSS `BC` trailer. Tested directions are original or reversed bytes, in low or high half of a 512-byte input. High-half readings exceeding `n` are invalid and explicitly skipped.

The source public key is the Cicada 3301 PGP public key with independently published fingerprint **6D854CD7933322A601C3286D181F01E57A35090F**. The script parses the actual packet bytes, verifies this SHA-1 OpenPGP v4 fingerprint and identifies **two 4096-bit RSA moduli**, each with exponent **65537**. The repo fixture is a copy of the existing public key archive, without private material.

## Exact result

Eight input/key-direction/alignment combinations exist, of which two (high-half forward in either modulus) exceed the modulus and are rejected. All **six valid exponentiations** fail the PKCS#1 v1.5 signature prefix and DigestInfo check. All six also fail the RSA-PSS `BC` final-byte requirement and the leading-zero condition associated with OAEP-style encoded messages. Initial 16-byte exponentiation results, sufficient to independently check the reported rejection without printing 4096-bit values:

| Key | Direction | Half | First 16 output bytes |
| --- | --- | --- | --- |
| primary | forward | low | `38f13391b19e450a017f901a10c80937` |
| primary | reversed | low | `5178322ade8101b5a8e78f52d87bd10b` |
| primary | reversed | high | `9cfea28c6cb23fcbb17e2e40a8f22375` |
| subkey | forward | low | `311f728a92cf99c07fcf84504e5603ae` |
| subkey | reversed | low | `0690b52fa0d8153d38d448d5e6b79983` |
| subkey | reversed | high | `82087862f2da616feb87de3f102755b9` |

**Conclusion:** the grid is not a directly valid signature or signature-style RSA encoded message under these exact readings of the known Cicada public keys. The table might still be ciphertext encrypted **to** an RSA public key, in which case the public key cannot decrypt it; an arbitrary KDF input, partially transcribed cipher block, modular transform, nonlinear byte mapping, split-field encoding or another recipient key is also outside this experiment. The source grid transcription includes possible glyph ambiguities, which would matter for any eventual signature authentication, and this test makes no universal negative statement.

## Reproducibility

`node sims/grid_rsa_pgp_signature.cjs` (Node 22, built-in crypto only), inputs `resources/liber-primus/base60-grid.json` and `resources/control/cicada-3301-public-key.asc`; on-demand `.github/workflows/grid-rsa-pgp.yml`. The script verifies input width, complete key fingerprint, key sizes, RSA exponents, all six modular exponentiation outputs, and absence of the tested PKCS#1 formats. Upstream PGP archive: `https://github.com/krisyotam/cicada3301/blob/main/pgp/key/cicada-3301-public-key.asc`.

This is a bounded test of an independent source-key hypothesis, not evidence of a newly decrypted passage. It does not supersede any established results in `results/README.md`.
