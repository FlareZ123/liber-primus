# Authentic Cicada RSA-4096 / p50 PKCS#1 signature gate

**Agent9, 18 November 2026. Classification: narrow historical/public-key negative. No unknown plaintext or private key recovered.**

## Why this test

A 2026 external coverage audit left one p50 public-key check explicitly unfinished because the authentic Cicada OpenPGP RSA-4096 moduli were not present in that runtime. The authentic key is now recoverable from a preserved archive. This makes the finite test reproducible without keyserver access.

The source key is fingerprint `6D854CD7933322A601C3286D181F01E57A35090F`, short ID `7A35090F`. The exact armored file was copied from `krisyotam/cicada3301`, path `pgp/key/cicada-3301-public-key.asc`, Git blob `d44aec389e2f346c6b9d149d4c61e890f62979c9`. The local SFT independently recomputes the primary-key OpenPGP v4 fingerprint before using it.

## Frozen input and operation

The payload is the repository's original-image-adjudicated p50 table decoded by its canonical base60 byte rule, exactly **256 bytes**. The OpenPGP object contains two RSA public-key packets, both **4096-bit** with exponent **65537**.

To cover the strongest public-key interpretation available without private material, the 256-byte payload is treated as a raw RSA signature integer `s`. For each authentic modulus, compute `m = s^65537 mod n`, serialize `m` to the full 512-byte modulus width, and test the deterministic PKCS#1 v1.5 signature encoding prefix and padding requirement `00 01 FF...FF 00`.

This is deliberately a signature/public-transform gate. It does not claim to decrypt RSA ciphertext and does not test arbitrary private-key operations.

## Result

| authentic packet | bits | exponent | transformed block first 32 bytes | PKCS#1 v1.5 signature block |
| --- | ---: | ---: | --- | --- |
| primary public key | 4096 | 65537 | `38f13391b19e450a017f901a10c80937b214f0d4aa60bbf6d2a05c537c044673` | **no** |
| public subkey | 4096 | 65537 | `311f728a92cf99c07fcf84504e5603aeb8c6e28237de4e5d5d9b8101a032e6bf` | **no** |

The payload integer is smaller than both moduli and coprime to both, so the transform is well-defined. Neither public transform even begins with the required `00 01` signature header.

## Decision

The canonical p50 256-byte object is **not a raw PKCS#1 v1.5 RSA signature under either authentic Cicada RSA-4096 public-key packet**. This closes the specific previously blocked public-transform check.

This does not rule out unrelated RSA constructions, omitted-leading-zero ciphertext integers, private-key decryption, OAEP, or uses of other historical challenge moduli. Those require separate source motivation and inputs. The result is an exclusion, not a p50 decoder.

## Reproduction

Run `sims/lp2_p50_authentic_rsa_pkcs1_sft.cjs` under Node 22. It parses the stored armored OpenPGP key, recomputes the authentic fingerprint, extracts both RSA packets, checks exponent/modulus size and coprimality, applies modular exponentiation, and asserts the exact transformed block heads above.
