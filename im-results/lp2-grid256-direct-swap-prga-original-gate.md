# Original LP2 p50 table as 256 direct swap addresses for an RC4-state initializer

**Agent14, 12 November 2026. Evidence class:** exact finite original-cipher inverse and native-positive gate for a *distinct* table consumer. No plaintext, source-selected key, encryption algorithm or destination recovered. This is a bounded **negative** and does not change the established synthesis in `results/README.md`.

## Premise and frozen reversible operation

The manuscript's pp49–51 number table prints 256 cells. Historical Cicada material explicitly uses OutGuess, which invokes an RC4-derived state generator. The existing [ordinary RC4 KSA experiment](lp2-grid256-rc4-original-gate.md) interprets those values as a 256-byte **key**, with the standard adding-j initialization, and fails. The table contains only 161 different bytes, also ruling out its being an already-made 256-state permutation. One third compact, fully specified and *untested by that KSA gate* is to treat each byte as an **index to swap**, without the RC4 KSA addition:

- Set `S[i]=i` for indices 0–255.
- For source table index `i` ascending 0–255, swap `S[i]` and `S[table[i]]`.
- Initialize `i=j=0` and run the ordinary RC4 PRGA, without drop bytes or nonce.
- Reduce each resulting byte modulo 29 to a GP29 pad.
- Try the two original-source table witnesses: the image-validated canonical LP2 base60 table and the independently archived 2014 solver `sexagesimal.bin` witness, which differ in ten byte positions.

Under either key clock, book-global or fresh per physical page, invert the original unchanged ciphertext by either native GP29 addition or page-local ciphertext differencing (`D_i=C_i−C_{i−1} mod29`, with page IV zero). For each, apply either ± pad sign. This fixes exactly **2×2×2×2=16** original-input operations. There is no fitted key, crib, phase, changed glyph, page-filtering or English-led model selection.

The direct permutation construction works with repeated table bytes and differs from a literal stored S-box, since the 256 swaps always preserve permutation invariance.

## Original-input result

**Inputs:** unchanged `resources/liber-primus/lp2-corpus.json` (55 rune-bearing physical pages, p0–55, 12,956 original GP29 indices), `resources/liber-primus/lp2-grid-256.json`, and `resources/cicada2014-sexagesimal-source.json`. The SFT independently validates every input byte range.

Original ciphertext aggregate IoC: **0.03447839786450569**. Exact GP29-uniform expectation is 1/29 ≈ **0.0344827586**.

| Table witness | Book direct −/+ | Book diff −/+ | Page direct −/+ | Page diff −/+ |
| --- | --- | --- | --- | --- |
| Original LP2 | 0.034457164 / 0.034464826 | 0.034516647 / 0.034471225 | 0.034479613 / 0.034469056 | 0.034475514 / 0.034467721 |
| Archived 2014 | 0.034522534 / 0.034449395 | 0.034462633 / 0.034494448 | 0.034462538 / 0.034465398 | 0.034507353 / 0.034474787 |

All **16** original decoded streams have IoC within **0.034449–0.034523** and initial symbol strings remain nonlinguistic. No coherent GP-English prose, candidate key, or instruction appears. The inverse follows the exact reversible forward transform. All 16 forward reconstructions return the original **12,956/12,956** ciphertext runes.

**Native control:** actual solved LP2 p57 PARABLE contains 95 known GP29 runes. Every one of the 16 variants first encrypts those 95 original-source plaintext runes with the same source-table schedule and then recovers **95/95** under its inverse. This ensures the finite negative is not an inverse bookkeeping error.

## Decision

Retire the **literal direct-swap RC4 PRGA state initialization** model for GP29-additive or original-page-differential English at book-global and physical-page reset clocks, under both documented table witnesses and ± signs. This says nothing about a manuscript-guided way to derive a different state schedule, plaintext byte framing, word-boundary transport, keyed permutation, or further encryption layer. There is currently no original clue selecting this swap mechanism, so more variants would be unsourced key search.

**Reproducer:** [`sims/lp2_grid256_swap_schedule_rc4_sft.cjs`](../sims/lp2_grid256_swap_schedule_rc4_sft.cjs), Node.js 22 CommonJS, read-only, with exact source assertions and complete JSON output.
