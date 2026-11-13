# 2013 CicadaOS random tape does not directly contain the 2014 LP2 numerical grid

**Agent 4, 13 November 2026. Result:** exhaustive exact-window negative for five source-motivated constant-mask models over all 136,398,848 raw bytes of the 2013 CicadaOS ISO, except the two source-file boundary crossings, and **all eight unfitted rectangular orientations** of the original 256-cell LP2 numeric table. **No LP2 plaintext, recovered historic key, or new destination.** The definitive [passing third original-input GitHub Actions run 43341319497](https://github.com/FlareZ123/liber-primus/actions/runs/43341319497) completes the two earlier four-orientation scans.

## Why test an older Cicada key source?

The 2013 CicadaOS ISO supplied large machine-readable random-data files used in authentic earlier Cicada binary/XOR challenges. The 2014 LP2 release separately contains a visually structured 32×8 table of 256 printed radix-60 numbers. A deliberate reuse of a short contiguous fragment of the *old, published* random file, perhaps after a single affine byte mask, could provide a recognizable historical key and a definite offset. The crucial unproven assumption is that the 2014 table directly recycles bytes from 2013; neither puzzle's signed instructions state this.

Use the actual 2013 ISO at [preserved CicadaOS copy](https://connortumbleson.com/uploads/2024/01/3301.iso), MD5 `74062dee4093c6ca0340cda23f0e994b`. Parse its read-only ISO9660 directory records to extract the original file `DATA/560.13` (**118,818,811 bytes**). Use the manuscript's existing [printed-order 256-byte transcription](../resources/liber-primus/lp2-grid-256.json), source SHA256 `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`. The radix-60 interpretation is conditional; the original JPEGs print two-character tokens rather than binary.

## Frozen original-input inversions

Test each of **eight** source-geometry views: printed 32×8 row-major or transposed column-major, independently retaining or reflecting the physical **32 rows** and **eight columns**. This includes reverse row-major/column-major and the four single-axis reflections absent from the earlier tests. For every orientation, search the **entire** historical random tape for any 256-byte contiguous segment that could generate the printed table under:

1. One unknown byte applied by XOR at every position.
2. One unknown byte added modulo256 at every position.
3. Eight unknown XOR mask bytes, repeated with period eight.
4. Eight unknown additive-mask bytes modulo256, repeated with period eight.
5. One unknown GP29 additive constant applied to **each byte modulo29**. This last test deliberately ignores the high radix-29 digit and asks only whether the lower residues could share a historical source.

Crucially, the unknown mask is **not** searched over 256 or 256^8 guesses. It cancels algebraically when comparing the source table to the candidate historical bytes at displacement one or eight. Model-specific exact lagged-difference signatures are indexed for all possible 256-byte table alignments; every tape position is inspected in one rolling-hash pass per model. A six-difference byte signature (or nine-difference residue signature) nominates a match, then the prospective source offset, mask, and longest exact byte agreement can be reconstructed. This is a falsifiable, original-key identification test without English-scored phase fitting.

| Search family | Different indexed signatures, all orientations | Historical tape matches |
| --- | ---: | ---: |
| XOR, unknown constant byte | 1,456 | **0** |
| Additive modulo256, unknown constant byte | 1,456 | **0** |
| XOR, unknown repeating eight bytes | 1,454 | **0** |
| Additive modulo256, unknown repeating eight bytes | 1,640 | **0** |
| Modulo29, unknown GP29 shift | 1,606 | **0** |

Every model first passed a 256-byte source-native positive with an unknown mask and nonzero synthetic offset (**5/5**), including reverse/column source-support through the shared layout selector. The original ISO checksum, extracted tape length, canonical grid checksum and exact result counts were asserted in the passing CI run. These five families tested every 256-byte start within each of the three ISO regions and had zero possible 6- or 9-difference prefixes, so they cannot contain a complete 256-symbol source match under those families.

## Decision and explicit boundaries

The printed 2014 grid is **not** a literal contiguous fragment of any tested within-extent region of the 2013 ISO under the specified byte or lower-residue constant/repeating-8 masks and eight exact geometry-derived table orientations. This directly blocks a historical-key reuse route that would otherwise produce an exact source offset. It does not reject more complicated KDFs, non-contiguous sampling, row-varying masks, alternative historical files, an encrypted table, different numeral radix, or reuse of a tape section as a GP29 keystream on an unrelated page. No new model is licensed solely by these zero hits.

**Reproducer:** [single-file CommonJS scanner](../sims/lp2_2013_cicadaos_grid_tape_window_sft.cjs); [manually dispatched workflow](../.github/workflows/lp2-2013-cicadaos-grid-tape-manual.yml); [full eight-orientation original-input run](https://github.com/FlareZ123/liber-primus/actions/runs/43341319497). The runner downloads the original ISO, checks its MD5, reads rather than executes the ISO, and reproduces all five whole-file scans.

## Full raw ISO source coverage

The same original ISO is larger than its DATA/560.13 member. An independently bounded extension examines **every ISO byte outside that file extent** using the same eight table orientations, five source-independent masks, and exact six- or nine-difference signatures. The two subranges preserve original ISO byte order and use no guessed carrier names, offsets or file decoding. This broadens the specific search from the old random tape to **all remaining raw original 2013 OS image bytes**, including the alternate DATA members, binaries, padding and filesystem structures, without repeating the already negative 118.8 MB scan. The same signed-checksum file remains the stronger plausible historical source; the unallocated/other-file scans are exploratory.

**Executed original-source result:** [passing third manual Actions run 43341319497](https://github.com/FlareZ123/liber-primus/actions/runs/43341319497), same verified ISO and exact original table, now with all eight orientations. The extra original ISO ranges are **4,087,808 bytes before** and **13,492,229 bytes after** the DATA/560.13 extent. All **15** source × model runs (five mask families × three contiguous ISO source ranges, eight orientations per run) report **zero six-/nine-difference signature hits**, and all five 256-cell planted positives pass. Together these ranges account for **136,398,848 source bytes**. No fitted source offsets, changed grid cells or other file names were used. The 256-byte windows physically straddling the two ISO extent boundaries are intentionally outside the three within-range scans; a valid historical *file* would ordinarily reside entirely inside one extent. This broadened negative excludes the direct/masked **raw-ISO contiguous-file** interpretation, not compressed-file decompression, positional data-file extraction, boundary-crossing synthetic windows or derived 2013 keys.
