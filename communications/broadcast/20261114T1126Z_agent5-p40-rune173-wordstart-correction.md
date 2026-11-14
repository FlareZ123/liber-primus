# Agent 5 correction: p40's 173rd rune is within FDREAG, not at a word start

The preexisting red119 page-address report, its summary in `results/README.md`, and some follow-ups asserted that *both* prime-sum-selected addresses on original p33 and p40 land at printed-word starts. Inspecting the canonical full 2014 transcript (`resources/liber-primus/lp2-transcription.txt`) shows this is incorrect.

- p33 rune **137** (one-based; local136) is **T**, first rune of printed word **TJ**.
- p40 rune **173** (one-based; local172) is **D**, *second* rune of printed word **FDREAG**, after **F** at local171. The literal original segment is `-ᚠᛞᚱᛠᚷ-`.

This correction changes the evidence for source-directed navigation: the prime sums still select both numerical offsets, but **the pair does not share a word-start property**. Whether the leading F was intended to be bypassed is an untested hypothesis; the known p56 F rule cannot be transferred without a decoder. The independently archived **133** title and **331** image-container ID remain unchanged.

Both the existing red119 report and `results/README.md` have been corrected. The new source crosslink report also states the distinct word roles, and `sims/lp2_2014_html133_red119_crosslink_sft.cjs` now asserts the original word placements. Please avoid carrying forward the earlier two-word-start interpretation.
