# Printed 256-byte LP2 table as a direct RC4 key: original-input gate

**Status (10 November 2026): narrowly rejected, no recovered unknown plaintext or key.** The main remaining problem is an independently specified encryption operation, not another blind grid-key sweep. This supporting study is a deliberately finite test of one standard operation on an unusually exact source size. It is not an established cipher mechanism.

## Source and frozen proposal

LP2 physical pp49–51 print 32×8 two-character entries. The repository's canonical base60 interpretation yields exactly 256 bytes in printed row-major order: [`lp2-grid-256.json`](../resources/liber-primus/lp2-grid-256.json). A standard RC4 key may contain 256 bytes, so the table has an immediately testable **hypothetical** role as a complete RC4 KSA key. This key length alone does **not** provide a visible instruction to use RC4, and the base60 reading is an assumption.

Fix the key to all 256 printed bytes, standard RC4 KSA and PRGA, no added nonce, discard or key derivation. Convert output bytes to GP29 pads by `byte mod 29`. Test the following **eight** reversible original-cipher inverses across the 55 rune-bearing physical LP2 pp0–55, containing **12,956 unknown rune indices**:

- RC4 either continues across the book or resets at each physical page.
- Output is either a direct GP29 additive stream or a page-local ciphertext-difference stream, where the predecessor before each page's first rune is the zero field element.
- Both additive key signs are admitted; all modes invert and forward-encrypt exactly.

These choices are bounded for their direct key/cipher semantics. They do not purport to cover RC4 drop-N, a KDF, stream/key skips, non-GP encodings, doublet edits, or arbitrary keyed operations.

## Original result and positive control

The original ciphertext has IoC **0.0344783978645**. The eight decoded original candidates all retain near-random GP29 IoC, with extrema **0.0344623592555–0.0345262753762**, and their initial rune previews are nonsensical. The candidate values, which can be reproduced by the linked SFT, are:

| RC4 clock | Direct + | Direct − | Difference + | Difference − |
| --- | ---: | ---: | ---: | ---: |
| Book | 0.034502158 | 0.034512119 | 0.034472893 | 0.034477147 |
| Page reset | 0.034462359 | 0.034526275 | 0.034490087 | 0.034470974 |

For each of the eight models, a separately obtained solved-LP1 English transliteration was greedily converted to native GP tokens and encrypted under that exact model, then independently inverted. **12,956/12,956 planted GP runes were recovered exactly in every mode**, with recovered IoC **0.062154698**, as compared with the original source's **0.03448**. This is a strong correctness test for the finite invertible implementation and a bounded negative for native-GP English recovery. It is not evidence that an authentic LP2 solution must have this IoC or use this text register.

**Standalone reproducer:** [`sims/lp2_grid256_rc4_original_sft.cjs`](../sims/lp2_grid256_rc4_original_sft.cjs), using the two canonical source JSON files and [the independently solved LP1 textual control](../resources/liber-primus/lp1-plaintext-reference.txt). The first 32 candidate runes and per-model recovered control count are emitted for inspection; the positive control asserts exact roundtrip.

## Interpretation

The simple source-table-as-full-RC4-key interpretation under the specified direct-GP and ciphertext-difference operations yields no decryptions. The broader 256-element state-table hypothesis remains open if an original clue specifies a materially different state transition, byte register or source extraction. Do not extend this negative to all stream ciphers or mistake the 256-byte coincidence for a cipher instruction. Further work should supply an independent algorithm/state clue and test a held-out original interval.
