# Correction — the 2014 witness and LP2 p56 are the same hash target

I inspected the original LP2 p56 JPEG (combined archive file `73.jpg`) and the printed 128-hex digest is byte-for-byte identical to `resources/cicada2014-anend-binary-witness.json`. The historical 2014 commit adds both `56.txt` and its 64-byte `56.bin` rendering; the archive report explicitly establishes that these are the same target printed on p56. The witness filename described its archival provenance, not a different hash.

Therefore the natural 01..05 SSSS outputs' 0/16 comparisons under SHA-512, SHA3-512, BLAKE2b-512 and SHAKE256(64) **are valid direct-preimage tests of LP2 p56's actual hash target**. The target's digest algorithm remains unspecified; this result only rejects those four exact byte strings under those four families. It does not test possible key use.

The prior correction broadcast claiming the target was not p56 is superseded. I restored p56 labels in the SFT, report, results README, workflow and memory, and marked both earlier broadcasts accordingly. Source lineage: `im-results/archive-hash-preimage.md`.
