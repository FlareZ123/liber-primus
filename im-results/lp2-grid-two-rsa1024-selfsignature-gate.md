# LP2 printed 256-byte table as one self-contained 1024-bit RSA modulus and signature

**15 November 2026, Agent13. Research classification: small, source-shaped bounded negative, not a decipherment.** The original 256 two-character base-60 tokens on physical LP2 pp49–51 do **not** form a standard RSA-1024 signed message under the natural two-half layouts tested below. Neither a message, authentic manuscript key, nor continuation address was recovered.

## Motivation and independent test

The printed source contains precisely **256 bytes**. An RSA-1024 public modulus and signature each occupy **128 bytes**, and original Cicada puzzles used RSA signatures and public-key verification. These source facts motivate testing whether the table carries a self-contained pair of RSA operands without supplying a guessed key or scoring unknown plaintext. The manuscript gives **no instruction** assigning one half to a modulus or signature, so this remains a hypothesis.

The [read-only Node22 CommonJS reproducer](../sims/lp2_grid_2x1024_rsa_signature_sft.cjs) checks original bytes from [the unchanged table](../resources/liber-primus/base60-grid.json), SHA-256 **3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290**. Four original geometric partitions produce two 128-byte operands each:

1. First 16 complete rows vs last 16 rows.
2. Left four original columns vs right four.
3. Even vs odd complete printed rows.
4. Even vs odd columns.

For each partition, assign either half as modulus and the other as signature, use original or fully reversed bytes for both halves together, and apply public exponent 3 or 65537. This yields **32 computed modular exponentiations**, **10** of which also satisfy the necessary RSA operand conditions that the candidate modulus be odd and the signature representative be smaller than it. Evaluate each entire 128-byte result under both standard PKCS#1 v1.5 type-1 signature and type-2 encrypted-message padding, with at least eight padding bytes. Also report the longest consecutive printable ASCII run.

## Exact original outcome

**0/32** algebraic outputs have either PKCS#1 v1.5 padding type, including **0/10** operands satisfying the basic RSA checks. The longest uninterrupted printable ASCII graphic run is **6 bytes**. For the most literal first/last-16-row split, first half as modulus, original byte order, exponent 3 recovers prefix **10ec95f43073b2de5ad7**; exponent 65537 recovers prefix **ab4ed35bc794106c763b**. Both fail the exact padding grammar.

The same SFT **generates a genuine RSA-1024/SHA-256 signature** using Node's built-in crypto, extracts its public modulus, computes its modular public exponent, and checks the recovered **entire PKCS#1 v1.5 encoded block**, including ASN.1 SHA-256 DigestInfo and the actual message digest. It confirms the original signature using the native verifier and rejects an invalid short padding block. The script passed locally under Node.js v22.16.0 with the exact original source byte values, which are SHA-256 pinned in the script.

## Scope and next decision

The result excludes **only** a literal, conventional two-operand RSA-1024 representation in the four frozen geometric splits, two roles, two reading directions and two exponents. It cannot rule out encrypted key material, an external modulus or public key, other framings, unpadded RSA arithmetic with an unknown interpretation, or the table as an operand of a different cipher. This is distinct from the preexisting [two Tor-v2 modulus test](lp2-grid-two-rsa1024-torv2-direct-identity-gate.md), which treats both halves as separate public keys, and the [authentic RSA-4096 tests](grid-rsa-pgp-signature.md).

**Decision:** retire this self-contained RSA-1024-signature reading rather than searching arbitrary byte shuffles or exponents. The source's unsolved p55→p27 cross-page ciphertext link remains a separate possible navigation clue requiring an independently chosen executable operator. No unknown LP2 rune is decrypted by this table interpretation.
