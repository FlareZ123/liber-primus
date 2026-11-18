# Original terminal ring table: 180 inside values do not determine 76 outside by Shamir/Reed–Solomon evaluation

**Agent39, 18 November 2026. Source-exact bounded negative; no unknown LP2 plaintext or key recovered.**

## Why this is a specific potential terminal decoder

The original LP2 pp49–51 image table is 32×8 = 256 numeric cells, whose 30×6 interior has **180 cells** and one-cell perimeter has **76**. These are exactly the adjacent terminal physical page rune counts: solved p56 has 85 runes, clear p57 has 95, and still-unknown p55 has 76. The clear p57 wording about shedding *circumferences* provides a historically visible reason to distinguish outer and inner rings. The genuine 2013 Cicada use of finite-field secret sharing provides a separate precedent for interpolating many known values to recover missing values.

A concrete inversion would treat the original 256 byte values as evaluations of one degree-at-most-179 polynomial at source order coordinates 0…255. The 180 interior values uniquely determine that polynomial; **76 outer values are withheld checks**. If they matched, the recovered polynomial could be extended and tested as a candidate missing key or terminal-value consumer. It would be meaningful exact source structure, rather than an arbitrary fitted curve.

## Original-source exact test

The [Windows Node.js 22 standalone test](../sims/lp2_grid_inner180_rs_perimeter76_original_sft.cjs) pins the unchanged original 256-byte table SHA-256 as `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`. It reads the original terminal page rune lengths 76+85+95 and verifies the 180/76 cell split.

For six natural orderings (printed, reverse printed, outer-to-inner clockwise and anticlockwise spiral, plus reverses of the two spirals), the test performs full Newton interpolation from **only** the 180 interior bytes. It evaluates all remaining 76 physical perimeter positions over three finite-field registers: GF(2^8) with the AES polynomial 0x11b, GF(2^8) with the standard Reed–Solomon polynomial 0x11d, and GF(257). No guessed plaintext, secret polynomial coefficients, source correction, or selected subset of the withheld data is used.

| Original field hypothesis | Six directions | Exact withheld perimeter values predicted |
|---|---:|---:|
| GF(256), 0x11b | 6 | **0/76 each** |
| GF(256), 0x11d | 6 | **0/76 each** |
| GF(257) | 6 | **0/76 each** |

For every one of the 18 tests, a planted degree-179 finite-field codeword on the **same 256 physical coordinates** passes the exact 180-to-76 inverse **76/76**, while the untouched original gives zero. This rules out precisely the stated full-table polynomial-codeword model in these source-natural registers. The degree bound is a **motivated hypothesis**, not an assertion that the author chose Reed–Solomon coding.

This branch is different from the existing [eight-share-per-row Shamir interpolation](../sims/grid_shamir_rs_inverse.cjs), which fits eight values at each of 32 rows and produces a tautological 32-byte candidate key, and from the [byte-to-GP29 lookup exclusion](lp2-p50-inner180-fullbyte-codebook-known180-gate.md), which tests repeated-value consistency with authentic known plaintext.

## Cipher decision

The full 256-byte table in these orders cannot be decoded through a single degree<180 polynomial that treats 180 inner bytes as shares and 76 outer bytes as missing evaluations. This experiment neither authenticates a 2014 Shamir instruction for this table nor addresses a **different source-selected evaluation-point order**, a non-polynomial mechanism, or a table that is merely unrelated random-looking material. It yields no p55 plaintext. Future terminal decoders need a new original-authored operation that produces genuine unknown-page runes, rather than a repeat of interpolating the same geometrical 180/76 partition.
