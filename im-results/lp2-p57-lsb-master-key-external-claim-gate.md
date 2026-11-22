# External Page57 image-LSB master-index claim: original-image control and known-plaintext failure

**Classification: independently falsified published decoder/key claim; 12 November 2026, Agent1.** This report excludes one particular public 2025 derivation, without excluding other JPEG steganography or revealing LP2 plaintext.

## The concrete published claim

The repository [nexon33/cicada3301](https://github.com/nexon33/cicada3301) labels its [2025 “complete solution”](https://github.com/nexon33/cicada3301/blob/main/FINAL_COMPLETE_SOLUTION.md) and [extraction documentation](https://github.com/nexon33/cicada3301/blob/main/EXTRACTION_DOCUMENTATION.md) as a working master-index/key derivation. Its literal Python rule for **LP2 p57 / source JPEG 74.jpg** is:

1. Convert image to grayscale, take the bottom 60%.
2. Keep every pixel whose least significant bit is **zero**.
3. Take the union of the surviving pixels' local **Y and X coordinate values**.
4. Treat the resulting **1,543** unique coordinates as a source-encoded master index pool. Select 11 published “WELCOME indices” using a Fibonacci/Lucas rule, reduce modulo 29, and decrypt a historically solved Welcome page with the 11-element GP29 key, skipping eleven published positions.

The publication's own [verification report](https://github.com/nexon33/cicada3301/blob/main/VERIFICATION_REPORT.md) concedes **only eight of the eleven** selected indices exist in the Page57 image-extracted set and supplies the three remaining selected indices by post hoc sums, differences and a Fibonacci increment. Its companion documentation makes contradictory assertions about the frequency of index333 (32 versus 484).

## Source-exact reproduction with independent image controls

Use the unmodified original 2400×3600 LP2 JPEGs in \`resources/liber-primus/\` and the exact published single-bit extraction (no tuned threshold, ROI or coordinates). On all pages apply the same lower-60% mask, row-relative Y and column-relative X, and integer union. The target reproduction yields precisely its advertised **1,543** indices on p57 and **484** occurrences of coordinate333. This establishes that we implemented the actual external rule, including its accidental recovery of the published 1,543 cardinality.

| Original LP2 page | Genuine original scan | Coordinate-union size | Of 11 alleged Welcome indices present |
|---|---|---:|---:|
| **p57** (the advertised Cicada image) | 74.jpg | **1,543** | **8/11** |
| p15 (Fibonacci-prime square) | 32.jpg | 1,766 | **11/11** |
| p41 (ordinary encrypted page) | 58.jpg | 2,272 | **11/11** |
| p55 (unsolved terminal page) | 72.jpg | 2,304 | **11/11** |
| p0 (unsolved opening page) | 17.jpg | 2,077 | **11/11** |
| p56 (solved terminal page) | 73.jpg | 1,511 | 5/11 |

The comparator pages are untouched, genuine original material; they are not artificially constructed plants. The supposed “11 indices found” evidence is **more strongly satisfied by four unrelated real pages than by the nominated p57**, where three indices are absent. This is the predictable behavior of high-occupancy coordinate sets extracted from plentiful JPEG pixel values, not a selective master-key finding. The extraction itself is real; attributing the coordinate occupancy to an intentional master-key message is unsupported.

## Independently decisive first-rune contradiction

The external report commits to a particular **11-rune WELCOME key**, in printed index order:

\`[4,15,28,7,14,15,14,15,16,16,22]\`

and its first “skip” is at local rune **29**. The original LP1 physical Welcome starts with rune **ᚢ** (GP29 index **1**) and the authentic decrypted plaintext starts **WELCOME**, with leading **W** (GP index **7**). The external decoder's first operation is therefore fixed, without any skip or alignment ambiguity:

\[
P_0 = (C_0 - K_0)\bmod29 = (1-4)\bmod29 =26 = \mathrm{Y}.
\]

But the independently known first plaintext rune is **W**, not Y. The published key/skip decoder fails on the **very first original rune of the very known-plaintext page used to validate it**. No need to evaluate full-language scores or negotiate index selection. Calling the Fibonacci/Lucas index derivation a working historical key is unjustified.

## Reproduction and decision

- [Standalone Windows-compatible original-source reproducer](../sims/lp2_p57_lsb_external_claim_control_sft.py), uses NumPy and Pillow; optional ZIP input; 6 originals with pinned counts and original rune/GP conversion assertions.
- [Successful original-source CI run 43311940803](https://github.com/FlareZ123/liber-primus/actions/runs/43311940803).
- Inputs: \`resources/liber-primus/{17,32,58,72,73,74}.jpg\`, \`resources/transcriptions/liber_primus_master.txt\`, \`resources/liber-primus/lp2-corpus.json\`; published script and output citations above.

**Decision:** retire the **published coordinate-union/11-period-key selection** as a source-derived or known-LP1-valid decoder. It neither recovers original unknown LP2 plaintext nor selects an authentic key. This result does not rule out a different, genuinely encoded LSB payload using specific region, bit plane and reading order chosen by an independent clue.
