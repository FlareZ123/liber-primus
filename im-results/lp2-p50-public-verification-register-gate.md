# p49–51 public-verification-register gate

## Decision

Retire the hypothesis that the 256-cell panel is a source-authenticated public-verification register under the surviving Cicada challenge contracts. No independently specified 256-byte verifier/receiver is preserved. This does **not** identify the panel's actual consumer or rule out unrelated uses of its values.

## Frozen table object

The canonical transcription at \`resources/liber-primus/lp2-grid-256.json\` contains one 32×8 panel across physical pages 49–51, with 80/104/72 cells respectively. Its 60-symbol alphabet and candidate byte rule are:

\`value = 60 × digit(first character) + digit(second character)\`

In original row-major order, the complete 256-token stream maps to 256 values in 0–255. This is the repository's canonical radix-60 byte candidate, not an author-confirmed radix instruction. The source transcription records original-image adjudication of the disputed glyph cases. Derived stream SHA-256 (integrity fingerprint only): \`3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290\`.

## Genuine public-verification control

The authentic Cicada public key at \`resources/cicada-3301-authentic-public-key.asc\` has v4 fingerprint \`6D854CD7933322A601C3286D181F01E57A35090F\`, key ID \`181F01E57A35090F\`, RSA algorithm 1, and a 4096-bit modulus. The archived 2014 signed-message control at \`resources/cicada2014-may2-signed-message.asc\` verifies with GnuPG against that key:

\`\`\`sh
gpg --import resources/cicada-3301-authentic-public-key.asc
gpg --verify resources/cicada2014-may2-signed-message.asc
\`\`\`

The verification returned **Good signature** from key ID \`181F01E57A35090F\`. Its OpenPGP v4 signature packet uses RSA algorithm 1 and SHA-1 hash algorithm 2; its RSA signature MPI is 4096 bits / 512 bytes. The packet body is 540 bytes (plus its packet header). This supplies a genuine, period-authenticated public-verification format and a reproducible positive control.

The full p49–51 table object is 256 bytes, exactly half the authentic Cicada signature MPI length. It cannot be a raw signature under the known Cicada key, and it cannot contain a complete OpenPGP signature packet for that key. Existing direct RSA-4096/table gates independently reach the same negative result; this report does not repeat their candidate encodings.

## Why the 256-byte RSA-2048 fit is not a result

A 256-byte raw signature would fit an RSA-2048 modulus, but length alone does not select that key size or identify the verifier. The authentic Stage10 form asks a participant to generate a GnuPG key pair and host the public key at \`/key.asc\`; it does **not** specify RSA-2048, a key algorithm, or a fixed participant key. The archived 2014 server log records a successful \`GET /key.asc\` from the participant service \`ut3qtzbrvs7dtvzp.onion\`, but the fetched key bytes are not preserved in the surviving response page or the source corpus. The archived sample \`key.asc\` in a later solver repository explicitly identifies itself as a test fixture, not a real participant key. There is therefore no independent RSA-2048 key/receiver against which to verify the table.

The alternative interpretation of the 256-byte table as an RSA-2048 modulus is already excluded by the source-byte permutation invariant: the integer is divisible by 3, which no RSA modulus can be. The Tor-v2 identity route (RSA-1024 public keys) has also already been tested by splitting the panel into two 128-byte halves; neither half derives a candidate Cicada receiver. These are cited prior results, not repeated here.

The historical 2012 and 2014 RSA-OAEP materials are **encryption** envelopes, not public-verification signatures, and their archived challenge moduli are 372/432-bit examples rather than a source-selected 2048-bit verifier. They do not supply a 256-byte public-verification contract.

## Conclusion and next decision

No compatible period-authenticated public-verification format has been found for the whole 256-cell object. Retire the key-verification-register branch unless an original participant \`key.asc\`, an authenticated 2048-bit receiver, or a first-party instruction fixing a different verifier is recovered. Do not substitute an arbitrary RSA key, hash, KDF, or fitted checksum. The broader table interpretation remains open.

## Reproduction

- Deterministic gate: \`node sims/lp2_p50_public_verification_register_gate_sft.cjs\`
- GnuPG positive control: commands above.
- Related prior exclusions:
  - [RSA-2048 modulus permutation invariant](lp2-p50-rsa2048-bytepermutation-invariant.md)
  - [Cicada RSA-4096 signature gate](lp2-p50-cicada-rsa4096-ascii512-signature-gate.md)
  - [Two RSA-1024 Tor-v2 identities](lp2-grid-two-rsa1024-torv2-direct-identity-gate.md)
  - [Two RSA-1024 self-signature gate](lp2-grid-two-rsa1024-selfsignature-gate.md)
- Historical contract sources:
  - [Original Stage10 form](../resources/historical/cicada2014-stage10-original-form.html)
  - [Archived Stage10 response](../resources/external/2014-stage10-post-square-response.html)
  - [2014 server log with \`GET /key.asc 200\`](https://github.com/krisyotam/cicada3301/blob/main/archives/scream314/2014.md#L757-L780)
  - [2014 onion6 solving notes](https://github.com/krisyotam/cicada3301/blob/main/archives/cijhho/2014/additional%20docs/Titanpads%20from%20time%20of%20solving/The%20complete%20story%20of%20onion%206.txt)
  - [2012 RSA email contract](https://github.com/cicada-solvers/neuroretransmit-cicada/blob/master/2012/008-rsa-emails/README.md)
  - [2014 first-onion RSA control](https://github.com/cicada-solvers/neuroretransmit-cicada/blob/master/2014/002-first-onion/README.md)
