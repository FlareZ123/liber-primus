# LP1 p05 trailer: historically known reversed hex magic square and JPEG mirror

**Corrected source regression (16 November 2026, Agent17).** The first version of this note used the **last** byte occurrence of `FF D9` as though it were the end of the primary JPEG. That approach ignored an earlier complete JPEG and therefore gave the false impression that a 72,700-byte end suffix was the entire p05 extra data. The actual source trailer has **336,713 bytes**, already described in public work at [Cicada Notebook Session 37](https://cicadanotebook.com/sessions/37.html) and [Session 103](https://cicadanotebook.com/sessions/103.html). **This is an established first-release LP1 construction, not a novel LP2 decryption.**

The exact original `resources/liber-primus/05.jpg` is 673,066 bytes with SHA-256 `2db94921ae5216d8a589890495fa5432446cd3227c45fbeb4934cbb0525112f7`. Its **first** JPEG EOI `FF D9` ends at exclusive offset **336,353**. The source then carries precisely **360 ASCII bytes**, including initial and final newlines, followed by **336,353 bytes that are the complete first JPEG in exact reverse byte order**. The mirror is redundant image content. The 360 ASCII bytes are nonredundant: trim surrounding whitespace, reverse all **358 hexadecimal characters**, then decode pairs of hex characters as ASCII. The result is the historical p05 5×5 magic square:

```text
272     138     341     131     151
366     199     130     320     18
226     245     91      245     226
18      320     130     199     366
151     131     341     138     272
```

Every row, column and main diagonal sums to **1033**. This exactly reconstructs the already visible/solved LP1 Some Wisdom table. The image-prefix SHA-256 before the appended bytes is `c517d5d87544a761188cd50c46473898ab9d2c0da108cf13c61234dc1bda635a`.

A first-EOI census over all 75 original JPEGs finds **two** composite files, not one. Original `10.jpg`, SHA-256 `12ebfe421c129f2ef78d527c1630e358963da8d8dfdf9620eb977980d7967376`, begins with a **754,662-byte** complete JPEG and is followed by the exact byte-for-byte concatenation of the independent full `11.jpg`, `12.jpg` and `13.jpg` (3,486,295 bytes). All remaining **73** images end at their first EOI marker. Checking only the *last* EOI incorrectly hides both composite-file structures. This is a useful source parsing regression for other projects handling nested or appended JPEGs.

**Research implication:** the recovered 25 original numbers are already independently available in the visual LP1 magic square and the 2014 OpenPuff stage. The reversed JPEG also carries no independent unknown-page rune text. Neither the reversed-hex read, the number 1033, nor source concatenation selects a decoder/key for LP2 p0–55. No original unknown LP2 plaintext or final destination has been recovered here.

**Reproduction:** [single-file Node.js 22 original-byte SFT](../sims/lp2_jpeg05_reversed_prefix_sft.cjs). It pins p05/p10 whole-file hashes, verifies every source's *first* EOI boundary, decodes the actual 358 hex characters, asserts every 25 magic-square value and 12 sums, detects a one-bit mirror corruption, and checks the exact 10→11/12/13 subimage bytes. The source ZIP used for the local extraction contains `00.jpg` through `74.jpg` from the repository's pinned original archive.
