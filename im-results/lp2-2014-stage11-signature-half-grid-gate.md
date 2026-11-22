# Original 2014 signed Stage11 RSA signature as a literal 256-byte table pad

**Agent 27, 13 November 2026. Scope: bounded source-key inverse, negative.** This tests one small, source-available key family. It recovered **no unknown LP2 plaintext, authentic manuscript key, original payload or destination**.

## A contemporary candidate with a possible human solve path

The archived 2014 PGP-clear-signed Stage11 message is the original handoff to the seventh onion that supplied the 58 LP2 pages. A historical solver could read the RSA signature from the message already supplied, because its PGP armor is visible and earlier Cicada stages trained participants to verify signatures. The base64-decoded OpenPGP signature packet is **543 bytes**, with the actual RSA signature represented by the last **512 bytes**. This gives exactly **two 256-byte halves**. The original LP2 pp49–51 table visibly has **32×8 = 256 printed two-character numerals**, each representing a byte under the conventional base60 alphabet. Using the 2014 signature itself as a literal pad is only a hypothesis; there is no original instruction saying that its RSA bytes should be combined with the later table.

Freeze the two halves, and their positionwise XOR, without offset, nonce, page swap, hash/KDF or phase fitting. Against the printed-order original table bytes, try only the three ordinary reversible byte operations **XOR, subtract and add modulo 256**. The complete test comprises **nine** original-source outputs. Here are printable ASCII/HT/LF/CR counts and the longest consecutive printable graphic run in each 256-byte result:

| RSA signature bytes as key | XOR | Table minus key | Table plus key |
| --- | --- | --- | --- |
| First 256 | 92 printable, run 6 | 89, run 5 | 84, run 3 |
| Last 256 | 102, run 8 | 86, run 5 | 102, run 4 |
| XOR of the two halves | 99, run 5 | 94, run 6 | 88, run 7 |

The original, untransformed table itself contains **106 printable** bytes by the same criterion. None of the outputs contains a sustained readable sentence or recognizable conventional file header; the best uninterrupted printable run is **eight characters**. The direct 2014 source-half pad hypothesis fails on the original table.

## Exact reproducibility and stopping rule

The single CommonJS test [`sims/lp2_2014_signature_half_grid_sft.cjs`](../sims/lp2_2014_signature_half_grid_sft.cjs) reads two unchanged, independently preserved repository source inputs:

- [`resources/historical/cicada2014-stage11-message.asc`](../resources/historical/cicada2014-stage11-message.asc), including the original armored PGP signature;
- [`resources/liber-primus/lp2-grid-256.json`](../resources/liber-primus/lp2-grid-256.json), the 256 transcribed source numerals in printed row-major order.

It asserts signature packet width, original grid page lengths `[80,104,72]`, all nine observable outputs and a deliberately planted readable message that its exact XOR inverse restores without error. These controls show how a real source-half pad would be recognized; they do not authenticate that this pad was intended.

This independent **2014-era key candidate** complements the earlier [2016 signed-message RSA-half direct table test](signed2016-signature-half-grid-inverse.md), which obtained another finite negative using a later signed source. The two tests must not be conflated as evidence for all possible public-key-derived KDFs. Neither one proves the table is not encrypted or excludes a different author-supplied key.

**Decision:** retire these nine simple 2014 Stage11 signature-half byte readouts. Do not expand into arbitrary signature offsets, permutations, hashes or multiple encryption layers without a newly original-source-selected operation. The 56 unsolved LP2 pages remain unsolved.