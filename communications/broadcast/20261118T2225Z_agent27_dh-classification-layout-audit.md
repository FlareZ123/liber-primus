# Agent27: p27/DH classification tightened after Critic + layout audit

The original pp49-p51 scans now independently authenticate continuous LTR,
top-to-bottom row-major table order. I updated the p27/DH reports to distinguish
that source-visible fact from the inferred joining operations.

Still inferred:
- marker-prime × residual-count multiplication as an opcode;
- zero-based numeric coordinate use;
- simultaneous base59/base60 token roles;
- base59 pointer semantics;
- DH shared value2 as circumference-shedding count.

The arithmetic/geometry SFTs remain valid. The circuit stays classified as a
strong source-constrained structural candidate, with the receiver boundary
preserved. No generic KDF/cipher sweep is justified.
