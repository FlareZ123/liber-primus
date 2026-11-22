# P0 red13 as one DES key for the printed 32×8 table: bounded original-input negative

**18 November 2026, Agent39.** No unknown LP2 plaintext or original key recovered. This tests one human-plausible cross-artifact operation which uses exact physical dimensions, rather than adding a free key search.

The original p0 scan `17.jpg` has **13 red GP29 runes** before its first large 13-dot divider. Their genuine zero-based rune indices in `lp2-corpus.json` are `[15,8,18,3,6,19,27,0,15,26,18,21,5]`. Reading this exact source-ordered heading as a big-endian base29 integer gives **`0x4b1cde6f9c9af1e1`**, a 63-bit unsigned integer that fits naturally into one eight-byte DES key. The original numerical p50 source, spread over pp49–51, is **32 rows of eight base60-encoded bytes**, 256 bytes in row-major order, SHA-256 `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`.

**Tested operation:** Standard DES-ECB and zero-IV DES-CBC decryptions of the 32 literal eight-byte table blocks, using the source key in both conventional big-endian and byte-reversed binary orientations. The only readout assumption is the independently considered *shed circumference* geometry: 30×6=180 table interior cells might align with the known terminal p56 85 + p57 95 GP29 runes. Count actual GP29 byte-range values throughout the interior and independently test all 95 completely clear p57 runes at the end of the proposed interior. For the last check, test the stricter byte=GP index and the generous byte%29=GP index. No key tuning, permutation, offset selection, or language-guided selection.

| Key orientation and mode | Printable bytes /256 | GP-range interior /180 | Known p57 exact /95 | Known p57 mod29 /95 |
| --- | ---: | ---: | ---: | ---: |
| big, ECB | 99 | 21 | **0** | 3 |
| big, zero-IV CBC | 103 | 20 | **0** | 2 |
| little, ECB | 113 | 15 | **0** | 2 |
| little, zero-IV CBC | 96 | 17 | **0** | 3 |

The native DES known-answer vector `133457799BBCDFF1 / 85E813540F0AB405 → 0123456789ABCDEF` passes. All four decoded 256-byte outputs re-encrypt exactly to the untouched table. The first 24 bytes of big-endian ECB output are `40632af8303811c3800ba6496905c4ae5e882e1ae979db42`, visibly unlike a typed header. The printed table's original bytes were SHA-pinned and the derived red key was asserted before evaluation. The test is reproducible in [this single-file CommonJS source harness](../sims/lp2_p0_red13_key_p50_des_direct_sft.cjs), or independently by NIST DES with the stated key.

**Decision:** This frozen four-receiver interpretation does not recover an original payload, the known terminal plaintext or a GP29 message. The DES association rests on **13 GP digits fitting eight bytes**, without a Cicada-authored DES instruction, block mode or key serialization; the terminal geometry is likewise hypothetical. Retire this direct candidate. No broader DES conclusion, hidden-key authentication or plaintext claim follows. The existing separate [DIVINITY-key DES gate](lp2-p50-divinity-des-ciphertext-gate.md) tests a different eight-byte key and is unaffected.
