# Original LP2 256-cell table as two Tor-v2 RSA identity moduli

**Research status (Agent 13, 14 November 2026):** a concrete, source-shaped original-input decoder has been executed, with **zero matches** to the four predeclared service IDs across 64 fixed readings. This excludes only the tested direct RSA-public-modulus serialization bridge. **No unknown original rune plaintext, historical hostname verification, key, or destination was recovered.**

## Possible intended route and the missing premise

The original LP2 numeric pages 49–51 print **32×8 cells**, normalized to exactly **256 bytes** by the repository's bounded base60 interpretation. The final unsolved physical p55 contains **16 complete printed words** after a one-rune carry from p54. The existing source-motivated GP-prime-word-sum/mod32 readout of those words is the unverified Tor-v2-shaped candidate `6sws36unkmvdy4b7.onion`; a historically attested 2014 LP2 distribution host is `ky2khlqdf7qdznac.onion`.

In 2014, a Tor-v2 hidden-service identity used a **1024-bit RSA public key**, whose DER-encoded public identity is SHA-1 hashed and truncated to its first **80 bits**, encoded as a **16-character Base32** hostname. [Historical Tor rendezvous specification](https://torproject.gitlab.io/torspec/rend-spec-v2.html); [Tor's v3 specification explicitly contrasts the old 80-bit SHA-1/RSA scheme](https://spec.torproject.org/rend-spec/protocol-overview.html).

A specific inexpensive interpretation is that the **256 bytes hold two 128-byte RSA public moduli**. If one half is the historical key for the actual service, deriving its v2 hostname can provide a decisive match **without guessing any unknown manuscript plaintext**. The source supplies the dimensions and the candidate; it does **not** instruct the solver to treat the grid as RSA, split it into two keys, or select a public exponent. These are the weakest assumptions, and no host is authenticated by a merely syntactically valid 16-character label.

## Fixed original-input experiment

The table's exact byte-stream SHA-256 is `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`. The reproducer locks this digest and all 256 original bytes, then forms four source-geometric 2×128-byte partitions:

1. First and last **16 rows** (natural contiguous 128-byte halves).
2. Left and right **four columns**.
3. Even- and odd-numbered **complete rows**.
4. Even- and odd-numbered **columns**.

The last two are controls, not author-selected orientations. For each pair, both halves are interpreted as 1024-bit unsigned RSA moduli in forward or complete reverse byte order. The two standard small public exponents **65537** and **3** are tried, and both DER variants **PKCS#1** (historical Tor canonical public-key serialization) and **SubjectPublicKeyInfo** (conservative format control) are SHA-1 hashed. A candidate hostname is the RFC4648 Base32 representation of the first ten digest bytes, giving **4×2×2×2×2=64** distinct derived 16-character names.

The frozen comparison set contains:

- **`6sws36unkmvdy4b7`**, the still-unverified p55 prime-word-sum candidate.
- **`ky2khlqdf7qdznac`**, the historically attested distributor.
- **`rejpopiv6ojgqzpn`**, a separately source-supported 2013 BASE29 integer-per-word/mod32 reading of the same p55 words.
- **`zpopahrtrm4scfxr`**, the 16 original word-initial GP rune indices read directly as Base32, a simple independent control.

**Exact original result:** **0/64** candidate public-key identifiers equals any of the four frozen targets. All 64 derived hostnames are distinct. The first sixteen-row half with the historically canonical exponent 65537 and PKCS#1 DER gives `rrygwpxoseopdwbk`, while its SPKI alternative gives `ew4usw6rm6rxx6gj`. The SFT also generates an independent valid RSA-1024 key, serializes its actual public key as PKCS#1 DER, re-imports its modulus and exponent through Node's built-in JWK implementation, and **exactly reproduces the true SHA-1/Base32 hostname**. Thus a positive valid RSA identity would have been detected by the same calculation. [Node's documented JWK import and DER public-key export](https://nodejs.org/api/crypto.html).

**One further narrow consequence:** the 128th byte of the natural row-major table is `0xC1` (odd) while its 256th is `0x50` (even). The latter half **cannot itself be a valid RSA public modulus in forward endian order**, because a valid RSA-1024 identity modulus is odd. This is a necessary-condition exclusion independent of hostname matching; the test nevertheless grants it a mathematical DER serialization for a conservative negative.

## Interpretation and next decision

The direct two-RSA-modulus bridge is excluded for the four explicitly source-geometric splits, two orientations, two exponents and two public DER formats. It says nothing about ciphertext-encrypted private keys, a source-selected transformed modulus, public keys carried elsewhere, or alternative readings of the 256 bytes. It also **does not reject the p55 prime-sum hostname hypothesis**: even if that hostname were historical, no source instruction guarantees its identity key lives in the table.

The result argues against expanding arbitrary byte rearrangements. A genuinely new positive could be obtained from an independently dated Tor-v2 descriptor or authenticated page naming a candidate host, or from an author-specified rule connecting the grid to an RSA key. In the absence of one of those operands, direct key-layout guessing cannot lead responsibly to plaintext.

**Reproducer:** [`sims/lp2_grid_torv2_identity_bridge_sft.cjs`](../sims/lp2_grid_torv2_identity_bridge_sft.cjs), a single Node.js 22 CommonJS test, using only the existing original source table and Node built-ins; checks every source byte, both public DER formats, 64 original candidate results, and an independent valid RSA public-key plant. The same implementation and source bytes were tested locally with Node.js v22.16.0 before repository publication. No further pages, keys, or network services are modified.
