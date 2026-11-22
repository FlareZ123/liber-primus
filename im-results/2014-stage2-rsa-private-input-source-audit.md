# 2014 Stage 2 RSA private-input source audit

**Status:** negative under the source-only completion criterion. The exact RSA operation and required private-input format are identified, but no Cicada-authenticated private input is present in the recovered Stage1/2 material.

## Authenticated handoff

The signed Stage2 payload is [1033.jpg.asc](https://github.com/neuroretransmit/cicada/blob/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2014/002-first-onion/1033.jpg.asc), Git blob SHA-1 cd529671eac6458a790f047d23895af264b11751. Its OpenPGP signature is recorded as 2014-01-06 07:35:27 UTC and verifies under the established Cicada key. The signed body explicitly states:

- e = 65537
- n = 7557912574608535164426718292058021255641310207187633095795069445700059210248050757270234679993673844203148013173091173786572116639 (432 bits)
- Scheme: Crypt::RSA::ES::OAEP
- A compressed RSA ciphertext block

The signed body contains no p, q, d, private-key object, or passphrase. It authenticates the public parameters and ciphertext only.

## Exact private input required

For RSA decryption with this public key, the missing input must be a matching private key: the private exponent d or the factors p and q from which the library can construct d. The historical community helper [recreate-pk-decrypt.pl](https://github.com/neuroretransmit/cicada/blob/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2014/002-first-onion/recreate-pk-decrypt.pl) makes the expected format explicit: decimal p and q are positional inputs, then it calls Crypt::RSA::Key generation with e=65537, p and q, and passes the resulting private key object to Crypt::RSA decryption. Equivalent valid input would be a matching Crypt::RSA::Key::Private object or correctly matching RSA private-key encoding.

This script is community tooling, not a Cicada instruction. Its existence identifies the format; it does not authenticate the factors.

## Source inventory

1. **Signed Stage1 Twitter message.** The PGP-signed poem and 16 one-indexed paragraph:sentence:word:letter tuples lead to the onion address. The signed content contains no RSA factors or private exponent.
2. **Recovered Stage1 service page.** The contemporaneous 2014 snapshot preserves a 104-byte root HTML page with only the title “For Every Thing That Lives Is Holy” and one link to 1033.jpg. It contains no key material.
3. **Recovered Stage1 image and signed OutGuess payload.** The 342,361-byte JPEG is preserved. Its OutGuess output is the signed 1,498-byte Stage2 message described above: public e, n and ciphertext, not p, q or d.
4. **Contemporaneous 2014 archive tree.** At the pinned [micheloosterhof/cicada-2014 commit from 13 February 2014](https://github.com/micheloosterhof/cicada-2014/tree/2547f5f08f06f8f514329c5d533b0a99968e365e/stage2), the complete stage2 tree contains exactly four files: index.html, 1033.jpg, 1033.jpg.outguess and README.md. It contains no numbers.private, numbers.public, armored.pem, factor script or private-key reconstruction script.
5. **Later community reconstruction.** The pinned [neuroretransmit/cicada commit](https://github.com/neuroretransmit/cicada/tree/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2014/002-first-onion), dated 2024-05-03, contains numbers.private, numbers.public, factor.sh, solve.sh and recreate-pk-decrypt.pl. Its README explicitly says to factor n with CADO-NFS, then uses the resulting p and q to recreate the private key. This is a solver-derived factorization and key, not an authenticated Cicada private-input handoff; it is outside the permitted source-only route.

The same later repository's recreate-armor.py hard-codes a different modulus (1041279065… versus the signed challenge modulus 7557912574…). Both are 432-bit values, but they are not equal. Do not treat that helper's PEM output as evidence of the matching Stage2 private key without correcting and independently validating it.

## Decision

**Negative completion criterion met.** The exact private input is a matching RSA private key, operationally p and q as decimal integers for the preserved Crypt::RSA helper (or equivalent d/private-key object). It is absent from the signed Stage1 message, recovered Stage1 service page, signed Stage2 payload, and complete contemporaneous 2014 Stage2 archive tree. The later community key is derived by GNFS, not supplied by Cicada.

No factoring, brute force, padding substitution, decryption, or plaintext-based inference was performed. The missing artifact is an authenticated private key or a Cicada-supplied factor/secret handoff. Without new source material, this historical RSA handoff is unrecoverable by the source-only route. Its known community continuation is a separate onion stage, not an LP2 key or plaintext.
