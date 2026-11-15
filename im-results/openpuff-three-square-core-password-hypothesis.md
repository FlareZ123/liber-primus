# Three-square peeled-core OpenPuff password hypothesis

**Status:** source-constrained candidate; native OpenPuff extraction pending. This is not a decryption or an established result.

## Hypothesis

The 2014 OpenPuff-recovered payload contains three magic squares in published order: 5×5, 7×7, 5×5, with magic constants 3301, 1033, 1033. The LP2 cuneiform-marked section is the seven-page run p33–39 (original JPEGs 50–56); its 1033/3301 numerals select the same 2014 source family.

A plausible next-stage use of the three squares is to derive OpenPuff's three password fields A/B/C:

1. Apply the p57 instruction to shed circumferences: remove the outer one-cell ring from each square. The resulting core sizes are 3×3, 5×5, 3×3.
2. Apply the LP1 Wisdom/totient operation cellwise: n maps to phi(n) mod 29.
3. Encode the residues using the canonical 29-entry Gematria Primus transliteration, in row-major order.
4. Assign the three resulting ASCII strings to OpenPuff A/B/C in square order.

This route is unusually constrained: OpenPuff has exactly three password fields, each 8–32 characters, and checks bit-level separation. The derived strings are all within that length range. Their ASCII bit-Hamming distances also clear a conservative 25% zero-padded comparison; the native GUI's own password-status control is the authoritative check.

## Exact predicted passwords

| Field | Source square | Peeled core | Password | ASCII length |
|---|---:|---:|---|---:|
| A | 5×5, magic constant 3301 | 3×3 | BTHNHAEHNTHB | 12 |
| B | 7×7, magic constant 1033 | 5×5 | MGBTHPAEDWAOEMXJXMOEAWDAEPTHBGM | 31 |
| C | 5×5, magic constant 1033 | 3×3 | AMEODXDEOMA | 11 |

The 3×3/5×5/3×3 cores contain 9/25/9 GP symbols respectively. The ASCII transliteration expands digraph runes, giving 12/31/11 password characters.

Pairwise ASCII bit-Hamming distances with shorter strings zero-padded to the longer length:

- A/B: 86 of 248 bits = 34.68%
- A/C: 26 of 96 bits = 27.08%
- B/C: 86 of 248 bits = 34.68%

The reproducible derivation is sims/openpuff_three_square_core_passwords.py.

## Decisive experiment

Use the pinned original OpenPuff v4.00 executable and its native GUI, with the seven original JPEGs 50–56 in published order and the exact A/B/C strings above. Run the source-default JPEG Medium 1/5 setting and the common JPEG Maximum 1/2 setting as two separate dispatches. The workflow is .github/workflows/openpuff-v400-lp2-three-square-core-passwords.yml.

The workflow first reproduces the published A-only JPEG positive control on the same runner, verifies that the original seven-carrier chain and bit selection were actually executed, records OpenPuff's own password-status text, and preserves all extracted bytes and GUI evidence.

## Interpretation

- A native output from the original seven carriers would be a major lead, but it must be byte-hashed, classified, and independently reproduced before any plaintext or intended-solution claim.
- A GUI password rejection falsifies this exact transliteration/peeling construction.
- A completed no-file/corrupted-stream outcome at both tested JPEG levels falsifies this exact A/B/C triple on the selected seven carriers. It does not justify unconstrained password or carrier-order searches.
