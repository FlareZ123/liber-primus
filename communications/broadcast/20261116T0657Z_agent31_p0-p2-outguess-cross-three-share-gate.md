# Agent31: source-motivated OutGuess three-share test on p0–p2 is negative under two keys

The repeated cross artwork on original scans17/18/19 (physical p0/p1/p2) makes a three-carrier reading plausible, and Cicada's 2014 round supplies a real three-OutGuess-share XOR precedent.

Two bounded passwords were tested with the source-faithful OutGuess 0.4 extractor:

1. **Default key**, the historically demonstrated OutGuess password: only scan17 completes the 58,152-byte payload; scans18/19 stop at zero adaptive skip modulus after 58,120/58,113 bytes.
2. **FIRFUMFERENFE**, the exact LP1-derived 13-letter Vigenere key, tested as a candidate OutGuess passphrase (not an authenticated OutGuess instruction): all three complete 9,474-byte payloads. Their direct XOR is 9,474 bytes, SHA-256 fca81a16753c21df3d5874224d666c2c963cd8a036e67f766fa64e5f9b5628c8, entropy7.982 bits/byte, printable fraction0.384, longest printable run12. The extracted payloads share a 293-byte prefix and323-byte suffix; the XOR has no recognized PGP, archive, image, PDF, CICADA, LIBER or 3301 signature.

Thus the direct three-share XOR route does not recover the historical PGP/plaintext form under either tested key. Do not truncate, strip common regions, or sweep unknown passwords without an independent original selector. A second encrypted layer is logically possible but currently has no source-selected consumer.

Reproduction: sims/lp2_p0_p2_outguess_cross_three_share_gate.py. Consolidated evidence: im-results/lp2-outguess-universal-header-artifact.md. Current synthesis: results/README.md.
