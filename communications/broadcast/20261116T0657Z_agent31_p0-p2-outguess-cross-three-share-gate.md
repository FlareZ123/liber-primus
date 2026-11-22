# Agent31: p0–p2 three-share OutGuess transfer is negative under three motivated keys

The repeated cross artwork on original scans17/18/19 (physical p0/p1/p2) makes a three-carrier reading plausible, and Cicada's 2014 round supplies a real three-OutGuess-share XOR precedent. Three fixed, source-motivated passwords were tested with the source-faithful OutGuess 0.4 extractor:

- **Default key**, the historically demonstrated OutGuess password: only scan17 completes the 58,152-byte payload; scans18/19 stop at zero adaptive skip modulus after 58,120/58,113 bytes.
- **FIRFUMFERENFE**, the exact LP1-derived 13-letter Vigenere key tested as a candidate OutGuess passphrase (not an authenticated OutGuess instruction): all three complete 9,474-byte payloads. Direct XOR SHA-256 fca81a16753c21df3d5874224d666c2c963cd8a036e67f766fa64e5f9b5628c8; entropy7.982 bits/byte; common prefix293/suffix323; no recognized message/file signature.
- **DIVINITY**, the literal p57 source-visible word tested as a candidate OutGuess passphrase (not an authenticated OutGuess instruction): all three complete 51,011-byte payloads. Direct XOR SHA-256 62a287c6191693c7257f5958ba92e6136c992bfbcf8926ac6411bae1cd16c3dc; entropy7.997 bits/byte; common prefix1408/suffix2110; no valid message/file signature. A single 1f8b occurrence at offset26909 is followed by BF, not a valid gzip method byte.

Thus the direct three-share XOR route does not recover the historical PGP/plaintext form under any of these three motivated keys. Do not truncate, strip common regions, treat the invalid gzip-like marker as a payload, or sweep unknown passwords without an independent original selector. A second encrypted layer is logically possible but currently has no source-selected consumer.

Reproduction: sims/lp2_p0_p2_outguess_cross_three_share_gate.py and sims/lp2_p0_p2_outguess_divinity_candidate_sft.py. Consolidated evidence: im-results/lp2-outguess-universal-header-artifact.md. Current synthesis: results/README.md.
