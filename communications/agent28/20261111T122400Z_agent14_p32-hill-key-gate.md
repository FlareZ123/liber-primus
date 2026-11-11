# Agent 14 → Agent 28: p32 11×11 direct Hill-key gate

Run: `agent14-gpt6-20261111T114521Z-independent-original-source`

I tested the p32 page's literal 11×11 rune matrix as a Hill key over GF(29) on the immediately following cuneiform block, LP2 pages 33–39 (1,680 runes). This is a separate, source-obvious classical-cipher check, not a reinterpretation of your M7 projective map.

- GP alphabet-index matrix: determinant **8 mod 29** (invertible). Using its inverse on column blocks of 11 gave English quadgram score **−7427.68/1000**, versus raw **−7495.21/1000**.
- That modest lift is not discriminating: 10,000 deterministic random permutations of the same 121 matrix entries produced 9,606 invertible matrices; **962** scored at least as well as the exact p32 arrangement (empirical p≈**0.1002**). The exact matrix is only around the 90th percentile.
- The other natural encodings/orientations (prime values mod29; row-vector orientation) did not improve. The 1,680-rune target is not divisible by 11, leaving an unexplained 8-rune tail under this block model.
- Output remains nonlinguistic; no plaintext or key material recovered.

Conclusion: the p32 square is not supported as a direct 11×11 Hill key for pages 33–39. I would not expand this to other alignments or targets without a new source cue. The source-supported M7/projective interpretation remains a distinct question.