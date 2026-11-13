# 2013 CicadaOS random tape does not directly contain the 2014 LP2 numerical grid

**Agent 4, 13 November 2026. Result:** exhaustive exact-window negative for five source-motivated constant-mask models across the complete 118,818,811-byte 2013 file `DATA/560.13` and four unfitted print geometries of the original 256-cell LP2 table. **No LP2 plaintext, recovered historic key, or new destination.** Independently executed [passing GitHub Actions run 43337623517](https://github.com/FlareZ123/liber-primus/actions/runs/43337623517).

## Why test an older Cicada key source?

The 2013 CicadaOS ISO supplied large machine-readable random-data files used in authentic earlier Cicada binary/XOR challenges. The 2014 LP2 release separately contains a visually structured 32×8 table of 256 printed radix-60 numbers. A deliberate reuse of a short contiguous fragment of the *old, published* random file, perhaps after a single affine byte mask, could provide a recognizable historical key and a definite offset. The crucial unproven assumption is that the 2014 table directly recycles bytes from 2013; neither puzzle's signed instructions state this.

Use the actual 2013 ISO at [preserved CicadaOS copy](https://connortumbleson.com/uploads/2024/01/3301.iso), MD5 `74062dee4093c6ca0340cda23f0e994b`. Parse its read-only ISO9660 directory records to extract the original file `DATA/560.13` (**118,818,811 bytes**). Use the manuscript's existing [printed-order 256-byte transcription](../resources/liber-primus/lp2-grid-256.json), source SHA256 `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`. The radix-60 interpretation is conditional; the original JPEGs print two-character tokens rather than binary.

## Frozen original-input inversions

Test each of four literal table views: printed 32×8 row-major, reverse row-major, 32×8 column-major, reverse column-major. For every orientation, search the **entire** historical random tape for any 256-byte contiguous segment that could generate the printed table under:

1. One unknown byte applied by XOR at every position.
2. One unknown byte added modulo256 at every position.
3. Eight unknown XOR mask bytes, repeated with period eight.
4. Eight unknown additive-mask bytes modulo256, repeated with period eight.
5. One unknown GP29 additive constant applied to **each byte modulo29**. This last test deliberately ignores the high radix-29 digit and asks only whether the lower residues could share a historical source.

Crucially, the unknown mask is **not** searched over 256 or 256^8 guesses. It cancels algebraically when comparing the source table to the candidate historical bytes at displacement one or eight. Model-specific exact lagged-difference signatures are indexed for all possible 256-byte table alignments; every tape position is inspected in one rolling-hash pass per model. A six-difference byte signature (or nine-difference residue signature) nominates a match, then the prospective source offset, mask, and longest exact byte agreement can be reconstructed. This is a falsifiable, original-key identification test without English-scored phase fitting.

| Search family | Different indexed signatures, all orientations | Historical tape matches |
| --- | ---: | ---: |
| XOR, unknown constant byte | 1,000 | **0** |
| Additive modulo256, unknown constant byte | 1,000 | **0** |
| XOR, unknown repeating eight bytes | 972 | **0** |
| Additive modulo256, unknown repeating eight bytes | 972 | **0** |
| Modulo29, unknown GP29 shift | 988 | **0** |

Every model first passed a 256-byte source-native positive with an unknown mask and nonzero synthetic offset (**5/5**), including reverse/column source-support through the shared layout selector. The original ISO checksum, extracted tape length, canonical grid checksum and exact result counts were asserted in the passing CI run. These five families tested *all* possible offsets within the retained 118.8MB file and had zero possible 6- or 9-difference prefixes, so they cannot contain a complete 256-symbol source match under those families.

## Decision and explicit boundaries

The printed 2014 grid is **not** a literal contiguous fragment of the earlier archived random tape under the specified byte or lower-residue constant/repeating-8 masks and four source-natural whole-table orientations. This directly blocks a historical-key reuse route that would otherwise produce an exact source offset. It does not reject more complicated KDFs, non-contiguous sampling, row-varying masks, alternative historical files, an encrypted table, different numeral radix, or reuse of a tape section as a GP29 keystream on an unrelated page. No new model is licensed solely by these zero hits.

**Reproducer:** [single-file CommonJS scanner](../sims/lp2_2013_cicadaos_grid_tape_window_sft.cjs); [manually dispatched workflow](../.github/workflows/lp2-2013-cicadaos-grid-tape-manual.yml); [full successful original-input run](https://github.com/FlareZ123/liber-primus/actions/runs/43337623517). The runner downloads the original ISO, checks its MD5, reads rather than executes the ISO, and reproduces all five whole-file scans.

## Entire ISO cross-file coverage (additional original source, 13 November 2026)

The same original ISO is slightly larger than its DATA/560.13 member. A separately frozen companion pass examines **every ISO byte outside that file extent** using the same four table orientations, five source-independent masks, and exact six- or nine-difference signatures. The two subranges preserve original ISO byte order and use no guessed carrier names, offsets or file decoding. This broadens the specific search from the old random tape to **all remaining raw original 2013 OS image bytes**, including the alternate DATA members, binaries, padding and filesystem structures, without repeating the already negative 118.8 MB scan. The same signed-checksum file remains the stronger plausible historical source; the unallocated/other-file scans are exploratory.

The supplementary runner and five per-subrange results are logged in its second manually dispatched run. Its negative result, if obtained, excludes the same exact-copy/constant-mask interpretations over the *raw* full ISO, not compressed-file decompression, positional data-file extraction or derived 2013 keys.
