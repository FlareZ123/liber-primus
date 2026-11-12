# The 87 book-continuous doublet spans: source-ordinal clue and a bounded byte-transport impossibility

**Agent 23, 12 November 2026. Classification:** independently noticed source-count correspondence and exact, all-secret negative result for one potentially useful binary-decoder family. **No LP2 unknown plaintext, key or destination has been recovered.** The reproducible source-only CommonJS test is [`sims/lp2_global87_chapter_byte_gate_sft.cjs`](../sims/lp2_global87_chapter_byte_gate_sft.cjs). The complete original-cipher and source-shaped planted-control regression **passed [manual CI run 43137505978](https://github.com/FlareZ123/liber-primus/actions/runs/43137505978)**.

## What a player might have been prompted to try

The printed unknown LP2 pages p0–p55 contain **12,956 GP29 ciphertext runes**. Across the manuscript **as one continuous rune stream**, precisely **86** occurrences of a rune equal to its immediately previous rune divide the full text into **87 nonempty runs of strictly unequal consecutive runes**. Treat the initial rune as a transport IV, and each repeated occurrence as a nonconsuming delimiter; the resulting 87 packets contain **12,869** transitions, with lengths from 5 to 711. This book-continuous framing deliberately differs from the previously tested physical-page reset, which creates 141 page-scoped packets.

The solved red heading `PARABLE` on physical p57 has GP-prime sum **449**; 449 is the **87th prime**. This could be an intentionally visible relation between the terminal instruction and the 87 derived packets. It is **post hoc** and has no authenticated instruction to use repeated runes as separators, to convert 449 to its prime ordinal, or to interpret the spans as bytes. A source-native numerical coincidence cannot by itself authenticate a cryptographic key. The fact that 87 spans can be obtained by extending the known 86-event count is insufficient evidence of a solve route.

## Exactly what was tested

For an (L)-transition packet, use the 28 choices other than the preceding printed rune as digits `0..27`, with a secretly ordered full **29-symbol GP29 alphabet**, optionally reset to an independently unknown order at each of the **nine original red-heading chapters**. The original chapter-end global rune offsets are

`[729,1874,3603,5506,6527,7960,9640,12648,12956]`.

A packet is an unsigned integer containing the **maximum possible integral number of bytes** (m=lfloorlog_{256}(28^L)floor). The model accepts both big- and little-endian digit significance. For every packet the maximal allowed most-significant digit is an **exact integer**

[
B_L=leftlfloorrac{256^m-1}{28^{L-1}}ightfloor.
]

If (B_L=0), its most-significant digit must have rank zero. A single unknown 29-rune order can produce rank-zero successors from **at most two distinct rune identities**: the first alphabet symbol for all other predecessors, and the second alphabet symbol when the predecessor itself is the first. This holds for every possible secret alphabet and for either orientation.

**In the original 87 packets, 36 leaders in each digit direction are forced to rank zero.** Grouping them by the source-visible chapters gives the exact counts of *distinct required successor runes*:

| Original chapter (physical pages) | Forward digit order | Reversed digit order |
| --- | ---: | ---: |
| p0–2 | 3 | 2 |
| p3–7 | 5 | 4 |
| p8–14 | 4 | 5 |
| p15–22 | 1 | 1 |
| **p23–26** | **7** | **6** |
| p27–32 | 6 | 6 |
| p33–39 | 3 | 3 |
| p40–53 | 4 | 5 |
| p54–55 | 1 | 1 |

Chapter p23–26 by itself excludes **both** directions under every possible one-alphabet-per-chapter key:

- **Forward, stronger same-predecessor contradiction:** segment 34 starts with `S→R` at global rune offset **5837** (p24 local118), while segment 39 starts with `S→EA` at offset **6324** (p26 local62). Both packet lengths, 133 and 41, force the first digit to zero. A one-to-one predecessor-dependent successor row cannot give two distinct glyphs the same rank, even if all 29 predecessor rows in that chapter have separate unknown permutations.
- **Reverse, three-successor certificate:** the last digits of segment 30, 31, and 32 require zero for `X→G` at **5770** (p24 local51), `TH→IA` at **5777** (p24 local58) and `M→O` at **5824** (p24 local105). The three distinct required successor glyphs violate the two-glyph limit of *every* shared unknown rune order. Reverse direction is **not** excluded if each predecessor in each chapter has its own completely secret successor permutation; there are no rank-zero same-predecessor contradictions for that larger family.

Thus the **complete book-continuous 87-packet, maximal-width binary encoding with any one secret GP29 order per original visual chapter is impossible on untouched ciphertext**, independent of a language model, password or cipher-key guesses. This does not exclude an encryption state that changes within a chapter, independently keyed predecessor-specific permutations, different packet boundaries, packets that preserve extra non-byte residual bits, alternate widths or a nonbinary register.

## Concrete natural-alphabet inverse and positive control

Both canonical source-first orders were tested without fitting any hidden key: (1) ascending GP29 index order with the previous symbol removed; (2) cyclic GP29 difference order, subtracting one from the nonzero modular difference. For each, original digits and reversed digits were converted to exactly (m) bytes per packet. **65 / 63 / 64 / 65 of the 87 original packets, respectively, overflow the exact maximal-byte capacity.** These are deterministic mathematical failures, regardless of whether the resulting bytes could otherwise contain readable text. The total maximum byte payload is **7,694 bytes**.

To verify the decoder is attainable on a genuine output from its proposed forward model, the standalone test plants **7,694 ASCII `A` bytes**, creates nine independent deterministic secret rune orders, and emits exactly **12,956 runes** with the **86 original doublet sites at their identical global offsets**. It then recovers all **7,694/7,694** original bytes and every packet digit, matching the source's nine chapter clocks. This positive demonstrates a reversible coded stream, while the original-cipher contradiction remains exact for the tested shared-order model.

## Research decision

**Retire** an 87-packet maximal-byte GP28 transport with any per-chapter *single secret 29-rune alphabet* in both digit directions. Its global shared-alphabet subcase is also excluded. The postselected **449→87** ordinal correspondence can remain a low-confidence reading clue; it offers no key. A productive successor would require an independently source-selected **different cipher state within a chapter, lossless residual-bit convention, or a concrete consumer of the 87 lengths**, with a frozen original-text prediction. Do not generate free-key scans or assume this segmentation is intended from the numerical equality alone.
