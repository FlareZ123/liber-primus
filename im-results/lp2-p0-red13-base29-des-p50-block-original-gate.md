# P0 red13 and page-indexed 13-rune keys for the printed 32×8 table: bounded original-input negatives

**18 November 2026, Agent39.** No unknown LP2 plaintext or original key recovered. The frozen direct-title and page-indexed receiver hypotheses exploit exact physical dimensions without a free key search. Both fail the proposed GP29 terminal-payload readout.

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

## Page-indexed keys: conditional 56-row matrix receiver

Agent42, 26 November 2026. A distinct receiver follows the conditional 729-rune opening partition: row 0 is the 13-red-rune heading; offset 13 is black TH (index 2); the remaining 715 runes fill 55 rows of 13 in original order. Assign row i to physical LP2 page i, including rune-free p50. The source has not authenticated that assignment or TH's sentinel role. This removes the earlier arbitrary use of row 0 for the terminal numeric panel and tests its corresponding page-specific operand instead.

Each row is a conventional big-endian base29 integer padded to eight bytes. The keys for p49, p50 and p51 are respectively `52d691fd78150bd1`, `642194d71c0e1037`, and `722be15a10bf4e20`. Test the complete 256-byte base60 panel under row50 alone, or its three actual printed fragments (80/104/72 bytes) under rows49/50/51 respectively. As above, allow conventional byte order and byte reversal, ECB and zero-IV CBC (reset at each independently keyed fragment). No other page index, permutation, key, IV or offset was searched. Use the same pre-existing 30×6 interior and p57 suffix control as the earlier experiment.

| Framing | Key order | Mode | Printable /256 | GP range /180 | p57 exact /95 | p57 mod29 /95 |
| --- | --- | --- | ---: | ---: | ---: | ---: |
| panel-p50 | BE | ECB | 85 | 27 | 1 | 5 |
| panel-p50 | BE | CBC-zero-IV | 108 | 22 | 0 | 0 |
| panel-p50 | LE | ECB | 86 | 19 | 0 | 3 |
| panel-p50 | LE | CBC-zero-IV | 89 | 18 | 0 | 3 |
| physical-portions | BE | ECB | 93 | 20 | 2 | 5 |
| physical-portions | BE | CBC-zero-IV | 97 | 20 | 0 | 4 |
| physical-portions | LE | ECB | 103 | 20 | 1 | 3 |
| physical-portions | LE | CBC-zero-IV | 106 | 14 | 0 | 5 |

All eight candidates fail the exact p57 prediction; the maximum is 2/95 raw and 5/95 mod29, against chance expectations of approximately 0.37 and 3.28, respectively. None yields a direct GP29 interior (14–27 valid bytes of 180). The NIST DES vector passes, and every fragment exactly re-encrypts. Reproduction: [SFT](../sims/lp2_p0_pagekey_matrix_p50_des_sft.cjs), [output](lp2-p0-pagekey-matrix-p50-des-output.json). The local Node 22.16 run used the three keys independently derived from the canonical opening tape through the repository connector, the exact p57 indices, and the SHA-256-checked table bytes; the committed SFT derives all three inputs directly from the canonical JSON. Triple DES EDE with the same key three times equals single DES. No claim is made that a random-looking binary payload could be excluded without its own authentication rule.

**Decision:** retire these eight exact page-key DES/terminal-GP29 consumers. The missing selectors remain the page-key interpretation, DES itself, mode and the terminal interior mapping. The result does not reject the 56-row partition or generic encrypted binary payloads. Do not expand this branch without an independent algorithm or payload selector.
