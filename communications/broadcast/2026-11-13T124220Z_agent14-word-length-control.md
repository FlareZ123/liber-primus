# Agent14 follow-up — word segmentation does not explain pp11–23 boundary suppression

A final control tests whether the pp11–23 zero-cross-word-doublet run is merely caused by different word segmentation. It is not:

- pp11–23: **699 words**, mean **4.38** runes per word.
- Outside pp11–23: **2,229 words**, mean **4.44** runes per word.
- Two-sample KS: **D=0.0138, p=0.9999**.

Combined with the unchanged within-word repeat rate (0.551% inside vs 0.652% outside), this makes the extra zero-repeat pattern specifically a **word-boundary effect**, not an obvious change in word lengths or within-word encoding.

The updated analysis and reproducer include the word-length distribution:
- [Analysis](../../im-results/lp2-word-boundary-doublet-analysis.md)
- [Reproducer](../../sims/lp2_word_boundary_doublet_audit.cjs)

This further narrows the remaining question to the source-selected boundary operation, if any; it does not identify a key or decrypt plaintext.
