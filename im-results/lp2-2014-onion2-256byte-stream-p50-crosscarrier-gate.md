# Pre-LP2 2014 Onion2 256-byte stream and p49–51 256-byte table: direct historical-carrier gate

**Agent5 · 23 November 2026. Status: independent source-derived cross-stage candidate and a decisive negative for one literal consumer. No new LP2 plaintext, key or destination.**

## Why these two particular sources can be compared

Before Liber Primus appeared in May 2014, the January 2014 second Tor onion `cu343l33nqaekrnw.onion` displayed a periodically expanding text that reached exactly **512 hexadecimal characters = 256 decoded bytes** over roughly 23 hours. Contemporary participants copied that string intact. The original-page manuscript later included a physically exceptional numerical panel on p49–p51 with exactly **32×8 two-character base60 cells**; interpreting those canonical byte values yields another complete **256-byte** object. Earlier Cicada stages used bytewise XOR of equally sized extracted content, so the simplest reversible cross-stage test is **one published-order XOR of both 256-byte arrays**. This candidate requires no tuned offset or secret password and is time-feasible for a 2014 solver.

The original pre-LP2 artifact is [the archived participant transcript of Onion2's 512 hex characters](https://github.com/neuroretransmit/cicada/blob/main/2014/003-second-onion/README.md). A separate contemporary archive version of the same hexadecimal data already exists in this repository at `resources/2014-onion2-final-256byte-hex.txt`, and the source was previously used to reject its own p56 SHA512/Whirlpool page-hash interpretation; see [prior p56 hash semantics gate](lp2-p56-source-defined-hash-semantics-gate.md). That earlier test **did not** apply the 2014 stream as a bytewise secret to the physically distinct LP2 table. The LP2 panel comes from original `66.jpg`–`68.jpg` and is transcribed in [the pinned source table](../resources/liber-primus/base60-grid.json). Its exact interpreted-byte SHA256 is `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`.

**Rival:** the two 256-byte lengths follow naturally from a 512-hex website message and a 32×8 printed table. Neither the signed 2014 handoff nor either surviving source says to combine them; 256 is a common round data size. The former site was chronologically independent of the manuscript; that does not prove a cipher relationship.

## Predeclared literal operation and observed output

Take the historically preserved 512 hex characters as 256 binary bytes, and the original p49–51 printed row-major base60 cells as 256 byte values; apply `decoded[i] = onion2[i] XOR grid[i]` at identical zero-based source positions `i=0..255`. Decode no runes, change no row order, assume no unknown session key, and skip all retrospective plaintext-language or key-phase fitting. A second XOR with the same prior-stage bytes must reconstruct all original table bytes; this is an implementation control, not evidence of Cicada intent.

| Measurement | Original-source outcome |
|---|---:|
| Onion2 exact byte length | 256 |
| Onion2 exact SHA256 | `05acf0d8e2ba7d851e2b4bbc32b85e461a1bd41576a50504487f33d4c1522c56` |
| Original LP2 table byte length | 256 |
| XOR output bytes in printable ASCII 32–126 | **97/256** |
| XOR output bytes printable plus tab/CR/LF | **101/256** |
| XOR output distinct values | **158** |
| XOR output Shannon entropy | **7.11954 bits/byte** |
| XOR decoded hex prefix | `a8a5350028134dd98623eb44c301fde725e4ce0ded33d61cff1a6d4768da7aefcc8f071fad8b18e79f74dc404ab7de09` |
| Common fixed PDF/PNG/JPEG/ZIP/gzip/bzip2/zlib/JSON header | **No** |
| Exact reversible XOR on all 256 original bytes | **Yes** |

This output is high entropy with no visible complete prose or familiar file header. It rules out **direct readable ASCII or standard-header file interpretation** under exactly this literal alignment. A hidden binary format with its own decryption, an unknown salt, or a source-directed different combination remains possible and is not rescued by trying arbitrary variants.

### Two further typed historical gate checks

The exact **2014 first onion** [signed RSA-OAEP packet and its preserved factorization](https://github.com/neuroretransmit/cicada/blob/main/2014/002-first-onion/README.md) supply an independent historical RSA modulus (public exponent 65537) of **432 bits**, even though one might loosely call it a 512-bit RSA stage. Four natural 8×8-cell groups of the p49–51 numerical panel would each be **64 bytes**, giving unsigned, big-endian original integers of bit lengths **512, 511, 512 and 504**. All four are **larger than the authentic RSA modulus**. Valid representative integers for textbook/OAEP RSA encryption must satisfy `0 ≤ C < N`, so these cannot literally be four ciphertext blocks under that stage's modulus. Dividing by N or modular reduction before RSA is an extra unprinted rule; it is outside this exact gate.

The original solved p56 page prints a 128-hex-character value with the phrase “HASHES TO”, without naming an algorithm. Under one length-compatible **SHA512 candidate only**, the original 256-byte LP2 table and the new 256-byte XOR result each fail the original p56 target. The raw January2014 Onion2 bytes themselves already failed SHA512 and Whirlpool in the prior p56 gate, so they are not reclassified as a new attempt here. No missing URL or 2014 webpage has been recovered. The p56 algorithm and exact page serialization remain unknown.

## Reproducibility and decision

Run the self-contained [Windows11 / Node22 CommonJS source test](../sims/lp2_2014_stage2_256byte_p50_crosscarrier_sft.cjs). It hardpins the contemporary 512-hex payload, the printed 32×8 original panel SHA256, a reversible XOR control, the authentic exact RSA factors/modulus, and the unchanged original p56 128-hex target. [Windows GitHub Actions run 45188168585](https://github.com/FlareZ123/liber-primus/actions/runs/45188168585) passed the source assertions, byte operations, and RSA representative gate. The extended terminal SHA512 scope passed as a separate [Windows Node22 run 45188858220](https://github.com/FlareZ123/liber-primus/actions/runs/45188858220), with both exact p56 digest comparisons false.

**Decision:** retire source-order bytewise XOR of this exact earlier Onion2 packet with the original p49–51 256-byte table as a direct LP2 plaintext or recognizable file handoff; retire four literal source-row-block RSA ciphertexts under the historical modulus. The numerical congruence alone is not a key. A worthy successor requires a first-party instruction naming an operation and receiver or an independently recoverable header/holdout from the literal output. No 56 unknown LP2 pages or final Cicada endpoint have been solved.
