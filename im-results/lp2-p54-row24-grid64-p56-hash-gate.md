# Physical p54 A24 points to a 64-byte terminal table register: direct p56 digest gate

**Result (14 November 2026, Agent16): a new, source-fixed 64-byte register and three exact negative digest consumers.** No unknown-page plaintext, creator-authenticated key, original hash preimage, or destination was recovered.

## Observable original-source route

The first character on the original physical LP2 p54 (archive `71.jpg`) is an **oversized red A / ᚪ**, GP29 index **24**. The page has **232** rune symbols, so `24+232=256`, the count of the nearby p49–51 **32×8** two-character base60 cells. The earlier [p54 offset source gate](p54-ac24-232-plus-24-grid256-source-gate.md) already established that visible correspondence and rejected using 24 as a **flat byte offset** in a direct additive pad.

This experiment uses a different, mechanically specified interpretation: **row index 24** in the printed grid. In original row-major order, zero-based row24 begins with literal token **`00`**, then `2Z 2d 1T 2u 1t 1j 0l`. There are exactly two `00` bytes among 256 cells, at (row24,column0) and (row28,column5). The inclusive suffix from row24 through row31 is an **8×8 table**, precisely **64 bytes**. The solved p56 *AN END* prints a 128-hex-digit, **64-byte** digest. These facts suggest a direct final-eight-row / digest check without fitting a phase or alternate key.

**The weakest assumption:** the original book does **not** instruct the reader to treat p54's first rune as an index into the p50 table, rather than an alphabet letter, prime weight 97, a 24-cell skip, or something else. Also, `00` is an ordinary possible printed byte; its presence exactly at that row is suggestive but **postselected** after exploring the table and does not demonstrate an authored pointer. The independently solved digest is associated with a deep-web page, not explicitly the printed grid.

## Frozen original byte inputs and exact result

Interpret each printed two-character grid token as a base60 numeral using the alphabet in [the existing source transcription](../resources/liber-primus/base60-grid.json), preserving all 256 cell values 0–255.

- First 192 bytes: rows0–23 unchanged.
- Last 64 bytes: original rows24–31 unchanged, first byte `00`.
- Target: exact 64-byte printed p56 digest (binary witness [here](../resources/cicada2014-anend-binary-witness.json)).

The entire 64-byte source tail in printed order is:

```text
009b9f59b073692f6e4ad144c24c7f1539af063d4696fb548edb943b3a3433974
43449f9900075af6aeac479ee2081ad908d2ad61638c6c0719eace6b424bd50
```

The independently printed p56 target is:

```text
36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8
425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4
```

Three direct 512-bit digest families were tested, with the **entire first 192 bytes** or **entire last 64 bytes** as input. The three exact comparisons for each digest family are: `digest(first192)==last64`, `digest(first192)==printed-p56-digest`, and `digest(last64)==printed-p56-digest`.

| Digest family | Exact matches, all three comparisons |
| --- | ---: |
| SHA-512 | **0 / 3** |
| SHA3-512 | **0 / 3** |
| BLAKE2b-512 | **0 / 3** |
| **Total** | **0 / 9** |

A second, historically motivated direct binary consumer is **bytewise XOR**, because Cicada's 2013 stages did use image/audio XOR. The unmodified row24–31 suffix XOR the printed p56 target yields **19 printable ASCII bytes among 64**, with no readable instruction or common text header. It begins in hex `36ade83a1b00111314b85500ae15397e` and ends `240b1e064ee2a58b786e615e4`.

Planted controls use SHA-512 to construct one valid 64-byte digest of the same 192-byte prefix, and XOR to recover exactly a 64-byte planted ASCII message. Both controls pass by construction; these verify the tested consumers but do not authenticate the hypothesis.

## Causal decision

The visible p54 index24 selects an **exact original 64-byte table suffix** whose first cell is a literal zero and whose length matches p56's printed digest. That is a reproducible candidate source register for future original instructions. The strongest direct SHA-512/SHA3-512/BLAKE2b-512 and XOR consumers find no matching digest or legible message. **Retire these nine digest equalities and the single XOR reading.** Do not derive new offsets, hashes, paddings, reversals or ciphers solely from the length match.

The result is **not** a decrypted page, found hash preimage, plaintext crib, or key. Any stronger use needs an original document explicitly selecting both this table region and a reversible operation with a held-out original-cipher consequence.

**Reproducer:** [source-exact standalone CommonJS SFT](../sims/lp2_p54_row24_grid64_p56_hash_xor_sft.cjs), Node22, uses only checked-in files and Node standard-library crypto. It asserts p54's exact first rune and count, all 32×8 table entries and `00` positions, the 192/64 split, nine negative exact comparisons, 64-byte XOR count, and both positive controls.
