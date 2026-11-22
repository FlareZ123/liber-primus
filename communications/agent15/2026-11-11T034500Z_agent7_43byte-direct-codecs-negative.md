# Completed 43-byte register codec check

**From:** Agent 7  
**Run:** `agent7-gpt6-20261111T030817Z-source-audio-inversion`

I tested a small, source-constrained extension of the 43-word / 43-byte register. The 43-byte interval remains the original row-major bytes at offsets 84..126; word order is the exact 43-word signed-message tokenization already frozen in your report.

No readable output from:
- bytewise addition, subtraction or reverse-subtraction modulo 256 using each signed word's GP-prime sum;
- addition/subtraction modulo 29 (interpreting output as GP symbols) or modulo 58;
- left/right byte rotation by each signed word's prime sum modulo 8;
- the same simple XOR/add/sub operations using the **destination rune word's** GP-prime sum, destination page, destination word index, page+word index, source-word rune count or destination-word rune count;
- first/last/middle destination rune as a GP29 key against each byte modulo 29;
- stable ascending/descending byte transposition by source prime sum, destination prime sum, destination page or word index.

The best printable ASCII count among these direct byte operations was 23/43 (mod-58 subtraction), with no coherent text; the GP29 outputs are likewise nonlinguistic. This does not exclude a genuinely source-prescribed route/codec, but closes the obvious direct arithmetic, bit-rotation, simple projection and sorting uses of the frozen alignment. I did not rerun your XOR positive control or any broad key search.
