# p32 M7 / 2016 signed-word extraction and 30/32 fragment alignment

**Status: intermediate structural hypothesis. No plaintext, key, or complete cipher recovered.** This belongs in `im-results/`, not `results/`.

## Source-derived selector

The p32 ring-derived Möbius map in [the p32 prime-canvas analysis](tree-prime-canvas-partition.md) is
\[
f(x)=\frac{14x+25}{25x+28}\pmod{29}.
\]
Its seven-cycle starting at the red 13-dot count is
\[
13\to24\to19\to3\to6\to20\to17\to13.
\]
This is the only seven-cycle whose values are all valid one-based word positions in p32's 26 printed rune-words.

| p32 ordinal | GP transliteration | Runes | GP-prime sum |
|---:|---|---:|---:|
| 13 | WBSRXYX | 7 | 345 |
| 24 | UT | 2 | 62 |
| 19 | MBUDS | 5 | 277 |
| 3 | AEUPIAC | 5 | 267 |
| 6 | IARTHF | 5 | 184 |
| 20 | BJ | 2 | 98 |
| 17 | SPTHT | 4 | 160 |
| **Total** | | **30** | **1,393** |

The selected rune count is 30, the size of \(\mathbf P^1(\mathbb F_{29})\). The sum of floor-half word lengths is 13, matching the 13-dot marker count. The prime-sum total is \(1393=1136+257\), where 1,136 is the signed 2016 payload length and 257 is one p32 ring-side sum. These are correspondences, not proof.

## Two selections from the 2016 signed message

The complete signed cleartext has **45 alphanumeric tokens** if its visible final key-ID token `7A35090F` is counted. It has 44 alphabetic-only words if that token is excluded.

1. Use the M7 cycle values directly as one-based message-word positions:
   - Positions: `13,24,19,3,6,20,17`
   - Words: **the / road / map / path / epiphany / their / are**
   - Word lengths: `3,4,3,4,8,5,3`, total **30**
   - Concatenation: `THEROADMAPPATHEPIPHANYTHEIRARE`

2. Use the seven p32 prime sums as one-based message-word addresses modulo 45, \(((s-1)\bmod45)+1\):
   - Positions: `30,17,7,42,4,8,25`
   - Words: **direction / are / seeks / paths / lies / the / and**
   - Word lengths: `9,3,5,5,4,3,3`, total **32**
   - Concatenation: `DIRECTIONARESEEKSPATHSLIESTHEAND`

   If the final numeric key ID is excluded and the modulus is 44, the second selection becomes `good / the / the / path / the / liber / are`, total length 25. Thus the 32-letter result depends on counting the visible key ID as the 45th token. That is plausible for the complete signed payload, but not authenticated as the intended word-count convention.

## Exact alignment with the 13-dot fragments

The 31 annotated 13-dot marks split the complete 13,136-rune manuscript stream into **32 full-text fragments**. The first 28 fragments end at the 12,956-rune unknown LP2 stream; the final four are the solved p56/p57 tail. Exactly **30 fragments are nonempty**. The two empty fragments are zero-based indices **8 and 11**.

Align the 32-letter B stream above with the 32 chronological fragments:
- Empty fragment 8 carries **N**, the final letter of *DIRECTION*.
- Empty fragment 11 carries **E**, the final letter of *ARE*.

The empty slots therefore spell **NE**. The first two B-word lengths, 9 and 3, partition the 32 fragments into groups ending exactly after fragments 8 and 11—the two empty fragments. The full B group boundaries are after original fragment IDs `8,11,16,21,25,28,31`.

Removing the N/E positions leaves the 30-letter stream `DIRECTIOARSEEKSPATHSLIESTHEAND`, aligned in length with the 30 nonempty fragments.

Independently, the 30-letter A stream partitions the 30 nonempty fragments using its word lengths `3,4,3,4,8,5,3`. Its group boundaries are after original fragment IDs `2,6,10,15,23,28,31`. Both partitions share boundaries after original fragment IDs 28 and 31.

## Paired partitions do not define a fragment permutation

The previously open question was whether the A and B word partitions jointly prescribe a nontrivial permutation of the 30 nonempty fragments. I built the exact 7×7 overlap matrix, with A-word groups as rows and B-word groups as columns. Each cell contains the fragments that lie in both contiguous intervals:

| A group \ B group | direction | are | seeks | paths | lies | the | and |
|---:|---:|---:|---:|---:|---:|---:|---:|
| the | 3 | 0 | 0 | 0 | 0 | 0 | 0 |
| road | 4 | 0 | 0 | 0 | 0 | 0 | 0 |
| map | 1 | 2 | 0 | 0 | 0 | 0 | 0 |
| path | 0 | 0 | 4 | 0 | 0 | 0 | 0 |
| epiphany | 0 | 0 | 1 | 5 | 2 | 0 | 0 |
| their | 0 | 0 | 0 | 0 | 2 | 3 | 0 |
| are | 0 | 0 | 0 | 0 | 0 | 0 | 3 |

The nonzero cells form a monotone staircase. Reading the occupied cells row-major or column-major, preserving chronological order within each cell, yields exactly the original chronological fragment order:
`[0,1,2,3,4,5,6,7,9,10,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31]`.

This is not a new permutation. It is the inevitable overlap structure of two interval partitions of the same ordered sequence. The A/B streams supply two synchronized segmentations, not a reordering. Consequently, no language-score change is possible from row-major versus column-major reading alone.

**Decision:** close the paired-partition-as-permutation hypothesis. Do not search arbitrary within-cell permutations or additional transpositions without an independent source clue. The NE alignment and shared boundaries remain structural observations, not a cipher.

## Earlier bounded tests and exclusions

- A1Z26 Vigenère using A, both signs and global/page clocks: worse than raw GP29 ciphertext.
- A1Z26 constant Caesar shift per full-text fragment using B, both signs and A=0/A=1 conventions: worse than raw.
- Group-total mod-29 keys from the A/B partitions: worse than raw.
- One 4×8 row-major NE-diagonal fragment traversal scored slightly worse than chronological raw (−7.440398 vs −7.439749). This rejects that exact layout, not every NE traversal.
- Pairing A and B-without-NE as projective coordinates does not enumerate \(\mathbf P^1(\mathbb F_{29})\); the simplest A1Z26 ratio map has only 20 distinct outputs.

The earlier 7×7 square route with a \(4\times30\) residual was withdrawn because it depended on an unsupported compass-index convention. Do not reuse that checksum. Agent 48's separate inverse-M7 first-clause centre route and its 47 residual are distinct.

Reproducer: `sims/p32_m7_2016_word_fragment_alignment.cjs`.
